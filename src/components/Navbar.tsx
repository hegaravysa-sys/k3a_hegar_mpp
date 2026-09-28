import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Ship,
  Database,
  Smartphone,
  Monitor,
  User,
  LogOut,
  LogIn,
  RotateCcw,
  ChevronDown,
  ShieldCheck,
  Briefcase,
  ShoppingBag,
  Menu
} from 'lucide-react';
import { resetDatabaseWithDefaultData } from '../services/db';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  onOpenLoginModal: () => void;
  onToggleMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isMobileFrame,
  setIsMobileFrame,
  onOpenLoginModal,
  onToggleMobileMenu
}) => {
  const { user, logout, quickLoginAs } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleResetData = async () => {
    if (window.confirm('Reset database ke data awal terminal peti kemas?')) {
      setResetting(true);
      try {
        await resetDatabaseWithDefaultData();
      } catch (e) {
        console.error(e);
      } finally {
        setResetting(false);
      }
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return { label: 'Admin Terminal', color: 'bg-amber-50 text-amber-800 border-amber-200', icon: ShieldCheck };
      case 'ship_owner':
        return { label: 'Pemilik Kapal', color: 'bg-blue-50 text-blue-800 border-blue-200', icon: Ship };
      case 'agent':
        return { label: 'Agen Pelayaran', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: Briefcase };
      case 'customer':
        return { label: 'Pelanggan / Shipper', color: 'bg-purple-50 text-purple-800 border-purple-200', icon: ShoppingBag };
      default:
        return { label: 'Tamu', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: User };
    }
  };

  const roleInfo = user ? getRoleLabel(user.role) : null;
  const RoleIcon = roleInfo ? roleInfo.icon : User;

  return (
    <header id="main-navbar" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 text-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Left: Brand & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              id="btn-mobile-menu"
              onClick={onToggleMobileMenu}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 lg:hidden rounded-lg hover:bg-slate-100"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-cyan-600 p-0.5 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all">
                <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
                  <Ship className="w-5 h-5 text-blue-700" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 font-mono">PORTOPS</span>
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                    TOS v2.6
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">Terminal Peti Kemas & Logistik Pelabuhan</p>
              </div>
            </div>

            {/* Live Firestore indicator */}
            <div className="hidden md:flex items-center gap-1.5 ml-4 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[11px] text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Database className="w-3 h-3 text-emerald-600" />
              <span className="font-semibold">Firestore Realtime DB</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* View Mode Toggle: Desktop / Mobile Device View */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                id="btn-view-desktop"
                onClick={() => setIsMobileFrame(false)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  !isMobileFrame 
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tampilan Desktop Penuh"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                id="btn-view-mobile"
                onClick={() => setIsMobileFrame(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isMobileFrame 
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Simulasi Tampilan Mobile App"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile Frame</span>
              </button>
            </div>

            {/* Quick Re-seed DB Button */}
            <button
              id="btn-reset-database"
              onClick={handleResetData}
              disabled={resetting}
              className="p-2 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg border border-transparent hover:border-amber-200 transition-colors text-xs"
              title="Reset data contoh terminal ke Firestore"
            >
              <RotateCcw className={`w-4 h-4 ${resetting ? 'animate-spin text-amber-600' : ''}`} />
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                id="btn-role-switcher"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-xs ${
                  roleInfo ? roleInfo.color : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <RoleIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{roleInfo?.label || 'Pilih Role'}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {roleDropdownOpen && (
                <div 
                  id="role-dropdown-menu"
                  className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="px-3 py-2 border-b border-slate-100 text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                    Ganti Peran (Persona Demo)
                  </div>

                  <button
                    onClick={() => { quickLoginAs('admin'); setRoleDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 text-slate-700"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <div>
                      <p className="font-semibold text-slate-900">Admin Terminal</p>
                      <p className="text-[10px] text-slate-500">Kontrol Penuh & Pengesahan</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { quickLoginAs('ship_owner'); setRoleDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 text-slate-700"
                  >
                    <Ship className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="font-semibold text-slate-900">Pemilik Kapal</p>
                      <p className="text-[10px] text-slate-500">Pantau Jadwal Sandar & Kapal</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { quickLoginAs('agent'); setRoleDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 text-slate-700"
                  >
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-slate-900">Agen Pelayaran</p>
                      <p className="text-[10px] text-slate-500">Booking Peti Kemas & DO</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { quickLoginAs('customer'); setRoleDropdownOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 text-slate-700"
                  >
                    <ShoppingBag className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="font-semibold text-slate-900">Pelanggan / Shipper</p>
                      <p className="text-[10px] text-slate-500">Lacak Kontainer & Tagihan</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Auth Button */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  id="btn-open-user-profile"
                  onClick={onOpenLoginModal}
                  className="hidden md:flex flex-col text-right hover:opacity-80 cursor-pointer"
                >
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">{user.displayName}</span>
                  <span className="text-[10px] text-slate-500 leading-tight truncate max-w-[140px]">{user.companyName}</span>
                </button>
                <button
                  id="btn-logout"
                  onClick={() => logout()}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="Keluar / Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-open-login"
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
