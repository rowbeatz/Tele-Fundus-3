import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Clock, CheckCircle2, FileCheck, Eye } from "lucide-react";
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
}

export default function Queue() {
  const { t } = useTranslation();
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/screenings")
      .then((res) => res.json())
      .then((data) => {
        // Filter only assigned or reading_completed for the queue
        const queue = data.filter(
          (s: Screening) =>
            s.status === "assigned" || s.status === "reading_completed",
        );
        setScreenings(queue);
        setLoading(false);
      });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1200px] mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-[#141414] tracking-tight font-sans">
          {t('queue.title')}
        </h1>
        <p className="text-[#141414]/60 mt-1 text-sm">
          {t('queue.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="p-12 text-center text-[#141414]/40">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs uppercase tracking-widest font-mono">
                Loading Queue...
              </span>
            </div>
          </div>
        ) : screenings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#141414]/10 p-12 text-center shadow-sm">
            <CheckCircle2
              size={48}
              className="mx-auto text-emerald-500 mb-4 opacity-50"
            />
            <h3 className="text-lg font-bold text-[#141414]">All Caught Up!</h3>
            <p className="text-sm text-[#141414]/50 mt-1">
              There are no cases assigned to you at the moment.
            </p>
          </div>
        ) : (
          screenings.map((s, i) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              key={s.id}
              className="bg-white rounded-2xl border border-[#141414]/10 p-6 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Eye size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-[#141414]">
                      {s.patient_name}
                    </h3>
                    <span className="font-mono text-xs text-[#141414]/40 uppercase tracking-widest">
                      {s.examinee_number}
                    </span>
                    {s.urgency_flag === 1 && (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-600 border border-red-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
                        {t('status.urgent')}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[#141414]/60 flex items-center gap-4">
                    <span>{s.organization_name}</span>
                    <span className="w-1 h-1 rounded-full bg-[#141414]/20"></span>
                    <span>Date: {s.screening_date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs font-semibold text-[#141414]/40 uppercase tracking-wider mb-1">
                    {t('table.status')}
                  </div>
                  {s.status === "assigned" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                      <Activity size={12} /> {t('status.in_reading')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                      <FileCheck size={12} /> {t('status.qc_review')}
                    </span>
                  )}
                </div>
                <Link
                  to={`/viewer/${s.id}`}
                  className="bg-[#141414] hover:bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
                >
                  {t('action.open_viewer')}
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
