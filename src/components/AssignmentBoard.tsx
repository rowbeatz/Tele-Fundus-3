import { useState } from "react";
import { motion } from "framer-motion";
import { User, Activity } from "lucide-react";
import { clsx } from "clsx";
import { ScreeningData, Physician } from "../types";

interface AssignmentBoardProps {
  screenings: ScreeningData[];
  physicians: Physician[];
  onAssign: (screeningId: string, physicianId: string) => void;
}

export default function AssignmentBoard({ screenings, physicians, onAssign }: AssignmentBoardProps) {
  const unassigned = screenings.filter(s => s.status === 'submitted' || s.status === 'registered');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Unassigned Column */}
      <div className="bg-medical-surface rounded-2xl border border-medical-border p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-medical-text mb-4 flex items-center gap-2">
          <Activity size={16} className="text-medical-warning" />
          Unassigned ({unassigned.length})
        </h3>
        <div className="space-y-3">
          {unassigned.map(s => (
            <div key={s.id} className="p-4 bg-medical-bg rounded-xl border border-medical-border">
              <p className="font-bold text-medical-text mb-3">{s.patient_name}</p>
              <select
                className="w-full bg-medical-surface border border-medical-border rounded-lg text-xs font-bold py-2 px-3"
                onChange={(e) => onAssign(s.id, e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>Assign Physician</option>
                {physicians.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Physician Columns */}
      {physicians.map(p => (
        <div key={p.id} className="bg-medical-surface rounded-2xl border border-medical-border p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-medical-text mb-4 flex items-center gap-2">
            <User size={16} className="text-medical-primary" />
            {p.name}
          </h3>
          <div className="space-y-3">
            {screenings.filter(s => s.physician_id === p.id && s.status === 'assigned').map(s => (
              <div key={s.id} className="p-4 bg-medical-primary/5 rounded-xl border border-medical-primary/20">
                <p className="font-bold text-medical-primary">{s.patient_name}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
