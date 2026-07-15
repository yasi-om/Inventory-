import React, { useState } from "react";
import { ICTAsset, AssetCategory, AssetStatus } from "../types";
import { 
  Laptop, 
  Server, 
  Settings, 
  ShieldAlert, 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  Wrench, 
  MapPin, 
  ArrowRight,
  ShieldAlert as ShieldIcon
} from "lucide-react";
import { motion } from "motion/react";

interface DashboardProps {
  assets: ICTAsset[];
  onSelectAsset: (assetId: string) => void;
  onNavigateToTab: (tab: "inventory" | "maintenance") => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ assets, onSelectAsset, onNavigateToTab }) => {
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // 1. Calculations & Metrics
  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, asset) => sum + (asset.status !== AssetStatus.RETIRED ? asset.cost : 0), 0);
  const activeRepairsCount = assets.filter(a => a.status === AssetStatus.UNDER_REPAIR).length;

  // Determine expiring warranties (e.g., expired or expiring within 6 months of current fake date 2026-07-15)
  const currentDate = new Date("2026-07-15");
  const upcomingWarrantyExpiringCount = assets.filter(asset => {
    if (!asset.warrantyExpiry) return false;
    const expiry = new Date(asset.warrantyExpiry);
    const diffTime = expiry.getTime() - currentDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 180; // Expired or expiring within 180 days
  }).length;

  // Status distributions
  const statusCounts = Object.values(AssetStatus).reduce((acc, status) => {
    acc[status] = assets.filter(a => a.status === status).length;
    return acc;
  }, {} as Record<AssetStatus, number>);

  // Category distributions
  const categoryCounts = Object.values(AssetCategory).reduce((acc, cat) => {
    acc[cat] = assets.filter(a => a.category === cat).length;
    return acc;
  }, {} as Record<AssetCategory, number>);

  // Color mapping for Statuses
  const statusColors: Record<AssetStatus, { fill: string; bg: string; text: string }> = {
    [AssetStatus.IN_USE]: { fill: "#10b981", bg: "bg-emerald-50", text: "text-emerald-700" },      // Emerald
    [AssetStatus.IN_STORAGE]: { fill: "#3b82f6", bg: "bg-blue-50", text: "text-blue-700" },       // Blue
    [AssetStatus.UNDER_REPAIR]: { fill: "#f59e0b", bg: "bg-amber-50", text: "text-amber-700" },    // Amber
    [AssetStatus.RETIRED]: { fill: "#6b7280", bg: "bg-gray-100", text: "text-gray-700" },       // Gray
    [AssetStatus.LOST]: { fill: "#ef4444", bg: "bg-red-50", text: "text-red-700" }              // Red
  };

  // Color mapping for Categories
  const categoryColors: Record<AssetCategory, string> = {
    [AssetCategory.LAPTOP]: "bg-indigo-600",
    [AssetCategory.DESKTOP]: "bg-sky-500",
    [AssetCategory.SERVER]: "bg-violet-600",
    [AssetCategory.NETWORK]: "bg-emerald-600",
    [AssetCategory.PRINTER]: "bg-amber-500",
    [AssetCategory.PROJECTOR]: "bg-rose-500",
    [AssetCategory.TELEPHONE]: "bg-cyan-500",
    [AssetCategory.OTHER]: "bg-slate-500"
  };

  // Format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(val);
  };

  // 2. Custom SVG Donut calculations for Status Chart
  const statusData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([status, count]) => ({
      name: status as AssetStatus,
      value: count,
      percent: (count / totalAssets) * 100,
      color: statusColors[status as AssetStatus].fill
    }));

  let accumulatedPercent = 0;

  // Assets needing immediate review (under-repair, lost, or warranty expired)
  const criticalAssets = assets.filter(a => {
    const isCriticalStatus = a.status === AssetStatus.UNDER_REPAIR || a.status === AssetStatus.LOST;
    const isExpiredWarranty = a.warrantyExpiry ? new Date(a.warrantyExpiry) < currentDate : false;
    return isCriticalStatus || isExpiredWarranty;
  }).slice(0, 4);

  return (
    <div className="space-y-6" id="dashboard-tab">
      {/* 1. Header Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assets */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Registered Assets</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalAssets}</h3>
            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              {statusCounts[AssetStatus.IN_USE]} Currently In Active Use
            </p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Laptop className="w-6 h-6" />
          </div>
        </div>

        {/* Total Net Value */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Asset Valuation (Excl. Retired)</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(totalValue)}</h3>
            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Capital investment index</span>
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <span className="text-xs font-black font-sans">UGX</span>
          </div>
        </div>

        {/* Assets Under Repair */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Service Actions</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{activeRepairsCount}</h3>
            <button 
              onClick={() => onNavigateToTab("maintenance")}
              className="text-xs text-amber-600 font-medium hover:underline mt-1.5 flex items-center gap-1 text-left cursor-pointer"
            >
              <Wrench className="w-3 h-3" />
              View repair log tickets &rarr;
            </button>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* Warranty Expiring Alerts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Warranty Alerts (6m)</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">{upcomingWarrantyExpiringCount}</h3>
            <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
              <span>Require SLA/renewal checks</span>
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <ShieldIcon className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Status Donut Chart - 5 Cols */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Operational Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">Inventory distribution by active state</p>
          </div>

          <div className="my-6 flex justify-center items-center relative">
            <svg width="200" height="200" viewBox="0 0 42 42" className="transform -rotate-90">
              {/* Underlay Circle */}
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f3f4f6" strokeWidth="4.2" />
              
              {/* Dynamic status arcs */}
              {statusData.map((item, index) => {
                const strokeDashArray = `${item.percent} ${100 - item.percent}`;
                const strokeDashOffset = 100 - accumulatedPercent;
                accumulatedPercent += item.percent;

                const isHovered = hoveredStatus === item.name;

                return (
                  <circle
                    key={index}
                    cx="21"
                    cy="21"
                    r="15.915"
                    fill="transparent"
                    stroke={item.color}
                    strokeWidth={isHovered ? "5.4" : "4.2"}
                    strokeDasharray={strokeDashArray}
                    strokeDashoffset={strokeDashOffset}
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredStatus(item.name)}
                    onMouseLeave={() => setHoveredStatus(null)}
                  />
                );
              })}
            </svg>

            {/* Inner text overlay */}
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-gray-800">
                {hoveredStatus ? statusCounts[hoveredStatus as AssetStatus] : totalAssets}
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {hoveredStatus ? hoveredStatus : "Total Units"}
              </span>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="space-y-2 mt-2">
            {Object.entries(statusCounts).map(([status, count]) => {
              const info = statusColors[status as AssetStatus];
              const pct = totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0;
              const isHovered = hoveredStatus === status;

              return (
                <div
                  key={status}
                  className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
                    isHovered ? "bg-gray-50" : ""
                  }`}
                  onMouseEnter={() => setHoveredStatus(status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full inline-block shrink-0" 
                      style={{ backgroundColor: info.fill }}
                    />
                    <span className="text-xs font-semibold text-gray-600">{status}</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-mono">
                    <span className="text-xs font-bold text-gray-800">{count}</span>
                    <span className="text-[10px] text-gray-400 font-bold w-8 text-right">{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Distribution Bar Chart - 7 Cols */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Category Allocation</h3>
            <p className="text-xs text-slate-400 mt-0.5">Asset volume grouped by hardware type</p>
          </div>

          {/* Interactive Custom Bar List */}
          <div className="space-y-3.5 my-6">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const maxCount = Math.max(...Object.values(categoryCounts), 1);
              const barWidthPercent = (count / maxCount) * 100;
              const colorClass = categoryColors[cat as AssetCategory];
              const isHovered = hoveredCategory === cat;

              return (
                <div 
                  key={cat}
                  className="space-y-1"
                  onMouseEnter={() => setHoveredCategory(cat)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-700">{cat}</span>
                    <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded-full text-[10px]">{count} units</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full ${colorClass} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${barWidthPercent}%` }}
                    />
                    {isHovered && (
                      <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URC Core Infrastructure</span>
            <button
              onClick={() => onNavigateToTab("inventory")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Browse Asset Registry
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* 3. Bottom Row - System Alerts & Critical Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Alerts & Advisories */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              SLA & Maintenance Alerts
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">High priority system warnings requiring attention</p>
          </div>

          <div className="space-y-3 mt-4 flex-1">
            {/* Alert items */}
            {assets.filter(a => a.status === AssetStatus.LOST).map(asset => (
              <div key={asset.id} className="flex items-start gap-3 p-3 bg-red-50/75 border border-red-100 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-red-800">Critical: Missing Asset</span>
                  <p className="text-gray-600 mt-0.5">
                    {asset.name} (<span className="font-mono font-bold">{asset.id}</span>) is marked as <strong>LOST</strong> in {asset.location}. Audit logged on {new Date(asset.lastUpdated).toLocaleDateString()}.
                  </p>
                </div>
              </div>
            ))}

            {assets.filter(a => {
              if (!a.warrantyExpiry) return false;
              return new Date(a.warrantyExpiry) < currentDate;
            }).slice(0, 2).map(asset => (
              <div key={asset.id} className="flex items-start gap-3 p-3 bg-amber-50/75 border border-amber-100 rounded-xl">
                <ShieldIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-amber-800">Warranty Expired</span>
                  <p className="text-gray-600 mt-0.5">
                    SLA warranty cover for {asset.manufacturer} {asset.model} (<span className="font-mono font-bold">{asset.id}</span>) expired on {new Date(asset.warrantyExpiry!).toLocaleDateString()}.
                  </p>
                </div>
              </div>
            ))}

            {assets.filter(a => a.status === AssetStatus.UNDER_REPAIR).slice(0, 1).map(asset => (
              <div key={asset.id} className="flex items-start gap-3 p-3 bg-indigo-50/75 border border-indigo-100 rounded-xl">
                <Wrench className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-indigo-800">Service Ticket Active</span>
                  <p className="text-gray-600 mt-0.5">
                    {asset.name} (<span className="font-mono font-bold">{asset.id}</span>) is undergoing hardware maintenance.
                  </p>
                </div>
              </div>
            ))}

            {assets.filter(a => a.status === AssetStatus.LOST).length === 0 && 
             assets.filter(a => a.warrantyExpiry ? new Date(a.warrantyExpiry) < currentDate : false).length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-10 text-center">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                  <CheckCircleIcon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-gray-700">All Core Systems Healthy</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">No active critical alerts or service actions pending.</p>
              </div>
            )}
          </div>
        </div>

        {/* Needs Attention Asset List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-5 h-5 text-indigo-500" />
              Critical Asset Monitoring
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Hardware assets flag-marked for registry review</p>
          </div>

          <div className="space-y-2 mt-4 flex-1">
            {criticalAssets.map(asset => {
              const isLost = asset.status === AssetStatus.LOST;
              const isRepair = asset.status === AssetStatus.UNDER_REPAIR;
              
              return (
                <div 
                  key={asset.id}
                  onClick={() => onSelectAsset(asset.id)}
                  className="flex items-center justify-between p-2.5 hover:bg-gray-50 border border-gray-50 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isLost ? "bg-red-50 text-red-500" : isRepair ? "bg-amber-50 text-amber-500" : "bg-indigo-50 text-indigo-500"
                    }`}>
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{asset.name}</p>
                      <span className="font-mono text-[9px] text-gray-400 font-bold">{asset.id}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      isLost ? "bg-red-100 text-red-700" : isRepair ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {asset.status}
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-700">{formatCurrency(asset.cost)}</span>
                  </div>
                </div>
              );
            })}

            {criticalAssets.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-10 text-center">
                <p className="text-xs text-gray-400">No assets currently flagged for critical monitoring.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

// Helper inside the file to avoid importing unused components
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
