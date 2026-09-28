import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Vessel, Booking, ContainerItem, Invoice } from '../types';

// Collection References
export const VESSELS_COL = 'vessels';
export const BOOKINGS_COL = 'bookings';
export const CONTAINERS_COL = 'containers';
export const INVOICES_COL = 'invoices';

// Initial realistic seed data for Tanjung Priok / Tanjung Perak terminal
const initialVessels: Omit<Vessel, 'id'>[] = [
  {
    name: 'KM Meratus Minahasa',
    imo: 'IMO 9841203',
    callSign: 'YDY8291',
    flag: 'Indonesia 🇮🇩',
    ownerName: 'PT Meratus Line',
    berth: 'Dermaga 01 - Utara',
    status: 'loading_unloading',
    eta: '2026-09-17T06:00',
    etd: '2026-09-18T18:00',
    teusCapacity: 2800,
    currentTeus: 1940,
    craneAssigned: 'Quay Crane STS-01 & STS-02',
    origin: 'Tanjung Perak, Surabaya',
    destination: 'Belawan, Medan',
    draftMeters: 11.2,
    lengthMeters: 198,
    notes: 'Prioritas bongkar kargo dingin reefer komoditas ikan dan buah',
    updatedAt: new Date().toISOString()
  },
  {
    name: 'MV Temas Glory',
    imo: 'IMO 9732104',
    callSign: 'PKTB192',
    flag: 'Indonesia 🇮🇩',
    ownerName: 'PT Temas Tbk',
    berth: 'Dermaga 02 - Barat',
    status: 'berthing',
    eta: '2026-09-17T14:30',
    etd: '2026-09-19T10:00',
    teusCapacity: 1850,
    currentTeus: 1420,
    craneAssigned: 'Quay Crane STS-03',
    origin: 'Makassar, Sulsel',
    destination: 'Tanjung Priok, Jakarta',
    draftMeters: 9.8,
    lengthMeters: 172,
    notes: 'Proses pemasangan tali mooring selesai, bersiap discharge',
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Samudera Mas 09',
    imo: 'IMO 9520481',
    callSign: 'YCM4092',
    flag: 'Indonesia 🇮🇩',
    ownerName: 'PT Samudera Indonesia Tbk',
    berth: 'Anchorage Area B',
    status: 'anchored',
    eta: '2026-09-17T19:00',
    etd: '2026-09-20T04:00',
    teusCapacity: 3200,
    currentTeus: 2750,
    craneAssigned: 'Belum Ditugaskan',
    origin: 'Singapore (SGSIN)',
    destination: 'Tanjung Priok, Jakarta',
    draftMeters: 12.0,
    lengthMeters: 220,
    notes: 'Menunggu slot Dermaga 01 setelah KM Meratus Minahasa lepas sandar',
    updatedAt: new Date().toISOString()
  },
  {
    name: 'Ever Glory V.108',
    imo: 'IMO 9901844',
    callSign: 'BK88102',
    flag: 'Panama 🇵🇦',
    ownerName: 'Evergreen Marine Corp',
    berth: 'Laut Jawa (Approach Way)',
    status: 'at_sea',
    eta: '2026-09-18T08:00',
    etd: '2026-09-21T12:00',
    teusCapacity: 5500,
    currentTeus: 4890,
    craneAssigned: 'STS-01, STS-02 & STS-04',
    origin: 'Port of Shanghai (CNSHA)',
    destination: 'Tanjung Priok -> Singapore',
    draftMeters: 13.5,
    lengthMeters: 285,
    notes: 'Kapal kontainer rute internasional, dokumen manifest Bea Cukai online',
    updatedAt: new Date().toISOString()
  }
];

