import React, { useState, useEffect, useMemo } from "react";
import { ICTAsset, AssetStatus, MaintenanceLog, AssetCategory } from "./types";
import { initialAssets } from "./data/mockData";
import { Dashboard } from "./components/Dashboard";
import { AssetList } from "./components/AssetList";
import { AssetDetail } from "./components/AssetDetail";
import { AssetForm } from "./components/AssetForm";
import { MaintenanceTab } from "./components/MaintenanceTab";
import { Login } from "./components/Login";
import { AdminPanel, AuditLogEntry } from "./components/AdminPanel";
import { 
  ShieldCheck, 
  LayoutDashboard, 
  Database, 
  Wrench, 
  Plus, 
  RefreshCcw, 
  Settings,
  Server,
  FileCheck2,
  Trash2,
  CheckCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const STORAGE_KEY = "urc_ict_assets";

export default function App() {
  const [assets, setAssets] = useState<ICTAsset[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "inventory" | "maintenance" | "admin">("dashboard");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<ICTAsset | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Security & Authentication States
  const [authRole, setAuthRole] = useState<"admin" | "staff" | null>(null);
  const [staffPin, setStaffPin] = useState<string>("1234");
  const [adminUsername, setAdminUsername] = useState<string>("admin");
  const [adminPasswordHash, setAdminPasswordHash] = useState<string>("adminpassword");
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // 1. Initial State Sync
  useEffect(() => {
    // 1a. Load Assets
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setAssets(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored assets, using fallback mock data.", e);
        setAssets(initialAssets);
      }
    } else {
      setAssets(initialAssets);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAssets));
    }

    // 1b. Load Authentication/Credentials
    const role = localStorage.getItem("urc_ict_auth_role") as "admin" | "staff" | null;
    if (role) {
      setAuthRole(role);
    }

    const pin = localStorage.getItem("urc_ict_staff_pin") || "1234";
    setStaffPin(pin);

    const user = localStorage.getItem("urc_ict_admin_username") || "admin";
    setAdminUsername(user);

    const pass = localStorage.getItem("urc_ict_admin_password") || "adminpassword";
    setAdminPasswordHash(pass);

    const storedLogs = localStorage.getItem("urc_ict_audit_logs");
    if (storedLogs) {
      try {
        setAuditLogs(JSON.parse(storedLogs));
      } catch (e) {
        setAuditLogs([
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString("en-GB", { hour12: false }),
            action: "Audit log parsed error. Resetting.",
            user: "System Core",
            type: "info"
          }
        ]);
      }
    } else {
      const initialLogs: AuditLogEntry[] = [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString("en-GB", { hour12: false }),
          action: "Asset Registry security database initialized.",
          user: "System Core",
          type: "info"
        }
      ];
      setAuditLogs(initialLogs);
      localStorage.setItem("urc_ict_audit_logs", JSON.stringify(initialLogs));
    }
  }, []);

  // Save changes to localStorage helper
  const saveAssetsState = (newAssets: ICTAsset[]) => {
    setAssets(newAssets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssets));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Helper to add session security log entries
  const addAuditLog = (action: string, type: "info" | "success" | "warning" | "danger" = "info", customUser?: string) => {
    const activeUser = customUser || (authRole === "admin" ? "Administrator" : "Staff User");
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString("en-GB", { hour12: false }),
      action,
      user: activeUser,
      type
    };
    setAuditLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem("urc_ict_audit_logs", JSON.stringify(updated));
      return updated;
    });
  };

  // 2. State Mutators & Handlers
  
  // Create / Update Asset
  const handleSaveAsset = (savedAsset: ICTAsset) => {
    const exists = assets.some(a => a.id === savedAsset.id);
    let updated: ICTAsset[];

    if (exists) {
      updated = assets.map(a => a.id === savedAsset.id ? savedAsset : a);
      addAuditLog(`Updated details for asset ${savedAsset.id}`, "success");
      showToast(`Asset details for ${savedAsset.id} successfully updated.`);
    } else {
      updated = [savedAsset, ...assets];
      addAuditLog(`Registered and enrolled asset ${savedAsset.id}`, "success");
      showToast(`Asset ${savedAsset.id} successfully enrolled into database.`);
    }

    saveAssetsState(updated);
    setShowForm(false);
    setEditingAsset(null);
    
    // Auto open details if updated or newly created
    setSelectedAssetId(savedAsset.id);
  };

  // Delete Asset
  const handleDeleteAsset = (assetId: string) => {
    const updated = assets.filter(a => a.id !== assetId);
    saveAssetsState(updated);
    addAuditLog(`Permanently purged asset record ${assetId}`, "danger");
    setSelectedAssetId(null);
    showToast(`Asset record ${assetId} permanently purged from registry.`);
  };

  // Update Maintenance Logs specifically
  const handleUpdateLogs = (assetId: string, updatedLogs: MaintenanceLog[]) => {
    const updated = assets.map(asset => {
      if (asset.id === assetId) {
        return {
          ...asset,
          maintenanceLogs: updatedLogs,
          lastUpdated: new Date().toISOString()
        };
      }
      return asset;
    });
    saveAssetsState(updated);
    addAuditLog(`Synchronized maintenance logs for asset ${assetId}`, "info");
    showToast(`Maintenance log ticket synchronized for asset ${assetId}.`);
  };

  // Instant Status change
  const handleQuickStatusChange = (assetId: string, newStatus: AssetStatus) => {
    const updated = assets.map(asset => {
      if (asset.id === assetId) {
        // If status changed, push to assignment history too
        const history = [...asset.assignmentHistory];
        history.push({
          id: `a-${Date.now()}`,
          assignedTo: asset.assignedTo || "IT Operations",
          department: asset.department || "IT Operations",
          assignedDate: new Date().toISOString().split("T")[0],
          notes: `Operational state toggled to: "${newStatus}"`
        });

        return {
          ...asset,
          status: newStatus,
          assignmentHistory: history,
          lastUpdated: new Date().toISOString()
        };
      }
      return asset;
    });
    saveAssetsState(updated);
    addAuditLog(`Toggled operational status for ${assetId} to: "${newStatus}"`, "warning");
    showToast(`Status for ${assetId} toggled to ${newStatus}.`);
  };

  // Resolve active repair log callback
  const handleResolveRepair = (assetId: string, resolvedStatus: AssetStatus) => {
    const updated = assets.map(asset => {
      if (asset.id === assetId) {
        // Find latest log and mark it as completed or add a completion notes entry
        const logs = [...asset.maintenanceLogs];
        if (logs.length > 0) {
          const sorted = [...logs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          const latestIndex = logs.findIndex(l => l.id === sorted[0].id);
          if (latestIndex !== -1) {
            logs[latestIndex] = {
              ...logs[latestIndex],
              notes: logs[latestIndex].notes + " (COMPLETED & RESOLVED)"
            };
          }
        }

        // Add a history item for reassignment
        const history = [...asset.assignmentHistory];
        history.push({
          id: `a-${Date.now()}`,
          assignedTo: asset.assignedTo || "General Pool",
          department: asset.department || "IT Operations",
          assignedDate: new Date().toISOString().split("T")[0],
          notes: `Hardware repair resolved. Re-deployed as operational state: "${resolvedStatus}"`
        });

        return {
          ...asset,
          status: resolvedStatus,
          maintenanceLogs: logs,
          assignmentHistory: history,
          lastUpdated: new Date().toISOString()
        };
      }
      return asset;
    });
    saveAssetsState(updated);
    addAuditLog(`Resolved repair ticket for asset ${assetId} to status: "${resolvedStatus}"`, "success");
    showToast(`Maintenance ticket resolved. Asset ${assetId} is now marked ${resolvedStatus}.`);
  };

  // Bulk CSV Import merger
  const handleImportCsv = (imported: ICTAsset[]) => {
    // Filter out matches to prevent duplications
    const filteredImported = imported.filter(imp => !assets.some(a => a.id.toLowerCase() === imp.id.toLowerCase()));
    const updated = [...filteredImported, ...assets];
    saveAssetsState(updated);
    addAuditLog(`Bulk merged ${filteredImported.length} assets via spreadsheet import`, "success");
    showToast(`Merged ${filteredImported.length} non-duplicate assets into database.`);
  };

  // Force Database Reset
  const handleResetDatabase = () => {
    if (confirm("Are you absolutely sure you want to reset the database? This will restore the default URC inventory demo logs and wipe custom edits.")) {
      saveAssetsState(initialAssets);
      addAuditLog("Database hard reset triggered.", "danger");
      showToast("Database successfully reverted to URC railway inventory dataset.");
    }
  };

  // Get active asset object for details
  const activeAsset = useMemo(() => {
    return assets.find(a => a.id === selectedAssetId) || null;
  }, [assets, selectedAssetId]);

  const handleLoginSuccess = (role: "admin" | "staff") => {
    setAuthRole(role);
    localStorage.setItem("urc_ict_auth_role", role);
    addAuditLog(`${role === "admin" ? "Administrator" : "Staff User"} logged in successfully.`, "success", role === "admin" ? "Administrator" : "Staff User");
    showToast(`Welcome! Logged in as ${role === "admin" ? "Administrator" : "Staff User"}.`);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    addAuditLog("Active session terminated.", "info");
    setAuthRole(null);
    localStorage.removeItem("urc_ict_auth_role");
    showToast("Logged out successfully.");
  };

  const handleUpdateCredentials = (newPin: string, newUsername: string, newPasswordHash: string) => {
    setStaffPin(newPin);
    localStorage.setItem("urc_ict_staff_pin", newPin);
    setAdminUsername(newUsername);
    localStorage.setItem("urc_ict_admin_username", newUsername);
    setAdminPasswordHash(newPasswordHash);
    localStorage.setItem("urc_ict_admin_password", newPasswordHash);
    addAuditLog("Security credentials modified by Admin.", "warning");
    showToast("Security credentials successfully saved!");
  };

  if (authRole === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
        <Login
          staffPin={staffPin}
          adminUsername={adminUsername}
          adminPasswordHash={adminPasswordHash}
          onLoginSuccess={handleLoginSuccess}
        />
        {/* Dynamic Toast Feedback Overlay inside Login */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold tracking-wide flex items-center gap-2.5 z-50 pointer-events-none"
              id="toast-notification-login"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden" id="app-root-container">
      
      {/* Dynamic Toast Feedback Overlay */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold tracking-wide flex items-center gap-2.5 z-50 pointer-events-none"
            id="toast-notification"
          >
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Left Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-slate-300 flex-col shrink-0 border-r border-slate-800">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center text-white font-bold font-display shadow-sm">U</div>
          <span className="font-semibold text-base text-white tracking-tight font-display">URC Assets</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">Navigation</div>
          
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer text-left ${
              activeTab === "dashboard"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
            id="tab-dashboard-btn"
          >
            <LayoutDashboard className="w-4 h-4 opacity-80" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab("inventory")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer text-left ${
              activeTab === "inventory"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
            id="tab-inventory-btn"
          >
            <Database className="w-4 h-4 opacity-80" />
            Asset Registry
          </button>

          <button
            onClick={() => setActiveTab("maintenance")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer text-left ${
              activeTab === "maintenance"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
            id="tab-maintenance-btn"
          >
            <Wrench className="w-4 h-4 opacity-80" />
            Maintenance Log
          </button>

          {authRole === "admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer text-left ${
                activeTab === "admin"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
              id="tab-admin-btn"
            >
              <ShieldAlert className="w-4 h-4 opacity-80" />
              Admin Panel
            </button>
          )}
        </nav>

        {/* User profile section */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded bg-slate-800/40 border border-slate-800/40">
            <div className="w-8 h-8 rounded-full bg-slate-750 flex items-center justify-center text-xs font-bold text-white border border-slate-600">
              {authRole === "admin" ? "AD" : "ST"}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate">
                {authRole === "admin" ? "Administrator" : "Staff User"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">Uganda Railway Corporation</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer transition-all"
            id="sidebar-logout-btn"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* 2. Main Area Panel */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold font-display">U</div>
            <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight font-display">
              {activeTab === "dashboard" && "ICT Dashboard"}
              {activeTab === "inventory" && "Asset Registry"}
              {activeTab === "maintenance" && "Maintenance Desk"}
              {activeTab === "admin" && "Administrative Panel"}
            </h1>
          </div>
          
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                setEditingAsset(null);
                setShowForm(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:shadow"
              id="header-quick-add-btn"
            >
              <Plus className="w-4 h-4" />
              Add Asset
            </button>

            {authRole === "admin" && (
              <button
                onClick={handleResetDatabase}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer border border-slate-200 bg-white shadow-xs"
                title="Revert database to URC railway inventory dataset"
                id="reset-db-btn"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </header>

        {/* Dynamic Mobile Bottom Bar Navigation */}
        <div className="md:hidden bg-white border-t border-slate-200 fixed bottom-0 left-0 right-0 z-40 p-2.5 shadow-lg flex justify-around text-[10px] font-bold text-slate-400">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === "dashboard" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === "inventory" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Database className="w-4 h-4" />
            <span>Inventory</span>
          </button>
          <button
            onClick={() => setActiveTab("maintenance")}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === "maintenance" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <Wrench className="w-4 h-4" />
            <span>Service</span>
          </button>
          {authRole === "admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`flex flex-col items-center gap-1 cursor-pointer transition-colors ${activeTab === "admin" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin</span>
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 cursor-pointer text-slate-400 hover:text-rose-600 transition-colors"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Logout</span>
          </button>
        </div>

        {/* Actual view stage container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-20 md:pb-8 bg-slate-50/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "dashboard" && (
                <Dashboard 
                  assets={assets} 
                  onSelectAsset={(id) => setSelectedAssetId(id)}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                  onFilterByStatus={(status) => setStatusFilter(status)}
                />
              )}

              {activeTab === "inventory" && (
                <AssetList 
                  assets={assets} 
                  onSelectAsset={(id) => setSelectedAssetId(id)}
                  onAddAssetTrigger={() => {
                    setEditingAsset(null);
                    setShowForm(true);
                  }}
                  onImportCsv={handleImportCsv}
                  selectedStatus={statusFilter}
                  onSelectedStatusChange={(status) => setStatusFilter(status)}
                  isAdmin={authRole === "admin"}
                />
              )}

              {activeTab === "maintenance" && (
                <MaintenanceTab 
                  assets={assets} 
                  onSelectAsset={(id) => setSelectedAssetId(id)}
                  onResolveRepair={handleResolveRepair}
                />
              )}

              {activeTab === "admin" && authRole === "admin" && (
                <AdminPanel
                  assets={assets}
                  auditLogs={auditLogs}
                  staffPin={staffPin}
                  adminUsername={adminUsername}
                  adminPassword={adminPasswordHash}
                  onUpdateCredentials={handleUpdateCredentials}
                  onResetDatabase={() => {
                    if (confirm("Are you absolutely sure you want to reset the database? This will restore the default URC inventory demo logs and wipe custom edits.")) {
                      saveAssetsState(initialAssets);
                      addAuditLog("Hard database reset from Admin Panel", "danger");
                      showToast("Database successfully reverted to URC railway inventory dataset.");
                    }
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer Brand (Desktop inline or hidden on small layout) */}
        <footer className="hidden md:block bg-white border-t border-slate-200 py-4 px-8 text-xs text-slate-400 shrink-0">
          <div className="flex justify-between items-center">
            <p className="font-semibold flex items-center gap-1.5 text-slate-500">
              <Server className="w-3.5 h-3.5 text-indigo-500" />
              URC ICT Registry • Asset Management 2026
            </p>
            <p className="flex items-center gap-1 font-mono text-[10px] text-slate-400 font-bold">
              <Clock className="w-3.5 h-3.5" />
              UTC Standard Tracking
            </p>
          </div>
        </footer>

      </div>

      {/* 3. Modular Sheets and Modals */}
      
      {/* Detailed view Modal */}
      {activeAsset && (
        <AssetDetail 
          asset={activeAsset}
          onClose={() => setSelectedAssetId(null)}
          onEdit={(asset) => {
            setEditingAsset(asset);
            setShowForm(true);
          }}
          onDelete={handleDeleteAsset}
          onUpdateLogs={handleUpdateLogs}
          onQuickStatusChange={handleQuickStatusChange}
          isAdmin={authRole === "admin"}
        />
      )}

      {/* Enroll Form Sheet */}
      {showForm && (
        <AssetForm 
          asset={editingAsset}
          onSave={handleSaveAsset}
          onClose={() => {
            setShowForm(false);
            setEditingAsset(null);
          }}
          existingAssets={assets}
        />
      )}

    </div>
  );
}
