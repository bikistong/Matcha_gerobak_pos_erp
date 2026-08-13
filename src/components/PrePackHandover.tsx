import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  ShieldCheck, 
  Box, 
  ShoppingBag, 
  Store, 
  TrendingUp, 
  Users, 
  AlertCircle,
  Layers,
  Sparkles,
  Flame
} from 'lucide-react';
import { 
  PrePackBatchItem, 
  Product, 
  Ingredient, 
  DailyOperation, 
  StockMovement 
} from '../types';
import { formatRupiah } from '../utils/calculations';

interface PrePackHandoverProps {
  prePackBatches: PrePackBatchItem[];
  products: Product[];
  ingredients: Ingredient[];
  dailyOperations: DailyOperation[];
  onCreatePrePackBatch: (
    batch: Omit<PrePackBatchItem, 'id' | 'createdAt'>,
    stockMovements: Omit<StockMovement, 'id' | 'createdAt'>[]
  ) => void;
  onHandoverBatchToCashier: (batchId: string, dailyOpId: string, cashierName: string) => void;
  onReturnRemainingToWarehouse: (batchId: string, actualRemaining: number) => void;
}

export const PrePackHandover: React.FC<PrePackHandoverProps> = ({
  prePackBatches,
  products,
  ingredients,
  dailyOperations,
  onCreatePrePackBatch,
  onHandoverBatchToCashier,
  onReturnRemainingToWarehouse,
}) => {
  const activeShift = dailyOperations.find(op => op.status === 'OPEN') || dailyOperations[0];

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedBatchForReturn, setSelectedBatchForReturn] = useState<PrePackBatchItem | null>(null);

  // Form states for Create Pre-Pack Batch (Malam Hari - Gudang Pusat)
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || 'prod-1');
  const [portionsCount, setPortionsCount] = useState<number>(50); // Default 50 porsi
  const [preparedBy, setPreparedBy] = useState<string>('Budi (Petugas Stok Gudang Pusat)');
  const [batchNotes, setBatchNotes] = useState<string>('Paket porsian lengkap (Matcha Powder, Milk/Creamer, Cup & Sedotan)');

  // Form states for Return Remaining (Malam Hari - Closing Shift)
  const [returnPhysicalQty, setReturnPhysicalQty] = useState<number>(0);

  // Handover cashier input
  const [cashierNameInput, setCashierNameInput] = useState<string>('Siti (Kasir Shift Pagi)');

  const selectedProduct = products.find(p => p.id === selectedProductId) || products[0];

  // Submit new Pre-Pack Batch
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (portionsCount <= 0) {
      alert('Jumlah porsi harus lebih dari 0.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const batchNum = `BATCH-${todayStr}-${Math.floor(100 + Math.random() * 900)}`;

    const newBatch: Omit<PrePackBatchItem, 'id' | 'createdAt'> = {
      batchNumber: batchNum,
      batchName: `Paket Porsian ${selectedProduct?.name || 'Matcha'} (${portionsCount} Cup)`,
      targetProductId: selectedProductId,
      portionsCount,
      preparedAt: new Date().toISOString(),
      preparedBy,
      soldPortions: 0,
      remainingPortions: portionsCount,
      status: 'READY_IN_WAREHOUSE',
      notes: batchNotes
    };

    // Stock Movement logs: Raw materials deducted from Central Warehouse
    const movements: Omit<StockMovement, 'id' | 'createdAt'>[] = [];
    
    // Default estimate deducted: Matcha Powder ~10g/cup, Milk ~200ml/cup
    const matchaPowderIng = ingredients.find(i => i.category === 'Powder & Tea') || ingredients[0];
    if (matchaPowderIng) {
      const neededQty = portionsCount * 10; // 10g per portion
      movements.push({
        ingredientId: matchaPowderIng.id,
        movementType: 'OUT_STOCK_ISSUE',
        quantity: -neededQty,
        unit: matchaPowderIng.unit,
        previousStock: matchaPowderIng.currentStock || 0,
        currentStock: Math.max(0, (matchaPowderIng.currentStock || 0) - neededQty),
        referenceId: batchNum,
        notes: `Pembungkusan Paket Porsian (${portionsCount} Cup)`
      });
    }

    onCreatePrePackBatch(newBatch, movements);
    setIsCreateModalOpen(false);
    alert(`Berhasil membuat ${newBatch.batchName}! Stok tersimpan di Gudang Pusat & siap diambil kasir saat Buka Shift.`);
  };

  // Handle Handover Batch to Cashier (Pagi Hari)
  const handleHandover = (batch: PrePackBatchItem) => {
    if (!activeShift || activeShift.status !== 'OPEN') {
      alert('Harap buka shift operasional kasir terlebih dahulu di menu Daily Opening!');
      return;
    }

    onHandoverBatchToCashier(batch.id, activeShift.id, cashierNameInput);
    alert(`Paket ${batch.batchName} (${batch.portionsCount} Porsi) telah berhasil diserahterimakan ke ${cashierNameInput} untuk Shift Aktif!`);
  };

  // Handle Return Remaining Submit
  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchForReturn) return;

    onReturnRemainingToWarehouse(selectedBatchForReturn.id, Number(returnPhysicalQty));
    setIsReturnModalOpen(false);
    setSelectedBatchForReturn(null);
    alert(`Sisa ${returnPhysicalQty} porsi berhasil dikembalikan (Return) ke Gudang Pusat dan dimasukkan kembali ke persediaan diputar!`);
  };

  // Summary Metrics
  const warehouseBatchesCount = prePackBatches.filter(b => b.status === 'READY_IN_WAREHOUSE').length;
  const cashierBatchesCount = prePackBatches.filter(b => b.status === 'HANDED_OVER_TO_CASHIER').length;
  const returnedBatchesCount = prePackBatches.filter(b => b.status === 'RETURNED_TO_WAREHOUSE' || b.status === 'COMPLETED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-[#4C6444] text-white rounded-xl shadow-xs">
              <Box className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Pre-Pack & Daily Consignment Handover
            </h2>
            <span className="bg-[#4C6444]/10 text-[#4C6444] text-xs px-2.5 py-0.5 rounded-full font-bold">
              Bungkusan 50 Porsi Siap Jual
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Alur Pembungkusan Malam &rarr; Handover Kasir Pagi &rarr; Penjualan POS Real-time &rarr; Return Sisa Malam ke Gudang Pusat.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#4C6444] hover:bg-[#3d5036] text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center space-x-2 shadow-sm transition-all active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Bungkus Paket 50 Porsi (Malam)</span>
        </button>
      </div>

      {/* 4-Step Interactive Flow Stepper Banner */}
      <div className="bg-[#4C6444]/5 border border-[#4C6444]/20 p-5 rounded-2xl space-y-3">
        <div className="flex items-center space-x-2 text-[#4C6444] font-bold text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Alur Operasional Pengendalian Stok Bungkusan (Anti-Leakage Workflow)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Step 1 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center space-x-2 text-[#4C6444] font-bold">
              <span className="w-5 h-5 rounded-full bg-[#4C6444] text-white flex items-center justify-center text-[10px]">1</span>
              <span>Malam: Pre-Pack Gudang</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Petugas Gudang membungkus matcha & bahan2 lain per <b>50 porsi</b>. Stok mentah berkurang di Gudang Pusat.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center space-x-2 text-emerald-700 font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Pagi: Handover Kasir</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Kasir ambil batch 50 porsi saat Buka Shift. Stok porsian aktif berpindah ke <b>Gerobak Kasir</b>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center space-x-2 text-blue-700 font-bold">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Siang: Penjualan POS</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Setiap kali transaksi POS, stok porsian terpotong 1 per 1 & <b>HPP tercatat otomatis per cup</b>.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
            <div className="flex items-center space-x-2 text-purple-700 font-bold">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">4</span>
              <span>Malam: Return Sisa</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Sisa porsi yang tidak terjual di-return balik ke <b>Gudang Pusat</b> & diputar untuk stok bungkusan esok.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: In Warehouse */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Siap di Gudang Pusat</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{warehouseBatchesCount} Paket</p>
            <p className="text-[11px] text-amber-700 font-medium">Siap diambil kasir saat Buka Shift</p>
          </div>
        </div>

        {/* Card 2: Handed Over to Cashier */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Di Gerobak Kasir (Shift)</p>
            <p className="text-xl font-extrabold text-[#4C6444] mt-0.5">{cashierBatchesCount} Paket</p>
            <p className="text-[11px] text-emerald-700 font-medium">Sedang dijual & memotong POS</p>
          </div>
        </div>

        {/* Card 3: Returned / Recycled */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center space-x-4">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-xl border border-purple-200">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Returned & Diputar Kembali</p>
            <p className="text-xl font-extrabold text-purple-900 mt-0.5">{returnedBatchesCount} Paket</p>
            <p className="text-[11px] text-purple-700 font-medium">Sisa closing aman tanpa selisih</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Active Cashier Batch vs Warehouse Batches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: BATCH AKTIF DI GEROBAK KASIR (Pagi - Siang - Malam) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Store className="w-5 h-5 text-[#4C6444]" />
              <h3 className="font-bold text-slate-900 text-base">Stok Bungkusan di Gerobak Kasir</h3>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-md">
              Shift: {activeShift?.openedBy || 'Siti (Shift Pagi)'}
            </span>
          </div>

          {prePackBatches.filter(b => b.status === 'HANDED_OVER_TO_CASHIER').length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Belum Ada Paket Porsian di Gerobak Kasir</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Kasir dapat mengambil paket 50 porsi dari daftar sebelah kanan saat Buka Shift Pagi.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {prePackBatches
                .filter(b => b.status === 'HANDED_OVER_TO_CASHIER')
                .map(batch => {
                  const targetProd = products.find(p => p.id === batch.targetProductId);
                  const currentRemaining = Math.max(0, batch.portionsCount - batch.soldPortions);

                  return (
                    <div 
                      key={batch.id}
                      className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3 relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              {batch.batchNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{batch.batchName}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Diserahterimakan ke <b>{batch.handedOverTo || 'Kasir'}</b> &bull; {new Date(batch.handedOverAt || batch.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                          </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Aktif Jual</span>
                        </span>
                      </div>

                      {/* Portions Progress Tracker Bar */}
                      <div className="bg-white p-3 rounded-lg border border-emerald-200 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-700">
                            Terjual via POS: <b className="text-blue-700">{batch.soldPortions} Cup</b>
                          </span>
                          <span className="font-bold text-emerald-800">
                            Sisa Fisik: <b className="text-emerald-900 text-sm">{currentRemaining} Cup</b> / {batch.portionsCount}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden flex">
                          <div 
                            className="bg-blue-600 h-full transition-all duration-300" 
                            style={{ width: `${(batch.soldPortions / batch.portionsCount) * 100}%` }}
                            title={`Terjual: ${batch.soldPortions} porsi`}
                          />
                          <div 
                            className="bg-emerald-500 h-full transition-all duration-300" 
                            style={{ width: `${(currentRemaining / batch.portionsCount) * 100}%` }}
                            title={`Sisa: ${currentRemaining} porsi`}
                          />
                        </div>
                      </div>

                      {/* Return Sisa Button (For Closing Shift) */}
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          Catatan: Sisa porsi otomatis di-return saat Closing Shift.
                        </span>
                        <button
                          onClick={() => {
                            setSelectedBatchForReturn(batch);
                            setReturnPhysicalQty(currentRemaining);
                            setIsReturnModalOpen(true);
                          }}
                          className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Return Sisa (Closing Malam)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Right Column: BATCH SIAP DI GUDANG PUSAT (Siap diambil kasir) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Box className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-base">Stok Bungkusan Siap di Gudang Pusat</h3>
            </div>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-md">
              Siap Handover
            </span>
          </div>

          {prePackBatches.filter(b => b.status === 'READY_IN_WAREHOUSE').length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
              <Box className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Tidak Ada Bungkusan di Gudang Pusat</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Petugas stok dapat mengklik tombol <b>"Bungkus Paket 50 Porsi"</b> di atas untuk membungkus stok baru.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {prePackBatches
                .filter(b => b.status === 'READY_IN_WAREHOUSE')
                .map(batch => (
                  <div 
                    key={batch.id}
                    className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                            {batch.batchNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{batch.batchName}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Dibungkus oleh <b>{batch.preparedBy}</b> &bull; {batch.portionsCount} Porsi Lengkap
                        </p>
                      </div>
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md">
                        Di Gudang
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-amber-200/60 italic">
                      "{batch.notes}"
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-600">
                        <span>Penerima:</span>
                        <input
                          type="text"
                          value={cashierNameInput}
                          onChange={(e) => setCashierNameInput(e.target.value)}
                          className="px-2 py-1 border border-slate-300 rounded text-xs w-36 font-semibold"
                          placeholder="Nama Kasir"
                        />
                      </div>

                      <button
                        onClick={() => handleHandover(batch)}
                        className="bg-[#4C6444] hover:bg-[#3d5036] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors shadow-2xs"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Ambil Paket (Buka Shift)</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Log History Table of All Pre-Pack Batches */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-base">Riwayat & Log Handover Pre-Pack Porsian</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Total: {prePackBatches.length} Batch Record</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider font-semibold">
                <th className="p-3">No. Batch</th>
                <th className="p-3">Nama Paket Porsian</th>
                <th className="p-3">Petugas Gudang</th>
                <th className="p-3 text-center">Porsi Awal</th>
                <th className="p-3 text-center">Terjual (POS)</th>
                <th className="p-3 text-center">Sisa Return</th>
                <th className="p-3">Status</th>
                <th className="p-3">Kasir Penerima</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prePackBatches.map(batch => (
                <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-800">{batch.batchNumber}</td>
                  <td className="p-3 font-semibold text-slate-900">{batch.batchName}</td>
                  <td className="p-3 text-slate-600">{batch.preparedBy}</td>
                  <td className="p-3 text-center font-bold text-slate-800">{batch.portionsCount} Cup</td>
                  <td className="p-3 text-center font-bold text-blue-700">{batch.soldPortions} Cup</td>
                  <td className="p-3 text-center font-bold text-purple-700">{batch.remainingPortions} Cup</td>
                  <td className="p-3">
                    {batch.status === 'READY_IN_WAREHOUSE' && (
                      <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        Siap di Gudang
                      </span>
                    )}
                    {batch.status === 'HANDED_OVER_TO_CASHIER' && (
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        Di Gerobak Kasir
                      </span>
                    )}
                    {batch.status === 'RETURNED_TO_WAREHOUSE' && (
                      <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[11px]">
                        Returned to Warehouse
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-slate-600">{batch.handedOverTo || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create Pre-Pack Batch (Malam Hari - Petugas Gudang) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-[#4C6444] text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Bungkus Paket Porsian Baru (Malam)</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-white/80 hover:text-white font-bold text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Produk Target</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-[#4C6444]"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name} ({p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Porsi dalam Bungkusan</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={portionsCount}
                    onChange={(e) => setPortionsCount(Number(e.target.value))}
                    min="1"
                    className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-[#4C6444]"
                  />
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Cup / Porsi</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Petugas Gudang Pusat</label>
                <input
                  type="text"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-[#4C6444]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Pembungkusan</label>
                <textarea
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  rows={2}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-[#4C6444]"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-slate-800">Dampak Otomatis Ke Stok Gudang:</p>
                <p>&bull; Stok bahan mentah (Matcha Powder, Susu) terpotong otomatis sejumlah {portionsCount} porsi.</p>
                <p>&bull; Paket tersimpan di Stok Gudang Pusat & siap diambil kasir besok pagi.</p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4C6444] hover:bg-[#3d5036] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Simpan Paket Bungkusan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Return Remaining Portions (Malam Hari - Closing Shift) */}
      {isReturnModalOpen && selectedBatchForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-purple-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RotateCcw className="w-5 h-5 text-purple-300" />
                <h3 className="font-bold text-base">Return Sisa Porsi ke Gudang Pusat</h3>
              </div>
              <button onClick={() => setIsReturnModalOpen(false)} className="text-white/80 hover:text-white font-bold text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-5 space-y-4">
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1">
                <p className="font-bold">{selectedBatchForReturn.batchName}</p>
                <p>&bull; Porsi Handover Pagi: <b>{selectedBatchForReturn.portionsCount} Cup</b></p>
                <p>&bull; Terjual via POS: <b>{selectedBatchForReturn.soldPortions} Cup</b></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hitung Fisik Sisa Porsi yang Dikembalikan (Return)
                </label>
                <input
                  type="number"
                  value={returnPhysicalQty}
                  onChange={(e) => setReturnPhysicalQty(Number(e.target.value))}
                  min="0"
                  max={selectedBatchForReturn.portionsCount}
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-purple-600"
                  required
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <div className="flex items-center space-x-1 font-bold text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Jaminan Zero Variance (Anti-Kebocoran)</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Sisa {returnPhysicalQty} porsi ini akan langsung dikembalikan ke Gudang Pusat untuk diputar kembali (*re-cycled*) ke bungkusan porsian shift berikutnya.
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-800 hover:bg-purple-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Proses Return ke Gudang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
