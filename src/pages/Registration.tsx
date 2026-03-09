import React, { useState, useEffect, useCallback } from "react";
import {
  Upload,
  FileImage,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Activity,
  FileText,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { useTranslation } from "../lib/i18n";
import { useDropzone, Accept } from "react-dropzone";
import { Organization } from "../types";

export default function Registration() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    examinee_number: "",
    name: "",
    gender: "male",
    birth_date: "",
    screening_date: new Date().toISOString().split("T")[0],
    urgency_flag: false,
    chief_complaint: "",
    organization_id: "",
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    has_diabetes: false,
    has_hypertension: false,
    device_type: "fundus",
    manufacturer: "",
    model: "",
    is_batch: false,
    right_eye_image: null as File | null,
    left_eye_image: null as File | null,
    batch_csv: null as File | null,
    batch_zip: null as File | null,
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/organizations")
      .then((res) => res.json())
      .then((data) => {
        setOrganizations(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, organization_id: data[0].id }));
        }
      });
  }, []);

  const onDropRight = useCallback((acceptedFiles: File[]) => {
    setFormData((prev) => ({ ...prev, right_eye_image: acceptedFiles[0] }));
  }, []);

  const onDropLeft = useCallback((acceptedFiles: File[]) => {
    setFormData((prev) => ({ ...prev, left_eye_image: acceptedFiles[0] }));
  }, []);

  const onDropBatchCsv = useCallback((acceptedFiles: File[]) => {
    setFormData((prev) => ({ ...prev, batch_csv: acceptedFiles[0] }));
  }, []);

  const onDropBatchZip = useCallback((acceptedFiles: File[]) => {
    setFormData((prev) => ({ ...prev, batch_zip: acceptedFiles[0] }));
  }, []);

  const { getRootProps: getRootPropsRight, getInputProps: getInputPropsRight } = useDropzone({ onDrop: onDropRight, accept: {'image/*': []} } as any);
  const { getRootProps: getRootPropsLeft, getInputProps: getInputPropsLeft } = useDropzone({ onDrop: onDropLeft, accept: {'image/*': []} } as any);
  const { getRootProps: getRootPropsBatchCsv, getInputProps: getInputPropsBatchCsv } = useDropzone({ onDrop: onDropBatchCsv, accept: {'text/csv': ['.csv']} } as any);
  const { getRootProps: getRootPropsBatchZip, getInputProps: getInputPropsBatchZip } = useDropzone({ onDrop: onDropBatchZip, accept: {'application/zip': ['.zip']} } as any);

  const handleBatchSubmit = async () => {
    if (!formData.batch_csv) {
      alert("Please upload a CSV file.");
      return;
    }

    setIsSubmitting(true);
    const body = new FormData();
    body.append("csv", formData.batch_csv);
    if (formData.batch_zip) {
      body.append("zip", formData.batch_zip);
    }

    try {
      const res = await fetch("/api/screenings/batch", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully processed ${data.count} cases.`);
        navigate("/");
      } else {
        alert("Batch processing failed: " + data.error);
      }
    } catch (error) {
      console.error("Batch registration failed", error);
      alert("Batch registration failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/screenings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        navigate("/");
      }
    } catch (error) {
      console.error("Registration failed", error);
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-12 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-medical-text tracking-tight font-display">
            {t('register.title')}
          </h1>
          <p className="text-medical-text-muted mt-2 text-lg font-medium">
            {t('register.subtitle')}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/organizer")}
            className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-medical-border bg-medical-surface text-medical-text-muted hover:text-medical-primary transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
          >
            <FileImage size={16} />
            Image Organizer
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_batch: !formData.is_batch })}
            className={clsx(
              "flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all font-bold text-xs uppercase tracking-widest",
              formData.is_batch 
                ? "bg-medical-primary text-white border-medical-primary shadow-lg shadow-medical-primary/20" 
                : "bg-medical-surface text-medical-text-muted border-medical-border shadow-sm hover:bg-medical-bg"
            )}
          >
            <Upload size={16} />
            {t('register.batch_upload')}
          </button>
          <div className="flex items-center gap-3 bg-medical-surface px-6 py-3 rounded-2xl border border-medical-border shadow-sm">
            <div className="w-3 h-3 bg-medical-primary rounded-full animate-pulse" />
            <span className="text-sm font-bold text-medical-text uppercase tracking-widest">
              {formData.is_batch ? "Batch Entry" : "New Case Entry"}
            </span>
          </div>
        </div>
      </div>

      {formData.is_batch ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-medical-surface rounded-[2.5rem] border border-medical-border p-12 text-center shadow-sm"
        >
          <div className="w-24 h-24 bg-medical-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={40} className="text-medical-primary" />
          </div>
          <h3 className="text-2xl font-bold text-medical-text font-display mb-4">Batch Registration</h3>
          <p className="text-medical-text-muted font-medium mb-8 max-w-md mx-auto">
            Upload a CSV file and an optional ZIP file of images for bulk registration.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div {...getRootPropsBatchCsv()} className={clsx("border-2 border-dashed border-medical-border rounded-3xl p-8 hover:bg-medical-bg transition-all cursor-pointer group", formData.batch_csv && "border-medical-primary bg-medical-primary/5")}>
              <input {...getInputPropsBatchCsv()} />
              <FileText size={32} className={clsx("mx-auto mb-4 transition-colors", formData.batch_csv ? "text-medical-primary" : "text-medical-text-muted group-hover:text-medical-primary")} />
              <p className="text-xs font-bold text-medical-text uppercase tracking-widest mb-1">
                {formData.batch_csv ? formData.batch_csv.name : "Drop CSV File"}
              </p>
              <p className="text-[10px] text-medical-text-muted">Patient Data</p>
            </div>

            <div {...getRootPropsBatchZip()} className={clsx("border-2 border-dashed border-medical-border rounded-3xl p-8 hover:bg-medical-bg transition-all cursor-pointer group", formData.batch_zip && "border-medical-primary bg-medical-primary/5")}>
              <input {...getInputPropsBatchZip()} />
              <FileImage size={32} className={clsx("mx-auto mb-4 transition-colors", formData.batch_zip ? "text-medical-primary" : "text-medical-text-muted group-hover:text-medical-primary")} />
              <p className="text-xs font-bold text-medical-text uppercase tracking-widest mb-1">
                {formData.batch_zip ? formData.batch_zip.name : "Drop ZIP File"}
              </p>
              <p className="text-[10px] text-medical-text-muted">Images (Optional)</p>
            </div>
          </div>

          <div className="mt-12 flex justify-center gap-4">
            <button 
              type="button"
              onClick={() => {
                window.location.href = '/download-template';
              }}
              className="px-8 py-4 bg-medical-bg border border-medical-border text-medical-text-muted hover:text-medical-primary rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-sm"
            >
              Download Template
            </button>
            <button 
              type="button"
              disabled={isSubmitting || !formData.batch_csv}
              onClick={handleBatchSubmit}
              className="px-8 py-4 bg-medical-primary hover:bg-medical-primary/90 disabled:bg-medical-border disabled:text-medical-text-muted text-white rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-medical-primary/20 flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              {isSubmitting ? "Processing..." : "Process Batch"}
            </button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Patient & Clinical Info */}
          <div className="lg:col-span-2 space-y-10">
            {/* Patient Info Section */}
            <div className="bg-medical-surface rounded-[2.5rem] border border-medical-border shadow-sm overflow-hidden medical-shadow-lg">
              <div className="p-8 border-b border-medical-border bg-medical-bg/50 flex items-center gap-4">
                <div className="p-3 bg-medical-primary/10 text-medical-primary rounded-2xl">
                  <Activity size={20} />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-medical-text-muted">
                  {t('register.patient_info')}
                </h2>
              </div>

              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                    {t('table.organization')}
                  </label>
                  <select
                    required
                    className="w-full px-5 py-4 bg-medical-bg border border-medical-border rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all font-bold text-medical-text appearance-none"
                    value={formData.organization_id}
                    onChange={(e) =>
                      setFormData({ ...formData, organization_id: e.target.value })
                    }
                  >
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                    {t('register.device_type')}
                  </label>
                  <select
                    className="w-full px-5 py-4 bg-medical-bg border border-medical-border rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all font-bold text-medical-text appearance-none"
                    value={formData.device_type}
                    onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                  >
                    <option value="fundus">{t('register.device.fundus')}</option>
                    <option value="oct">{t('register.device.oct')}</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                    {t('register.manufacturer')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-medical-bg border border-medical-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g. Topcon"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                    {t('register.model')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-medical-bg border border-medical-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. TRC-NW8"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                    {t('table.patient_id')}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-medical-bg border border-medical-border rounded-2xl text-sm font-mono font-bold focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all"
                    value={formData.examinee_number}
                    onChange={(e) =>
                      setFormData({ ...formData, examinee_number: e.target.value })
                    }
                    placeholder="PT-0000-000"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                    {t('table.name')}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-medical-bg border border-medical-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Full Name"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                    {t('table.date')} (DOB)
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-5 py-4 bg-medical-bg border border-medical-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all"
                    value={formData.birth_date}
                    onChange={(e) =>
                      setFormData({ ...formData, birth_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                    Gender Selection
                  </label>
                  <div className="flex gap-4 p-1 bg-medical-surface rounded-2xl border border-medical-border">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: "male" })}
                      className={clsx(
                        "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                        formData.gender === "male"
                          ? "bg-medical-bg text-medical-primary shadow-sm"
                          : "text-medical-text-muted hover:text-medical-text",
                      )}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: "female" })}
                      className={clsx(
                        "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                        formData.gender === "female"
                          ? "bg-medical-bg text-medical-primary shadow-sm"
                          : "text-medical-text-muted hover:text-medical-text",
                      )}
                    >
                      Female
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Data Section */}
            <div className="bg-medical-surface rounded-[2.5rem] border border-medical-border shadow-sm overflow-hidden medical-shadow-lg">
              <div className="p-8 border-b border-medical-border bg-medical-bg/50 flex items-center gap-4">
                <div className="p-3 bg-medical-secondary/10 text-medical-secondary rounded-2xl">
                  <FileText size={20} />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-medical-text-muted">
                  {t('register.clinical_data')}
                </h2>
              </div>

              <div className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                      {t('register.bp')} (Systolic)
                    </label>
                    <input
                      type="number"
                      className="w-full px-5 py-4 bg-medical-bg border border-medical-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all"
                      value={formData.blood_pressure_systolic}
                      onChange={(e) =>
                        setFormData({ ...formData, blood_pressure_systolic: e.target.value })
                      }
                      placeholder="120"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                      {t('register.bp')} (Diastolic)
                    </label>
                    <input
                      type="number"
                      className="w-full px-5 py-4 bg-medical-bg border border-medical-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all"
                      value={formData.blood_pressure_diastolic}
                      onChange={(e) =>
                        setFormData({ ...formData, blood_pressure_diastolic: e.target.value })
                      }
                      placeholder="80"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <label className={clsx(
                    "flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all cursor-pointer",
                    formData.has_diabetes 
                      ? "bg-medical-primary/5 border-medical-primary/30" 
                      : "bg-medical-bg border-medical-border hover:border-medical-border/50"
                  )}>
                    <input
                      type="checkbox"
                      checked={formData.has_diabetes}
                      onChange={(e) =>
                        setFormData({ ...formData, has_diabetes: e.target.checked })
                      }
                      className="w-6 h-6 rounded-lg border-medical-border text-medical-primary focus:ring-medical-primary/20"
                    />
                    <span className={clsx(
                      "text-sm font-bold uppercase tracking-widest",
                      formData.has_diabetes ? "text-medical-primary" : "text-medical-text-muted"
                    )}>
                      {t('register.diabetes')}
                    </span>
                  </label>

                  <label className={clsx(
                    "flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all cursor-pointer",
                    formData.has_hypertension 
                      ? "bg-medical-primary/5 border-medical-primary/30" 
                      : "bg-medical-bg border-medical-border hover:border-medical-border/50"
                  )}>
                    <input
                      type="checkbox"
                      checked={formData.has_hypertension}
                      onChange={(e) =>
                        setFormData({ ...formData, has_hypertension: e.target.checked })
                      }
                      className="w-6 h-6 rounded-lg border-medical-border text-medical-primary focus:ring-medical-primary/20"
                    />
                    <span className={clsx(
                      "text-sm font-bold uppercase tracking-widest",
                      formData.has_hypertension ? "text-medical-primary" : "text-medical-text-muted"
                    )}>
                      {t('register.hypertension')}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Screening & Images */}
          <div className="space-y-10">
            {/* Screening Details */}
            <div className="bg-medical-surface rounded-[2.5rem] border border-medical-border shadow-sm overflow-hidden medical-shadow-lg p-8 space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                  {t('table.date')} (Screening)
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-5 py-4 bg-medical-bg border border-medical-border rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all"
                  value={formData.screening_date}
                  onChange={(e) =>
                    setFormData({ ...formData, screening_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                  Urgency Status
                </label>
                <label className={clsx(
                  "flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all cursor-pointer",
                  formData.urgency_flag 
                    ? "bg-medical-error/10 border-medical-error/20" 
                    : "bg-medical-bg border-medical-border hover:border-medical-border/50"
                )}>
                  <input
                    type="checkbox"
                    className="w-6 h-6 rounded-lg border-medical-error text-medical-error focus:ring-medical-error/20"
                    checked={formData.urgency_flag}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        urgency_flag: e.target.checked,
                      })
                    }
                  />
                  <span className={clsx(
                    "text-xs font-bold uppercase tracking-[0.15em]",
                    formData.urgency_flag ? "text-medical-error" : "text-medical-text-muted"
                  )}>
                    Urgent Reading
                  </span>
                </label>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                  Chief Complaint
                </label>
                <textarea
                  rows={4}
                  className="w-full px-5 py-4 bg-medical-bg border border-medical-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all resize-none placeholder:text-medical-text-muted"
                  value={formData.chief_complaint}
                  onChange={(e) =>
                    setFormData({ ...formData, chief_complaint: e.target.value })
                  }
                  placeholder="Describe symptoms..."
                />
              </div>
            </div>

            {/* Fundus Images */}
            <div className="bg-medical-surface rounded-[2.5rem] border border-medical-border shadow-sm overflow-hidden medical-shadow-lg p-8 space-y-6">
              <h3 className="text-[10px] font-bold text-medical-text-muted uppercase tracking-widest ml-1">
                Fundus Images
              </h3>
              <div className="space-y-4">
                <div {...getRootPropsRight()} className={clsx("border-2 border-dashed border-medical-border rounded-[2rem] p-8 flex flex-col items-center justify-center text-center hover:bg-medical-bg transition-all cursor-pointer group hover:border-medical-primary/30", formData.right_eye_image && "border-medical-primary bg-medical-primary/5")}>
                  <input {...getInputPropsRight()} />
                  <div className={clsx("p-4 rounded-full mb-3 transition-transform", formData.right_eye_image ? "bg-medical-primary text-white" : "bg-medical-primary/10 text-medical-primary")}>
                    {formData.right_eye_image ? <CheckCircle2 size={24} /> : <Upload size={24} />}
                  </div>
                  <p className="text-xs font-bold text-medical-text uppercase tracking-widest">
                    {formData.right_eye_image ? formData.right_eye_image.name : "Right Eye (OD)"}
                  </p>
                </div>
                <div {...getRootPropsLeft()} className={clsx("border-2 border-dashed border-medical-border rounded-[2rem] p-8 flex flex-col items-center justify-center text-center hover:bg-medical-bg transition-all cursor-pointer group hover:border-medical-primary/30", formData.left_eye_image && "border-medical-primary bg-medical-primary/5")}>
                  <input {...getInputPropsLeft()} />
                  <div className={clsx("p-4 rounded-full mb-3 transition-transform", formData.left_eye_image ? "bg-medical-primary text-white" : "bg-medical-primary/10 text-medical-primary")}>
                    {formData.left_eye_image ? <CheckCircle2 size={24} /> : <Upload size={24} />}
                  </div>
                  <p className="text-xs font-bold text-medical-text uppercase tracking-widest">
                    {formData.left_eye_image ? formData.left_eye_image.name : "Left Eye (OS)"}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-6 bg-medical-primary hover:bg-medical-primary/90 disabled:bg-medical-border disabled:text-medical-text-muted text-white rounded-[2rem] text-sm font-bold uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-4"
            >
              {isSubmitting ? "Processing..." : t('action.submit')}
              {!isSubmitting && <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </form>
      )}
    </motion.div>
  );
}
