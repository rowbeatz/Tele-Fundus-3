import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ZoomIn,
  ZoomOut,
  Move,
  Sun,
  Contrast,
  RotateCw,
  Columns,
  Save,
  X,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Activity,
  Heart,
  Droplets,
  ChevronLeft,
  Settings,
  Info,
  Maximize,
  FileText,
  CheckCircle,
  Type,
  Ruler,
  Layers,
  BarChart3,
  Download,
  PenTool,
  MousePointer2,
  Video,
  VideoOff,
  User,
  Building2,
  Stethoscope,
  History as HistoryIcon,
  AlertCircle,
  Moon,
} from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useTranslation } from "../lib/i18n";
import { useTheme } from "../lib/ThemeContext";

interface ScreeningData {
  id: string;
  examinee_number: string;
  patient_name: string;
  gender: string;
  birth_date: string;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  has_diabetes?: number;
  has_hypertension?: number;
  organization_name: string;
  screening_date: string;
  status: string;
  urgency_flag: number;
  chief_complaint: string;
  judgment_code?: string;
  findings_right?: string;
  findings_left?: string;
  recommend_referral?: number;
  recommend_retest?: number;
  physician_comment?: string;
  hospital_name?: string;
  attending_physician?: string;
  patient_history?: string;
  images: { id: string; eye_side: string; url: string; type?: 'fundus' | 'oct' }[];
  device_info?: {
    manufacturer: string;
    model: string;
    type: 'fundus' | 'oct' | 'multi';
  };
  messages: {
    id: string;
    sender: string;
    content: string;
    created_at: string;
  }[];
  reviews?: {
    id: string;
    reviewer_id: string;
    checklist_json: string;
    review_comment: string;
    result: string;
    reviewed_at: string;
  }[];
}

