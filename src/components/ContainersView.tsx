import React, { useState } from 'react';
import { ContainerItem, YardBlock } from '../types';
import { useAuth } from '../context/AuthContext';
import { deleteContainer, updateContainer } from '../services/db';
import {
  Box,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Thermometer,
  Layers,
  Filter,
  ShieldCheck,
  ShieldAlert,
  ArrowDownUp
} from 'lucide-react';

interface ContainersViewProps {
  containers: ContainerItem[];
  onOpenCreate: () => void;
  onEditContainer: (container: ContainerItem) => void;
}

export const ContainersView: React.FC<ContainersViewProps> = ({
  containers,
  onOpenCreate,
  onEditContainer
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [customsFilter, setCustomsFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredContainers = containers.filter((c) => {
    const matchesSearch =
      c.containerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sealNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.consignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vesselName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBlock = selectedBlock === 'all' || c.yardBlock.includes(selectedBlock);
    const matchesCustoms =
      customsFilter === 'all' ||
      (customsFilter === 'cleared' && c.customsCleared) ||
      (customsFilter === 'hold' && !c.customsCleared);

    return matchesSearch && matchesBlock && matchesCustoms;
  });

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Proses Gate-Out atau hapus kontainer ini dari database yard?')) {
      setDeletingId(id);
      try {
        await deleteContainer(id);
      } catch (e) {
        console.error(e);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleToggleCustoms = async (container: ContainerItem) => {
    if (!container.id) return;
    try {
      await updateContainer(container.id, {
        customsCleared: !container.customsCleared
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="containers-view" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Manajemen Peti Kemas & Lapangan (Yard Management)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
              {containers.length} Peti Kemas
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Inventaris peti kemas di terminal, penataan blok penumpukan (stack tiering), dan clearance Bea & Cukai.
          </p>
        </div>

        {/* Action Button: CRUD Gate-In */}
        <button
          id="btn-gate-in-container"
          onClick={onOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-emerald-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>Input Peti Kemas (Gate-In)</span>
        </button>
      </div>

      {/* Visual Yard Blocks Quick Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'all', label: 'Semua Blok Lapangan', count: containers.length, color: 'border-slate-700 bg-slate-900/90' },
          { id: 'Blok A', label: 'Blok A (Ekspor)', count: containers.filter(c => c.yardBlock.includes('Blok A')).length, color: 'border-blue-500/30 bg-blue-950/20' },
          { id: 'Blok B', label: 'Blok B (Impor)', count: containers.filter(c => c.yardBlock.includes('Blok B')).length, color: 'border-purple-500/30 bg-purple-950/20' },
          { id: 'Blok C', label: 'Blok C (Reefer Dingin)', count: containers.filter(c => c.yardBlock.includes('Blok C')).length, color: 'border-cyan-500/30 bg-cyan-950/20' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedBlock(tab.id)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              selectedBlock === tab.id
                ? 'ring-2 ring-emerald-400 border-emerald-500 bg-emerald-950/30'
                : `${tab.color} hover:border-slate-600`
            }`}
          >
            <p className="text-[11px] text-slate-400 font-medium">{tab.label}</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-bold font-mono text-white">{tab.count}</span>
              <span className="text-[10px] text-slate-500">Box</span>
            </div>
          </button>
        ))}
      </div>

      {/* Search & Secondary Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="input-search-containers"
            type="text"
            placeholder="Cari nomor kontainer (MSKU...), segel, consignee, kapal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCustomsFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              customsFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Semua Cukai
          </button>
          <button
            onClick={() => setCustomsFilter('cleared')}
            className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              customsFilter === 'cleared'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            SPPB Terbit (Hijau)
          </button>
          <button
            onClick={() => setCustomsFilter('hold')}
            className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              customsFilter === 'hold'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Hold / Inspeksi
          </button>
        </div>
      </div>

      {/* Containers Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredContainers.map((c) => (
          <div
            key={c.id || c.containerNumber}
            id={`container-card-${c.id}`}
            className="p-5 bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl transition-all shadow-md hover:shadow-emerald-950/20 space-y-3.5 flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-extrabold text-base text-emerald-400">
                      {c.containerNumber}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">
                      {c.size}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">Segel: {c.sealNumber}</p>
                </div>

                {/* Customs SPPB Badge */}
                <button
                  onClick={() => handleToggleCustoms(c)}
                  title="Klik untuk ubah status SPPB Bea Cukai"
                  className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border transition-all ${
                    c.customsCleared
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                  }`}
                >
                  {c.customsCleared ? (
                    <>
                      <ShieldCheck className="w-3 h-3" />
                      <span>SPPB HIJAU</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-3 h-3" />
                      <span>INSPEKSI FISIK</span>
                    </>
                  )}
                </button>
              </div>

              {/* Yard Slot Coordinate (Block, Bay, Row, Tier) */}
              <div className="mt-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/70 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Lokasi Yard:</span>
                  <span className="font-semibold text-slate-200">{c.yardBlock}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-700/50 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Bay</span>
                    <span className="font-mono font-bold text-white">{c.yardBay}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Row</span>
                    <span className="font-mono font-bold text-white">{c.yardRow}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Tier (Tingkat)</span>
                    <span className="font-mono font-bold text-emerald-400">Tier {c.yardTier}</span>
                  </div>
                </div>
              </div>

              {/* Consignee & Reefer Details */}
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Consignee:</span>
                  <span className="font-medium truncate max-w-[170px] text-white">{c.consignee}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Kapal:</span>
                  <span className="text-cyan-300 font-medium truncate max-w-[170px]">{c.vesselName}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Berat Gross:</span>
                  <span className="font-mono font-medium">{c.grossWeightKg.toLocaleString('id-ID')} Kg</span>
                </div>

                {c.reeferTempCelsius !== undefined && (
                  <div className="flex justify-between items-center text-cyan-300 font-mono text-xs pt-1">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
                      Monitoring Suhu:
                    </span>
                    <span className="font-bold">{c.reeferTempCelsius} °C (Stabil)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-500">
                Gate-In: {new Date(c.gateInDate).toLocaleDateString('id-ID')}
              </span>

              <div className="flex items-center gap-1">
                <button
                  id={`btn-edit-container-${c.id}`}
                  onClick={() => onEditContainer(c)}
                  className="p-1.5 text-slate-400 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Pindah Slot / Ubah Status"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  id={`btn-delete-container-${c.id}`}
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Gate-Out / Hapus Kontainer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}

        {filteredContainers.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            <Box className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">Tidak ada peti kemas yang sesuai filter</p>
            <p className="text-xs text-slate-500 mt-1">Gunakan tombol "Input Peti Kemas (Gate-In)" untuk mencatat kontainer baru.</p>
          </div>
        )}
      </div>

    </div>
  );
};
