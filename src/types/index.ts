export type UserRole = 'admin' | 'ship_owner' | 'agent' | 'customer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  companyName: string;
  phone?: string;
  avatarUrl?: string;
}

export type VesselStatus = 'at_sea' | 'anchored' | 'berthing' | 'loading_unloading' | 'departed';

export interface Vessel {
  id?: string;
  name: string;
  imo: string;
  callSign: string;
  flag: string;
  ownerName: string;
  berth: string; // e.g. "Dermaga 01", "Dermaga 02"
  status: VesselStatus;
  eta: string; // ISO string or datetime-local
  etd: string;
  teusCapacity: number;
  currentTeus: number;
  craneAssigned: string; // e.g. "STS Crane 01 & 02"
  origin: string;
  destination: string;
  draftMeters: number;
  lengthMeters: number;
  notes?: string;
  updatedAt?: string;
}

export type BookingStatus = 'pending' | 'approved' | 'gate_in' | 'loading' | 'completed' | 'cancelled';
export type ContainerType = '20ft_dry' | '40ft_dry' | '40ft_hc' | '20ft_reefer' | '40ft_reefer' | 'open_top';

export interface Booking {
  id?: string;
  bookingNumber: string;
  customerName: string;
  agentName: string;
  vesselId?: string;
  vesselName: string;
  containerType: ContainerType;
  quantity: number;
  originPort: string;
  destinationPort: string;
  cargoDescription: string;
  grossWeightTon: number;
  status: BookingStatus;
  totalAmount: number;
  paymentStatus: 'unpaid' | 'paid' | 'partial';
  serviceType: 'export' | 'import' | 'transhipment' | 'domestic';
  createdAt: string;
  requiredDate: string;
  notes?: string;
}

export type YardBlock = 'Blok A (Export General)' | 'Blok B (Import General)' | 'Blok C (Reefer Cold)' | 'Blok D (Hazardous DG)';

export interface ContainerItem {
  id?: string;
  containerNumber: string; // e.g. MSKU 728192-3
  size: '20ft' | '40ft' | '45ft';
  type: ContainerType;
  status: 'yard_storage' | 'on_vessel' | 'gate_out' | 'customs_hold' | 'inspection';
  yardBlock: YardBlock;
  yardRow: string; // e.g. "R-04"
  yardTier: number; // e.g. 1, 2, 3, 4
  yardBay: string; // e.g. "B-12"
  vesselName: string;
  bookingNumber?: string;
  consignee: string;
  sealNumber: string;
  grossWeightKg: number;
  customsCleared: boolean;
  reeferTempCelsius?: number;
  gateInDate: string;
  gateOutDate?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  bookingId?: string;
  bookingNumber?: string;
  customerName: string;
  companyName: string;
  serviceType: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number; // 11% PPN
  total: number;
  status: 'unpaid' | 'paid' | 'overdue';
  dueDate: string;
  issueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  notes?: string;
}
