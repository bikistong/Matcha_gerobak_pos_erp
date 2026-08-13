import React, { useState } from 'react';
import { 
  Plus, 
  Receipt, 
  DollarSign, 
  Trash2, 
  Tag, 
  Calendar, 
  User, 
  FileText, 
  AlertCircle 
} from 'lucide-react';
import { Expense, ExpenseCategory, DailyOperation } from '../types';
import { formatRupiah } from '../utils/calculations';

interface OperatingExpenseProps {
  expenses: Expense[];
  dailyOperations: DailyOperation[];
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (id: string) => void;
}

export const CATEGORY_LABELS: Record<ExpenseCategory, { label: string; bg: string; text: string }> = {
  ICE_CUBES: { label: 'Es Batu Kristal', bg: 'bg-cyan-50', text: 'text-cyan-700' },
  PARKING: { label: 'Retribusi Parkir', bg: 'bg-amber-50', text: 'text-amber-700' },
  CLEANING: { label: 'Kebersihan & Sampah', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  LPG_GAS: { label: 'Gas LPG / Bahan Bakar', bg: 'bg-red-50', text: 'text-red-700' },
  GALLON_WATER: { label: 'Air Galon Operasional', bg: 'bg-blue-50', text: 'text-blue-700' },
  SUPPLIES: { label: 'Perlengkapan (Tisu/Plastik)', bg: 'bg-purple-50', text: 'text-purple-700' },
  OTHER: { label: 'Pengeluaran Lainnya', bg: 'bg-slate-100', text: 'text-slate-700' },
};

export const OperatingExpense: React.FC<OperatingExpenseProps> = ({
  expenses,
  dailyOperations,
  onAddExpense,
  onDeleteExpense,
}) => {
  const activeShift = dailyOperations.find(op => op.status === 'OPEN') || dailyOperations[0];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>('ICE_CUBES');
  const [amount, setAmount] = useState<number>(15000);
  const [paidTo, setPaidTo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Total expenses today
  const totalExpenseToday = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) {
      alert('Tidak ada shift operasional harian yang aktif.');
      return;
    }
    if (amount <= 0) {
      alert('Jumlah pengeluaran harus lebih dari Rp 0.');
      return;
    }
    if (!paidTo.trim()) {
      alert('Harap isi nama penerima / vendor pembayaran.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const expNum = `EXP-${todayStr}-${Math.floor(100 + Math.random() * 900)}`;

    onAddExpense({
      expenseNumber: expNum,
      dailyOperationId: activeShift.id,
      category,
      amount,
      paidTo,
      notes
    });

    setIsModalOpen(false);
    setAmount(15000);
    setPaidTo('');
    setNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Pencatatan Biaya Operasional (BP-08)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan beban pengeluaran kas harian gerobak (es batu, parkir, kebersihan, dll) yang langsung mempengaruhi saldo kas akhir.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#4C6444] hover:bg-[#3d5036] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xs shrink-0 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Pengeluaran Kas Baru</span>
        </button>
      </div>

      {/* METRICS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Total Pengeluaran Hari Ini</span>
          <div className="text-2xl font-black text-red-600">{formatRupiah(totalExpenseToday)}</div>
          <span className="text-[10px] text-slate-400">Total {expenses.length} transaksi pencatatan</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Shift Harian Aktif</span>
          <div className="text-sm font-bold text-slate-900">{activeShift?.operationDate || 'Tidak Ada Shift'}</div>
          <span className="text-[10px] text-emerald-700 font-mono">Status: {activeShift?.status || 'CLOSED'}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs text-slate-500 font-medium">Kategori Dominan</span>
          <div className="text-sm font-bold text-slate-900">Es Batu & Retribusi</div>
          <span className="text-[10px] text-slate-400">Beban harian rutin booth</span>
        </div>
      </div>

      {/* EXPENSE TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Daftar Pengeluaran Kas Gerobak</h3>
          <span className="text-xs text-slate-500">{expenses.length} Catatan</span>
        </div>

        {expenses.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Receipt className="w-12 h-12 mx-auto text-slate-200" />
            <p className="text-sm font-medium text-slate-500">Belum ada pengeluaran kas hari ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">No. Pengeluaran</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Jumlah (Nominal)</th>
                  <th className="px-4 py-3">Penerima / Vendor</th>
                  <th className="px-4 py-3">Catatan</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(exp => {
                  const catMeta = CATEGORY_LABELS[exp.category] || CATEGORY_LABELS.OTHER;
                  return (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{exp.expenseNumber}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${catMeta.bg} ${catMeta.text}`}>
                          {catMeta.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-extrabold text-red-600 text-sm">{formatRupiah(exp.amount)}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{exp.paidTo}</td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{exp.notes || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM MODAL FOR ADDING EXPENSE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Catat Pengeluaran Operasional (BP-08)</h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Kategori Biaya:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#4C6444] text-slate-800"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            {/* Nominal Amount */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Nominal (Rp):</label>
              <input
                type="number"
                min="1000"
                step="500"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#4C6444]"
              />
            </div>

            {/* Paid To */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Penerima / Vendor / Pemasok:</label>
              <input
                type="text"
                required
                placeholder="misal: Pak Slamet Es Batu / Jukir Lapangan"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-[#4C6444] text-slate-800"
              />
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Keterangan Tambahan:</label>
              <textarea
                rows={2}
                placeholder="Rincian barang/keperluan..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#4C6444] text-slate-800"
              />
            </div>

            <div className="flex space-x-2 pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-1/2 py-2.5 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 bg-[#4C6444] hover:bg-[#3d5036] text-white rounded-xl text-xs font-bold shadow-xs active:scale-98"
              >
                Simpan Pengeluaran
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
