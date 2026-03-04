import { useEffect, useState } from "react";
import {
  Download,
  TrendingUp,
  Users,
  FileText,
  DollarSign,
  Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "../lib/i18n";

interface BillingData {
  period: string;
  client_billing: {
    total_count: number;
    base_revenue: number;
    urgent_count: number;
    urgent_revenue: number;
    total_revenue: number;
  };
  physician_payouts: {
    total_payout: number;
    details: {
      id: string;
      name: string;
      rank: string;
      count: number;
      unitPrice: number;
      payout: number;
    }[];
  };
  financial_summary: {
    gross_margin: number;
    margin_rate: number;
  };
}

export default function Billing() {
  const { t } = useTranslation();
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/billing")
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      });
  }, []);

  if (loading || !data)
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-[#141414]/50 font-mono text-xs uppercase tracking-widest">
          Calculating Financials...
        </div>
      </div>
    );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1600px] mx-auto space-y-8"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#141414] tracking-tight font-sans">
            {t('nav.billing')}
          </h1>
          <p className="text-[#141414]/60 mt-1 text-sm">
            Period: {data.period} • {t('dashboard.subtitle')}
          </p>
        </div>
        <button className="bg-[#141414] hover:bg-black text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2">
          <Download size={16} />
          {t('billing.export')}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-[#141414]/10 p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#141414]/50 uppercase tracking-wider">
                {t('billing.total_revenue')}
              </p>
              <h3 className="text-3xl font-bold text-[#141414] tracking-tight">
                {formatCurrency(data.client_billing.total_revenue)}
              </h3>
            </div>
          </div>
          <div className="text-sm text-[#141414]/60 flex justify-between border-t border-[#141414]/10 pt-4 font-mono">
            <span>Volume: {data.client_billing.total_count} cases</span>
            <span>Urgent: {data.client_billing.urgent_count} cases</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-[#141414]/10 p-6 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#141414]/50 uppercase tracking-wider">
                {t('billing.total_payout')}
              </p>
              <h3 className="text-3xl font-bold text-[#141414] tracking-tight">
                {formatCurrency(data.physician_payouts.total_payout)}
              </h3>
            </div>
          </div>
          <div className="text-sm text-[#141414]/60 flex justify-between border-t border-[#141414]/10 pt-4 font-mono">
            <span>
              Active Physicians: {data.physician_payouts.details.length}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#141414] rounded-2xl border border-[#141414] p-6 shadow-xl text-white relative overflow-hidden"
        >
          <div className="absolute -right-4 -top-4 opacity-10">
            <Activity size={120} />
          </div>
          <div className="flex items-center gap-4 mb-4 relative z-10">
            <div className="bg-indigo-500/20 p-3 rounded-xl text-indigo-400 border border-indigo-500/30">
              <DollarSign size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                {t('billing.gross_margin')}
              </p>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {formatCurrency(data.financial_summary.gross_margin)}
              </h3>
            </div>
          </div>
          <div className="text-sm text-white/60 flex justify-between border-t border-white/10 pt-4 font-mono relative z-10">
            <span>
              Margin Rate: {data.financial_summary.margin_rate.toFixed(1)}%
            </span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Client Billing Details */}
        <div className="bg-white rounded-2xl border border-[#141414]/10 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#141414]/10 flex items-center gap-3 bg-slate-50/50">
            <FileText className="text-[#141414]/40" size={20} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]/70">
              {t('billing.client_billing')}
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center py-3 border-b border-[#141414]/5">
                <span className="text-[#141414]/70 font-medium">
                  Base Reading Fees (Volume Tiered)
                </span>
                <span className="font-mono font-medium text-[#141414]">
                  {formatCurrency(data.client_billing.base_revenue)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#141414]/5">
                <span className="text-[#141414]/70 font-medium">
                  Urgent Processing Fees (+¥500/case)
                </span>
                <span className="font-mono font-medium text-[#141414]">
                  {formatCurrency(data.client_billing.urgent_revenue)}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#141414]/10">
              <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <span className="font-bold text-indigo-900 uppercase tracking-wider text-sm">
                  Total Invoice Amount
                </span>
                <span className="text-2xl font-bold text-indigo-600 tracking-tight">
                  {formatCurrency(data.client_billing.total_revenue)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Physician Payout Details */}
        <div className="bg-white rounded-2xl border border-[#141414]/10 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#141414]/10 flex items-center gap-3 bg-slate-50/50">
            <Users className="text-[#141414]/40" size={20} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]/70">
              {t('billing.physician_payouts')}
            </h2>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[#141414]/50 font-semibold text-xs uppercase tracking-wider border-b border-[#141414]/10">
                <tr>
                  <th className="px-6 py-4">{t('table.assigned_to')}</th>
                  <th className="px-6 py-4">{t('settings.role')}</th>
                  <th className="px-6 py-4 text-right">Cases</th>
                  <th className="px-6 py-4 text-right">Rate</th>
                  <th className="px-6 py-4 text-right">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]/5">
                {data.physician_payouts.details.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-[#141414]">
                      {p.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-600">
                        {p.rank}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-[#141414]/60">
                      {p.count}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-[#141414]/60">
                      {formatCurrency(p.unitPrice)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-medium text-[#141414]">
                      {formatCurrency(p.payout)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-[#141414]/10">
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-right font-bold text-[#141414]/70 uppercase tracking-wider text-xs"
                  >
                    Total Payouts
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-[#141414] font-mono text-lg">
                    {formatCurrency(data.physician_payouts.total_payout)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
