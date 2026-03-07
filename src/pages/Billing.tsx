import { useEffect, useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  Download, 
  Calendar,
  DollarSign,
  Activity,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { useTranslation } from "../lib/i18n";
import { BillingData } from "../types";

export default function Billing() {
  const { t } = useTranslation();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/billing")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-medical-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-medical-text-muted">
            Loading Financial Data...
          </span>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1200px] mx-auto space-y-8 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-medical-text tracking-tight font-display">
            Financial Dashboard
          </h1>
          <p className="text-medical-text-muted mt-2 text-base font-medium flex items-center gap-2">
            <Calendar size={16} />
            Period: {data.period}
          </p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-6 py-3 bg-medical-surface border border-medical-border rounded-xl text-xs font-bold uppercase tracking-widest text-medical-text-muted hover:text-medical-primary transition-all shadow-sm">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-medical-surface rounded-3xl border border-medical-border p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-medical-primary/10 text-medical-primary flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-medical-text-muted uppercase tracking-widest">Total Revenue</p>
              <h3 className="text-2xl font-bold font-display">{formatCurrency(data.client_billing.total_revenue)}</h3>
            </div>
          </div>
          <div className="text-sm font-medium text-medical-success flex items-center gap-1">
            <TrendingUp size={16} /> +12.5% from last month
          </div>
        </div>

        <div className="bg-medical-surface rounded-3xl border border-medical-border p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-medical-warning/10 text-medical-warning flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-medical-text-muted uppercase tracking-widest">Total Payouts</p>
              <h3 className="text-2xl font-bold font-display">{formatCurrency(data.physician_payouts.total_payout)}</h3>
            </div>
          </div>
          <div className="text-sm font-medium text-medical-text-muted">
            To {data.physician_payouts.details.length} physicians
          </div>
        </div>

        <div className="bg-medical-surface rounded-3xl border border-medical-border p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-medical-success/10 text-medical-success flex items-center justify-center">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-medical-text-muted uppercase tracking-widest">Gross Margin</p>
              <h3 className="text-2xl font-bold font-display">{data.financial_summary.margin_rate.toFixed(1)}%</h3>
            </div>
          </div>
          <div className="text-sm font-medium text-medical-text-muted">
            {formatCurrency(data.financial_summary.gross_margin)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Client Billing Breakdown */}
        <div className="bg-medical-surface rounded-[2.5rem] border border-medical-border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-medical-border bg-medical-bg/50 flex items-center gap-4">
            <div className="p-3 bg-medical-primary/10 text-medical-primary rounded-2xl">
              <Building2 size={20} />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-medical-text-muted">
              Client Billing Breakdown
            </h2>
          </div>
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-medical-border">
              <div>
                <p className="text-sm font-bold text-medical-text">Base Screenings</p>
                <p className="text-xs text-medical-text-muted">{data.client_billing.total_count} cases (Volume Tiered)</p>
              </div>
              <span className="font-mono font-bold">{formatCurrency(data.client_billing.base_revenue)}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-medical-border">
              <div>
                <p className="text-sm font-bold text-medical-text flex items-center gap-2">
                  <AlertCircle size={14} className="text-medical-error" /> Urgent Options
                </p>
                <p className="text-xs text-medical-text-muted">{data.client_billing.urgent_count} cases (+¥500/case)</p>
              </div>
              <span className="font-mono font-bold">{formatCurrency(data.client_billing.urgent_revenue)}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-medical-border">
              <div>
                <p className="text-sm font-bold text-medical-text flex items-center gap-2">
                  <Activity size={14} className="text-medical-primary" /> AI Pre-analysis
                </p>
                <p className="text-xs text-medical-text-muted">{data.client_billing.ai_count} cases (+¥200/case)</p>
              </div>
              <span className="font-mono font-bold">{formatCurrency(data.client_billing.ai_revenue)}</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-sm font-bold uppercase tracking-widest text-medical-text-muted">Total Billed</span>
              <span className="text-xl font-bold text-medical-primary">{formatCurrency(data.client_billing.total_revenue)}</span>
            </div>
          </div>
        </div>

        {/* Physician Payouts */}
        <div className="bg-medical-surface rounded-[2.5rem] border border-medical-border shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-medical-border bg-medical-bg/50 flex items-center gap-4">
            <div className="p-3 bg-medical-warning/10 text-medical-warning rounded-2xl">
              <Users size={20} />
            </div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-medical-text-muted">
              Physician Payouts
            </h2>
          </div>
          <div className="p-0 flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-medical-border bg-medical-bg/30">
                  <th className="px-6 py-4 text-[10px] font-bold text-medical-text-muted uppercase tracking-widest">Physician</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-medical-text-muted uppercase tracking-widest text-right">Cases (Night)</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-medical-text-muted uppercase tracking-widest text-right">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-medical-border">
                {data.physician_payouts.details.map((p) => (
                  <tr key={p.id} className="hover:bg-medical-bg/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-medical-text">{p.name}</div>
                      <div className="text-[10px] text-medical-text-muted uppercase tracking-wider">{p.rank} (¥{p.base_rate}/case)</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-bold text-sm text-medical-text">{p.count}</div>
                      <div className="text-[10px] text-medical-warning uppercase tracking-wider">{p.night_count} night</div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-medical-text">
                      {formatCurrency(p.payout)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
