import React, { useState } from 'react';
import { Invoice } from '../types';
import { useAuth } from '../context/AuthContext';
import { deleteInvoice, updateInvoice } from '../services/db';
import {
  ReceiptText,
  Search,
  Plus,
  Printer,
  CheckCircle2,
  Trash2,
  TrendingUp,
  CreditCard,
  Building,
  Calendar,
  DollarSign,
  AlertCircle
} from 'lucide-react';

interface FinanceViewProps {
  invoices: Invoice[];
  onOpenCreate: () => void;
  onViewInvoice: (invoice: Invoice) => void;
  onEditInvoice: (invoice: Invoice) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  invoices,
  onOpenCreate,
  onViewInvoice,
  onEditInvoice
}) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Financial aggregates
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
  const totalUnpaid = invoices.filter(i => i.status === 'unpaid').reduce((sum, i) => sum + i.total, 0);
  const totalTax = invoices.reduce((sum, i) => sum + i.tax, 0);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.serviceType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (window.confirm('Hapus faktur tagihan ini dari laporan keuangan?')) {
      setDeletingId(id);
      try {
        await deleteInvoice(id);
      } catch (e) {
        console.error(e);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleMarkPaid = async (inv: Invoice) => {
    if (!inv.id) return;
    try {
      await updateInvoice(inv.id, {
        status: 'paid',
        paidAt: new Date().toISOString(),
        paymentMethod: 'Bank Transfer Virtual Account'
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div id="finance-view" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Laporan Keuangan & Penagihan (Billing & Finance)
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
              {invoices.length} Faktur
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Rekapitulasi pendapatan jasa kepelabuhanan: Terminal Handling Charges (THC), penumpukan, stevedoring, dan PPN 11%.
          </p>
        </div>

        {/* Action: CRUD Create Invoice */}
        <button
          id="btn-create-invoice"
          onClick={onOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-amber-900/30"
        >
          <Plus className="w-4 h-4" />
          <span>Terbitkan Faktur Baru</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Paid Revenue */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Penerimaan (Lunas)</span>
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              Rp {totalPaid.toLocaleString('id-ID')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {invoices.filter(i => i.status === 'paid').length} transaksi berhasil diterima kas terminal
          </p>
        </div>

        {/* Unpaid Receivables */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Piutang Belum Terbayar</span>
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-amber-400">
              Rp {totalUnpaid.toLocaleString('id-ID')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {invoices.filter(i => i.status === 'unpaid').length} tagihan menunggu konfirmasi shipper/agen
          </p>
        </div>

        {/* Tax (PPN 11%) */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total PPN 11% Terkumpul</span>
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              Rp {totalTax.toLocaleString('id-ID')}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Setoran pajak resmi kepelabuhanan ke kas negara
          </p>
        </div>

      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            id="input-search-invoices"
            type="text"
            placeholder="Cari nomor invoice, nama shipper, agen logistik..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              statusFilter === 'all'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Semua Tagihan
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Lunas (Paid)
          </button>
          <button
            onClick={() => setStatusFilter('unpaid')}
            className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              statusFilter === 'unpaid'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            Belum Bayar (Unpaid)
          </button>
        </div>
      </div>

      {/* Invoices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInvoices.map((inv) => (
          <div
            key={inv.id || inv.invoiceNumber}
            id={`invoice-card-${inv.id}`}
            className="p-5 bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 rounded-2xl transition-all shadow-md hover:shadow-amber-950/20 space-y-3.5 flex flex-col justify-between"
          >
            <div>
              {/* Top Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 shrink-0">
                    <ReceiptText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono font-bold text-sm text-amber-300">{inv.invoiceNumber}</span>
                    <h3 className="text-base font-bold text-white tracking-tight mt-0.5">{inv.customerName}</h3>
                    <p className="text-xs text-slate-400">{inv.companyName}</p>
                  </div>
                </div>

                <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold border ${
                  inv.status === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {inv.status === 'paid' ? 'LUNAS' : 'BELUM BAYAR'}
                </span>
              </div>

              {/* Service Details */}
              <div className="mt-3 p-3 bg-slate-800/50 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                <p className="font-medium text-slate-200">{inv.serviceType}</p>
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Jatuh Tempo: <strong className="text-amber-400">{inv.dueDate}</strong></span>
                  <span>Terbit: {inv.issueDate}</span>
                </div>
              </div>

              {/* Line Items Preview */}
              <div className="mt-3 space-y-1 text-xs">
                {inv.items?.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-400 text-[11px]">
                    <span className="truncate max-w-[200px]">{item.description}</span>
                    <span className="font-mono text-slate-200">Rp {item.amount.toLocaleString('id-ID')}</span>
                  </div>
                ))}
                {inv.items?.length > 2 && (
                  <p className="text-[10px] text-slate-500 italic">+ {inv.items.length - 2} layanan lainnya...</p>
                )}
              </div>
            </div>

            {/* Total & Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Total Tagihan (Termasuk PPN)</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  Rp {inv.total.toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {inv.status === 'unpaid' && (
                  <button
                    onClick={() => handleMarkPaid(inv)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold rounded-lg transition-colors"
                    title="Tandai Pembayaran Lunas"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Lunas</span>
                  </button>
                )}

                <button
                  onClick={() => onViewInvoice(inv)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                  title="Lihat & Cetak Faktur Digital"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cetak</span>
                </button>

                <button
                  id={`btn-delete-invoice-${inv.id}`}
                  onClick={() => handleDelete(inv.id)}
                  disabled={deletingId === inv.id}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                  title="Hapus Faktur"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}

        {filteredInvoices.length === 0 && (
          <div className="col-span-full py-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            <ReceiptText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-300">Tidak ada faktur yang cocok</p>
            <p className="text-xs text-slate-500 mt-1">Gunakan tombol "Terbitkan Faktur Baru" untuk membuat tagihan kepelabuhanan baru.</p>
          </div>
        )}
      </div>

    </div>
  );
};
