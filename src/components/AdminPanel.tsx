import React, { useState } from "react";
import { 
  KeyRound, 
  ShieldAlert, 
  Lock, 
  User, 
  History, 
  Save, 
  Database, 
  RefreshCcw, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  Trash2,
  CheckCircle2
} from "lucide-react";
import { ICTAsset } from "../types";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  type: "info" | "success" | "warning" | "danger";
}

interface AdminPanelProps {
  assets: ICTAsset[];
  auditLogs: AuditLogEntry[];
  staffPin: string;
  adminUsername: string;
  adminPasswordHash: string;
  onUpdateCredentials: (newPin: string, newUsername: string, newPasswordHash: string) => void;
  onResetDatabase: () => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  assets,
  auditLogs,
  staffPin,
  adminUsername,
  adminPasswordHash,
  onUpdateCredentials,
  onResetDatabase,
  onLogout,
}) => {
  // Local credential states
  const [localPin, setLocalPin] = useState(staffPin);
  const [localUsername, setLocalUsername] = useState(adminUsername);
  const [localPassword, setLocalPassword] = useState(adminPasswordHash);
  const [showPassword, setShowPassword] = useState(false);

  const [pinError, setPinError] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setUserError(null);
    setSaveSuccess(null);

    // Validate 4 digit PIN
    if (!/^\d{4}$/.test(localPin)) {
      setPinError("Staff Entry Code must be a 4-digit number (e.g. 1234).");
      return;
    }

    // Validate Admin username/password
    if (!localUsername.trim() || localUsername.trim().length < 3) {
      setUserError("Username must be at least 3 characters long.");
      return;
    }

    if (!localPassword || localPassword.length < 4) {
      setUserError("Password must be at least 4 characters long.");
      return;
    }

    // Call state mutator
    onUpdateCredentials(localPin, localUsername.trim(), localPassword);
    setSaveSuccess("Security credentials updated successfully!");
    
    setTimeout(() => {
      setSaveSuccess(null);
    }, 4000);
  };

  // Stats
  const activeAssets = assets.length;
  const totalCost = assets.reduce((acc, curr) => acc + curr.cost, 0);
  const repairAssets = assets.filter(a => a.status === "Under Repair").length;

  return (
    <div className="space-y-6 animate-fade-in" id="admin-panel-container">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] font-bold uppercase tracking-widest border border-indigo-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              Active System Session: Full Administrator
            </div>
            <h2 className="text-xl font-bold tracking-tight mt-2 font-display">Administrator Control Center</h2>
            <p className="text-xs text-slate-300 mt-1">
              Configure system authorization codes, manage core registries, and monitor security access metrics.
            </p>
          </div>
          <button
            onClick={onLogout}
            className="self-start sm:self-center bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-red-950/20 cursor-pointer"
            id="admin-logout-btn"
          >
            Revoke Credentials & Logout
          </button>
        </div>
      </div>

      {/* Grid: Credentials config & Core Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Security Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <KeyRound className="w-4.5 h-4.5 text-indigo-600" />
              Update Access Credentials
            </h3>

            <form onSubmit={handleSaveCredentials} className="space-y-4">
              
              {/* User standard PIN code input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Staff Entry PIN (4 Digits)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono font-bold text-xs">
                    PIN
                  </span>
                  <input
                    type="text"
                    maxLength={4}
                    value={localPin}
                    onChange={(e) => setLocalPin(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm font-mono tracking-wider focus:outline-none"
                    placeholder="1234"
                    id="admin-change-pin-input"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Standard station agents and staff members use this quick code to enter.
                </p>
                {pinError && <p className="text-[10px] text-red-500 font-bold mt-1">{pinError}</p>}
              </div>

              <div className="border-t border-slate-100 my-4 pt-4" />

              {/* Admin Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Admin Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={localUsername}
                    onChange={(e) => setLocalUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs font-medium focus:outline-none"
                    id="admin-change-user-input"
                  />
                </div>
              </div>

              {/* Admin Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Admin Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={localPassword}
                    onChange={(e) => setLocalPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-xs font-mono focus:outline-none"
                    id="admin-change-pass-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {userError && <p className="text-[10px] text-red-500 font-bold mt-1">{userError}</p>}
              </div>

              {saveSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-700 font-semibold flex items-center gap-1.5 animate-pulse">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{saveSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-indigo-600/10"
                id="admin-save-creds-btn"
              >
                <Save className="w-4 h-4" />
                Save New Credentials
              </button>
            </form>
          </div>

          {/* Quick Metrics Cards */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-600" />
              Administrative Overview
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Managed Devices</span>
                <span className="text-lg font-extrabold text-slate-800 block mt-1">{activeAssets} Assets</span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Under Repair</span>
                <span className="text-lg font-extrabold text-indigo-600 block mt-1">{repairAssets} Tickets</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-white">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Asset Valuation Registry</span>
              <span className="text-base font-mono font-bold mt-1 block text-emerald-400">
                {totalCost.toLocaleString("en-UG")} UGX
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Audit Trail (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-indigo-600" />
                Session Audit Log Trail
              </h3>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {auditLogs.length} Entries
              </span>
            </div>

            {/* Scrollable log list */}
            <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[420px] pr-1.5" id="admin-audit-log-scroller">
              {auditLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No transactions recorded in this active session yet.</p>
                </div>
              ) : (
                auditLogs.map((entry) => {
                  const typeColors = {
                    info: "bg-blue-50 text-blue-700 border-blue-100",
                    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
                    warning: "bg-amber-50 text-amber-700 border-amber-100",
                    danger: "bg-red-50 text-red-700 border-red-100"
                  };

                  return (
                    <div 
                      key={entry.id}
                      className={`p-3 border rounded-xl text-xs flex gap-3 transition-colors hover:bg-slate-50/50 ${typeColors[entry.type]}`}
                    >
                      <div className="font-mono text-[9px] font-bold opacity-60 self-center shrink-0">
                        {entry.timestamp}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800 leading-normal">{entry.action}</p>
                        <div className="flex items-center gap-1.5 mt-1 font-semibold text-[10px] text-slate-500 uppercase">
                          <User className="w-3 h-3" />
                          <span>User: {entry.user}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-slate-100 pt-4 mt-4 bg-white">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                DANGER ZONE OPERATIONS
              </h4>
              <div className="p-3.5 bg-red-50/30 border border-red-100 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-800">Restore/Reset Registry Database</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Wipe custom configurations and load initial URC Railway Registry.</p>
                </div>
                <button
                  onClick={onResetDatabase}
                  className="bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-700 border border-red-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                  id="admin-reset-db-zone-btn"
                >
                  <RefreshCcw className="w-3.5 h-3.5 inline mr-1" />
                  Hard Reset
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
