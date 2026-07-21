export enum AssetCategory {
  LAPTOP = "Laptop",
  DESKTOP = "Desktop",
  SERVER = "Server",
  NETWORK = "Network Device",
  PRINTER = "Printer",
  PROJECTOR = "Projector",
  TELEPHONE = "VoIP Phone",
  OTHER = "Other"
}

export enum AssetStatus {
  IN_USE = "In Use",
  IN_STORAGE = "In Storage",
  UNDER_REPAIR = "Under Repair",
  RETIRED = "Retired",
  LOST = "Lost"
}

export interface MaintenanceLog {
  id: string;
  date: string;
  type: "Routine" | "Repair" | "Upgrade" | "Inspection";
  cost: number;
  technician: string;
  notes: string;
}

export interface AssignmentHistory {
  id: string;
  assignedTo: string;
  department: string;
  assignedDate: string;
  returnedDate?: string;
  notes?: string;
}

export interface ICTAsset {
  id: string; // Unique Asset Tag (e.g., URC-ICT-2026-001)
  name: string;
  category: AssetCategory;
  status: AssetStatus;
  manufacturer: string;
  model: string;
  serialNumber: string; // Serial number / Service tag
  purchaseDate: string;
  purchaseYear: string; // Year of purchase
  engravedNumber: string; // Engraved number
  operatingSystem: string; // Operating system
  ram: string; // RAM size/type
  hardDisk: string; // Hard Disk size/type
  cost: number;
  warrantyExpiry: string;
  location: string;
  assignedTo: string; // User
  department: string;
  notes: string;
  maintenanceLogs: MaintenanceLog[];
  assignmentHistory: AssignmentHistory[];
  lastUpdated: string;
}

export interface DashboardStats {
  totalAssets: number;
  totalValue: number;
  byStatus: Record<AssetStatus, number>;
  byCategory: Record<AssetCategory, number>;
  upcomingWarrantyExpiringCount: number;
  activeRepairsCount: number;
}
