import React, { useState, useEffect } from 'react';
import { Vessel, VesselStatus } from '../types';
import { addVessel, updateVessel } from '../services/db';
import { X, Ship, Save, Anchor } from 'lucide-react';

interface VesselModalProps {
  isOpen: boolean;
  onClose: () => void;
  vessel?: Vessel | null; // if provided, edit mode; else create mode
}

export const VesselModal: React.FC<VesselModalProps> = ({ isOpen, onClose, vessel }) => {
  const [formData, setFormData] = useState<Omit<Vessel, 'id'>>({
    name: '',
    imo: '',
    callSign: '',
    flag: 'Indonesia 🇮🇩',
    ownerName: '',
    berth: 'Dermaga 01 - Utara',
    status: 'berthing',
    eta: '',
    etd: '',
    teusCapacity: 2000,
    currentTeus: 1200,
    craneAssigned: 'STS Crane 01',
    origin: 'Tanjung Perak, Surabaya',
    destination: 'Tanjung Priok, Jakarta',
    draftMeters: 10.5,
    lengthMeters: 180,
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (vessel) {
      setFormData({
        name: vessel.name,
        imo: vessel.imo,
        callSign: vessel.callSign,
        flag: vessel.flag,
        ownerName: vessel.ownerName,
        berth: vessel.berth,
        status: vessel.status,
        eta: vessel.eta,
        etd: vessel.etd,
        teusCapacity: vessel.teusCapacity,
        currentTeus: vessel.currentTeus,
        craneAssigned: vessel.craneAssigned,
        origin: vessel.origin,
        destination: vessel.destination,
        draftMeters: vessel.draftMeters,
        lengthMeters: vessel.lengthMeters,
        notes: vessel.notes || ''
      });
    } else {
      // Default new vessel
      const now = new Date();
      const etaStr = new Date(now.getTime() + 6 * 3600000).toISOString().slice(0, 16);
      const etdStr = new Date(now.getTime() + 36 * 3600000).toISOString().slice(0, 16);
      setFormData({
        name: '',
        imo: 'IMO 9' + Math.floor(100000 + Math.random() * 900000),
        callSign: 'PK' + Math.random().toString(36).substring(2, 6).toUpperCase(),
        flag: 'Indonesia 🇮🇩',
        ownerName: 'PT Meratus Line',
        berth: 'Dermaga 01 - Utara',
        status: 'berthing',
        eta: etaStr,
        etd: etdStr,
        teusCapacity: 2500,
        currentTeus: 1600,
        craneAssigned: 'Quay Crane STS-01',
        origin: 'Surabaya',
        destination: 'Jakarta',
        draftMeters: 10.5,
        lengthMeters: 185,
        notes: ''
      });
    }
  }, [vessel, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (!formData.name || !formData.ownerName) {
        throw new Error('Nama kapal dan pemilik kapal wajib diisi.');
      }

      if (vessel?.id) {
        await updateVessel(vessel.id, formData);
      } else {
        await addVessel(formData);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data kapal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="vessel-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div id="vessel-modal-container" className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-cyan-950/60 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-400">
              <Ship className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {vessel ? 'Perbarui Data Kapal' : 'Tambah Jadwal Sandar Kapal Baru'}
              </h3>
              <p className="text-xs text-slate-400">Pelacakan Berthing & Alokasi Dermaga Terminal</p>
            </div>
          </div>
          <button
            id="btn-close-vessel-modal"
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Nama Kapal (Vessel Name) *</label>
              <input
                id="input-vessel-name"
                type="text"
                placeholder="Misal: KM Meratus Jayapura"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Perusahaan / Pemilik Kapal *</label>
              <input
                id="input-vessel-owner"
                type="text"
                placeholder="Misal: PT Meratus Line"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nomor IMO</label>
              <input
                id="input-vessel-imo"
                type="text"
                placeholder="Misal: IMO 9812345"
                value={formData.imo}
                onChange={(e) => setFormData({ ...formData, imo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Call Sign & Bendera</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  id="input-vessel-callsign"
                  type="text"
                  placeholder="Call Sign"
                  value={formData.callSign}
                  onChange={(e) => setFormData({ ...formData, callSign: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-cyan-500"
                />
                <input
                  id="input-vessel-flag"
                  type="text"
                  placeholder="Bendera"
                  value={formData.flag}
                  onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Status Operasional</label>
              <select
                id="select-vessel-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as VesselStatus })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-cyan-500"
              >
                <option value="at_sea">Di Laut (At Sea / En Route)</option>
                <option value="anchored">Lego Jangkar (Anchored)</option>
                <option value="berthing">Sandar Dermaga (Berthing)</option>
                <option value="loading_unloading">Sedang Bongkar Muat (Loading/Discharging)</option>
                <option value="departed">Berangkat (Departed)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Alokasi Dermaga (Berth)</label>
              <select
                id="select-vessel-berth"
                value={formData.berth}
                onChange={(e) => setFormData({ ...formData, berth: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-cyan-500"
              >
                <option value="Dermaga 01 - Utara">Dermaga 01 - Utara (Kedalaman 14m)</option>
                <option value="Dermaga 02 - Barat">Dermaga 02 - Barat (Kedalaman 12m)</option>
                <option value="Dermaga 03 - Selatan">Dermaga 03 - Selatan (Kedalaman 11m)</option>
                <option value="Dermaga 04 - Domestik">Dermaga 04 - Domestik (Kedalaman 9.5m)</option>
                <option value="Anchorage Area B">Area Lego Jangkar (Anchorage B)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Perkiraan Tiba (ETA)</label>
              <input
                id="input-vessel-eta"
                type="datetime-local"
                value={formData.eta}
                onChange={(e) => setFormData({ ...formData, eta: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Perkiraan Berangkat (ETD)</label>
              <input
                id="input-vessel-etd"
                type="datetime-local"
                value={formData.etd}
                onChange={(e) => setFormData({ ...formData, etd: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Kapasitas TEUs & Muatan Saat Ini</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  id="input-vessel-teus-cap"
                  type="number"
                  placeholder="Kapasitas (TEU)"
                  value={formData.teusCapacity}
                  onChange={(e) => setFormData({ ...formData, teusCapacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-cyan-500"
                />
                <input
                  id="input-vessel-teus-curr"
                  type="number"
                  placeholder="Muatan (TEU)"
                  value={formData.currentTeus}
                  onChange={(e) => setFormData({ ...formData, currentTeus: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Quay Crane yang Ditugaskan</label>
              <input
                id="input-vessel-crane"
                type="text"
                placeholder="Misal: STS-01 & STS-02"
                value={formData.craneAssigned}
                onChange={(e) => setFormData({ ...formData, craneAssigned: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Pelabuhan Asal</label>
              <input
                id="input-vessel-origin"
                type="text"
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Pelabuhan Tujuan</label>
              <input
                id="input-vessel-destination"
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Catatan Operasional Dermaga</label>
            <textarea
              id="textarea-vessel-notes"
              rows={2}
              placeholder="Instruksi khusus pandu laut, bunker BBM, prioritas kargo reefer..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-cyan-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              id="btn-cancel-vessel"
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              id="btn-submit-vessel"
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-cyan-900/30"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Menyimpan...' : vessel ? 'Perbarui Kapal' : 'Simpan Jadwal Kapal'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
