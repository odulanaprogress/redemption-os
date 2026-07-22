// ─── Navigation / Map Types ──────────────────────────────────────────────────
export interface LatLng {
  lat: number;
  lng: number;
}

export type DestinationCategory =
  | 'auditorium'
  | 'gate'
  | 'facility'
  | 'food'
  | 'transit'
  | 'hostel'
  | 'office';

export interface Destination {
  id: string;
  name: string;
  aliases: string[];
  coordinates: LatLng;
  category: DestinationCategory;
}

// User Types
export type UserRole =
  | 'admin'
  | 'attendee'
  | 'parent'
  | 'volunteer'
  | 'security'
  | 'vendor'
  | 'delivery_personnel';

export interface User {
  uid: string;
  sessionId?: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  role: UserRole;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  metadata?: {
    lastLogin?: Date;
    loginCount?: number;
  };
}

export interface UserProfile extends User {
  address?: string;
  emergencyContact?: EmergencyContact;
  preferences?: UserPreferences;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  alternatePhone?: string;
}

export interface UserPreferences {
  notifications: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  language: string;
  theme: 'light' | 'dark';
}

// Family Member Types
export interface FamilyMember {
  id: string;
  sessionId?: string;
  parentId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  photoURL?: string;
  qrCode?: string;
  allergies?: string[];
  medicalNotes?: string;
  emergencyContact: EmergencyContact;
  assignedZone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// QR Tag Types
export interface QRTag {
  id: string;
  familyMemberId: string;
  qrCodeData: string;
  qrCodeURL: string;
  printable: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

// Incident Types
export type IncidentType =
  | 'medical'
  | 'security'
  | 'lost_child'
  | 'facility'
  | 'other';

export type IncidentStatus =
  | 'reported'
  | 'acknowledged'
  | 'in_progress'
  | 'resolved'
  | 'closed';

export type IncidentPriority =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

export interface Incident {
  id: string;
  sessionId?: string;
  reportedBy: string;
  type: IncidentType;
  priority: IncidentPriority;
  status: IncidentStatus;
  title: string;
  description: string;
  location: {
    zone: string;
    building?: string;
    room?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  assignedTo?: string[];
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

// Signal Types
export interface Signal {
  id: string;
  sessionId?: string;
  userId: string;
  type: 'concern' | 'suggestion' | 'praise' | 'emergency';
  category: string;
  message: string;
  anonymous: boolean;
  location?: string;
  attachments?: string[];
  status: 'pending' | 'reviewed' | 'addressed';
  createdAt: Date;
  updatedAt: Date;
}

// Vendor Types
export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Vendor {
  id: string;
  sessionId?: string;
  userId: string;
  businessName: string;
  description: string;
  logo?: string;
  category: string[];
  status: VendorStatus;
  rating: number;
  totalSales: number;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  documents?: string[];
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

// Product Types
export interface Product {
  id: string;
  sessionId?: string;
  vendorId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  inStock: boolean;
  stockQuantity: number;
  tags: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  vendorId: string;
}

export interface Order {
  id: string;
  sessionId?: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  deliveryAddress: string;
  deliveryInstructions?: string;
  paymentMethod: 'card' | 'cash' | 'mobile_money';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  deliveryPersonnelId?: string;
  estimatedDeliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Delivery Types
export type DeliveryStatus =
  | 'assigned'
  | 'picked_up'
  | 'in_transit'
  | 'nearby'
  | 'delivered'
  | 'failed';

export interface Delivery {
  id: string;
  sessionId?: string;
  orderId: string;
  deliveryPersonnelId: string;
  status: DeliveryStatus;
  pickupLocation: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  deliveryLocation: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  currentLocation?: {
    lat: number;
    lng: number;
  };
  estimatedArrival?: Date;
  actualPickupTime?: Date;
  actualDeliveryTime?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Notification Types
export type NotificationType =
  | 'info'
  | 'warning'
  | 'alert'
  | 'success'
  | 'emergency';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  metadata?: {
    timestamp: Date;
    requestId?: string;
  };
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
