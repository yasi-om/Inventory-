import React, { useState } from "react";
import { ICTAsset, AssetStatus, MaintenanceLog } from "../types";
import { BarcodeGenerator } from "./BarcodeGenerator";
import { 
  X, 
  Calendar, 
  DollarSign, 
  User, 
  ShieldCheck, 
  Wrench, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  AlertTriangle,
  History,
  Tag
} from "lucide-react";

interface AssetDetailProps {
  asset: ICTAsset;
  onClose: () => void;
  onEdit: (asset: ICTAsset) => void;
  onDelete: (assetId: string) => void;
  onUpdateLogs: (assetId: string, updatedLogs: MaintenanceLog[]) => void;
  onQuickStatusChange: (assetId: string, newStatus: AssetStatus) => void;
  isAdmin?: boolean;
}

export const AssetDetail: React.FC<AssetDetailProps> = ({ 
  asset, 
  onClose, 
  onEdit, 
  onDelete, 
  onUpdateLogs,
  onQuickStatusChange,
  isAdmin = false
}) => {
  const [activeTab, setActiveTab] = useState<"specs" | "maintenance" | "history" | "print">("specs");
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  // Maintenance log form states
  const [showLogForm, setShowLogForm] = useState(false);
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [logType, setLogType] = useState<"Routine" | "Repair" | "Upgrade" | "Inspection">("Routine");
  const [logCost, setLogCost] = useState(0);
  const [logTechnician, setLogTechnician] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [logError, setLogError] = useState("");

  const currentDate = new Date("2026-07-15");
  const isWarrantyExpired = asset.warrantyExpiry ? new Date(asset.warrantyExpiry) < currentDate : false;

  const totalMaintenanceCost = asset.maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);

  // Status badges mapping
  const statusBadges: Record<AssetStatus, string> = {
    [AssetStatus.IN_USE]: "bg-emerald-50 text-emerald-700 border-emerald-100",
    [AssetStatus.IN_STORAGE]: "bg-blue-50 text-blue-700 border-blue-100",
    [AssetStatus.UNDER_REPAIR]: "bg-amber-50 text-amber-700 border-amber-100",
    [AssetStatus.RETIRED]: "bg-gray-100 text-gray-700 border-gray-200",
    [AssetStatus.LOST]: "bg-red-50 text-red-700 border-red-100"
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logTechnician.trim() || !logNotes.trim()) {
      setLogError("Technician name and notes are required.");
      return;
    }

    const newLog: MaintenanceLog = {
      id: `m-${Date.now()}`,
      date: logDate,
      type: logType,
      cost: logCost,
      technician: logTechnician.trim(),
      notes: logNotes.trim()
    };

    const updatedLogs = [...asset.maintenanceLogs, newLog];
    onUpdateLogs(asset.id, updatedLogs);
    
    // Reset log states
    setShowLogForm(false);
    setLogCost(0);
    setLogTechnician("");
    setLogNotes("");
    setLogError("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in" id="asset-detail-modal">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col my-8 max-h-[90vh]">
        
        {/* Header Block */}
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md shrink-0">
              <Tag className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="font-mono text-xs font-bold text-indigo-600 tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                {asset.id}
              </span>
              <h3 className="text-xl font-bold text-gray-800 mt-1 truncate">{asset.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{asset.manufacturer} {asset.model} • S/N: {asset.serialNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-center">
            {/* Quick Status Control */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 shadow-sm">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">Status:</span>
              <select
                value={asset.status}
                onChange={(e) => onQuickStatusChange(asset.id, e.target.value as AssetStatus)}
                className="text-xs font-semibold text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                id="quick-status-dropdown"
              >
                {Object.values(AssetStatus).map(stat => (
                  <option key={stat} value={stat}>{stat}</option>
                ))}
              </select>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              id="close-detail-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-gray-100 bg-white flex overflow-x-auto gap-1">
          <button
            onClick={() => setActiveTab("specs")}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "specs"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Specification Overview
          </button>
          <button
            onClick={() => setActiveTab("maintenance")}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "maintenance"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Service & Maintenance Logs
            <span className="bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded-full text-[9px]">
              {asset.maintenanceLogs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "history"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Assignment History
            <span className="bg-gray-100 text-gray-600 font-bold px-1.5 py-0.5 rounded-full text-[9px]">
              {asset.assignmentHistory.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("print")}
            className={`px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "print"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Physical Tag Barcode
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          
          {/* TAB 1: Specs Overview */}
          {activeTab === "specs" && (
            <div className="space-y-6 animate-fade-in" id="specs-tab-content">
              {/* Core Attributes Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Deployment Status</span>
                  <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadges[asset.status]}`}>
                    {asset.status}
                  </span>
                </div>
                <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Location Room</span>
                  <span className="text-sm font-bold text-gray-800 mt-1 block truncate">{asset.location}</span>
                </div>
                <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Custodian assigned</span>
                  <span className="text-sm font-bold text-gray-800 mt-1 block truncate flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    {asset.assignedTo || "Unassigned"}
                  </span>
                </div>
                <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Allocated Department</span>
                  <span className="text-sm font-bold text-gray-800 mt-1 block truncate">{asset.department || "General Store"}</span>
                </div>
              </div>

              {/* Hardware & Procurement Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Specifications List */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
                    Hardware Catalog Metadata
                  </h4>
                  <div className="grid grid-cols-3 gap-y-3 text-xs leading-relaxed">
                    <span className="text-gray-400 font-semibold">Asset Tag:</span>
                    <span className="col-span-2 font-mono font-bold text-gray-800">{asset.id}</span>

                    {asset.engravedNumber && (
                      <>
                        <span className="text-gray-400 font-semibold">Engraved ID:</span>
                        <span className="col-span-2 font-mono font-bold text-indigo-600">{asset.engravedNumber}</span>
                      </>
                    )}

                    <span className="text-gray-400 font-semibold">Model Category:</span>
                    <span className="col-span-2 font-bold text-gray-800">{asset.category}</span>

                    <span className="text-gray-400 font-semibold">Manufacturer:</span>
                    <span className="col-span-2 font-bold text-gray-800">{asset.manufacturer}</span>

                    <span className="text-gray-400 font-semibold">Model Name:</span>
                    <span className="col-span-2 font-bold text-gray-800">{asset.model}</span>

                    <span className="text-gray-400 font-semibold">Serial Number:</span>
                    <span className="col-span-2 font-mono font-bold text-indigo-600 tracking-wide select-all">{asset.serialNumber}</span>

                    {asset.operatingSystem && (
                      <>
                        <span className="text-gray-400 font-semibold">Operating System:</span>
                        <span className="col-span-2 font-medium text-gray-800">{asset.operatingSystem}</span>
                      </>
                    )}

                    {asset.ram && (
                      <>
                        <span className="text-gray-400 font-semibold">System RAM:</span>
                        <span className="col-span-2 font-medium text-gray-800">{asset.ram}</span>
                      </>
                    )}

                    {asset.hardDisk && (
                      <>
                        <span className="text-gray-400 font-semibold">Hard Disk:</span>
                        <span className="col-span-2 font-medium text-gray-800">{asset.hardDisk}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Logistics & Financial List */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
                    Logistics & Asset Value
                  </h4>
                  <div className="grid grid-cols-3 gap-y-3 text-xs leading-relaxed">
                    <span className="text-gray-400 font-semibold">Cost (UGX):</span>
                    <span className="col-span-2 font-mono font-bold text-emerald-700 flex items-center">
                      {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(asset.cost)}
                    </span>

                    <span className="text-gray-400 font-semibold">Purchase Date:</span>
                    <span className="col-span-2 font-bold text-gray-800 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(asset.purchaseDate).toLocaleDateString()}
                    </span>

                    {asset.purchaseYear && (
                      <>
                        <span className="text-gray-400 font-semibold">Purchase Year:</span>
                        <span className="col-span-2 font-bold text-gray-800">{asset.purchaseYear}</span>
                      </>
                    )}

                    <span className="text-gray-400 font-semibold">Warranty Expiry:</span>
                    <span className={`col-span-2 font-bold flex items-center gap-1.5 ${
                      isWarrantyExpired ? "text-red-600" : "text-gray-800"
                    }`}>
                      <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                      {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : "No warranty logged"}
                      {isWarrantyExpired && (
                        <span className="bg-red-100 text-red-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                          Expired
                        </span>
                      )}
                    </span>

                    <span className="text-gray-400 font-semibold">Last Audited:</span>
                    <span className="col-span-2 font-bold text-gray-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {new Date(asset.lastUpdated).toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>

              {/* General Notes text box */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
                  Asset Remarks & Configuration Profile
                </h4>
                <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {asset.notes || "No supplementary notes logged for this asset record."}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Maintenance Logs */}
          {activeTab === "maintenance" && (
            <div className="space-y-6 animate-fade-in" id="maintenance-tab-content">
              {/* Stats & Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Total Maintenance Cost</span>
                  <span className="text-lg font-mono font-black text-emerald-700 flex items-center mt-0.5">
                    {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(totalMaintenanceCost)}
                  </span>
                </div>
                <button
                  onClick={() => setShowLogForm(!showLogForm)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
                  id="add-maintenance-log-btn"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showLogForm ? "Collapse Form" : "Log Service Action"}
                </button>
              </div>

              {/* Add Log Form */}
              {showLogForm && (
                <form onSubmit={handleAddLog} className="bg-white border border-indigo-100 rounded-xl p-5 shadow-md space-y-4 animate-slide-up">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <h4 className="text-xs font-bold text-indigo-700 flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5" />
                      Log New Service Ticket details
                    </h4>
                  </div>

                  {logError && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {logError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Date</label>
                      <input
                        type="date"
                        value={logDate}
                        onChange={(e) => setLogDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Action Type</label>
                      <select
                        value={logType}
                        onChange={(e) => setLogType(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                      >
                        <option value="Routine">Routine Inspection</option>
                        <option value="Repair">Hardware Repair</option>
                        <option value="Upgrade">System Upgrade</option>
                        <option value="Inspection">Audit Check</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cost (UGX)</label>
                      <input
                        type="number"
                        min="0"
                        value={logCost}
                        onChange={(e) => setLogCost(parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Technician / SLA Agency</label>
                      <input
                        type="text"
                        placeholder="e.g. Robert Chen, HP Care"
                        value={logTechnician}
                        onChange={(e) => setLogTechnician(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Service Action Remarks</label>
                    <textarea
                      placeholder="Specify components replaced, diagnostic results, or downtime details..."
                      rows={2}
                      value={logNotes}
                      onChange={(e) => setLogNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
                    <button
                      type="button"
                      onClick={() => setShowLogForm(false)}
                      className="px-3 py-1.5 border border-gray-200 text-gray-500 hover:bg-gray-100 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      onClick={handleAddLog}
                      className="px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
                      id="submit-maintenance-log-btn"
                    >
                      Commit Log Entry
                    </button>
                  </div>
                </form>
              )}

              {/* Logs List Timeline */}
              <div className="space-y-4">
                {asset.maintenanceLogs.length === 0 ? (
                  <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-400">
                    <Wrench className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs font-medium">No maintenance logs or repair actions logged for this asset.</p>
                  </div>
                ) : (
                  [...asset.maintenanceLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                    <div key={log.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${
                          log.type === "Repair" ? "bg-red-50 text-red-600" :
                          log.type === "Upgrade" ? "bg-indigo-50 text-indigo-600" :
                          log.type === "Routine" ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-600"
                        }`}>
                          <Wrench className="w-4 h-4" />
                        </div>
                        <div className="text-xs">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-800">{log.type} Action</span>
                            <span className="font-mono text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-black">
                              {log.date}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-1.5 font-medium leading-relaxed">{log.notes}</p>
                          <div className="text-[10px] text-gray-400 font-bold mt-2 flex items-center gap-1">
                            <span>Technician: {log.technician}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-black text-gray-800 bg-gray-50 px-2.5 py-1 rounded border border-gray-100 block">
                          ${log.cost}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Assignment History */}
          {activeTab === "history" && (
            <div className="space-y-4 animate-fade-in" id="history-tab-content">
              {asset.assignmentHistory.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-400">
                  <History className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-xs font-medium">No custody or assignment logs found.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-indigo-100 pl-5 ml-2.5 space-y-6 py-2">
                  {[...asset.assignmentHistory].sort((a,b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime()).map(asg => (
                    <div key={asg.id} className="relative">
                      {/* Timeline Dot */}
                      <span className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full border-2 border-indigo-600 bg-white" />

                      <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm text-xs space-y-1.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-gray-400" />
                            <span className="font-bold text-gray-800">{asg.assignedTo}</span>
                          </div>
                          <div className="font-mono text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black">
                            {asg.assignedDate} {asg.returnedDate ? `to ${asg.returnedDate}` : "— Present"}
                          </div>
                        </div>
                        
                        <p className="text-gray-500 font-bold text-[10px]">Department: {asg.department}</p>
                        {asg.notes && <p className="text-gray-600 mt-1 italic font-medium leading-relaxed">&ldquo;{asg.notes}&rdquo;</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Print Tag */}
          {activeTab === "print" && (
            <div className="animate-fade-in" id="print-tab-content">
              <BarcodeGenerator asset={asset} />
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-white flex-col sm:flex-row gap-4">
          
          {/* Left Block: Delete Safety */}
          {isAdmin ? (
            confirmDelete ? (
              <div className="flex items-center gap-2 p-1.5 bg-red-50 border border-red-100 rounded-xl w-full sm:w-auto">
                <span className="text-[11px] text-red-700 font-bold px-2">Permanently purge?</span>
                <button
                  onClick={() => onDelete(asset.id)}
                  className="px-2.5 py-1 bg-red-600 text-white hover:bg-red-700 rounded-lg text-xs font-semibold cursor-pointer"
                  id="confirm-delete-btn"
                >
                  Yes, Purge
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 border border-gray-200 hover:bg-white text-gray-500 rounded-lg text-xs font-semibold cursor-pointer bg-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 px-3 py-1.5 rounded-xl transition-all self-start cursor-pointer"
                id="trigger-delete-btn"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Purge Record
              </button>
            )
          ) : (
            <div className="text-slate-400 font-bold text-[10px] tracking-wide uppercase bg-slate-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1">
              <span>🔒 Staff Mode (Read Only Purge)</span>
            </div>
          )}

          {/* Right Block: General Options */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => onEdit(asset)}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer w-full sm:w-auto justify-center"
              id="trigger-edit-btn"
            >
              <Edit3 className="w-3.5 h-3.5 text-gray-400" />
              Edit Records
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer w-full sm:w-auto justify-center"
            >
              Dismiss
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
