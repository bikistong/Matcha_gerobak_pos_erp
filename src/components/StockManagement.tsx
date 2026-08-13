import React, { useState } from 'react';
import { Ingredient, StockMovement, StockOpname, AdjustmentReason } from '../types';
import { formatIDR } from '../utils/calculations';
import { Layers, AlertTriangle, FileSpreadsheet, CheckCircle, RefreshCw, History, ArrowDownRight, ArrowUpRight, ShieldAlert, Plus } from 'lucide-react';

interface StockManagementProps {
  ingredients: Ingredient[];
  stockMovements: StockMovement[];
  stockOpnames: StockOpname[];
  onApplyStockOpname: (opname: StockOpname) => void;
}

export const StockManagement: React.FC<StockManagementProps> = ({
  ingredients,
  stockMovements,
  stockOpnames,
  onApplyStockOpname,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'balance' | 'opname' | 'audit'>('balance');
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState(false);

  // Form states for Stock Opname
  const [selectedIngredientId, setSelectedIngredientId] = useState<string>(ingredients[0]?.id || '');
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [reason, setReason] = useState<AdjustmentReason>('WASTE');
  const [opnameNotes, setOpnameNotes] = useState<string>('Pemeriksaan fisik mingguan gudang');

  // Selected ingredient helper
  const targetIng = ingredients.find(i => i.id === selectedIngredientId) || ingredients[0];
  const systemStock = targetIng?.currentStock || 0;
  const difference = physicalCount - systemStock;

  const handleOpenOpnameModal = (ingId?: string) => {
    const idToUse = ingId || ingredients[0]?.id || '';
    const ing = ingredients.find(i => i.id === idToUse);
    setSelectedIngredientId(idToUse);
    setPhysicalCount(ing?.currentStock || 0);
    setIsOpnameModalOpen(true);
  };

  const handleSubmitOpname = (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetIng) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const opnNum = `OPN-${todayStr.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newOpname: StockOpname = {
      id: `opn-${Date.now()}`,
      opnameNumber: opnNum,
      opnameDate: todayStr,
      ingredientId: targetIng.id,
      systemStock,
      physicalStock: Number(physicalCount),
      difference,
      unit: targetIng.unit,
      adjustmentReason: reason,
      status: 'APPROVED',
      notes: opnameNotes,
      createdAt: new Date().toISOString(),
    };

    onApplyStockOpname(newOpname);
    setIsOpnameModalOpen(false);
  };

  // Total inventory valuation calculation
  const totalValuation = ingredients.reduce((acc, curr) => acc + (curr.currentStock || 0) * curr.avgCost, 0);
  const lowStockCount = ingredients.filter(i => (i.currentStock || 0) <= (i.minStock || 0)).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#4C6444] font-mono text-xs font-bold uppercase mb-1">
            <Layers className="w-4 h-4" />
            <span>BP-04 Stock Management & Opname Module</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Manajemen Stok Gudang & Audit Stock Opname</h2>
          <p className="text-xs text-slate-500 mt-1">
            Monitoring saldo stok real-time, peringatan stok minimum, formulir penyesuaian fisik (Stock Opname), dan log mutasi stok immutable.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Valuasi Stok</span>
            <span className="text-sm font-mono font-extrabold text-[#4C6444]">{formatIDR(totalValuation)}</span>
          </div>

          <button
            onClick={() => handleOpenOpnameModal()}
            className="bg-[#4C6444] hover:bg-[#3d5036] text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center space-x-2 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Input Stock Opname</span>
          </button>
        </div>
      </div>

      {/* Low Stock Warning Indicator */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Terdapat <strong>{lowStockCount} bahan baku</strong> dengan stok dibawah batas minimum! Harap lakukan Restock PO ke supplier.
            </span>
          </div>
          <button
            onClick={() => setActiveSubTab('balance')}
            className="font-bold underline text-amber-900 hover:text-amber-950"
          >
            Lihat Detail
          </button>
        </div>
      )}

      {/* Sub Navigation */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('balance')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 ${
            activeSubTab === 'balance'
              ? 'bg-[#4C6444] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Monitoring Saldo Stok Real-Time ({ingredients.length} Bahan)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('opname')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 ${
            activeSubTab === 'opname'
              ? 'bg-[#4C6444] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Riwayat Stock Opname ({stockOpnames.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 ${
            activeSubTab === 'audit'
              ? 'bg-[#4C6444] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Audit Trail Mutasi Stok ({stockMovements.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: STOCK BALANCE TABLE */}
      {activeSubTab === 'balance' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-3">Kode & Bahan Baku</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3 text-right">Stok Min.</th>
                  <th className="py-2.5 px-3 text-right">Stok Fisik Saat Ini</th>
                  <th className="py-2.5 px-3 text-right">Avg Cost / Unit</th>
                  <th className="py-2.5 px-3 text-right">Total Valuasi</th>
                  <th className="py-2.5 px-3 text-center">Aksi Opname</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {ingredients.map(ing => {
                  const isLow = (ing.currentStock || 0) <= (ing.minStock || 0);
                  const valuation = (ing.currentStock || 0) * ing.avgCost;

                  return (
                    <tr key={ing.id} className={`hover:bg-slate-50 ${isLow ? 'bg-amber-50/30' : ''}`}>
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                            {ing.code}
                          </span>
                          <span className="font-bold text-slate-900">{ing.name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-600">{ing.category}</td>

                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        {ing.minStock} {ing.unit}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span className={`inline-flex items-center space-x-1 ${isLow ? 'text-amber-700 font-extrabold' : 'text-slate-900'}`}>
                          <span>{ing.currentStock} {ing.unit}</span>
                          {isLow && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {formatIDR(ing.avgCost)} / {ing.unit}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-[#4C6444]">
                        {formatIDR(valuation)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleOpenOpnameModal(ing.id)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] px-2.5 py-1 rounded border border-slate-200 transition-colors"
                        >
                          Opname
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: OPNAME HISTORY */}
      {activeSubTab === 'opname' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Histori Penyesuaian Fisik (Stock Opname Log)</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-3">No. Opname & Tgl</th>
                  <th className="py-2.5 px-3">Bahan Baku</th>
                  <th className="py-2.5 px-3 text-right">Stok Sistem</th>
                  <th className="py-2.5 px-3 text-right">Stok Fisik</th>
                  <th className="py-2.5 px-3 text-right">Selisih (Variance)</th>
                  <th className="py-2.5 px-3 text-center">Alasan Adjustment</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stockOpnames.map(opn => {
                  const ing = ingredients.find(i => i.id === opn.ingredientId);
                  return (
                    <tr key={opn.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-900 block">{opn.opnameNumber}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{opn.opnameDate}</span>
                      </td>

                      <td className="py-3 px-3 font-bold text-slate-900">{ing?.name || 'Bahan Baku'}</td>

                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {opn.systemStock} {opn.unit}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                        {opn.physicalStock} {opn.unit}
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold">
                        <span className={opn.difference < 0 ? 'text-rose-600' : opn.difference > 0 ? 'text-emerald-600' : 'text-slate-500'}>
                          {opn.difference > 0 ? `+${opn.difference}` : opn.difference} {opn.unit}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200">
                          {opn.adjustmentReason}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                          {opn.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: AUDIT TRAIL MUTASI STOK */}
      {activeSubTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Audit Trail Mutasi Stok (Immutable Stock Movements)</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Bahan Baku</th>
                  <th className="py-2.5 px-3">Tipe Mutasi</th>
                  <th className="py-2.5 px-3 text-right">Stok Awal</th>
                  <th className="py-2.5 px-3 text-right">Jumlah Mutasi</th>
                  <th className="py-2.5 px-3 text-right">Stok Akhir</th>
                  <th className="py-2.5 px-3">Ref / Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {stockMovements.map(mov => {
                  const ing = ingredients.find(i => i.id === mov.ingredientId);
                  const isPositive = mov.quantity > 0;

                  return (
                    <tr key={mov.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">
                        {new Date(mov.createdAt).toLocaleString('id-ID')}
                      </td>

                      <td className="py-2.5 px-3 font-bold text-slate-900">{ing?.name || 'Bahan Baku'}</td>

                      <td className="py-2.5 px-3">
                        <span className="font-mono text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                          {mov.movementType}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {mov.previousStock} {mov.unit}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-bold">
                        <span className={isPositive ? 'text-emerald-700' : 'text-rose-700'}>
                          {isPositive ? `+${mov.quantity}` : mov.quantity} {mov.unit}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono font-extrabold text-slate-900">
                        {mov.currentStock} {mov.unit}
                      </td>

                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                        <strong className="text-slate-800 font-mono block">{mov.referenceId || '-'}</strong>
                        <span>{mov.notes || ''}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL STOCK OPNAME */}
      {isOpnameModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden space-y-4">
            <div className="bg-[#4C6444] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Form Stock Opname & Adjustment</span>
              </h3>
              <button onClick={() => setIsOpnameModalOpen(false)} className="text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitOpname} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Pilih Bahan Baku</label>
                <select
                  value={selectedIngredientId}
                  onChange={e => {
                    const ingId = e.target.value;
                    setSelectedIngredientId(ingId);
                    const ing = ingredients.find(i => i.id === ingId);
                    setPhysicalCount(ing?.currentStock || 0);
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white font-bold"
                >
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>
                      {ing.code} - {ing.name} (Gudang: {ing.currentStock} {ing.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Stok Sistem</span>
                  <span className="text-base font-mono font-bold text-slate-800">
                    {systemStock} {targetIng?.unit}
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#4C6444] uppercase block">Hasil Hitung Fisik</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={physicalCount}
                    onChange={e => setPhysicalCount(Number(e.target.value))}
                    className="w-full px-2 py-1 text-sm font-mono font-bold border border-slate-300 rounded bg-white text-right"
                  />
                </div>
              </div>

              {/* Difference Calculation Preview */}
              <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-200 p-2.5 rounded-lg text-xs">
                <span>Selisih Stok (Variance):</span>
                <span className={`font-mono font-bold ${difference < 0 ? 'text-rose-700' : difference > 0 ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {difference > 0 ? `+${difference}` : difference} {targetIng?.unit}
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Alasan Penyesuaian (Reason)</label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value as AdjustmentReason)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="WASTE">WASTE (Tumpah / Terbuang)</option>
                  <option value="DAMAGED">DAMAGED (Kemasan Rusak)</option>
                  <option value="EXPIRED">EXPIRED (Kedaluwarsa)</option>
                  <option value="DISCREPANCY">DISCREPANCY (Selisih Hitung / Lupa Catat)</option>
                  <option value="OTHER">OTHER (Lainnya)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 uppercase mb-1">Catatan Tambahan</label>
                <textarea
                  rows={2}
                  value={opnameNotes}
                  onChange={e => setOpnameNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#4C6444] hover:bg-[#3d5036] text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center space-x-2 shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Setujui Opname & Adjust Stok</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