const initialBookings: Omit<Booking, 'id'>[] = [
  {
    bookingNumber: 'BKG-2026-09-001',
    customerName: 'PT Indofood Sukses Makmur Tbk',
    agentName: 'PT Samudera Logistik Nusantara',
    vesselName: 'KM Meratus Minahasa',
    containerType: '40ft_hc',
    quantity: 12,
    originPort: 'Tanjung Priok (Jakarta)',
    destinationPort: 'Belawan (Medan)',
    cargoDescription: 'Produk Makanan Olahan & Mie Instan Kemasan Ekspor',
    grossWeightTon: 240,
    status: 'loading',
    totalAmount: 48000000,
    paymentStatus: 'paid',
    serviceType: 'domestic',
    createdAt: '2026-09-15T10:00',
    requiredDate: '2026-09-17T18:00',
    notes: 'Peti kemas prioritas muat stack atas'
  },
  {
    bookingNumber: 'BKG-2026-09-002',
    customerName: 'PT Sinarmas Agro Resources',
    agentName: 'PT Temas Line Shipping Agency',
    vesselName: 'MV Temas Glory',
    containerType: '20ft_reefer',
    quantity: 6,
    originPort: 'Makassar (Sulsel)',
    destinationPort: 'Tanjung Priok (Jakarta)',
    cargoDescription: 'Daging Beku & Mentega Dingin Komoditas Pangan',
    grossWeightTon: 110,
    status: 'gate_in',
    totalAmount: 33000000,
    paymentStatus: 'paid',
    serviceType: 'domestic',
    createdAt: '2026-09-16T08:30',
    requiredDate: '2026-09-18T12:00',
    notes: 'Colokan reefer 3-phase 380V aktif terus di yard'
  },
  {
    bookingNumber: 'BKG-2026-09-003',
    customerName: 'PT Astra Otoparts Global',
    agentName: 'PT Andhika Samudera Raya',
    vesselName: 'Ever Glory V.108',
    containerType: '40ft_dry',
    quantity: 8,
    originPort: 'Tanjung Priok (Jakarta)',
    destinationPort: 'Shanghai (China)',
    cargoDescription: 'Komponen Otomotif & Spareparts Transmisi',
    grossWeightTon: 160,
    status: 'approved',
    totalAmount: 56000000,
    paymentStatus: 'unpaid',
    serviceType: 'export',
    createdAt: '2026-09-16T14:15',
    requiredDate: '2026-09-19T06:00',
    notes: 'Menunggu sertifikat fumigasi dan izin Bea Cukai'
  },
  {
    bookingNumber: 'BKG-2026-09-004',
    customerName: 'PT Unilever Oleochemical',
    agentName: 'PT Samudera Logistik Nusantara',
    vesselName: 'Samudera Mas 09',
    containerType: '20ft_dry',
    quantity: 15,
    originPort: 'Belawan (Medan)',
    destinationPort: 'Tanjung Priok (Jakarta)',
    cargoDescription: 'Bahan Baku Sabun & Fatty Acid Kemasan Drum',
    grossWeightTon: 225,
    status: 'pending',
    totalAmount: 42500000,
    paymentStatus: 'unpaid',
    serviceType: 'domestic',
    createdAt: '2026-09-17T09:40',
    requiredDate: '2026-09-20T10:00',
    notes: 'Pengajuan baru dari agen, butuh verifikasi berat'
  }
];

