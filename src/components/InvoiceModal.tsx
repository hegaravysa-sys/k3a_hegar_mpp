import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem } from '../types';
import { addInvoice, updateInvoice } from '../services/db';
import { X, ReceiptText, Printer, CheckCircle2, Save, Plus, Trash2, Building, Calendar, QrCode } from 'lucide-react';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
  mode?: 'create' | 'view';
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  invoice,
  mode = 'view'
}) => {
  const [formData, setFormData] = useState<Omit<Invoice, 'id'>>({
    invoiceNumber: '',
    bookingNumber: 'BKG-2026-09-001',
    customerName: '',
    companyName: '',
    serviceType: 'Terminal Handling Charge (THC) & Stevedoring',
    items: [
      { description: 'THC Container 40ft (Box)', quantity: 2, unitPrice: 2800000, amount: 5600000 },
      { description: 'Stevedoring Quay Crane STS', quantity: 2, unitPrice: 800000, amount: 1600000 }
    ],
    subtotal: 7200000,
    tax: 792000,
    total: 7992000,
    status: 'unpaid',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    issueDate: new Date().toISOString().slice(0, 10),
    notes: 'Pembayaran melalui Rekening Otoritas Terminal Peti Kemas'
  });

  const [submitting, setSubmitting] = useState(false);
  const [currentMode, setCurrentMode] = useState<'create' | 'view'>(mode);

  useEffect(() => {
    setCurrentMode(mode);
    if (invoice) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber,
        bookingNumber: invoice.bookingNumber || '',
        customerName: invoice.customerName,
        companyName: invoice.companyName,
        serviceType: invoice.serviceType,
        items: invoice.items || [],
        subtotal: invoice.subtotal,
        tax: invoice.tax,
        total: invoice.total,
        status: invoice.status,
        dueDate: invoice.dueDate,
        issueDate: invoice.issueDate,
        paidAt: invoice.paidAt,
        paymentMethod: invoice.paymentMethod,
        notes: invoice.notes
      });
    } else {
      const invNum = 'INV-TPK-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
      setFormData({
        invoiceNumber: invNum,
        bookingNumber: 'BKG-2026-09-001',
        customerName: 'PT Indofood Sukses Makmur Tbk',
        companyName: 'PT Samudera Logistik Nusantara',
        serviceType: 'Terminal Handling Charge (THC) & Stevedoring',
        items: [
          { description: 'THC Peti Kemas 40ft (Box)', quantity: 2, unitPrice: 2800000, amount: 5600000 },
          { description: 'Stevedoring Quay Crane STS', quantity: 2, unitPrice: 800000, amount: 1600000 },
          { description: 'Biaya Penumpukan Lapangan (Yard Storage)', quantity: 2, unitPrice: 450000, amount: 900000 }
        ],
        subtotal: 8100000,
        tax: 891000,
        total: 8991000,
        status: 'unpaid',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        issueDate: new Date().toISOString().slice(0, 10),
        notes: 'Tagihan resmi jasa kepelabuhanan terminal peti kemas'
      });
    }
  }, [invoice, mode, isOpen]);

  if (!isOpen) return null;

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...formData.items];
    const item = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      item.amount = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
    }
    updatedItems[index] = item;

    const subtotal = updatedItems.reduce((acc, curr) => acc + curr.amount, 0);
    const tax = Math.round(subtotal * 0.11);
    const total = subtotal + tax;

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      tax,
      total
    });
  };

  const addItemRow = () => {
    const newItem: InvoiceItem = {
      description: 'Layanan Tambahan Terminal',
      quantity: 1,
      unitPrice: 500000,
      amount: 500000
    };
    const updatedItems = [...formData.items, newItem];
    const subtotal = updatedItems.reduce((acc, curr) => acc + curr.amount, 0);
    const tax = Math.round(subtotal * 0.11);
    const total = subtotal + tax;

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      tax,
      total
    });
  };

  const removeItemRow = (index: number) => {
    if (formData.items.length <= 1) return;
    const updatedItems = formData.items.filter((_, i) => i !== index);
    const subtotal = updatedItems.reduce((acc, curr) => acc + curr.amount, 0);
    const tax = Math.round(subtotal * 0.11);
    const total = subtotal + tax;

    setFormData({
      ...formData,
      items: updatedItems,
      subtotal,
      tax,
      total
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (invoice?.id) {
        await updateInvoice(invoice.id, formData);
      } else {
        await addInvoice(formData);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!invoice?.id) return;
    setSubmitting(true);
    try {
      await updateInvoice(invoice.id, {
        status: 'paid',
        paidAt: new Date().toISOString(),
        paymentMethod: 'Bank Transfer / Virtual Account Pelindo'
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="invoice-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div id="invoice-modal-container" className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-8">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-amber-950/60 to-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
              <ReceiptText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {currentMode === 'view' ? 'Faktur Tagihan Resmi Terminal' : invoice ? 'Edit Faktur Tagihan' : 'Terbitkan Faktur Baru'}
              </h3>
              <p className="text-xs text-slate-400">Pemberitahuan Pembayaran THC & Pelayanan Kapal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentMode === 'view' && (
              <button
                id="btn-print-invoice"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors border border-slate-700"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Faktur</span>
              </button>
            )}
            <button
              id="btn-close-invoice-modal"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content View Mode: Official Printable Invoice */}
        {currentMode === 'view' ? (
          <div className="p-6 space-y-6 max-h-[78vh] overflow-y-auto print:p-0 print:bg-white print:text-black">
            
            {/* Official Port Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">
                    PO
                  </div>
                  <span className="font-extrabold text-base tracking-wider text-white">PORTOPS TERMINAL</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Otoritas Pengelola Terminal Peti Kemas</p>
                <p className="text-[11px] text-slate-500">Jl. Pelabuhan Samudera No. 01, Dermaga Utama</p>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  formData.status === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}>
                  {formData.status === 'paid' ? 'LUNAS (PAID)' : 'MENUNGGU PEMBAYARAN'}
                </span>
                <p className="text-sm font-mono font-bold text-white mt-1.5">{formData.invoiceNumber}</p>
                <p className="text-[11px] text-slate-400">Ref: {formData.bookingNumber}</p>
              </div>
            </div>

            {/* Bill To & Dates */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-800/40 p-4 rounded-xl border border-slate-800">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Ditagihkan Kepada:</p>
                <p className="font-bold text-sm text-white">{formData.customerName}</p>
                <p className="text-slate-300 mt-0.5">{formData.companyName}</p>
                <p className="text-slate-400 mt-1 text-[11px]">Kategori: {formData.serviceType}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] uppercase font-bold text-slate-400">Rincian Tanggal:</p>
                <p className="text-slate-300">Tanggal Terbit: <strong className="text-white">{formData.issueDate}</strong></p>
                <p className="text-slate-300">Jatuh Tempo: <strong className="text-amber-400">{formData.dueDate}</strong></p>
                {formData.paidAt && (
                  <p className="text-emerald-400 text-[11px]">Dibayar pada: {new Date(formData.paidAt).toLocaleString('id-ID')}</p>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Deskripsi Layanan Kepelabuhanan</th>
                    <th className="py-2.5 px-3 text-center">Jml</th>
                    <th className="py-2.5 px-3 text-right">Tarif Satuan (Rp)</th>
                    <th className="py-2.5 px-3 text-right">Total (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {formData.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-medium text-slate-100">{item.description}</td>
                      <td className="py-2.5 px-3 text-center">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{item.unitPrice.toLocaleString('id-ID')}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">{item.amount.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculation Summary */}
            <div className="border-t border-slate-800 pt-4 flex flex-col items-end gap-1.5 text-xs">
              <div className="flex justify-between w-64 text-slate-400">
                <span>Subtotal Layanan:</span>
                <span className="font-mono text-slate-200">Rp {formData.subtotal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between w-64 text-slate-400">
                <span>PPN 11% (Pajak Terminal):</span>
                <span className="font-mono text-slate-200">Rp {formData.tax.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between w-64 text-sm font-bold border-t border-slate-700 pt-2 text-white">
                <span>Total Tagihan:</span>
                <span className="font-mono text-emerald-400">Rp {formData.total.toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Verification Footer with QR Code */}
            <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <QrCode className="w-10 h-10 text-cyan-400 shrink-0" />
                <div>
                  <p className="text-[11px] font-semibold text-slate-200">Verifikasi Dokumen Elektronik</p>
                  <p className="text-[10px] text-slate-400">Sah secara digital oleh Terminal Operating System PortOps</p>
                </div>
              </div>

              {formData.status === 'unpaid' ? (
                <button
                  id="btn-mark-paid"
                  onClick={handleMarkAsPaid}
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-emerald-900/30 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{submitting ? 'Memproses...' : 'Tandai Lunas'}</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Telah Terverifikasi Lunas</span>
                </div>
              )}
            </div>

          </div>
        ) : (
          /* Create / Edit Form Mode */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Faktur</label>
                <input
                  id="input-invoice-number"
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm font-mono text-amber-300 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Booking Terkait</label>
                <input
                  id="input-invoice-booking-ref"
                  type="text"
                  value={formData.bookingNumber}
                  onChange={(e) => setFormData({ ...formData, bookingNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Pelanggan (Shipper)</label>
                <input
                  id="input-invoice-customer"
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Agen / Forwarder</label>
                <input
                  id="input-invoice-company"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tanggal Terbit</label>
                <input
                  id="input-invoice-issue-date"
                  type="date"
                  value={formData.issueDate}
                  onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Jatuh Tempo</label>
                <input
                  id="input-invoice-due-date"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden"
                />
              </div>
            </div>

            {/* Items Editor */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300">Rincian Jasa Kepelabuhanan</label>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Baris</span>
                </button>
              </div>

              <div className="space-y-2">
                {formData.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Layanan"
                      value={item.description}
                      onChange={(e) => handleItemChange(i, 'description', e.target.value)}
                      className="flex-3 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(i, 'quantity', Number(e.target.value))}
                      className="w-16 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white text-center"
                    />
                    <input
                      type="number"
                      placeholder="Tarif (Rp)"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(i, 'unitPrice', Number(e.target.value))}
                      className="flex-2 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white text-right"
                    />
                    <button
                      type="button"
                      onClick={() => removeItemRow(i)}
                      className="p-1.5 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Calc */}
            <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 text-xs flex justify-between items-center">
              <span className="text-slate-400">Total (Termasuk PPN 11%):</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                Rp {formData.total.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Tagihan</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
