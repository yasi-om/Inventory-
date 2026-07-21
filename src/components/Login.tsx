import React, { useState } from "react";
import { Lock, Shield, User, AlertCircle, LogIn, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";

interface LoginProps {
  onLoginSuccess: (role: "admin" | "staff") => void;
  staffPin: string;
  adminUsername: string;
  adminPasswordHash: string; // Stored password
}

export const Login: React.FC<LoginProps> = ({
  onLoginSuccess,
  staffPin,
  adminUsername,
  adminPasswordHash,
}) => {
  const [loginMode, setLoginMode] = useState<"staff" | "admin">("staff");
  
  // Staff PIN State
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [pinError, setPinError] = useState<string | null>(null);

  // Admin Credentials State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Handle PIN values input
  const handlePinChange = (index: number, val: string) => {
    if (isNaN(Number(val)) && val !== "") return;
    
    const newPin = [...pin];
    newPin[index] = val.substring(val.length - 1);
    setPin(newPin);
    setPinError(null);

    // Focus next input box
    if (val !== "" && index < 3) {
      const nextInput = document.getElementById(`pin-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle Backspace on PIN inputs
  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && pin[index] === "" && index > 0) {
      const prevInput = document.getElementById(`pin-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Submit PIN Code
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredPin = pin.join("");
    if (enteredPin.length < 4) {
      setPinError("Please enter all 4 digits of the entry code.");
      return;
    }

    if (enteredPin === staffPin) {
      onLoginSuccess("staff");
    } else {
      setPinError("Incorrect 4-digit PIN code. Please try again.");
      setPin(["", "", "", ""]);
      document.getElementById("pin-input-0")?.focus();
    }
  };

  // Submit Admin Login
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    if (!username.trim() || !password) {
      setAdminError("Please fill in both username and password.");
      return;
    }

    if (
      username.toLowerCase().trim() === adminUsername.toLowerCase().trim() &&
      password === adminPasswordHash
    ) {
      onLoginSuccess("admin");
    } else {
      setAdminError("Invalid Admin username or password. Please verify.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden" id="login-container">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20 mb-3.5">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight font-display">URC ICT Registry</h2>
          <p className="text-slate-400 text-xs mt-1">Uganda Railway Corporation • Asset Registry Authorization</p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="bg-slate-800/50 p-1 rounded-xl flex border border-slate-700/50 mb-5 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setLoginMode("staff");
              setPinError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold tracking-wide rounded-lg transition-all cursor-pointer ${
              loginMode === "staff"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            id="tab-staff-login"
          >
            Staff Quick Code
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode("admin");
              setAdminError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold tracking-wide rounded-lg transition-all cursor-pointer ${
              loginMode === "admin"
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            id="tab-admin-login"
          >
            Administrator Login
          </button>
        </div>

        {/* Credentials Form Box */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
          {loginMode === "staff" ? (
            /* --- STAFF 4-DIGIT PIN MODE --- */
            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div className="text-center">
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Enter 4-Digit Staff PIN Code
                </label>
                <p className="text-slate-400 text-xs mb-5 leading-relaxed">
                  Provide the institutional four-digit security key to gain standard viewer-level registry permissions.
                </p>
              </div>

              {/* Pin Boxes */}
              <div className="flex justify-center gap-3">
                {pin.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`pin-input-${idx}`}
                    type="password"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(idx, e)}
                    className="w-12 h-14 bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-center text-xl font-bold text-white rounded-xl focus:outline-none transition-all shadow-inner"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {pinError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{pinError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 cursor-pointer"
                id="submit-staff-pin-btn"
              >
                <LogIn className="w-4 h-4" />
                Access Registry
              </button>
            </form>
          ) : (
            /* --- ADMINISTRATOR CREDENTIALS MODE --- */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="text-center mb-1">
                <label className="block text-sm font-semibold text-slate-200 mb-1">
                  Administrator Portal
                </label>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Secure login for registry administrators. Unlocks write access and database maintenance controls.
                </p>
              </div>

              {/* Username field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm text-white focus:outline-none transition-all shadow-inner"
                    id="admin-username-input"
                  />
                </div>
              </div>

              {/* Password field */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security password"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 rounded-xl text-sm text-white focus:outline-none transition-all shadow-inner"
                    id="admin-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {adminError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{adminError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white py-3 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 cursor-pointer mt-2"
                id="submit-admin-login-btn"
              >
                <LogIn className="w-4 h-4" />
                Authenticate Administrator
              </button>
            </form>
          )}
        </div>

        {/* Credentials Cheat Sheet box to ease developer testing */}
        <div className="mt-6 bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            Testing Credentials (Cheat Sheet)
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
            <div className="bg-slate-900/40 p-1.5 rounded border border-slate-800">
              <span className="text-slate-400">Staff PIN:</span> <b className="text-white">1234</b>
            </div>
            <div className="bg-slate-900/40 p-1.5 rounded border border-slate-800">
              <span className="text-slate-400">Admin:</span> <b className="text-white">admin</b> <span className="text-slate-400">/</span> <b className="text-white">adminpassword</b>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic">
            Credentials can be fully customized after logging in as an administrator.
          </p>
        </div>
      </div>
    </div>
  );
};
