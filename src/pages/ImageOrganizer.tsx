import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Download, Trash2, ArrowUpDown, FileImage } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  patientId: string;
  side: "R" | "L" | null;
  date: Date;
}

export default function ImageOrganizer() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [sortOrder, setSortOrder] = useState<"date" | "name">("date");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages: ImageFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      preview: URL.createObjectURL(file),
      patientId: "",
      side: null,
      date: new Date(file.lastModified),
    }));
    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png'] } } as any);

  const updateImage = (id: string, field: keyof ImageFile, value: any) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, [field]: value } : img))
    );
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    for (const img of images) {
      if (img.patientId && img.side) {
        const fileName = `${img.patientId}_${img.side}.jpg`;
        zip.file(fileName, img.file);
      }
    }
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "fundus_images.zip");
  };

  const sortedImages = [...images].sort((a, b) => {
    if (sortOrder === "date") return a.date.getTime() - b.date.getTime();
    return a.file.name.localeCompare(b.file.name);
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-medical-text font-display">Image Organizer</h1>
        <div className="flex gap-4">
          <button onClick={() => setSortOrder(prev => prev === "date" ? "name" : "date")} className="flex items-center gap-2 px-4 py-2 bg-medical-surface border border-medical-border rounded-xl text-sm font-bold">
            <ArrowUpDown size={16} /> Sort by {sortOrder}
          </button>
          <button onClick={downloadZip} disabled={images.length === 0} className="flex items-center gap-2 px-6 py-2 bg-medical-primary text-white rounded-xl text-sm font-bold disabled:opacity-50">
            <Download size={16} /> Download ZIP
          </button>
        </div>
      </div>

      <div {...getRootProps()} className="border-2 border-dashed border-medical-border rounded-3xl p-12 text-center cursor-pointer hover:bg-medical-bg transition-all">
        <input {...getInputProps()} />
        <Upload size={40} className="mx-auto text-medical-text-muted mb-4" />
        <p className="text-lg font-bold text-medical-text">Drag & Drop Images</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedImages.map((img) => (
          <div key={img.id} className="bg-medical-surface p-4 rounded-2xl border border-medical-border shadow-sm space-y-4">
            <img src={img.preview} alt="preview" className="w-full h-48 object-cover rounded-xl" />
            <div className="space-y-2">
              <input 
                type="text" 
                placeholder="Patient ID" 
                value={img.patientId} 
                onChange={(e) => updateImage(img.id, "patientId", e.target.value)}
                className="w-full px-3 py-2 bg-medical-bg border border-medical-border rounded-lg text-sm"
              />
              <div className="flex gap-2">
                <button onClick={() => updateImage(img.id, "side", "R")} className={clsx("flex-1 py-2 rounded-lg text-xs font-bold", img.side === "R" ? "bg-medical-primary text-white" : "bg-medical-bg border")}>R</button>
                <button onClick={() => updateImage(img.id, "side", "L")} className={clsx("flex-1 py-2 rounded-lg text-xs font-bold", img.side === "L" ? "bg-medical-primary text-white" : "bg-medical-bg border")}>L</button>
              </div>
            </div>
            <button onClick={() => removeImage(img.id)} className="w-full text-medical-error text-xs font-bold flex items-center justify-center gap-2">
              <Trash2 size={14} /> Remove
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
