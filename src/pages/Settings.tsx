import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Save, Globe, Shield, Monitor, History, Lock } from 'lucide-react';
import { useTranslation } from '../lib/i18n';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Settings() {
  const { t, language, setLanguage } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'operator' });
  const [devices, setDevices] = useState([
    { id: '1', name: 'Topcon TRC-NW8', type: 'Fundus Camera', sn: 'SN-12345' },
    { id: '2', name: 'Zeiss Cirrus 5000', type: 'OCT', sn: 'SN-67890' },
  ]);
  const [auditLogs, setAuditLogs] = useState([
    { id: '1', user: 'Admin User', action: 'View Screening', target: 'PT-102', time: '2024-03-04 10:22' },
    { id: '2', user: 'Dr. Smith', action: 'Submit Report', target: 'PT-105', time: '2024-03-04 09:15' },
    { id: '3', user: 'Operator A', action: 'Register Patient', target: 'PT-110', time: '2024-03-04 08:45' },
  ]);

  useEffect(() => {
    fetch("/api/physicians")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.map((p: any) => ({
          id: p.id,
          name: p.name,
          email: `${p.id}@example.com`, // Mock email
          role: p.rank === '指導医' ? 'admin' : p.rank === '専門医' ? 'physician' : 'operator'
        })));
        setLoading(false);
      });
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/physicians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          rank: newUser.role === 'admin' ? '指導医' : newUser.role === 'physician' ? '専門医' : '一般医',
          base_rate: 500
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsers([...users, { ...newUser, id: data.id }]);
        setShowAddUser(false);
        setNewUser({ name: '', email: '', role: 'operator' });
      }
    } catch (error) {
      console.error("Failed to add user", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold text-medical-text tracking-tight">{t('settings.title')}</h1>
        <p className="text-medical-text-muted mt-1 text-sm">{t('settings.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: General & Security Settings */}
        <div className="space-y-6">
          <div className="bg-medical-surface rounded-2xl border border-medical-border p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-medical-text-muted flex items-center gap-2 mb-4">
              <Globe size={16} /> Language / 言語
            </h2>
            <div className="flex gap-4">
              <button 
                onClick={() => setLanguage('en')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${language === 'en' ? 'bg-medical-primary text-white' : 'bg-medical-bg text-medical-text-muted hover:bg-medical-surface'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('ja')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${language === 'ja' ? 'bg-medical-primary text-white' : 'bg-medical-bg text-medical-text-muted hover:bg-medical-surface'}`}
              >
                日本語
              </button>
            </div>
          </div>

          <div className="bg-medical-surface rounded-2xl border border-medical-border p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-medical-text-muted flex items-center gap-2 mb-4">
              <Lock size={16} /> Security / セキュリティ
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-medical-bg rounded-xl">
                <span className="text-xs font-semibold text-medical-text-muted">Two-Factor Auth (2FA)</span>
                <div className="w-10 h-5 bg-medical-border rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-medical-surface rounded-full shadow-sm" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-medical-bg rounded-xl">
                <span className="text-xs font-semibold text-medical-text-muted">Session Timeout (30m)</span>
                <div className="w-10 h-5 bg-medical-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-medical-surface rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Management Sections */}
        <div className="lg:col-span-2 space-y-8">
          {/* User Management */}
          <div className="bg-medical-surface rounded-2xl border border-medical-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-medical-border flex justify-between items-center bg-medical-bg/50">
              <h2 className="text-sm font-bold uppercase tracking-wider text-medical-text-muted flex items-center gap-2">
                <Users size={16} /> {t('settings.users')}
              </h2>
              <button 
                onClick={() => setShowAddUser(!showAddUser)}
                className="text-xs font-bold uppercase tracking-wider bg-medical-text text-medical-surface px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-medical-text/90 transition-colors"
              >
                <Plus size={14} /> {t('settings.add_user')}
              </button>
            </div>

            {showAddUser && (
              <div className="p-5 border-b border-medical-border bg-medical-primary/5">
                <form onSubmit={handleAddUser} className="flex items-end gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-semibold text-medical-text-muted uppercase tracking-wider">{t('table.name')}</label>
                    <input 
                      type="text" required
                      className="w-full px-3 py-2 bg-medical-surface border border-medical-border rounded-lg text-sm focus:outline-none focus:border-medical-primary"
                      value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-xs font-semibold text-medical-text-muted uppercase tracking-wider">Email</label>
                    <input 
                      type="email" required
                      className="w-full px-3 py-2 bg-medical-surface border border-medical-border rounded-lg text-sm focus:outline-none focus:border-medical-primary"
                      value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})}
                    />
                  </div>
                  <div className="w-32 space-y-1">
                    <label className="text-xs font-semibold text-medical-text-muted uppercase tracking-wider">{t('settings.role')}</label>
                    <select 
                      className="w-full px-3 py-2 bg-medical-surface border border-medical-border rounded-lg text-sm focus:outline-none focus:border-medical-primary"
                      value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}
                    >
                      <option value="admin">Admin</option>
                      <option value="physician">Physician</option>
                      <option value="operator">Operator</option>
                    </select>
                  </div>
                  <button type="submit" className="bg-medical-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-medical-primary/90 transition-colors">
                    <Save size={16} />
                  </button>
                </form>
              </div>
            )}

            <div className="p-0">
              {loading ? (
                <div className="p-8 text-center text-medical-text-muted">Loading...</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-medical-bg text-medical-text-muted font-semibold text-xs uppercase tracking-wider border-b border-medical-border">
                    <tr>
                      <th className="px-5 py-3">{t('table.name')}</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">{t('settings.role')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-medical-border">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-medical-bg transition-colors">
                        <td className="px-5 py-3 font-medium text-medical-text">{user.name}</td>
                        <td className="px-5 py-3 text-medical-text-muted">{user.email}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            user.role === 'admin' ? 'bg-medical-primary/10 text-medical-primary' :
                            user.role === 'physician' ? 'bg-medical-secondary/10 text-medical-secondary' :
                            'bg-medical-border text-medical-text-muted'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Device Management */}
          <div className="bg-white rounded-2xl border border-[#141414]/10 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#141414]/10 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]/70 flex items-center gap-2">
                <Monitor size={16} /> {t('settings.devices')}
              </h2>
              <button className="text-xs font-bold uppercase tracking-wider bg-[#141414] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-black transition-colors">
                <Plus size={14} /> {t('settings.add_user')}
              </button>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[#141414]/50 font-semibold text-xs uppercase tracking-wider border-b border-[#141414]/10">
                  <tr>
                    <th className="px-5 py-3">{t('register.model')}</th>
                    <th className="px-5 py-3">{t('register.device_type')}</th>
                    <th className="px-5 py-3">Serial Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/5">
                  {devices.map(device => (
                    <tr key={device.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-[#141414]">{device.name}</td>
                      <td className="px-5 py-3 text-[#141414]/60">{device.type}</td>
                      <td className="px-5 py-3 font-mono text-xs text-[#141414]/60">{device.sn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="bg-white rounded-2xl border border-[#141414]/10 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[#141414]/10 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#141414]/70 flex items-center gap-2">
                <History size={16} /> {t('settings.audit_logs')}
              </h2>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[#141414]/50 font-semibold text-xs uppercase tracking-wider border-b border-[#141414]/10">
                  <tr>
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">Target</th>
                    <th className="px-5 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141414]/5">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-[#141414]">{log.user}</td>
                      <td className="px-5 py-3 text-[#141414]/60">{log.action}</td>
                      <td className="px-5 py-3 text-indigo-600 font-bold">{log.target}</td>
                      <td className="px-5 py-3 text-[#141414]/40 text-xs">{log.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
