import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { ICTAsset, AssetCategory, AssetStatus } from "../types";
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Grid, 
  List as ListIcon, 
  Download, 
  Upload, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Tag, 
  CheckCircle2, 
  ShieldAlert,
  MapPin,
  Laptop,
  Server,
  Network,
  Printer,
  Projector,
  Phone,
  HelpCircle,
  Plus
} from "lucide-react";

interface AssetListProps {
  assets: ICTAsset[];
  onSelectAsset: (assetId: string) => void;
  onAddAssetTrigger: () => void;
  onImportCsv: (imported: ICTAsset[]) => void;
  selectedStatus?: string;
  onSelectedStatusChange?: (status: string) => void;
  isAdmin?: boolean;
}

export const AssetList: React.FC<AssetListProps> = ({ 
  assets, 
  onSelectAsset, 
  onAddAssetTrigger,
  onImportCsv,
  selectedStatus: propSelectedStatus,
  onSelectedStatusChange,
  isAdmin = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const [selectedStatusLocal, setSelectedStatusLocal] = useState<string>("all");
  const selectedStatus = propSelectedStatus !== undefined ? propSelectedStatus : selectedStatusLocal;
  const setSelectedStatus = (val: string) => {
    setSelectedStatusLocal(val);
    if (onSelectedStatusChange) {
      onSelectedStatusChange(val);
    }
  };

  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("lastUpdated-desc");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Render category icons dynamically
  const getCategoryIcon = (cat: AssetCategory) => {
    switch (cat) {
      case AssetCategory.LAPTOP:
        return <Laptop className="w-4 h-4" />;
      case AssetCategory.SERVER:
        return <Server className="w-4 h-4" />;
      case AssetCategory.NETWORK:
        return <Network className="w-4 h-4" />;
      case AssetCategory.PRINTER:
        return <Printer className="w-4 h-4" />;
      case AssetCategory.PROJECTOR:
        return <Projector className="w-4 h-4" />;
      case AssetCategory.TELEPHONE:
        return <Phone className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const statusColors: Record<AssetStatus, string> = {
    [AssetStatus.IN_USE]: "bg-emerald-50 text-emerald-700 border-emerald-100",
    [AssetStatus.IN_STORAGE]: "bg-blue-50 text-blue-700 border-blue-100",
    [AssetStatus.UNDER_REPAIR]: "bg-amber-50 text-amber-700 border-amber-100",
    [AssetStatus.RETIRED]: "bg-gray-100 text-gray-700 border-gray-200",
    [AssetStatus.LOST]: "bg-red-50 text-red-700 border-red-100"
  };

  const currentDate = new Date("2026-07-15");

  // 1. Filtering Logic
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Full text search
      const matchesSearch = 
        asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === "all" || asset.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || asset.status === selectedStatus;
      
      let matchesWarranty = true;
      if (selectedWarranty === "active") {
        matchesWarranty = asset.warrantyExpiry ? new Date(asset.warrantyExpiry) >= currentDate : true;
      } else if (selectedWarranty === "expired") {
        matchesWarranty = asset.warrantyExpiry ? new Date(asset.warrantyExpiry) < currentDate : false;
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesWarranty;
    });
  }, [assets, searchTerm, selectedCategory, selectedStatus, selectedWarranty]);

  // 2. Sorting Logic
  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      const [field, direction] = sortBy.split("-");
      const multiplier = direction === "desc" ? -1 : 1;

      if (field === "lastUpdated") {
        return (new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()) * multiplier;
      }
      if (field === "cost") {
        return (a.cost - b.cost) * multiplier;
      }
      if (field === "id") {
        return a.id.localeCompare(b.id) * multiplier;
      }
      if (field === "purchaseDate") {
        return (new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime()) * multiplier;
      }
      return 0;
    });
  }, [filteredAssets, sortBy]);

  // 3. Pagination
  const totalPages = Math.ceil(sortedAssets.length / itemsPerPage) || 1;
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAssets.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAssets, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 4. Multi-Format Bulk Export (CSV & XLS)
  const handleExport = (format: "csv" | "xls") => {
    const headers = [
      "Asset Tag ID", 
      "Name", 
      "Category", 
      "Status", 
      "Manufacturer", 
      "Model", 
      "Serial Number / Service Tag", 
      "Purchase Date", 
      "Year of Purchase", 
      "Engraved ID", 
      "Operating System", 
      "RAM", 
      "Hard Disk", 
      "Cost (UGX)", 
      "Warranty Expiry", 
      "Location", 
      "Assigned Custodian", 
      "Department", 
      "Notes"
    ];

    if (format === "csv") {
      const csvRows = [headers.join(",")];
      assets.forEach(asset => {
        const values = [
          `"${asset.id}"`,
          `"${asset.name.replace(/"/g, '""')}"`,
          `"${asset.category}"`,
          `"${asset.status}"`,
          `"${asset.manufacturer}"`,
          `"${asset.model}"`,
          `"${asset.serialNumber}"`,
          `"${asset.purchaseDate}"`,
          `"${asset.purchaseYear || ""}"`,
          `"${asset.engravedNumber || ""}"`,
          `"${asset.operatingSystem || ""}"`,
          `"${asset.ram || ""}"`,
          `"${asset.hardDisk || ""}"`,
          asset.cost,
          `"${asset.warrantyExpiry || ""}"`,
          `"${asset.location.replace(/"/g, '""')}"`,
          `"${asset.assignedTo.replace(/"/g, '""')}"`,
          `"${asset.department.replace(/"/g, '""')}"`,
          `"${(asset.notes || "").replace(/"/g, '""').replace(/\n/g, " ")}"`
        ];
        csvRows.push(values.join(","));
      });

      const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `URC_ICT_Assets_Backup_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // XLS format - Standard HTML table layout that Excel renders natively
      const escapeHTML = (str: string | number) => {
        return String(str)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      };

      const rows: string[] = [];
      assets.forEach(asset => {
        const rowCells = [
          asset.id,
          asset.name,
          asset.category,
          asset.status,
          asset.manufacturer,
          asset.model,
          asset.serialNumber,
          asset.purchaseDate,
          asset.purchaseYear || "",
          asset.engravedNumber || "",
          asset.operatingSystem || "",
          asset.ram || "",
          asset.hardDisk || "",
          asset.cost,
          asset.warrantyExpiry || "",
          asset.location,
          asset.assignedTo,
          asset.department,
          asset.notes || ""
        ].map(val => `<td>${escapeHTML(val)}</td>`);
        rows.push(`<tr>${rowCells.join("")}</tr>`);
      });

      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8" />
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>Assets Registry</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            table { border-collapse: collapse; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11px; }
            th { background-color: #4f46e5; color: white; font-weight: bold; padding: 6px; border: 1px solid #cbd5e1; }
            td { padding: 6px; border: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <h2>URC ICT Assets Registry Export</h2>
          <p>Export Date: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${escapeHTML(h)}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${rows.join("\n")}
            </tbody>
          </table>
        </body>
        </html>
      `;

      const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `URC_ICT_Assets_Backup_${new Date().toISOString().split("T")[0]}.xls`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 5. Bulk Import (handles both CSV and XLS/XLSX using xlsx library)
  const handleImportSpreadsheetFile = (e: React.ChangeEvent<HTMLInputElement>, mode: "csv" | "excel") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation on extension
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (mode === "csv" && extension !== "csv") {
      alert("Invalid file format. Please upload a .csv file.");
      return;
    }
    if (mode === "excel" && !["xls", "xlsx"].includes(extension || "")) {
      alert("Invalid file format. Please upload a .xls or .xlsx file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) return;

        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Read as 2D array of rows
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        const imported: ICTAsset[] = [];

        // Skip header row at index 0
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          // Clean values from cells
          const cleanValues = row.map(cell => {
            if (cell === undefined || cell === null) return "";
            if (cell instanceof Date) {
              return cell.toISOString().split("T")[0];
            }
            return String(cell).trim();
          });

          // Check if row has enough cells (at least standard identifiers)
          if (cleanValues.length >= 7 && cleanValues[0] && cleanValues[1]) {
            const id = cleanValues[0] || `URC-IMPORT-${Date.now()}-${i}`;
            const name = cleanValues[1] || "Unnamed Imported Asset";
            const category = (cleanValues[2] as AssetCategory) || AssetCategory.OTHER;
            const status = (cleanValues[3] as AssetStatus) || AssetStatus.IN_STORAGE;
            const manufacturer = cleanValues[4] || "Unknown";
            const model = cleanValues[5] || "Unknown";
            const serialNumber = cleanValues[6] || "UNKNOWN";
            const purchaseDate = cleanValues[7] || new Date().toISOString().split("T")[0];
            
            let purchaseYear = "";
            let engravedNumber = "";
            let operatingSystem = "";
            let ram = "";
            let hardDisk = "";
            let cost = 0;
            let warrantyExpiry = "";
            let location = "General Store";
            let assignedTo = "Unassigned";
            let department = "Unassigned";
            let notes = "";

            if (cleanValues.length >= 19) {
              purchaseYear = cleanValues[8] || purchaseDate.split("-")[0];
              engravedNumber = cleanValues[9] || "";
              operatingSystem = cleanValues[10] || "";
              ram = cleanValues[11] || "";
              hardDisk = cleanValues[12] || "";
              cost = parseFloat(cleanValues[13]) || 0;
              warrantyExpiry = cleanValues[14] || "";
              location = cleanValues[15] || "General Store";
              assignedTo = cleanValues[16] || "Unassigned";
              department = cleanValues[17] || "Unassigned";
              notes = cleanValues[18] || "";
            } else {
              purchaseYear = purchaseDate.split("-")[0];
              cost = parseFloat(cleanValues[8]) || 0;
              warrantyExpiry = cleanValues[9] || "";
              location = cleanValues[10] || "General Store";
              assignedTo = cleanValues[11] || "Unassigned";
              department = cleanValues[12] || "Unassigned";
              notes = cleanValues[13] || "";
            }

            imported.push({
              id,
              name,
              category,
              status,
              manufacturer,
              model,
              serialNumber,
              purchaseDate,
              purchaseYear,
              engravedNumber,
              operatingSystem,
              ram,
              hardDisk,
              cost,
              warrantyExpiry,
              location,
              assignedTo,
              department,
              notes,
              maintenanceLogs: [],
              assignmentHistory: [
                {
                  id: `a-${Date.now()}-${i}`,
                  assignedTo,
                  department,
                  assignedDate: purchaseDate,
                  notes: `Imported via bulk ${mode.toUpperCase()} upload`
                }
              ],
              lastUpdated: new Date().toISOString()
            });
          }
        }

        if (imported.length > 0) {
          onImportCsv(imported);
          alert(`Successfully parsed and synchronized ${imported.length} asset records from the ${mode.toUpperCase()} file!`);
        } else {
          alert(`Could not extract valid asset records. Please ensure your ${mode.toUpperCase()} matches the expected headers format.`);
        }
      } catch (err) {
        console.error("Spreadsheet import error:", err);
        alert(`An error occurred while parsing the ${mode.toUpperCase()} file. Please check that it is not corrupted.`);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-4" id="asset-inventory-tab">
      
      {/* 1. Filtering & Search Header Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-4">
        
        {/* Row A: Search input & Add triggers */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search assets by Tag, Serial No, custodian, location, model..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset page on query
              }}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              id="search-assets-input"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* View Mode */}
            <div className="flex border border-slate-200 rounded-lg overflow-hidden p-0.5 bg-gray-50 shrink-0">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                  viewMode === "table" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}
                title="Spreadsheet Table"
                id="view-table-btn"
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
                  viewMode === "grid" ? "bg-white text-gray-800 shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}
                title="Visual Cards Grid"
                id="view-grid-btn"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Export Dropdown */}
            <div className="relative inline-block text-left shrink-0">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-gray-50 rounded-lg text-xs font-semibold text-slate-600 transition-colors cursor-pointer shrink-0 bg-white"
                title="Export assets registry spreadsheet"
                id="export-dropdown-btn"
              >
                <Download className="w-3.5 h-3.5 text-indigo-500" />
                Export Assets
                <span className="text-[9px] text-gray-400">▼</span>
              </button>

              {showExportDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowExportDropdown(false)} 
                  />
                  <div className="absolute right-0 mt-1 w-48 rounded-xl shadow-lg bg-white border border-slate-200 ring-1 ring-black/5 z-50 divide-y divide-slate-100 focus:outline-none animate-fade-in">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleExport("csv");
                          setShowExportDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium cursor-pointer"
                        id="export-csv-opt"
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        Export as CSV (.csv)
                      </button>
                      <button
                        onClick={() => {
                          handleExport("xls");
                          setShowExportDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium cursor-pointer"
                        id="export-xls-opt"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        Export as Excel (.xls)
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Spreadsheet Import (CSV / Excel Selector) */}
            {isAdmin && (
              <div className="flex rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden shrink-0">
                <span className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 border-r border-slate-200">
                  <Upload className="w-3.5 h-3.5" />
                  Import:
                </span>
                
                {/* CSV Option */}
                <label
                  className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors cursor-pointer border-r border-slate-200"
                  title="Import assets from a CSV spreadsheet file"
                  id="import-csv-label"
                >
                  CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleImportSpreadsheetFile(e, "csv")}
                    className="hidden"
                  />
                </label>

                {/* Excel Option */}
                <label
                  className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
                  title="Import assets from an Excel (.xls, .xlsx) file"
                  id="import-excel-label"
                >
                  XLS / XLSX
                  <input
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={(e) => handleImportSpreadsheetFile(e, "excel")}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* Register Trigger */}
            <button
              onClick={onAddAssetTrigger}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer hover:shadow shrink-0"
              id="add-new-asset-trigger"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Asset
            </button>
          </div>

        </div>

        {/* Row B: Multi-faceted Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-50 text-xs">
          <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-bold uppercase tracking-wider text-[10px]">Registry Filters:</span>
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-gray-50 font-semibold text-slate-600 focus:outline-none cursor-pointer"
              id="category-filter-select"
            >
              <option value="all">All Hardware Categories</option>
              {Object.values(AssetCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="flex items-center gap-1">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-gray-50 font-semibold text-slate-600 focus:outline-none cursor-pointer"
              id="status-filter-select"
            >
              <option value="all">All Deployment States</option>
              {Object.values(AssetStatus).map(stat => (
                <option key={stat} value={stat}>{stat}</option>
              ))}
            </select>
          </div>

          {/* Warranty Status */}
          <div className="flex items-center gap-1">
            <select
              value={selectedWarranty}
              onChange={(e) => {
                setSelectedWarranty(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-gray-50 font-semibold text-slate-600 focus:outline-none cursor-pointer"
              id="warranty-filter-select"
            >
              <option value="all">All Warranties</option>
              <option value="active">Active Warranty Cover</option>
              <option value="expired">Expired Warranties</option>
            </select>
          </div>

          {/* Sort Selection */}
          <div className="ml-auto flex items-center gap-1.5 shrink-0">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg bg-gray-50 font-semibold text-slate-600 focus:outline-none cursor-pointer"
              id="sort-select"
            >
              <option value="lastUpdated-desc">Last Audited (Newest)</option>
              <option value="id-asc">Tag ID (A-Z)</option>
              <option value="id-desc">Tag ID (Z-A)</option>
              <option value="cost-desc">Purchase Cost (High-Low)</option>
              <option value="cost-asc">Purchase Cost (Low-High)</option>
              <option value="purchaseDate-desc">Purchase Date (Newest)</option>
            </select>
          </div>

        </div>

      </div>

      {/* 2. Visual Records Presentation */}
      {paginatedAssets.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-14 px-4 text-center text-gray-400 shadow-sm">
          <AlertTriangle className="w-10 h-10 mx-auto text-amber-500 mb-3" />
          <h4 className="text-base font-bold text-gray-700">No Asset Records Match Filters</h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
            Try adjusting your search query, selecting different filter attributes, or registers a new hardware asset.
          </p>
        </div>
      ) : viewMode === "table" ? (
        
        /* TABLE DENSITY VIEW */
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto" id="table-view-container">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <th className="py-4.5 px-6">Asset Tag</th>
                <th className="py-4.5 px-4">Name / Specs</th>
                <th className="py-4.5 px-4">Category</th>
                <th className="py-4.5 px-4">Deployment State</th>
                <th className="py-4.5 px-4">Location</th>
                <th className="py-4.5 px-4">Custodian Assigned</th>
                <th className="py-4.5 px-4 text-right">Procured Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedAssets.map((asset) => {
                const isExpired = asset.warrantyExpiry ? new Date(asset.warrantyExpiry) < currentDate : false;
                
                return (
                  <tr 
                    key={asset.id}
                    onClick={() => onSelectAsset(asset.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    {/* Tag ID */}
                    <td className="py-4 px-6">
                      <span className="font-mono font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded tracking-wide border border-slate-200 group-hover:bg-slate-200/50">
                        {asset.id}
                      </span>
                    </td>

                    {/* Asset Name/Specs */}
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{asset.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {asset.manufacturer} {asset.model} • S/N: {asset.serialNumber}
                        </p>
                      </div>
                    </td>

                    {/* Category with icon */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                        {getCategoryIcon(asset.category)}
                        <span>{asset.category}</span>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border inline-block ${statusColors[asset.status]}`}>
                        {asset.status}
                      </span>
                    </td>

                    {/* Physical Location */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 text-gray-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                        <span className="truncate max-w-[140px]">{asset.location}</span>
                      </div>
                    </td>

                    {/* Assigned Custodian */}
                    <td className="py-4 px-4 text-gray-600 font-semibold">
                      {asset.assignedTo || "Unassigned"}
                    </td>

                    {/* Value */}
                    <td className="py-4 px-4 text-right font-mono font-semibold text-slate-800 text-sm">
                      {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(asset.cost)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      ) : (

        /* GRID/CARD DENSITY VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="grid-view-container">
          {paginatedAssets.map((asset) => {
            const isExpired = asset.warrantyExpiry ? new Date(asset.warrantyExpiry) < currentDate : false;
            
            return (
              <div
                key={asset.id}
                onClick={() => onSelectAsset(asset.id)}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all flex flex-col justify-between group h-full"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded tracking-wider">
                      {asset.id}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${statusColors[asset.status]}`}>
                      {asset.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">{asset.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{asset.manufacturer} {asset.model}</p>

                  <div className="mt-4 space-y-2.5 text-[11px] leading-relaxed border-t border-dotted border-gray-100 pt-3">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{asset.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      {getCategoryIcon(asset.category)}
                      <span className="font-semibold">{asset.category}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Acquisition Price</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    {new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(asset.cost)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      )}

      {/* 3. Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-xs font-semibold text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
            <span className="font-bold text-slate-800">
              {Math.min(currentPage * itemsPerPage, sortedAssets.length)}
            </span>{" "}
            of <span className="font-bold text-slate-800">{sortedAssets.length}</span> results
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border border-gray-200 cursor-pointer transition-colors ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed text-gray-300" : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg border border-gray-200 cursor-pointer transition-colors ${
                currentPage === totalPages ? "opacity-50 cursor-not-allowed text-gray-300" : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
