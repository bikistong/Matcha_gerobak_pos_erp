import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  QrCode, 
  Wallet, 
  CreditCard, 
  Sparkles,
  Sun,
  X
} from 'lucide-react';
import { 
  Product, 
  ProductPrice, 
  Ingredient, 
  BOM, 
  BOMDetail, 
  DailyOperation, 
  PaymentMethod,
  Sale,
  SaleDetail,
  StockMovement
} from '../types';
import { getActivePriceForDate, formatRupiah, computeBOMCOGS } from '../utils/calculations';

interface CartItem {
  product: Product;
  activePrice: number;
  cogs: number;
  quantity: number;
}

interface PosKasirProps {
  products: Product[];
  prices: ProductPrice[];
  ingredients: Ingredient[];
  boms: BOM[];
  bomDetails: BOMDetail[];
  dailyOperations: DailyOperation[];
  onProcessSale: (
    sale: Omit<Sale, 'id' | 'receiptNumber' | 'createdAt'>,
    saleDetails: Omit<SaleDetail, 'id' | 'saleId'>[],
    stockUpdates: { ingredientId: string; quantityDeducted: number }[],
    movements: Omit<StockMovement, 'id' | 'createdAt'>[]
  ) => void;
  onNavigateToOpening: () => void;
}

export const PosKasir: React.FC<PosKasirProps> = ({
  products,
  prices,
  ingredients,
  boms,
  bomDetails,
  dailyOperations,
  onProcessSale,
  onNavigateToOpening
}) => {
  // Check active open shift
  const todayStr = new Date().toISOString().split('T')[0];
  const activeShift = dailyOperations.find(
    op => op.operationDate === todayStr && op.status === 'OPEN'
  ) || dailyOperations.find(op => op.status === 'OPEN');

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashPaid, setCashPaid] = useState<number>(0);
  const [cashierName, setCashierName] = useState<string>('Budi (Kasir Shift Pagi)');
  const [completedSale, setCompletedSale] = useState<{ sale: Sale; details: SaleDetail[] } | null>(null);

  // Active products with active prices and BOM stock estimation
  const processedProducts = useMemo(() => {
    const activeProds = products.filter(p => p.status === 'ACTIVE' || (p as any).isActive);

    return activeProds.map(prod => {
      const activePrice = getActivePriceForDate(prod.id, prices, todayStr) || prices.find(pr => pr.productId === prod.id)?.sellingPrice || 20000;
      const cogs = computeBOMCOGS(prod.id, boms, bomDetails, ingredients);
      
      // Calculate max portions possible based on current ingredient stocks
      const activeBom = boms.find(b => b.productId === prod.id && b.status === 'ACTIVE');
      let maxPortions = 999;
      if (activeBom) {
        const bDetails = bomDetails.filter(bd => bd.bomId === activeBom.id);
        bDetails.forEach(bd => {
          const ing = ingredients.find(i => i.id === bd.ingredientId);
          if (ing && bd.quantity > 0) {
            const possible = Math.floor(ing.currentStock / bd.quantity);
            if (possible < maxPortions) {
              maxPortions = possible;
            }
          }
        });
      }

      return {
        product: prod,
        activePrice,
        cogs,
        maxPortions: Math.max(0, maxPortions)
      };
    });
  }, [products, prices, ingredients, boms, bomDetails, todayStr]);

  // Categories list
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category)));
    return ['ALL', ...cats];
  }, [products]);

  // Filtered products grid
  const filteredProducts = useMemo(() => {
    return processedProducts.filter(item => {
      const matchCat = selectedCategory === 'ALL' || item.product.category === selectedCategory;
      const matchQuery = item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.product.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [processedProducts, selectedCategory, searchQuery]);

  // Cart totals
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.activePrice * item.quantity), 0);
  }, [cart]);

  const totalAmount = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  const cashChange = useMemo(() => {
    if (paymentMethod !== 'CASH') return 0;
    return Math.max(0, cashPaid - totalAmount);
  }, [cashPaid, totalAmount, paymentMethod]);

  // Handlers
  const handleAddToCart = (productItem: typeof processedProducts[0]) => {
    if (productItem.maxPortions <= 0) {
      alert(`Stok bahan baku untuk "${productItem.product.name}" habis/kurang.`);
      return;
    }

    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.product.id === productItem.product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + 1;
        if (newQty > productItem.maxPortions) {
          alert(`Stok bahan baku hanya mencukupi untuk ${productItem.maxPortions} porsi.`);
          return prev;
        }
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        return [
          ...prev,
          {
            product: productItem.product,
            activePrice: productItem.activePrice,
            cogs: productItem.cogs,
            quantity: 1
          }
        ];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleOpenPayment = () => {
    if (!activeShift) {
      alert('⚠️ Gagal Transaksi: Gerobak belum dibuka! Silakan lakukan Daily Opening (Buka Toko) terlebih dahulu.');
      return;
    }
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong.');
      return;
    }
    setCashPaid(totalAmount);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmCheckout = () => {
    if (!activeShift) return;

    if (paymentMethod === 'CASH' && cashPaid < totalAmount) {
      alert(`Jumlah uang tunai (Rp ${cashPaid.toLocaleString('id-ID')}) kurang dari total tagihan (Rp ${totalAmount.toLocaleString('id-ID')}).`);
      return;
    }

    const timestamp = new Date().toISOString();
    const receiptNum = `POS-${todayStr.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newSale: Omit<Sale, 'id' | 'receiptNumber' | 'createdAt'> = {
      dailyOperationId: activeShift.id,
      subtotal,
      discount,
      tax: 0,
      totalAmount,
      paymentMethod,
      cashPaid: paymentMethod === 'CASH' ? cashPaid : totalAmount,
      cashChange: paymentMethod === 'CASH' ? cashChange : 0,
      status: 'COMPLETED',
      soldBy: cashierName,
      notes: 'Transaksi POS Kasir Gerobak'
    };

    const newSaleDetails: Omit<SaleDetail, 'id' | 'saleId'>[] = cart.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      sellingPrice: item.activePrice,
      subtotal: item.quantity * item.activePrice,
      cogsPerUnit: item.cogs,
      totalCogs: item.quantity * item.cogs
    }));

    // Calculate BOM ingredients consumption
    const stockUpdatesMap: { [ingredientId: string]: number } = {};
    const movements: Omit<StockMovement, 'id' | 'createdAt'>[] = [];

    cart.forEach(cartItem => {
      const activeBom = boms.find(b => b.productId === cartItem.product.id && b.status === 'ACTIVE');
      if (activeBom) {
        const bDetails = bomDetails.filter(bd => bd.bomId === activeBom.id);
        bDetails.forEach(bd => {
          const qtyConsumed = bd.quantity * cartItem.quantity;
          stockUpdatesMap[bd.ingredientId] = (stockUpdatesMap[bd.ingredientId] || 0) + qtyConsumed;

          const ing = ingredients.find(i => i.id === bd.ingredientId);
          const prevStock = ing ? ing.currentStock : 0;
          const currentStock = Math.max(0, prevStock - qtyConsumed);

          movements.push({
            ingredientId: bd.ingredientId,
            movementType: 'OUT_CONSUMPTION',
            quantity: -qtyConsumed,
            unit: bd.unit,
            previousStock: prevStock,
            currentStock: currentStock,
            referenceId: receiptNum,
            notes: `Konsumsi BOM Sale (${cartItem.product.name} x${cartItem.quantity})`
          });
        });
      }
    });

    const stockUpdates = Object.keys(stockUpdatesMap).map(ingId => ({
      ingredientId: ingId,
      quantityDeducted: stockUpdatesMap[ingId]
    }));

    // Dispatch to App parent
    onProcessSale(newSale, newSaleDetails, stockUpdates, movements);

    // Save completed sale state for Receipt Modal
    const dummySaleObj: Sale = {
      ...newSale,
      id: `sale-${Date.now()}`,
      receiptNumber: receiptNum,
      createdAt: timestamp
    };
    const dummyDetailsObj: SaleDetail[] = newSaleDetails.map((d, i) => ({
      ...d,
      id: `sd-${Date.now()}-${i}`,
      saleId: dummySaleObj.id
    }));

    setCompletedSale({ sale: dummySaleObj, details: dummyDetailsObj });
    setIsPaymentModalOpen(false);
    setCart([]);
    setDiscount(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* SHIFT WARNING / STATUS BANNER */}
      {!activeShift ? (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between shadow-xs text-amber-900 gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-100 rounded-lg text-amber-700">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">⚠️ Status Kasir: Gerobak Belum Dibuka (BR-OPN-001)</h3>
              <p className="text-xs sm:text-sm text-amber-800">
                Sistem tidak dapat memproses transaksi penjualan sebelum Daily Opening (Buka Toko) & Modal Kas Awal dicatat.
              </p>
            </div>
          </div>
          <button
            onClick={onNavigateToOpening}
            className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-xs shrink-0"
          >
            <Sun className="w-4 h-4" />
            <span>Buka Kasir Harian</span>
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 sm:p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Kasir Gerobak Aktif</span>
              <div className="flex items-center space-x-2 text-xs text-emerald-900 font-medium">
                <span>Tanggal: <strong>{activeShift.operationDate}</strong></span>
                <span>•</span>
                <span>Kasir: <strong>{activeShift.openedBy}</strong></span>
              </div>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-emerald-700 font-mono bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full">
              BR-OPN-002: Kasir Siap Melayani
            </span>
          </div>
        </div>
      )}

      {/* MAIN POS INTERFACE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: MENU CATALOG (7 cols lg) */}
        <div className="lg:col-span-7 xl:col-span-8 space-x-0 space-y-4">
          
          {/* SEARCH & CATEGORY FILTERS */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari menu matcha atau kode SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4C6444] text-slate-800"
              />
            </div>

            {/* Categories scrollable pill tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#4C6444] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'ALL' ? 'Semua Menu' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* PRODUCT CARDS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {filteredProducts.map(item => {
              const isOutOfStock = item.maxPortions <= 0;
              const cartQuantity = cart.find(c => c.product.id === item.product.id)?.quantity || 0;

              return (
                <div
                  key={item.product.id}
                  className={`bg-white rounded-xl border transition-all flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md relative ${
                    isOutOfStock 
                      ? 'border-slate-200 opacity-60 bg-slate-50' 
                      : 'border-slate-200 hover:border-[#4C6444]'
                  }`}
                >
                  {cartQuantity > 0 && (
                    <div className="absolute top-2 right-2 bg-[#4C6444] text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-xs z-10">
                      {cartQuantity}
                    </div>
                  )}

                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {item.product.code}
                      </span>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                        isOutOfStock ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {isOutOfStock ? 'Stok Habis' : `Sisa ${item.maxPortions} cup`}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {item.product.description}
                      </p>
                    </div>

                    <div className="pt-1 flex items-baseline justify-between border-t border-slate-100">
                      <span className="text-xs text-slate-400">Harga:</span>
                      <span className="font-extrabold text-[#4C6444] text-sm">
                        {formatRupiah(item.activePrice)}
                      </span>
                    </div>
                  </div>

                  <button
                    disabled={isOutOfStock || !activeShift}
                    onClick={() => handleAddToCart(item)}
                    className={`w-full py-2.5 text-xs font-bold flex items-center justify-center space-x-1 transition-colors ${
                      isOutOfStock || !activeShift
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-[#4C644415] hover:bg-[#4C6444] text-[#4C6444] hover:text-white active:scale-98'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isOutOfStock ? 'Habis' : 'Tambah'}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center space-y-2 text-slate-500">
              <Search className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm">Tidak ada produk yang cocok dengan pencarian.</p>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SHOPPING CART & CHECKOUT PANEL (5 cols lg) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 flex flex-col justify-between min-h-[500px] sticky top-20">
          
          <div className="space-y-4">
            {/* Header Cart */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2 text-slate-900 font-bold">
                <ShoppingCart className="w-5 h-5 text-[#4C6444]" />
                <span>Keranjang Belanja</span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              )}
            </div>

            {/* CART ITEMS LIST */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <ShoppingCart className="w-12 h-12 mx-auto text-slate-200" />
                <p className="text-sm font-medium text-slate-500">Keranjang masih kosong</p>
                <p className="text-xs text-slate-400">Klik menu di samping untuk menambahkan item ke pesanan.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {cart.map(item => (
                  <div 
                    key={item.product.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex-1 pr-2">
                      <h5 className="font-bold text-xs text-slate-900 line-clamp-1">{item.product.name}</h5>
                      <div className="flex items-center space-x-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{formatRupiah(item.activePrice)}</span>
                        <span>x</span>
                        <span className="font-bold text-slate-700">{item.quantity}</span>
                        <span>=</span>
                        <span className="font-bold text-[#4C6444]">{formatRupiah(item.activePrice * item.quantity)}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, -1)}
                        className="w-6 h-6 bg-white border border-slate-300 hover:bg-slate-100 rounded text-slate-700 flex items-center justify-center text-xs font-bold"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, 1)}
                        className="w-6 h-6 bg-[#4C6444] text-white hover:bg-[#3d5036] rounded flex items-center justify-center text-xs font-bold"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="p-1 text-slate-400 hover:text-red-600 ml-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CALCULATIONS & CHECKOUT BUTTON */}
          <div className="pt-4 border-t border-slate-200 space-y-3 mt-4">
            
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900">{formatRupiah(subtotal)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Diskon (Rp):</span>
                <input
                  type="number"
                  min="0"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                  placeholder="0"
                  className="w-24 text-right px-2 py-0.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-[#4C6444]"
                />
              </div>

              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Tagihan:</span>
                <span className="text-base text-[#4C6444]">{formatRupiah(totalAmount)}</span>
              </div>
            </div>

            <button
              disabled={cart.length === 0 || !activeShift}
              onClick={handleOpenPayment}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-sm ${
                cart.length === 0 || !activeShift
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-[#4C6444] hover:bg-[#3d5036] text-white active:scale-98'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Bayar {totalAmount > 0 ? `(${formatRupiah(totalAmount)})` : ''}</span>
            </button>
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Modal Pembayaran POS</h3>
                <p className="text-xs text-slate-500">Pilih metode pembayaran & hitung kembalian cepat</p>
              </div>
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Amount Card */}
            <div className="bg-[#4C644410] border border-[#4C644430] p-4 rounded-xl text-center space-y-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#4C6444]">Total Harus Dibayar</span>
              <div className="text-2xl font-black text-[#4C6444]">{formatRupiah(totalAmount)}</div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Metode Pembayaran:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'CASH', label: 'Uang Tunai (Cash)', icon: Wallet },
                  { id: 'QRIS', label: 'QRIS Statis/Dinamis', icon: QrCode },
                  { id: 'DEBIT', label: 'Kartu Debit', icon: CreditCard },
                  { id: 'TRANSFER', label: 'Bank Transfer', icon: Sparkles }
                ].map(m => {
                  const IconComp = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center space-x-2 transition-all ${
                        isSelected 
                          ? 'border-[#4C6444] bg-[#4C644410] text-[#4C6444] ring-1 ring-[#4C6444]' 
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <IconComp className="w-4 h-4 shrink-0" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CASH PAYMENT CALCULATOR */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Nominal Uang Tunai Ditrim:</label>
                  <input
                    type="number"
                    value={cashPaid || ''}
                    onChange={(e) => setCashPaid(Number(e.target.value))}
                    className="w-full text-lg font-bold px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#4C6444] text-slate-900"
                  />
                </div>

                {/* Fast Preset Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Uang Pas', val: totalAmount },
                    { label: 'Rp 20.000', val: 20000 },
                    { label: 'Rp 50.000', val: 50000 },
                    { label: 'Rp 100.000', val: 100000 }
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCashPaid(p.val)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Change Result Display */}
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                  cashPaid >= totalAmount 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                    : 'bg-red-50 border-red-300 text-red-900'
                }`}>
                  <span>{cashPaid >= totalAmount ? 'Kembalian:' : 'Uang Kurang:'}</span>
                  <span className="text-base font-extrabold">
                    {cashPaid >= totalAmount ? formatRupiah(cashChange) : formatRupiah(totalAmount - cashPaid)}
                  </span>
                </div>
              </div>
            )}

            {/* QRIS PREVIEW */}
            {paymentMethod === 'QRIS' && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-2">
                <QrCode className="w-20 h-20 mx-auto text-slate-800" />
                <p className="text-xs text-slate-600 font-medium">Scan QRIS BCA / Mandiri Matcha Gerobak</p>
                <p className="text-[11px] text-emerald-700 font-mono">Status: Siap Menerima Pembayaran</p>
              </div>
            )}

            {/* Cashier Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-500">Nama Barista / Kasir:</label>
              <input
                type="text"
                value={cashierName}
                onChange={(e) => setCashierName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-800"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-1/2 py-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckout}
                className="w-1/2 py-2.5 bg-[#4C6444] hover:bg-[#3d5036] text-white rounded-xl text-xs font-bold shadow-xs active:scale-98"
              >
                Proses & Potong Stok
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED RECEIPT MODAL */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in duration-200">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Transaksi Berhasil!</h3>
              <p className="text-xs text-slate-500 font-mono">{completedSale.sale.receiptNumber}</p>
            </div>

            {/* Receipt Summary */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700 font-mono">
              <div className="flex justify-between border-b border-slate-200 pb-1 font-bold">
                <span>MATCHA GEROBAK POS</span>
                <span>{completedSale.sale.createdAt.split('T')[0]}</span>
              </div>
              <div className="space-y-1 pt-1">
                {completedSale.details.map((d, idx) => {
                  const pName = products.find(p => p.id === d.productId)?.name || 'Produk';
                  return (
                    <div key={idx} className="flex justify-between">
                      <span>{pName} x{d.quantity}</span>
                      <span>{formatRupiah(d.subtotal)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-slate-200 space-y-1 font-bold">
                <div className="flex justify-between">
                  <span>TOTAL:</span>
                  <span className="text-slate-900">{formatRupiah(completedSale.sale.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-normal">
                  <span>METODE:</span>
                  <span>{completedSale.sale.paymentMethod}</span>
                </div>
                {completedSale.sale.paymentMethod === 'CASH' && (
                  <div className="flex justify-between text-emerald-700">
                    <span>KEMBALIAN:</span>
                    <span>{formatRupiah(completedSale.sale.cashChange)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="w-1/2 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Struk</span>
              </button>
              <button
                onClick={() => setCompletedSale(null)}
                className="w-1/2 py-2 bg-[#4C6444] hover:bg-[#3d5036] text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
