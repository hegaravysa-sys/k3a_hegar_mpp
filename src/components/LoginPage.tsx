import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Ship,
  Anchor,
  ShieldCheck,
  Briefcase,
  ShoppingBag,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Database,
  Lock,
  Mail,
  Building2,
  User,
  KeyRound,
  Sparkles
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, quickLoginAs } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('admin@portops.id');
  const [password, setPassword] = useState('PortAdmin2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        if (!email || !password || !displayName || !companyName) {
          throw new Error('Harap lengkapi semua data pendaftaran akun.');
        }
        await register(email, password, displayName, role, companyName);
      } else {
        if (!email || !password) {
          throw new Error('Mohon masukkan alamat email dan kata sandi.');
        }
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal melakukan autentikasi. Silakan periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDemoPersona = (targetRole: UserRole, defaultEmail: string) => {
    setEmail(defaultEmail);
    setPassword('PortPass2026!');
    quickLoginAs(targetRole);
  };

  const roleOptions: {
    role: UserRole;
    title: string;
    person: string;
    company: string;
    email: string;
    icon: any;
    desc: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
  }[] = [
    {
      role: 'admin',
      title: 'Admin Terminal',
      person: 'Kapten Supriyanto',
      company: 'Otoritas Pelabuhan',
      email: 'admin@portops.id',
      icon: ShieldCheck,
      desc: 'Kontrol penuh dermaga, persetujuan sandar & master data',
      badgeBg: 'bg-amber-50 hover:bg-amber-100/80',
      badgeBorder: 'border-amber-200 hover:border-amber-400',
      badgeText: 'text-amber-800'
    },
    {
      role: 'ship_owner',
      title: 'Pemilik Kapal',
      person: 'Bambang Hartono',
      company: 'PT Meratus Line Tbk',
      email: 'fleet@meratusline.com',
      icon: Ship,
      desc: 'Monitoring pergerakan armada & estimasi jadwal sandar',
      badgeBg: 'bg-blue-50 hover:bg-blue-100/80',
      badgeBorder: 'border-blue-200 hover:border-blue-400',
      badgeText: 'text-blue-800'
    },
    {
      role: 'agent',
      title: 'Agen Pelayaran',
      person: 'Rina Wijaya',
      company: 'PT Samudera Logistik',
      email: 'operations@samudera-agency.co.id',
      icon: Briefcase,
      desc: 'Pemesanan peti kemas, penerbitan DO & bea cukai',
      badgeBg: 'bg-emerald-50 hover:bg-emerald-100/80',
      badgeBorder: 'border-emerald-200 hover:border-emerald-400',
      badgeText: 'text-emerald-800'
    },
    {
      role: 'customer',
      title: 'Pelanggan / Shipper',
      person: 'Denny Prasetya',
      company: 'PT Indofood Sukses Makmur',
      email: 'supplychain@indofood.co.id',
      icon: ShoppingBag,
      desc: 'Pelacakan peti kemas mandiri, cek yard & faktur THC',
      badgeBg: 'bg-purple-50 hover:bg-purple-100/80',
      badgeBorder: 'border-purple-200 hover:border-purple-400',
      badgeText: 'text-purple-800'
    }
  ];

  return (
    <div id="login-screen" className="min-h-screen bg-slate-100/80 text-slate-800 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center text-white">
            <Ship className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 font-mono">PORTOPS</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                TOS v2.6 Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Terminal Peti Kemas & Operasional Maritim</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold">Firestore Database Aktif</span>
          </div>
        </div>
      </header>

      {/* Main Centered Login Section */}
      <main className="grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg">
          
          {/* Card Form */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 p-6 sm:p-8 relative">
            
            {/* Header / Brand in Card */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mb-3 shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {isRegister ? 'Pendaftaran Akun PortOps' : 'Masuk ke Sistem Operasional'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {isRegister 
                  ? 'Daftarkan instansi atau perusahaan logistik Anda ke terminal' 
                  : 'Silakan masukkan kredensial akun atau pilih persona demo di bawah'}
              </p>
            </div>

            {/* Tab Selector: Masuk vs Daftar */}
            <div className="flex p-1 bg-slate-100 rounded-xl mb-5 border border-slate-200/80">
              <button
                type="button"
                id="tab-login-mode"
                onClick={() => { setIsRegister(false); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  !isRegister 
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Masuk (Login)
              </button>
              <button
                type="button"
                id="tab-register-mode"
                onClick={() => { setIsRegister(true); setError(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isRegister 
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daftar Akun Baru
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <span className="font-bold">•</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="register-input-name"
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Misal: Denny Prasetya"
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Perusahaan / Instansi
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="register-input-company"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Misal: PT Meratus Line / PT Indofood Tbk"
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Peran Pengguna (Role)
                    </label>
                    <select
                      id="register-select-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                    >
                      <option value="customer">Pelanggan (Shipper / Consignee)</option>
                      <option value="agent">Agen Pelayaran (Shipping Agency)</option>
                      <option value="ship_owner">Pemilik Kapal (Ship Owner / Fleet)</option>
                      <option value="admin">Operator Terminal (Admin Pelabuhan)</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@perusahaan.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Kata Sandi (Password)
                  </label>
                  {!isRegister && (
                    <span 
                      onClick={() => setPassword('PortAdmin2026!')}
                      className="text-[11px] text-blue-600 hover:underline cursor-pointer"
                    >
                      Reset password demo
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span>Ingat saya di perangkat ini</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="btn-login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Memproses Autentikasi...
                  </span>
                ) : (
                  <>
                    <span>{isRegister ? 'Daftar Akun Sekarang' : 'Masuk ke Dashboard'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Click Role / Demo Persona Section */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  Akses Cepat (1-Klik Masuk Sesuai Peran):
                </span>
                <span className="text-[10px] text-blue-600 font-semibold">Siap Pakai</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.role}
                      id={`btn-persona-quick-${item.role}`}
                      type="button"
                      onClick={() => handleSelectDemoPersona(item.role, item.email)}
                      className={`p-2.5 rounded-xl border ${item.badgeBorder} ${item.badgeBg} text-left transition-all hover:shadow-xs group cursor-pointer`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${item.badgeText}`} />
                          <span className={`text-xs font-bold ${item.badgeText}`}>{item.title}</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-[11px] text-slate-700 font-medium truncate">{item.person}</p>
                      <p className="text-[10px] text-slate-500 truncate">{item.company}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="mt-5 text-center">
              <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Terhubung ke Firestore Real-time DB • Standar Keamanan Operasional Terminal</span>
              </p>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-4 sm:px-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <Anchor className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-700">PortOps - Container Terminal Operating System (TOS)</span>
        </div>
        <p className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} Otoritas Pelabuhan & Terminal Peti Kemas Indonesia.
        </p>
      </footer>

    </div>
  );
};
