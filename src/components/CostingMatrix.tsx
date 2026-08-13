import React, { useState } from 'react';
import { Product, ProductPrice, Ingredient, BOM, BOMDetail } from '../types';
import { computeProductMetrics, formatIDR, getMarginHealthBadge } from '../utils/calculations';
import { BarChart3, TrendingUp, DollarSign, PieChart, ShieldAlert, Zap } from 'lucide-react';

interface CostingMatrixProps {
  products: Product[];
  prices: ProductPrice[];
  boms: BOM[];
  bomDetails: BOMDetail[];
  ingredients: Ingredient[];
}

export const CostingMatrix: React.FC<CostingMatrixProps> = ({
  products,
  prices,
  boms,
  bomDetails,
  ingredients,
}) => {
  const [matchaCostInflation, setMatchaCostInflation] = useState<number>(0); // Percentage cost increase simulation

  const activeProducts = products.filter(p => p.status === 'ACTIVE');

  // Compute metrics for active products
  const productMetricsList = activeProducts.map(p => {
    // If simulation active, adjust ingredient prices temporarily
    const simulatedIngredients = ingredients.map(ing => {
      if (ing.category === 'Powder & Tea' && matchaCostInflation !== 0) {
        return {
          ...ing,
          avgCost: ing.avgCost * (1 + matchaCostInflation / 100),
        };
      }
      return ing;
    });

    return {
      product: p,
      metrics: computeProductMetrics(p, prices, boms, bomDetails, simulatedIngredients),
    };
  });

  // Sort by Gross Margin Percentage descending
  const sortedByMargin = [...productMetricsList].sort(
    (a, b) => b.metrics.grossMarginPercentage - a.metrics.grossMarginPercentage
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#4C6444]" />
            <span>Matriks Profitabilitas & Simulator Sensitivitas HPP</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluasi margin keuntungan tiap SKU dan simulasi dampak kenaikan harga bahan baku impor Matcha terhadap Gross Margin.
          </p>
        </div>

        {/* Inflation Simulation Controller */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center space-x-3 text-xs">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-slate-700">Simulasi Inflasi Powder Matcha:</span>
          <div className="flex items-center space-x-1.5">
            {[0, 10, 20, 30].map(pct => (
              <button
                key={pct}
                onClick={() => setMatchaCostInflation(pct)}
                className={`px-2.5 py-1 rounded font-bold transition-all ${
                  matchaCostInflation === pct
                    ? 'bg-[#4C6444] text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                +{pct}%
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Ranking Table & Visual Bars */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Peringkat Gross Margin Per SKU Produk ({activeProducts.length} Active Items)</span>
        </h3>

        <div className="space-y-3">
          {sortedByMargin.map(({ product, metrics }) => {
            const healthBadge = getMarginHealthBadge(metrics.grossMarginPercentage);
            const target60SellingPrice = metrics.theoreticalHpp > 0 ? metrics.theoreticalHpp / (1 - 0.6) : 0;

            return (
              <div
                key={product.id}
                className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                      {product.code}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{product.name}</h4>
                    <span className="text-xs text-slate-500">({product.category})</span>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-extrabold">
                    <div>
                      <span className="text-slate-400 font-normal text-[11px] block">Harga Jual</span>
                      <span className="text-slate-900">{formatIDR(metrics.activeSellingPrice)}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-normal text-[11px] block">HPP Teoritis</span>
                      <span className="text-slate-800">{formatIDR(metrics.theoreticalHpp)}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 font-normal text-[11px] block">Margin Nominal</span>
                      <span className="text-emerald-700">{formatIDR(metrics.grossMarginNominal)}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 font-normal text-[11px] block">Gross Margin %</span>
                      <span className="text-emerald-700 text-base font-black">
                        {metrics.grossMarginPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar Visualizer */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] text-slate-500">
                    <span>Target Margin UMKM &gt; 50%</span>
                    <span>Revisi Harga Ideal (Target 60% GM): <strong className="text-slate-800">{formatIDR(target60SellingPrice)}</strong></span>
                  </div>

                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                    {/* HPP Share (Slate) */}
                    <div
                      className="bg-slate-400 h-full"
                      style={{
                        width: `${Math.min(
                          metrics.activeSellingPrice > 0 ? (metrics.theoreticalHpp / metrics.activeSellingPrice) * 100 : 0,
                          100
                        )}%`,
                      }}
                      title={`HPP Share: ${((metrics.theoreticalHpp / metrics.activeSellingPrice) * 100).toFixed(1)}%`}
                    />
                    {/* Gross Margin Share (Emerald) */}
                    <div
                      className={`h-full ${healthBadge.barColor}`}
                      style={{ width: `${Math.min(Math.max(metrics.grossMarginPercentage, 0), 100)}%` }}
                      title={`Gross Margin: ${metrics.grossMarginPercentage.toFixed(1)}%`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
