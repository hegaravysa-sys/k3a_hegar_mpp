import React from 'react';
import { Vessel, Booking, ContainerItem, Invoice } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Ship,
  Anchor,
  Box,
  FileSpreadsheet,
  ReceiptText,
  Clock,
  ArrowUpRight,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Radio
} from 'lucide-react';

interface DashboardViewProps {
  vessels: Vessel[];
  bookings: Booking[];
  containers: ContainerItem[];
  invoices: Invoice[];
  onNavigate: (tab: string) => void;
  onOpenNewBooking: () => void;
  onOpenNewVessel: () => void;
  onOpenNewContainer: () => void;
  onSelectVessel: (vessel: Vessel) => void;
  onSelectBooking: (booking: Booking) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vessels,
  bookings,
  containers,
  invoices,
  onNavigate,
  onOpenNewBooking,
  onOpenNewVessel,
  onOpenNewContainer,
  onSelectVessel,
  onSelectBooking
}) => {
  const { user } = useAuth();

  // Metrics calculations
  const berthingVessels = vessels.filter(v => v.status === 'berthing' || v.status === 'loading_unloading');
  const totalTeusYard = containers.filter(c => c.status === 'yard_storage').length;
  const activeBookings = bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
  
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.total : 0), 0);
  const pendingRevenue = invoices.reduce((sum, inv) => sum + (inv.status === 'unpaid' ? inv.total : 0), 0);

  // Yard capacity estimation (capacity = 1200 TEUs in simulated terminal)
  const yardCapacity = 1200;
  const yardOccupancyPercent = Math.min(100, Math.round((totalTeusYard * 40 / yardCapacity) * 100));

  return (
    <div id="dashboard-view" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-blue-900/80 via-slate-900 to-cyan-950/80 border border-slate-700/70 rounded-3xl shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Pelabuhan Aktif 24 Jam
              </span>
              <span className="text-xs text-slate-400 font-mono">Terminal 01 Tanjung Priok</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Selamat Datang, {user?.displayName || 'Operator Terminal'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Pusat kendali operasional terminal peti kemas: pantau pergerakan kapal, alokasi dermaga, pemesanan kargo, dan rekapitulasi keuangan secara langsung.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-quick-create-booking"
              onClick={onOpenNewBooking}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50"
            >
              <Plus className="w-4 h-4" />
              <span>Booking Baru</span>
            </button>

            {(user?.role === 'admin' || user?.role === 'ship_owner') && (
              <button
                id="btn-quick-create-vessel"
                onClick={onOpenNewVessel}
                className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-cyan-900/30 hover:shadow-cyan-900/50"
              >
                <Ship className="w-4 h-4" />
                <span>Jadwal Kapal</span>
              </button>
            )}

            <button
              id="btn-quick-track"
              onClick={() => onNavigate('tracking')}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-all border border-slate-700"
            >
              <Search className="w-4 h-4 text-cyan-400" />
              <span>Lacak Kontainer</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Kapal Sandar */}
        <div 
          onClick={() => onNavigate('vessels')}
          className="p-5 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-950/20 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Kapal Sandar & Proses</span>
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
              <Ship className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {berthingVessels.length}
            </span>
            <span className="text-xs text-slate-400">/ {vessels.length} Terdaftar</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-cyan-400">
            <span>{vessels.filter(v => v.status === 'at_sea').length} Sedang Menuju Pelabuhan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Yard Occupancy */}
        <div 
          onClick={() => onNavigate('containers')}
          className="p-5 bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-emerald-950/20 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Utilisasi Lapangan (Yard)</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
              <Box className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {containers.length}
            </span>
            <span className="text-xs text-slate-400">Peti Kemas Aktif</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-emerald-400">
            <span>{containers.filter(c => c.customsCleared).length} SPPB Bea Cukai Lolos</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Booking Aktif */}
        <div 
          onClick={() => onNavigate('bookings')}
          className="p-5 bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-blue-950/20 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Booking Berjalan</span>
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
              {activeBookings.length}
            </span>
            <span className="text-xs text-slate-400">Order Terproses</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-blue-400">
            <span>{bookings.filter(b => b.status === 'pending').length} Menunggu Persetujuan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Total Pendapatan / Omset */}
        <div 
          onClick={() => onNavigate('finance')}
          className="p-5 bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl cursor-pointer transition-all hover:shadow-lg hover:shadow-amber-950/20 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pendapatan Terbayar</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <ReceiptText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
              Rp {(totalRevenue / 1000000).toFixed(1)} Jt
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-amber-400">
            <span>Rp {(pendingRevenue / 1000000).toFixed(1)} Jt Tagihan Pending</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* Main Grid: Berth Status Visualizer & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Berth & Crane Allocation */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                  <Anchor className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Status Dermaga & Sandar Kapal (Berthing Matrix)</h3>
                  <p className="text-[11px] text-slate-400">Alokasi dermaga aktif dan kesiapan Quay Crane STS</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('vessels')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Lihat Semua ({vessels.length})
              </button>
            </div>

            {/* Berth Visual Slots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { berthName: 'Dermaga 01 - Utara', depth: '14.5m', crane: 'STS-01 & STS-02' },
                { berthName: 'Dermaga 02 - Barat', depth: '12.0m', crane: 'STS-03' },
                { berthName: 'Dermaga 03 - Selatan', depth: '11.2m', crane: 'STS-04' },
                { berthName: 'Dermaga 04 - Domestik', depth: '9.8m', crane: 'Mobile Crane' }
              ].map((slot, index) => {
                const assignedVessel = vessels.find(v => v.berth === slot.berthName);
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border transition-all ${
                      assignedVessel 
                        ? 'bg-slate-800/80 border-cyan-500/30' 
                        : 'bg-slate-900/40 border-slate-800 border-dashed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-200">{slot.berthName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Kedalaman: {slot.depth}</span>
                    </div>

                    {assignedVessel ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-cyan-300 hover:underline cursor-pointer" onClick={() => onSelectVessel(assignedVessel)}>
                              {assignedVessel.name}
                            </p>
                            <p className="text-[10px] text-slate-400">{assignedVessel.ownerName} • {assignedVessel.flag}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            assignedVessel.status === 'loading_unloading' 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}>
                            {assignedVessel.status === 'loading_unloading' ? 'Bongkar Muat' : 'Sandar'}
                          </span>
                        </div>

                        {/* Progress Bar of Cargo Handling */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>Muatan: {assignedVessel.currentTeus} / {assignedVessel.teusCapacity} TEU</span>
                            <span>{Math.round((assignedVessel.currentTeus / assignedVessel.teusCapacity) * 100)}%</span>
                          </div>
                          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.round((assignedVessel.currentTeus / assignedVessel.teusCapacity) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Crane: <strong className="text-slate-200">{assignedVessel.craneAssigned}</strong></span>
                          <span>ETD: <strong className="text-slate-200">{new Date(assignedVessel.etd).toLocaleDateString('id-ID')}</strong></span>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-xs text-slate-500">Dermaga Siap Sandar (Tersedia)</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">Alokasi Crane: {slot.crane}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Yard Block Overview */}
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Distribusi Lapangan Penumpukan (Yard Blocks)</h4>
              </div>
              <button
                onClick={() => onNavigate('containers')}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Peta Lengkap Yard &rarr;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-400">Blok A (Ekspor)</p>
                <p className="text-base font-bold text-white font-mono mt-1">
                  {containers.filter(c => c.yardBlock.includes('Blok A')).length} Box
                </p>
                <span className="text-[10px] text-blue-400">General Cargo</span>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-400">Blok B (Impor)</p>
                <p className="text-base font-bold text-white font-mono mt-1">
                  {containers.filter(c => c.yardBlock.includes('Blok B')).length} Box
                </p>
                <span className="text-[10px] text-purple-400">Discharge Port</span>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-400">Blok C (Reefer)</p>
                <p className="text-base font-bold text-white font-mono mt-1">
                  {containers.filter(c => c.yardBlock.includes('Blok C')).length} Box
                </p>
                <span className="text-[10px] text-cyan-400">Plug-in Dingin</span>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700">
                <p className="text-[10px] text-slate-400">Blok D (DG Hazardous)</p>
                <p className="text-base font-bold text-white font-mono mt-1">
                  {containers.filter(c => c.yardBlock.includes('Blok D')).length} Box
                </p>
                <span className="text-[10px] text-rose-400">Zona Berbahaya</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Bookings & Operations Feed */}
        <div className="space-y-4">
          <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white">Pemesanan Terbaru</h3>
              <button
                onClick={() => onNavigate('bookings')}
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-3">
              {bookings.slice(0, 4).map((b) => (
                <div
                  key={b.id || b.bookingNumber}
                  onClick={() => onSelectBooking(b)}
                  className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 rounded-xl cursor-pointer transition-all text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-cyan-400 text-[11px]">{b.bookingNumber}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                      b.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                      b.status === 'loading' ? 'bg-cyan-500/20 text-cyan-300' :
                      b.status === 'approved' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {b.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="font-semibold text-slate-200 mt-1 truncate">{b.customerName}</p>
                  <p className="text-slate-400 text-[11px] truncate">{b.cargoDescription}</p>

                  <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{b.quantity} Box • {b.containerType.replace('_', ' ')}</span>
                    <span className="font-mono text-emerald-400 font-medium">Rp {(b.totalAmount / 1000000).toFixed(1)} Jt</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onOpenNewBooking}
              className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-200 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Input Pemesanan Baru</span>
            </button>
          </div>

          {/* Terminal Weather & Nautical Info */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs space-y-2">
            <p className="font-bold text-slate-300 text-[11px] uppercase tracking-wider">Kondisi Alur Pelayaran</p>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Pasang Surut Air:</span>
              <span className="text-slate-200 font-mono">+2.1 m (Aman Sandar)</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Kecepatan Angin:</span>
              <span className="text-slate-200 font-mono">11 Knot (Tenggara)</span>
            </div>
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Visibilitas Alur:</span>
              <span className="text-emerald-400 font-mono">10 Nautical Miles</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
