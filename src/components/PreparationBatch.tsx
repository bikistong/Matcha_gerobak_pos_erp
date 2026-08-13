import React, { useState } from 'react';
import { 
  Flame, 
  Plus, 
  Trash2, 
  Beaker, 
  Layers, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';
import { 
  PreparationBatch, 
  PreparationDetail, 
  Ingredient, 
  DailyOperation, 
  StockMovement 
} from '../types';
import { formatRupiah } from '../utils/calculations';

interface PreparationBatchProps {
  preparationBatches: PreparationBatch[];
  preparationDetails: PreparationDetail[];
  ingredients: Ingredient[];
  dailyOperations: DailyOperation[];
  onAddPreparation: (
    batch: Omit<PreparationBatch, 'id' | 'createdAt'>,
    details: Omit<PreparationDetail, 'id' | 'prepBatchId'>[],
    stockMovements: Omit<StockMovement, 'id' | 'createdAt'>[]
  ) => void;
}

export const PreparationBatchComponent: React.FC<PreparationBatchProps> = ({
  preparationBatches,
  preparationDetails,
  ingredients,
  dailyOperations,
  onAddPreparation,
}) => {
  const activeShift = dailyOperations.find(op => op.status === 'OPEN') || dailyOperations[0];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetIngredientId, setTargetIngredientId] = useState<string>('ing-5'); // Simple Syrup default
  const [yieldQuantity, setYieldQuantity] = useState<number>(2000);
  const [preparedBy, setPreparedBy] = useState<string>('Siti (Barista)');
  const [notes, setNotes] = useState<string>('Membuat Sirup Gula Cair 2 Liter (Rasio 1kg gula : 1L air)');

  // Selected raw materials consumed
  const [consumedIngredients, setConsumedIngredients] = useState<
    { ingredientId: string; quantity: number }[]
  >([{ ingredientId: 'ing-4', quantity: 1000 }]);

  const handleAddConsumedItem = () => {
    setConsumedIngredients(prev => [...prev, { ingredientId: 'ing-[#]', quantity: 100 }]);
  };

  const handleRemoveConsumedItem = (index: number) => {
    setConsumedIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) {
      alert('Tidak ada shift operasional harian yang aktif.');
      return;
    }

    const targetIng = ingredients.find(i => i.id === targetIngredientId);
    if (!targetIng) {
      alert('Bahan setengah jadi target belum dipilih.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const prepNum = `PRP-${todayStr}-${Math.floor(100 + Math.random() * 900)}`;

    const newBatch: Omit<PreparationBatch, 'id' | 'createdAt'> = {
      prepNumber: prepNum,
      dailyOperationId: activeShift.id,
      targetIngredientId,
      yieldQuantity,
      unit: targetIng.unit,
      preparedBy,
      notes
    };

    const newDetails: Omit<PreparationDetail, 'id' | 'prepBatchId'>[] = consumedIngredients.map(item => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      return {
        ingredientId: item.ingredientId,
        quantityUsed: item.quantity,
        unit: ing ? ing.unit : 'gram'
      };
    });

    // Stock Movement logs:
    // 1. OUT for raw materials consumed
    // 2. IN for produced target ingredient
    const movements: Omit<StockMovement, 'id' | 'createdAt'>[] = [];

    consumedIngredients.forEach(item => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      const prevStock = ing ? ing.currentStock : 0;
      const currentStock = Math.max(0, prevStock - item.quantity);
      movements.push({
        ingredientId: item.ingredientId,
        movementType: 'OUT_CONSUMPTION',
        quantity: -item.quantity,
        unit: ing ? ing.unit : 'gram',
        previousStock: prevStock,
        currentStock,
        referenceId: prepNum,
        notes: `Konsumsi Bahan Baku Prep Batch (${targetIng.name})`
      });
    });

    // Target ingredient produced (+)
    const prevTargetStock = targetIng.currentStock;
    const currentTargetStock = prevTargetStock + yieldQuantity;
    movements.push({
      ingredientId: targetIngredientId,
      movementType: 'IN_PURCHASE',
      quantity: yieldQuantity,
      unit: targetIng.unit,
      previousStock: prevTargetStock,
      currentStock: currentTargetStock,
      referenceId: prepNum,
      notes: `Hasil Produksi Prep Batch Setengah Jadi`
    });

    onAddPreparation(newBatch, newDetails, movements);
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <Flame className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Persiapan Bahan Setengah Jadi / Batch Prep (BP-05)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan produksi batch bahan baku (seperti Sirup Gula Cair / Simple Syrup, Concentrate Matcha). Mengurangi bahan baku dasar dan menambah stok bahan siap pakai.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#4C6444] hover:bg-[#3d5036] text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xs shrink-0 active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Batch Prep Baru</span>
        </button>
      </div>

      {/* BATCH PREPARATION CARDS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {preparationBatches.map(batch => {
          const targetIng = ingredients.find(i => i.id === batch.targetIngredientId);
          const details = preparationDetails.filter(d => d.prepBatchId === batch.id);

          return (
            <div key={batch.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-xs bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md">
                    {batch.prepNumber}
                  </span>
                  <span className="text-xs text-slate-500">{batch.createdAt.split('T')[0]}</span>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Diproses: {batch.preparedBy}
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Hasil Produksi (Target):</span>
                  <h4 className="font-extrabold text-slate-900 text-sm">{targetIng?.name || 'Bahan'}</h4>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-[#4C6444]">+ {batch.yieldQuantity} {batch.unit}</span>
                </div>
              </div>

              {/* Raw ingredients consumed */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600">Bahan Baku Dasar Dikonsumsi:</span>
                <div className="space-y-1">
                  {details.map(d => {
                    const rawIng = ingredients.find(i => i.id === d.ingredientId);
                    return (
                      <div key={d.id} className="flex items-center justify-between text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-200">
                        <span className="font-medium">{rawIng?.name || 'Bahan Dasar'}</span>
                        <span className="font-bold text-red-600">- {d.quantityUsed} {d.unit}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {batch.notes && (
                <p className="text-xs text-slate-500 italic bg-slate-50/50 p-2 rounded border border-slate-100">
                  "{batch.notes}"
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Catat Batch Persiapan (BP-05)</h3>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Target Ingredient Created */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Pilih Bahan Setengah Jadi yang Dihasilkan:</label>
              <select
                value={targetIngredientId}
                onChange={(e) => setTargetIngredientId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#4C6444]"
              >
                {ingredients.map(ing => (
                  <option key={ing.id} value={ing.id}>
                    {ing.name} ({ing.code}) - Stok Saat Ini: {ing.currentStock} {ing.unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Yield Quantity */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Jumlah Hasil Produksi (Yield Quantity):</label>
              <input
                type="number"
                min="1"
                required
                value={yieldQuantity}
                onChange={(e) => setYieldQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#4C6444]"
              />
            </div>

            {/* Consumed Ingredients */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Bahan Baku Dasar yang Digunakan:</label>
                <button
                  type="button"
                  onClick={handleAddConsumedItem}
                  className="text-xs text-[#4C6444] hover:underline font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Tambah Bahan</span>
                </button>
              </div>

              <div className="space-y-2">
                {consumedIngredients.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <select
                      value={item.ingredientId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setConsumedIngredients(prev => {
                          const updated = [...prev];
                          updated[idx].ingredientId = val;
                          return updated;
                        });
                      }}
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    >
                      {ingredients.map(ing => (
                        <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setConsumedIngredients(prev => {
                          const updated = [...prev];
                          updated[idx].quantity = val;
                          return updated;
                        });
                      }}
                      className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-right"
                    />

                    {consumedIngredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveConsumedItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Barista & Notes */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Diproses Oleh:</label>
                <input
                  type="text"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Catatan Batch:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
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
                Simpan & Update Stok
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
