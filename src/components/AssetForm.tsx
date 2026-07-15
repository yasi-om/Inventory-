import React, { useState, useEffect } from "react";
import { ICTAsset, AssetCategory, AssetStatus } from "../types";
import { X, Save, Plus, AlertCircle, ShieldCheck } from "lucide-react";

interface AssetFormProps {
  asset?: ICTAsset | null; // If provided, we are editing
  onSave: (asset: ICTAsset) => void;
  onClose: () => void;
  existingAssets: ICTAsset[];
}

export const AssetForm: React.FC<AssetFormProps> = ({ asset, onSave, onClose, existingAssets }) => {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<AssetCategory>(AssetCategory.LAPTOP);
  const [status, setStatus] = useState<AssetStatus>(AssetStatus.IN_STORAGE);
  const [manufacturer, setManufacturer] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
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
      setCost(asset.cost);
      setWarrantyExpiry(asset.warrantyExpiry);
      setLocation(asset.location);
      setAssignedTo(asset.assignedTo);
      setDepartment(asset.department);
      setNotes(asset.notes);
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
      
      // Set 3 year default warranty
      const threeYearsLater = new Date();
      threeYearsLater.setFullYear(threeYearsLater.getFullYear() + 3);
      setWarrantyExpiry(threeYearsLater.toISOString().split("T")[0]);
    }
  }, [asset, existingAssets]);

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
    if (cost < 0) newErrors.cost = "Cost must be a positive number.";
    if (!location.trim()) newErrors.location = "Location is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const savedAsset: ICTAsset = {
      id: id.trim().toUpperCase(),
      name: name.trim(),
      category,
      status,
      manufacturer: manufacturer.trim(),
      model: model.trim(),
      serialNumber: serialNumber.trim().toUpperCase(),
      purchaseDate,
      cost,
      warrantyExpiry,
      location: location.trim(),
      assignedTo: assignedTo.trim() || "Unassigned",
      department: department.trim() || "Unassigned",
      notes: notes.trim(),
      // Retain or initialize log sheets
      maintenanceLogs: asset ? asset.maintenanceLogs : [],
      assignmentHistory: asset ? asset.assignmentHistory : [
        {
          id: `a-${Date.now()}`,
          assignedTo: assignedTo.trim() || "IT Storage Room",
          department: department.trim() || "IT Operations",
          assignedDate: purchaseDate,
          notes: asset ? "Registry update" : "Asset registered into inventory catalog"
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
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              {asset ? "Edit Asset Records" : "Register New Asset"}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {asset ? `Modifying records for Asset Tag: ${asset.id}` : "Enroll a hardware asset into the URC database directory."}
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

              {/* Serial Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Manufacturer Serial Number"
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

            {/* Asset Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                Asset Name / Description <span className="text-red-500">*</span>
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

          {/* Section 3: Value and Coverages */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-1.5">
              Procurement & Warranty
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Cost */}
              <div>
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
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Science Lab B, Room 12"
                  className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-200 ${
                    errors.location ? "border-red-300 bg-red-50/20" : ""
                  }`}
                />
                {errors.location && (
                  <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {errors.location}
                  </p>
                )}
              </div>

              {/* Assigned To */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Assigned Custodian / User</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="e.g. Jane Doe, CS Staff Pool"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computing, Admin, Library"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Supplementary Notes */}
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
