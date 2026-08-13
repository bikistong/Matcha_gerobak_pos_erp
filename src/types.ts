export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';

export type ProductCategory = 
  | 'Pure Matcha'
  | 'Matcha Latte'
  | 'Specialty & Cold Foam'
  | 'Toppings & Add-ons'
  | 'Non-Matcha Series';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  description?: string;
  unit: string; // e.g., 'Cup', 'Porsi', 'Pcs'
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPrice {
  id: string;
  productId: string;
  sellingPrice: number; // IDR
  effectiveDate: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export type IngredientUnit = 'gram' | 'ml' | 'pcs' | 'pack';

export interface Ingredient {
  id: string;
  code: string;
  name: string;
  category: 'Powder & Tea' | 'Dairy & Milk' | 'Syrup & Sweetener' | 'Packaging & Cup' | 'Ice & Water' | 'Topping';
  unit: IngredientUnit;
  avgCost: number; // IDR per unit (e.g., Rp 450 per gram)
  minStock?: number;
  currentStock?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type BomStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface BOM {
  id: string;
  productId: string;
  version: string; // e.g. 'v1.0'
  effectiveDate: string; // YYYY-MM-DD
  status: BomStatus;
  yieldQuantity: number; // default 1 cup
  notes?: string;
  createdAt: string;
}

export interface BOMDetail {
  id: string;
  bomId: string;
  ingredientId: string;
  quantity: number;
  unit: IngredientUnit;
  wastePercentage?: number; // e.g. 5 for 5%
  notes?: string;
}

export interface ProductFinancialMetrics {
  productId: string;
  productCode: string;
  productName: string;
  category: ProductCategory;
  status: ProductStatus;
  activeSellingPrice: number;
  priceEffectiveDate: string | null;
  theoreticalHpp: number;
  grossMarginNominal: number;
  grossMarginPercentage: number;
  bomVersion: string | null;
  bomItemCount: number;
  isEligibleForSale: boolean;
  validationErrors: string[];
}

export interface BusinessRule {
  id: string;
  code: string; // e.g. BR-PRD-001
  title: string;
  description: string;
  sqlConstraint: string;
  category: 'Data Integrity' | 'Price Management' | 'Recipe / BOM' | 'Financial & Costing' | 'Daily Operations' | 'Purchasing' | 'Stock Management';
}

// ==========================================
// PHASE 2: DAILY OPERATIONS (BP-02)
// ==========================================
export type DailyOperationStatus = 'DRAFT' | 'OPEN' | 'CLOSED';

export interface DailyOperation {
  id: string;
  date: string; // YYYY-MM-DD
  status: DailyOperationStatus;
  openedAt?: string;
  closedAt?: string;
  openedBy?: string;
  closedBy?: string;
  actualCash?: number;
  cashVariance?: number;
  closingNotes?: string;
  notes?: string;
  createdAt: string;
}

export interface OpeningCash {
  id: string;
  dailyOperationId: string;
  amount: number; // Cash float (modal awal/kembalian)
  notes?: string;
  createdAt: string;
}

export interface StockIssue {
  id: string;
  issueNumber: string; // ISS-YYYYMMDD-001
  dailyOperationId: string;
  ingredientId: string;
  quantityIssued: number;
  unit: IngredientUnit;
  issuedAt: string;
  notes?: string;
}

// ==========================================
// PHASE 2: PURCHASING & GOODS RECEIPT (BP-03)
// ==========================================
export type PaymentStatus = 'PAID' | 'PAYABLE';

export interface Purchase {
  id: string;
  purchaseNumber: string; // PO-YYYYMMDD-001
  supplierName: string;
  purchaseDate: string; // YYYY-MM-DD
  totalAmount: number;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
}

export interface PurchaseDetail {
  id: string;
  purchaseId: string;
  ingredientId: string;
  quantity: number;
  unit: IngredientUnit;
  unitCost: number; // Purchase price per unit
  totalCost: number;
}

export type GoodsReceiptStatus = 'RECEIVED' | 'VERIFIED';

export interface GoodsReceipt {
  id: string;
  receiptNumber: string; // GR-YYYYMMDD-001
  purchaseId: string;
  receiptDate: string;
  status: GoodsReceiptStatus;
  receivedBy: string;
  notes?: string;
  createdAt: string;
}

export interface GoodsReceiptDetail {
  id: string;
  goodsReceiptId: string;
  ingredientId: string;
  quantityReceived: number;
  unit: IngredientUnit;
  conditionNotes?: string;
}

// ==========================================
// PHASE 2: STOCK MANAGEMENT & OPNAME (BP-04)
// ==========================================
export type StockMovementType = 
  | 'IN_PURCHASE' 
  | 'OUT_STOCK_ISSUE' 
  | 'OUT_CONSUMPTION' 
  | 'ADJUSTMENT_OPNAME' 
  | 'WASTE';

export interface StockMovement {
  id: string;
  ingredientId: string;
  movementType: StockMovementType;
  quantity: number; // positive for IN/ADJUSTMENT, negative for OUT
  unit: IngredientUnit;
  previousStock: number;
  currentStock: number;
  referenceId?: string; // PO number, ISS number, OPN number, etc.
  notes?: string;
  createdAt: string;
}

export type AdjustmentReason = 'WASTE' | 'DAMAGED' | 'DISCREPANCY' | 'EXPIRED' | 'OTHER';
export type OpnameStatus = 'DRAFT' | 'APPROVED';

export interface StockOpname {
  id: string;
  opnameNumber: string; // OPN-YYYYMMDD-001
  opnameDate: string; // YYYY-MM-DD
  ingredientId: string;
  systemStock: number;
  physicalStock: number;
  difference: number; // physicalStock - systemStock
  unit: IngredientUnit;
  adjustmentReason: AdjustmentReason;
  status: OpnameStatus;
  notes?: string;
  createdAt: string;
}

// ==========================================
// PHASE 3: CORE TRANSACTIONS (POS, EXPENSE, PREPARATION)
// ==========================================
export type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT' | 'TRANSFER';
export type SaleStatus = 'COMPLETED' | 'CANCELLED';

export interface Sale {
  id: string;
  receiptNumber: string; // POS-YYYYMMDD-001
  dailyOperationId: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  cashPaid: number;
  cashChange: number;
  status: SaleStatus;
  soldBy: string;
  notes?: string;
  createdAt: string;
}

export interface SaleDetail {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  sellingPrice: number; // Active price recorded at sale
  subtotal: number;
  cogsPerUnit: number; // Active BOM COGS at sale
  totalCogs: number;
}

export type ExpenseCategory = 
  | 'ICE_CUBES' 
  | 'PARKING' 
  | 'CLEANING' 
  | 'LPG_GAS' 
  | 'GALLON_WATER' 
  | 'SUPPLIES' 
  | 'OTHER';

export interface Expense {
  id: string;
  expenseNumber: string; // EXP-YYYYMMDD-001
  dailyOperationId: string;
  category: ExpenseCategory;
  amount: number;
  paidTo: string;
  notes?: string;
  createdAt: string;
}

export interface PreparationBatch {
  id: string;
  prepNumber: string; // PRP-YYYYMMDD-001
  dailyOperationId: string;
  targetIngredientId: string; // Ingredient produced (e.g. Simple Syrup)
  yieldQuantity: number;
  unit: IngredientUnit;
  preparedBy: string;
  notes?: string;
  createdAt: string;
}

export interface PreparationDetail {
  id: string;
  prepBatchId: string;
  ingredientId: string; // Raw ingredient consumed (e.g. Sugar)
  quantityUsed: number;
  unit: IngredientUnit;
}

// ==========================================
// PRE-PACK BATCHING & DAILY CONSIGNMENT HANDOVER
// ==========================================
export type PrePackStatus = 'READY_IN_WAREHOUSE' | 'HANDED_OVER_TO_CASHIER' | 'RETURNED_TO_WAREHOUSE' | 'COMPLETED';

export interface PrePackBatchItem {
  id: string;
  batchNumber: string; // e.g. BATCH-20260811-001
  batchName: string; // e.g. "Paket Porsian Matcha Latte (50 Cup)"
  targetProductId: string; // Product ID (e.g. prd-1)
  portionsCount: number; // Initial portions count (e.g. 50)
  preparedAt: string; // YYYY-MM-DD HH:mm (Malam Hari Gudang)
  preparedBy: string; // e.g. "Budi (Petugas Gudang)"
  
  // Handover Info (Pagi Kasir)
  dailyOperationId?: string; // ID shift aktif
  handedOverAt?: string;
  handedOverTo?: string; // e.g. "Siti (Kasir Shift Pagi)"
  
  // Usage tracking
  soldPortions: number; // Portions sold at POS
  remainingPortions: number; // Remaining portions at closing
  returnedAt?: string; // (Malam Closing)
  
  status: PrePackStatus;
  notes?: string;
  createdAt: string;
}


