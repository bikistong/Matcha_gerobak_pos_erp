import React, { useState, useMemo } from 'react';
import { 
  DailyOperation, 
  OpeningCash, 
  Sale, 
  Expense, 
  PaymentMethod 
} from '../types';
import { formatRupiah } from '../utils/calculations';
import { 
  Calculator, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Coins, 
  ShieldAlert, 
  Calendar, 
  UserCheck, 
  FileText,
  Clock,
  ArrowRight
} from 'lucide-react';

interface CashReconciliationProps {
  dailyOperations: DailyOperation[];
  openingCashes: OpeningCash[];
  sales: Sale[];
  expenses: Expense[];
  onExecuteDailyClosing: (
    opId: string, 
    actualCash: number, 
    variance: number, 
    closedBy: string, 
    closingNotes: string
  ) => void;
  onNavigateToPOS: () => void;
}

export const CashReconciliation: React.FC<CashReconciliationProps> = ({
  dailyOperations,
  openingCashes,
  sales,
  expenses,
  onExecuteDailyClosing,
  onNavigateToPOS,
}) => {
  // Currently selected daily operation session
  const [selectedOpId, setSelectedOpId] = useState<string>(
    dailyOperations.find(op => op.status === 'OPEN')?.id || dailyOperations[0]?.id || ''
  );

  const selectedOp = useMemo(() => {
    return dailyOperations.find(op => op.id === selectedOpId) || dailyOperations[0];
  }, [dailyOperations, selectedOpId]);

  // Denomination counts for physical cash calculation
  const [denominations, setDenominations] = useState<{ [key: number]: number }>({
    100000: 0,
    50000: 0,
    20000: 0,
    10000: 0,
    5000: 0,
    2000: 0,
    1000: 0,
  });

  const [useDenominationHelper, setUseDenominationHelper] = useState<boolean>(true);
  const [manualActualCash, setManualActualCash] = useState<number>(0);
  const [closedByInput, setClosedByInput] = useState<string>('Siti (Kasir Shift Malam)');
  const [closingNotesInput, setClosingNotesInput] = useState<string>('');

  // Computations for selected daily operation
  const openingCashRecord = useMemo(() => {
    return openingCashes.find(opc => opc.dailyOperationId === selectedOp?.id);
  }, [openingCashes, selectedOp]);

  const openingAmount = openingCashRecord ? openingCashRecord.amount : 0;

  // Filter sales for selected daily operation
  const sessionSales = useMemo(() => {
    if (!selectedOp) return [];
    return sales.filter(s => s.dailyOperationId === selectedOp.id && s.status === 'COMPLETED');
  }, [sales, selectedOp]);

  // Filter expenses for selected daily operation
  const sessionExpenses = useMemo(() => {
    if (!selectedOp) return [];
    return expenses.filter(e => e.dailyOperationId === selectedOp.id);
  }, [expenses, selectedOp]);

  // Break down sales by payment method
  const salesByPayment = useMemo(() => {
    let cash = 0;
    let qris = 0;
    let debit = 0;
    let transfer = 0;

    sessionSales.forEach(s => {
      if (s.paymentMethod === 'CASH') cash += s.totalAmount;
      else if (s.paymentMethod === 'QRIS') qris += s.totalAmount;
      else if (s.paymentMethod === 'DEBIT') debit += s.totalAmount;
      else if (s.paymentMethod === 'TRANSFER') transfer += s.totalAmount;
    });

    const totalRevenue = cash + qris + debit + transfer;
    return { cash, qris, debit, transfer, totalRevenue };
  }, [sessionSales]);

  // Total cash expenses
  const totalCashExpenses = useMemo(() => {
    return sessionExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [sessionExpenses]);

  // Expected Cash = Opening Cash + Cash Sales - Cash Expenses
  const expectedCash = useMemo(() => {
    return openingAmount + salesByPayment.cash - totalCashExpenses;
  }, [openingAmount, salesByPayment.cash, totalCashExpenses]);

  // Calculated Actual Cash
  const calculatedDenominationTotal = useMemo(() => {
    return Object.entries(denominations).reduce(
      (sum, [denom, qty]) => sum + Number(denom) * Number(qty),
      0
    );
  }, [denominations]);

  const actualCash = useDenominationHelper ? calculatedDenominationTotal : manualActualCash;

  // Cash Variance = Actual Cash - Expected Cash
  const variance = actualCash - expectedCash;

  const handleDenomChange = (denom: number, count: number) => {
    const val = Math.max(0, count);
    setDenominations(prev => ({
      ...prev,
      [denom]: val
    }));
  };

  const handleClosingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOp) return;

    if (selectedOp.status === 'CLOSED') {
      alert('Sesi operasional ini sudah dikunci sebelumnya.');
      return;
    }

    if (!closedByInput.trim()) {
      alert('Mohon masukkan nama petugas / supervisor penanggung jawab.');
      return;
    }

    const confirmMsg = `Konfirmasi Kunci & Daily Closing Tanggal ${selectedOp.date}?\n\n` +
      `- Expected Cash: ${formatRupiah(expectedCash)}\n` +
      `- Actual Cash: ${formatRupiah(actualCash)}\n` +
      `- Variance: ${formatRupiah(variance)} (${variance === 0 ? 'SEIMBANG' : variance < 0 ? 'DEFISIT' : 'SURPLUS'})\n\n` +
      `Setelah dikunci, status menjadi CLOSED dan transaksi hari ini tidak dapat diubah lagi.`;

    if (window.confirm(confirmMsg)) {
      onExecuteDailyClosing(
        selectedOp.id,
        actualCash,
        variance,
        closedByInput,
        closingNotesInput
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[#4C644415] text-[#4C6444] border border-[#4C644430]">
              BP-09 & BP-10
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Cash Reconciliation & Daily Closing
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Hitung fisik uang kasir (Actual Cash), rekonsiliasi selisih (Variance), dan kuncikan transaksi harian toko.
          </p>
        </div>

        {/* Operational Session Picker */}
        <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-medium text-slate-700">Tanggal Operasional:</span>
          <select
            value={selectedOpId}
            onChange={(e) => setSelectedOpId(e.target.value)}
            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4C6444]"
          >
            {dailyOperations.map(op => (
              <option key={op.id} value={op.id}>
                {op.date} ({op.status === 'CLOSED' ? '🔒 CLOSED' : '🟢 OPEN'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Session Status Badge */}
      {selectedOp && (
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          selectedOp.status === 'CLOSED'
            ? 'bg-slate-900 text-white border-slate-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-center space-x-3">
            {selectedOp.status === 'CLOSED' ? (
              <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <Clock className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm">
                  Operasional Tanggal {selectedOp.date}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  selectedOp.status === 'CLOSED' 
                    ? 'bg-amber-400 text-slate-950 font-extrabold' 
                    : 'bg-emerald-600 text-white'
                }`}>
                  {selectedOp.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {selectedOp.status === 'CLOSED' 
                  ? `Dikunci pada ${selectedOp.closedAt ? new Date(selectedOp.closedAt).toLocaleString('id-ID') : '-'} oleh ${selectedOp.closedBy || 'Supervisor'}`
                  : `Dibuka pada ${selectedOp.openedAt ? new Date(selectedOp.openedAt).toLocaleString('id-ID') : '-'} oleh ${selectedOp.openedBy || 'Kasir Shift'}`
                }
              </p>
            </div>
          </div>

          {selectedOp.status === 'OPEN' && (
            <button
              onClick={onNavigateToPOS}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-colors"
            >
              <span>Buka POS Kasir</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Main Grid: Left Side (Reconciliation Formula & Payment Method Breakdown) | Right Side (Physical Count & Closing) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Calculation Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* BP-09 Expected Cash Formula Box */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-[#4C6444]" />
              <span>Rekonsiliasi Kas Laci (BP-09 Expected Cash Formula)</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-2 text-slate-700 font-medium">
                  <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">+</span>
                  <span>Modal Awal Kasir (Opening Cash Float)</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(openingAmount)}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-2 text-slate-700 font-medium">
                  <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">+</span>
                  <span>Penjualan Tunai POS (Cash Sales)</span>
                </div>
                <span className="font-mono font-bold text-emerald-700">{formatRupiah(salesByPayment.cash)}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-2 text-slate-700 font-medium">
                  <span className="w-5 h-5 rounded bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">-</span>
                  <span>Biaya Operasional Tunai (Cash Out)</span>
                </div>
                <span className="font-mono font-bold text-rose-600">-{formatRupiah(totalCashExpenses)}</span>
              </div>

              {/* Total Expected Cash Header */}
              <div className="flex items-center justify-between p-3.5 bg-[#4C644410] border-2 border-[#4C6444] rounded-xl text-slate-900">
                <div>
                  <span className="font-bold text-xs text-[#4C6444] uppercase tracking-wider block">Expected Cash in Drawer</span>
                  <span className="text-[11px] text-slate-500">Saldo fisik kasir yang seharusnya ada</span>
                </div>
                <span className="font-mono font-extrabold text-xl text-[#4C6444]">
                  {formatRupiah(expectedCash)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-slate-600" />
              <span>Rincian Omzet Berdasarkan Metode Pembayaran</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50">
                <span className="text-slate-500 block text-[11px]">TUNAI (CASH)</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{formatRupiah(salesByPayment.cash)}</span>
              </div>

              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50/50">
                <span className="text-blue-600 font-semibold block text-[11px]">QRIS / E-WALLET</span>
                <span className="font-mono font-bold text-blue-900 text-sm">{formatRupiah(salesByPayment.qris)}</span>
              </div>

              <div className="p-3 rounded-lg border border-purple-200 bg-purple-50/50">
                <span className="text-purple-600 font-semibold block text-[11px]">DEBIT / EDC</span>
                <span className="font-mono font-bold text-purple-900 text-sm">{formatRupiah(salesByPayment.debit)}</span>
              </div>

              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50">
                <span className="text-emerald-700 font-bold block text-[11px]">TOTAL OMZET</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">{formatRupiah(salesByPayment.totalRevenue)}</span>
              </div>
            </div>
          </div>

          {/* Expenses Log for Session */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>Pengeluaran Operasional Shift Ini ({sessionExpenses.length})</span>
              <span className="font-mono font-bold text-rose-600 text-xs">{formatRupiah(totalCashExpenses)}</span>
            </h3>

            {sessionExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Tidak ada catatan pengeluaran kasir pada hari ini.</p>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {sessionExpenses.map(exp => (
                  <div key={exp.id} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-slate-800 block">{exp.notes || exp.category}</span>
                      <span className="text-[10px] text-slate-400">Dibayarkan kepada: {exp.paidTo}</span>
                    </div>
                    <span className="font-mono font-semibold text-rose-600">-{formatRupiah(exp.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column (5 cols): Physical Counting & Closing Action */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Physical Cash Count Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>Hitung Fisik Uang Kasir (Actual Cash)</span>
              </h2>

              <button
                type="button"
                onClick={() => setUseDenominationHelper(!useDenominationHelper)}
                className="text-[11px] font-semibold text-[#4C6444] hover:underline"
              >
                {useDenominationHelper ? 'Switch Input Manual' : 'Gunakan Hitung Pecahan'}
              </button>
            </div>

            {useDenominationHelper ? (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-500">Masukkan jumlah lembar / keping pecahan uang yang ada di laci:</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[100000, 50000, 20000, 10000, 5000, 2000, 1000].map(denom => (
                    <div key={denom} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="font-mono font-medium text-slate-700">Rp {denom.toLocaleString('id-ID')}</span>
                      <input
                        type="number"
                        min="0"
                        value={denominations[denom]}
                        onChange={(e) => handleDenomChange(denom, parseInt(e.target.value) || 0)}
                        disabled={selectedOp?.status === 'CLOSED'}
                        className="w-16 bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-center font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#4C6444] disabled:bg-slate-100"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between font-bold text-xs text-slate-900">
                  <span>Total Hitung Pecahan:</span>
                  <span className="font-mono text-sm text-[#4C6444]">{formatRupiah(calculatedDenominationTotal)}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700">Total Uang Fisik Kasir (IDR):</label>
                <input
                  type="number"
                  min="0"
                  value={manualActualCash}
                  onChange={(e) => setManualActualCash(Number(e.target.value))}
                  disabled={selectedOp?.status === 'CLOSED'}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4C6444] disabled:bg-slate-100"
                />
              </div>
            )}

            {/* Variance Analysis Display */}
            <div className={`p-4 rounded-xl border space-y-2 ${
              variance === 0 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : variance < 0
                ? 'bg-rose-50 border-rose-300 text-rose-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">Hasil Selisih (Variance)</span>
                {variance === 0 ? (
                  <span className="flex items-center space-x-1 text-xs font-extrabold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SEIMBANG (PASS)</span>
                  </span>
                ) : variance < 0 ? (
                  <span className="flex items-center space-x-1 text-xs font-extrabold bg-rose-200 text-rose-800 px-2 py-0.5 rounded">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>SHORTAGE (DEFISIT)</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 text-xs font-extrabold bg-amber-200 text-amber-800 px-2 py-0.5 rounded">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>SURPLUS (OVER)</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between font-mono font-extrabold text-lg">
                <span>Variance:</span>
                <span className={variance === 0 ? 'text-emerald-700' : variance < 0 ? 'text-rose-700' : 'text-amber-700'}>
                  {variance > 0 ? `+${formatRupiah(variance)}` : formatRupiah(variance)}
                </span>
              </div>

              <p className="text-[11px] leading-tight">
                {variance === 0 && 'Uang fisik di laci kasir tepat sesuai dengan perhitungan transaksi sistem.'}
                {variance < 0 && `Uang fisik kasir KURANG sebesar ${formatRupiah(Math.abs(variance))}. Periksa kemungkinan susuk tidak tercatat atau kembalian salah.`}
                {variance > 0 && `Uang fisik kasir LEBIH sebesar ${formatRupiah(variance)}. Periksa kemungkinan transaksi tunai belum ter-input di POS.`}
              </p>
            </div>
          </div>

          {/* Daily Closing Form & Submission */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-slate-700" />
              <span>Kunci Operasional (BP-10 Daily Closing)</span>
            </h2>

            {selectedOp?.status === 'CLOSED' ? (
              <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 text-xs text-slate-600 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Sesi Ini Sudah Dikunci Permanen</span>
                </div>
                <p>Status: <span className="font-mono font-bold text-slate-900">CLOSED</span></p>
                <p>Dikunci Oleh: <span className="font-medium text-slate-800">{selectedOp.closedBy || 'Supervisor'}</span></p>
                <p>Waktu Closing: <span className="font-medium text-slate-800">{selectedOp.closedAt ? new Date(selectedOp.closedAt).toLocaleString('id-ID') : '-'}</span></p>
                <p>Uang Fisik Kasir (Actual): <span className="font-mono font-bold text-slate-900">{formatRupiah(selectedOp.actualCash || 0)}</span></p>
                <p>Variance: <span className="font-mono font-bold text-slate-900">{formatRupiah(selectedOp.cashVariance || 0)}</span></p>
                {selectedOp.notes && (
                  <p className="pt-1 text-slate-500 border-t border-slate-200">Catatan: {selectedOp.notes}</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleClosingSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Nama Petugas / Supervisor Penanggung Jawab:
                  </label>
                  <input
                    type="text"
                    required
                    value={closedByInput}
                    onChange={(e) => setClosedByInput(e.target.value)}
                    placeholder="Contoh: Siti (Kasir Shift Malam)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4C6444]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Catatan Closing / Penjelasan Selisih Kas:
                  </label>
                  <textarea
                    rows={2}
                    value={closingNotesInput}
                    onChange={(e) => setClosingNotesInput(e.target.value)}
                    placeholder="Catatan penutupan toko, penjelasan selisih jika ada..."
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4C6444]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-98"
                >
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Execute Daily Closing & Lock Date</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
