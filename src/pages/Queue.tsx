import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Activity, Clock, CheckCircle2, FileCheck, Eye, AlertCircle, Search, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { useTranslation } from "../lib/i18n";
import { ScreeningData } from "../types";

type SortOption = "date_desc" | "date_asc" | "urgency";

export default function Queue() {
  const { t } = useTranslation();
  const [screenings, setScreenings] = useState<ScreeningData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("urgency");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ status: "assigned", limit: "200" });
      const normalizedSearch = searchTerm.trim();
      if (normalizedSearch) {
        params.set("search", normalizedSearch);
      }

      setLoading(true);
      fetch(`/api/screenings?${params.toString()}`, { signal: controller.signal })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`Failed to load cases (${res.status})`);
          }
          return res.json();
        })
        .then((data) => {
          setScreenings(data);
          setError(null);
        })
        .catch((err: unknown) => {
          if (err instanceof Error && err.name === "AbortError") return;
          setError(err instanceof Error ? err.message : "Unknown error");
        })
        .finally(() => setLoading(false));
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm]);

  const filteredAndSortedScreenings = useMemo(() => {
    let result = [...screenings];

    // Sort
    result.sort((a, b) => {
      if (sortBy === "urgency") {
        if (a.urgency_flag !== b.urgency_flag) {
          return b.urgency_flag - a.urgency_flag; // Urgent first
        }
        // Fallback to date
        return new Date(a.screening_date).getTime() - new Date(b.screening_date).getTime(); // Oldest first
      } else if (sortBy === "date_asc") {
        return new Date(a.screening_date).getTime() - new Date(b.screening_date).getTime();
      } else {
        return new Date(b.screening_date).getTime() - new Date(a.screening_date).getTime();
      }
    });

    return result;
  }, [screenings, sortBy]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1200px] mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-medical-text tracking-tight font-display">
            {t('queue.title')}
          </h1>
          <p className="text-medical-text-muted mt-2 text-base font-medium">
            {t('queue.subtitle')}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-medical-text-muted" size={18} />
            <input
              type="text"
              placeholder="Search patient or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-11 pr-4 py-3 bg-medical-surface border border-medical-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all text-medical-text placeholder:text-medical-text-muted/50"
            />
          </div>
          <div className="relative">
            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 text-medical-text-muted" size={18} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full sm:w-auto appearance-none pl-11 pr-10 py-3 bg-medical-surface border border-medical-border rounded-xl text-sm font-medium text-medical-text focus:outline-none focus:ring-2 focus:ring-medical-primary/20 focus:border-medical-primary transition-all cursor-pointer"
            >
              <option value="urgency">Priority (Urgent First)</option>
              <option value="date_asc">Oldest First</option>
              <option value="date_desc">Newest First</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-20 text-center text-medical-text-muted bg-medical-surface rounded-3xl border border-medical-border">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-8 h-8 border-4 border-medical-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs uppercase tracking-[0.2em] font-bold">
                Loading Queue...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-medical-error bg-medical-error/[0.04] rounded-3xl border border-medical-error/30">
            <p className="font-semibold">Failed to load queue.</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        ) : filteredAndSortedScreenings.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-medical-surface rounded-3xl border border-medical-border p-20 text-center shadow-sm"
          >
            <div className="w-24 h-24 bg-medical-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-medical-success" />
            </div>
            <h3 className="text-2xl font-bold text-medical-text font-display mb-2">All Caught Up!</h3>
            <p className="text-medical-text-muted font-medium">
              {searchTerm ? "No cases match your search criteria." : "There are no cases assigned to you at the moment."}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredAndSortedScreenings.map((s, i) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                key={s.id}
                className={clsx(
                  "bg-medical-surface rounded-2xl border p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-all group relative overflow-hidden",
                  s.urgency_flag === 1 ? "border-medical-error/30 bg-medical-error/[0.02]" : "border-medical-border"
                )}
              >
                {s.urgency_flag === 1 && (
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-medical-error"></div>
                )}
                
                <div className="flex items-start sm:items-center gap-6 pl-2">
                  <div className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300",
                    s.urgency_flag === 1 ? "bg-medical-error/10 text-medical-error" : "bg-medical-primary/10 text-medical-primary"
                  )}>
                    {s.urgency_flag === 1 ? <AlertCircle size={24} /> : <Eye size={24} />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-1.5">
                      <h3 className="text-xl font-bold text-medical-text font-display">
                        {s.patient_name}
                      </h3>
                      <span className="font-mono text-xs font-bold text-medical-text-muted uppercase tracking-widest bg-medical-bg px-2 py-1 rounded-md border border-medical-border">
                        {s.examinee_number}
                      </span>
                      {s.urgency_flag === 1 && (
                        <span className="px-2.5 py-1 bg-medical-error text-white rounded-md text-[10px] font-bold uppercase tracking-widest shadow-sm shadow-medical-error/20 flex items-center gap-1">
                          <AlertCircle size={10} /> {t('status.urgent')}
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-medium text-medical-text-muted flex items-center gap-3">
                      <span className="flex items-center gap-1.5"><Activity size={14} /> {s.organization_name}</span>
                      <span className="w-1 h-1 rounded-full bg-medical-border"></span>
                      <span className="flex items-center gap-1.5"><Clock size={14} /> {s.screening_date}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-medical-border pt-4 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <div className="text-[10px] font-bold text-medical-text-muted uppercase tracking-[0.2em] mb-1.5">
                      {t('table.status')}
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-medical-primary/10 text-medical-primary border border-medical-primary/20">
                      <Activity size={14} /> {t('status.in_reading')}
                    </span>
                  </div>
                  <Link
                    to={`/viewer/${s.id}`}
                    className={clsx(
                      "px-8 py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5 flex items-center gap-2",
                      s.urgency_flag === 1 
                        ? "bg-medical-error hover:bg-medical-error/90 text-white shadow-medical-error/20" 
                        : "bg-medical-primary hover:bg-medical-primary/90 text-white shadow-medical-primary/20"
                    )}
                  >
                    {t('action.open_viewer')}
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
