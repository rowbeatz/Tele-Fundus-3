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
import AssignmentBoard from "../components/AssignmentBoard";
import { ScreeningData, Physician } from "../types";

interface Stats {
  total: number;
  unassigned: number;
  reading: number;
  qc: number;
  completed: number;
  urgent: number;
  physicians: number;
}

export default function Dashboard() {
  const { t } = useTranslation();
  const [screenings, setScreenings] = useState<ScreeningData[]>([]);
  const [physicians, setPhysicians] = useState<Physician[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingScreening, setEditingScreening] = useState<any>(null);

  const openEditModal = (screening: any) => {
    setEditingScreening(screening);
    setShowEditModal(true);
  };
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "all" | "unassigned" | "reading" | "qc" | "completed"
  >("all");

  const [role, setRole] = useState<"admin" | "physician">("admin");

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

  const PipelineVisualizer = ({ status }: { status: string }) => {
    const stages = [
      { id: "registered", label: "Registered", match: ["submitted", "registered"] },
      { id: "assigned", label: "Assigned", match: ["assigned"] },
      { id: "reading_completed", label: "Read", match: ["reading_completed"] },
      { id: "completed", label: "Done", match: ["completed", "confirmed"] },
    ];

    let currentStageIndex = -1;
    for (let i = 0; i < stages.length; i++) {
      if (stages[i].match.includes(status)) {
        currentStageIndex = i;
        break;
      }
    }

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          {stages.map((stage, index) => {
            const isCompleted = index <= currentStageIndex;
            const isCurrent = index === currentStageIndex;
            return (
              <div key={stage.id} className="flex items-center">
                <div
                  className={clsx(
                    "w-2 h-2 rounded-full",
                    isCurrent ? "bg-medical-primary ring-2 ring-medical-primary/30" : isCompleted ? "bg-medical-primary" : "bg-medical-border"
                  )}
                  title={stage.label}
                />
                {index < stages.length - 1 && (
                  <div
                    className={clsx(
                      "w-3 h-0.5",
                      isCompleted && !isCurrent ? "bg-medical-primary" : "bg-medical-border"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
        <span className="text-[10px] font-bold text-medical-text-muted uppercase tracking-wider">
          {currentStageIndex >= 0 ? stages[currentStageIndex].label : status}
        </span>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    return <PipelineVisualizer status={status} />;
  };

  const filteredScreenings = screenings.filter((s) => {
    if (role === "physician") {
      if (s.status === "submitted" || s.status === "registered") return false;
    }
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
    { id: "assignment", label: "Assignment Board" },
    { id: "reading", label: "In Reading" },
    { id: "qc", label: "QC Review" },
    { id: "completed", label: "Completed" },
  ] as const;

  const statCards = [
    {
      icon: Eye,
      value: stats?.total || 0,
      label: "Total Screenings",
      colorClass: "text-medical-primary",
      bgClass: "bg-medical-primary/10",
    },
    {
      icon: Clock,
      value: stats?.unassigned || 0,
      label: "Unassigned",
      colorClass: "text-medical-text-muted",
      bgClass: "bg-medical-surface",
    },
    {
      icon: Activity,
      value: stats?.reading || 0,
      label: "In Reading",
      colorClass: "text-medical-primary",
      bgClass: "bg-medical-primary/10",
    },
    {
      icon: FileCheck,
      value: stats?.qc || 0,
      label: "QC Review",
      colorClass: "text-medical-warning",
      bgClass: "bg-medical-warning/10",
    },
    {
      icon: CheckCircle2,
      value: stats?.completed || 0,
      label: "Completed",
      colorClass: "text-medical-success",
      bgClass: "bg-medical-success/10",
    },
    {
      icon: AlertCircle,
      value: stats?.urgent || 0,
      label: "Urgent",
      colorClass: "text-medical-error",
      bgClass: "bg-medical-error/10",
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
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-medical-surface border border-medical-border rounded-xl p-1">
            <button
              onClick={() => setRole("admin")}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                role === "admin" ? "bg-medical-primary text-white shadow-md" : "text-medical-text-muted hover:text-medical-text"
              )}
            >
              Admin View
            </button>
            <button
              onClick={() => setRole("physician")}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                role === "physician" ? "bg-medical-primary text-white shadow-md" : "text-medical-text-muted hover:text-medical-text"
              )}
            >
              Physician View
            </button>
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
                className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300", s.bgClass)}
              >
                <Icon className={s.colorClass} size={28} strokeWidth={2.5} />
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
        <div className="border-b border-medical-border px-10 flex gap-10 bg-medical-surface/50 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "py-6 text-xs font-bold uppercase tracking-[0.2em] border-b-4 transition-all duration-300 relative whitespace-nowrap",
                activeTab === tab.id
                  ? "border-medical-primary text-medical-primary"
                  : "border-transparent text-medical-text-muted hover:text-medical-text",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "assignment" ? (
          <div className="p-10">
            <AssignmentBoard screenings={screenings} physicians={physicians} onAssign={handleAssign} />
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-medical-border flex gap-4 bg-medical-surface/50 backdrop-blur-sm">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-medical-text-muted"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search by ID or name..."
                  className="w-full pl-12 pr-6 py-3.5 bg-medical-bg border border-medical-border rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all font-medium text-medical-text placeholder:text-medical-text-muted"
                />
              </div>
              <button className="flex items-center gap-2 px-6 py-3.5 bg-medical-surface border border-medical-border rounded-2xl text-sm font-bold text-medical-text-muted hover:bg-medical-bg hover:text-medical-text transition-all">
                <Filter size={18} />
                Filter
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-medical-surface/50 text-medical-text-muted font-bold text-[10px] uppercase tracking-[0.2em] border-b border-medical-border">
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
                        className="hover:bg-medical-surface transition-colors group"
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
                        <td className="px-6 py-6">
                          <button
                            onClick={() => openEditModal(s)}
                            className="text-left w-full"
                          >
                            {getStatusBadge(s.status)}
                          </button>
                        </td>
                        <td className="px-6 py-6">
                          {s.urgency_flag === 1 && (
                            <span className="inline-flex items-center gap-1.5 text-medical-error font-bold text-[10px] uppercase tracking-wider bg-medical-error/10 px-3 py-1.5 rounded-xl border border-medical-error/20">
                              <AlertCircle size={14} /> {t('status.urgent')}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-6">
                          <button
                            onClick={() => openEditModal(s)}
                            className="text-medical-text font-bold text-xs hover:text-medical-primary transition-colors"
                          >
                            {s.physician_name || t('action.assign')}
                          </button>
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
          </>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingScreening && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-medical-surface rounded-[2.5rem] border border-medical-border shadow-2xl p-8 w-full max-w-md space-y-6">
            <h3 className="text-lg font-bold text-medical-text">編集: {editingScreening.patient_name}</h3>
            
            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-medical-text-muted uppercase tracking-widest">ステータス</label>
              <select
                className="w-full bg-medical-bg border border-medical-border rounded-xl p-3 text-xs font-bold text-medical-text"
                value={editingScreening.status}
                onChange={(e) => setEditingScreening({ ...editingScreening, status: e.target.value })}
              >
                <option value="registered">Registered</option>
                <option value="submitted">Submitted</option>
                <option value="assigned">Assigned</option>
                <option value="reading_completed">Reading Completed</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-medical-text-muted uppercase tracking-widest">至急フラグ</label>
              <button
                onClick={() => setEditingScreening({ ...editingScreening, urgency_flag: editingScreening.urgency_flag === 1 ? 0 : 1 })}
                className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest ${editingScreening.urgency_flag === 1 ? 'bg-medical-error text-white' : 'bg-medical-bg text-medical-text-muted'}`}
              >
                {editingScreening.urgency_flag === 1 ? '至急' : '通常'}
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-bold text-medical-text-muted uppercase tracking-widest">担当医</label>
              <select
                className="w-full bg-medical-bg border border-medical-border rounded-xl p-3 text-xs font-bold text-medical-text"
                value={editingScreening.physician_id || ""}
                onChange={(e) => setEditingScreening({ ...editingScreening, physician_id: e.target.value })}
              >
                <option value="">アサインなし</option>
                {physicians.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.rank})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-4 bg-medical-bg hover:bg-medical-surface text-medical-text-muted rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                キャンセル
              </button>
              <button
                onClick={async () => {
                  const response = await fetch(`/api/screenings/${editingScreening.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      status: editingScreening.status,
                      urgency_flag: editingScreening.urgency_flag,
                      physician_id: editingScreening.physician_id === "" ? null : editingScreening.physician_id,
                    }),
                  });
                  if (!response.ok) {
                    console.error("Failed to update screening");
                    alert("更新に失敗しました。");
                    return;
                  }
                  fetchData();
                  setShowEditModal(false);
                }}
                className="flex-[2] py-4 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-medical-primary/20"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
