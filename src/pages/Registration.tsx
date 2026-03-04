import React, { useState, useEffect } from "react";
import {
  Upload,
  FileImage,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Activity,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { useTranslation } from "../lib/i18n";

interface Organization {
  id: string;
  name: string;
}

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
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight font-display">
            {t('register.title')}
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">
            {t('register.subtitle')}
          </p>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, is_batch: !formData.is_batch })}
            className={clsx(
              "flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all font-bold text-xs uppercase tracking-widest",
              formData.is_batch 
                ? "bg-medical-primary text-white border-medical-primary shadow-lg shadow-medical-primary/20" 
                : "bg-white text-slate-700 border-slate-200 shadow-sm hover:bg-slate-50"
            )}
          >
            <Upload size={16} />
            {t('register.batch_upload')}
          </button>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-3 h-3 bg-medical-primary rounded-full animate-pulse" />
            <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">
              New Case Entry
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Patient & Clinical Info */}
          <div className="lg:col-span-2 space-y-10">
            {/* Patient Info Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden medical-shadow-lg">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                <div className="p-3 bg-medical-primary/10 text-medical-primary rounded-2xl">
                  <Activity size={20} />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                  {t('register.patient_info')}
                </h2>
              </div>

              <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    {t('table.organization')}
                  </label>
                  <select
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all font-bold text-slate-900 appearance-none"
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
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    {t('register.device_type')}
                  </label>
                  <select
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all font-bold text-slate-900 appearance-none"
                    value={formData.device_type}
                    onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                  >
                    <option value="fundus">{t('register.device.fundus')}</option>
                    <option value="oct">{t('register.device.oct')}</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    {t('register.manufacturer')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g. Topcon"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    {t('register.model')}
                  </label>
                  <input
                    type="text"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. TRC-NW8"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    {t('table.patient_id')}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono font-bold focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all"
                    value={formData.examinee_number}
                    onChange={(e) =>
                      setFormData({ ...formData, examinee_number: e.target.value })
                    }
                    placeholder="PT-0000-000"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    {t('table.name')}
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Full Name"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    {t('table.date')} (DOB)
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all"
                    value={formData.birth_date}
                    onChange={(e) =>
                      setFormData({ ...formData, birth_date: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                    Gender Selection
                  </label>
                  <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, gender: "male" })}
                      className={clsx(
                        "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                        formData.gender === "male"
                          ? "bg-white text-medical-primary shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
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
                          ? "bg-white text-medical-primary shadow-sm"
                          : "text-slate-500 hover:text-slate-700",
                      )}
                    >
                      Female
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Data Section */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden medical-shadow-lg">
              <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                <div className="p-3 bg-medical-secondary/10 text-medical-secondary rounded-2xl">
                  <FileText size={20} />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                  {t('register.clinical_data')}
                </h2>
              </div>

              <div className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      {t('register.bp')} (Systolic)
                    </label>
                    <input
                      type="number"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all"
                      value={formData.blood_pressure_systolic}
                      onChange={(e) =>
                        setFormData({ ...formData, blood_pressure_systolic: e.target.value })
                      }
                      placeholder="120"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      {t('register.bp')} (Diastolic)
                    </label>
                    <input
                      type="number"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all"
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
                      : "bg-slate-50 border-slate-100 hover:border-slate-200"
                  )}>
                    <input
                      type="checkbox"
                      checked={formData.has_diabetes}
                      onChange={(e) =>
                        setFormData({ ...formData, has_diabetes: e.target.checked })
                      }
                      className="w-6 h-6 rounded-lg border-slate-300 text-medical-primary focus:ring-medical-primary/20"
                    />
                    <span className={clsx(
                      "text-sm font-bold uppercase tracking-widest",
                      formData.has_diabetes ? "text-medical-primary" : "text-slate-500"
                    )}>
                      {t('register.diabetes')}
                    </span>
                  </label>

                  <label className={clsx(
                    "flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all cursor-pointer",
                    formData.has_hypertension 
                      ? "bg-medical-primary/5 border-medical-primary/30" 
                      : "bg-slate-50 border-slate-100 hover:border-slate-200"
                  )}>
                    <input
                      type="checkbox"
                      checked={formData.has_hypertension}
                      onChange={(e) =>
                        setFormData({ ...formData, has_hypertension: e.target.checked })
                      }
                      className="w-6 h-6 rounded-lg border-slate-300 text-medical-primary focus:ring-medical-primary/20"
                    />
                    <span className={clsx(
                      "text-sm font-bold uppercase tracking-widest",
                      formData.has_hypertension ? "text-medical-primary" : "text-slate-500"
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
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden medical-shadow-lg p-8 space-y-8">
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  {t('table.date')} (Screening)
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all"
                  value={formData.screening_date}
                  onChange={(e) =>
                    setFormData({ ...formData, screening_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Urgency Status
                </label>
                <label className={clsx(
                  "flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all cursor-pointer",
                  formData.urgency_flag 
                    ? "bg-red-50 border-red-200" 
                    : "bg-slate-50 border-slate-100 hover:border-slate-200"
                )}>
                  <input
                    type="checkbox"
                    className="w-6 h-6 rounded-lg border-red-300 text-red-600 focus:ring-red-500/20"
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
                    formData.urgency_flag ? "text-red-700" : "text-slate-500"
                  )}>
                    Urgent Reading
                  </span>
                </label>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Chief Complaint
                </label>
                <textarea
                  rows={4}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-medical-primary/10 focus:border-medical-primary transition-all resize-none placeholder:text-slate-400"
                  value={formData.chief_complaint}
                  onChange={(e) =>
                    setFormData({ ...formData, chief_complaint: e.target.value })
                  }
                  placeholder="Describe symptoms..."
                />
              </div>
            </div>

            {/* Fundus Images */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden medical-shadow-lg p-8 space-y-6">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Fundus Images
              </h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-all cursor-pointer group hover:border-medical-primary/30">
                  <div className="bg-medical-primary/10 text-medical-primary p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Upload size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Right Eye (OD)
                  </p>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-all cursor-pointer group hover:border-medical-primary/30">
                  <div className="bg-medical-primary/10 text-medical-primary p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                    <Upload size={24} />
                  </div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Left Eye (OS)
                  </p>
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-amber-700 leading-relaxed">
                  Placeholder images will be attached automatically for this demonstration.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-6 bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-[2rem] text-sm font-bold uppercase tracking-[0.2em] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-4"
            >
              {isSubmitting ? "Processing..." : t('action.submit')}
              {!isSubmitting && <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
