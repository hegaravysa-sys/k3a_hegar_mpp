import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { LoginPage } from './components/LoginPage';
import { LoginModal } from './components/LoginModal';
import { DashboardView } from './components/DashboardView';
import { VesselsView } from './components/VesselsView';
import { BookingsView } from './components/BookingsView';
import { ContainersView } from './components/ContainersView';
import { FinanceView } from './components/FinanceView';
import { PublicTracker } from './components/PublicTracker';
import { VesselModal } from './components/VesselModal';
import { BookingModal } from './components/BookingModal';
import { ContainerModal } from './components/ContainerModal';
import { InvoiceModal } from './components/InvoiceModal';
import { Vessel, Booking, ContainerItem, Invoice } from './types';
import {
  subscribeVessels,
  subscribeBookings,
  subscribeContainers,
  subscribeInvoices,
  seedDatabaseIfEmpty
} from './services/db';
import { Smartphone, Monitor } from 'lucide-react';

function PortOpsApp() {
  const { user, quickLoginAs } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Firestore real-time state
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [dbLoading, setDbLoading] = useState<boolean>(true);

  // Modal controls
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isVesselModalOpen, setIsVesselModalOpen] = useState<boolean>(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const [isContainerModalOpen, setIsContainerModalOpen] = useState<boolean>(false);
  const [editingContainer, setEditingContainer] = useState<ContainerItem | null>(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceModalMode, setInvoiceModalMode] = useState<'create' | 'view'>('view');

  // Initialize Firestore listeners & seed initial data
  useEffect(() => {
    let unsubVessels: () => void = () => {};
    let unsubBookings: () => void = () => {};
    let unsubContainers: () => void = () => {};
    let unsubInvoices: () => void = () => {};

    const initDb = async () => {
      try {
        await seedDatabaseIfEmpty();
      } catch (err) {
        console.error('Initial seeding error:', err);
      }

      unsubVessels = subscribeVessels((data) => {
        setVessels(data);
        setDbLoading(false);
      });

      unsubBookings = subscribeBookings((data) => {
        setBookings(data);
      });

      unsubContainers = subscribeContainers((data) => {
        setContainers(data);
      });

      unsubInvoices = subscribeInvoices((data) => {
        setInvoices(data);
      });
    };

    initDb();

    return () => {
      unsubVessels();
      unsubBookings();
      unsubContainers();
      unsubInvoices();
    };
  }, []);

  // Handlers for CRUD modals
  const handleOpenNewVessel = () => {
    setEditingVessel(null);
    setIsVesselModalOpen(true);
  };

  const handleEditVessel = (v: Vessel) => {
    setEditingVessel(v);
    setIsVesselModalOpen(true);
  };

  const handleOpenNewBooking = () => {
    setEditingBooking(null);
    setIsBookingModalOpen(true);
  };

  const handleEditBooking = (b: Booking) => {
    setEditingBooking(b);
    setIsBookingModalOpen(true);
  };

  const handleOpenNewContainer = () => {
    setEditingContainer(null);
    setIsContainerModalOpen(true);
  };

  const handleEditContainer = (c: ContainerItem) => {
    setEditingContainer(c);
    setIsContainerModalOpen(true);
  };

  const handleOpenNewInvoice = () => {
    setEditingInvoice(null);
    setInvoiceModalMode('create');
    setIsInvoiceModalOpen(true);
  };

  const handleViewInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setInvoiceModalMode('view');
    setIsInvoiceModalOpen(true);
  };

  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setInvoiceModalMode('create');
    setIsInvoiceModalOpen(true);
  };

  // Content Renderer
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            vessels={vessels}
            bookings={bookings}
            containers={containers}
            invoices={invoices}
            onNavigate={setActiveTab}
            onOpenNewBooking={handleOpenNewBooking}
            onOpenNewVessel={handleOpenNewVessel}
            onOpenNewContainer={handleOpenNewContainer}
            onSelectVessel={handleEditVessel}
            onSelectBooking={handleEditBooking}
          />
        );
      case 'vessels':
        return (
          <VesselsView
            vessels={vessels}
            onOpenCreate={handleOpenNewVessel}
            onEditVessel={handleEditVessel}
          />
        );
      case 'bookings':
        return (
          <BookingsView
            bookings={bookings}
            onOpenCreate={handleOpenNewBooking}
            onEditBooking={handleEditBooking}
          />
        );
      case 'containers':
        return (
          <ContainersView
            containers={containers}
            onOpenCreate={handleOpenNewContainer}
            onEditContainer={handleEditContainer}
          />
        );
      case 'finance':
        return (
          <FinanceView
            invoices={invoices}
            onOpenCreate={handleOpenNewInvoice}
            onViewInvoice={handleViewInvoice}
            onEditInvoice={handleEditInvoice}
          />
        );
      case 'tracking':
        return (
          <PublicTracker
            containers={containers}
            bookings={bookings}
            vessels={vessels}
          />
        );
      default:
        return null;
    }
  };

  // If no user is logged in, show the Login Form first as requested
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMobileFrame={isMobileFrame}
        setIsMobileFrame={setIsMobileFrame}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Body */}
      {isMobileFrame ? (
        /* Mobile Device Frame Simulation */
        <div className="grow flex items-center justify-center p-4 sm:p-8 bg-slate-200/70">
          <div className="w-full max-w-[390px] h-[844px] bg-slate-50 border-[10px] border-slate-800 rounded-[50px] shadow-2xl shadow-slate-400/40 overflow-hidden flex flex-col relative ring-1 ring-slate-300">
            
            {/* Phone Speaker & Dynamic Island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-800 rounded-full z-50 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-900 mr-2"></div>
              <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
            </div>

            {/* Mobile Viewport Header */}
            <div className="pt-8 px-4 pb-2 bg-white border-b border-slate-200 flex items-center justify-between shadow-xs">
              <span className="text-xs font-mono font-bold text-blue-700">PORTOPS MOBILE</span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Online
              </span>
            </div>

            {/* Mobile Scrollable Viewport */}
            <div className="grow overflow-y-auto p-4 pb-20 space-y-4 bg-slate-50 text-slate-800">
              {renderContent()}
            </div>

            {/* In-Frame Mobile Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200">
              <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>

            {/* Phone Home Indicator Bar */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-400 rounded-full z-40 pointer-events-none"></div>
          </div>
        </div>
      ) : (
        /* Standard Workstation / Desktop Responsive Layout */
        <div className="grow flex">
          {/* Sidebar */}
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpenMobile={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
            vesselCount={vessels.length}
            bookingCount={bookings.length}
            containerCount={containers.length}
          />

          {/* Main Content Area */}
          <main className="grow lg:pl-64 flex flex-col min-w-0">
            <div className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12">
              {renderContent()}
            </div>
          </main>
        </div>
      )}

      {/* Native Mobile Bottom Navigation (Only visible on real mobile screen widths when not in frame mode) */}
      {!isMobileFrame && (
        <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      )}

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <VesselModal
        isOpen={isVesselModalOpen}
        onClose={() => { setIsVesselModalOpen(false); setEditingVessel(null); }}
        vessel={editingVessel}
      />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => { setIsBookingModalOpen(false); setEditingBooking(null); }}
        booking={editingBooking}
        vesselsList={vessels}
      />

      <ContainerModal
        isOpen={isContainerModalOpen}
        onClose={() => { setIsContainerModalOpen(false); setEditingContainer(null); }}
        container={editingContainer}
        vesselsList={vessels}
      />

      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => { setIsInvoiceModalOpen(false); setEditingInvoice(null); }}
        invoice={editingInvoice}
        mode={invoiceModalMode}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PortOpsApp />
    </AuthProvider>
  );
}
