import React, { useState } from 'react';
import { Vessel, VesselStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { deleteVessel, updateVessel } from '../services/db';
import {
  Ship,
  Anchor,
  Search,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  Compass,
  ArrowRight,
  Filter,
  Activity,
  Layers
} from 'lucide-react';

interface VesselsViewProps {
  vessels: Vessel[];
  onOpenCreate: () => void;
  onEditVessel: (vessel: Vessel) => void;
}

export const VesselsView: React.FC<VesselsViewProps> = ({
  vessels,
  onOpenCreate,
  onEditVessel
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredVessels = vessels.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.imo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.berth.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Yakin ingin menghapus data kapal ini dari sistem terminal?')) {
      setDeletingId(id);
      try {
        await deleteVessel(id);
      } catch (err) {
        console.error(err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleQuickStatusChange = async (vessel: Vessel, newStatus: VesselStatus) => {
    if (!vessel.id) return;
    try {
      await updateVessel(vessel.id, { status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusBadge = (status: VesselStatus) => {
    switch (status) {
      case 'at_sea':
        return { label: 'Di Laut (En Route)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
      case 'anchored':
        return { label: 'Lego Jangkar (Anchored)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
      case 'berthing':
        return { label: 'Sandar Dermaga', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' };
      case 'loading_unloading':
        return { label: 'Bongkar Muat (Active)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'departed':
        return { label: 'Telah Berangkat', color: 'bg-slate-700 text-slate-300 border-slate-600' };
      default:
        return { label: status, color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  return (
    <div id="vessels-view" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Pelacakan & Jadwal Kapal (Vessel Tracking)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono font-bold">
              {vessels.length} Kapal
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Pantau posisi kedatangan (ETA), alokasi dermaga, kesiapan crane STS, dan turnaround time kapal kontainer.
          </p>
        </div>

        {/* Action Button: CRUD Create */}
        {(user?.role === 'admin' || user?.role === 'ship_owner') && (
          <button
            id="btn-add-vessel"
            onClick={onOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-cyan-900/30"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Jadwal Kapal</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="input-search-vessels"
            type="text"
            placeholder="Cari nama kapal, nomor IMO, pemilik, dermaga..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          {[
            { id: 'all', label: 'Semua Status' },
            { id: 'berthing', label: 'Sandar' },
            { id: 'loading_unloading', label: 'Bongkar Muat' },
            { id: 'anchored', label: 'Lego Jangkar' },
            { id: 'at_sea', label: 'Di Laut' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === f.id
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vessels Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVessels.map((v) => {
          const statusInfo = getStatusBadge(v.status);
          const loadPercent = Math.min(100, Math.round((v.currentTeus / v.teusCapacity) * 100));

          return (
            <div
              key={v.id || v.name}
              id={`vessel-card-${v.id}`}
              className="p-5 bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl transition-all shadow-md hover:shadow-cyan-950/20 space-y-4"
            >
              {/* Header Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 shrink-0">
                    <Ship className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight">{v.name}</h3>
                      <span className="text-xs">{v.flag}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {v.ownerName} • <span className="font-mono text-cyan-400">{v.imo}</span>
                    </p>
                  </div>
                </div>

                <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>

              {/* Route: Origin -> Destination */}
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Asal (POL)</p>
                  <p className="font-semibold text-slate-200 mt-0.5">{v.origin}</p>
                </div>
                <div className="flex flex-col items-center px-3">
                  <span className="text-[10px] text-cyan-400 font-mono">Alur Laut</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase">Tujuan (POD)</p>
                  <p className="font-semibold text-slate-200 mt-0.5">{v.destination}</p>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="text-slate-400">Utilisasi Kapasitas Peti Kemas:</span>
                  <span className="font-mono font-bold text-white">{v.currentTeus} / {v.teusCapacity} TEU ({loadPercent}%)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all"
                    style={{ width: `${loadPercent}%` }}
                  />
                </div>
              </div>

              {/* Technical & Operational Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-400">Posisi Sandar</p>
                  <p className="font-semibold text-slate-200 mt-0.5 truncate">{v.berth}</p>
                </div>

                <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-800">
                  <p className="text-[10px] text-slate-400">Crane STS</p>
                  <p className="font-semibold text-cyan-300 mt-0.5 truncate">{v.craneAssigned}</p>
                </div>

                <div className="p-2.5 bg-slate-800/40 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-slate-400">Draft / LOA</p>
                  <p className="font-semibold text-slate-200 mt-0.5 font-mono">{v.draftMeters}m / {v.lengthMeters}m</p>
                </div>
              </div>

              {/* ETA / ETD */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ETA: <strong className="text-slate-200">{new Date(v.eta).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</strong></span>
                </div>
                <div>
                  <span>ETD: <strong className="text-slate-200">{new Date(v.etd).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</strong></span>
                </div>
              </div>

              {/* Quick Status Control & Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 gap-2">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 uppercase font-bold mr-1">Status:</span>
                  <select
                    value={v.status}
                    onChange={(e) => handleQuickStatusChange(v, e.target.value as VesselStatus)}
                    className="bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-2 py-1 text-[11px] focus:outline-hidden"
                  >
                    <option value="at_sea">Di Laut</option>
                    <option value="anchored">Lego Jangkar</option>
                    <option value="berthing">Sandar</option>
                    <option value="loading_unloading">Bongkar Muat</option>
                    <option value="departed">Berangkat</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    id={`btn-edit-vessel-${v.id}`}
                    onClick={() => onEditVessel(v)}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Ubah Data Kapal"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    id={`btn-delete-vessel-${v.id}`}
                    onClick={() => handleDelete(v.id)}
                    disabled={deletingId === v.id}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Hapus Kapal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {filteredVessels.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            <Ship className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">Tidak ada jadwal kapal yang sesuai kriteria pencarian</p>
            <p className="text-xs text-slate-500 mt-1">Coba gunakan kata kunci lain atau tambahkan jadwal kapal baru.</p>
          </div>
        )}
      </div>

    </div>
  );
};
