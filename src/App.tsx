/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar, ActiveTabType } from './components/Navbar';
import { ProductList } from './components/ProductList';
import { ProductFormModal } from './components/ProductFormModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { IngredientList } from './components/IngredientList';
import { SqlSchemaViewer } from './components/SqlSchemaViewer';
import { CostingMatrix } from './components/CostingMatrix';
import { PwaModal } from './components/PwaModal';
import { usePwa } from './utils/pwa';
import { WifiOff } from 'lucide-react';

// Phase 2 Components
import { DailyOpening } from './components/DailyOpening';
import { PurchasingList } from './components/PurchasingList';
import { StockManagement } from './components/StockManagement';

// Phase 3 Components
import { PosKasir } from './components/PosKasir';
import { OperatingExpense } from './components/OperatingExpense';
import { PreparationBatchComponent } from './components/PreparationBatch';
import { PrePackHandover } from './components/PrePackHandover';

// Phase 4 Components
import { CashReconciliation } from './components/CashReconciliation';
import { ManagementDashboard } from './components/ManagementDashboard';

import {
  Product,
  ProductPrice,
  Ingredient,
  BOM,
  BOMDetail,
  DailyOperation,
  OpeningCash,
  StockIssue,
  Purchase,
  PurchaseDetail,
  GoodsReceipt,
  GoodsReceiptDetail,
  StockMovement,
  StockOpname,
  Sale,
  SaleDetail,
  Expense,
  PreparationBatch,
  PreparationDetail,
  PrePackBatchItem
} from './types';

import {
  INITIAL_PRODUCTS,
  INITIAL_PRODUCT_PRICES,
  INITIAL_INGREDIENTS,
  INITIAL_BOMS,
  INITIAL_BOM_DETAILS,
  INITIAL_DAILY_OPERATIONS,
  INITIAL_OPENING_CASH,
  INITIAL_STOCK_ISSUES,
  INITIAL_PURCHASES,
  INITIAL_PURCHASE_DETAILS,
  INITIAL_GOODS_RECEIPTS,
  INITIAL_GOODS_RECEIPT_DETAILS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_STOCK_OPNAMES,
  INITIAL_SALES,
  INITIAL_SALE_DETAILS,
  INITIAL_EXPENSES,
  INITIAL_PREPARATION_BATCHES,
  INITIAL_PREPARATION_DETAILS,
  INITIAL_PREPACK_BATCHES
} from './data/seedData';
import { computeProductMetrics } from './utils/calculations';

const STORAGE_KEYS = {
  PRODUCTS: 'matcha_gerobak_products_v3',
  PRICES: 'matcha_gerobak_prices_v3',
  INGREDIENTS: 'matcha_gerobak_ingredients_v3',
  BOMS: 'matcha_gerobak_boms_v3',
  BOM_DETAILS: 'matcha_gerobak_bom_details_v3',
  DAILY_OPS: 'matcha_gerobak_daily_ops_v3',
  OPENING_CASH: 'matcha_gerobak_opening_cash_v3',
  STOCK_ISSUES: 'matcha_gerobak_stock_issues_v3',
  PURCHASES: 'matcha_gerobak_purchases_v3',
  PURCHASE_DETAILS: 'matcha_gerobak_purchase_details_v3',
  GOODS_RECEIPTS: 'matcha_gerobak_goods_receipts_v3',
  GOODS_RECEIPT_DETAILS: 'matcha_gerobak_goods_receipt_details_v3',
  STOCK_MOVEMENTS: 'matcha_gerobak_stock_movements_v3',
  STOCK_OPNAMES: 'matcha_gerobak_stock_opnames_v3',
  SALES: 'matcha_gerobak_sales_v3',
  SALE_DETAILS: 'matcha_gerobak_sale_details_v3',
  EXPENSES: 'matcha_gerobak_expenses_v3',
  PREPARATION_BATCHES: 'matcha_gerobak_prep_batches_v3',
  PREPARATION_DETAILS: 'matcha_gerobak_prep_details_v3',
  PREPACK_BATCHES: 'matcha_gerobak_prepack_batches_v3',
};

