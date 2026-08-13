import React, { useState } from 'react';
import { Ingredient, IngredientUnit } from '../types';
import { formatIDR } from '../utils/calculations';
import { Search, Plus, Edit3, Trash2, Leaf, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface IngredientListProps {
  ingredients: Ingredient[];
  onAddIngredient: (ingredient: Ingredient) => void;
  onUpdateIngredient: (ingredient: Ingredient) => void;
  onDeleteIngredient: (id: string) => void;
}

export const IngredientList: React.FC<IngredientListProps> = ({
  ingredients,
  onAddIngredient,
  onUpdateIngredient,
  onDeleteIngredient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Ingredient['category']>('Powder & Tea');
  const [unit, setUnit] = useState<IngredientUnit>('gram');
  const [avgCost, setAvgCost] = useState<number>(300);
  const [minStock, setMinStock] = useState<number>(1000);
  const [currentStock, setCurrentStock] = useState<number>(5000);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingIngredient(null);
    setCode(`ING-MTC-${Math.floor(10 + Math.random() * 90)}`);
    setName('');
    setCategory('Powder & Tea');
    setUnit('gram');
    setAvgCost(350);
    setMinStock(1000);
    setCurrentStock(5000);
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setCode(ing.code);
    setName(ing.name);
    setCategory(ing.category);
    setUnit(ing.unit);
    setAvgCost(ing.avgCost);
    setMinStock(ing.minStock || 0);
    setCurrentStock(ing.currentStock || 0);
    setIsActive(ing.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Nama bahan baku wajib diisi.');
      return;
    }

    if (avgCost < 0) {
      setFormError('Average Cost harus bernilai >= 0 (BR-PRD-005).');
      return;
    }

    const payload: Ingredient = {
      id: editingIngredient ? editingIngredient.id : `ing-${Date.now()}`,
      code,
      name,
      category,
      unit,
      avgCost: Number(avgCost),
      minStock: Number(minStock),
      currentStock: Number(currentStock),
      isActive,
      createdAt: editingIngredient ? editingIngredient.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (editingIngredient) {
      onUpdateIngredient(payload);
    } else {
      onAddIngredient(payload);
    }

    setIsModalOpen(false);
  };

  const filteredIngredients = ingredients.filter(i => {
    const matchesSearch =
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || i.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
            <Leaf className="w-5 h-5 text-[#4C6444]" />
            <span>Master Bahan Baku (Ingredients)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar bahan dasar untuk penyusunan BOM, lengkap dengan Average Cost per unit (BR-PRD-005 & BR-PRD-008)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-[#4C6444] hover:bg-[#3d5036] text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-2 shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Bahan Baku</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode atau nama bahan baku..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-900"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-500">Kategori:</span>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-800"
          >
            <option value="ALL">Semua Kategori</option>
            <option value="Powder & Tea">Powder & Tea</option>
            <option value="Dairy & Milk">Dairy & Milk</option>
            <option value="Syrup & Sweetener">Syrup & Sweetener</option>
            <option value="Packaging & Cup">Packaging & Cup</option>
            <option value="Ice & Water">Ice & Water</option>
            <option value="Topping">Topping</option>
          </select>
        </div>
      </div>

      {/* Ingredients Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Kode SKU</th>
                <th className="py-3 px-4">Nama Bahan Baku</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">Satuan</th>
                <th className="py-3 px-4 text-right">Average Cost / Unit</th>
                <th className="py-3 px-4 text-center">Stok Fisik / Min</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
              {filteredIngredients.map(ing => {
                const isLowStock = ing.currentStock !== undefined && ing.minStock !== undefined && ing.currentStock <= ing.minStock;

                return (
                  <tr key={ing.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs font-bold text-slate-600">{ing.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{ing.name}</td>
                    <td className="py-3 px-4 text-xs">
                      <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded">
                        {ing.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-xs uppercase font-bold text-slate-500">
                      {ing.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-700">
                      {formatIDR(ing.avgCost)} <span className="text-[10px] text-slate-400 font-normal">/{ing.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-center text-xs">
                      <div className="flex items-center justify-center space-x-1">
                        <span className={`font-bold ${isLowStock ? 'text-rose-600' : 'text-slate-700'}`}>
                          {ing.currentStock}
                        </span>
                        <span className="text-slate-400">/ {ing.minStock} {ing.unit}</span>
                        {isLowStock && (
                          <span title="Stok menipis di bawah minimum threshold!" className="text-rose-500">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                          ing.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border-slate-300'
                        }`}
                      >
                        {ing.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => openEditModal(ing)}
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-md"
                          title="Edit Bahan"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteIngredient(ing.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md"
                          title="Hapus Bahan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD/EDIT INGREDIENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-slate-900 text-white p-4 px-6 flex justify-between items-center">
              <h3 className="font-bold text-sm">
                {editingIngredient ? `Edit Bahan Baku: ${editingIngredient.code}` : 'Tambah Bahan Baku Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 text-rose-800 p-3 text-xs border-b border-rose-200 flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kode Bahan</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-lg font-mono font-bold uppercase text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as Ingredient['category'])}
                    className="w-full px-3 py-2 text-sm border rounded-lg text-slate-800"
                  >
                    <option value="Powder & Tea">Powder & Tea</option>
                    <option value="Dairy & Milk">Dairy & Milk</option>
                    <option value="Syrup & Sweetener">Syrup & Sweetener</option>
                    <option value="Packaging & Cup">Packaging & Cup</option>
                    <option value="Ice & Water">Ice & Water</option>
                    <option value="Topping">Topping</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Bahan Baku</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Contoh: Matcha Powder Ceremonial Uji"
                  className="w-full px-3 py-2 text-sm border rounded-lg text-slate-900 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Satuan</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as IngredientUnit)}
                    className="w-full px-3 py-2 text-sm border rounded-lg font-bold uppercase text-slate-800"
                  >
                    <option value="gram">gram</option>
                    <option value="ml">ml</option>
                    <option value="pcs">pcs</option>
                    <option value="pack">pack</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Average Cost / Unit (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={avgCost}
                    onChange={e => setAvgCost(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border rounded-lg font-extrabold text-slate-900"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">BR-PRD-005: Wajib &gt;= 0</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Stok</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={e => setMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stok Fisik Saat Ini</label>
                  <input
                    type="number"
                    value={currentStock}
                    onChange={e => setCurrentStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-bold text-slate-800">
                  Status Aktif (BR-PRD-008: Hanya bahan aktif yang dapat dipakai di BOM)
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-lg"
                >
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