const initialContainers: Omit<ContainerItem, 'id'>[] = [
  {
    containerNumber: 'MSKU 728192-3',
    size: '40ft',
    type: '40ft_hc',
    status: 'yard_storage',
    yardBlock: 'Blok A (Export General)',
    yardRow: 'R-03',
    yardBay: 'B-08',
    yardTier: 2,
    vesselName: 'KM Meratus Minahasa',
    bookingNumber: 'BKG-2026-09-001',
    consignee: 'PT Indofood Sukses Makmur Tbk',
    sealNumber: 'SL-998212',
    grossWeightKg: 28400,
    customsCleared: true,
    gateInDate: '2026-09-16T11:20'
  },
  {
    containerNumber: 'MRTU 419201-9',
    size: '20ft',
    type: '20ft_reefer',
    status: 'yard_storage',
    yardBlock: 'Blok C (Reefer Cold)',
    yardRow: 'R-01',
    yardBay: 'B-02',
    yardTier: 1,
    vesselName: 'MV Temas Glory',
    bookingNumber: 'BKG-2026-09-002',
    consignee: 'PT Sinarmas Agro Resources',
    sealNumber: 'RF-441092',
    grossWeightKg: 19800,
    customsCleared: true,
    reeferTempCelsius: -20.5,
    gateInDate: '2026-09-16T14:40'
  },
  {
    containerNumber: 'TGHU 839210-4',
    size: '40ft',
    type: '40ft_dry',
    status: 'on_vessel',
    yardBlock: 'Blok B (Import General)',
    yardRow: 'R-06',
    yardBay: 'B-14',
    yardTier: 3,
    vesselName: 'KM Meratus Minahasa',
    bookingNumber: 'BKG-2026-09-001',
    consignee: 'PT Astra Otoparts Global',
    sealNumber: 'SL-771829',
    grossWeightKg: 26200,
    customsCleared: true,
    gateInDate: '2026-09-15T09:10'
  },
  {
    containerNumber: 'EGCU 902183-7',
    size: '40ft',
    type: '40ft_dry',
    status: 'inspection',
    yardBlock: 'Blok D (Hazardous DG)',
    yardRow: 'R-02',
    yardBay: 'B-04',
    yardTier: 1,
    vesselName: 'Ever Glory V.108',
    bookingNumber: 'BKG-2026-09-003',
    consignee: 'PT Petrokimia Jaya Sentosa',
    sealNumber: 'DG-110293',
    grossWeightKg: 24100,
    customsCleared: false,
    gateInDate: '2026-09-17T08:00'
  },
  {
    containerNumber: 'SMCU 339218-0',
    size: '20ft',
    type: '20ft_dry',
    status: 'yard_storage',
    yardBlock: 'Blok A (Export General)',
    yardRow: 'R-04',
    yardBay: 'B-10',
    yardTier: 1,
    vesselName: 'Samudera Mas 09',
    bookingNumber: 'BKG-2026-09-004',
    consignee: 'PT Unilever Oleochemical',
    sealNumber: 'SL-884912',
    grossWeightKg: 18500,
    customsCleared: true,
    gateInDate: '2026-09-17T07:30'
  }
];

