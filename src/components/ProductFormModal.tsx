import React, { useState, useEffect } from 'react';
import { Product, ProductPrice, Ingredient, BOM, BOMDetail, ProductCategory, ProductStatus } from '../types';
import { formatIDR, getMarginHealthBadge } from '../utils/calculations';
import { X, Plus, Trash2, Calculator, CheckCircle2, AlertCircle, Sparkles, Layers, DollarSign, Calendar, Save } from 'lucide-react';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit: Product | null;
  existingPrices: ProductPrice[];
  existingBoms: BOM[];
  existingBomDetails: BOMDetail[];
  ingredients: Ingredient[];
  onSave: (data: {
    product: Product;
    price: ProductPrice;
    bom: BOM;
    bomDetails: BOMDetail[];
  }) => void;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  existingPrices,
  existingBoms,
  existingBomDetails,
  ingredients,
  onSave,
}) => {
  if (!isOpen) return null;

  // Active Tab in Form Drawer
  const [activeTab, setActiveTab] = useState<'info' | 'price' | 'bom'>('info');

  // Product Basic Info State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Matcha Latte');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('Cup');
  const [status, setStatus] = useState<ProductStatus>('DRAFT');

  // Selling Price State
  const [sellingPrice, setSellingPrice] = useState<number>(20000);
  const [priceEffectiveDate, setPriceEffectiveDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [priceNotes, setPriceNotes] = useState('');

  // BOM Recipe State
  const [bomVersion, setBomVersion] = useState('v1.0');
  const [bomEffectiveDate, setBomEffectiveDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [bomNotes, setBomNotes] = useState('');

  // BOM Detail Items State
  interface LocalBomItem {
    id: string;
    ingredientId: string;
    quantity: number;
    unit: 'gram' | 'ml' | 'pcs' | 'pack';
    wastePercentage: number;
  }

  const [bomItems, setBomItems] = useState<LocalBomItem[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Initialize form when opening for edit or new create
  useEffect(() => {
    if (productToEdit) {
      setCode(productToEdit.code);
      setName(productToEdit.name);
      setCategory(productToEdit.category);
      setDescription(productToEdit.description || '');
      setUnit(productToEdit.unit || 'Cup');
      setStatus(productToEdit.status);

      // Find price
      const priceObj = existingPrices
        .filter(p => p.productId === productToEdit.id)
        .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))[0];

      if (priceObj) {
        setSellingPrice(priceObj.sellingPrice);
        setPriceEffectiveDate(priceObj.effectiveDate);
        setPriceNotes(priceObj.notes || '');
      }

      // Find active or latest BOM
      const bomObj = existingBoms
        .filter(b => b.productId === productToEdit.id)
        .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))[0];

      if (bomObj) {
        setBomVersion(bomObj.version);
        setBomEffectiveDate(bomObj.effectiveDate);
        setBomNotes(bomObj.notes || '');

        const details = existingBomDetails
          .filter(bd => bd.bomId === bomObj.id)
          .map(bd => ({
            id: bd.id,
            ingredientId: bd.ingredientId,
            quantity: bd.quantity,
            unit: bd.unit,
            wastePercentage: bd.wastePercentage || 0,
          }));

        setBomItems(details);
      } else {
        setBomItems([]);
      }
    } else {
      // New Product Defaults
      const randomCodeSuffix = Math.floor(100 + Math.random() * 900);
      setCode(`PRD-MTC-${randomCodeSuffix}`);
      setName('');
      setCategory('Matcha Latte');
      setDescription('');
      setUnit('Cup');
      setStatus('DRAFT');
      setSellingPrice(22000);
      setPriceEffectiveDate(new Date().toISOString().split('T')[0]);
      setPriceNotes('Harga penetapan standar awal');
      setBomVersion('v1.0');
      setBomEffectiveDate(new Date().toISOString().split('T')[0]);
      setBomNotes('Resep racikan standar Matcha Gerobak');

      // Default sample BOM items for quick testing
      const defaultMatcha = ingredients.find(i => i.code === 'ING-MTC-02') || ingredients[0];
      const defaultMilk = ingredients.find(i => i.code === 'ING-MLK-01') || ingredients[1];
      const defaultSyrup = ingredients.find(i => i.code === 'ING-SYR-02') || ingredients[2];
      const defaultCup = ingredients.find(i => i.code === 'ING-PKG-01') || ingredients[3];

      const initialItems: LocalBomItem[] = [];
      if (defaultMatcha) initialItems.push({ id: 'item-1', ingredientId: defaultMatcha.id, quantity: 12, unit: defaultMatcha.unit, wastePercentage: 2 });
      if (defaultMilk) initialItems.push({ id: 'item-2', ingredientId: defaultMilk.id, quantity: 150, unit: defaultMilk.unit, wastePercentage: 1 });
      if (defaultSyrup) initialItems.push({ id: 'item-3', ingredientId: defaultSyrup.id, quantity: 20, unit: defaultSyrup.unit, wastePercentage: 0 });
      if (defaultCup) initialItems.push({ id: 'item-4', ingredientId: defaultCup.id, quantity: 1, unit: defaultCup.unit, wastePercentage: 0 });

      setBomItems(initialItems);
    }
  }, [productToEdit, isOpen]);

  // LIVE CALCULATION LOGIC
  const liveHppDetails = bomItems.map(item => {
    const ing = ingredients.find(i => i.id === item.ingredientId);
    const unitCost = ing ? ing.avgCost : 0;
    const wasteFactor = 1 + (item.wastePercentage / 100);
    const costContribution = item.quantity * wasteFactor * unitCost;

    return {
      ...item,
      ingredientName: ing ? ing.name : 'Pilih Bahan',
      unitCost,
      costContribution,
    };
  });

  const totalTheoreticalHpp = liveHppDetails.reduce((acc, curr) => acc + curr.costContribution, 0);
  const grossMarginNominal = sellingPrice - totalTheoreticalHpp;
  const grossMarginPercentage = sellingPrice > 0 ? (grossMarginNominal / sellingPrice) * 100 : 0;
  const marginHealth = getMarginHealthBadge(grossMarginPercentage);

  // Active Ingredients List (BR-PRD-008)
  const activeIngredients = ingredients.filter(i => i.isActive);

  // BOM Handlers
  const handleAddBomItem = () => {
    const firstActive = activeIngredients[0];
    if (!firstActive) return;

    setBomItems(prev => [
      ...prev,
      {
        id: `temp-${Date.now()}-${Math.random()}`,
        ingredientId: firstActive.id,
        quantity: 10,
        unit: firstActive.unit,
        wastePercentage: 0,
      },
    ]);
  };

  const handleRemoveBomItem = (id: string) => {
    setBomItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateBomItem = (id: string, field: keyof LocalBomItem, value: any) => {
    setBomItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // If ingredient changes, sync default unit
          if (field === 'ingredientId') {
            const ing = ingredients.find(i => i.id === value);
            if (ing) {
              updated.unit = ing.unit;
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  // FORM SUBMIT HANDLER WITH BR-PRD-010 VALIDATION
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Business Rule Validation
    if (!name.trim()) {
      setValidationError('Nama produk wajib diisi.');
      setActiveTab('info');
      return;
    }

    if (!code.trim()) {
      setValidationError('Kode produk wajib diisi (BR-PRD-001).');
      setActiveTab('info');
      return;
    }

    if (sellingPrice < 0) {
      setValidationError('Harga jual tidak boleh bernilai negatif (BR-PRD-009).');
      setActiveTab('price');
      return;
    }

    // BR-PRD-010 Validation when setting status = ACTIVE
    if (status === 'ACTIVE') {
      if (sellingPrice <= 0) {
        setValidationError(
          'Gagal Mengaktifkan (BR-PRD-010): Produk harus memiliki harga jual aktif yang valid (> Rp 0).'
        );
        setActiveTab('price');
        return;
      }

      if (bomItems.length === 0) {
        setValidationError(
          'Gagal Mengaktifkan (BR-PRD-010): Produk berstatus ACTIVE wajib memiliki resep BOM dengan minimal 1 item bahan baku.'
        );
        setActiveTab('bom');
        return;
      }
    }

    const productId = productToEdit ? productToEdit.id : `prd-${Date.now()}`;
    const priceId = `prc-${Date.now()}`;
    const bomId = `bom-${Date.now()}`;

    const newProduct: Product = {
      id: productId,
      code,
      name,
      category,
      description,
      unit,
      status,
      createdAt: productToEdit ? productToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newPrice: ProductPrice = {
      id: priceId,
      productId,
      sellingPrice,
      effectiveDate: priceEffectiveDate,
      notes: priceNotes,
      createdAt: new Date().toISOString(),
    };

    const newBom: BOM = {
      id: bomId,
      productId,
      version: bomVersion,
      effectiveDate: bomEffectiveDate,
      status: status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
      yieldQuantity: 1,
      notes: bomNotes,
      createdAt: new Date().toISOString(),
    };

    const newBomDetails: BOMDetail[] = bomItems.map((item, index) => ({
      id: `bd-${Date.now()}-${index}`,
      bomId,
      ingredientId: item.ingredientId,
      quantity: Number(item.quantity),
      unit: item.unit,
      wastePercentage: Number(item.wastePercentage || 0),
    }));

    onSave({
      product: newProduct,
      price: newPrice,
      bom: newBom,
      bomDetails: newBomDetails,
    });

    onClose();
  };

  const categoriesList: ProductCategory[] = [
    'Pure Matcha',
    'Matcha Latte',
    'Specialty & Cold Foam',
    'Toppings & Add-ons',
    'Non-Matcha Series',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {productToEdit ? `Edit Produk & BOM: ${productToEdit.name}` : 'Tambah Produk Baru & Setup BOM'}
              </h2>
              <p className="text-xs text-slate-400">
                Setup SKU, Penetapan Harga (Effective Date) & Racikan Resep (Theoretical HPP)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Alert */}
        {validationError && (
          <div className="bg-rose-50 border-b border-rose-200 p-3.5 px-6 flex items-center space-x-3 text-xs text-rose-800">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <div className="flex-1 font-medium">{validationError}</div>
          </div>
        )}

        {/* Modal Body Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left / Main Section: Tabs & Form Inputs (8 cols) */}
          <div className="lg:col-span-8 p-6 flex flex-col justify-between">
            <div>
              {/* Tabs Bar */}
              <div className="flex space-x-2 border-b border-slate-200 pb-3 mb-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-2 ${
                    activeTab === 'info'
                      ? 'bg-[#4C6444] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>1. Informasi Produk</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('price')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-2 ${
                    activeTab === 'price'
                      ? 'bg-[#4C6444] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>2. Selling Price</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('bom')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center space-x-2 ${
                    activeTab === 'bom'
                      ? 'bg-[#4C6444] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  <span>3. Resep (BOM Setup)</span>
                  <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                    {bomItems.length}
                  </span>
                </button>
              </div>

              {/* TAB 1: PRODUCT INFO */}
              {activeTab === 'info' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kode Product / SKU <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        placeholder="Contoh: PRD-MTC-001"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono uppercase text-slate-900 font-bold"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">BR-PRD-001: Harus unik di seluruh sistem</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kategori Menu <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={e => setCategory(e.target.value as ProductCategory)}
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-slate-800"
                      >
                        {categoriesList.map(cat => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Produk / Menu <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Contoh: Signature Uji Matcha Latte 16oz"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Satuan Porsi</label>
                      <input
                        type="text"
                        value={unit}
                        onChange={e => setUnit(e.target.value)}
                        placeholder="Cup / Porsi"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Status Produk <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={status}
                        onChange={e => setStatus(e.target.value as ProductStatus)}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold ${
                          status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <option value="DRAFT">DRAFT (Persiapan Resep & Harga)</option>
                        <option value="ACTIVE">ACTIVE (Siap Dijual di Kasir POS)</option>
                        <option value="INACTIVE">INACTIVE (Nonaktifkan Sementara)</option>
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1">
                        BR-PRD-010: Status ACTIVE membutuhkan minimal 1 Harga Aktif & BOM Aktif terisi.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi / Catatan Menu</label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Tuliskan racikan unik atau highlight produk..."
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: SELLING PRICE SETUP */}
              {activeTab === 'price' && (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-900 leading-relaxed">
                    <p className="font-bold flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span>Aturan Harga & Effective Date (BR-PRD-003 & BR-PRD-009)</span>
                    </p>
                    <p className="mt-1">
                      Harga jual memiliki tanggal berlaku. Sistem akan menggunakan harga terbaru di mana{' '}
                      <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">effective_date &lt;= Tanggal Transaksi</code>.
                      Perubahan harga baru tidak merusak histori transaksi lama.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Harga Jual (Rp) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          Rp
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={sellingPrice}
                          onChange={e => setSellingPrice(Number(e.target.value))}
                          className="w-full pl-9 pr-3 py-2 text-base font-extrabold border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-900"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Format Rupiah: {formatIDR(sellingPrice)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tanggal Berlaku (Effective Date) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="date"
                          value={priceEffectiveDate}
                          onChange={e => setPriceEffectiveDate(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">BR-PRD-003: Tanggal dimulainya harga berlaku</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Penetapan Harga</label>
                    <input
                      type="text"
                      value={priceNotes}
                      onChange={e => setPriceNotes(e.target.value)}
                      placeholder="Misal: Harga promo launch / Penyesuaian HPP bahan baku"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: BOM / RECIPE SETUP */}
              {activeTab === 'bom' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-3 text-xs">
                      <div>
                        <span className="text-slate-500">Versi BOM:</span>
                        <input
                          type="text"
                          value={bomVersion}
                          onChange={e => setBomVersion(e.target.value)}
                          className="ml-1 px-2 py-0.5 font-bold border border-slate-300 rounded text-slate-800 w-20 text-xs font-mono"
                        />
                      </div>
                      <div>
                        <span className="text-slate-500">Effective Date:</span>
                        <input
                          type="date"
                          value={bomEffectiveDate}
                          onChange={e => setBomEffectiveDate(e.target.value)}
                          className="ml-1 px-2 py-0.5 font-semibold border border-slate-300 rounded text-slate-800 text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddBomItem}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-colors shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Bahan Baku</span>
                    </button>
                  </div>

                  {/* BOM Detail Rows */}
                  {bomItems.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                      <p className="text-xs text-slate-500 font-medium">Belum ada bahan baku ditambahkan ke resep ini.</p>
                      <button
                        type="button"
                        onClick={handleAddBomItem}
                        className="mt-2 text-xs font-bold text-emerald-600 hover:underline inline-flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pilih Bahan Baku Pertama</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {bomItems.map((item, idx) => {
                        const ing = ingredients.find(i => i.id === item.ingredientId);
                        const unitCost = ing ? ing.avgCost : 0;
                        const wasteFactor = 1 + ((item.wastePercentage || 0) / 100);
                        const subtotal = item.quantity * wasteFactor * unitCost;

                        return (
                          <div
                            key={item.id}
                            className="bg-slate-50/90 border border-slate-200 rounded-xl p-3 flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs hover:border-emerald-300 transition-colors"
                          >
                            <span className="font-bold text-slate-400 text-[11px] w-5">{idx + 1}.</span>

                            {/* Ingredient Selector */}
                            <div className="flex-1 min-w-[180px]">
                              <select
                                value={item.ingredientId}
                                onChange={e => handleUpdateBomItem(item.id, 'ingredientId', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-semibold text-slate-900 focus:ring-1 focus:ring-emerald-500"
                              >
                                {activeIngredients.map(ingItem => (
                                  <option key={ingItem.id} value={ingItem.id}>
                                    {ingItem.name} ({ingItem.code}) - {formatIDR(ingItem.avgCost)}/{ingItem.unit}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Quantity Input */}
                            <div className="w-24">
                              <input
                                type="number"
                                min="0.001"
                                step="0.5"
                                value={item.quantity}
                                onChange={e => handleUpdateBomItem(item.id, 'quantity', Number(e.target.value))}
                                className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 font-bold text-center text-slate-900"
                                title="Takaran per porsi (BR-PRD-006: harus > 0)"
                              />
                            </div>

                            {/* Unit Label */}
                            <span className="w-12 text-center text-slate-500 font-semibold uppercase font-mono text-[10px]">
                              {item.unit}
                            </span>

                            {/* Waste % Allowance */}
                            <div className="w-20" title="Toleransi Waste % (Contoh: 2%)">
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  value={item.wastePercentage}
                                  onChange={e =>
                                    handleUpdateBomItem(item.id, 'wastePercentage', Number(e.target.value))
                                  }
                                  className="w-full bg-white border border-slate-300 rounded-lg px-1.5 py-1.5 text-center font-medium text-slate-700 pr-5"
                                />
                                <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                                  %
                                </span>
                              </div>
                            </div>

                            {/* Subtotal Cost */}
                            <div className="w-28 text-right font-extrabold text-slate-900">
                              {formatIDR(subtotal)}
                            </div>

                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveBomItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                className="bg-[#4C6444] hover:bg-[#3d5036] text-white font-bold text-sm px-6 py-2.5 rounded-lg flex items-center space-x-2 shadow-xs active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Master Produk & Resep</span>
              </button>
            </div>
          </div>

          {/* Right Section: LIVE CALCULATION SIDE PANEL (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900 text-white p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-emerald-400 border-b border-slate-800 pb-3 mb-4">
                <Calculator className="w-5 h-5" />
                <h3 className="font-extrabold text-sm tracking-wide uppercase">Live Costing & Margin</h3>
              </div>

              {/* Product SKU Header Card */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 mb-5 space-y-1">
                <p className="text-[10px] font-mono font-bold text-emerald-400 uppercase">{code || 'NEW-SKU'}</p>
                <h4 className="font-bold text-sm text-white truncate">{name || 'Nama Produk Belum Diisi'}</h4>
                <p className="text-[11px] text-slate-400">{category}</p>
              </div>

              {/* Financial Metrics Stack */}
              <div className="space-y-3">
                {/* Selling Price */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Harga Jual (Selling Price):</span>
                  <span className="font-extrabold text-white text-base">{formatIDR(sellingPrice)}</span>
                </div>

                {/* Total Theoretical HPP */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block">HPP Teoritis (COGS):</span>
                    <span className="text-[10px] text-slate-500">dari {bomItems.length} bahan baku</span>
                  </div>
                  <span className="font-extrabold text-teal-300 text-base">{formatIDR(totalTheoreticalHpp)}</span>
                </div>

                {/* Gross Margin Nominal */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-xs text-slate-400">Gross Margin Nominal:</span>
                  <span className="font-extrabold text-emerald-400 text-base">
                    {formatIDR(grossMarginNominal)}
                  </span>
                </div>

                {/* Gross Margin Percentage & Health Badge */}
                <div className="bg-gradient-to-br from-emerald-950/80 to-slate-900 border border-emerald-800/60 rounded-xl p-4 text-center space-y-2">
                  <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                    Gross Margin %
                  </span>
                  <span className="text-3xl font-black text-emerald-400 block tracking-tight">
                    {grossMarginPercentage.toFixed(1)}%
                  </span>

                  {/* Health Badge */}
                  <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border ${marginHealth.colorClass}`}>
                    {marginHealth.label}
                  </div>
                </div>
              </div>

              {/* Live Cost Breakdown List */}
              <div className="mt-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Kontribusi Biaya Bahan Baku:
                </p>

                {liveHppDetails.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Belum ada bahan baku.</p>
                ) : (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {liveHppDetails.map((det, i) => {
                      const sharePercent =
                        totalTheoreticalHpp > 0 ? (det.costContribution / totalTheoreticalHpp) * 100 : 0;

                      return (
                        <div
                          key={i}
                          className="bg-slate-800/40 p-2 rounded-lg flex items-center justify-between text-xs"
                        >
                          <div className="truncate max-w-[160px]">
                            <span className="font-medium text-slate-200 block truncate">{det.ingredientName}</span>
                            <span className="text-[10px] text-slate-400">
                              {det.quantity} {det.unit} ({sharePercent.toFixed(0)}%)
                            </span>
                          </div>
                          <span className="font-bold text-slate-300">{formatIDR(det.costContribution)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Rule Reminder */}
            <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Sesuai spesifikasi BP-01 Product Costing & Recipe Versioning.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
