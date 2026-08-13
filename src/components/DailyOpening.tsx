import React, { useState } from 'react';
import { DailyOperation, OpeningCash, StockIssue, Ingredient } from '../types';
import { formatIDR } from '../utils/calculations';
import { Sun, DollarSign, ArrowRightLeft, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Plus, Lock } from 'lucide-react';

interface DailyOpeningProps {
  dailyOperations: DailyOperation[];
  openingCashes: OpeningCash[];
  stockIssues: StockIssue[];
  ingredients: Ingredient[];
  onOpenStore: (op: DailyOperation, cash: OpeningCash, issues: StockIssue[]) => void;
  onCloseStore: (opId: string, notes: string) => void;
}

export const DailyOpening: React.FC<DailyOpeningProps> = ({
  dailyOperations,
  openingCashes,
  stockIssues,
  ingredients,
  onOpenStore,
  onCloseStore,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Find today's operation if exists
  const todayOp = dailyOperations.find(op => op.date === todayStr);

  // Form states for Opening Store
  const [openingCashAmount, setOpeningCashAmount] = useState<number>(300000); // Rp 300.000 float default
  const [cashNotes, setCashNotes] = useState<string>('Modal uang kembalian kasir (Pecahan 5k, 10k, 20k, 50k)');
  const [operatorName, setOperatorName] = useState<string>('Kasir Shift Pagi');
  const [opNotes, setOpNotes] = useState<string>('Persiapan buka booth gerobak');

  // Stock issue lines for today
  const [issueItems, setIssueItems] = useState<Array<{ ingredientId: string; qty: number }>>([
    { ingredientId: ingredients[1]?.id || 'ing-2', qty: 500 }, // 500g Matcha Powder
    { ingredientId: ingredients[2]?.id || 'ing-3', qty: 10000 }, // 10L Milk
  ]);

  // Closing notes
  const [closeNotes, setCloseNotes] = useState<string>('Penutupan toko, pencatatan kasir selaras.');

  // Check previous day operation status (BR-OPN-002)
  const prevDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const prevOp = dailyOperations.find(op => op.date === prevDate);
  const isPrevOpUnclosed = prevOp && prevOp.status !== 'CLOSED';

  const handleAddIssueRow = () => {
    if (ingredients.length > 0) {
      setIssueItems([...issueItems, { ingredientId: ingredients[0].id, qty: 100 }]);
    }
  };

  const handleRemoveIssueRow = (index: number) => {
    setIssueItems(issueItems.filter((_, i) => i !== index));
  };

  const handleIssueChange = (index: number, field: 'ingredientId' | 'qty', value: any) => {
    const updated = [...issueItems];
    updated[index] = { ...updated[index], [field]: value };
    setIssueItems(updated);
  };

  const handleSubmitOpenStore = (e: React.FormEvent) => {
    e.preventDefault();

    if (openingCashAmount < 0) {
      alert('Modal awal (Opening Cash) harus bernilai positif.');
      return;
    }

    const newOpId = `dop-${Date.now()}`;

    const newOp: DailyOperation = {
      id: newOpId,
      date: todayStr,
      status: 'OPEN',
      openedAt: new Date().toISOString(),
      openedBy: operatorName,
      notes: opNotes,
      createdAt: new Date().toISOString(),
    };

    const newCash: OpeningCash = {
      id: `opc-${Date.now()}`,
      dailyOperationId: newOpId,
      amount: Number(openingCashAmount),
      notes: cashNotes,
      createdAt: new Date().toISOString(),
    };

    const newIssues: StockIssue[] = issueItems.map((item, idx) => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      return {
        id: `iss-${Date.now()}-${idx}`,
        issueNumber: `ISS-${todayStr.replace(/-/g, '')}-${String(idx + 1).padStart(3, '0')}`,
        dailyOperationId: newOpId,
        ingredientId: item.ingredientId,
        quantityIssued: Number(item.qty),
        unit: ing?.unit || 'gram',
        issuedAt: new Date().toISOString(),
        notes: `Transfer stok awal hari ke booth (${ing?.name || ''})`,
      };
    });

    onOpenStore(newOp, newCash, newIssues);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#4C6444] font-mono text-xs font-bold uppercase mb-1">
            <Sun className="w-4 h-4" />
            <span>BP-02 Daily Opening & Operations Module</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Operasional Buka Toko (Daily Opening & Shift)</h2>
          <p className="text-xs text-slate-500 mt-1">
            Prosedur pembukaan gerobak harian, pencatatan kas modal awal (Opening Cash - BR-OPN-003), dan transfer stok bahan dari gudang utama ke booth (Stock Issue - BR-OPN-005).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tanggal Operasional</span>
            <span className="text-sm font-mono font-bold text-slate-800">{todayStr}</span>
          </div>

          <div
            className={`px-3 py-1.5 rounded-lg border font-bold text-xs flex items-center space-x-1.5 ${
              todayOp?.status === 'OPEN'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : todayOp?.status === 'CLOSED'
                ? 'bg-slate-100 text-slate-700 border-slate-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>STATUS: {todayOp?.status || 'BELUM BUKA (DRAFT)'}</span>
          </div>
        </div>
      </div>

      {/* Warning Alert if Previous Day Unclosed (BR-OPN-002) */}
      {isPrevOpUnclosed && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex items-start space-x-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Peringatan Validasi Operasional (BR-OPN-002):</h4>
            <p className="mt-0.5 leading-relaxed">
              Toko hari kemarin (Tanggal {prevDate}) belum ditutup berstatus <strong className="font-mono">OPEN</strong>. Harap pastikan shift hari sebelumnya telah direkap sebelum melanjutkan transaksi hari ini.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Opening Form or Active Operational Dashboard */}
      {!todayOp || todayOp.status === 'DRAFT' ? (
        /* OPENING STORE FORM */
        <form onSubmit={handleSubmitOpenStore} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Cash Float Modal */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2 border-b border-slate-100 pb-3">
              <DollarSign className="w-4 h-4 text-[#4C6444]" />
              <span>1. Form Kas Modal Awal (Opening Cash Float)</span>
            </h3>

            <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-lg p-3 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-[#4C6444] block">Aturan Bisnis BR-OPN-003:</span>
              <p>Opening Cash adalah modal awal kembalian kasir. Nominal ini diisolasi dan <strong>TIDAK DIHITUNG sebagai pendapatan/omzet penjualan</strong>.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Penanggung Jawab Shift</label>
                <input
                  type="text"
                  required
                  value={operatorName}
                  onChange={e => setOperatorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#4C6444]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nominal Modal Uang Kembalian (Rp)</label>
                <input
                  type="number"
                  min={0}
                  step={5000}
                  required
                  value={openingCashAmount}
                  onChange={e => setOpeningCashAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-mono font-bold border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#4C6444]"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">Formatted: <strong>{formatIDR(openingCashAmount)}</strong></span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Rincian / Catatan Pecahan Kas</label>
                <textarea
                  rows={2}
                  value={cashNotes}
                  onChange={e => setCashNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#4C6444]"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Stock Issue Transfer to Booth */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <ArrowRightLeft className="w-4 h-4 text-[#4C6444]" />
                  <span>2. Transfer Bahan Baku Gudang -&gt; Gerobak (Stock Issue)</span>
                </h3>

                <button
                  type="button"
                  onClick={handleAddIssueRow}
                  className="text-xs font-bold text-[#4C6444] border border-[#4C644430] bg-[#4C644410] px-2.5 py-1 rounded-lg hover:bg-[#4C644420] flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Bahan</span>
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
                <span>Aturan BR-OPN-005: Mencatat mutasi bahan baku dari gudang utama ke gerobak untuk persiapan penjualan harian.</span>
              </div>

              {/* Table of stock issues */}
              <div className="space-y-2">
                {issueItems.map((item, index) => {
                  const selectedIng = ingredients.find(i => i.id === item.ingredientId);
                  return (
                    <div key={index} className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
                      <select
                        value={item.ingredientId}
                        onChange={e => handleIssueChange(index, 'ingredientId', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded bg-white text-slate-800"
                      >
                        {ingredients.map(ing => (
                          <option key={ing.id} value={ing.id}>
                            {ing.code} - {ing.name} (Stok Gudang: {ing.currentStock} {ing.unit})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min={1}
                        value={item.qty}
                        onChange={e => handleIssueChange(index, 'qty', Number(e.target.value))}
                        className="w-20 px-2 py-1.5 border border-slate-200 rounded bg-white text-center font-mono"
                      />

                      <span className="w-12 text-slate-500 font-mono text-[11px]">{selectedIng?.unit || 'unit'}</span>

                      <button
                        type="button"
                        onClick={() => handleRemoveIssueRow(index)}
                        className="text-rose-600 hover:text-rose-800 font-bold px-1.5 py-0.5 rounded"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="bg-[#4C6444] hover:bg-[#3d5036] text-white font-bold text-xs px-6 py-2.5 rounded-lg flex items-center space-x-2 shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Konfirmasi & Buka Toko Hari Ini (STATUS: OPEN)</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* ACTIVE OPEN OPERATIONAL DASHBOARD */
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#4C6444] text-white flex items-center justify-center font-bold">
                <Sun className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-950 text-base">Toko Aktif Beroperasi Hari Ini ({todayOp.date})</h3>
                <p className="text-xs text-emerald-800">
                  Dibuka oleh <strong>{todayOp.openedBy}</strong> pada pukul{' '}
                  <span className="font-mono">{todayOp.openedAt ? new Date(todayOp.openedAt).toLocaleTimeString('id-ID') : '-'}</span>
                </p>
              </div>
            </div>

            {todayOp.status === 'OPEN' && (
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Catatan penutupan shift..."
                  value={closeNotes}
                  onChange={e => setCloseNotes(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-emerald-300 rounded-lg bg-white"
                />
                <button
                  onClick={() => onCloseStore(todayOp.id, closeNotes)}
                  className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Tutup Toko (Close Shift)</span>
                </button>
              </div>
            )}
          </div>

          {/* Active Shift Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Opening Cash Display */}
            {openingCashes
              .filter(c => c.dailyOperationId === todayOp.id)
              .map(cash => (
                <div key={cash.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Opening Cash (Modal Awal)</span>
                  <div className="text-xl font-bold text-slate-900 font-mono">{formatIDR(cash.amount)}</div>
                  <p className="text-xs text-slate-500">{cash.notes}</p>
                </div>
              ))}

            {/* Issued Stock Items */}
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center space-x-1">
                <ArrowRightLeft className="w-3.5 h-3.5 text-[#4C6444]" />
                <span>Ringkasan Bahan Baku Transfer Ke Booth (Stock Issue)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stockIssues
                  .filter(iss => iss.dailyOperationId === todayOp.id)
                  .map(iss => {
                    const ing = ingredients.find(i => i.id === iss.ingredientId);
                    return (
                      <div key={iss.id} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-900 block">{ing?.name || 'Bahan Baku'}</span>
                          <span className="text-[10px] text-slate-500">{iss.issueNumber}</span>
                        </div>
                        <span className="font-mono font-bold text-[#4C6444] bg-[#4C644410] px-2 py-0.5 rounded border border-[#4C644420]">
                          +{iss.quantityIssued} {iss.unit}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Operations History Log */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#4C6444]" />
          <span>Riwayat Log Operasional Harian Toko</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Opened By / At</th>
                <th className="py-2.5 px-3">Opening Cash Float</th>
                <th className="py-2.5 px-3">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {dailyOperations.map(op => {
                const cash = openingCashes.find(c => c.dailyOperationId === op.id);
                return (
                  <tr key={op.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{op.date}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          op.status === 'OPEN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {op.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {op.openedBy || 'Operator'}
                      <span className="block text-[10px] text-slate-400 font-mono">
                        {op.openedAt ? new Date(op.openedAt).toLocaleTimeString('id-ID') : '-'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {cash ? formatIDR(cash.amount) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 italic max-w-xs truncate">{op.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
