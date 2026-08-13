import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Leaf, 
  Database, 
  BarChart3, 
  Plus, 
  RotateCcw, 
  Sun, 
  ShoppingCart, 
  Layers, 
  Store, 
  Receipt, 
  Lock, 
  TrendingUp, 
  Wifi, 
  WifiOff, 
  Download, 
  Box,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu,
  PanelLeftClose,
  PanelLeft,
  X
} from 'lucide-react';
import { DailyOperation, OpeningCash } from '../types';
import { formatRupiah } from '../utils/calculations';

export type ActiveTabType = 
  | 'pos' 
  | 'closing'
  | 'dashboard'
  | 'expense' 
  | 'preparation' 
  | 'products' 
  | 'opening' 
  | 'purchasing' 
  | 'stock' 
  | 'ingredients' 
  | 'analytics' 
  | 'sql';

export type MainGroupType = 'pos' | 'shift' | 'inventory' | 'finance' | 'master';

interface NavbarProps {
  activeTab: ActiveTabType;
  setActiveTab: (tab: ActiveTabType) => void;
  onOpenAddProduct: () => void;
  onResetDemoData: () => void;
  totalProducts: number;
  activeProducts: number;
  totalIngredients: number;
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  onOpenPwaModal: () => void;
  dailyOperations?: DailyOperation[];
  openingCashes?: OpeningCash[];
  isSidebarExpanded?: boolean;
  setIsSidebarExpanded?: (expanded: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddProduct,
  onResetDemoData,
  totalProducts,
  activeProducts,
  totalIngredients,
  isOnline,
  isInstallable,
  isInstalled,
  onOpenPwaModal,
  dailyOperations = [],
  openingCashes = [],
  isSidebarExpanded: externalIsExpanded,
  setIsSidebarExpanded: externalSetIsExpanded,
}) => {
  // Local sidebar expanded state if not provided externally
  const [internalExpanded, setInternalExpanded] = useState<boolean>(true);
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalExpanded;
  const setIsExpanded = externalSetIsExpanded || setInternalExpanded;

  // Track hover on collapsed group for flyout menus
  const [hoveredGroup, setHoveredGroup] = useState<MainGroupType | null>(null);

  // Mobile sidebar drawer state
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Accordion open states for sidebar groups
  const [openAccordion, setOpenAccordion] = useState<Record<MainGroupType, boolean>>({
    pos: true,
    shift: true,
    inventory: true,
    finance: true,
    master: true,
  });

  // Automatically ensure active tab's group is open
  useEffect(() => {
    if (['opening', 'preparation', 'closing'].includes(activeTab)) {
      setOpenAccordion(prev => ({ ...prev, shift: true }));
    } else if (['ingredients', 'purchasing', 'stock'].includes(activeTab)) {
      setOpenAccordion(prev => ({ ...prev, inventory: true }));
    } else if (['dashboard', 'expense', 'analytics'].includes(activeTab)) {
      setOpenAccordion(prev => ({ ...prev, finance: true }));
    } else if (['products', 'sql'].includes(activeTab)) {
      setOpenAccordion(prev => ({ ...prev, master: true }));
    }
  }, [activeTab]);

  const toggleAccordion = (group: MainGroupType) => {
    setOpenAccordion(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Active shift info
  const activeShift = dailyOperations.find(op => op.status === 'OPEN');
  const activeOpeningCash = openingCashes.find(c => c.dailyOperationId === activeShift?.id);

  // Menu Definition
  const menuGroups = [
    {
      id: 'pos' as MainGroupType,
      title: 'Terminal POS Kasir',
      icon: Store,
      badge: 'Utama',
      items: [
        { id: 'pos' as ActiveTabType, label: 'POS Kasir Transaksi', icon: Store, desc: 'Layar Transaksi Penjualan' }
      ]
    },
    {
      id: 'shift' as MainGroupType,
      title: 'Operasional Shift',
      icon: Clock,
      badge: activeShift ? 'Shift Aktif' : 'Shift Off',
      items: [
        { id: 'opening' as ActiveTabType, label: 'Buka Shift (Daily Opening)', icon: Sun, desc: 'Input Modal Kas Awal' },
        { id: 'preparation' as ActiveTabType, label: 'Pre-Pack 50 Porsi & Handover', icon: Box, desc: 'Serah Terima Stok Bungkusan' },
        { id: 'closing' as ActiveTabType, label: 'Tutup Shift & Rekonsiliasi Kas', icon: Lock, desc: 'Hitung Fisik Uang & Closing' }
      ]
    },
    {
      id: 'inventory' as MainGroupType,
      title: 'Persediaan & Stok',
      icon: Layers,
      items: [
        { id: 'ingredients' as ActiveTabType, label: 'Gudang Bahan Baku', icon: Leaf, desc: 'Stok Mentah & Harga Beli' },
        { id: 'purchasing' as ActiveTabType, label: 'Pembelian & Restock', icon: ShoppingCart, desc: 'Input PO Supplier' },
        { id: 'stock' as ActiveTabType, label: 'Opname Fisik & Card Movements', icon: Layers, desc: 'Penyesuaian Stok & Kartu' }
      ]
    },
    {
      id: 'finance' as MainGroupType,
      title: 'Biaya & Keuangan',
      icon: TrendingUp,
      items: [
        { id: 'dashboard' as ActiveTabType, label: 'Executive Dashboard & P&L', icon: TrendingUp, desc: 'Laporan Laba Rugi Real-time' },
        { id: 'expense' as ActiveTabType, label: 'Biaya Operasional (OPEX)', icon: Receipt, desc: 'Catat Pengeluaran Outlet' },
        { id: 'analytics' as ActiveTabType, label: 'Costing Matrix & Margin HPP', icon: BarChart3, desc: 'Analisis Margin per Cup' }
      ]
    },
    {
      id: 'master' as MainGroupType,
      title: 'Master Data & System',
      icon: Package,
      items: [
        { id: 'products' as ActiveTabType, label: 'Katalog Produk & Resep (BOM)', icon: Package, desc: 'Setting Menu & Formula' },
        { id: 'sql' as ActiveTabType, label: 'SQL Schema Explorer', icon: Database, desc: 'Arsitektur Database Supabase' }
      ]
    }
  ];

  const handleItemClick = (tabId: ActiveTabType) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* TOP HEADER BAR (Fixed Top) */}
      <header className="bg-white text-slate-800 border-b border-slate-200 sticky top-0 z-40 shadow-2xs h-14 flex items-center justify-between px-4">
        {/* Left: Hamburger Toggle + Brand Logo */}
        <div className="flex items-center space-x-3">
          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
            className="hidden md:flex p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            {isExpanded ? <PanelLeftClose className="w-5 h-5 text-[#4C6444]" /> : <PanelLeft className="w-5 h-5 text-[#4C6444]" />}
          </button>

          {/* Mobile Drawer Trigger */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors border border-slate-200"
          >
            <Menu className="w-5 h-5 text-[#4C6444]" />
          </button>

          {/* Logo Brand */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => setActiveTab('pos')}>
            <div className="w-8.5 h-8.5 rounded-xl bg-[#4C6444] flex items-center justify-center text-white font-black text-xs shadow-xs">
              MG
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-tight text-slate-900 text-base">
                  Matcha Gerobak <span className="text-[#4C6444] font-bold">ERP</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-[#4C644415] text-[#4C6444] border border-[#4C644430] px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                  PWA Offline
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Shift Status Bar */}
        <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-xs space-x-3">
          {activeShift ? (
            <div className="flex items-center space-x-2 text-slate-800">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span className="font-bold text-[#4C6444]">SHIFT AKTIF:</span>
              <span className="font-semibold text-slate-900">{activeShift.openedBy || 'Kasir Shift'}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-600">
                Kas Awal: <b className="text-slate-900">{formatRupiah(activeOpeningCash?.totalAmount || 200000)}</b>
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-amber-800 font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Shift Belum Dibuka</span>
              <button 
                onClick={() => setActiveTab('opening')}
                className="bg-[#4C6444] text-white px-2 py-0.5 rounded-md text-[11px] font-bold hover:bg-[#3d5036]"
              >
                Buka Shift
              </button>
            </div>
          )}
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center space-x-2">
          {/* Connection Status Badge */}
          <button
            onClick={onOpenPwaModal}
            title={isOnline ? "Koneksi Online - PWA Ready" : "Koneksi Terputus - Mode Lokal Offline"}
            className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              isOnline 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 font-bold'
            }`}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
            <span className="text-[11px] font-semibold">{isOnline ? 'Online' : 'Offline'}</span>
          </button>

          {/* Reset Demo Button */}
          <button
            onClick={onResetDemoData}
            title="Reset ke Data Demo Baseline"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* DESKTOP COLLAPSIBLE SIDEBAR */}
      <aside 
        className={`hidden md:flex flex-col fixed top-14 left-0 bottom-0 z-30 bg-white border-r border-slate-200 transition-all duration-300 shadow-2xs select-none ${
          isExpanded ? 'w-64' : 'w-16'
        }`}
      >
        {/* Navigation Groups List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2 px-2 scrollbar-none">
          {menuGroups.map(group => {
            const isGroupActive = group.items.some(item => item.id === activeTab);
            const isOpen = openAccordion[group.id];

            return (
              <div 
                key={group.id} 
                className="relative"
                onMouseEnter={() => !isExpanded && setHoveredGroup(group.id)}
                onMouseLeave={() => !isExpanded && setHoveredGroup(null)}
              >
                {/* Single Item / Direct Group Click */}
                {group.items.length === 1 ? (
                  <button
                    onClick={() => handleItemClick(group.items[0].id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                      activeTab === group.items[0].id
                        ? 'bg-[#4C6444] text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100 font-semibold'
                    }`}
                    title={!isExpanded ? group.title : undefined}
                  >
                    <div className="flex items-center space-x-3">
                      <group.icon className={`w-5 h-5 shrink-0 ${activeTab === group.items[0].id ? 'text-white' : 'text-[#4C6444]'}`} />
                      {isExpanded && <span className="text-xs tracking-tight">{group.title}</span>}
                    </div>
                    {isExpanded && group.badge && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        activeTab === group.items[0].id ? 'bg-white/20 text-white' : 'bg-[#4C6444]/10 text-[#4C6444]'
                      }`}>
                        {group.badge}
                      </span>
                    )}
                  </button>
                ) : (
                  /* Accordion Group Header */
                  <div>
                    <button
                      onClick={() => {
                        if (!isExpanded) setIsExpanded(true);
                        toggleAccordion(group.id);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all ${
                        isGroupActive
                          ? 'bg-[#4C6444]/10 text-[#4C6444] font-bold border border-[#4C6444]/20'
                          : 'text-slate-700 hover:bg-slate-100 font-semibold'
                      }`}
                      title={!isExpanded ? group.title : undefined}
                    >
                      <div className="flex items-center space-x-3">
                        <group.icon className={`w-5 h-5 shrink-0 ${isGroupActive ? 'text-[#4C6444]' : 'text-slate-500'}`} />
                        {isExpanded && <span className="text-xs tracking-tight">{group.title}</span>}
                      </div>

                      {isExpanded && (
                        <div className="flex items-center space-x-1">
                          {group.badge && (
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                              {group.badge}
                            </span>
                          )}
                          {isOpen ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Sub-menu Items (Expanded Mode) */}
                    {isExpanded && isOpen && (
                      <div className="ml-4 pl-3 border-l-2 border-slate-200 mt-1 space-y-1 py-1">
                        {group.items.map(item => {
                          const isSubActive = activeTab === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleItemClick(item.id)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
                                isSubActive
                                  ? 'bg-[#4C6444] text-white font-bold shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                              }`}
                            >
                              <item.icon className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-white' : 'text-slate-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Collapsed Mode Flyout Popover Menu on Hover */}
                {!isExpanded && hoveredGroup === group.id && (
                  <div className="absolute left-16 top-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl p-3 w-56 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2 py-1 border-b border-slate-100 mb-1">
                      <p className="font-bold text-xs text-slate-900">{group.title}</p>
                      <p className="text-[10px] text-slate-400">Pilih Sub-Modul</p>
                    </div>

                    {group.items.map(item => {
                      const isSubActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item.id)}
                          className={`w-full text-left p-2 rounded-xl text-xs flex items-center space-x-2.5 transition-colors ${
                            isSubActive
                              ? 'bg-[#4C6444] text-white font-bold'
                              : 'text-slate-700 hover:bg-slate-100 font-medium'
                          }`}
                        >
                          <item.icon className={`w-4 h-4 shrink-0 ${isSubActive ? 'text-white' : 'text-[#4C6444]'}`} />
                          <div>
                            <p className="font-bold leading-tight">{item.label}</p>
                            <p className={`text-[10px] ${isSubActive ? 'text-white/80' : 'text-slate-400'}`}>{item.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer Collapse Toggle */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/80">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors border border-slate-200/80 text-xs font-bold"
          >
            {isExpanded ? (
              <div className="flex items-center space-x-2">
                <ChevronLeft className="w-4 h-4" />
                <span>Lipat Sidebar</span>
              </div>
            ) : (
              <ChevronRight className="w-4 h-4 text-[#4C6444]" />
            )}
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER SIDEBAR (Overlay Slide-over) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex-1 max-w-xs w-full bg-white flex flex-col justify-between shadow-2xl p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-[#4C6444] text-white flex items-center justify-center font-black text-xs">
                    MG
                  </div>
                  <span className="font-extrabold text-slate-900 text-base">Matcha Gerobak</span>
                </div>
                <button onClick={() => setIsMobileOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu Accordions */}
              <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
                {menuGroups.map(group => (
                  <div key={group.id} className="space-y-1">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-2 pt-2">
                      {group.title}
                    </p>
                    {group.items.map(item => {
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(item.id)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center space-x-2.5 transition-colors ${
                            isActive
                              ? 'bg-[#4C6444] text-white shadow-xs'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#4C6444]'}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  onResetDemoData();
                  setIsMobileOpen(false);
                }}
                className="w-full py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Demo Baseline</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
