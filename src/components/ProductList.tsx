import React, { useState } from 'react';
import { Product, ProductPrice, Ingredient, BOM, BOMDetail, ProductCategory, ProductStatus } from '../types';
import { computeProductMetrics, formatIDR, getMarginHealthBadge } from '../utils/calculations';
import { Search, Filter, Edit3, Eye, Trash2, CheckCircle2, AlertTriangle, ChevronRight, Layers, DollarSign, LayoutGrid, List } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  prices: ProductPrice[];
  boms: BOM[];
  bomDetails: BOMDetail[];
  ingredients: Ingredient[];
  onEditProduct: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleProductStatus: (product: Product) => void;
  onOpenAddProduct: () => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  prices,
  boms,
  bomDetails,
  ingredients,
  onEditProduct,
  onViewProduct,
  onDeleteProduct,
  onToggleProductStatus,
  onOpenAddProduct,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Compute metrics for all products
  const productMetricsList = products.map(p => ({
    product: p,
    metrics: computeProductMetrics(p, prices, boms, bomDetails, ingredients),
  }));

  // Filter products based on search, category, and status
  const filteredProductMetrics = productMetricsList.filter(({ product, metrics }) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || product.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate summary stats
  const activeProducts = productMetricsList.filter(pm => pm.product.status === 'ACTIVE');
  const avgMarginPercent = activeProducts.length > 0
    ? activeProducts.reduce((acc, curr) => acc + curr.metrics.grossMarginPercentage, 0) / activeProducts.length
    : 0;

  const avgHpp = activeProducts.length > 0
    ? activeProducts.reduce((acc, curr) => acc + curr.metrics.theoreticalHpp, 0) / activeProducts.length
    : 0;

  const categoriesList: ProductCategory[] = [
    'Pure Matcha',
    'Matcha Latte',
    'Specialty & Cold Foam',
    'Toppings & Add-ons',
    'Non-Matcha Series',
  ];

  return (
    <div className="space-[#ffffff] space-y-6">
      {/* Top Banner & KPI Quick Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Produk SKU</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{products.length} Items</p>
            <p className="text-xs text-slate-500 mt-1">
              <span className="font-semibold text-emerald-600">{activeProducts.length} Active</span> •{' '}
              <span className="font-semibold text-amber-600">{products.length - activeProducts.length} Draft/Inactive</span>
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rata-rata HPP Produk</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{formatIDR(avgHpp)}</p>
            <p className="text-xs text-slate-500 mt-1">Kalkulasi dari BOM aktif & Avg Cost</p>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rata-rata Gross Margin</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">{avgMarginPercent.toFixed(1)}%</p>
            <p className="text-xs text-emerald-700 font-medium mt-1">Sangat Sehat (&gt;50% Target UMKM)</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#4C6444] text-white rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Aturan Bisnis Baseline</p>
              <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded font-mono">BP-01</span>
            </div>
            <p className="text-xs text-emerald-50 mt-1.5 leading-relaxed">
              Enforcement otomatis: Harga & BOM berlaku historis (Effective Date) & Validasi sebelum Aktivasi.
            </p>
          </div>
          <div className="mt-2 text-[11px] text-emerald-200 font-semibold flex items-center">
            <span>BR-PRD-001 s.d BR-PRD-012 Protected</span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:space-x-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari kode SKU, nama produk, resep..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#4C6444] focus:bg-white text-slate-900"
          />
        </div>

        {/* Filters & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-transparent focus:outline-hidden font-medium text-slate-800 cursor-pointer"
            >
              <option value="ALL">Semua Kategori</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-transparent focus:outline-hidden font-medium text-slate-800 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="ACTIVE">ACTIVE (Siap Jual)</option>
              <option value="DRAFT">DRAFT (Dalam Setup)</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 border border-slate-200 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'table' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filteredProductMetrics.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak ada produk ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Coba sesuaikan kata kunci pencarian atau ubah filter status/kategori.
          </p>
          <button
            onClick={onOpenAddProduct}
            className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-4 py-2 rounded-lg inline-flex items-center space-x-1.5"
          >
            <span>Buat Produk Baru</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Produk / SKU</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Harga Jual Aktif</th>
                  <th className="py-3 px-4 text-right">HPP Teoritis (COGS)</th>
                  <th className="py-3 px-4 text-right">Gross Margin</th>
                  <th className="py-3 px-4 text-center">BOM / Resep</th>
                  <th className="py-3 px-4 text-center">Aksi / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-800">
                {filteredProductMetrics.map(({ product, metrics }) => {
                  const healthBadge = getMarginHealthBadge(metrics.grossMarginPercentage);

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product Name & SKU Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-lg bg-[#4C644410] text-[#4C6444] font-extrabold text-xs flex items-center justify-center shrink-0 border border-[#4C644430]">
                            {product.code.split('-').pop()}
                          </div>
                          <div>
                            <button
                              onClick={() => onViewProduct(product)}
                              className="font-bold text-slate-900 hover:text-emerald-600 text-left transition-colors flex items-center space-x-1 group"
                            >
                              <span>{product.name}</span>
                              <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-emerald-600 transition-opacity" />
                            </button>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{product.code}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md">
                          {product.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => onToggleProductStatus(product)}
                            title="Klik untuk ubah status (Draft/Active)"
                            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide border flex items-center space-x-1 transition-all ${
                              product.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                : product.status === 'DRAFT'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                                : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                product.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                              }`}
                            />
                            <span>{product.status}</span>
                          </button>

                          {!metrics.isEligibleForSale && product.status === 'DRAFT' && (
                            <span
                              title={`Tidak dapat diaktifkan: ${metrics.validationErrors.join(', ')}`}
                              className="text-amber-500 cursor-help"
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4 text-right">
                        {metrics.activeSellingPrice > 0 ? (
                          <div>
                            <span className="font-bold text-slate-900">{formatIDR(metrics.activeSellingPrice)}</span>
                            {metrics.priceEffectiveDate && (
                              <p className="text-[10px] text-slate-400 font-mono">
                                Berlaku: {metrics.priceEffectiveDate}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-rose-500 font-semibold italic">Belum Ada Harga</span>
                        )}
                      </td>

                      {/* Theoretical HPP */}
                      <td className="py-3.5 px-4 text-right">
                        {metrics.theoreticalHpp > 0 ? (
                          <div>
                            <span className="font-extrabold text-slate-800">{formatIDR(metrics.theoreticalHpp)}</span>
                            <p className="text-[10px] text-slate-400">per {product.unit}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">BOM Belum Lengkap</span>
                        )}
                      </td>

                      {/* Gross Margin */}
                      <td className="py-3.5 px-4 text-right">
                        {metrics.activeSellingPrice > 0 && metrics.theoreticalHpp > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className="font-extrabold text-emerald-700 text-sm">
                              {metrics.grossMarginPercentage.toFixed(1)}%
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              ({formatIDR(metrics.grossMarginNominal)})
                            </span>
                            <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full ${healthBadge.barColor}`}
                                style={{ width: `${Math.min(Math.max(metrics.grossMarginPercentage, 0), 100)}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>

                      {/* BOM Version */}
                      <td className="py-3.5 px-4 text-center">
                        {metrics.bomVersion ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {metrics.bomVersion}
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5">
                              {metrics.bomItemCount} bahan baku
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-rose-500 italic">No Active BOM</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => onViewProduct(product)}
                            title="Lihat Detail & Histori Harga"
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditProduct(product)}
                            title="Edit Produk, Harga & Resep BOM"
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteProduct(product.id)}
                            title="Hapus Produk"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
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
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProductMetrics.map(({ product, metrics }) => {
            const healthBadge = getMarginHealthBadge(metrics.grossMarginPercentage);

            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Row: Code & Status */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {product.code}
                    </span>
                    <button
                      onClick={() => onToggleProductStatus(product)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border transition-colors ${
                        product.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}
                    >
                      {product.status}
                    </button>
                  </div>

                  {/* Title & Category */}
                  <div className="mt-3">
                    <h4
                      onClick={() => onViewProduct(product)}
                      className="text-base font-bold text-slate-900 hover:text-emerald-600 cursor-pointer transition-colors"
                    >
                      {product.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
                    {product.description && (
                      <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Pricing & Cost Matrix Box */}
                  <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Harga Jual Aktif:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {metrics.activeSellingPrice > 0 ? formatIDR(metrics.activeSellingPrice) : 'Rp 0'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">HPP Teoritis (COGS):</span>
                      <span className="font-semibold text-slate-800">
                        {metrics.theoreticalHpp > 0 ? formatIDR(metrics.theoreticalHpp) : 'Rp 0'}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                      <span className="text-slate-600 font-semibold">Gross Margin:</span>
                      <div className="text-right">
                        <span className="font-extrabold text-emerald-700 text-sm">
                          {metrics.grossMarginPercentage.toFixed(1)}%
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          ({formatIDR(metrics.grossMarginNominal)})
                        </span>
                      </div>
                    </div>

                    {/* Progress Health Bar */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full ${healthBadge.barColor}`}
                        style={{ width: `${Math.min(Math.max(metrics.grossMarginPercentage, 0), 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Active BOM Info */}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Versi Resep: <strong className="text-slate-700">{metrics.bomVersion || 'Belum Ada'}</strong>
                    </span>
                    <span>{metrics.bomItemCount} Item Bahan</span>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center space-x-2">
                  <button
                    onClick={() => onEditProduct(product)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit / Setup BOM</span>
                  </button>

                  <button
                    onClick={() => onViewProduct(product)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
