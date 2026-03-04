import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  UserPlus,
  FileCheck,
  Activity,
  Users,
  Eye,
  FilePlus,
} from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useTranslation } from "../lib/i18n";

interface Screening {
  id: string;
  examinee_number: string;
  patient_name: string;
  organization_name: string;
  screening_date: string;
  status: string;
  urgency_flag: number;
  physician_id?: string | null;
  physician_name?: string | null;
}

interface Physician {
  id: string;
  name: string;
  rank: string;
}

interface Stats {
  total: number;
  pending: number;
  completed: number;
  physicians: number;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [physicians, setPhysicians] = useState<Physician[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "all" | "unassigned" | "reading" | "qc" | "completed"
  >("all");

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/screenings").then((res) => res.json()),
      fetch("/api/physicians").then((res) => res.json()),
      fetch("/api/stats").then((res) => res.json()),
    ]).then(([screeningsData, physiciansData, statsData]) => {
      setScreenings(screeningsData);
      setPhysicians(physiciansData);
      setStats(statsData);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (screeningId: string, physicianId: string) => {
    if (!physicianId) return;
    try {
      await fetch(`/api/screenings/${screeningId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ physician_id: physicianId, status: "assigned" }),
      });
      fetchData(); // Refresh
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
      case "registered":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-slate-200 text-slate-700 border border-slate-300">
            <Clock size={12} /> {t('status.pending')}
          </span>
        );
      case "assigned":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
            <Activity size={12} /> {t('status.in_reading')}
          </span>
        );
      case "reading_completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
            <FileCheck size={12} /> {t('status.qc_review')}
          </span>
        );
      case "completed":
      case "confirmed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> {t('status.completed')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-slate-200 text-slate-700 border border-slate-300">
            {status}
          </span>
        );
    }
  };

  const filteredScreenings = screenings.filter((s) => {
    if (activeTab === "all") return true;
    if (activeTab === "unassigned")
      return s.status === "submitted" || s.status === "registered";
    if (activeTab === "reading") return s.status === "assigned";
    if (activeTab === "qc") return s.status === "reading_completed";
    if (activeTab === "completed")
      return s.status === "completed" || s.status === "confirmed";
    return true;
  });

  const tabs = [
    { id: "all", label: "All Cases" },
    { id: "unassigned", label: "Unassigned" },
    { id: "reading", label: "In Reading" },
    { id: "qc", label: "QC Review" },
    { id: "completed", label: "Completed" },
  ] as const;

  const statCards = [
    {
      icon: Eye,
      value: stats?.total || 0,
      label: "Total Screenings",
      color: "#0d9488",
      bg: "#ccfbf1",
    },
    {
      icon: Activity,
      value: stats?.pending || 0,
      label: "Pending Action",
      color: "#f59e0b",
      bg: "#fef3c7",
    },
    {
      icon: CheckCircle2,
      value: stats?.completed || 0,
      label: "Completed",
      color: "#10b981",
      bg: "#d1fae5",
    },
    {
      icon: Users,
      value: stats?.physicians || 0,
      label: "Active Physicians",
      color: "#3b82f6",
      bg: "#dbeafe",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto space-y-8"
    >
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold text-medical-text tracking-tight font-display">
            {t('dashboard.title')}
          </h1>
          <p className="text-medical-text-muted mt-2 text-base font-medium">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <Link
          to="/register"
          className="bg-medical-primary hover:bg-medical-primary/90 text-white px-8 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-medical-primary/20 hover:-translate-y-0.5 flex items-center gap-3"
        >
          <div className="bg-white/20 p-1.5 rounded-lg">
            <FilePlus size={18} />
          </div>
          {t('dashboard.new_screening')}
        </Link>
      </div>

      {/* Stats Grid - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i}
              className="bg-medical-surface rounded-[2rem] p-8 border border-medical-border medical-shadow hover:medical-shadow-lg transition-all duration-300 group"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300"
                style={{ backgroundColor: s.bg }}
              >
                <Icon style={{ color: s.color }} size={28} strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-4xl font-bold text-medical-text tracking-tight font-display">
                  {loading ? "-" : s.value}
                </div>
                <div className="text-xs font-bold text-medical-text-muted uppercase tracking-[0.15em] mt-2">
                  {s.label}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-medical-surface rounded-[2.5rem] border border-medical-border medical-shadow-lg overflow-hidden flex flex-col">
        {/* Tabs */}
        <div className="border-b border-medical-border px-10 flex gap-10 bg-slate-50/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "py-6 text-xs font-bold uppercase tracking-[0.2em] border-b-4 transition-all duration-300 relative",
                activeTab === tab.id
                  ? "border-medical-primary text-medical-primary"
                  : "border-transparent text-medical-text-muted hover:text-medical-text",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 border-b border-medical-border flex gap-4 bg-white/50 backdrop-blur-sm">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-medical-text-muted"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by ID or name..."
              className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-medical-border rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all font-medium"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3.5 bg-white border border-medical-border rounded-2xl text-sm font-bold text-medical-text-muted hover:bg-slate-50 hover:text-medical-text transition-all">
            <Filter size={18} />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-medical-text-muted font-bold text-[10px] uppercase tracking-[0.2em] border-b border-medical-border">
              <tr>
                <th className="px-10 py-6">{t('table.patient_id')}</th>
                <th className="px-6 py-6">{t('table.name')}</th>
                <th className="px-6 py-6">{t('table.organization')}</th>
                <th className="px-6 py-6">{t('table.date')}</th>
                <th className="px-6 py-6">{t('table.status')}</th>
                <th className="px-6 py-6">{t('table.urgency')}</th>
                <th className="px-6 py-6">{t('table.assigned_to')}</th>
                <th className="px-10 py-6 text-right">{t('table.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-medical-border">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-10 py-20 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-10 h-10 border-4 border-medical-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-medical-text-muted">
                        Syncing Records...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredScreenings.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-10 py-20 text-center text-medical-text-muted font-bold text-[10px] uppercase tracking-[0.2em]"
                  >
                    No clinical records found
                  </td>
                </tr>
              ) : (
                filteredScreenings.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-medical-primary/[0.02] transition-colors group"
                  >
                    <td className="px-10 py-6 font-mono text-xs font-bold text-medical-text-muted">
                      {s.examinee_number}
                    </td>
                    <td className="px-6 py-6 font-bold text-medical-text">
                      {s.patient_name}
                    </td>
                    <td className="px-6 py-6 text-medical-text-muted font-semibold text-xs">
                      {s.organization_name}
                    </td>
                    <td className="px-6 py-6 text-medical-text-muted font-mono text-xs">
                      {s.screening_date}
                    </td>
                    <td className="px-6 py-6">{getStatusBadge(s.status)}</td>
                    <td className="px-6 py-6">
                      {s.urgency_flag === 1 && (
                        <span className="inline-flex items-center gap-1.5 text-red-600 font-bold text-[10px] uppercase tracking-wider bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                          <AlertCircle size={14} /> {t('status.urgent')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-6">
                      {s.status === "submitted" || s.status === "registered" ? (
                        <div className="flex items-center gap-3">
                          <select
                            className="bg-slate-50 border border-medical-border rounded-xl text-[10px] font-bold uppercase tracking-wider py-2 px-3 focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary text-medical-text/80"
                            onChange={(e) => handleAssign(s.id, e.target.value)}
                            defaultValue=""
                          >
                            <option value="" disabled>
                              {t('action.assign')}
                            </option>
                            {physicians.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.rank})
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-medical-text font-bold text-xs">
                          {s.physician_name || "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-10 py-6 text-right">
                      {s.status === "reading_completed" ? (
                        <Link
                          to={`/viewer/${s.id}`}
                          className="inline-flex items-center justify-center px-6 py-2.5 bg-amber-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-amber-600 transition-all shadow-md shadow-amber-500/20"
                        >
                          {t('action.qc_review')}
                        </Link>
                      ) : (
                        <Link
                          to={`/viewer/${s.id}`}
                          className="inline-flex items-center justify-center px-6 py-2.5 bg-medical-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-medical-primary/90 transition-all opacity-0 group-hover:opacity-100 shadow-md shadow-medical-primary/20"
                        >
                          {t('action.open_viewer')}
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
