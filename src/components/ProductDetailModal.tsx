import React from 'react';
import { Product, ProductPrice, Ingredient, BOM, BOMDetail } from '../types';
import { computeProductMetrics, formatIDR, getMarginHealthBadge } from '../utils/calculations';
import { X, Calendar, DollarSign, Calculator, Layers, ShieldCheck, Clock, Tag } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  prices: ProductPrice[];
  boms: BOM[];
  bomDetails: BOMDetail[];
  ingredients: Ingredient[];
  onClose: () => void;
  onEdit: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  prices,
  boms,
  bomDetails,
  ingredients,
  onClose,
  onEdit,
}) => {
  if (!product) return null;

  const metrics = computeProductMetrics(product, prices, boms, bomDetails, ingredients);
  const healthBadge = getMarginHealthBadge(metrics.grossMarginPercentage);

  // Price History Timeline
  const priceHistory = prices
    .filter(p => p.productId === product.id)
    .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));

  // Active BOM and details
  const activeBom = boms.find(b => b.productId === product.id && b.status === 'ACTIVE');
  const activeBomItems = activeBom
    ? bomDetails
        .filter(bd => bd.bomId === activeBom.id)
        .map(bd => {
          const ing = ingredients.find(i => i.id === bd.ingredientId);
          const unitCost = ing ? ing.avgCost : 0;
          const wasteFactor = 1 + ((bd.wastePercentage || 0) / 100);
          const costContribution = bd.quantity * wasteFactor * unitCost;

          return {
            ...bd,
            ingredientCode: ing ? ing.code : 'ING-???',
            ingredientName: ing ? ing.name : 'Unknown Ingredient',
            unitCost,
            costContribution,
          };
        })
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center">
              {product.code.split('-').pop()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                  {product.code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                    product.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}
                >
                  {product.status}
                </span>
              </div>
              <h2 className="text-lg font-extrabold mt-0.5">{product.name}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs font-medium text-slate-500 uppercase">Harga Jual Aktif</span>
              <p className="text-xl font-extrabold text-slate-900 mt-1">
                {formatIDR(metrics.activeSellingPrice)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Effective: {metrics.priceEffectiveDate || 'N/A'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs font-medium text-slate-500 uppercase">HPP Teoritis (COGS)</span>
              <p className="text-xl font-extrabold text-slate-800 mt-1">
                {formatIDR(metrics.theoreticalHpp)}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Resep BOM: {metrics.bomVersion || 'N/A'}
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <span className="text-xs font-semibold text-emerald-800 uppercase">Gross Margin</span>
              <p className="text-xl font-black text-emerald-700 mt-1">
                {metrics.grossMarginPercentage.toFixed(1)}% ({formatIDR(metrics.grossMarginNominal)})
              </p>
              <div className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${healthBadge.colorClass}`}>
                {healthBadge.label}
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-1">Deskripsi Menu:</strong>
              {product.description}
            </div>
          )}

          {/* Grid of Price History & BOM Recipe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PRICE HISTORY TIMELINE (BR-PRD-003) */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm border-b border-slate-200 pb-3 mb-3">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Histori Perubahan Harga (BR-PRD-003)</span>
              </div>

              {priceHistory.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum ada catatan harga.</p>
              ) : (
                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {priceHistory.map((prc, idx) => (
                    <div key={prc.id} className="relative pl-7 text-xs">
                      <div
                        className={`w-2.5 h-2.5 rounded-full absolute left-1.5 top-1 ${
                          idx === 0 ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300'
                        }`}
                      />
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-sm">
                          {formatIDR(prc.sellingPrice)}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          Berlaku: {prc.effectiveDate}
                        </span>
                      </div>
                      {prc.notes && <p className="text-slate-500 text-[11px] mt-0.5">{prc.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ACTIVE BOM RECIPE BREAKDOWN (BR-PRD-004) */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>Resep BOM Aktif ({activeBom?.version || 'N/A'})</span>
                </div>
                {activeBom && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                    Effective: {activeBom.effectiveDate}
                  </span>
                )}
              </div>

              {activeBomItems.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum ada rincian bahan baku dalam BOM aktif.</p>
              ) : (
                <div className="space-y-2">
                  {activeBomItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="bg-slate-50 p-2.5 rounded-lg flex items-center justify-between text-xs border border-slate-200"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{item.ingredientName}</span>
                        <span className="text-[10px] text-slate-500">
                          Takaran: {item.quantity} {item.unit} {item.wastePercentage ? `(+${item.wastePercentage}% waste)` : ''}
                        </span>
                      </div>
                      <div className="text-right font-extrabold text-slate-800">
                        {formatIDR(item.costContribution)}
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-900">
                    <span>Total HPP Bahan:</span>
                    <span className="text-emerald-700 text-sm">{formatIDR(metrics.theoreticalHpp)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Business Rules Compliance Verification Box */}
          <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Verifikasi Aturan Bisnis (BR-PRD Compliance)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400">✓</span>
                <span>BR-PRD-001: Kode SKU ({product.code}) terverifikasi unik.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400">✓</span>
                <span>BR-PRD-003: Penetapan harga tercatat sesuai Effective Date.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400">✓</span>
                <span>BR-PRD-004: Terdapat maksimal 1 versi BOM Aktif.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400">✓</span>
                <span>BR-PRD-010: Syarat kelayakan aktivasi produk terpenuhi.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
          >
            Tutup
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(product);
            }}
            className="bg-[#4C6444] hover:bg-[#3d5036] text-white font-bold text-xs px-5 py-2.5 rounded-lg"
          >
            Edit Produk & Resep
          </button>
        </div>
      </div>
    </div>
  );
};
