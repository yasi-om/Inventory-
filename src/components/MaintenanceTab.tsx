import React, { useState, useMemo } from "react";
import { ICTAsset, AssetStatus, MaintenanceLog, AssetCategory } from "../types";
import { 
  Wrench, 
  Search, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  DollarSign, 
  User, 
  Cpu, 
  Building,
  MapPin,
  Clock,
  ArrowUpRight
} from "lucide-react";

interface MaintenanceTabProps {
  assets: ICTAsset[];
  onSelectAsset: (assetId: string) => void;
  onResolveRepair: (assetId: string, resolvedStatus: AssetStatus) => void;
}

export const MaintenanceTab: React.FC<MaintenanceTabProps> = ({ 
  assets, 
  onSelectAsset,
  onResolveRepair
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

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
        asset.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = 
        filterType === "all" || 
        (filterType === "active" && asset.status === AssetStatus.UNDER_REPAIR) ||
        (filterType === "completed" && asset.status !== AssetStatus.UNDER_REPAIR && hasLogs);

      return (isUnderRepair || hasLogs) && matchesSearch && matchesType;
    });
  }, [assets, searchQuery, filterType]);

  // Aggregate stats
  const totalRepairSpend = useMemo(() => {
    return assets.reduce((sum, asset) => {
      return sum + asset.maintenanceLogs.reduce((logSum, log) => logSum + log.cost, 0);
    }, 0);
  }, [assets]);

  const activeTicketsCount = assets.filter(a => a.status === AssetStatus.UNDER_REPAIR).length;

  return (
    <div className="space-y-6" id="maintenance-hub-tab">
      
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Spend */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Maintenance Investment</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(totalRepairSpend)}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Accumulated service & parts cost</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Active Tickets */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Tickets</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{activeTicketsCount}</h3>
            <p className="text-[10px] text-slate-400 mt-1">Devices currently offline for service</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Wrench className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Integrity rate */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Fleet Availability Rate</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {assets.length > 0 
                ? Math.round(((assets.length - activeTicketsCount) / assets.length) * 100) 
                : 100}%
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Ready for deployment/operation</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filtering Header */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center text-xs">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search service logs by asset tag, model, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            id="maintenance-search-input"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Filter Status:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-gray-50 font-semibold text-slate-600 focus:outline-none cursor-pointer flex-1 md:flex-none"
            id="maintenance-filter-select"
          >
            <option value="all">All Service Records</option>
            <option value="active">Active Service Tickets (Under Repair)</option>
            <option value="completed">Completed Services</option>
          </select>
        </div>
      </div>

      {/* Grid of logs/issues */}
      {maintenanceAssets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-14 px-4 text-center text-slate-400 shadow-sm">
          <Wrench className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <h4 className="text-base font-bold text-slate-700">No Service Records Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            No devices match your service filters. Hardware operations are fully functional!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="maintenance-logs-grid">
          {maintenanceAssets.map(asset => {
            const isUnderRepair = asset.status === AssetStatus.UNDER_REPAIR;
            
            // Get latest log
            const latestLog = [...asset.maintenanceLogs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

            return (
              <div 
                key={asset.id}
                className={`bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isUnderRepair ? "border-amber-300 bg-amber-50/5" : "border-slate-200"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tracking-wide border border-indigo-100">
                        {asset.id}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">• {asset.category}</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                      isUnderRepair ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}>
                      {isUnderRepair ? "Service Active" : "Operational"}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-sm">{asset.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{asset.manufacturer} {asset.model}</p>

                  {/* Service Card Body */}
                  <div className="mt-4 bg-slate-50/80 p-3.5 rounded-xl text-xs space-y-1.5 border border-slate-100">
                    <div className="flex items-center justify-between font-bold text-slate-700 border-b border-slate-200 pb-1.5 mb-1.5">
                      <span className="flex items-center gap-1">
                        <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                        {isUnderRepair ? "Active Diagnostics" : "Last Service Entry"}
                      </span>
                      {latestLog && <span className="font-mono text-[10px] text-slate-400">{latestLog.date}</span>}
                    </div>

                    {latestLog ? (
                      <div className="space-y-1">
                        <p className="text-slate-600 leading-relaxed font-medium italic">
                          &ldquo;{latestLog.notes}&rdquo;
                        </p>
                        <div className="flex justify-between items-center pt-2 text-[10px] text-slate-400 font-bold">
                          <span>Technician: {latestLog.technician}</span>
                          <span className="bg-slate-200/60 px-1.5 py-0.5 rounded border border-slate-300 text-slate-700 font-mono font-bold">
                            {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(latestLog.cost)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-400 text-[11px] italic">No detailed maintenance logs created.</p>
                    )}
                  </div>
                </div>

                {/* Card footer controls */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onSelectAsset(asset.id)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    Manage Record Detail
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  {isUnderRepair && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onResolveRepair(asset.id, AssetStatus.IN_USE)}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                        id={`resolve-in-use-btn-${asset.id}`}
                      >
                        Resolve to In-Use
                      </button>
                      <button
                        onClick={() => onResolveRepair(asset.id, AssetStatus.IN_STORAGE)}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                        id={`resolve-storage-btn-${asset.id}`}
                      >
                        Resolve to Storage
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
