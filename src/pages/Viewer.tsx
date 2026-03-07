import React, { useEffect, useState, useRef, forwardRef } from "react";
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
  Minus,
  RotateCcw,
  Square,
  Printer,
  Palette,
} from "lucide-react";
import { clsx } from "clsx";
import { motion } from "framer-motion";
import { useTranslation } from "../lib/i18n";
import { useTheme } from "../lib/ThemeContext";
import { useReactToPrint } from "react-to-print";
import { ScreeningData } from "../types";

const PrintableReport = forwardRef<HTMLDivElement, { data: ScreeningData; report: any }>(
  ({ data, report }, ref) => {
    return (
      <div ref={ref} className="p-8 bg-white text-black hidden print:block">
        <div className="border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold text-center uppercase tracking-widest">
            Eye Screening Report
          </h1>
          <p className="text-center text-sm text-gray-500 mt-1">
            Generated on {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-2 mb-3">
              Patient Information
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">ID:</span>
                <span className="font-semibold">{data.examinee_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-semibold">{data.patient_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gender/Age:</span>
                <span className="font-semibold">
                  {data.gender === "M" ? "Male" : "Female"} /{" "}
                  {new Date().getFullYear() - new Date(data.birth_date).getFullYear()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Organization:</span>
                <span className="font-semibold">{data.organization_name}</span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-2 mb-3">
              Screening Details
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-semibold">
                  {new Date(data.screening_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Physician:</span>
                <span className="font-semibold">{data.attending_physician || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Judgment Code:</span>
                <span className="font-semibold">{report.judgment_code || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ICD-10:</span>
                <span className="font-semibold">{report.icd10_code || "N/A"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-2 mb-3">
            Clinical Findings
          </h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Right Eye (OD)</h3>
              <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md min-h-[100px]">
                {report.findings_right || "No significant findings."}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Left Eye (OS)</h3>
              <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md min-h-[100px]">
                {report.findings_left || "No significant findings."}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-wider border-b border-gray-300 pb-2 mb-3">
            Recommendations & Comments
          </h2>
          <div className="space-y-4 text-sm">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className={clsx("w-4 h-4 border rounded-sm flex items-center justify-center", report.recommend_referral ? "bg-black border-black" : "border-gray-400")}>
                  {report.recommend_referral && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <span>Referral Recommended</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={clsx("w-4 h-4 border rounded-sm flex items-center justify-center", report.recommend_retest ? "bg-black border-black" : "border-gray-400")}>
                  {report.recommend_retest && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <span>Retest Recommended</span>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">Physician Comments</h3>
              <p className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded-md min-h-[80px]">
                {report.physician_comment || "None."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-300 flex justify-between items-end">
          <div className="text-xs text-gray-500">
            This report is electronically generated and signed.
          </div>
          <div className="text-right">
            <div className="text-lg font-display italic mb-1">
              {report.digital_signature || "Not Signed"}
            </div>
            <div className="text-xs uppercase tracking-widest text-gray-500">
              Digital Signature
            </div>
          </div>
        </div>
      </div>
    );
  }
);

const AccordionSection = ({ title, icon: Icon, children, defaultOpen = true, warning = false }: { title: string, icon: any, children: React.ReactNode, defaultOpen?: boolean, warning?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-medical-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-medical-surface transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={18} className={warning ? "text-medical-warning" : "text-medical-text-muted"} />
          <span className="text-xs font-bold text-medical-text">{title}</span>
        </div>
        <ChevronLeft size={16} className={clsx("text-medical-text-muted transition-transform", isOpen ? "-rotate-90" : "")} />
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
};

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
  const [activeTool, setActiveTool] = useState<"pan" | "measure" | "annotate">("pan");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAiOverlay, setShowAiOverlay] = useState(false);
  const [aiRiskScore, setAiRiskScore] = useState(0.15);
  const [showChat, setShowChat] = useState(false);
  const [isConferenceMode, setIsConferenceMode] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: '1', sender: 'Operator A', content: t('viewer.chat.mock1'), time: '10:05' },
    { id: '2', sender: 'Dr. Smith', content: t('viewer.chat.mock2'), time: '10:08' },
  ]);

  // Sync activeEye and activeReportTab
  const handleEyeChange = (eye: "right" | "left" | "comparison") => {
    setActiveEye(eye);
    if (eye === "right" || eye === "left") {
      setActiveReportTab(eye);
      // Find image index for this eye
      const index = data?.images.findIndex(img => img.eye_side === eye);
      if (index !== -1 && index !== undefined) {
        setCurrentImageIndex(index);
      }
    }
  };

  const handleReportTabChange = (tab: "right" | "left") => {
    setActiveReportTab(tab);
    if (activeEye !== "comparison") {
      setActiveEye(tab);
      // Find image index for this eye
      const index = data?.images.findIndex(img => img.eye_side === tab);
      if (index !== -1 && index !== undefined) {
        setCurrentImageIndex(index);
      }
    }
  };

  useEffect(() => {
    if (data && data.images && data.images.length > 0 && activeEye !== "comparison") {
      const currentImage = data.images[currentImageIndex];
      if (currentImage) {
        setActiveEye(currentImage.eye_side as "right" | "left");
        setActiveReportTab(currentImage.eye_side as "right" | "left");
      }
    }
  }, [currentImageIndex, data]);

  // Canvas State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [measurements, setMeasurements] = useState<{startX: number, startY: number, endX: number, endY: number}[]>([]);
  const [currentMeasure, setCurrentMeasure] = useState<{startX: number, startY: number, endX: number, endY: number} | null>(null);
  const [annotations, setAnnotations] = useState<{x: number, y: number, w: number, h: number}[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState<{x: number, y: number, w: number, h: number} | null>(null);
  const [freehandPaths, setFreehandPaths] = useState<{points: {x: number, y: number}[]}[]>([]);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[] | null>(null);
  const [textAnnotations, setTextAnnotations] = useState<{x: number, y: number, text: string}[]>([]);
  const [draggingAnnotationIndex, setDraggingAnnotationIndex] = useState<number | null>(null);
  const [draggingMeasurementIndex, setDraggingMeasurementIndex] = useState<number | null>(null);
  const [draggingTextIndex, setDraggingTextIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{x: number, y: number} | null>(null);
  const [colorChannel, setColorChannel] = useState<"normal" | "red-free" | "red" | "blue">("normal");
  const [currentImageDimensions, setCurrentImageDimensions] = useState<{width: number, height: number} | null>(null);

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
  const [showTextAnnotationModal, setShowTextAnnotationModal] = useState(false);
  const [textAnnotationValue, setTextAnnotationValue] = useState("");
  const [textAnnotationPosition, setTextAnnotationPosition] = useState({ x: 0, y: 0 });
  const [qcChecklist, setQcChecklist] = useState({
    od_os_match: false,
    required_fields: false,
    judgment_match: false,
    format_compliance: false,
  });

  // Print Setup
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Screening_Report_${data?.examinee_number || id}`,
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

  const screenToImage = (sx: number, sy: number) => {
    if (!canvasRef.current || !currentImageDimensions) return { x: 0, y: 0 };
    const canvas = canvasRef.current;
    const imgWidth = currentImageDimensions.width;
    const imgHeight = currentImageDimensions.height;
    
    const scale = Math.min(canvas.width / imgWidth, canvas.height / imgHeight) * zoom;
    const cx = canvas.width / 2 + pan.x;
    const cy = canvas.height / 2 + pan.y;

    const dx = sx - cx;
    const dy = sy - cy;

    const rad = (-rotation * Math.PI) / 180;
    const rx = dx * Math.cos(rad) - dy * Math.sin(rad);
    const ry = dx * Math.sin(rad) + dy * Math.cos(rad);

    const ix = rx / scale + imgWidth / 2;
    const iy = ry / scale + imgHeight / 2;

    return { x: ix, y: iy };
  };

  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;

      if (activeEye === "comparison") {
        // ... comparison logic (skip annotations for now)
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
        const imgData = data.images[currentImageIndex];
        if (!imgData) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imgData.url;
        img.onload = () => {
          setCurrentImageDimensions({ width: img.width, height: img.height });
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * zoom;
          const x = canvas.width / 2 - (img.width / 2) * scale + pan.x;
          const y = canvas.height / 2 - (img.height / 2) * scale + pan.y;

          ctx.save();
          ctx.translate(x + (img.width * scale) / 2, y + (img.height * scale) / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.scale(scale, scale);
          ctx.translate(-img.width / 2, -img.height / 2);

          // Draw Image
          ctx.drawImage(img, 0, 0, img.width, img.height);

          // Apply Color Channels
          if (colorChannel !== "normal") {
            ctx.globalCompositeOperation = "multiply";
            if (colorChannel === "red-free") {
              ctx.fillStyle = "#00FF00"; // Green channel
            } else if (colorChannel === "red") {
              ctx.fillStyle = "#FF0000";
            } else if (colorChannel === "blue") {
              ctx.fillStyle = "#0000FF";
            }
            ctx.fillRect(0, 0, img.width, img.height);
            ctx.globalCompositeOperation = "source-over";
          }

          // Draw Measurements
          ctx.strokeStyle = "#00ff00";
          ctx.lineWidth = 2 / scale;
          ctx.fillStyle = "#00ff00";
          ctx.font = `${16 / scale}px Arial`;
          
          const drawMeasure = (m: {startX: number, startY: number, endX: number, endY: number}) => {
            ctx.beginPath();
            ctx.moveTo(m.startX, m.startY);
            ctx.lineTo(m.endX, m.endY);
            ctx.stroke();
            
            const dist = Math.sqrt(Math.pow(m.endX - m.startX, 2) + Math.pow(m.endY - m.startY, 2));
            const midX = (m.startX + m.endX) / 2;
            const midY = (m.startY + m.endY) / 2;
            ctx.fillText(`${dist.toFixed(1)} px`, midX + 5 / scale, midY - 5 / scale);
          };

          measurements.forEach(drawMeasure);
          if (currentMeasure) drawMeasure(currentMeasure);

          // Draw Annotations
          ctx.strokeStyle = "#ff0000";
          ctx.lineWidth = 2 / scale;
          
          const drawAnnotation = (a: {x: number, y: number, w: number, h: number}) => {
            ctx.strokeRect(a.x, a.y, a.w, a.h);
            const area = Math.abs(a.w * a.h);
            ctx.fillStyle = "#ff0000";
            ctx.font = `${16 / scale}px Arial`;
            ctx.fillText(`${area.toFixed(0)} px²`, a.x, a.y - 5 / scale);
          };

          annotations.forEach(drawAnnotation);
          if (currentAnnotation) drawAnnotation(currentAnnotation);

          // Draw Freehand
          ctx.strokeStyle = "#ffff00";
          ctx.lineWidth = 2 / scale;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          const drawPath = (path: {x: number, y: number}[]) => {
            if (path.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
              ctx.lineTo(path[i].x, path[i].y);
            }
            ctx.stroke();

            // Calculate area (Shoelace formula)
            let area = 0;
            for (let i = 0; i < path.length; i++) {
              const j = (i + 1) % path.length;
              area += path[i].x * path[j].y;
              area -= path[j].x * path[i].y;
            }
            area = Math.abs(area / 2);
            ctx.fillStyle = "#ffff00";
            ctx.font = `${16 / scale}px Arial`;
            ctx.fillText(`${area.toFixed(0)} px²`, path[0].x, path[0].y - 5 / scale);
          };

          freehandPaths.forEach(drawPath);
          if (currentPath) drawPath(currentPath);

          // Draw Text
          ctx.fillStyle = "#ffff00";
          ctx.font = `${20 / scale}px Arial`;
          textAnnotations.forEach(t => {
            ctx.fillText(t.text, t.x, t.y);
          });

          ctx.restore();
        };
      }
    };

    render();
  }, [data, activeEye, zoom, brightness, contrast, pan, rotation, viewMode, octSlice, showAiOverlay, currentImageIndex, measurements, annotations, currentMeasure, currentAnnotation, freehandPaths, currentPath, textAnnotations]);

  const getCanvasCoordinates = (e: React.MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const screenCoords = getCanvasCoordinates(e);
    const imgCoords = screenToImage(screenCoords.x, screenCoords.y);

    if (!activeTool) {
      const annotationIndex = annotations.findIndex(a => 
        imgCoords.x >= Math.min(a.x, a.x + a.w) && imgCoords.x <= Math.max(a.x, a.x + a.w) &&
        imgCoords.y >= Math.min(a.y, a.y + a.h) && imgCoords.y <= Math.max(a.y, a.y + a.h)
      );
      if (annotationIndex !== -1) {
        setDraggingAnnotationIndex(annotationIndex);
        setDragOffset({ x: imgCoords.x - annotations[annotationIndex].x, y: imgCoords.y - annotations[annotationIndex].y });
        setIsDragging(true);
        return;
      }
      const measurementIndex = measurements.findIndex(m => {
        const dist = Math.abs((m.endY - m.startY) * imgCoords.x - (m.endX - m.startX) * imgCoords.y + m.endX * m.startY - m.endY * m.startX) / 
                     Math.sqrt(Math.pow(m.endY - m.startY, 2) + Math.pow(m.endX - m.startX, 2));
        return dist < 10;
      });
      if (measurementIndex !== -1) {
        setDraggingMeasurementIndex(measurementIndex);
        setDragOffset({ x: imgCoords.x - measurements[measurementIndex].startX, y: imgCoords.y - measurements[measurementIndex].startY });
        setIsDragging(true);
        return;
      }
      const textIndex = textAnnotations.findIndex(t => 
        Math.abs(imgCoords.x - t.x) < 50 && Math.abs(imgCoords.y - t.y) < 20
      );
      if (textIndex !== -1) {
        setDraggingTextIndex(textIndex);
        setDragOffset({ x: imgCoords.x - textAnnotations[textIndex].x, y: imgCoords.y - textAnnotations[textIndex].y });
        setIsDragging(true);
        return;
      }
    }

    if (activeTool === "pan") {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (activeTool === "measure") {
      setIsDragging(true);
      setCurrentMeasure({ startX: imgCoords.x, startY: imgCoords.y, endX: imgCoords.x, endY: imgCoords.y });
    } else if (activeTool === "annotate") {
      setIsDragging(true);
      setCurrentAnnotation({ x: imgCoords.x, y: imgCoords.y, w: 0, h: 0 });
    } else if (activeTool === "freehand") {
      setIsDragging(true);
      setCurrentPath([{ x: imgCoords.x, y: imgCoords.y }]);
    } else if (activeTool === "text") {
      setShowTextAnnotationModal(true);
      setTextAnnotationPosition({ x: imgCoords.x, y: imgCoords.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const screenCoords = getCanvasCoordinates(e);
    const imgCoords = screenToImage(screenCoords.x, screenCoords.y);

    if (draggingAnnotationIndex !== null && dragOffset) {
      const newAnnotations = [...annotations];
      newAnnotations[draggingAnnotationIndex] = {
        ...newAnnotations[draggingAnnotationIndex],
        x: imgCoords.x - dragOffset.x,
        y: imgCoords.y - dragOffset.y,
      };
      setAnnotations(newAnnotations);
    } else if (draggingMeasurementIndex !== null && dragOffset) {
      const newMeasurements = [...measurements];
      const m = newMeasurements[draggingMeasurementIndex];
      const dx = imgCoords.x - m.startX - dragOffset.x;
      const dy = imgCoords.y - m.startY - dragOffset.y;
      newMeasurements[draggingMeasurementIndex] = {
        ...m,
        startX: m.startX + dx,
        startY: m.startY + dy,
        endX: m.endX + dx,
        endY: m.endY + dy,
      };
      setMeasurements(newMeasurements);
      setDragOffset({ x: imgCoords.x - newMeasurements[draggingMeasurementIndex].startX, y: imgCoords.y - newMeasurements[draggingMeasurementIndex].startY });
    } else if (draggingTextIndex !== null && dragOffset) {
      const newTextAnnotations = [...textAnnotations];
      newTextAnnotations[draggingTextIndex] = {
        ...newTextAnnotations[draggingTextIndex],
        x: imgCoords.x - dragOffset.x,
        y: imgCoords.y - dragOffset.y,
      };
      setTextAnnotations(newTextAnnotations);
    } else if (activeTool === "pan") {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (activeTool === "measure" && currentMeasure) {
      setCurrentMeasure({ ...currentMeasure, endX: imgCoords.x, endY: imgCoords.y });
    } else if (activeTool === "annotate" && currentAnnotation) {
      setCurrentAnnotation({
        ...currentAnnotation,
        w: imgCoords.x - currentAnnotation.x,
        h: imgCoords.y - currentAnnotation.y,
      });
    } else if (activeTool === "freehand" && currentPath) {
      setCurrentPath([...currentPath, { x: imgCoords.x, y: imgCoords.y }]);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      if (activeTool === "measure" && currentMeasure) {
        setMeasurements([...measurements, currentMeasure]);
        setCurrentMeasure(null);
      } else if (activeTool === "annotate" && currentAnnotation) {
        setAnnotations([...annotations, currentAnnotation]);
        setCurrentAnnotation(null);
      } else if (activeTool === "freehand" && currentPath) {
        setFreehandPaths([...freehandPaths, currentPath]);
        setCurrentPath(null);
      }
    }
    setIsDragging(false);
    setDraggingAnnotationIndex(null);
    setDraggingMeasurementIndex(null);
    setDraggingTextIndex(null);
    setDragOffset(null);
  };

  const [isSaving, setIsSaving] = useState(false);

  // ... (existing code)

  const saveDraft = async () => {
    setIsSaving(true);
    const payload = {
      status: "assigned", // Keep status as assigned for draft
      judgment_code: report.judgment_code || null,
      findings_right: JSON.stringify({
        checklist: report.right_checklist,
        severity: report.right_severity,
        comment: report.findings_right,
      }),
      findings_left: JSON.stringify({
        checklist: report.left_checklist,
        severity: report.left_severity,
        comment: report.findings_left,
      }),
      recommend_referral: report.recommend_referral ? 1 : 0,
      recommend_retest: report.recommend_retest ? 1 : 0,
      physician_comment: report.icd10_code ? `[ICD-10: ${report.icd10_code}]\n${report.physician_comment}` : report.physician_comment,
    };

    try {
      const response = await fetch(`/api/screenings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error ? JSON.stringify(errData.error) : "Failed to save draft");
      }
      
      console.log(t('report.draft_saved') || "Draft saved successfully.");
    } catch (error) {
      console.error("Save Draft Error:", error);
      console.error(`レポートの保存に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const submitReport = async () => {
    if (!window.confirm("レポートを確定してもよろしいですか？")) {
      return;
    }
    if (!report.judgment_code) {
      console.error("Please select an overall judgment code before submitting.");
      return;
    }

    setIsSaving(true);
    const payload = {
      status: "reading_completed",
      judgment_code: report.judgment_code,
      findings_right: JSON.stringify({
        checklist: report.right_checklist,
        severity: report.right_severity,
        comment: report.findings_right,
      }),
      findings_left: JSON.stringify({
        checklist: report.left_checklist,
        severity: report.left_severity,
        comment: report.findings_left,
      }),
      recommend_referral: report.recommend_referral ? 1 : 0,
      recommend_retest: report.recommend_retest ? 1 : 0,
      physician_comment: report.icd10_code ? `[ICD-10: ${report.icd10_code}]\n${report.physician_comment}` : report.physician_comment,
    };

    try {
      console.log("Submitting report payload:", payload);
      const response = await fetch(`/api/screenings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Submit response status:", response.status);
      if (!response.ok) {
        const errData = await response.json();
        console.error("Submit error data:", errData);
        throw new Error(errData.error ? JSON.stringify(errData.error) : "Failed to submit report");
      }
      
      alert(t('report.submit_success') || "Report submitted successfully.");
      navigate("/");
    } catch (error) {
      console.error("Submit Report Error:", error);
      alert(`レポートの提出に失敗しました: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
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
      <div className="h-screen bg-medical-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-medical-primary border-t-transparent rounded-full animate-spin"></div>
          <div className="text-medical-text-muted font-mono text-xs uppercase tracking-widest">
            {t('status.pending')}...
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
            className="p-2.5 hover:bg-medical-bg rounded-2xl transition-all text-medical-text-muted hover:text-medical-primary"
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
                ? "bg-medical-error text-white shadow-lg shadow-medical-error/20" 
                : "bg-medical-bg text-medical-text-muted hover:text-medical-primary"
            )}
          >
            {isConferenceMode ? <VideoOff size={14} /> : <Video size={14} />}
            {t('viewer.conference_mode')}
          </button>

          <div className="h-8 w-px bg-medical-border mx-2" />

          {/* Export Options */}
          <div className="flex gap-2">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-medical-bg hover:bg-medical-surface rounded-xl text-[10px] font-bold uppercase tracking-wider text-medical-text-muted transition-all"
            >
              <Printer size={14} />
              {t('viewer.export_pdf')}
            </button>
          </div>

          {/* Color Mode Toggle */}
          <button
            onClick={() => setColorMode(colorMode === 'light' ? 'dark' : 'light')}
            className="p-2.5 bg-medical-bg hover:bg-medical-surface rounded-xl text-medical-text-muted transition-all"
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
            className="p-2.5 bg-medical-bg hover:bg-medical-surface rounded-xl text-medical-text-muted transition-all"
            title="Toggle Text Size"
          >
            <Type size={18} strokeWidth={2.5} />
          </button>

          {/* Language Toggle */}
          <div className="flex items-center bg-medical-bg rounded-xl p-1">
            <button
              onClick={() => setLanguage('en')}
              className={clsx(
                "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                language === 'en' ? "bg-medical-surface text-medical-primary shadow-sm" : "text-medical-text-muted hover:text-medical-text"
              )}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ja')}
              className={clsx(
                "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all",
                language === 'ja' ? "bg-medical-surface text-medical-primary shadow-sm" : "text-medical-text-muted hover:text-medical-text"
              )}
            >
              JP
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Clinical Information */}
        <div className="w-[320px] bg-medical-surface border-r border-medical-border flex flex-col overflow-y-auto shrink-0">
          <AccordionSection title="主訴・症状" icon={AlertCircle} warning={true}>
            <div className="bg-medical-bg border border-medical-border rounded-xl p-3 text-xs text-medical-text leading-relaxed">
              {data.chief_complaint || t('viewer.no_data')}
            </div>
          </AccordionSection>

          <AccordionSection title="依頼元情報" icon={Building2} defaultOpen={false}>
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-medical-bg border border-medical-border rounded-lg p-2 flex flex-col">
                <span className="text-[10px] text-medical-text-muted mb-1">施設名</span>
                <span className="text-xs font-bold">{data.hospital_name || data.organization_name}</span>
              </div>
              <div className="bg-medical-bg border border-medical-border rounded-lg p-2 flex flex-col">
                <span className="text-[10px] text-medical-text-muted mb-1">依頼医</span>
                <span className="text-xs font-bold">{data.attending_physician || "Dr. Tanaka"}</span>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="基本情報" icon={User}>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-medical-bg border border-medical-border rounded-lg p-2 flex flex-col items-center justify-center">
                <span className="text-[10px] text-medical-text-muted mb-1">生年月日</span>
                <span className="text-xs font-bold">{data.birth_date}</span>
              </div>
              <div className="bg-medical-bg border border-medical-border rounded-lg p-2 flex flex-col items-center justify-center">
                <span className="text-[10px] text-medical-text-muted mb-1">性別</span>
                <span className="text-xs font-bold capitalize">
                  {data.gender === 'male' ? t('viewer.male') : data.gender === 'female' ? t('viewer.female') : t('viewer.other')}
                </span>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="全身状態" icon={Activity} warning={data.has_diabetes || data.has_hypertension}>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-medical-bg border border-medical-border rounded-lg p-2 flex flex-col items-center justify-center">
                <span className="text-[10px] text-medical-text-muted mb-1">血圧</span>
                <span className="text-sm font-bold text-medical-error">142/88</span>
              </div>
              <div className="bg-medical-bg border border-medical-border rounded-lg p-2 flex flex-col items-center justify-center">
                <span className="text-[10px] text-medical-text-muted mb-1">HbA1c</span>
                <span className="text-sm font-bold text-medical-error">7.2%</span>
              </div>
              <div className={clsx("border rounded-lg p-2 flex flex-col items-center justify-center", data.has_diabetes ? "bg-red-50/10 border-red-500/30" : "bg-medical-bg border-medical-border")}>
                <span className="text-[10px] text-medical-text-muted mb-1">糖尿病</span>
                <span className={clsx("text-xs font-bold", data.has_diabetes ? "text-red-500" : "text-medical-text")}>
                  {data.has_diabetes ? "あり" : "なし"}
                </span>
              </div>
              <div className={clsx("border rounded-lg p-2 flex flex-col items-center justify-center", data.has_hypertension ? "bg-red-50/10 border-red-500/30" : "bg-medical-bg border-medical-border")}>
                <span className="text-[10px] text-medical-text-muted mb-1">高血圧</span>
                <span className={clsx("text-xs font-bold", data.has_hypertension ? "text-red-500" : "text-medical-text")}>
                  {data.has_hypertension ? "あり" : "なし"}
                </span>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection title="既往歴" icon={HistoryIcon} defaultOpen={false}>
            <div className="bg-medical-bg border border-medical-border rounded-xl p-3 text-xs text-medical-text leading-relaxed">
              {data.patient_history || t('viewer.no_history')}
            </div>
          </AccordionSection>

          {/* Chat Section */}
          <section className="flex-1 flex flex-col min-h-0 p-4 border-t border-medical-border mt-auto">
            <h3 className="text-[10px] font-bold text-medical-text-muted uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
              <MessageSquare size={14} className="text-medical-primary" />
              {t('viewer.chat_title')}
            </h3>
            <div className="flex-1 bg-medical-bg rounded-2xl border border-medical-border flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map(msg => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[9px] font-bold text-medical-primary">{msg.sender}</span>
                      <span className="text-[8px] text-medical-text-muted">{msg.time}</span>
                    </div>
                    <div className="bg-medical-surface p-3 rounded-2xl rounded-tl-none border border-medical-border text-xs text-medical-text shadow-sm">
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-medical-surface border-t border-medical-border">
                <div className="relative">
                  <input 
                    type="text"
                    placeholder={t('viewer.chat_placeholder')}
                    className="w-full bg-medical-bg border border-medical-border rounded-xl py-2 pl-3 pr-10 text-xs text-medical-text focus:outline-none focus:ring-2 focus:ring-medical-primary/50"
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
        <div className="flex-1 flex flex-col relative bg-medical-bg overflow-hidden">
          {/* Viewer Toolbar (Floating) */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
            {/* Basic Tools */}
            <ToolButton
              icon={MousePointer2}
              onClick={() => setActiveTool("pan")}
              label="Select / Pan"
              active={activeTool === "pan"}
            />
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
              label="Rotate 90°"
            />
            <ToolButton
              icon={RotateCcw}
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
                setRotation(0);
                setBrightness(100);
                setContrast(100);
                setColorChannel("normal");
                setMeasurements([]);
                setAnnotations([]);
              }}
              label="Reset View"
            />
            
            <div className="h-px bg-medical-border w-8 my-1 mx-auto" />
            
            {/* Image Adjustments */}
            <div className="flex flex-col gap-1">
              <ToolButton
                icon={Sun}
                onClick={() => setBrightness((b) => Math.min(b + 20, 200))}
                label="Brightness +"
              />
              <ToolButton
                icon={Minus}
                onClick={() => setBrightness((b) => Math.max(b - 20, 0))}
                label="Brightness -"
              />
            </div>
            <div className="flex flex-col gap-1">
              <ToolButton
                icon={Contrast}
                onClick={() => setContrast((c) => Math.min(c + 20, 200))}
                label="Contrast +"
              />
              <ToolButton
                icon={Minus}
                onClick={() => setContrast((c) => Math.max(c - 20, 0))}
                label="Contrast -"
              />
            </div>

            <div className="h-px bg-medical-border w-8 my-1 mx-auto" />

            {/* Measurement & Annotation */}
            <ToolButton
              icon={Ruler}
              onClick={() => setActiveTool(activeTool === "measure" ? "pan" : "measure")}
              label={t('viewer.measure.dist')}
              active={activeTool === "measure"}
            />
            <ToolButton
              icon={Square}
              onClick={() => setActiveTool(activeTool === "annotate" ? "pan" : "annotate")}
              label={t('viewer.measure.area')}
              active={activeTool === "annotate"}
            />
            <ToolButton
              icon={PenTool}
              onClick={() => setActiveTool(activeTool === "freehand" ? "pan" : "freehand")}
              label="Freehand"
              active={activeTool === "freehand"}
            />
            <ToolButton
              icon={Type}
              onClick={() => setActiveTool(activeTool === "text" ? "pan" : "text")}
              label="Text Annotation"
              active={activeTool === "text"}
            />

            <div className="h-px bg-medical-border w-8 my-1 mx-auto" />

            {/* Advanced Views */}
            <ToolButton
              icon={Palette}
              onClick={() => {
                const channels: ("normal" | "red-free" | "red" | "blue")[] = ["normal", "red-free", "red", "blue"];
                const nextIndex = (channels.indexOf(colorChannel) + 1) % channels.length;
                setColorChannel(channels[nextIndex]);
              }}
              label={`Color Channel: ${colorChannel}`}
              active={colorChannel !== "normal"}
            />
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
          </div>

          {/* Conference Overlay (Simulated) */}
          {isConferenceMode && (
            <div className="absolute top-6 right-6 w-64 aspect-video bg-medical-surface rounded-2xl border-2 border-medical-error shadow-2xl overflow-hidden z-30">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-medical-bg flex items-center justify-center mx-auto mb-2">
                    <User size={24} className="text-medical-text-muted" />
                  </div>
                  <span className="text-[10px] font-bold text-medical-text uppercase tracking-widest">Dr. Smith</span>
                </div>
              </div>
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-medical-error rounded text-[8px] font-bold text-white uppercase">Live</div>
            </div>
          )}

          {/* OCT Slice Slider */}
          {viewMode === "oct" && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-96 bg-medical-surface/80 backdrop-blur-md p-4 rounded-2xl border border-medical-border shadow-2xl z-10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-bold text-medical-text-muted uppercase tracking-widest">
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
                className="w-full h-1.5 bg-medical-bg rounded-lg appearance-none cursor-pointer accent-medical-primary"
              />
            </div>
          )}

          {/* AI Risk Score Overlay */}
          {showAiOverlay && (
            <div className="absolute top-8 left-24 w-48 bg-medical-surface/80 backdrop-blur-md p-4 rounded-2xl border border-medical-border shadow-2xl z-10">
              <div className="text-[10px] font-bold text-medical-text-muted uppercase tracking-widest mb-2">
                {t('viewer.risk_score')}
              </div>
              <div className="flex items-end gap-2">
                <span className={clsx(
                  "text-3xl font-bold font-display",
                  aiRiskScore > 0.7 ? "text-medical-error" : aiRiskScore > 0.3 ? "text-medical-warning" : "text-medical-success"
                )}>
                  {(aiRiskScore * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-medical-text-muted mb-1 font-bold uppercase">Probability</span>
              </div>
              <div className="mt-3 h-1.5 w-full bg-medical-bg rounded-full overflow-hidden">
                <div 
                  className={clsx(
                    "h-full transition-all duration-1000",
                    aiRiskScore > 0.7 ? "bg-medical-error" : aiRiskScore > 0.3 ? "bg-medical-warning" : "bg-medical-success"
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

          {/* Image Navigation (Thumbnails) */}
          {data.images && data.images.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-medical-surface/80 backdrop-blur-md p-2 rounded-2xl border border-medical-border shadow-xl z-20 max-w-[80%] overflow-x-auto">
              <button
                onClick={() => setCurrentImageIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentImageIndex === 0}
                className="p-2 shrink-0 rounded-xl text-medical-text-muted hover:bg-medical-bg hover:text-medical-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              
              <div className="flex items-center gap-2 overflow-x-auto px-2 snap-x scrollbar-hide">
                {data.images.map((img, idx) => {
                  const isRightEye = img.eye_side === 'right';
                  const activeColorClass = isRightEye ? "border-red-500 shadow-red-500/30" : "border-blue-500 shadow-blue-500/30";
                  
                  return (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={clsx(
                        "relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all snap-center",
                        currentImageIndex === idx 
                          ? `${activeColorClass} shadow-lg scale-105` 
                          : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img 
                        src={img.url} 
                        alt={`Thumbnail ${idx + 1}`} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className={clsx(
                        "absolute bottom-0 inset-x-0 text-white text-[8px] font-bold text-center py-0.5",
                        isRightEye ? "bg-red-500/80" : "bg-blue-500/80"
                      )}>
                        {isRightEye ? 'OD' : 'OS'}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentImageIndex((prev) => Math.min(data.images.length - 1, prev + 1))}
                disabled={currentImageIndex === data.images.length - 1}
                className="p-2 shrink-0 rounded-xl text-medical-text-muted hover:bg-medical-bg hover:text-medical-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} className="rotate-180" />
              </button>
            </div>
          )}
        </div>

        {/* Right Panel: Reporting - Fixed width to prevent shrinking viewer on text scale */}
        <div className="w-[380px] bg-medical-surface border-l border-medical-border flex flex-col shrink-0 overflow-hidden">
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
                    "px-3 py-1 text-[10px] font-bold rounded-lg transition-all border-2",
                    activeEye === "right" ? "bg-red-500 text-white border-red-500" : "bg-medical-bg text-medical-text-muted border-medical-border hover:border-red-500/50"
                  )}
                >
                  OD
                </button>
                <button
                  onClick={() => handleEyeChange("left")}
                  className={clsx(
                    "px-3 py-1 text-[10px] font-bold rounded-lg transition-all border-2",
                    activeEye === "left" ? "bg-blue-500 text-white border-blue-500" : "bg-medical-bg text-medical-text-muted border-medical-border hover:border-blue-500/50"
                  )}
                >
                  OS
                </button>
              </div>
            </div>

            <motion.div 
              key={activeReportTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={clsx(
                "space-y-6 p-4 rounded-2xl border-2 transition-colors duration-300",
                activeReportTab === "right" 
                  ? "bg-red-50/10 border-red-500/50" 
                  : "bg-blue-50/10 border-blue-500/50"
              )}
            >
              {/* Checklist */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-medical-text-muted uppercase tracking-wider ml-1">
                  所見チェックリスト
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'drusen', label: 'ドルーゼン' },
                    { id: 'hemorrhage', label: '出血' },
                    { id: 'hard_exudate', label: '硬性白斑' },
                    { id: 'soft_exudate', label: '軟性白斑' },
                    { id: 'neovascularization', label: '新生血管' },
                    { id: 'microaneurysm', label: '毛細血管瘤' },
                    { id: 'macular_edema', label: '黄斑浮腫' },
                    { id: 'pigment_abnormality', label: '色素異常' },
                    { id: 'optic_disc_abnormality', label: '視神経乳頭異常' },
                    { id: 'vascular_abnormality', label: '血管異常' },
                    { id: 'vitreous_opacity', label: '硝子体混濁' },
                    { id: 'retinal_detachment', label: '網膜剥離' },
                  ].map((item) => {
                    const currentChecklist = activeReportTab === "right" ? report.right_checklist : report.left_checklist;
                    const isChecked = currentChecklist.includes(item.id);
                    return (
                      <label key={item.id} className="flex items-center gap-2 p-2 bg-medical-bg rounded-lg border border-medical-border cursor-pointer hover:bg-medical-surface transition-colors">
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 rounded border-medical-border text-medical-primary focus:ring-medical-primary/50"
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
                        <span className="text-[10px] font-bold text-medical-text">{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Severity */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-medical-text-muted uppercase tracking-wider ml-1">
                  重症度
                </label>
                <div className="flex rounded-lg overflow-hidden border border-medical-border">
                  {['なし', '軽度', '中等度', '重度'].map((level) => {
                    const currentSeverity = activeReportTab === "right" ? report.right_severity : report.left_severity;
                    const isSelected = currentSeverity === level;
                    return (
                      <button
                        key={level}
                        onClick={() => setReport({
                          ...report,
                          [activeReportTab === "right" ? "right_severity" : "left_severity"]: level
                        })}
                        className={clsx(
                          "flex-1 py-2 text-[10px] font-bold transition-all border-r border-medical-border last:border-r-0",
                          isSelected
                            ? "bg-medical-primary text-white"
                            : "bg-medical-bg text-medical-text-muted hover:bg-medical-surface"
                        )}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Judgment */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-medical-text-muted uppercase tracking-wider ml-1">
                  判定 ({activeReportTab === "right" ? "右眼" : "左眼"})
                </label>
                <div className="flex flex-col gap-2">
                  {[
                    { code: 'A', label: '正常' },
                    { code: 'B', label: '要経過観察' },
                    { code: 'C1', label: '要精密検査' },
                    { code: 'C2', label: '要治療' },
                    { code: 'D', label: '緊急' },
                  ].map((item) => {
                    const currentJudgment = activeReportTab === "right" ? report.right_judgment : report.left_judgment;
                    const isSelected = currentJudgment === item.code;
                    return (
                      <button
                        key={item.code}
                        onClick={() => setReport({
                          ...report,
                          [activeReportTab === "right" ? "right_judgment" : "left_judgment"]: item.code
                        })}
                        className={clsx(
                          "w-full text-left px-3 py-2 text-xs font-bold rounded-lg transition-all border",
                          isSelected
                            ? "bg-medical-primary text-white border-medical-primary shadow-sm"
                            : "bg-medical-bg text-medical-text border-medical-border hover:bg-medical-surface"
                        )}
                      >
                        {item.code}: {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Referral Checkbox */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-medical-border text-medical-primary focus:ring-medical-primary/50"
                  checked={report.recommend_referral}
                  onChange={(e) => setReport({ ...report, recommend_referral: e.target.checked })}
                />
                <span className="text-xs font-bold text-medical-text">紹介状が必要</span>
              </label>

              {/* Findings / Comments */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-medical-text-muted uppercase tracking-wider ml-1">
                    コメント ({activeReportTab === "right" ? "右眼" : "左眼"})
                  </label>
                  <select className="bg-medical-bg border border-medical-border rounded text-[10px] p-1 text-medical-text-muted">
                    <option>テンプレート</option>
                  </select>
                </div>
                <textarea
                  className="w-full bg-medical-bg border border-medical-border rounded-xl p-3 text-xs font-bold text-medical-text focus:outline-none focus:ring-2 focus:ring-medical-primary/50 transition-all min-h-[100px] placeholder:text-medical-text-muted/50"
                  placeholder="所見・コメントを記入..."
                  value={activeReportTab === "right" ? report.findings_right : report.findings_left}
                  onChange={(e) =>
                    setReport({
                      ...report,
                      [activeReportTab === "right" ? "findings_right" : "findings_left"]: e.target.value
                    })
                  }
                />
              </div>
            </motion.div>

            {/* Summary Footer */}
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-2 text-center">
                  <div className="text-[10px] font-bold text-red-400 mb-1">右眼 OD</div>
                  <div className="text-[10px] text-medical-text-muted">所見: {report.right_checklist.length}件</div>
                </div>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-2 text-center">
                  <div className="text-[10px] font-bold text-blue-400 mb-1">左眼 OS</div>
                  <div className="text-[10px] text-medical-text-muted">所見: {report.left_checklist.length}件</div>
                </div>
              </div>

              {/* Overall Judgment */}
              <div className="space-y-2 pt-4 border-t border-medical-border">
                <label className="text-[10px] font-bold text-medical-text-muted uppercase tracking-wider ml-1">
                  総合判定
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {['A', 'B', 'C1', 'C2', 'D'].map((code) => (
                    <button
                      key={code}
                      onClick={() => setReport({ ...report, judgment_code: code })}
                      className={clsx(
                        "py-2 text-[10px] font-bold rounded-lg transition-all border",
                        report.judgment_code === code
                          ? "bg-medical-primary text-white border-medical-primary shadow-md"
                          : "bg-medical-bg border-medical-border text-medical-text-muted hover:border-medical-primary/50"
                      )}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              {/* ICD-10 Code */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-medical-text-muted uppercase tracking-wider ml-1">
                  ICD-10
                </label>
                <select
                  className="w-full bg-medical-bg border border-medical-border rounded-xl p-2.5 text-xs font-bold text-medical-text focus:outline-none focus:ring-2 focus:ring-medical-primary/50 transition-all appearance-none"
                  value={report.icd10_code}
                  onChange={(e) => setReport({ ...report, icd10_code: e.target.value })}
                >
                  <option value="">-- ICD-10を選択 --</option>
                  <option value="H35.3">H35.3 加齢黄斑変性</option>
                  <option value="H36.0">H36.0 糖尿病網膜症</option>
                  <option value="H40.9">H40.9 緑内障</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-4 bg-medical-surface border-t border-medical-border space-y-3 shrink-0">
            {isQcMode ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQcModal(true)}
                  className="flex-1 py-3 bg-medical-bg border border-medical-border text-medical-text-muted hover:text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm"
                >
                  {t('viewer.reject')}
                </button>
                <button
                  onClick={() => handleQc("approve")}
                  className="flex-[2] py-3 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-medical-primary/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  {t('viewer.approve_complete')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={saveDraft}
                  disabled={isReadOnly || isSaving}
                  className="py-3 bg-medical-bg border border-medical-border text-medical-text-muted hover:text-medical-primary rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm"
                >
                  {isSaving ? "Saving..." : t('report.save_draft')}
                </button>
                <button
                  onClick={submitReport}
                  disabled={isReadOnly || isSaving}
                  className="py-3 bg-medical-primary hover:bg-medical-primary/90 disabled:bg-medical-surface disabled:text-medical-text-muted text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-medical-primary/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} />
                  {isSaving ? "Submitting..." : t('report.submit')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Text Annotation Modal */}
      {showTextAnnotationModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowTextAnnotationModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-sm bg-medical-surface rounded-[2.5rem] border border-medical-border shadow-2xl p-8 space-y-6"
          >
            <h3 className="text-lg font-bold text-medical-text">テキスト注釈</h3>
            <input
              type="text"
              className="w-full bg-medical-bg border border-medical-border rounded-xl p-4 text-xs font-bold text-medical-text focus:outline-none focus:ring-2 focus:ring-medical-primary/50"
              placeholder="注釈を入力..."
              value={textAnnotationValue}
              onChange={(e) => setTextAnnotationValue(e.target.value)}
            />
            <div className="flex gap-4">
              <button
                onClick={() => setShowTextAnnotationModal(false)}
                className="flex-1 py-4 bg-medical-bg hover:bg-medical-surface text-medical-text-muted rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  if (textAnnotationValue) {
                    setTextAnnotations([...textAnnotations, { x: textAnnotationPosition.x, y: textAnnotationPosition.y, text: textAnnotationValue }]);
                    setTextAnnotationValue("");
                    setShowTextAnnotationModal(false);
                  }
                }}
                className="flex-[2] py-4 bg-medical-primary hover:bg-medical-primary/90 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-medical-primary/20"
              >
                追加
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
                    <h3 className="text-lg font-bold text-medical-text">{t('viewer.reject_title')}</h3>
                    <p className="text-xs text-medical-text-muted">{t('viewer.reject_subtitle')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowQcModal(false)}
                  className="p-2 hover:bg-medical-surface rounded-xl transition-colors text-medical-text-muted"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                    {t('viewer.qc_checklist.title')}
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.keys(qcChecklist).map((key) => (
                      <label
                        key={key}
                        className="flex items-center gap-3 p-3 bg-medical-bg rounded-xl border border-medical-border cursor-pointer hover:bg-medical-surface transition-colors"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded bg-medical-bg border-medical-border text-red-500 focus:ring-red-500/50"
                          checked={qcChecklist[key as keyof typeof qcChecklist]}
                          onChange={(e) =>
                            setQcChecklist({
                              ...qcChecklist,
                              [key]: e.target.checked,
                            })
                          }
                        />
                        <span className="text-xs font-bold text-medical-text">
                          {t(`viewer.qc_checklist.${key}`)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                    {t('viewer.qc_feedback_label')}
                  </label>
                  <textarea
                    className="w-full bg-medical-bg border border-medical-border rounded-2xl p-4 text-xs font-bold text-medical-text focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all min-h-[120px] placeholder:text-medical-text-muted/50"
                    placeholder={t('viewer.reject_reason_placeholder')}
                    value={qcFeedback}
                    onChange={(e) => setQcFeedback(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowQcModal(false)}
                  className="flex-1 py-4 bg-medical-bg hover:bg-medical-surface text-medical-text-muted rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all"
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

      {/* Hidden Printable Report */}
      <PrintableReport ref={printRef} data={data} report={report} />
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
          "p-4 rounded-2xl transition-all duration-300",
          active
            ? "bg-medical-primary text-white shadow-lg shadow-medical-primary/20"
            : "bg-medical-bg text-medical-text-muted hover:bg-medical-surface hover:text-medical-primary",
        )}
      >
        <Icon size={24} strokeWidth={2.5} />
      </button>
      <div className="absolute left-full ml-4 px-3 py-1.5 bg-medical-surface text-medical-text text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all whitespace-nowrap z-50 shadow-xl border border-medical-border">
        {label}
      </div>
    </div>
  );
}