export default function Viewer() {
  const { t, language, setLanguage } = useTranslation();
  const { textSize, setTextSize, colorMode, setColorMode } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<ScreeningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeEye, setActiveEye] = useState<"right" | "left" | "comparison">("right");
  const [activeReportTab, setActiveReportTab] = useState<"right" | "left">("right");
  const [viewMode, setViewMode] = useState<"fundus" | "oct" | "multi">("fundus");
  const [octSlice, setOctSlice] = useState(0);
  const [measureMode, setMeasureMode] = useState<"none" | "dist" | "area">("none");
  const [showAiOverlay, setShowAiOverlay] = useState(false);
  const [aiRiskScore, setAiRiskScore] = useState(0.15);
  const [showChat, setShowChat] = useState(false);
  const [isConferenceMode, setIsConferenceMode] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'Operator A', content: 'Patient mentioned slight blurriness in the right eye.', time: '10:05' },
    { id: '2', sender: 'Dr. Smith', content: 'Understood. I will check the macula area carefully.', time: '10:08' },
  ]);

  // Sync activeEye and activeReportTab
  const handleEyeChange = (eye: "right" | "left" | "comparison") => {
    setActiveEye(eye);
    if (eye === "right" || eye === "left") {
      setActiveReportTab(eye);
    }
  };

  const handleReportTabChange = (tab: "right" | "left") => {
    setActiveReportTab(tab);
    if (activeEye !== "comparison") {
      setActiveEye(tab);
    }
  };

  // Canvas State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Report State
  const [report, setReport] = useState({
    judgment_code: "",
    findings_right: "",
    findings_left: "",
    recommend_referral: false,
    recommend_retest: false,
    physician_comment: "",
    // Structured data
    right_checklist: [] as string[],
    right_severity: "",
    right_judgment: "",
    left_checklist: [] as string[],
    left_severity: "",
    left_judgment: "",
    icd10_code: "",
    digital_signature: "",
  });

  // QC State
  const [newMessage, setNewMessage] = useState("");
  const [qcFeedback, setQcFeedback] = useState("");
  const [showQcModal, setShowQcModal] = useState(false);
  const [qcChecklist, setQcChecklist] = useState({
    od_os_match: false,
    required_fields: false,
    judgment_match: false,
    format_compliance: false,
  });

  useEffect(() => {
    fetch(`/api/screenings/${id}`)
      .then((res) => res.json())
      .then((res) => {
        setData(res);

        let rightData = { checklist: [], severity: "", judgment: "", comment: res.findings_right || "" };
        let leftData = { checklist: [], severity: "", judgment: "", comment: res.findings_left || "" };

        try {
          if (res.findings_right && res.findings_right.startsWith("{")) {
            const parsed = JSON.parse(res.findings_right);
            rightData = { ...rightData, ...parsed };
          }
        } catch (e) {}

        try {
          if (res.findings_left && res.findings_left.startsWith("{")) {
            const parsed = JSON.parse(res.findings_left);
            leftData = { ...leftData, ...parsed };
          }
        } catch (e) {}

        setReport({
          judgment_code: res.judgment_code || "",
          findings_right: rightData.comment,
          findings_left: leftData.comment,
          recommend_referral: !!res.recommend_referral,
          recommend_retest: !!res.recommend_retest,
          physician_comment: res.physician_comment || "",
          right_checklist: rightData.checklist || [],
          right_severity: rightData.severity || "",
          right_judgment: rightData.judgment || "",
          left_checklist: leftData.checklist || [],
          left_severity: leftData.severity || "",
          left_judgment: leftData.judgment || "",
        });
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      if (activeEye === "comparison") {
        const rightImg = data.images.find((img) => img.eye_side === "right");
        const leftImg = data.images.find((img) => img.eye_side === "left");

        if (rightImg && leftImg) {
          const drawHalf = (imgUrl: string, offsetX: number) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = imgUrl;
            img.onload = () => {
              const halfWidth = canvas.width / 2;
              const scale = Math.min(halfWidth / img.width, canvas.height / img.height) * zoom;
              const x = offsetX + halfWidth / 2 - (img.width / 2) * scale + pan.x;
              const y = canvas.height / 2 - (img.height / 2) * scale + pan.y;

              ctx.save();
              ctx.translate(x + (img.width * scale) / 2, y + (img.height * scale) / 2);
              ctx.rotate((rotation * Math.PI) / 180);
              ctx.drawImage(img, -(img.width * scale) / 2, -(img.height * scale) / 2, img.width * scale, img.height * scale);
              ctx.restore();
            };
          };
          drawHalf(rightImg.url, 0);
          drawHalf(leftImg.url, canvas.width / 2);
        }
      } else {
        const imgData = data.images.find((img) => img.eye_side === activeEye);
        if (!imgData) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imgData.url;
        img.onload = () => {
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * zoom;
          const x = canvas.width / 2 - (img.width / 2) * scale + pan.x;
          const y = canvas.height / 2 - (img.height / 2) * scale + pan.y;

          ctx.save();
          ctx.translate(x + (img.width * scale) / 2, y + (img.height * scale) / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(img, -(img.width * scale) / 2, -(img.height * scale) / 2, img.width * scale, img.height * scale);
          ctx.restore();
        };
      }
    };

    render();
  }, [data, activeEye, zoom, brightness, contrast, pan, rotation, viewMode, octSlice, showAiOverlay]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const submitReport = async () => {
    const payload = {
      ...report,
      status: "reading_completed",
      findings_right: JSON.stringify({
        checklist: report.right_checklist,
        severity: report.right_severity,
        judgment: report.right_judgment,
        comment: report.findings_right,
      }),
      findings_left: JSON.stringify({
        checklist: report.left_checklist,
        severity: report.left_severity,
        judgment: report.left_judgment,
        comment: report.findings_left,
      }),
    };

    await fetch(`/api/screenings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    navigate("/");
  };

  const handleQc = async (action: "approve" | "reject") => {
    const result = action === "approve" ? "approved" : "rejected";

    await fetch(`/api/screenings/${id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviewer_id: "op-1", // Mock current user
        checklist_json: qcChecklist,
        review_comment: qcFeedback,
        result,
      }),
    });

    if (action === "reject" && qcFeedback) {
      await fetch(`/api/screenings/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "QC Operator",
          content: `[QC Rejected] ${qcFeedback}`,
        }),
      });
    }

    navigate("/");
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const res = await fetch(`/api/screenings/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender:
          data?.status === "reading_completed" ? "QC Operator" : "Physician",
        content: newMessage,
      }),
    });
    const msg = await res.json();
    setData((prev) =>
      prev ? { ...prev, messages: [...prev.messages, msg] } : null,
    );
    setNewMessage("");
  };

  if (loading || !data)
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-white/50 font-mono text-xs uppercase tracking-widest">
            Loading Diagnostic Data...
          </div>
        </div>
      </div>
    );

  const isQcMode = data.status === "reading_completed";
  const isReadOnly = data.status === "completed" || data.status === "confirmed";

  return (
    <div className="fixed inset-0 bg-medical-bg flex flex-col z-50 overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="h-16 bg-medical-surface border-b border-medical-border flex items-center justify-between px-8 z-20 shrink-0">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/")}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-medical-text-muted hover:text-medical-primary"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="h-8 w-px bg-medical-border" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-medical-text-muted">
              {t('viewer.patient_record')}
            </span>
            <span className="text-sm font-bold text-medical-text">
              {data.patient_name} ({data.examinee_number})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Conference Mode Toggle */}
          <button
            onClick={() => setIsConferenceMode(!isConferenceMode)}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
              isConferenceMode 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                : "bg-slate-100 dark:bg-slate-800 text-medical-text-muted hover:text-medical-primary"
            )}
          >
            {isConferenceMode ? <VideoOff size={14} /> : <Video size={14} />}
            {t('viewer.conference_mode')}
          </button>

          <div className="h-8 w-px bg-medical-border mx-2" />

          {/* Export Options */}
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-wider text-medical-text-muted transition-all">
              <Download size={14} />
              {t('viewer.export_pdf')}
            </button>
          </div>

          {/* Color Mode Toggle */}
          <button
            onClick={() => setColorMode(colorMode === 'light' ? 'dark' : 'light')}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-medical-text-muted transition-all"
          >
            {colorMode === 'light' ? <Moon size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} />}
          </button>

          {/* Text Size Toggle */}
          <button
            onClick={() => {
              if (textSize === 'standard') setTextSize('large');
              else if (textSize === 'large') setTextSize('extra');
              else setTextSize('standard');
            }}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-medical-text-muted transition-all"
          >
            <Type size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Clinical Information */}
        <div className="w-80 bg-medical-surface border-r border-medical-border flex flex-col overflow-y-auto p-6 space-y-8 shrink-0">
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold text-medical-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
              <User size={14} className="text-medical-primary" />
              {t('register.patient_info')}
            </h3>
            <div className="space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-medical-border">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-medical-text-muted tracking-widest">Gender</span>
                <span className="text-xs font-bold text-medical-text capitalize">{data.gender}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-medical-text-muted tracking-widest">Birth Date</span>
                <span className="text-xs font-bold text-medical-text">{data.birth_date}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-medical-text-muted tracking-widest">{t('viewer.hospital')}</span>
                <div className="flex items-center gap-2 text-xs font-bold text-medical-text">
                  <Building2 size={12} className="text-medical-primary" />
                  {data.hospital_name || data.organization_name}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-medical-text-muted tracking-widest">{t('viewer.attending_physician')}</span>
                <div className="flex items-center gap-2 text-xs font-bold text-medical-text">
                  <Stethoscope size={12} className="text-medical-primary" />
                  {data.attending_physician || "Dr. Tanaka"}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-bold text-medical-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
              <HistoryIcon size={14} className="text-medical-primary" />
              {t('viewer.patient_history')}
            </h3>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-medical-border space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-medical-text-muted tracking-widest">Chief Complaint</span>
                <p className="text-xs text-medical-text leading-relaxed">{data.chief_complaint || "No data"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-bold text-medical-text-muted tracking-widest">Clinical History</span>
                <p className="text-xs text-medical-text leading-relaxed">{data.patient_history || "No significant history reported."}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-medical-border text-center">
                  <span className="text-[8px] uppercase font-bold text-medical-text-muted block">Diabetes</span>
                  <span className={clsx("text-[10px] font-bold", data.has_diabetes ? "text-red-500" : "text-emerald-500")}>
                    {data.has_diabetes ? "YES" : "NO"}
                  </span>
                </div>
                <div className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-medical-border text-center">
                  <span className="text-[8px] uppercase font-bold text-medical-text-muted block">Hypertension</span>
                  <span className={clsx("text-[10px] font-bold", data.has_hypertension ? "text-red-500" : "text-emerald-500")}>
                    {data.has_hypertension ? "YES" : "NO"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Chat Section */}
          <section className="flex-1 flex flex-col min-h-0 pt-4">
            <h3 className="text-[10px] font-bold text-medical-text-muted uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
              <MessageSquare size={14} className="text-medical-primary" />
              {t('viewer.chat_title')}
            </h3>
            <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-medical-border flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map(msg => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-bold text-medical-primary">{msg.sender}</span>
                      <span className="text-[8px] text-medical-text-muted">{msg.time}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-medical-border text-xs text-medical-text shadow-sm">
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 border-t border-medical-border">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder={t('viewer.chat_placeholder')}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-medical-border rounded-xl py-2 pl-3 pr-10 text-xs text-medical-text focus:outline-none focus:ring-2 focus:ring-medical-primary/50"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-medical-primary hover:text-medical-primary/80">
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Center Panel: Image Viewer */}
        <div className="flex-1 flex flex-col relative bg-black overflow-hidden">
          {/* Viewer Toolbar (Floating) */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
            <ToolButton
              icon={MousePointer2}
              onClick={() => setMeasureMode("none")}
              label="Select"
              active={measureMode === "none"}
            />
            <ToolButton
              icon={Ruler}
              onClick={() => setMeasureMode("dist")}
              label={t('viewer.measure.dist')}
              active={measureMode === "dist"}
            />
            <ToolButton
              icon={PenTool}
              onClick={() => setMeasureMode("area")}
              label={t('viewer.measure.area')}
              active={measureMode === "area"}
            />
            <div className="h-px bg-white/10 w-8 my-1" />
            <ToolButton
              icon={Layers}
              onClick={() => setViewMode(viewMode === "oct" ? "fundus" : "oct")}
              label={t('viewer.oct_slice')}
              active={viewMode === "oct"}
            />
            <ToolButton
              icon={BarChart3}
              onClick={() => setShowAiOverlay(!showAiOverlay)}
              label={t('viewer.ai_analysis')}
              active={showAiOverlay}
            />
            <div className="h-px bg-white/10 w-8 my-1" />
            <ToolButton
              icon={ZoomIn}
              onClick={() => setZoom((z) => Math.min(z + 0.2, 5))}
              label="Zoom In"
            />
            <ToolButton
              icon={ZoomOut}
              onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
              label="Zoom Out"
            />
            <ToolButton
              icon={RotateCw}
              onClick={() => setRotation((r) => (r + 90) % 360)}
              label="Rotate"
            />
          </div>

          {/* Conference Overlay (Simulated) */}
          {isConferenceMode && (
            <div className="absolute top-6 right-6 w-64 aspect-video bg-slate-900 rounded-2xl border-2 border-red-500 shadow-2xl overflow-hidden z-30">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-2">
                    <User size={24} className="text-slate-500" />
                  </div>
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Dr. Smith</span>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-red-500 rounded text-[8px] font-bold text-white uppercase">Live</div>
            </div>
          )}

          {/* OCT Slice Slider */}
          {viewMode === "oct" && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-96 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl z-10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {t('viewer.oct_slice')}
                </span>
                <span className="text-xs font-mono font-bold text-medical-primary">
                  {octSlice + 1} / 128
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="127"
                value={octSlice}
                onChange={(e) => setOctSlice(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-medical-primary"
              />
            </div>
          )}

          {/* AI Risk Score Overlay */}
          {showAiOverlay && (
            <div className="absolute top-8 left-24 w-48 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl z-10">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                {t('viewer.risk_score')}
              </div>
              <div className="flex items-end gap-2">
                <span className={clsx(
                  "text-3xl font-bold font-display",
                  aiRiskScore > 0.7 ? "text-red-500" : aiRiskScore > 0.3 ? "text-yellow-500" : "text-emerald-500"
                )}>
                  {(aiRiskScore * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Probability</span>
              </div>
              <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={clsx(
                    "h-full transition-all duration-1000",
                    aiRiskScore > 0.7 ? "bg-red-500" : aiRiskScore > 0.3 ? "bg-yellow-500" : "bg-emerald-500"
                  )}
                  style={{ width: `${aiRiskScore * 100}%` }}
                />
              </div>
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={1200}
            height={800}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right Panel: Reporting */}
        <div className="w-96 bg-medical-surface border-l border-medical-border flex flex-col shrink-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-bold text-medical-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                <FileText size={14} className="text-medical-primary" />
                {t('viewer.diagnostic_report')}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEyeChange("right")}
                  className={clsx(
                    "px-3 py-1 text-[10px] font-bold rounded-lg transition-all border",
                    activeEye === "right" ? "bg-medical-primary text-white border-medical-primary" : "bg-slate-100 dark:bg-slate-800 text-medical-text-muted border-medical-border"
                  )}
                >
                  OD
                </button>
                <button
                  onClick={() => handleEyeChange("left")}
                  className={clsx(
                    "px-3 py-1 text-[10px] font-bold rounded-lg transition-all border",
                    activeEye === "left" ? "bg-medical-primary text-white border-medical-primary" : "bg-slate-100 dark:bg-slate-800 text-medical-text-muted border-medical-border"
                  )}
                >
                  OS
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {/* Checklist */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-medical-text-muted uppercase tracking-wider ml-1">
                  {t('report.checklist.title')}
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'drusen', label: t('report.checklist.drusen') },
                    { id: 'hemorrhage', label: t('report.checklist.hemorrhage') },
                    { id: 'hard_exudate', label: t('report.checklist.hard_exudate') },
                    { id: 'neovascularization', label: t('report.checklist.neovascularization') },
                  ].map((item) => {
                    const currentChecklist = activeReportTab === "right" ? report.right_checklist : report.left_checklist;
                    const isChecked = currentChecklist.includes(item.id);
                    return (
                      <label key={item.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-medical-border cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded bg-white dark:bg-slate-800 border-medical-border text-medical-primary focus:ring-medical-primary/50"
                          checked={isChecked}
                          onChange={(e) => {
                            const newChecklist = e.target.checked
                              ? [...currentChecklist, item.id]
                              : currentChecklist.filter(id => id !== item.id);
                            setReport({
                              ...report,
                              [activeReportTab === "right" ? "right_checklist" : "left_checklist"]: newChecklist
                            });
                          }}
                        />
                        <span className="text-xs font-bold text-medical-text">{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Judgment */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-medical-text-muted uppercase tracking-wider ml-1">
                  {t('report.judgment.title')}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['A', 'B', 'C1', 'C2', 'D'].map((code) => {
                    const currentJudgment = activeReportTab === "right" ? report.right_judgment : report.left_judgment;
                    return (
                      <button
                        key={code}
                        onClick={() => setReport({
                          ...report,
                          [activeReportTab === "right" ? "right_judgment" : "left_judgment"]: code
                        })}
                        className={clsx(
                          "py-2 text-[10px] font-bold rounded-lg transition-all border",
                          currentJudgment === code
                            ? "bg-medical-primary text-white border-medical-primary shadow-md"
                            : "bg-slate-50 dark:bg-slate-900/50 border-medical-border text-medical-text-muted hover:border-medical-primary/50"
                        )}
                      >
                        {code}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ICD-10 Code */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-medical-text-muted uppercase tracking-wider ml-1">
                  {t('viewer.icd10')}
                </label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-medical-border rounded-xl p-3 text-xs font-bold text-medical-text focus:outline-none focus:ring-2 focus:ring-medical-primary/50 transition-all appearance-none"
                  value={report.icd10_code}
                  onChange={(e) => setReport({ ...report, icd10_code: e.target.value })}
                >
                  <option value="">-- Select ICD-10 --</option>
                  <option value="H35.3">H35.3 Macular Degeneration</option>
                  <option value="H36.0">H36.0 Diabetic Retinopathy</option>
                  <option value="H40.9">H40.9 Glaucoma</option>
                </select>
              </div>

              {/* Findings */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-medical-text-muted uppercase tracking-wider ml-1">
                  {t('viewer.physician_comment')}
                </label>
                <textarea
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-medical-border rounded-2xl p-4 text-xs font-bold text-medical-text focus:outline-none focus:ring-2 focus:ring-medical-primary/50 transition-all min-h-[120px] placeholder:text-medical-text-muted/50"
                  placeholder="Enter detailed clinical findings..."
                  value={activeReportTab === "right" ? report.findings_right : report.findings_left}
                  onChange={(e) =>
                    setReport({
                      ...report,
                      [activeReportTab === "right" ? "findings_right" : "findings_left"]: e.target.value
                    })
                  }
                />
              </div>

              {/* Digital Signature */}
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-medical-text-muted uppercase tracking-wider ml-1">
                  {t('viewer.digital_signature')}
                </label>
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-medical-border rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-medical-primary/10 flex items-center justify-center text-medical-primary">
                    <PenTool size={18} />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full bg-transparent border-none p-0 text-xs font-bold text-medical-text focus:ring-0 placeholder:text-medical-text-muted/50 italic font-display"
                      placeholder="Type name to sign..."
                      value={report.digital_signature}
                      onChange={(e) => setReport({ ...report, digital_signature: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-medical-border space-y-3">
            {isQcMode ? (
              <div className="flex gap-4">
                <button
                  onClick={() => setShowQcModal(true)}
                  className="flex-1 py-3 bg-white dark:bg-slate-800 border border-medical-border text-medical-text-muted hover:text-red-500 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm"
                >
                  {t('viewer.reject')}
                </button>
                <button
                  onClick={() => handleQc("approve")}
                  className="flex-[2] py-3 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-medical-primary/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={14} />
                  {t('viewer.approve_complete')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {}}
                  className="py-3 bg-white dark:bg-slate-800 border border-medical-border text-medical-text-muted hover:text-medical-primary rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm"
                >
                  {t('report.save_draft')}
                </button>
                <button
                  onClick={submitReport}
                  disabled={isReadOnly}
                  className="py-3 bg-medical-primary hover:bg-medical-primary/90 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-medical-text-muted text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-medical-primary/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={14} />
                  {t('report.submit')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showQcModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowQcModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-medical-surface rounded-[2.5rem] border border-medical-border shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-medical-text">Reject Screening</h3>
                    <p className="text-xs text-medical-text-muted">Please provide a reason for rejection.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQcModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-medical-text-muted"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                    Rejection Checklist
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.keys(qcChecklist).map((key) => (
                      <label
                        key={key}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-medical-border cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded bg-white dark:bg-slate-800 border-medical-border text-red-500 focus:ring-red-500/50"
                          checked={qcChecklist[key as keyof typeof qcChecklist]}
                          onChange={(e) =>
                            setQcChecklist({
                              ...qcChecklist,
                              [key]: e.target.checked,
                            })
                          }
                        />
                        <span className="text-xs font-bold text-medical-text">
                          {key.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                    Feedback for Physician
                  </label>
                  <textarea
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-medical-border rounded-2xl p-4 text-xs font-bold text-medical-text focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all min-h-[120px] placeholder:text-medical-text-muted/50"
                    placeholder={t('viewer.reject_reason_placeholder')}
                    value={qcFeedback}
                    onChange={(e) => setQcFeedback(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowQcModal(false)}
                  className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-medical-text-muted rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all"
                >
                  {t('viewer.cancel')}
                </button>
                <button
                  onClick={() => handleQc("reject")}
                  className="flex-[2] py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-red-600/20"
                >
                  {t('viewer.confirm_reject')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function ToolButton({
  icon: Icon,
  onClick,
  label,
  active = false,
}: {
  icon: any;
  onClick: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={clsx(
          "p-3.5 rounded-2xl transition-all duration-300",
          active
            ? "bg-medical-primary text-white shadow-lg shadow-medical-primary/20"
            : "bg-slate-100 dark:bg-slate-800 text-medical-text-muted hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-medical-primary",
        )}
      >
        <Icon size={20} strokeWidth={2.5} />
      </button>
      <div className="absolute left-full ml-4 px-3 py-1.5 bg-medical-surface text-medical-text text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 shadow-xl border border-medical-border">
        {label}
      </div>
    </div>
  );
}