const initialInvoices: Omit<Invoice, 'id'>[] = [
  {
    invoiceNumber: 'INV-TPK-2026-0041',
    bookingNumber: 'BKG-2026-09-001',
    customerName: 'PT Indofood Sukses Makmur Tbk',
    companyName: 'PT Samudera Logistik Nusantara (Agen)',
    serviceType: 'Terminal Handling Charge (THC) & Stevedoring Muat',
    items: [
      { description: 'THC Container 40ft High Cube (12 Box)', quantity: 12, unitPrice: 2800000, amount: 33600000 },
      { description: 'Stevedoring Quay Crane STS (12 Box)', quantity: 12, unitPrice: 800000, amount: 9600000 },
      { description: 'Lift-on / Lift-off Yard (12 Box)', quantity: 12, unitPrice: 400000, amount: 4800000 }
    ],
    subtotal: 48000000,
    tax: 5280000,
    total: 53280000,
    status: 'paid',
    issueDate: '2026-09-15',
    dueDate: '2026-09-22',
    paidAt: '2026-09-16T15:20',
    paymentMethod: 'Bank Mandiri Virtual Account',
    notes: 'Lunas - Terminal Pass & SPPB disetujui'
  },
  {
    invoiceNumber: 'INV-TPK-2026-0042',
    bookingNumber: 'BKG-2026-09-002',
    customerName: 'PT Sinarmas Agro Resources',
    companyName: 'PT Temas Line Shipping Agency',
    serviceType: 'THC + Reefer Monitoring & Electricity Plug-In',
    items: [
      { description: 'THC Reefer Container 20ft (6 Box)', quantity: 6, unitPrice: 2500000, amount: 15000000 },
      { description: 'Listrik & Monitoring Plug-in Reefer (3 Hari x 6 Box)', quantity: 18, unitPrice: 750000, amount: 13500000 },
      { description: 'Penumpukan Lapangan Khusus Dingin', quantity: 6, unitPrice: 750000, amount: 4500000 }
    ],
    subtotal: 33000000,
    tax: 3630000,
    total: 36630000,
    status: 'paid',
    issueDate: '2026-09-16',
    dueDate: '2026-09-23',
    paidAt: '2026-09-17T09:10',
    paymentMethod: 'BCA Giro / KlikBCA Bisnis',
    notes: 'Suhu stabil -20.5 C'
  },
  {
    invoiceNumber: 'INV-TPK-2026-0043',
    bookingNumber: 'BKG-2026-09-003',
    customerName: 'PT Astra Otoparts Global',
    companyName: 'PT Andhika Samudera Raya',
    serviceType: 'THC Ekspor Internasional & Yard Storage',
    items: [
      { description: 'THC Ekspor 40ft Dry Container (8 Box)', quantity: 8, unitPrice: 4500000, amount: 36000000 },
      { description: 'Surcharge Port Dues & Berth Fee', quantity: 1, unitPrice: 12000000, amount: 12000000 },
      { description: 'Fumigasi & Karantina Dermaga', quantity: 8, unitPrice: 1000000, amount: 8000000 }
    ],
    subtotal: 56000000,
    tax: 6160000,
    total: 62160000,
    status: 'unpaid',
    issueDate: '2026-09-16',
    dueDate: '2026-09-20',
    notes: 'Faktur tempo 4 hari sebelum kapal berangkat'
  },
  {
    invoiceNumber: 'INV-TPK-2026-0044',
    bookingNumber: 'BKG-2026-09-004',
    customerName: 'PT Unilever Oleochemical',
    companyName: 'PT Samudera Logistik Nusantara',
    serviceType: 'Penumpukan Yard & Terminal Handling',
    items: [
      { description: 'THC Container 20ft (15 Box)', quantity: 15, unitPrice: 2100000, amount: 31500000 },
      { description: 'Yard Handling & Forklift Heavy Duty', quantity: 15, unitPrice: 600000, amount: 9000000 },
      { description: 'Gate-In Administrative Fee', quantity: 1, unitPrice: 2000000, amount: 2000000 }
    ],
    subtotal: 42500000,
    tax: 4675000,
    total: 47175000,
    status: 'unpaid',
    issueDate: '2026-09-17',
    dueDate: '2026-09-24',
    notes: 'Menunggu persetujuan manifest kargo agen'
  }
];

