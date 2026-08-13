import React, { useState } from 'react';
import { Purchase, PurchaseDetail, GoodsReceipt, GoodsReceiptDetail, Ingredient } from '../types';
import { formatIDR } from '../utils/calculations';
import { ShoppingCart, Plus, CheckCircle, Clock, Truck, Calculator, DollarSign, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface PurchasingListProps {
  purchases: Purchase[];
  purchaseDetails: PurchaseDetail[];
  goodsReceipts: GoodsReceipt[];
  ingredients: Ingredient[];
  onAddPurchaseWithWAC: (
    purchase: Purchase,
    details: PurchaseDetail[],
    goodsReceipt: GoodsReceipt,
    receiptDetails: GoodsReceiptDetail[]
  ) => void;
  onTogglePaymentStatus: (purchaseId: string) => void;
}

export const PurchasingList: React.FC<PurchasingListProps> = ({
  purchases,
  purchaseDetails,
  goodsReceipts,
  ingredients,
  onAddPurchaseWithWAC,
  onTogglePaymentStatus,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for New PO
  const [supplierName, setSupplierName] = useState('PT Kyoto Premium Import');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'PAYABLE'>('PAID');
  const [receiverName, setReceiverName] = useState('Petugas Gudang Utama');
  const [poNotes, setPoNotes] = useState('Pembelian bahan baku stok usaha minggu ini.');

  // Items state
  const [items, setItems] = useState<
    Array<{ ingredientId: string; qty: number; unitCost: number }>
  >([
    { ingredientId: ingredients[0]?.id || 'ing-1', qty: 1000, unitCost: 550 },
  ]);

  const handleAddItemRow = () => {
    if (ingredients.length > 0) {
      setItems([...items, { ingredientId: ingredients[0].id, qty: 100, unitCost: ingredients[0].avgCost }]);
    }
  };

  const handleRemoveItemRow = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, val: any) => {
    const updated = [...items];
    if (field === 'ingredientId') {
      const ing = ingredients.find(i => i.id === val);
      updated[index] = {
        ingredientId: val,
        qty: updated[index].qty,
        unitCost: ing ? ing.avgCost : 0,
      };
    } else {
      updated[index] = { ...updated[index], [field]: val };
    }
    setItems(updated);
  };

  // Calculate total PO Amount
  const totalPoAmount = items.reduce((acc, curr) => acc + curr.qty * curr.unitCost, 0);

  const handleSubmitPO = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Tambahkan minimal 1 item bahan baku dalam PO.');
      return;
    }

    const todayStr = purchaseDate;
    const poId = `po-${Date.now()}`;
    const grId = `gr-${Date.now()}`;
    const poNum = `PO-${todayStr.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const grNum = `GR-${todayStr.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newPurchase: Purchase = {
      id: poId,
      purchaseNumber: poNum,
      supplierName,
      purchaseDate,
      totalAmount: totalPoAmount,
      paymentStatus,
      notes: poNotes,
      createdAt: new Date().toISOString(),
    };

    const newDetails: PurchaseDetail[] = items.map((item, idx) => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      return {
        id: `pod-${Date.now()}-${idx}`,
        purchaseId: poId,
        ingredientId: item.ingredientId,
        quantity: Number(item.qty),
        unit: ing?.unit || 'gram',
        unitCost: Number(item.unitCost),
        totalCost: Number(item.qty * item.unitCost),
      };
    });

    const newGR: GoodsReceipt = {
      id: grId,
      receiptNumber: grNum,
      purchaseId: poId,
      receiptDate: purchaseDate,
      status: 'VERIFIED',
      receivedBy: receiverName,
      notes: 'Penerimaan fisik & verifikasi kondisi barang',
      createdAt: new Date().toISOString(),
    };

    const newGRDetails: GoodsReceiptDetail[] = items.map((item, idx) => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      return {
        id: `grd-${Date.now()}-${idx}`,
        goodsReceiptId: grId,
        ingredientId: item.ingredientId,
        quantityReceived: Number(item.qty),
        unit: ing?.unit || 'gram',
        conditionNotes: 'Terverifikasi utuh & terseal',
      };
    });

    onAddPurchaseWithWAC(newPurchase, newDetails, newGR, newGRDetails);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#4C6444] font-mono text-xs font-bold uppercase mb-1">
            <ShoppingCart className="w-4 h-4" />
            <span>BP-03 Purchasing & Goods Receipt Module</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Pembelian Bahan Baku & Penerimaan Barang (Goods Receipt)</h2>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan PO supplier, verifikasi fisik barang masuk, serta otomatisasi pembaharuan harga rata-rata (<strong>Weighted Average Cost / BR-PUR-009</strong>).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#4C6444] hover:bg-[#3d5036] text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center space-x-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pembelian (PO Baru)</span>
        </button>
      </div>

      {/* WAC Formula Banner */}
      <div className="bg-[#4C644410] border border-[#4C644430] rounded-xl p-4 flex items-center justify-between gap-4 text-xs text-slate-800">
        <div className="flex items-center space-x-3">
          <Calculator className="w-5 h-5 text-[#4C6444] shrink-0" />
          <div>
            <span className="font-bold text-[#4C6444] block">Formula Weighted Average Cost (WAC - BR-PUR-009):</span>
            <code className="font-mono text-[11px] text-slate-700">
              New AvgCost = ((StokLama × CostLama) + (QtyBaru × CostBaru)) / (StokLama + QtyBaru)
            </code>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-[#4C6444] text-white px-2 py-1 rounded shadow-2xs">Auto SQL Trigger</span>
      </div>

      {/* Purchase Orders Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <Truck className="w-4 h-4 text-[#4C6444]" />
          <span>Riwayat Purchase Orders & Verification Status ({purchases.length} Transactions)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200 text-slate-500 uppercase font-bold text-[10px]">
                <th className="py-2.5 px-3">No. PO & Tanggal</th>
                <th className="py-2.5 px-3">Supplier</th>
                <th className="py-2.5 px-3">Rincian Item & Qty</th>
                <th className="py-2.5 px-3 text-right">Total Nominal</th>
                <th className="py-2.5 px-3 text-center">Status Bayar</th>
                <th className="py-2.5 px-3 text-center">Goods Receipt (GR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {purchases.map(po => {
                const details = purchaseDetails.filter(d => d.purchaseId === po.id);
                const gr = goodsReceipts.find(g => g.purchaseId === po.id);

                return (
                  <tr key={po.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-[#4C6444] bg-[#4C644410] px-2 py-0.5 rounded border border-[#4C644430] block w-fit">
                        {po.purchaseNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{po.purchaseDate}</span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{po.supplierName}</span>
                      <span className="text-[10px] text-slate-500 italic">{po.notes || '-'}</span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        {details.map(d => {
                          const ing = ingredients.find(i => i.id === d.ingredientId);
                          return (
                            <div key={d.id} className="text-[11px] flex items-center space-x-2">
                              <span className="font-semibold text-slate-800">{ing?.name || 'Item'}:</span>
                              <span className="font-mono text-slate-600">{d.quantity} {d.unit}</span>
                              <span className="text-slate-400">@ {formatIDR(d.unitCost)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm">
                      {formatIDR(po.totalAmount)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onTogglePaymentStatus(po.id)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                          po.paymentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                        }`}
                        title="Klik untuk ubah status pembayaran"
                      >
                        {po.paymentStatus === 'PAID' ? 'LUNAS (PAID)' : 'HUTANG (PAYABLE)'}
                      </button>
                    </td>

                    <td className="py-3 px-3 text-center">
                      {gr ? (
                        <div className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-bold text-[10px]">
                          <CheckCircle className="w-3 h-3" />
                          <span>{gr.receiptNumber} ({gr.status})</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px] italic">Pending Receive</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW PURCHASE ORDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden space-y-4">
            <div className="bg-[#4C6444] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4" />
                <span>Form Pembelian Bahan Baru & Automatic WAC Recalculation</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white hover:opacity-80 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitPO} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Nama Supplier</label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={e => setSupplierName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#4C6444]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={e => setPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#4C6444]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Status Pembayaran</label>
                  <select
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                  >
                    <option value="PAID">LUNAS (Paid Immediately)</option>
                    <option value="PAYABLE">TEMPO / HUTANG (Payable 14 Days)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 uppercase mb-1">Penerima Barang Gudang</label>
                  <input
                    type="text"
                    required
                    value={receiverName}
                    onChange={e => setReceiverName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#4C6444]"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">Rincian Item Bahan Baku</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-[#4C6444] font-bold border border-[#4C644430] bg-[#4C644410] px-2 py-1 rounded hover:bg-[#4C644420]"
                  >
                    + Add Item
                  </button>
                </div>

                {items.map((item, idx) => {
                  const selectedIng = ingredients.find(i => i.id === item.ingredientId);
                  
                  // Calculate projected new WAC for preview
                  const currentStock = selectedIng?.currentStock || 0;
                  const currentAvg = selectedIng?.avgCost || 0;
                  const newTotalStock = currentStock + Number(item.qty);
                  const projectedWac = newTotalStock > 0 
                    ? ((currentStock * currentAvg) + (Number(item.qty) * Number(item.unitCost))) / newTotalStock 
                    : 0;

                  return (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-2">
                      <div className="flex items-center space-x-2">
                        <select
                          value={item.ingredientId}
                          onChange={e => handleItemChange(idx, 'ingredientId', e.target.value)}
                          className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded bg-white"
                        >
                          {ingredients.map(ing => (
                            <option key={ing.id} value={ing.id}>
                              {ing.code} - {ing.name} (Cost Lama: {formatIDR(ing.avgCost)}/{ing.unit})
                            </option>
                          ))}
                        </select>

                        <div className="w-24">
                          <input
                            type="number"
                            placeholder="Qty"
                            min={1}
                            value={item.qty}
                            onChange={e => handleItemChange(idx, 'qty', Number(e.target.value))}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-center font-mono"
                          />
                        </div>

                        <div className="w-32">
                          <input
                            type="number"
                            placeholder="Harga Beli/Unit"
                            min={0}
                            value={item.unitCost}
                            onChange={e => handleItemChange(idx, 'unitCost', Number(e.target.value))}
                            className="w-full px-2 py-1.5 border border-slate-200 rounded bg-white text-right font-mono"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-rose-600 font-bold px-1.5"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Live WAC Preview Indicator */}
                      <div className="flex justify-between items-center text-[11px] text-slate-500 bg-white px-2 py-1 rounded border border-slate-200 font-mono">
                        <span>Subtotal: <strong>{formatIDR(item.qty * item.unitCost)}</strong></span>
                        <span>
                          Proyeksi WAC Baru: <strong className="text-[#4C6444]">{formatIDR(projectedWac)}</strong> / {selectedIng?.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Nilai Pembelian</span>
                  <span className="text-base font-extrabold text-slate-900 font-mono">{formatIDR(totalPoAmount)}</span>
                </div>

                <button
                  type="submit"
                  className="bg-[#4C6444] hover:bg-[#3d5036] text-white font-bold text-xs px-5 py-2.5 rounded-lg flex items-center space-x-2 shadow-xs"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Simpan PO & Auto Update WAC</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
