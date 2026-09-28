import React, { useState } from 'react';
import { ContainerItem, Booking, Vessel } from '../types';
import {
  Search,
  Box,
  Ship,
  FileCheck,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';

interface PublicTrackerProps {
  containers: ContainerItem[];
  bookings: Booking[];
  vessels: Vessel[];
}

export const PublicTracker: React.FC<PublicTrackerProps> = ({
  containers,
  bookings,
  vessels
}) => {
  const [query, setQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Search in containers or bookings
  const matchedContainer = containers.find(
    c => c.containerNumber.toLowerCase().replace(/\s|-/g, '') === query.toLowerCase().replace(/\s|-/g, '')
  );

  const matchedBooking = bookings.find(
    b => b.bookingNumber.toLowerCase().replace(/\s|-/g, '') === query.toLowerCase().replace(/\s|-/g, '')
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setHasSearched(true);
  };

  const handleSampleClick = (sample: string) => {
    setQuery(sample);
    setHasSearched(true);
  };

  return (
    <div id="public-tracker-view" className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Search Hero */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border border-slate-700/80 rounded-3xl shadow-xl text-center space-y-4">
        <div className="inline-flex p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
          <Search className="w-8 h-8" />
        </div>
        
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Lacak Cepat Peti Kemas & Bill of Lading (B/L)
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-1">
            Masukkan nomor peti kemas ISO (misal: MSKU 728192-3) atau nomor pemesanan kargo untuk mengetahui posisi terkini di terminal.
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              id="input-public-tracker-query"
              type="text"
              placeholder="Contoh: MSKU 728192-3 atau BKG-2026-09-001"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setHasSearched(false); }}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm font-mono text-cyan-300 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500 shadow-inner"
            />
          </div>
          <button
            id="btn-execute-tracking"
            type="submit"
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-cyan-900/30 shrink-0"
          >
            Lacak Status
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
          <span>Contoh Cepat:</span>
          {containers.slice(0, 3).map((c) => (
            <button
              key={c.containerNumber}
              type="button"
              onClick={() => handleSampleClick(c.containerNumber)}
              className="px-2.5 py-1 bg-slate-800/70 hover:bg-slate-700 border border-slate-700 rounded-lg text-cyan-300 font-mono text-[11px] transition-colors"
            >
              {c.containerNumber}
            </button>
          ))}
          {bookings.slice(0, 1).map((b) => (
            <button
              key={b.bookingNumber}
              type="button"
              onClick={() => handleSampleClick(b.bookingNumber)}
              className="px-2.5 py-1 bg-slate-800/70 hover:bg-slate-700 border border-slate-700 rounded-lg text-blue-300 font-mono text-[11px] transition-colors"
            >
              {b.bookingNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Result Display */}
      {hasSearched && (
        <div className="space-y-4">
          {matchedContainer ? (
            <div className="p-6 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-xl space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
                    <Box className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono font-extrabold text-lg sm:text-xl text-emerald-400">
                      {matchedContainer.containerNumber}
                    </span>
                    <p className="text-xs text-slate-400">
                      Tipe: {matchedContainer.size} {matchedContainer.type.replace('_', ' ')} • Segel: {matchedContainer.sealNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                    Status: Di Lapangan (Yard Storage)
                  </span>
                </div>
              </div>

              {/* Progress Milestones Timeline */}
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Riwayat Perjalanan & Status Terminal
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  {/* Step 1 */}
                  <div className="p-3 bg-slate-800/80 border border-emerald-500/40 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>1. Gate-In Terminal</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">Telah masuk gerbang</p>
                    <p className="text-[10px] text-slate-400 font-mono">{matchedContainer.gateInDate}</p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 bg-slate-800/80 border border-emerald-500/40 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>2. Slot Penumpukan</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">{matchedContainer.yardBlock}</p>
                    <p className="text-[10px] text-cyan-300 font-mono">
                      Bay {matchedContainer.yardBay}, Row {matchedContainer.yardRow}, Tier {matchedContainer.yardTier}
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-3 bg-slate-800/80 border rounded-xl space-y-1 ${
                    matchedContainer.customsCleared ? 'border-emerald-500/40' : 'border-amber-500/40'
                  }`}>
                    <div className={`flex items-center gap-1.5 font-semibold text-[11px] ${
                      matchedContainer.customsCleared ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {matchedContainer.customsCleared ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                      <span>3. Bea & Cukai</span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      {matchedContainer.customsCleared ? 'SPPB Terbit (Jalur Hijau)' : 'Pemeriksaan Fisik Behandle'}
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="p-3 bg-slate-800/40 border border-slate-700 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
                      <Clock className="w-4 h-4" />
                      <span>4. Muat ke Kapal</span>
                    </div>
                    <p className="text-slate-300 text-[11px] truncate">{matchedContainer.vesselName}</p>
                    <p className="text-[10px] text-slate-500">Menunggu antrian crane STS</p>
                  </div>
                </div>
              </div>

              {/* Technical Box */}
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Penerima (Consignee)</span>
                  <span className="font-bold text-white mt-0.5 block truncate">{matchedContainer.consignee}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Berat Kotor (Gross)</span>
                  <span className="font-mono font-bold text-white mt-0.5 block">{matchedContainer.grossWeightKg.toLocaleString('id-ID')} Kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Kapal Angkut</span>
                  <span className="font-bold text-cyan-300 mt-0.5 block truncate">{matchedContainer.vesselName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Booking Ref</span>
                  <span className="font-mono font-bold text-blue-400 mt-0.5 block">{matchedContainer.bookingNumber || '-'}</span>
                </div>
              </div>

            </div>
          ) : matchedBooking ? (
            <div className="p-6 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="font-mono font-bold text-lg text-blue-400">{matchedBooking.bookingNumber}</span>
                  <h3 className="text-base font-bold text-white mt-0.5">{matchedBooking.customerName}</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Status: {matchedBooking.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-800/60 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Kapal Pengangkut</span>
                  <span className="font-bold text-cyan-300 mt-0.5 block">{matchedBooking.vesselName}</span>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Kuantitas</span>
                  <span className="font-bold text-white mt-0.5 block">{matchedBooking.quantity} Box ({matchedBooking.containerType})</span>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Rute</span>
                  <span className="font-bold text-white mt-0.5 block">{matchedBooking.originPort} &rarr; {matchedBooking.destinationPort}</span>
                </div>
                <div className="p-3 bg-slate-800/60 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Tagihan THC</span>
                  <span className="font-bold text-emerald-400 font-mono mt-0.5 block">Rp {matchedBooking.totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-slate-900/60 rounded-2xl border border-slate-800 text-center space-y-2">
              <Info className="w-8 h-8 text-amber-400 mx-auto" />
              <p className="text-sm font-semibold text-white">Nomor Kontainer / Booking "{query}" tidak ditemukan</p>
              <p className="text-xs text-slate-400">
                Pastikan nomor kontainer sesuai format standar (misal: MSKU 728192-3) atau nomor booking diawali BKG-.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
