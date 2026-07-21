import { ICTAsset, AssetCategory, AssetStatus } from "../types";

export const initialAssets: ICTAsset[] = [
  {
    id: "URC-ICT-2024-001",
    name: "Enterprise Core Switch",
    category: AssetCategory.NETWORK,
    status: AssetStatus.IN_USE,
    manufacturer: "Cisco",
    model: "Catalyst 9300 48-Port",
    serialNumber: "SN-CS-9300-4821A",
    purchaseDate: "2024-03-12",
    purchaseYear: "2024",
    engravedNumber: "ENG-NET-2024-110",
    operatingSystem: "Cisco IOS-XE",
    ram: "8GB (Buffer)",
    hardDisk: "16GB Flash",
    cost: 16650000,
    warrantyExpiry: "2029-03-12",
    location: "Main Data Center, Rack A-03",
    assignedTo: "Network Operations Team",
    department: "IT Infrastructure",
    notes: "Core distribution switch for the main campus network. Supports 10G uplinks.",
    maintenanceLogs: [
      {
        id: "m-1",
        date: "2025-01-10",
        type: "Routine",
        cost: 0,
        technician: "Alex K.",
        notes: "Firmware update to version 17.9.4a. No downtime recorded."
      },
      {
        id: "m-2",
        date: "2025-06-15",
        type: "Inspection",
        cost: 555000,
        technician: "Alex K.",
        notes: "Checked redundant power supplies, vacuumed dust from intake fans."
      }
    ],
    assignmentHistory: [
      {
        id: "a-1",
        assignedTo: "Network Operations Team",
        department: "IT Infrastructure",
        assignedDate: "2024-03-12",
        notes: "Initial deployment during network core upgrade."
      }
    ],
    lastUpdated: "2025-06-15T14:30:00Z"
  },
  {
    id: "URC-ICT-2024-002",
    name: "HPC Research Node 1",
    category: AssetCategory.SERVER,
    status: AssetStatus.IN_USE,
    manufacturer: "Dell",
    model: "PowerEdge R760",
    serialNumber: "SN-PE-R760-9988X",
    purchaseDate: "2024-06-20",
    purchaseYear: "2024",
    engravedNumber: "ENG-SRV-2024-004",
    operatingSystem: "Ubuntu Server 22.04 LTS",
    ram: "256GB DDR5 ECC",
    hardDisk: "4TB NVMe SSD RAID1",
    cost: 46250000,
    warrantyExpiry: "2027-06-20",
    location: "Research Lab, Room 302",
    assignedTo: "Dr. Arthur Pendelton",
    department: "Computer Science & Engineering",
    notes: "High Performance Computing node with dual Intel Xeon and 256GB RAM for AI modeling research.",
    maintenanceLogs: [
      {
        id: "m-3",
        date: "2024-11-05",
        type: "Upgrade",
        cost: 8880000,
        technician: "Robert Chen",
        notes: "Installed additional 2x 2TB NVMe SSDs in RAID 1 configuration."
      }
    ],
    assignmentHistory: [
      {
        id: "a-2",
        assignedTo: "Dr. Arthur Pendelton",
        department: "Computer Science & Engineering",
        assignedDate: "2024-06-20",
        notes: "Assigned for machine learning research lab projects."
      }
    ],
    lastUpdated: "2024-11-05T11:15:00Z"
  },
  {
    id: "URC-ICT-2025-015",
    name: "CS Lab Laptop #04",
    category: AssetCategory.LAPTOP,
    status: AssetStatus.IN_USE,
    manufacturer: "Lenovo",
    model: "ThinkPad L14 Gen 4",
    serialNumber: "SN-TP-L14-73821K",
    purchaseDate: "2025-01-15",
    purchaseYear: "2025",
    engravedNumber: "ENG-LAP-2025-301",
    operatingSystem: "Windows 11 Pro",
    ram: "16GB DDR4",
    hardDisk: "512GB NVMe SSD",
    cost: 4070000,
    warrantyExpiry: "2028-01-15",
    location: "Computer Lab 2, Room 105",
    assignedTo: "CS Lab Pool",
    department: "Computer Science",
    notes: "Lab machine for student programming practicals.",
    maintenanceLogs: [],
    assignmentHistory: [
      {
        id: "a-3",
        assignedTo: "CS Lab Pool",
        department: "Computer Science",
        assignedDate: "2025-01-15",
        notes: "Added to computer lab pool for class scheduling."
      }
    ],
    lastUpdated: "2025-01-15T09:00:00Z"
  },
  {
    id: "URC-ICT-2025-032",
    name: "Staff Workstation Laptop",
    category: AssetCategory.LAPTOP,
    status: AssetStatus.UNDER_REPAIR,
    manufacturer: "Apple",
    model: "MacBook Pro 14\" M3",
    serialNumber: "SN-MBP-M3-44551L",
    purchaseDate: "2025-02-10",
    purchaseYear: "2025",
    engravedNumber: "ENG-LAP-2025-042",
    operatingSystem: "macOS Sonoma",
    ram: "18GB Unified Memory",
    hardDisk: "512GB SSD",
    cost: 7400000,
    warrantyExpiry: "2026-02-10",
    location: "Finance Office, Room 204",
    assignedTo: "Sarah Jenkins",
    department: "Finance & Accounts",
    notes: "Assigned to Senior Financial Accountant.",
    maintenanceLogs: [
      {
        id: "m-4",
        date: "2026-07-10",
        type: "Repair",
        cost: 925000,
        technician: "Apple Store Authorized Service",
        notes: "Liquid spill on trackpad. Replacing trackpad and lower chassis under warranty discount."
      }
    ],
    assignmentHistory: [
      {
        id: "a-4",
        assignedTo: "Sarah Jenkins",
        department: "Finance & Accounts",
        assignedDate: "2025-02-12",
        notes: "Primary staff laptop deployment."
      }
    ],
    lastUpdated: "2026-07-10T16:45:00Z"
  },
  {
    id: "URC-ICT-2023-112",
    name: "Admissions Office Printer",
    category: AssetCategory.PRINTER,
    status: AssetStatus.IN_USE,
    manufacturer: "HP",
    model: "LaserJet Pro MFP M428fdw",
    serialNumber: "SN-HP-LJ-99221P",
    purchaseDate: "2023-10-05",
    purchaseYear: "2023",
    engravedNumber: "ENG-PRN-2023-018",
    operatingSystem: "Embedded Real-time OS",
    ram: "512MB",
    hardDisk: "None",
    cost: 2035000,
    warrantyExpiry: "2024-10-05",
    location: "Admissions Hall, Ground Floor",
    assignedTo: "Admissions Team",
    department: "Student Registry",
    notes: "Multifunction network printer, scanner, and copier.",
    maintenanceLogs: [
      {
        id: "m-5",
        date: "2024-04-12",
        type: "Repair",
        cost: 314500,
        technician: "PrintTech Solutions",
        notes: "Cleared severe internal paper jam and replaced fuser rollers."
      },
      {
        id: "m-6",
        date: "2024-10-15",
        type: "Routine",
        cost: 148000,
        technician: "Internal IT",
        notes: "Replaced high-yield toner cartridge and ran self-cleaning cycle."
      }
    ],
    assignmentHistory: [
      {
        id: "a-5",
        assignedTo: "Admissions Team",
        department: "Student Registry",
        assignedDate: "2023-10-06",
        notes: "Installed at Admissions reception counter."
      }
    ],
    lastUpdated: "2024-10-15T10:00:00Z"
  },
  {
    id: "URC-ICT-2023-045",
    name: "Admin Reception PC",
    category: AssetCategory.DESKTOP,
    status: AssetStatus.IN_USE,
    manufacturer: "Dell",
    model: "OptiPlex 7010 SFF",
    serialNumber: "SN-OP-7010-0112A",
    purchaseDate: "2023-04-18",
    purchaseYear: "2023",
    engravedNumber: "ENG-DSK-2023-009",
    operatingSystem: "Windows 10 Pro",
    ram: "16GB DDR4",
    hardDisk: "256GB SSD",
    cost: 3145000,
    warrantyExpiry: "2026-04-18",
    location: "Main Lobby, Reception Desk",
    assignedTo: "Receptionist (Mary Dunhill)",
    department: "Administration",
    notes: "Standard office workstation for guest sign-ins and telephony management.",
    maintenanceLogs: [
      {
        id: "m-7",
        date: "2025-05-14",
        type: "Routine",
        cost: 0,
        technician: "Danielle S.",
        notes: "Cleaned internal fans, upgraded RAM from 8GB to 16GB using spare components."
      }
    ],
    assignmentHistory: [
      {
        id: "a-6",
        assignedTo: "Receptionist (Mary Dunhill)",
        department: "Administration",
        assignedDate: "2023-04-20",
        notes: "Initial deployment."
      }
    ],
    lastUpdated: "2025-05-14T11:00:00Z"
  },
  {
    id: "URC-ICT-2022-098",
    name: "Main Lecture Hall Projector",
    category: AssetCategory.PROJECTOR,
    status: AssetStatus.IN_STORAGE,
    manufacturer: "Epson",
    model: "EB-FH06 3LCD00",
    serialNumber: "SN-EP-FH06-8877G",
    purchaseDate: "2022-09-02",
    purchaseYear: "2022",
    engravedNumber: "ENG-PROJ-2022-054",
    operatingSystem: "Epson Projector OS",
    ram: "256MB",
    hardDisk: "None",
    cost: 2775000,
    warrantyExpiry: "2024-09-02",
    location: "IT Storage Room B",
    assignedTo: "IT Support Services",
    department: "Academic Facilities",
    notes: "Deinstalled from Main Auditorium due to installation of interactive panel. Kept as hot-spare.",
    maintenanceLogs: [
      {
        id: "m-8",
        date: "2025-03-22",
        type: "Routine",
        cost: 444000,
        technician: "Danielle S.",
        notes: "Replaced lamp unit with brand new replacement lamp. Tested and color calibrated."
      }
    ],
    assignmentHistory: [
      {
        id: "a-7",
        assignedTo: "Lecturer Pool",
        department: "Academic Facilities",
        assignedDate: "2022-09-05",
        returnedDate: "2025-03-01",
        notes: "Mounted in Lecture Theatre 1. Deinstalled in March 2025."
      },
      {
        id: "a-8",
        assignedTo: "IT Support Services",
        department: "Academic Facilities",
        assignedDate: "2025-03-01",
        notes: "Placed in storage as a spare unit."
      }
    ],
    lastUpdated: "2025-03-22T13:45:00Z"
  },
  {
    id: "URC-ICT-2025-088",
    name: "Registrar VoIP Office Phone",
    category: AssetCategory.TELEPHONE,
    status: AssetStatus.IN_USE,
    manufacturer: "Poly",
    model: "VVX 250",
    serialNumber: "SN-POLY-250-9944",
    purchaseDate: "2025-05-02",
    purchaseYear: "2025",
    engravedNumber: "ENG-PHN-2025-099",
    operatingSystem: "Poly UC Software (Linux)",
    ram: "512MB",
    hardDisk: "None",
    cost: 666000,
    warrantyExpiry: "2027-05-02",
    location: "Registrar Office, Room 101B",
    assignedTo: "Johnathan Mercer",
    department: "Student Registry",
    notes: "PoE VoIP Desk Phone for international admissions calls.",
    maintenanceLogs: [],
    assignmentHistory: [
      {
        id: "a-9",
        assignedTo: "Johnathan Mercer",
        department: "Student Registry",
        assignedDate: "2025-05-03",
        notes: "Setup and provisioned with SIP line 4201."
      }
    ],
    lastUpdated: "2025-05-03T10:00:00Z"
  },
  {
    id: "URC-ICT-2024-080",
    name: "Staff Desktop - Library Desk 1",
    category: AssetCategory.DESKTOP,
    status: AssetStatus.LOST,
    manufacturer: "Lenovo",
    model: "ThinkCentre M70q Tiny",
    serialNumber: "SN-TC-M70Q-1102A",
    purchaseDate: "2024-10-10",
    purchaseYear: "2024",
    engravedNumber: "ENG-DSK-2024-012",
    operatingSystem: "Windows 11 Pro",
    ram: "8GB DDR4",
    hardDisk: "256GB NVMe SSD",
    cost: 2664000,
    warrantyExpiry: "2027-10-10",
    location: "Public Library, Helpdesk 1",
    assignedTo: "Library Staff Desk 1",
    department: "Library Services",
    notes: "Reported missing during June 2026 audit. Suspected theft from unsecured reception area.",
    maintenanceLogs: [],
    assignmentHistory: [
      {
        id: "a-10",
        assignedTo: "Library Staff Desk 1",
        department: "Library Services",
        assignedDate: "2024-10-12",
        notes: "Assigned for student helpdesk navigation."
      }
    ],
    lastUpdated: "2026-06-30T10:00:00Z"
  },
  {
    id: "URC-ICT-2023-201",
    name: "Security Firewall",
    category: AssetCategory.NETWORK,
    status: AssetStatus.IN_USE,
    manufacturer: "Fortinet",
    model: "FortiGate 100F",
    serialNumber: "SN-FG-100F-8372L",
    purchaseDate: "2023-11-15",
    purchaseYear: "2023",
    engravedNumber: "ENG-SEC-2023-001",
    operatingSystem: "FortiOS 7.2",
    ram: "8GB",
    hardDisk: "120GB SSD (Logs)",
    cost: 14060000,
    warrantyExpiry: "2026-11-15",
    location: "Main Data Center, Rack A-01",
    assignedTo: "Cybersecurity Ops Team",
    department: "IT Security",
    notes: "Next-Generation Firewall (NGFW) protecting all URC servers and user subnets.",
    maintenanceLogs: [
      {
        id: "m-9",
        date: "2024-11-14",
        type: "Routine",
        cost: 5550000,
        technician: "Danielle S.",
        notes: "Renewed 1-year FortiGuard Unified Threat Protection license."
      }
    ],
    assignmentHistory: [
      {
        id: "a-11",
        assignedTo: "Cybersecurity Ops Team",
        department: "IT Security",
        assignedDate: "2023-11-15",
        notes: "Configured rules and placed in main network path."
      }
    ],
    lastUpdated: "2024-11-14T09:00:00Z"
  }
];
