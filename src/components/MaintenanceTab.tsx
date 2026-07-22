import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { ICTAsset, AssetStatus, MaintenanceLog } from "../types";
import { 
  Wrench, 
  Search, 
  Calendar, 
  CheckCircle, 
  DollarSign, 
  User, 
  Clock, 
  ArrowUpRight,
  Plus,
  FileSpreadsheet,
  X,
  AlertCircle,
  Filter,
  History,
  Tag,
  Download
} from "lucide-react";

interface MaintenanceTabProps {
  assets: ICTAsset[];
  onSelectAsset: (assetId: string) => void;
  onResolveRepair: (assetId: string, resolvedStatus: AssetStatus) => void;
  onAddMaintenanceRecord?: (
    assetId: string, 
    newLog: MaintenanceLog, 
    newStatus?: AssetStatus
  ) => void;
  onAddServiceIntakeTrigger?: () => void;
}

export const MaintenanceTab: React.FC<MaintenanceTabProps> = ({ 
  assets, 
  onSelectAsset,
  onResolveRepair,
  onAddMaintenanceRecord,
  onAddServiceIntakeTrigger
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [logTypeFilter, setLogTypeFilter] = useState<string>("all");

  // Modal State for Recording Maintenance / Service
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [serviceType, setServiceType] = useState<"Routine" | "Repair" | "Upgrade" | "Inspection">("Routine");
  const [technician, setTechnician] = useState("");
  const [serviceCost, setServiceCost] = useState<number>(0);
  const [serviceNotes, setServiceNotes] = useState("");
  const [postServiceStatus, setPostServiceStatus] = useState<string>("keep"); // "keep" or AssetStatus
  const [formError, setFormError] = useState("");

  // Default selection when modal opens
  const openModalForAsset = (assetId?: string) => {
    setSelectedAssetId(assetId || assets[0]?.id || "");
    setServiceDate(new Date().toISOString().split("T")[0]);
    setServiceType("Routine");
    setTechnician("");
    setServiceCost(0);
    setServiceNotes("");
    setPostServiceStatus("keep");
    setFormError("");
    setShowAddModal(true);
  };

  const handleSaveServiceRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAssetId = selectedAssetId || assets[0]?.id || "";
    if (!targetAssetId) {
      setFormError("Please select an asset to log servicing for.");
      return;
    }
    if (!technician.trim()) {
      setFormError("Please enter the name of the technician or servicing vendor.");
      return;
    }
    if (!serviceNotes.trim()) {
      setFormError("Please enter maintenance details/notes.");
      return;
    }

    const newLog: MaintenanceLog = {
      id: `m-${Date.now()}`,
      date: serviceDate,
      type: serviceType,
      cost: Number(serviceCost) || 0,
      technician: technician.trim(),
      notes: serviceNotes.trim()
    };

    let updatedStatus: AssetStatus | undefined = undefined;

    if (postServiceStatus !== "keep") {
      updatedStatus = postServiceStatus as AssetStatus;
    }

    if (onAddMaintenanceRecord) {
      onAddMaintenanceRecord(targetAssetId, newLog, updatedStatus);
    }

    setShowAddModal(false);
  };

  // 1. Get all assets that are currently marked as UNDER_REPAIR or have at least one maintenance log
  const maintenanceAssets = useMemo(() => {
    return assets.filter(asset => {
      const isUnderRepair = asset.status === AssetStatus.UNDER_REPAIR;
      const hasLogs = asset.maintenanceLogs.length > 0;
      
      const matchesSearch = 
        asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.maintenanceLogs.some(l => 
          l.technician.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.notes.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesStatusFilter = 
        filterType === "all" || 
        (filterType === "active" && asset.status === AssetStatus.UNDER_REPAIR) ||
        (filterType === "completed" && asset.status !== AssetStatus.UNDER_REPAIR && hasLogs) ||
        (filterType === asset.status);

      const matchesLogType = 
        logTypeFilter === "all" ||
        asset.maintenanceLogs.some(l => l.type === logTypeFilter);

      return (isUnderRepair || hasLogs) && matchesSearch && matchesStatusFilter && matchesLogType;
    });
  }, [assets, searchQuery, filterType, logTypeFilter]);

  // Aggregate stats
  const totalRepairSpend = useMemo(() => {
    return assets.reduce((sum, asset) => {
      return sum + asset.maintenanceLogs.reduce((logSum, log) => logSum + log.cost, 0);
    }, 0);
  }, [assets]);

  const activeTicketsCount = assets.filter(a => a.status === AssetStatus.UNDER_REPAIR).length;
  
  const totalServiceLogsCount = useMemo(() => {
    return assets.reduce((sum, asset) => sum + asset.maintenanceLogs.length, 0);
  }, [assets]);

  // 📊 EXPORT TO EXCEL (.XLS / .XLSX) FUNCTIONALITY
  const handleExportExcel = () => {
    // Gather all individual service log records
    const allLogRows: any[] = [];
    const summaryRows: any[] = [];

    assets.forEach(asset => {
      if (asset.maintenanceLogs.length > 0) {
        const totalAssetCost = asset.maintenanceLogs.reduce((s, l) => s + l.cost, 0);
        const sortedLogs = [...asset.maintenanceLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const lastLog = sortedLogs[0];

        // Summary sheet row
        summaryRows.push({
          "Asset Tag (ID)": asset.id,
          "Asset Name": asset.name,
          "Category": asset.category,
          "Manufacturer & Model": `${asset.manufacturer} ${asset.model}`,
          "Serial Number": asset.serialNumber,
          "Current Status": asset.status,
          "Total Service Visits": asset.maintenanceLogs.length,
          "Total Maintenance Cost (UGX)": totalAssetCost,
          "Last Serviced Date": lastLog ? lastLog.date : "N/A",
          "Last Service Type": lastLog ? lastLog.type : "N/A",
          "Last Technician / Vendor": lastLog ? lastLog.technician : "N/A",
          "Location / Station": asset.location,
          "Assigned Department": asset.department
        });

        // Individual log rows
        asset.maintenanceLogs.forEach(log => {
          allLogRows.push({
            "Asset Tag (ID)": asset.id,
            "Asset Name": asset.name,
            "Category": asset.category,
            "Manufacturer & Model": `${asset.manufacturer} ${asset.model}`,
            "Serial Number": asset.serialNumber,
            "Service Date": log.date,
            "Service Type": log.type,
            "Technician / Vendor": log.technician,
            "Service Cost (UGX)": log.cost,
            "Service Details & Remarks": log.notes,
            "Current Asset Status": asset.status,
            "Location / Station": asset.location,
            "Assigned Department": asset.department
          });
        });
      }
    });

    if (allLogRows.length === 0) {
      alert("No service/maintenance records found to export.");
      return;
    }

    // Sort log rows by service date descending
    allLogRows.sort((a, b) => new Date(b["Service Date"]).getTime() - new Date(a["Service Date"]).getTime());

    // Create workbook with two sheets
    const workbook = XLSX.utils.book_new();

    const logsSheet = XLSX.utils.json_to_sheet(allLogRows);
    XLSX.utils.book_append_sheet(workbook, logsSheet, "Service Maintenance Logs");

    const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Serviced Assets Summary");

    const todayStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `URC_Asset_Maintenance_Report_${todayStr}.xlsx`);
  };

  return (
    <div className="space-y-6" id="maintenance-hub-tab">
      
      {/* Top Banner with Action Controls */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight font-display">
                Maintenance & Servicing Registry
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Record, track, and export equipment servicing logs across Uganda Railway Corporation depots.
              </p>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onAddServiceIntakeTrigger && (
            <button
              onClick={onAddServiceIntakeTrigger}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
              title="Register a device received for service or repair using full asset enrollment form"
              id="service-intake-enroll-btn"
            >
              <Wrench className="w-4 h-4" />
              <span>+ Service Intake Registration</span>
            </button>
          )}

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs bg-white shrink-0"
            title="Download full maintenance and servicing report as Excel spreadsheet (.xlsx)"
            id="export-maintenance-xls-btn"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Maintenance XLS</span>
          </button>

          <button
            onClick={() => openModalForAsset()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
            id="record-service-log-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Log Service Action</span>
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Spend */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Maintenance Investment</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(totalRepairSpend)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">{totalServiceLogsCount} logged maintenance events</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Active Tickets */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Tickets</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{activeTicketsCount}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Devices currently under repair</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Wrench className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Fleet Availability rate */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fleet Operational Rate</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {assets.length > 0 
                ? Math.round(((assets.length - activeTicketsCount) / assets.length) * 100) 
                : 100}%
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Ready for railway deployment</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filtering Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex flex-col md:flex-row gap-3 justify-between items-center text-xs">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search service logs by asset tag, technician, model, station location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            id="maintenance-search-input"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
          {/* Status filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent font-semibold text-slate-600 focus:outline-none cursor-pointer text-xs"
              id="maintenance-filter-select"
            >
              <option value="all">All Operational Statuses</option>
              <option value="active">Active Tickets (Under Repair)</option>
              <option value="completed">Completed Services</option>
              <option value={AssetStatus.IN_USE}>In Use (Operational)</option>
              <option value={AssetStatus.IN_STORAGE}>In Storage (Spare Pool)</option>
              <option value={AssetStatus.RETIRED}>Retired (Decommissioned)</option>
            </select>
          </div>

          {/* Service Type filter */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <select
              value={logTypeFilter}
              onChange={(e) => setLogTypeFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-600 focus:outline-none cursor-pointer text-xs"
              id="maintenance-type-select"
            >
              <option value="all">All Service Types</option>
              <option value="Routine">Routine Inspection</option>
              <option value="Repair">Hardware Repair</option>
              <option value="Upgrade">System Upgrade</option>
              <option value="Inspection">Audit Check</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Serviced Assets */}
      {maintenanceAssets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-14 px-4 text-center text-slate-400 shadow-xs">
          <Wrench className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Service Records Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            No equipment matches your search filters. Click &quot;Record Service Log&quot; above to log maintenance for any asset.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="maintenance-logs-grid">
          {maintenanceAssets.map(asset => {
            const isUnderRepair = asset.status === AssetStatus.UNDER_REPAIR;
            const sortedLogs = [...asset.maintenanceLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const totalAssetCost = asset.maintenanceLogs.reduce((s, l) => s + l.cost, 0);

            return (
              <div 
                key={asset.id}
                className={`bg-white border rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  isUnderRepair ? "border-amber-300 bg-amber-50/10" : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tracking-wide border border-indigo-100">
                        {asset.id}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">• {asset.category}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                      isUnderRepair ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {asset.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm">{asset.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{asset.manufacturer} {asset.model} • S/N: {asset.serialNumber}</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">📍 {asset.location} ({asset.department})</p>

                  {/* Servicing Logs Breakdown */}
                  <div className="mt-4 bg-slate-50/80 p-3.5 rounded-xl text-xs space-y-2.5 border border-slate-100">
                    <div className="flex items-center justify-between font-bold text-slate-700 border-b border-slate-200 pb-1.5">
                      <span className="flex items-center gap-1">
                        <History className="w-3.5 h-3.5 text-indigo-600" />
                        Service History ({asset.maintenanceLogs.length})
                      </span>
                      <span className="font-mono text-[11px] font-black text-emerald-700">
                        Total: {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(totalAssetCost)}
                      </span>
                    </div>

                    {sortedLogs.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {sortedLogs.map(log => (
                          <div key={log.id} className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {log.type}
                              </span>
                              <span className="font-mono text-slate-400">{log.date}</span>
                            </div>

                            <p className="text-slate-700 text-[11px] font-medium leading-relaxed">
                              {log.notes}
                            </p>

                            <div className="flex justify-between items-center pt-1 text-[10px] text-slate-400 font-bold border-t border-slate-100 mt-1">
                              <span>Technician: {log.technician}</span>
                              <span className="font-mono text-slate-800 font-bold">
                                {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(log.cost)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-[11px] italic">No service logs created yet.</p>
                    )}
                  </div>
                </div>

                {/* Card footer controls */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModalForAsset(asset.id)}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 border border-indigo-100"
                    >
                      <Plus className="w-3 h-3" />
                      Log Service
                    </button>

                    <button
                      onClick={() => onSelectAsset(asset.id)}
                      className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                    >
                      View Detail
                      <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>

                  {isUnderRepair && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => onResolveRepair(asset.id, AssetStatus.IN_USE)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                        id={`resolve-in-use-btn-${asset.id}`}
                      >
                        Resolve: In-Use
                      </button>
                      <button
                        onClick={() => onResolveRepair(asset.id, AssetStatus.IN_STORAGE)}
                        className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                        id={`resolve-storage-btn-${asset.id}`}
                      >
                        Resolve: Storage
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* RECORD ASSET SERVICING & MAINTENANCE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in" id="record-service-modal">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-gray-100 overflow-hidden my-8">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500 rounded-lg text-white">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base tracking-tight font-display">Record Asset Servicing & Maintenance</h3>
                  <p className="text-xs text-slate-300">Log routine inspections, hardware repairs, or upgrades</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveServiceRecord} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Asset Selection */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Select Equipment / Asset *
                </label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-semibold text-slate-800"
                  id="modal-asset-select"
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>
                      [{a.id}] {a.name} — {a.location} ({a.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Service Date & Service Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Servicing Date *
                  </label>
                  <input
                    type="date"
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Service Action Type *
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-semibold"
                  >
                    <option value="Routine">Routine Maintenance</option>
                    <option value="Repair">Hardware Repair</option>
                    <option value="Upgrade">System / Component Upgrade</option>
                    <option value="Inspection">Audit & Diagnostic Inspection</option>
                  </select>
                </div>
              </div>

              {/* Technician / Contractor & Service Cost */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Technician / Service Vendor *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eng. Okello / Nalukolongo Workshop"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Servicing Cost (UGX)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={serviceCost}
                    onChange={(e) => setServiceCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-mono font-bold"
                  />
                </div>
              </div>

              {/* Service Details / Action Notes */}
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Service Work Done & Diagnostic Notes *
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe parts replaced, tests performed, cleaning, software updates, or issues found..."
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-medium leading-relaxed"
                />
              </div>

              {/* Update Asset Status Option */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                  Update Asset Operational Status After Servicing:
                </label>
                <select
                  value={postServiceStatus}
                  onChange={(e) => setPostServiceStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none bg-white font-semibold text-slate-800"
                >
                  <option value="keep">Keep Current Status</option>
                  <option value={AssetStatus.IN_USE}>Set to: In Use (Operational)</option>
                  <option value={AssetStatus.IN_STORAGE}>Set to: In Storage (Spare Pool)</option>
                  <option value={AssetStatus.UNDER_REPAIR}>Set to: Under Repair (Active Ticket)</option>
                  <option value={AssetStatus.RETIRED}>Set to: Retired (Decommissioned)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold cursor-pointer shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Save Service Record
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
