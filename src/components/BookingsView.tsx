import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { deleteBooking, updateBooking } from '../services/db';
import {
  FileSpreadsheet,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Printer,
  FileCheck,
  ChevronDown,
  Filter,
  ArrowRight,
  Truck
} from 'lucide-react';

interface BookingsViewProps {
  bookings: Booking[];
  onOpenCreate: () => void;
  onEditBooking: (booking: Booking) => void;
  onSelectBookingForDO?: (booking: Booking) => void;
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  bookings,
  onOpenCreate,
  onEditBooking,
  onSelectBookingForDO
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedDoBooking, setSelectedDoBooking] = useState<Booking | null>(null);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.vesselName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.cargoDescription.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Hapus pemesanan kargo ini?')) {
      setDeletingId(id);
      try {
        await deleteBooking(id);
      } catch (err) {
        console.error(err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleStatusChange = async (booking: Booking, newStatus: BookingStatus) => {
    if (!booking.id) return;
    try {
      await updateBooking(booking.id, { status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return { label: 'Diajukan (Pending)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'approved':
        return { label: 'Disetujui (Approved)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'gate_in':
        return { label: 'Gate-In Lapangan', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'loading':
        return { label: 'Proses Muat', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'completed':
        return { label: 'Selesai Berangkat', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      case 'cancelled':
        return { label: 'Dibatalkan', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      default:
        return { label: status, color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  return (
    <div id="bookings-view" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Pemesanan Peti Kemas (Container Booking)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono font-bold">
              {bookings.length} Pesanan
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Kelola pengajuan muatan dari pemilik barang, persetujuan agen pelayaran, dan penerbitan Delivery Order (DO).
          </p>
        </div>

        {/* Action Button: CRUD Create */}
        <button
          id="btn-add-booking"
          onClick={onOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Booking Baru</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="input-search-bookings"
            type="text"
            placeholder="Cari nomor booking, nama shipper, kargo, kapal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          {[
            { id: 'all', label: 'Semua' },
            { id: 'pending', label: 'Pending' },
            { id: 'approved', label: 'Disetujui' },
            { id: 'gate_in', label: 'Gate-In' },
            { id: 'loading', label: 'Muat' },
            { id: 'completed', label: 'Selesai' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === f.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredBookings.map((b) => {
          const statusInfo = getStatusBadge(b.status);

          return (
            <div
              key={b.id || b.bookingNumber}
              id={`booking-card-${b.id}`}
              className="p-5 bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-2xl transition-all shadow-md hover:shadow-blue-950/20 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400 shrink-0">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-cyan-400">{b.bookingNumber}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-semibold">
                        {b.serviceType}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white tracking-tight mt-0.5">{b.customerName}</h3>
                    <p className="text-xs text-slate-400">Agen: {b.agentName}</p>
                  </div>
                </div>

                <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>

              {/* Cargo & Vessel Info */}
              <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Deskripsi Kargo:</span>
                  <span className="font-semibold text-slate-100">{b.cargoDescription}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Kapal Pengangkut:</span>
                  <span className="font-semibold text-cyan-300">{b.vesselName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Rute Pengiriman:</span>
                  <span className="text-slate-200">{b.originPort} &rarr; {b.destinationPort}</span>
                </div>
              </div>

              {/* Specifications: Quantity & Amount */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400">Jumlah Box</p>
                  <p className="font-bold text-white font-mono mt-0.5">{b.quantity} Box</p>
                  <p className="text-[10px] text-slate-400 capitalize">{b.containerType.replace('_', ' ')}</p>
                </div>

                <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400">Berat Kotor</p>
                  <p className="font-bold text-white font-mono mt-0.5">{b.grossWeightTon} Ton</p>
                  <p className="text-[10px] text-emerald-400">VGM Diverifikasi</p>
                </div>

                <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400">Tarif Terminal</p>
                  <p className="font-bold text-emerald-400 font-mono mt-0.5 text-[11px] truncate">
                    Rp {(b.totalAmount / 1000000).toFixed(1)} Jt
                  </p>
                  <span className={`text-[10px] font-semibold ${b.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {b.paymentStatus === 'paid' ? 'Lunas' : 'Belum Lunas'}
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Ubah Status:</span>
                  <select
                    value={b.status}
                    onChange={(e) => handleStatusChange(b, e.target.value as BookingStatus)}
                    className="bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-2 py-1 text-[11px] focus:outline-hidden"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Disetujui</option>
                    <option value="gate_in">Gate-In</option>
                    <option value="loading">Loading Muat</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Batalkan</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Print Delivery Order (DO) Button */}
                  <button
                    onClick={() => setSelectedDoBooking(b)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                    title="Cetak Delivery Order / Surat Jalan"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Surat Jalan DO</span>
                  </button>

                  <button
                    id={`btn-edit-booking-${b.id}`}
                    onClick={() => onEditBooking(b)}
                    className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Ubah Pemesanan"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    id={`btn-delete-booking-${b.id}`}
                    onClick={() => handleDelete(b.id)}
                    disabled={deletingId === b.id}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Hapus Pemesanan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {filteredBookings.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            <FileSpreadsheet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">Tidak ada pemesanan yang cocok</p>
            <p className="text-xs text-slate-500 mt-1">Gunakan tombol "Buat Booking Baru" untuk mengajukan pesanan kargo baru.</p>
          </div>
        )}
      </div>

      {/* Delivery Order (DO) Modal Viewer */}
      {selectedDoBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl p-6 text-slate-100 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h4 className="text-base font-bold text-white">DELIVERY ORDER (DO) / SURAT JALAN TERMINAL</h4>
                <p className="text-xs text-cyan-400 font-mono">No. Dokumen: DO-{selectedDoBooking.bookingNumber}</p>
              </div>
              <button
                onClick={() => setSelectedDoBooking(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Shipper / Penerima:</span>
                <span className="font-bold text-white">{selectedDoBooking.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Agen Pengangkut:</span>
                <span className="text-slate-200">{selectedDoBooking.agentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kapal / Voyage:</span>
                <span className="text-cyan-300 font-bold">{selectedDoBooking.vesselName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kargo:</span>
                <span className="text-slate-200">{selectedDoBooking.cargoDescription}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tipe & Jumlah:</span>
                <span className="font-bold text-white">{selectedDoBooking.quantity} Box ({selectedDoBooking.containerType})</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Izin Gate-Pass Masuk & Keluar Terminal Peti Kemas Diberikan.</span>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak DO</span>
              </button>
              <button
                onClick={() => setSelectedDoBooking(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
