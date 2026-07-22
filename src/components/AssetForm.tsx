import React, { useState, useEffect } from "react";
import { ICTAsset, AssetCategory, AssetStatus, MaintenanceLog } from "../types";
import { X, Save, Plus, AlertCircle, ShieldCheck, Wrench, Package } from "lucide-react";

interface AssetFormProps {
  asset?: ICTAsset | null; // If provided, we are editing
  initialStatus?: AssetStatus;
  isServiceIntake?: boolean;
  onSave: (asset: ICTAsset) => void;
  onClose: () => void;
  existingAssets: ICTAsset[];
}

export const AssetForm: React.FC<AssetFormProps> = ({ 
  asset, 
  initialStatus, 
  isServiceIntake = false, 
  onSave, 
  onClose, 
  existingAssets 
}) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<AssetCategory>(AssetCategory.LAPTOP);
  const [status, setStatus] = useState<AssetStatus>(initialStatus || AssetStatus.IN_STORAGE);
  
  // Registration Destination / Pool selector
  const [registrationType, setRegistrationType] = useState<"operational" | "service">(
    isServiceIntake || initialStatus === AssetStatus.UNDER_REPAIR ? "service" : "operational"
  );

  // Service Intake specific fields
  const [serviceType, setServiceType] = useState<"Routine" | "Repair" | "Upgrade" | "Inspection">("Repair");
  const [serviceTechnician, setServiceTechnician] = useState("");
  const [serviceCost, setServiceCost] = useState<number>(0);
  const [serviceNotes, setServiceNotes] = useState("");

  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [purchaseYear, setPurchaseYear] = useState("");
  const [engravedNumber, setEngravedNumber] = useState("");
  const [operatingSystem, setOperatingSystem] = useState("");
  const [ram, setRam] = useState("");
  const [hardDisk, setHardDisk] = useState("");
  const [cost, setCost] = useState<number>(0);
  const [warrantyExpiry, setWarrantyExpiry] = useState("");
  const [location, setLocation] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [department, setDepartment] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form if editing
  useEffect(() => {
    if (asset) {
      setId(asset.id);
      setName(asset.name);
      setCategory(asset.category);
      setStatus(asset.status);
      setManufacturer(asset.manufacturer);
      setModel(asset.model);
      setSerialNumber(asset.serialNumber);
      setPurchaseDate(asset.purchaseDate);
      setPurchaseYear(asset.purchaseYear || "");
      setEngravedNumber(asset.engravedNumber || "");
      setOperatingSystem(asset.operatingSystem || "");
      setRam(asset.ram || "");
      setHardDisk(asset.hardDisk || "");
      setCost(asset.cost);
      setWarrantyExpiry(asset.warrantyExpiry);
      setLocation(asset.location);
      setAssignedTo(asset.assignedTo);
      setDepartment(asset.department);
      setNotes(asset.notes);
      setRegistrationType(asset.status === AssetStatus.UNDER_REPAIR ? "service" : "operational");
    } else {
      // Suggest next asset tag ID (format: URC-ICT-2026-XXX)
      const currentYear = new Date().getFullYear();
      const yearPrefix = `URC-ICT-${currentYear}-`;
      const sameYearAssets = existingAssets.filter(a => a.id.startsWith(yearPrefix));
      
      let nextNum = 1;
      if (sameYearAssets.length > 0) {
        // Extract numbers and find max
        const nums = sameYearAssets.map(a => {
          const parts = a.id.split("-");
          const endPart = parts[parts.length - 1];
          const parsed = parseInt(endPart, 10);
          return isNaN(parsed) ? 0 : parsed;
        });
        nextNum = Math.max(...nums, 0) + 1;
      }
      
      const paddedNum = String(nextNum).padStart(3, "0");
      setId(`${yearPrefix}${paddedNum}`);
      
      // Default dates
      const today = new Date().toISOString().split("T")[0];
      setPurchaseDate(today);
      setPurchaseYear(String(currentYear));
      setEngravedNumber("");
      setOperatingSystem("");
      setRam("");
      setHardDisk("");
      
      if (isServiceIntake || initialStatus === AssetStatus.UNDER_REPAIR) {
        setStatus(AssetStatus.UNDER_REPAIR);
        setRegistrationType("service");
      } else if (initialStatus) {
        setStatus(initialStatus);
      }

      // Set 3 year default warranty
      const threeYearsLater = new Date();
      threeYearsLater.setFullYear(threeYearsLater.getFullYear() + 3);
      setWarrantyExpiry(threeYearsLater.toISOString().split("T")[0]);
    }
  }, [asset, existingAssets, initialStatus, isServiceIntake]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!id.trim()) {
      newErrors.id = "Asset Tag ID is required.";
    } else if (!asset && existingAssets.some(a => a.id.toLowerCase() === id.trim().toLowerCase())) {
      newErrors.id = "An asset with this Tag ID already exists.";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      newErrors.id = "Tag ID can only contain letters, numbers, hyphens, and underscores.";
    }

    if (!name.trim()) newErrors.name = "Asset Name is required.";
    if (!manufacturer.trim()) newErrors.manufacturer = "Manufacturer is required.";
    if (!model.trim()) newErrors.model = "Model is required.";
    if (!serialNumber.trim()) newErrors.serialNumber = "Serial Number is required.";
    if (!purchaseDate) newErrors.purchaseDate = "Purchase Date is required.";
    if (!purchaseYear.trim()) newErrors.purchaseYear = "Year of Purchase is required.";
    if (cost < 0) newErrors.cost = "Cost must be a positive number.";
    if (!location.trim()) newErrors.location = "Location is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Determine final status based on registration type
    const finalStatus = registrationType === "service" ? AssetStatus.UNDER_REPAIR : status;

    // Prepare initial maintenance logs if registering into service pool
    let initialLogs: MaintenanceLog[] = asset ? asset.maintenanceLogs : [];
    if (!asset && (registrationType === "service" || finalStatus === AssetStatus.UNDER_REPAIR || serviceNotes.trim())) {
      initialLogs = [
        {
          id: `m-${Date.now()}`,
          date: purchaseDate || new Date().toISOString().split("T")[0],
          type: serviceType,
          cost: Number(serviceCost) || 0,
          technician: serviceTechnician.trim() || "Service Workshop Intake",
          notes: serviceNotes.trim() || "Hardware registered directly into Service & Repair Depot for maintenance."
        }
      ];
    }

    const savedAsset: ICTAsset = {
      id: id.trim().toUpperCase(),
      name: name.trim(),
      category,
      status: finalStatus,
      manufacturer: manufacturer.trim(),
      model: model.trim(),
      serialNumber: serialNumber.trim().toUpperCase(),
      purchaseDate,
      purchaseYear: purchaseYear.trim(),
      engravedNumber: engravedNumber.trim().toUpperCase(),
      operatingSystem: operatingSystem.trim(),
      ram: ram.trim(),
      hardDisk: hardDisk.trim(),
      cost,
      warrantyExpiry,
      location: location.trim(),
      assignedTo: assignedTo.trim() || (registrationType === "service" ? "Service Workshop Depot" : "Unassigned"),
      department: department.trim() || (registrationType === "service" ? "ICT Maintenance & Repair" : "Unassigned"),
      notes: notes.trim(),
      maintenanceLogs: initialLogs,
      assignmentHistory: asset ? asset.assignmentHistory : [
        {
          id: `a-${Date.now()}`,
          assignedTo: assignedTo.trim() || (registrationType === "service" ? "Service Workshop Depot" : "IT Storage Room"),
          department: department.trim() || (registrationType === "service" ? "ICT Maintenance & Repair" : "IT Operations"),
          assignedDate: purchaseDate,
          notes: registrationType === "service" 
            ? "Device received directly into Service & Repair Depot" 
            : "Asset registered into active inventory catalog"
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    // If assigned user changed during edit, push to assignment history
    if (asset && asset.assignedTo !== assignedTo.trim()) {
      savedAsset.assignmentHistory = [
        ...asset.assignmentHistory,
        {
          id: `a-${Date.now()}`,
          assignedTo: assignedTo.trim() || "Unassigned",
          department: department.trim() || "Unassigned",
          assignedDate: new Date().toISOString().split("T")[0],
          notes: `Reassigned from ${asset.assignedTo || "Unassigned"}`
        }
      ];
    }

    onSave(savedAsset);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in" id="asset-form-modal">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col my-8 border border-gray-100 max-h-[90vh]">
        {/* Modal Header */}
        <div className={`p-6 border-b flex items-center justify-between ${
          registrationType === "service" ? "bg-amber-500/10 border-amber-200" : "bg-indigo-50/50 border-gray-100"
        }`}>
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              {registrationType === "service" ? (
                <>
                  <Wrench className="w-5 h-5 text-amber-600" />
                  {asset ? "Edit Serviced Device Record" : "Service & Repair Device Intake"}
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 text-indigo-600" />
                  {asset ? "Edit Operational Asset Record" : "Register Operational Asset"}
                </>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {asset 
                ? `Modifying records for Tag ID: ${asset.id}` 
                : registrationType === "service"
                  ? "Enroll a device received for servicing/repair into the Service Depot registry."
                  : "Enroll a hardware asset into the main operational inventory database."
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            id="close-form-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Registration Purpose Switcher (only for new device enrollment) */}
          {!asset && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Registration Pool & Destination <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setRegistrationType("operational");
                    setStatus(AssetStatus.IN_STORAGE);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 cursor-pointer transition-all ${
                    registrationType === "operational"
                      ? "bg-white border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 shadow-xs"
                      : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                  id="pool-operational-btn"
                >
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Main Operational Inventory</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Active equipment (In Use / In Storage)</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRegistrationType("service");
                    setStatus(AssetStatus.UNDER_REPAIR);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 cursor-pointer transition-all ${
                    registrationType === "service"
                      ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-950 shadow-xs"
                      : "bg-white/60 border-slate-200 text-slate-600 hover:bg-white"
                  }`}
                  id="pool-service-btn"
                >
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-lg shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Service & Repair Depot</div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Devices under repair or undergoing maintenance</div>
                  </div>
                </button>
              </div>
            </div>
          )}
          
          {/* Section 1: Unique Identifiers */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              Primary Identification
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Asset Tag ID */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Asset Tag ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={!!asset}
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="e.g. URC-ICT-2026-005"
                  className={`w-full px-3 py-2 border rounded-xl text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    asset ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "border-gray-200"
                  } ${errors.id ? "border-red-300 bg-red-50/20" : ""}`}
                />
                {errors.id && (
                  <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.id}
                  </p>
                )}
              </div>

              {/* Serial Number / Service Tag */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Serial Number / Service Tag <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Manufacturer Serial or Service Tag"
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-200 ${
                    errors.serialNumber ? "border-red-300 bg-red-50/20" : ""
                  }`}
                />
                {errors.serialNumber && (
                  <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.serialNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Asset Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Asset Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. CS Lab Laptop #04, Main Hall Projector"
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-200 ${
                    errors.name ? "border-red-300 bg-red-50/20" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Engraved Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Engraved ID / Tag Number
                </label>
                <input
                  type="text"
                  value={engravedNumber}
                  onChange={(e) => setEngravedNumber(e.target.value)}
                  placeholder="e.g. ENG-LAP-2025-042"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Device Specs & Logistics */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5">
              Specifications & Lifecycle
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AssetCategory)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {Object.values(AssetCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Operational Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AssetStatus)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {Object.values(AssetStatus).map(stat => (
                    <option key={stat} value={stat}>{stat}</option>
                  ))}
                </select>
              </div>

              {/* Manufacturer */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Manufacturer <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="e.g. Dell, Apple, Cisco"
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-200 ${
                    errors.manufacturer ? "border-red-300 bg-red-50/20" : ""
                  }`}
                />
                {errors.manufacturer && (
                  <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.manufacturer}
                  </p>
                )}
              </div>

              {/* Model */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. Latitude 5420, Catalyst 9300"
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-200 ${
                    errors.model ? "border-red-300 bg-red-50/20" : ""
                  }`}
                />
                {errors.model && (
                  <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.model}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* NEW Section 2.5: Technical Specs (Operating System, RAM, Hard Disk) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5">
              Technical Hardware Specs
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Operating System */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Operating System</label>
                <input
                  list="os-options-list"
                  type="text"
                  value={operatingSystem}
                  onChange={(e) => setOperatingSystem(e.target.value)}
                  placeholder="Select or type OS..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <datalist id="os-options-list">
                  <option value="Windows 11 Pro 64-bit" />
                  <option value="Windows 10 Pro 64-bit" />
                  <option value="Ubuntu Server 22.04 LTS" />
                  <option value="macOS Sequoia / Sonoma" />
                  <option value="Cisco IOS XE" />
                  <option value="Embedded Railway Firmware" />
                  <option value="N/A" />
                </datalist>
              </div>

              {/* RAM */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">RAM (Memory)</label>
                <input
                  list="ram-options-list"
                  type="text"
                  value={ram}
                  onChange={(e) => setRam(e.target.value)}
                  placeholder="Select or type RAM..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <datalist id="ram-options-list">
                  <option value="4GB DDR4" />
                  <option value="8GB DDR4" />
                  <option value="16GB DDR4" />
                  <option value="32GB DDR4" />
                  <option value="64GB DDR5" />
                  <option value="128GB ECC Server RAM" />
                  <option value="N/A" />
                </datalist>
              </div>

              {/* Hard Disk */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Hard Disk (Storage)</label>
                <input
                  list="storage-options-list"
                  type="text"
                  value={hardDisk}
                  onChange={(e) => setHardDisk(e.target.value)}
                  placeholder="Select or type storage..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <datalist id="storage-options-list">
                  <option value="256GB NVMe SSD" />
                  <option value="512GB NVMe SSD" />
                  <option value="1TB NVMe SSD" />
                  <option value="2TB Enterprise SSD" />
                  <option value="4TB RAID 10 Array" />
                  <option value="1TB SATA HDD" />
                  <option value="N/A" />
                </datalist>
              </div>
            </div>
          </div>

          {/* Section 3: Value and Coverages */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5">
              Procurement & Warranty
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Cost */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Purchase Cost (UGX)</label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Purchase Date */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Year of Purchase */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Year of Purchase <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={purchaseYear}
                  onChange={(e) => setPurchaseYear(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 2026"
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-200 ${
                    errors.purchaseYear ? "border-red-300 bg-red-50/20" : ""
                  }`}
                />
                {errors.purchaseYear && (
                  <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.purchaseYear}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Warranty Expiry */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Warranty Expiration</label>
                <input
                  type="date"
                  value={warrantyExpiry}
                  onChange={(e) => setWarrantyExpiry(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Assignments & Locations */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5">
              Assigned Ownership & Deployment
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location */}
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Physical Location <span className="text-red-500">*</span>
                </label>
                <input
                  list="location-options-list"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Select or type station location..."
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-200 bg-white ${
                    errors.location ? "border-red-300 bg-red-50/20" : ""
                  }`}
                />
                <datalist id="location-options-list">
                  <option value="Kampala Central Station, Cargo Office" />
                  <option value="Kampala Central Station, Master Office" />
                  <option value="Nalukolongo Workshop, Control Tower" />
                  <option value="Nalukolongo Workshop, Bay B" />
                  <option value="Malaba Border Post, Cargo Terminal" />
                  <option value="Tororo Station Yard" />
                  <option value="Jinja Railway Station" />
                  <option value="Gulu Regional Hub" />
                  <option value="Mukono Inland Container Depot" />
                  <option value="IT Storage Room B" />
                </datalist>
                {errors.location && (
                  <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.location}
                  </p>
                )}
              </div>

              {/* Assigned To / User */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">User / Custodian</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g. Eng. Okello John, ICT Officer Pool"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Department</label>
                <input
                  list="department-options-list"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Select or type department..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
                <datalist id="department-options-list">
                  <option value="Operations & Signaling" />
                  <option value="Mechanical Engineering" />
                  <option value="Freight & Commercial Services" />
                  <option value="Station Operations" />
                  <option value="Civil & Track Engineering" />
                  <option value="ICT & Systems" />
                  <option value="Finance & Administration" />
                  <option value="Executive & Legal" />
                </datalist>
              </div>
            </div>
          </div>

          {/* Section 5: Initial Service Intake Details (if registering into Service Depot) */}
          {registrationType === "service" && (
            <div className="space-y-4 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1.5 border-b border-amber-200 pb-1.5">
                <Wrench className="w-4 h-4 text-amber-600" />
                Initial Service & Maintenance Ticket Details
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Servicing Type</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="Repair">Hardware Repair</option>
                    <option value="Routine">Routine Servicing / Maintenance</option>
                    <option value="Upgrade">System Upgrade</option>
                    <option value="Inspection">Diagnostic Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Technician / Vendor</label>
                  <input
                    type="text"
                    value={serviceTechnician}
                    onChange={(e) => setServiceTechnician(e.target.value)}
                    placeholder="e.g. Workshop Eng. Kato, Dell Uganda"
                    className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Estimated Cost (UGX)</label>
                  <input
                    type="number"
                    value={serviceCost}
                    onChange={(e) => setServiceCost(parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Fault Diagnosis / Service Notes</label>
                <textarea
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  placeholder="e.g. Screen flickering, motherboard power IC fault, scheduled 6-month thermal repaste..."
                  rows={2}
                  className="w-full px-3 py-2 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>
            </div>
          )}

          {/* Section 6: Supplementary Notes */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Notes & General Remarks</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="System memory configurations, network specs, IP addresses, or repair caveats..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

        </form>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
            id="save-asset-btn"
          >
            <Save className="w-4 h-4" />
            Save Asset Record
          </button>
        </div>
      </div>
    </div>
  );
};
