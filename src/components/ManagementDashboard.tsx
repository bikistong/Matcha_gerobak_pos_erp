import React, { useState, useMemo } from 'react';
import { 
  Sale, 
  SaleDetail, 
  Expense, 
  Ingredient, 
  Product, 
  DailyOperation, 
  OpeningCash 
} from '../types';
import { formatRupiah } from '../utils/calculations';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  Boxes, 
  FileSpreadsheet, 
  DollarSign, 
  Coffee, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Layers, 
  Calendar,
  Building2,
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface ManagementDashboardProps {
  sales: Sale[];
  saleDetails: SaleDetail[];
  expenses: Expense[];
  ingredients: Ingredient[];
  products: Product[];
  dailyOperations: DailyOperation[];
  openingCashes: OpeningCash[];
}

export const ManagementDashboard: React.FC<ManagementDashboardProps> = ({
  sales,
  saleDetails,
  expenses,
  ingredients,
  products,
  dailyOperations,
  openingCashes,
}) => {
  const [periodFilter, setPeriodFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [activeReportTab, setActiveReportTab] = useState<'pnl' | 'inventory' | 'closing_history'>('pnl');

  // Filter sales based on period
  const filteredSales = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return sales.filter(s => {
      if (s.status !== 'COMPLETED') return false;
      const saleDate = s.createdAt.split('T')[0];
      if (periodFilter === 'TODAY') return saleDate === today;
      if (periodFilter === 'WEEK') {
        const diffDays = (new Date(today).getTime() - new Date(saleDate).getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      if (periodFilter === 'MONTH') {
        return saleDate.substring(0, 7) === today.substring(0, 7);
      }
      return true;
    });
  }, [sales, periodFilter]);

  const filteredSaleIds = useMemo(() => new Set(filteredSales.map(s => s.id)), [filteredSales]);

  const filteredDetails = useMemo(() => {
    return saleDetails.filter(sd => filteredSaleIds.has(sd.saleId));
  }, [saleDetails, filteredSaleIds]);

  // Filter expenses based on period
  const filteredExpenses = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return expenses.filter(e => {
      const expDate = e.createdAt.split('T')[0];
      if (periodFilter === 'TODAY') return expDate === today;
      if (periodFilter === 'WEEK') {
        const diffDays = (new Date(today).getTime() - new Date(expDate).getTime()) / (1000 * 3600 * 24);
        return diffDays <= 7;
      }
      if (periodFilter === 'MONTH') {
        return expDate.substring(0, 7) === today.substring(0, 7);
      }
      return true;
    });
  }, [expenses, periodFilter]);

  // Key Financial Metrics (BP-11)
  const financialMetrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalCupsSold = filteredDetails.reduce((sum, sd) => sum + sd.quantity, 0);
    const totalCOGS = filteredDetails.reduce((sum, sd) => sum + sd.totalCogs, 0);
    const grossProfit = totalRevenue - totalCOGS;
    const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const totalOperatingExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netOperatingProfit = grossProfit - totalOperatingExpenses;
    const netMarginPct = totalRevenue > 0 ? (netOperatingProfit / totalRevenue) * 100 : 0;

    return {
      totalRevenue,
      totalCupsSold,
      totalCOGS,
      grossProfit,
      grossMarginPct,
      totalOperatingExpenses,
      netOperatingProfit,
      netMarginPct
    };
  }, [filteredSales, filteredDetails, filteredExpenses]);

  // Inventory Valuation (BP-12)
  const inventoryValuation = useMemo(() => {
    let totalValue = 0;
    const items = ingredients.map(ing => {
      const stock = ing.currentStock || 0;
      const valuation = stock * ing.avgCost;
      totalValue += valuation;
      return {
        ...ing,
        currentStock: stock,
        valuation
      };
    });

    items.sort((a, b) => b.valuation - a.valuation);
    return { items, totalValue };
  }, [ingredients]);

  // Daily Trend Data for Chart
  const dailyTrendData = useMemo(() => {
    const mapByDate: { [date: string]: { date: string; revenue: number; cogs: number; expenses: number; netProfit: number } } = {};

    dailyOperations.forEach(op => {
      mapByDate[op.date] = { date: op.date, revenue: 0, cogs: 0, expenses: 0, netProfit: 0 };
    });

    sales.forEach(s => {
      if (s.status === 'COMPLETED') {
        const date = s.createdAt.split('T')[0];
        if (!mapByDate[date]) mapByDate[date] = { date, revenue: 0, cogs: 0, expenses: 0, netProfit: 0 };
        mapByDate[date].revenue += s.totalAmount;
      }
    });

    saleDetails.forEach(sd => {
      const sale = sales.find(s => s.id === sd.saleId);
      if (sale && sale.status === 'COMPLETED') {
        const date = sale.createdAt.split('T')[0];
        if (mapByDate[date]) {
          mapByDate[date].cogs += sd.totalCogs;
        }
      }
    });

    expenses.forEach(e => {
      const date = e.createdAt.split('T')[0];
      if (!mapByDate[date]) mapByDate[date] = { date, revenue: 0, cogs: 0, expenses: 0, netProfit: 0 };
      mapByDate[date].expenses += e.amount;
    });

    return Object.values(mapByDate)
      .map(item => ({
        ...item,
        netProfit: (item.revenue - item.cogs) - item.expenses
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [dailyOperations, sales, saleDetails, expenses]);

  // Product Sales Mix for Pie Chart
  const categoryMixData = useMemo(() => {
    const catMap: { [cat: string]: number } = {};

    filteredDetails.forEach(sd => {
      const prod = products.find(p => p.id === sd.productId);
      const catName = prod ? prod.category : 'Lainnya';
      catMap[catName] = (catMap[catName] || 0) + sd.subtotal;
    });

    const COLORS = ['#4C6444', '#2DD4BF', '#F59E0B', '#6366F1', '#EC4899'];
    return Object.entries(catMap).map(([name, value], idx) => ({
      name,
      value,
      color: COLORS[idx % COLORS.length]
    }));
  }, [filteredDetails, products]);

  // Expenses Category Breakdown
  const expensesCategoryBreakdown = useMemo(() => {
    const catMap: { [cat: string]: number } = {};
    filteredExpenses.forEach(e => {
      catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    return catMap;
  }, [filteredExpenses]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-[#4C644415] text-[#4C6444] border border-[#4C644430]">
              BP-11 & BP-12
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Management & Executive Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Laporan Keuangan Laba Rugi (P&L), Evaluasi HPP & Margin, Penilaian Aset Persediaan, dan Analisis Tren Bisnis.
          </p>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          <button
            onClick={() => setPeriodFilter('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              periodFilter === 'ALL'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Periode
          </button>
          <button
            onClick={() => setPeriodFilter('TODAY')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              periodFilter === 'TODAY'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setPeriodFilter('WEEK')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              periodFilter === 'WEEK'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setPeriodFilter('MONTH')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              periodFilter === 'MONTH'
                ? 'bg-white text-slate-900 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* KPI Financial Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
        
        {/* Total Revenue */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Omzet</span>
          <span className="font-mono font-bold text-slate-900 text-base sm:text-lg block">
            {formatRupiah(financialMetrics.totalRevenue)}
          </span>
          <div className="flex items-center space-x-1 text-[10px] text-emerald-700 font-semibold">
            <ArrowUpRight className="w-3 h-3" />
            <span>{financialMetrics.totalCupsSold} Cup Terjual</span>
          </div>
        </div>

        {/* Total HPP / COGS */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total HPP / COGS</span>
          <span className="font-mono font-bold text-amber-700 text-base sm:text-lg block">
            {formatRupiah(financialMetrics.totalCOGS)}
          </span>
          <span className="text-[10px] text-slate-400 block">Konsumsi BOM Bahan</span>
        </div>

        {/* Gross Profit */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Gross Profit</span>
          <span className="font-mono font-bold text-emerald-700 text-base sm:text-lg block">
            {formatRupiah(financialMetrics.grossProfit)}
          </span>
          <div className="flex items-center space-x-1 text-[10px] text-emerald-700 font-semibold">
            <Percent className="w-3 h-3" />
            <span>Margin {financialMetrics.grossMarginPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Biaya Operasional</span>
          <span className="font-mono font-bold text-rose-600 text-base sm:text-lg block">
            {formatRupiah(financialMetrics.totalOperatingExpenses)}
          </span>
          <span className="text-[10px] text-slate-400 block">{filteredExpenses.length} transaksi op-ex</span>
        </div>

        {/* Net Operating Profit */}
        <div className="bg-[#4C644410] p-3.5 rounded-xl border-2 border-[#4C6444] shadow-2xs space-y-1">
          <span className="text-[11px] font-extrabold text-[#4C6444] uppercase tracking-wider block">Net Profit</span>
          <span className="font-mono font-extrabold text-[#4C6444] text-base sm:text-lg block">
            {formatRupiah(financialMetrics.netOperatingProfit)}
          </span>
          <span className="text-[10px] font-bold text-[#4C6444] block">
            Net Margin {financialMetrics.netMarginPct.toFixed(1)}%
          </span>
        </div>

        {/* Inventory Asset Valuation */}
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1 col-span-2 sm:col-span-1 lg:col-span-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Nilai Aset Persediaan</span>
          <span className="font-mono font-bold text-indigo-900 text-base sm:text-lg block">
            {formatRupiah(inventoryValuation.totalValue)}
          </span>
          <span className="text-[10px] text-slate-400 block">{ingredients.length} item bahan baku aktif</span>
        </div>

      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Daily Sales & Profit Trend Area Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#4C6444]" />
              <span>Grafik Tren Omzet, HPP, & Laba Bersih Harian</span>
            </h2>
            <span className="text-[11px] text-slate-400">IDR per Hari Operasional</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4C6444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4C6444" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `Rp${(v / 1000).toFixed(0)}k`} />
                <Tooltip 
                  formatter={(value: any) => formatRupiah(Number(value))}
                  labelStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="revenue" name="Total Omzet" stroke="#4C6444" fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="netProfit" name="Laba Bersih" stroke="#10B981" fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Category Mix Pie Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <PieChartIcon className="w-4 h-4 text-teal-600" />
            <span>Product Revenue Mix</span>
          </h2>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatRupiah(Number(val))} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {categoryMixData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">{formatRupiah(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Tabular Reports Navigation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-6">
        
        {/* Report Tabs Bar */}
        <div className="flex space-x-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveReportTab('pnl')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeReportTab === 'pnl'
                ? 'bg-[#4C6444] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>1. Laporan Laba Rugi Operasional (P&L - BP-11)</span>
          </button>

          <button
            onClick={() => setActiveReportTab('inventory')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeReportTab === 'inventory'
                ? 'bg-[#4C6444] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>2. Laporan Penilaian Aset Persediaan (BP-12)</span>
          </button>

          <button
            onClick={() => setActiveReportTab('closing_history')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeReportTab === 'closing_history'
                ? 'bg-[#4C6444] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>3. Audit Daily Closing & Selisih Kas (BP-09/10)</span>
          </button>
        </div>

        {/* TAB 1: P&L Statement Report Table */}
        {activeReportTab === 'pnl' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">
              Laporan Laba Rugi Operasional (Financial Calculation - BP-11)
            </h3>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              
              {/* Gross Revenue */}
              <div className="p-3 bg-slate-50 flex items-center justify-between font-bold text-slate-900 text-sm">
                <span>1. PENJUALAN BERSIH (NET REVENUE)</span>
                <span className="font-mono text-emerald-700">{formatRupiah(financialMetrics.totalRevenue)}</span>
              </div>

              {/* COGS Section */}
              <div className="p-3 flex items-center justify-between text-slate-700 pl-6">
                <span>(-) HPP Konsumsi Bahan Baku (Theoretical BOM COGS)</span>
                <span className="font-mono font-medium text-amber-700">-{formatRupiah(financialMetrics.totalCOGS)}</span>
              </div>

              {/* Gross Profit Bar */}
              <div className="p-3 bg-emerald-50/50 flex items-center justify-between font-bold text-emerald-900">
                <span>2. LABA KOTOR (GROSS PROFIT)</span>
                <div className="flex items-center space-x-3">
                  <span className="text-[11px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-mono">
                    Margin: {financialMetrics.grossMarginPct.toFixed(1)}%
                  </span>
                  <span className="font-mono text-sm">{formatRupiah(financialMetrics.grossProfit)}</span>
                </div>
              </div>

              {/* Operating Expenses Section Header */}
              <div className="p-3 bg-slate-50 flex items-center justify-between font-bold text-slate-900">
                <span>3. BIAYA OPERASIONAL (OPERATING EXPENSES)</span>
                <span className="font-mono text-rose-600">-{formatRupiah(financialMetrics.totalOperatingExpenses)}</span>
              </div>

              {/* Itemized Expenses */}
              {Object.entries(expensesCategoryBreakdown).map(([cat, amt]) => (
                <div key={cat} className="p-2.5 flex items-center justify-between text-slate-600 pl-8">
                  <span>• {cat}</span>
                  <span className="font-mono">{formatRupiah(Number(amt))}</span>
                </div>
              ))}

              {/* Net Operating Profit Final Summary Bar */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between font-extrabold text-sm rounded-b-xl">
                <div>
                  <span>4. LABA BERSIH OPERASIONAL (NET OPERATING PROFIT)</span>
                  <span className="block text-[11px] text-slate-400 font-normal">
                    Laba operasional sebelum pajak dan penyusutan
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs bg-emerald-600 text-white px-2.5 py-0.5 rounded font-mono">
                    Net Margin: {financialMetrics.netMarginPct.toFixed(1)}%
                  </span>
                  <span className="font-mono text-lg text-emerald-400">{formatRupiah(financialMetrics.netOperatingProfit)}</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: Inventory Valuation Table */}
        {activeReportTab === 'inventory' && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                Laporan Penilaian Aset Persediaan Bahan Baku (Inventory Valuation - BP-12)
              </h3>
              <span className="font-mono font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
                Total Asset Value: {formatRupiah(inventoryValuation.totalValue)}
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <th className="p-3">Kode</th>
                    <th className="p-3">Nama Bahan Baku</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-right">Stok Terkini</th>
                    <th className="p-3">Unit</th>
                    <th className="p-3 text-right">WAC Avg Cost (IDR)</th>
                    <th className="p-3 text-right">Total Valuasi (IDR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventoryValuation.items.map(ing => (
                    <tr key={ing.id} className="hover:bg-slate-50/80">
                      <td className="p-3 font-mono text-slate-600">{ing.code}</td>
                      <td className="p-3 font-semibold text-slate-900">{ing.name}</td>
                      <td className="p-3 text-slate-500">{ing.category}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900">
                        {ing.currentStock.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-slate-500 font-mono">{ing.unit}</td>
                      <td className="p-3 text-right font-mono text-slate-600">
                        {formatRupiah(ing.avgCost)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-indigo-900">
                        {formatRupiah(ing.valuation)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: Audit Daily Closing & Cash Variance */}
        {activeReportTab === 'closing_history' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">
              Audit Register Daily Closing & Rekonsiliasi Kasir (BP-09 & BP-10)
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Modal Awal</th>
                    <th className="p-3 text-right">Kas Sales</th>
                    <th className="p-3 text-right">Kas Out</th>
                    <th className="p-3 text-right">Expected Cash</th>
                    <th className="p-3 text-right">Actual Cash</th>
                    <th className="p-3 text-right">Selisih (Variance)</th>
                    <th className="p-3">Petugas Closing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dailyOperations.map(op => {
                    const opc = openingCashes.find(o => o.dailyOperationId === op.id)?.amount || 0;
                    const opSales = sales.filter(s => s.dailyOperationId === op.id && s.paymentMethod === 'CASH' && s.status === 'COMPLETED').reduce((sum, s) => sum + s.totalAmount, 0);
                    const opExp = expenses.filter(e => e.dailyOperationId === op.id).reduce((sum, e) => sum + e.amount, 0);
                    const expCash = opc + opSales - opExp;
                    const actCash = op.actualCash || 0;
                    const variance = op.cashVariance !== undefined ? op.cashVariance : (actCash - expCash);

                    return (
                      <tr key={op.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{op.date}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            op.status === 'CLOSED' ? 'bg-slate-900 text-white' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {op.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-slate-600">{formatRupiah(opc)}</td>
                        <td className="p-3 text-right font-mono text-emerald-700">{formatRupiah(opSales)}</td>
                        <td className="p-3 text-right font-mono text-rose-600">-{formatRupiah(opExp)}</td>
                        <td className="p-3 text-right font-mono font-bold text-slate-900">{formatRupiah(expCash)}</td>
                        <td className="p-3 text-right font-mono font-bold text-indigo-900">{formatRupiah(actCash)}</td>
                        <td className="p-3 text-right font-mono font-bold">
                          <span className={variance === 0 ? 'text-emerald-600' : variance < 0 ? 'text-rose-600' : 'text-amber-600'}>
                            {variance > 0 ? `+${formatRupiah(variance)}` : formatRupiah(variance)}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600">{op.closedBy || op.openedBy || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
