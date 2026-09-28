import React, { useState, useEffect } from 'react';
import { ContainerItem, ContainerType, YardBlock } from '../types';
import { addContainer, updateContainer } from '../services/db';
import { X, Box, Save } from 'lucide-react';

interface ContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  container?: ContainerItem | null;
  vesselsList?: { id?: string; name: string }[];
}

export const ContainerModal: React.FC<ContainerModalProps> = ({
  isOpen,
  onClose,
  container,
  vesselsList = []
}) => {
  const [formData, setFormData] = useState<Omit<ContainerItem, 'id'>>({
    containerNumber: '',
    size: '40ft',
    type: '40ft_hc',
    status: 'yard_storage',
    yardBlock: 'Blok A (Export General)',
    yardRow: 'R-01',
    yardBay: 'B-01',
    yardTier: 1,
    vesselName: 'KM Meratus Minahasa',
    bookingNumber: 'BKG-2026-09-001',
    consignee: 'PT Indofood Sukses Makmur Tbk',
    sealNumber: 'SL-102938',
    grossWeightKg: 24500,
    customsCleared: true,
    gateInDate: new Date().toISOString().slice(0, 16)
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (container) {
      setFormData({
        containerNumber: container.containerNumber,
        size: container.size,
        type: container.type,
        status: container.status,
        yardBlock: container.yardBlock,
        yardRow: container.yardRow,
        yardBay: container.yardBay,
        yardTier: container.yardTier,
        vesselName: container.vesselName,
        bookingNumber: container.bookingNumber || '',
        consignee: container.consignee,
        sealNumber: container.sealNumber,
        grossWeightKg: container.grossWeightKg,
        customsCleared: container.customsCleared,
        reeferTempCelsius: container.reeferTempCelsius,
        gateInDate: container.gateInDate,
        gateOutDate: container.gateOutDate
      });
    } else {
      const prefixes = ['MSKU', 'TGHU', 'MRTU', 'EGCU', 'SMCU'];
      const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const checkDigit = Math.floor(Math.random() * 10);
      const generatedNo = `${randomPrefix} ${randomNum}-${checkDigit}`;

      setFormData({
        containerNumber: generatedNo,
        size: '40ft',
        type: '40ft_hc',
        status: 'yard_storage',
        yardBlock: 'Blok A (Export General)',
        yardRow: 'R-0' + Math.floor(1 + Math.random() * 8),
        yardBay: 'B-0' + Math.floor(1 + Math.random() * 9),
        yardTier: Math.floor(1 + Math.random() * 3),
        vesselName: vesselsList.length > 0 ? vesselsList[0].name : 'KM Meratus Minahasa',
        bookingNumber: 'BKG-2026-09-001',
        consignee: 'PT Indofood Sukses Makmur Tbk',
        sealNumber: 'SL-' + Math.floor(100000 + Math.random() * 900000),
        grossWeightKg: 24000,
        customsCleared: true,
        gateInDate: new Date().toISOString().slice(0, 16)
      });
    }
  }, [container, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (!formData.containerNumber || !formData.consignee) {
        throw new Error('Nomor kontainer dan nama consignee wajib diisi.');
      }

      if (container?.id) {
        await updateContainer(container.id, formData);
      } else {
        await addContainer(formData);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data peti kemas.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="container-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div id="container-modal-container" className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-950/60 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {container ? 'Ubah Posisi & Status Peti Kemas' : 'Input Peti Kemas Masuk (Gate-In)'}
              </h3>
              <p className="text-xs text-slate-400">Manajemen Penumpukan Yard & Pemeriksaan Bea Cukai</p>
            </div>
          </div>
          <button
            id="btn-close-container-modal"
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Peti Kemas (ISO 6346) *</label>
              <input
                id="input-container-number"
                type="text"
                placeholder="Misal: MSKU 728192-3"
                value={formData.containerNumber}
                onChange={(e) => setFormData({ ...formData, containerNumber: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-mono text-emerald-400 font-bold focus:outline-hidden focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Segel (Seal No)</label>
              <input
                id="input-container-seal"
                type="text"
                placeholder="Misal: SL-881920"
                value={formData.sealNumber}
                onChange={(e) => setFormData({ ...formData, sealNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Ukuran & Tipe</label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  id="select-container-size"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="20ft">20 Feet</option>
                  <option value="40ft">40 Feet</option>
                  <option value="45ft">45 Feet</option>
                </select>

                <select
                  id="select-container-type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ContainerType })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="20ft_dry">Dry Cargo</option>
                  <option value="40ft_hc">High Cube</option>
                  <option value="20ft_reefer">Reefer</option>
                  <option value="40ft_reefer">Reefer HC</option>
                  <option value="open_top">Open Top</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Berat Gross (Kg)</label>
              <input
                id="input-container-weight"
                type="number"
                placeholder="Berat Kotor (Kg)"
                value={formData.grossWeightKg}
                onChange={(e) => setFormData({ ...formData, grossWeightKg: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Blok Lapangan (Yard Block)</label>
              <select
                id="select-container-block"
                value={formData.yardBlock}
                onChange={(e) => setFormData({ ...formData, yardBlock: e.target.value as YardBlock })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-emerald-500"
              >
                <option value="Blok A (Export General)">Blok A (Export General)</option>
                <option value="Blok B (Import General)">Blok B (Import General)</option>
                <option value="Blok C (Reefer Cold)">Blok C (Reefer Cold - Berpendingin)</option>
                <option value="Blok D (Hazardous DG)">Blok D (Hazardous DG - Bahan Berbahaya)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Posisi Slot (Bay / Row / Tier)</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  id="input-container-bay"
                  type="text"
                  placeholder="Bay (B-01)"
                  value={formData.yardBay}
                  onChange={(e) => setFormData({ ...formData, yardBay: e.target.value })}
                  className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
                />
                <input
                  id="input-container-row"
                  type="text"
                  placeholder="Row (R-02)"
                  value={formData.yardRow}
                  onChange={(e) => setFormData({ ...formData, yardRow: e.target.value })}
                  className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
                />
                <select
                  id="select-container-tier"
                  value={formData.yardTier}
                  onChange={(e) => setFormData({ ...formData, yardTier: Number(e.target.value) })}
                  className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-hidden"
                >
                  <option value={1}>Tier 1 (Bawah)</option>
                  <option value={2}>Tier 2</option>
                  <option value={3}>Tier 3</option>
                  <option value={4}>Tier 4 (Atas)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Status Operasional</label>
              <select
                id="select-container-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-emerald-500"
              >
                <option value="yard_storage">Di Lapangan (Yard Storage)</option>
                <option value="on_vessel">Telah Dimuat ke Kapal (On Vessel)</option>
                <option value="inspection">Pemeriksaan Fisik (Behandle)</option>
                <option value="customs_hold">Tertahan Bea Cukai (Hold)</option>
                <option value="gate_out">Keluar Terminal (Gate-Out)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Status Bea & Cukai (Customs)</label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    id="checkbox-customs-cleared"
                    type="checkbox"
                    checked={formData.customsCleared}
                    onChange={(e) => setFormData({ ...formData, customsCleared: e.target.checked })}
                    className="w-4 h-4 rounded-sm bg-slate-800 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>SPPB Terbit (Customs Cleared)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Pemilik / Penerima Kargo (Consignee) *</label>
              <input
                id="input-container-consignee"
                type="text"
                placeholder="Misal: PT Indofood Sukses Makmur Tbk"
                value={formData.consignee}
                onChange={(e) => setFormData({ ...formData, consignee: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Kapal Terkait (Vessel)</label>
              <select
                id="select-container-vessel"
                value={formData.vesselName}
                onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-emerald-500"
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
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              id="btn-cancel-container"
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              id="btn-submit-container"
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-900/30"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Menyimpan...' : container ? 'Perbarui Lokasi' : 'Simpan Peti Kemas'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
