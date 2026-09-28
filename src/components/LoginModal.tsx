import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LogIn, UserPlus, Ship, Briefcase, ShoppingBag, ShieldCheck, X, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, register, quickLoginAs, user } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isRegister) {
        if (!email || !password || !displayName || !companyName) {
          throw new Error('Harap lengkapi semua kolom pendaftaran.');
        }
        await register(email, password, displayName, role, companyName);
      } else {
        if (!email || !password) {
          throw new Error('Masukkan email dan kata sandi.');
        }
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan autentikasi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickSelect = (selectedRole: UserRole) => {
    quickLoginAs(selectedRole);
    onClose();
  };

  return (
    <div id="login-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div id="login-modal-container" className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-blue-700 to-indigo-800 text-white">
          <button
            id="btn-close-login-modal"
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 border border-white/20 rounded-xl text-white">
              <Ship className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">PortOps Terminal</h2>
              <p className="text-xs text-blue-100">Sistem Operasional & Logistik Peti Kemas</p>
            </div>
          </div>
        </div>

        {/* Current status if already logged in */}
        {user && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Saat ini masuk: <strong>{user.displayName}</strong> ({user.role})</span>
            </div>
            <button
              onClick={onClose}
              className="text-xs text-emerald-700 underline font-bold hover:text-emerald-900 cursor-pointer"
            >
              Lanjutkan
            </button>
          </div>
        )}

        {/* 1-Click Quick Demo Switch for instant test */}
        <div className="p-6 pb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Pilih Akses Cepat (1-Klik Persona):
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="btn-quick-admin"
              type="button"
              onClick={() => handleQuickSelect('admin')}
              className="flex items-center gap-2.5 p-2.5 bg-amber-50 hover:bg-amber-100/70 border border-amber-200 rounded-xl text-left transition-all text-xs cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">Admin Terminal</p>
                <p className="text-[11px] text-slate-500">Otoritas Pelabuhan</p>
              </div>
            </button>

            <button
              id="btn-quick-ship-owner"
              type="button"
              onClick={() => handleQuickSelect('ship_owner')}
              className="flex items-center gap-2.5 p-2.5 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 rounded-xl text-left transition-all text-xs cursor-pointer"
            >
              <Ship className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">Pemilik Kapal</p>
                <p className="text-[11px] text-slate-500">PT Meratus Line</p>
              </div>
            </button>

            <button
              id="btn-quick-agent"
              type="button"
              onClick={() => handleQuickSelect('agent')}
              className="flex items-center gap-2.5 p-2.5 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-xl text-left transition-all text-xs cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">Agen Pelayaran</p>
                <p className="text-[11px] text-slate-500">Samudera Logistik</p>
              </div>
            </button>

            <button
              id="btn-quick-customer"
              type="button"
              onClick={() => handleQuickSelect('customer')}
              className="flex items-center gap-2.5 p-2.5 bg-purple-50 hover:bg-purple-100/70 border border-purple-200 rounded-xl text-left transition-all text-xs cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">Pelanggan</p>
                <p className="text-[11px] text-slate-500">PT Indofood Tbk</p>
              </div>
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center px-6">
          <div className="grow border-t border-slate-200"></div>
          <span className="shrink mx-4 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Atau Masuk Manual</span>
          <div className="grow border-t border-slate-200"></div>
        </div>

        {/* Tab switch */}
        <div className="px-6 flex gap-2">
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              !isRegister ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              isRegister ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-3.5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  id="input-register-name"
                  type="text"
                  placeholder="Misal: Denny Prasetya"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Perusahaan / Instansi</label>
                <input
                  id="input-register-company"
                  type="text"
                  placeholder="Misal: PT Samudera Nusantara"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Peran Pengguna (Role)</label>
                <select
                  id="select-register-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
                >
                  <option value="customer">Pelanggan (Shipper / Consignee)</option>
                  <option value="agent">Agen Pelayaran (Shipping Agent)</option>
                  <option value="ship_owner">Pemilik Kapal (Ship Owner)</option>
                  <option value="admin">Operator Terminal (Admin)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
            <input
              id="input-login-email"
              type="email"
              placeholder="nama@perusahaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Kata Sandi</label>
            <input
              id="input-login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600"
              required
            />
          </div>

          <button
            id="btn-submit-auth"
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            {submitting ? 'Memproses...' : isRegister ? 'Daftar Akun Baru' : 'Masuk ke Sistem'}
          </button>
        </form>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            Terhubung ke Firestore Realtime DB • Keamanan Berbasis Peran
          </p>
        </div>

      </div>
    </div>
  );
};