// Auto-seed function to ensure Firestore has realistic data on first launch
export async function seedDatabaseIfEmpty() {
  try {
    const vesselSnap = await getDocs(collection(db, VESSELS_COL));
    if (vesselSnap.empty) {
      for (const v of initialVessels) {
        await addDoc(collection(db, VESSELS_COL), v);
      }
    }

    const bookingSnap = await getDocs(collection(db, BOOKINGS_COL));
    if (bookingSnap.empty) {
      for (const b of initialBookings) {
        await addDoc(collection(db, BOOKINGS_COL), b);
      }
    }

    const containerSnap = await getDocs(collection(db, CONTAINERS_COL));
    if (containerSnap.empty) {
      for (const c of initialContainers) {
        await addDoc(collection(db, CONTAINERS_COL), c);
      }
    }

    const invoiceSnap = await getDocs(collection(db, INVOICES_COL));
    if (invoiceSnap.empty) {
      for (const inv of initialInvoices) {
        await addDoc(collection(db, INVOICES_COL), inv);
      }
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Reset / Re-seed function if user wants fresh data
export async function resetDatabaseWithDefaultData() {
  try {
    // Delete existing
    const vSnap = await getDocs(collection(db, VESSELS_COL));
    for (const d of vSnap.docs) await deleteDoc(d.ref);
    for (const v of initialVessels) await addDoc(collection(db, VESSELS_COL), v);

    const bSnap = await getDocs(collection(db, BOOKINGS_COL));
    for (const d of bSnap.docs) await deleteDoc(d.ref);
    for (const b of initialBookings) await addDoc(collection(db, BOOKINGS_COL), b);

    const cSnap = await getDocs(collection(db, CONTAINERS_COL));
    for (const d of cSnap.docs) await deleteDoc(d.ref);
    for (const c of initialContainers) await addDoc(collection(db, CONTAINERS_COL), c);

    const iSnap = await getDocs(collection(db, INVOICES_COL));
    for (const d of iSnap.docs) await deleteDoc(d.ref);
    for (const inv of initialInvoices) await addDoc(collection(db, INVOICES_COL), inv);

    return true;
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
}

// ================= VESSEL CRUD ================= //
export function subscribeVessels(callback: (vessels: Vessel[]) => void) {
  const colRef = collection(db, VESSELS_COL);
  return onSnapshot(colRef, (snapshot) => {
    const list: Vessel[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Vessel));
    callback(list);
  }, (error) => {
    console.error('Error in subscribeVessels:', error);
  });
}

export async function addVessel(vessel: Omit<Vessel, 'id'>) {
  return await addDoc(collection(db, VESSELS_COL), {
    ...vessel,
    updatedAt: new Date().toISOString()
  });
}

export async function updateVessel(id: string, vessel: Partial<Vessel>) {
  const docRef = doc(db, VESSELS_COL, id);
  return await updateDoc(docRef, {
    ...vessel,
    updatedAt: new Date().toISOString()
  });
}

export async function deleteVessel(id: string) {
  const docRef = doc(db, VESSELS_COL, id);
  return await deleteDoc(docRef);
}

// ================= BOOKINGS CRUD ================= //
export function subscribeBookings(callback: (bookings: Booking[]) => void) {
  const colRef = collection(db, BOOKINGS_COL);
  return onSnapshot(colRef, (snapshot) => {
    const list: Booking[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Booking));
    callback(list);
  }, (error) => {
    console.error('Error in subscribeBookings:', error);
  });
}

export async function addBooking(booking: Omit<Booking, 'id'>) {
  return await addDoc(collection(db, BOOKINGS_COL), booking);
}

export async function updateBooking(id: string, booking: Partial<Booking>) {
  const docRef = doc(db, BOOKINGS_COL, id);
  return await updateDoc(docRef, booking);
}

export async function deleteBooking(id: string) {
  const docRef = doc(db, BOOKINGS_COL, id);
  return await deleteDoc(docRef);
}

// ================= CONTAINERS CRUD ================= //
export function subscribeContainers(callback: (containers: ContainerItem[]) => void) {
  const colRef = collection(db, CONTAINERS_COL);
  return onSnapshot(colRef, (snapshot) => {
    const list: ContainerItem[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ContainerItem));
    callback(list);
  }, (error) => {
    console.error('Error in subscribeContainers:', error);
  });
}

export async function addContainer(container: Omit<ContainerItem, 'id'>) {
  return await addDoc(collection(db, CONTAINERS_COL), container);
}

export async function updateContainer(id: string, container: Partial<ContainerItem>) {
  const docRef = doc(db, CONTAINERS_COL, id);
  return await updateDoc(docRef, container);
}

export async function deleteContainer(id: string) {
  const docRef = doc(db, CONTAINERS_COL, id);
  return await deleteDoc(docRef);
}

// ================= INVOICES CRUD ================= //
export function subscribeInvoices(callback: (invoices: Invoice[]) => void) {
  const colRef = collection(db, INVOICES_COL);
  return onSnapshot(colRef, (snapshot) => {
    const list: Invoice[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Invoice));
    callback(list);
  }, (error) => {
    console.error('Error in subscribeInvoices:', error);
  });
}

export async function addInvoice(invoice: Omit<Invoice, 'id'>) {
  return await addDoc(collection(db, INVOICES_COL), invoice);
}

export async function updateInvoice(id: string, invoice: Partial<Invoice>) {
  const docRef = doc(db, INVOICES_COL, id);
  return await updateDoc(docRef, invoice);
}

export async function deleteInvoice(id: string) {
  const docRef = doc(db, INVOICES_COL, id);
  return await deleteDoc(docRef);
}
