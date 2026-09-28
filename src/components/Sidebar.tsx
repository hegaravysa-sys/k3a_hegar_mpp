import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Ship,
  FileSpreadsheet,
  Box,
  ReceiptText,
  Search,
  Anchor,
  Layers,
  ArrowRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  vesselCount?: number;
  bookingCount?: number;
  containerCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile = false,
  onCloseMobile,
  vesselCount = 0,
  bookingCount = 0,
  containerCount = 0
}) => {
  const { user } = useAuth();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Ringkasan Terminal',
      description: 'KPI & Status Operasional',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'vessels',
      label: 'Pelacakan Kapal',
      description: 'Jadwal Sandar & Radar Dermaga',
      icon: Ship,
      badge: vesselCount > 0 ? `${vesselCount} Kapal` : null,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'bookings',
      label: 'Pemesanan (Booking)',
      description: 'Muatan & Peti Kemas Agen',
      icon: FileSpreadsheet,
      badge: bookingCount > 0 ? `${bookingCount}` : null,
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200'
    },
    {
      id: 'containers',
      label: 'Yard & Peti Kemas',
      description: 'Blok Penumpukan & Bea Cukai',
      icon: Box,
      badge: containerCount > 0 ? `${containerCount} Box` : null,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'finance',
      label: 'Laporan Keuangan',
      description: 'Faktur THC, Storage & Billing',
      icon: ReceiptText,
      badge: 'Real-time',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 'tracking',
      label: 'Lacak Cepat B/L',
      description: 'Pencarian Instan Kontainer',
      icon: Search,
      badge: null
    }
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/90 shadow-xs transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between overflow-y-auto`}
      >
        <div className="p-4 space-y-6">
          
          {/* User Persona Quick Banner */}
          <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-xl">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Peran Anda</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">
              {user?.companyName || 'Pengunjung Terminal'}
            </p>
            <p className="text-[11px] text-slate-500 capitalize mt-0.5">
              {user?.role === 'admin' ? 'Operator Terminal (Admin)' : user?.role === 'ship_owner' ? 'Pemilik Kapal' : user?.role === 'agent' ? 'Agen Pelayaran' : 'Pelanggan / Kargo'}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
              Menu Navigasi
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'}`} />
                    <div className="text-left">
                      <p className={`font-semibold leading-tight ${isActive ? 'text-white' : 'text-slate-800'}`}>
                        {item.label}
                      </p>
                      <p className={`text-[10px] leading-tight mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-semibold ${
                      isActive 
                        ? 'bg-blue-700/90 border-blue-400/40 text-white' 
                        : item.badgeColor
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Port Status Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <Anchor className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <p className="font-bold text-[11px] text-slate-900">Terminal Peti Kemas 01</p>
              <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Operasional Normal 24/7
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