export default function App() {
  // Navigation tab (default to POS Kasir for Phase 3)
  const [activeTab, setActiveTab] = useState<ActiveTabType>('pos');

  // PWA State & Installation Hook
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const { isOnline, isInstallable, isInstalled, swRegistered, installPwa } = usePwa();

  // Master Data States with LocalStorage caching
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [prices, setPrices] = useState<ProductPrice[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRICES);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCT_PRICES;
  });

  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
  });

  const [boms, setBoms] = useState<BOM[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOMS);
    return saved ? JSON.parse(saved) : INITIAL_BOMS;
  });

  const [bomDetails, setBomDetails] = useState<BOMDetail[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOM_DETAILS);
    return saved ? JSON.parse(saved) : INITIAL_BOM_DETAILS;
  });

  // PHASE 2 STATES
  const [dailyOperations, setDailyOperations] = useState<DailyOperation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_OPS);
    return saved ? JSON.parse(saved) : INITIAL_DAILY_OPERATIONS;
  });

  const [openingCashes, setOpeningCashes] = useState<OpeningCash[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OPENING_CASH);
    return saved ? JSON.parse(saved) : INITIAL_OPENING_CASH;
  });

  const [stockIssues, setStockIssues] = useState<StockIssue[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOCK_ISSUES);
    return saved ? JSON.parse(saved) : INITIAL_STOCK_ISSUES;
  });

  const [purchases, setPurchases] = useState<Purchase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASES;
  });

  const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetail[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PURCHASE_DETAILS);
    return saved ? JSON.parse(saved) : INITIAL_PURCHASE_DETAILS;
  });

  const [goodsReceipts, setGoodsReceipts] = useState<GoodsReceipt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOODS_RECEIPTS);
    return saved ? JSON.parse(saved) : INITIAL_GOODS_RECEIPTS;
  });

  const [goodsReceiptDetails, setGoodsReceiptDetails] = useState<GoodsReceiptDetail[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GOODS_RECEIPT_DETAILS);
    return saved ? JSON.parse(saved) : INITIAL_GOODS_RECEIPT_DETAILS;
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS);
    return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
  });

  const [stockOpnames, setStockOpnames] = useState<StockOpname[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOCK_OPNAMES);
    return saved ? JSON.parse(saved) : INITIAL_STOCK_OPNAMES;
  });

  // PHASE 3 STATES
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALES);
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });

  const [saleDetails, setSaleDetails] = useState<SaleDetail[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SALE_DETAILS);
    return saved ? JSON.parse(saved) : INITIAL_SALE_DETAILS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [preparationBatches, setPreparationBatches] = useState<PreparationBatch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PREPARATION_BATCHES);
    return saved ? JSON.parse(saved) : INITIAL_PREPARATION_BATCHES;
  });

  const [preparationDetails, setPreparationDetails] = useState<PreparationDetail[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PREPARATION_DETAILS);
    return saved ? JSON.parse(saved) : INITIAL_PREPARATION_DETAILS;
  });

  const [prePackBatches, setPrePackBatches] = useState<PrePackBatchItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PREPACK_BATCHES);
    return saved ? JSON.parse(saved) : INITIAL_PREPACK_BATCHES;
  });

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRICES, JSON.stringify(prices));
  }, [prices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOMS, JSON.stringify(boms));
  }, [boms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOM_DETAILS, JSON.stringify(bomDetails));
  }, [bomDetails]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAILY_OPS, JSON.stringify(dailyOperations));
  }, [dailyOperations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPENING_CASH, JSON.stringify(openingCashes));
  }, [openingCashes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALE_DETAILS, JSON.stringify(saleDetails));
  }, [saleDetails]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PREPARATION_BATCHES, JSON.stringify(preparationBatches));
  }, [preparationBatches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PREPARATION_DETAILS, JSON.stringify(preparationDetails));
  }, [preparationDetails]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_ISSUES, JSON.stringify(stockIssues));
  }, [stockIssues]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
  }, [purchases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PURCHASE_DETAILS, JSON.stringify(purchaseDetails));
  }, [purchaseDetails]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOODS_RECEIPTS, JSON.stringify(goodsReceipts));
  }, [goodsReceipts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GOODS_RECEIPT_DETAILS, JSON.stringify(goodsReceiptDetails));
  }, [goodsReceiptDetails]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCK_OPNAMES, JSON.stringify(stockOpnames));
  }, [stockOpnames]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PREPACK_BATCHES, JSON.stringify(prePackBatches));
  }, [prePackBatches]);

  // RESET TO DEMO DATA
  const handleResetDemoData = () => {
    if (window.confirm('Reset data ke baseline awal Matcha Gerobak (Fase 1, 2 & 3)? Semua perubahan Anda akan dikembalikan.')) {
      setProducts(INITIAL_PRODUCTS);
      setPrices(INITIAL_PRODUCT_PRICES);
      setIngredients(INITIAL_INGREDIENTS);
      setBoms(INITIAL_BOMS);
      setBomDetails(INITIAL_BOM_DETAILS);
      setDailyOperations(INITIAL_DAILY_OPERATIONS);
      setOpeningCashes(INITIAL_OPENING_CASH);
      setStockIssues(INITIAL_STOCK_ISSUES);
      setPurchases(INITIAL_PURCHASES);
      setPurchaseDetails(INITIAL_PURCHASE_DETAILS);
      setGoodsReceipts(INITIAL_GOODS_RECEIPTS);
      setGoodsReceiptDetails(INITIAL_GOODS_RECEIPT_DETAILS);
      setStockMovements(INITIAL_STOCK_MOVEMENTS);
      setStockOpnames(INITIAL_STOCK_OPNAMES);
      setSales(INITIAL_SALES);
      setSaleDetails(INITIAL_SALE_DETAILS);
      setExpenses(INITIAL_EXPENSES);
      setPreparationBatches(INITIAL_PREPARATION_BATCHES);
      setPreparationDetails(INITIAL_PREPARATION_DETAILS);
      setPrePackBatches(INITIAL_PREPACK_BATCHES);
      localStorage.clear();
      alert('Data berhasil di-reset ke data simulasi default!');
    }
  };

  // OPEN MODALS
  const handleOpenAddProduct = () => {
    setProductToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setProductToEdit(prod);
    setIsFormModalOpen(true);
  };

  const handleOpenViewProduct = (prod: Product) => {
    setViewingProduct(prod);
  };

  // SAVE PRODUCT & PRICE & BOM HANDLER
  const handleSaveProductFull = (data: {
    product: Product;
    price: ProductPrice;
    bom: BOM;
    bomDetails: BOMDetail[];
  }) => {
    setProducts(prev => {
      const exists = prev.some(p => p.id === data.product.id);
      if (exists) {
        return prev.map(p => (p.id === data.product.id ? data.product : p));
      }
      return [data.product, ...prev];
    });

    setPrices(prev => [data.price, ...prev]);

    setBoms(prev => {
      const updatedBoms = prev.map(b => {
        if (b.productId === data.product.id && data.bom.status === 'ACTIVE') {
          return { ...b, status: 'ARCHIVED' as const };
        }
        return b;
      });
      return [data.bom, ...updatedBoms];
    });

    setBomDetails(prev => {
      const filtered = prev.filter(bd => bd.bomId !== data.bom.id);
      return [...data.bomDetails, ...filtered];
    });
  };

  // DELETE PRODUCT HANDLER
  const handleDeleteProduct = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (window.confirm(`Hapus produk "${prod?.name || productId}" dari database?`)) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      setPrices(prev => prev.filter(p => p.productId !== productId));
      
      const bomIds = boms.filter(b => b.productId === productId).map(b => b.id);
      setBoms(prev => prev.filter(b => b.productId !== productId));
      setBomDetails(prev => prev.filter(bd => !bomIds.includes(bd.bomId)));
    }
  };

  // TOGGLE STATUS HANDLER (WITH BR-PRD-010 VALIDATION)
  const handleToggleProductStatus = (product: Product) => {
    const metrics = computeProductMetrics(product, prices, boms, bomDetails, ingredients);

    if (product.status === 'DRAFT' || product.status === 'INACTIVE') {
      if (!metrics.isEligibleForSale) {
        alert(
          `Gagal Mengaktifkan Produk "${product.name}" (BR-PRD-010 Violation):\n- ${metrics.validationErrors.join('\n- ')}\n\nSilakan lengkapi harga jual dan resep BOM terlebih dahulu.`
        );
        handleOpenEditProduct(product);
        return;
      }

      setProducts(prev =>
        prev.map(p => (p.id === product.id ? { ...p, status: 'ACTIVE', updatedAt: new Date().toISOString() } : p))
      );
    } else {
      setProducts(prev =>
        prev.map(p => (p.id === product.id ? { ...p, status: 'DRAFT', updatedAt: new Date().toISOString() } : p))
      );
    }
  };

  // INGREDIENT HANDLERS
  const handleAddIngredient = (newIng: Ingredient) => {
    setIngredients(prev => [newIng, ...prev]);
  };

  const handleUpdateIngredient = (updatedIng: Ingredient) => {
    setIngredients(prev => prev.map(i => (i.id === updatedIng.id ? updatedIng : i)));
  };

  const handleDeleteIngredient = (id: string) => {
    const isUsedInBom = bomDetails.some(bd => bd.ingredientId === id);
    if (isUsedInBom) {
      alert('Gagal Menghapus (BR-PRD-011): Bahan baku ini sedang digunakan dalam resep BOM aktif. Hapus dari BOM terlebih dahulu.');
      return;
    }

    if (window.confirm('Hapus bahan baku ini?')) {
      setIngredients(prev => prev.filter(i => i.id !== id));
    }
  };

  // PHASE 2 HANDLERS: DAILY OPERATIONS
  const handleOpenStore = (op: DailyOperation, cash: OpeningCash, issues: StockIssue[]) => {
    setDailyOperations(prev => [op, ...prev.filter(d => d.date !== op.date)]);
    setOpeningCashes(prev => [cash, ...prev]);
    setStockIssues(prev => [...issues, ...prev]);

    // Record Stock Movement for transfers from Warehouse to Gerobak Booth
    const newMovements: StockMovement[] = issues.map(iss => {
      const ing = ingredients.find(i => i.id === iss.ingredientId);
      const currStock = ing?.currentStock || 0;
      const nextStock = Math.max(0, currStock - iss.quantityIssued);

      return {
        id: `mov-${Date.now()}-${Math.random()}`,
        ingredientId: iss.ingredientId,
        movementType: 'OUT_STOCK_ISSUE',
        quantity: -iss.quantityIssued,
        unit: iss.unit,
        previousStock: currStock,
        currentStock: nextStock,
        referenceId: iss.issueNumber,
        notes: `Stock Issue ke Booth Gerobak (${op.date})`,
        createdAt: new Date().toISOString(),
      };
    });

    setStockMovements(prev => [...newMovements, ...prev]);

    // Update ingredient stock
    setIngredients(prev =>
      prev.map(ing => {
        const iss = issues.find(i => i.ingredientId === ing.id);
        if (iss) {
          return {
            ...ing,
            currentStock: Math.max(0, ing.currentStock - iss.quantityIssued),
            updatedAt: new Date().toISOString(),
          };
        }
        return ing;
      })
    );
  };

  const handleCloseStore = (opId: string, notes: string) => {
    setDailyOperations(prev =>
      prev.map(op =>
        op.id === opId
          ? {
              ...op,
              status: 'CLOSED',
              closedAt: new Date().toISOString(),
              closedBy: 'Kasir Shift',
              notes,
            }
          : op
      )
    );
  };

  const handleExecuteDailyClosing = (
    opId: string,
    actualCash: number,
    variance: number,
    closedBy: string,
    closingNotes: string
  ) => {
    setDailyOperations(prev =>
      prev.map(op =>
        op.id === opId
          ? {
              ...op,
              status: 'CLOSED',
              closedAt: new Date().toISOString(),
              closedBy,
              actualCash,
              cashVariance: variance,
              closingNotes,
              notes: closingNotes || op.notes,
            }
          : op
      )
    );
  };

  // PHASE 3 HANDLERS: POS KASIR, EXPENSES, & PREPARATION
  const handleProcessSale = (
    sale: Omit<Sale, 'id' | 'receiptNumber' | 'createdAt'>,
    details: Omit<SaleDetail, 'id' | 'saleId'>[],
    stockUpdates: { ingredientId: string; quantityDeducted: number }[],
    movements: Omit<StockMovement, 'id' | 'createdAt'>[]
  ) => {
    const timestamp = new Date().toISOString();
    const receiptNum = `POS-${timestamp.split('T')[0].replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;
    const saleId = `sale-${Date.now()}`;

    const newSale: Sale = {
      ...sale,
      id: saleId,
      receiptNumber: receiptNum,
      createdAt: timestamp
    };

    const newDetails: SaleDetail[] = details.map((d, i) => ({
      ...d,
      id: `sd-${Date.now()}-${i}`,
      saleId
    }));

    const fullMovements: StockMovement[] = movements.map((m, i) => ({
      ...m,
      id: `mov-pos-${Date.now()}-${i}`,
      createdAt: timestamp
    }));

    setSales(prev => [newSale, ...prev]);
    setSaleDetails(prev => [...newDetails, ...prev]);
    setStockMovements(prev => [...fullMovements, ...prev]);

    // Deduct ingredient stock from BOM consumption
    setIngredients(prev =>
      prev.map(ing => {
        const update = stockUpdates.find(u => u.ingredientId === ing.id);
        if (update) {
          return {
            ...ing,
            currentStock: Math.max(0, ing.currentStock - update.quantityDeducted),
            updatedAt: timestamp
          };
        }
        return ing;
      })
    );

    // Update active pre-pack batches handed over to cashier
    details.forEach(d => {
      setPrePackBatches(prev =>
        prev.map(b => {
          if (b.status === 'HANDED_OVER_TO_CASHIER' && b.targetProductId === d.productId) {
            const newSold = b.soldPortions + d.quantity;
            const newRemaining = Math.max(0, b.portionsCount - newSold);
            return {
              ...b,
              soldPortions: newSold,
              remainingPortions: newRemaining,
            };
          }
          return b;
        })
      );
    });
  };

  // PRE-PACK HANDOVER HANDLERS
  const handleCreatePrePackBatch = (
    batch: Omit<PrePackBatchItem, 'id' | 'createdAt'>,
    movements: Omit<StockMovement, 'id' | 'createdAt'>[]
  ) => {
    const timestamp = new Date().toISOString();
    const batchId = `ppk-${Date.now()}`;

    const newBatch: PrePackBatchItem = {
      ...batch,
      id: batchId,
      createdAt: timestamp
    };

    const fullMovements: StockMovement[] = movements.map((m, i) => ({
      ...m,
      id: `mov-ppk-${Date.now()}-${i}`,
      createdAt: timestamp
    }));

    setPrePackBatches(prev => [newBatch, ...prev]);
    setStockMovements(prev => [...fullMovements, ...prev]);
  };

  const handleHandoverBatchToCashier = (
    batchId: string,
    dailyOpId: string,
    cashierName: string
  ) => {
    const timestamp = new Date().toISOString();
    setPrePackBatches(prev =>
      prev.map(b =>
        b.id === batchId
          ? {
              ...b,
              status: 'HANDED_OVER_TO_CASHIER',
              dailyOperationId: dailyOpId,
              handedOverAt: timestamp,
              handedOverTo: cashierName,
            }
          : b
      )
    );
  };

  const handleReturnRemainingToWarehouse = (
    batchId: string,
    actualRemaining: number
  ) => {
    const timestamp = new Date().toISOString();
    setPrePackBatches(prev =>
      prev.map(b =>
        b.id === batchId
          ? {
              ...b,
              status: 'RETURNED_TO_WAREHOUSE',
              remainingPortions: actualRemaining,
              returnedAt: timestamp,
            }
          : b
      )
    );
  };

  const handleAddExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const timestamp = new Date().toISOString();
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      createdAt: timestamp
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleAddPreparation = (
    batch: Omit<PreparationBatch, 'id' | 'createdAt'>,
    details: Omit<PreparationDetail, 'id' | 'prepBatchId'>[],
    movements: Omit<StockMovement, 'id' | 'createdAt'>[]
  ) => {
    const timestamp = new Date().toISOString();
    const batchId = `prp-${Date.now()}`;

    const newBatch: PreparationBatch = {
      ...batch,
      id: batchId,
      createdAt: timestamp
    };

    const newDetails: PreparationDetail[] = details.map((d, i) => ({
      ...d,
      id: `prpd-${Date.now()}-${i}`,
      prepBatchId: batchId
    }));

    const fullMovements: StockMovement[] = movements.map((m, i) => ({
      ...m,
      id: `mov-prp-${Date.now()}-${i}`,
      createdAt: timestamp
    }));

    setPreparationBatches(prev => [newBatch, ...prev]);
    setPreparationDetails(prev => [...newDetails, ...prev]);
    setStockMovements(prev => [...fullMovements, ...prev]);

    // Update ingredient stock (raw consumed -, target yield +)
    setIngredients(prev =>
      prev.map(ing => {
        if (ing.id === batch.targetIngredientId) {
          return {
            ...ing,
            currentStock: ing.currentStock + batch.yieldQuantity,
            updatedAt: timestamp
          };
        }
        const consumed = details.find(d => d.ingredientId === ing.id);
        if (consumed) {
          return {
            ...ing,
            currentStock: Math.max(0, ing.currentStock - consumed.quantityUsed),
            updatedAt: timestamp
          };
        }
        return ing;
      })
    );
  };

  // PHASE 2 HANDLERS: PURCHASING & WAC AUTOMATIC RECALCULATION (BR-PUR-009)
  const handleAddPurchaseWithWAC = (
    purchase: Purchase,
    details: PurchaseDetail[],
    goodsReceipt: GoodsReceipt,
    receiptDetails: GoodsReceiptDetail[]
  ) => {
    setPurchases(prev => [purchase, ...prev]);
    setPurchaseDetails(prev => [...details, ...prev]);
    setGoodsReceipts(prev => [goodsReceipt, ...prev]);
    setGoodsReceiptDetails(prev => [...receiptDetails, ...prev]);

    // Recalculate WAC for each received item (BR-PUR-009)
    // Formula: New Avg Cost = ((Current Stock * Current Avg Cost) + (Qty Received * Unit Cost)) / (Current Stock + Qty Received)
    const newMovements: StockMovement[] = [];

    setIngredients(prev =>
      prev.map(ing => {
        const recItem = receiptDetails.find(r => r.ingredientId === ing.id);
        const poItem = details.find(d => d.ingredientId === ing.id);

        if (recItem && poItem) {
          const oldStock = ing.currentStock || 0;
          const oldAvgCost = ing.avgCost || 0;
          const newQty = recItem.quantityReceived;
          const unitCost = poItem.unitCost;

          const totalStock = oldStock + newQty;
          const newAvgCost = totalStock > 0 ? ((oldStock * oldAvgCost) + (newQty * unitCost)) / totalStock : oldAvgCost;

          newMovements.push({
            id: `mov-${Date.now()}-${Math.random()}`,
            ingredientId: ing.id,
            movementType: 'IN_PURCHASE',
            quantity: newQty,
            unit: ing.unit,
            previousStock: oldStock,
            currentStock: totalStock,
            referenceId: goodsReceipt.receiptNumber,
            notes: `Penerimaan Barang PO ${purchase.purchaseNumber} & Update Average Cost`,
            createdAt: new Date().toISOString(),
          });

          return {
            ...ing,
            currentStock: totalStock,
            avgCost: Math.round(newAvgCost),
            updatedAt: new Date().toISOString(),
          };
        }
        return ing;
      })
    );

    setStockMovements(prev => [...newMovements, ...prev]);
  };

  const handleTogglePaymentStatus = (purchaseId: string) => {
    setPurchases(prev =>
      prev.map(p =>
        p.id === purchaseId
          ? { ...p, paymentStatus: p.paymentStatus === 'PAID' ? 'PAYABLE' : 'PAID' }
          : p
      )
    );
  };

  // PHASE 2 HANDLERS: STOCK OPNAME & ADJUSTMENT
  const handleApplyStockOpname = (opname: StockOpname) => {
    setStockOpnames(prev => [opname, ...prev]);

    const targetIng = ingredients.find(i => i.id === opname.ingredientId);
    if (targetIng) {
      const oldStock = targetIng.currentStock;
      const newStock = opname.physicalStock;

      // Add movement log
      const mov: StockMovement = {
        id: `mov-${Date.now()}`,
        ingredientId: targetIng.id,
        movementType: opname.adjustmentReason === 'WASTE' ? 'WASTE' : 'ADJUSTMENT_OPNAME',
        quantity: opname.difference,
        unit: targetIng.unit,
        previousStock: oldStock,
        currentStock: newStock,
        referenceId: opname.opnameNumber,
        notes: `Adjustment Stock Opname (${opname.adjustmentReason}): ${opname.notes}`,
        createdAt: new Date().toISOString(),
      };

      setStockMovements(prev => [mov, ...prev]);

      // Update ingredient physical stock
      setIngredients(prev =>
        prev.map(i => (i.id === targetIng.id ? { ...i, currentStock: newStock, updatedAt: new Date().toISOString() } : i))
      );
    }
  };

  const activeProductsCount = products.filter(p => p.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-[#FDFDFB] text-slate-800 font-sans flex flex-col justify-between">
      <div>
        {/* Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddProduct={handleOpenAddProduct}
          onResetDemoData={handleResetDemoData}
          totalProducts={products.length}
          activeProducts={activeProductsCount}
          totalIngredients={ingredients.length}
          isOnline={isOnline}
          isInstallable={isInstallable}
          isInstalled={isInstalled}
          onOpenPwaModal={() => setIsPwaModalOpen(true)}
          dailyOperations={dailyOperations}
          openingCashes={openingCashes}
          isSidebarExpanded={isSidebarExpanded}
          setIsSidebarExpanded={setIsSidebarExpanded}
        />

        {/* Offline Banner Alert for Cashier */}
        {!isOnline && (
          <div className="bg-amber-600 text-white text-xs py-2 px-4 text-center font-semibold flex items-center justify-center space-x-2 shadow-inner">
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>Koneksi Terputus (Mode Offline Kasir) — Seluruh Penjualan, Stok, & Kas Tetap Tersimpan Aman di Perangkat Ini</span>
            <button 
              onClick={() => setIsPwaModalOpen(true)} 
              className="bg-white/20 hover:bg-white/30 text-white px-2.5 py-0.5 rounded text-[11px] font-bold underline transition-colors ml-2"
            >
              Info PWA
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className={`transition-all duration-300 px-4 sm:px-6 lg:px-8 py-6 ${
          isSidebarExpanded ? 'md:ml-64' : 'md:ml-16'
        }`}>
          <div className="max-w-7xl mx-auto">
          {activeTab === 'pos' && (
            <PosKasir
              products={products}
              prices={prices}
              ingredients={ingredients}
              boms={boms}
              bomDetails={bomDetails}
              dailyOperations={dailyOperations}
              onProcessSale={handleProcessSale}
              onNavigateToOpening={() => setActiveTab('opening')}
            />
          )}

          {activeTab === 'closing' && (
            <CashReconciliation
              dailyOperations={dailyOperations}
              openingCashes={openingCashes}
              sales={sales}
              expenses={expenses}
              onExecuteDailyClosing={handleExecuteDailyClosing}
              onNavigateToPOS={() => setActiveTab('pos')}
            />
          )}

          {activeTab === 'dashboard' && (
            <ManagementDashboard
              sales={sales}
              saleDetails={saleDetails}
              expenses={expenses}
              ingredients={ingredients}
              products={products}
              dailyOperations={dailyOperations}
              openingCashes={openingCashes}
            />
          )}

          {activeTab === 'expense' && (
            <OperatingExpense
              expenses={expenses}
              dailyOperations={dailyOperations}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'preparation' && (
            <PrePackHandover
              prePackBatches={prePackBatches}
              products={products}
              ingredients={ingredients}
              dailyOperations={dailyOperations}
              onCreatePrePackBatch={handleCreatePrePackBatch}
              onHandoverBatchToCashier={handleHandoverBatchToCashier}
              onReturnRemainingToWarehouse={handleReturnRemainingToWarehouse}
            />
          )}

          {activeTab === 'products' && (
            <ProductList
              products={products}
              prices={prices}
              boms={boms}
              bomDetails={bomDetails}
              ingredients={ingredients}
              onEditProduct={handleOpenEditProduct}
              onViewProduct={handleOpenViewProduct}
              onDeleteProduct={handleDeleteProduct}
              onToggleProductStatus={handleToggleProductStatus}
              onOpenAddProduct={handleOpenAddProduct}
            />
          )}

          {activeTab === 'opening' && (
            <DailyOpening
              dailyOperations={dailyOperations}
              openingCashes={openingCashes}
              stockIssues={stockIssues}
              ingredients={ingredients}
              onOpenStore={handleOpenStore}
              onCloseStore={handleCloseStore}
            />
          )}

          {activeTab === 'purchasing' && (
            <PurchasingList
              purchases={purchases}
              purchaseDetails={purchaseDetails}
              goodsReceipts={goodsReceipts}
              ingredients={ingredients}
              onAddPurchaseWithWAC={handleAddPurchaseWithWAC}
              onTogglePaymentStatus={handleTogglePaymentStatus}
            />
          )}

          {activeTab === 'stock' && (
            <StockManagement
              ingredients={ingredients}
              stockMovements={stockMovements}
              stockOpnames={stockOpnames}
              onApplyStockOpname={handleApplyStockOpname}
            />
          )}

          {activeTab === 'ingredients' && (
            <IngredientList
              ingredients={ingredients}
              onAddIngredient={handleAddIngredient}
              onUpdateIngredient={handleUpdateIngredient}
              onDeleteIngredient={handleDeleteIngredient}
            />
          )}

          {activeTab === 'analytics' && (
            <CostingMatrix
              products={products}
              prices={prices}
              boms={boms}
              bomDetails={bomDetails}
              ingredients={ingredients}
            />
          )}

          {activeTab === 'sql' && <SqlSchemaViewer />}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-800">Matcha Gerobak ERP</span> &copy; 2026 — FASE 1, 2 & 3 Integrated (BP-01 s/d BP-08)
          </div>
          <div className="flex items-center space-x-3 text-slate-400 font-mono">
            <span>POS, WAC, BOM Consumption & Atomic RPC Active</span>
            <span>•</span>
            <span>Supabase PostgreSQL 15</span>
          </div>
        </div>
      </footer>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        productToEdit={productToEdit}
        existingPrices={prices}
        existingBoms={boms}
        existingBomDetails={bomDetails}
        ingredients={ingredients}
        onSave={handleSaveProductFull}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={viewingProduct}
        prices={prices}
        boms={boms}
        bomDetails={bomDetails}
        ingredients={ingredients}
        onClose={() => setViewingProduct(null)}
        onEdit={handleOpenEditProduct}
      />

      {/* PWA Info & Installation Modal */}
      <PwaModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
        isOnline={isOnline}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        swRegistered={swRegistered}
        onInstall={installPwa}
      />
    </div>
  );
}

