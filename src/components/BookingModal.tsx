import React, { useState, useEffect } from 'react';
import { Booking, ContainerType, BookingStatus } from '../types';
import { addBooking, updateBooking } from '../services/db';
import { X, FileSpreadsheet, Save, Calculator } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking | null;
  vesselsList?: { id?: string; name: string }[];
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  vesselsList = []
}) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState<Omit<Booking, 'id'>>({
    bookingNumber: '',
    customerName: '',
    agentName: '',
    vesselName: '',
    containerType: '20ft_dry',
    quantity: 1,
    originPort: 'Tanjung Priok (Jakarta)',
    destinationPort: 'Belawan (Medan)',
    cargoDescription: '',
    grossWeightTon: 20,
    status: 'pending',
    totalAmount: 2500000,
    paymentStatus: 'unpaid',
    serviceType: 'domestic',
    createdAt: new Date().toISOString().slice(0, 16),
    requiredDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16),
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto calculate estimated price based on container type & quantity
  const calculateRate = (type: ContainerType, qty: number, service: string) => {
    let base = 2500000;
    if (type === '40ft_dry') base = 4000000;
    if (type === '40ft_hc') base = 4500000;
    if (type === '20ft_reefer') base = 5500000;
    if (type === '40ft_reefer') base = 7500000;
    if (type === 'open_top') base = 4800000;

    if (service === 'export') base *= 1.4;
    if (service === 'import') base *= 1.3;
    return base * Math.max(1, qty);
  };

  useEffect(() => {
    if (booking) {
      setFormData({
        bookingNumber: booking.bookingNumber,
        customerName: booking.customerName,
        agentName: booking.agentName,
        vesselName: booking.vesselName,
        containerType: booking.containerType,
        quantity: booking.quantity,
        originPort: booking.originPort,
        destinationPort: booking.destinationPort,
        cargoDescription: booking.cargoDescription,
        grossWeightTon: booking.grossWeightTon,
        status: booking.status,
        totalAmount: booking.totalAmount,
        paymentStatus: booking.paymentStatus,
        serviceType: booking.serviceType,
        createdAt: booking.createdAt,
        requiredDate: booking.requiredDate,
        notes: booking.notes || ''
      });
    } else {
      const bkgNum = 'BKG-' + new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + Math.floor(100 + Math.random() * 900);
      const defaultVessel = vesselsList.length > 0 ? vesselsList[0].name : 'KM Meratus Minahasa';
      
      const custName = user?.role === 'customer' ? user.companyName : 'PT Indofood Sukses Makmur Tbk';
      const agName = user?.role === 'agent' ? user.companyName : 'PT Samudera Logistik Nusantara';

      const initialRate = calculateRate('20ft_dry', 2, 'domestic');

      setFormData({
        bookingNumber: bkgNum,
        customerName: custName,
        agentName: agName,
        vesselName: defaultVessel,
        containerType: '20ft_dry',
        quantity: 2,
        originPort: 'Tanjung Priok (Jakarta)',
        destinationPort: 'Belawan (Medan)',
        cargoDescription: 'Komoditas Pangan & Barang Konsumsi',
        grossWeightTon: 36,
        status: user?.role === 'admin' ? 'approved' : 'pending',
        totalAmount: initialRate,
        paymentStatus: 'unpaid',
        serviceType: 'domestic',
        createdAt: new Date().toISOString().slice(0, 16),
        requiredDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16),
        notes: ''
      });
    }
  }, [booking, isOpen]);

  if (!isOpen) return null;

  const handleTypeOrQtyChange = (newType: ContainerType, newQty: number, newService: 'export' | 'import' | 'transhipment' | 'domestic') => {
    const est = calculateRate(newType, newQty, newService);
    setFormData(prev => ({
      ...prev,
      containerType: newType,
      quantity: newQty,
      serviceType: newService,
      totalAmount: est
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (!formData.customerName || !formData.cargoDescription) {
        throw new Error('Harap lengkapi nama pelanggan dan rincian kargo.');
      }

      if (booking?.id) {
        await updateBooking(booking.id, formData);
      } else {
        await addBooking(formData);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pemesanan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="booking-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div id="booking-modal-container" className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-950/70 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {booking ? 'Ubah Rincian Booking' : 'Buat Pemesanan Peti Kemas Baru'}
              </h3>
              <p className="text-xs text-slate-400">Pengajuan Muatan & Alokasi Slot Kapal Kontainer</p>
            </div>
          </div>
          <button
            id="btn-close-booking-modal"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/50 rounded-xl text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Booking</label>
              <input
                id="input-booking-number"
                type="text"
                value={formData.bookingNumber}
                onChange={(e) => setFormData({ ...formData, bookingNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-mono text-cyan-300 focus:outline-hidden focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Kategori Layanan</label>
              <select
                id="select-booking-service-type"
                value={formData.serviceType}
                onChange={(e) => handleTypeOrQtyChange(formData.containerType, formData.quantity, e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="domestic">Domestik Antar Pulau</option>
                <option value="export">Ekspor Internasional</option>
                <option value="import">Impor Masuk</option>
                <option value="transhipment">Transhipment Pelabuhan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nama Pelanggan / Shipper *</label>
              <input
                id="input-booking-customer"
                type="text"
                placeholder="Misal: PT Indofood Sukses Makmur Tbk"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Agen Pelayaran (Forwarder)</label>
              <input
                id="input-booking-agent"
                type="text"
                placeholder="Misal: PT Samudera Logistik"
                value={formData.agentName}
                onChange={(e) => setFormData({ ...formData, agentName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Pilihan Kapal Kargo</label>
              <select
                id="select-booking-vessel"
                value={formData.vesselName}
                onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-blue-500"
              >
                {vesselsList.length > 0 ? (
                  vesselsList.map((v, i) => (
                    <option key={v.id || i} value={v.name}>{v.name}</option>
                  ))
                ) : (
                  <>
                    <option value="KM Meratus Minahasa">KM Meratus Minahasa</option>
                    <option value="MV Temas Glory">MV Temas Glory</option>
                    <option value="Samudera Mas 09">Samudera Mas 09</option>
                    <option value="Ever Glory V.108">Ever Glory V.108</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tipe Peti Kemas</label>
              <select
                id="select-booking-container-type"
                value={formData.containerType}
                onChange={(e) => handleTypeOrQtyChange(e.target.value as ContainerType, formData.quantity, formData.serviceType)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="20ft_dry">20ft Dry Cargo Container</option>
                <option value="40ft_dry">40ft Standard Dry Container</option>
                <option value="40ft_hc">40ft High Cube (HC) Container</option>
                <option value="20ft_reefer">20ft Reefer (Pendingin / Cold Chain)</option>
                <option value="40ft_reefer">40ft Reefer (Pendingin Suhu Ekstrem)</option>
                <option value="open_top">40ft Open Top (Kargo Berat/Mesin)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Jumlah Box (TEU)</label>
              <input
                id="input-booking-quantity"
                type="number"
                min={1}
                max={500}
                value={formData.quantity}
                onChange={(e) => handleTypeOrQtyChange(formData.containerType, Number(e.target.value), formData.serviceType)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Total Berat Gross (Ton)</label>
              <input
                id="input-booking-weight"
                type="number"
                step="0.1"
                value={formData.grossWeightTon}
                onChange={(e) => setFormData({ ...formData, grossWeightTon: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Pelabuhan Muat (POL)</label>
              <input
                id="input-booking-origin"
                type="text"
                value={formData.originPort}
                onChange={(e) => setFormData({ ...formData, originPort: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Pelabuhan Bongkar (POD)</label>
              <input
                id="input-booking-destination"
                type="text"
                value={formData.destinationPort}
                onChange={(e) => setFormData({ ...formData, destinationPort: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Status Pemesanan</label>
              <select
                id="select-booking-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as BookingStatus })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="pending">Diajukan (Pending Verifikasi)</option>
                <option value="approved">Disetujui (Approved / SI Terbit)</option>
                <option value="gate_in">Gate-In (Peti Kemas di Lapangan)</option>
                <option value="loading">Loading / Muat ke Kapal</option>
                <option value="completed">Selesai (Berangkat)</option>
                <option value="cancelled">Dibatalkan</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Status Pembayaran</label>
              <select
                id="select-booking-payment-status"
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="unpaid">Belum Dibayar (Unpaid)</option>
                <option value="paid">Lunas (Paid)</option>
                <option value="partial">Sebagian (Partial)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Deskripsi Kargo / Komoditas *</label>
            <input
              id="input-booking-cargo"
              type="text"
              placeholder="Misal: Mi Instan, Minyak Goreng, Biji Plastik, Tekstil..."
              value={formData.cargoDescription}
              onChange={(e) => setFormData({ ...formData, cargoDescription: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-blue-500"
              required
            />
          </div>

          {/* Pricing Box */}
          <div className="p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-300">
              <Calculator className="w-4 h-4" />
              <span className="text-xs">Estimasi Tarif Terminal Handling (THC):</span>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-white font-mono">
                Rp {formData.totalAmount.toLocaleString('id-ID')}
              </p>
              <p className="text-[10px] text-slate-400">Termasuk THC + Stevedoring Dasar</p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              id="btn-cancel-booking"
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              id="btn-submit-booking"
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-blue-900/30"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Menyimpan...' : booking ? 'Perbarui Booking' : 'Simpan Pemesanan'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
