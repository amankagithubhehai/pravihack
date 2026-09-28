export type UserRole =
  | 'Super Admin'
  | 'Organization Admin'
  | 'Asset Manager'
  | 'Employee'
  | 'Auditor';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId?: {
    _id: string;
    name: string;
    code: string;
  };
  departmentId?: {
    _id: string;
    name: string;
    code: string;
  };
  phone?: string;
  avatar?: string;
}

export type AssetCategory =
  | 'Government Buildings & Infrastructure'
  | 'Fleet & Public Transport Vehicles'
  | 'Public Health & Hospital Equipment'
  | 'Civic & Municipal Machinery'
  | 'Emergency & Defense Equipment'
  | 'IT & Surveillance Infrastructure'
  | 'Land & Real Estate'
  | 'Other Public Asset';

export type LifecycleStatus =
  | 'Procurement'
  | 'Received'
  | 'Inventory'
  | 'Assigned'
  | 'Active'
  | 'Maintenance'
  | 'Retired'
  | 'Disposed';

export interface Asset {
  _id: string;
  assetId: string;
  assetName: string;
  category: AssetCategory;
  assetType: string;
  serialNumber?: string;
  organizationId: {
    _id: string;
    name: string;
    code: string;
  };
  departmentId?: {
    _id: string;
    name: string;
    code: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  status: LifecycleStatus;
  location: string;
  district?: string;
  gpsCoordinates?: string;
  cost: number;
  purchaseDate: string;
  warrantyExpiry?: string;
  vendor?: string;
  amcVendor?: string;
  sanctionOrderNo?: string;
  custodianOfficer?: string;
  physicalCondition?: string;
  lastInspectionDate?: string;
  nextInspectionDate?: string;
  qrCodeUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Assignment {
  _id: string;
  assetId: Asset;
  organizationId: string;
  userId: User;
  assignedBy: User;
  assignedDate: string;
  returnDate?: string;
  status: 'Requested' | 'Approved' | 'Active' | 'Returned' | 'Rejected';
  purpose: string;
  conditionOnAssign: string;
  conditionOnReturn?: string;
  remarks?: string;
}

export interface Maintenance {
  _id: string;
  assetId: Asset;
  title: string;
  description: string;
  maintenanceType: 'Routine' | 'Preventive' | 'Corrective' | 'Emergency' | 'AMC';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  scheduledDate: string;
  completedDate?: string;
  cost: number;
  vendor: string;
  technicianName: string;
  serviceReport?: string;
  performedBy?: User;
}

export interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  assetId?: Asset;
  reportedBy: User;
  assignedTo?: User;
  ticketType: 'Hardware Failure' | 'Software Issue' | 'Network Problem' | 'Security Incident' | 'General Request';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
  resolutionNotes?: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: string;
  category: string;
  assetId?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  timestamp: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS' | 'MAINTENANCE' | 'WARRANTY';
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalAssets: number;
  activeAssets: number;
  assignedAssets: number;
  inventoryAssets: number;
  maintenanceAssets: number;
  retiredAssets: number;
  disposedAssets: number;
  totalAssetValue: number;
  totalMaintenanceCost: number;
  openTicketsCount: number;
  userCount: number;
  deptCount: number;
  utilizationRate: number;
}
