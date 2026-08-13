import { 
  Product, 
  ProductPrice, 
  Ingredient, 
  BOM, 
  BOMDetail, 
  BusinessRule,
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
} from '../types';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-1',
    code: 'ING-MTC-01',
    name: 'Matcha Powder Ceremonial Uji',
    category: 'Powder & Tea',
    unit: 'gram',
    avgCost: 550, // Rp 550 / gram (Rp 550.000 / kg)
    minStock: 500,
    currentStock: 2500,
    isActive: true,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ing-2',
    code: 'ING-MTC-02',
    name: 'Matcha Powder Latte Grade',
    category: 'Powder & Tea',
    unit: 'gram',
    avgCost: 320, // Rp 320 / gram (Rp 320.000 / kg)
    minStock: 1000,
    currentStock: 5000,
    isActive: true,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ing-3',
    code: 'ING-MLK-01',
    name: 'UHT Fresh Milk Full Cream',
    category: 'Dairy & Milk',
    unit: 'ml',
    avgCost: 18, // Rp 18 / ml (Rp 18.000 / liter)
    minStock: 5000,
    currentStock: 30000,
    isActive: true,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ing-4',
    code: 'ING-MLK-02',
    name: 'Oat Milk Barista Edition',
    category: 'Dairy & Milk',
    unit: 'ml',
    avgCost: 42, // Rp 42 / ml (Rp 42.000 / liter)
    minStock: 3000,
    currentStock: 12000,
    isActive: true,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ing-5',
    code: 'ING-SYR-01',
    name: 'Cane Sugar Liquid Syrup',
    category: 'Syrup & Sweetener',
    unit: 'ml',
    avgCost: 15, // Rp 15 / ml
    minStock: 2000,
    currentStock: 10000,
    isActive: true,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ing-6',
    code: 'ING-SYR-02',
    name: 'Brown Sugar Gula Aren Liquid',
    category: 'Syrup & Sweetener',
    unit: 'ml',
    avgCost: 25, // Rp 25 / ml
    minStock: 1500,
    currentStock: 8000,
    isActive: true,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ing-7',
    code: 'ING-TOP-01',
    name: 'Cheese Cold Foam Powder',
    category: 'Topping',
    unit: 'gram',
    avgCost: 120, // Rp 120 / gram
    minStock: 500,
    currentStock: 3000,
    isActive: true,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ing-8',
    code: 'ING-TOP-02',
    name: 'Boba Pearl Tapioca',
    category: 'Topping',
    unit: 'gram',
    avgCost: 35, // Rp 35 / gram
    minStock: 1000,
    currentStock: 6000,
    isActive: true,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ing-9',
    code: 'ING-PKG-01',
    name: 'Matcha Gerobak Cup 16oz Custom Printed',
    category: 'Packaging & Cup',
    unit: 'pcs',
    avgCost: 650, // Rp 650 / pcs
    minStock: 500,
    currentStock: 4000,
    isActive: true,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ing-10',
    code: 'ING-PKG-02',
    name: 'Dome Lid & Eco Straw Set',
    category: 'Packaging & Cup',
    unit: 'pcs',
    avgCost: 250, // Rp 250 / pcs
    minStock: 500,
    currentStock: 4000,
    isActive: true,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 'ing-11',
    code: 'ING-ICE-01',
    name: 'Es Kristal Tube Pure Water',
    category: 'Ice & Water',
    unit: 'gram',
    avgCost: 2, // Rp 2 / gram (150g = Rp 300)
    minStock: 10000,
    currentStock: 50000,
    isActive: true,
    createdAt: '2026-08-01T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prd-1',
    code: 'PRD-MTC-001',
    name: 'Signature Uji Matcha Latte 16oz',
    category: 'Matcha Latte',
    description: 'Matcha Uji Premium dipadu dengan UHT Fresh Milk dan gula aren cair khas Matcha Gerobak.',
    unit: 'Cup',
    status: 'ACTIVE',
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'prd-2',
    code: 'PRD-MTC-002',
    name: 'Pure Ceremonial Ice Matcha (No Milk)',
    category: 'Pure Matcha',
    description: 'Seduhan halus Matcha Ceremonial Grade dengan es kristal tanpa campuran susu untuk cita rasa umami otentik.',
    unit: 'Cup',
    status: 'ACTIVE',
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'prd-3',
    code: 'PRD-MTC-003',
    name: 'Matcha Cheese Foam Float',
    category: 'Specialty & Cold Foam',
    description: 'Matcha Latte berkrim tinggi ditumpuk lapisan gurih Cheese Cold Foam dan taburan matcha powder.',
    unit: 'Cup',
    status: 'ACTIVE',
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'prd-4',
    code: 'PRD-MTC-004',
    name: 'Oat Milk Matcha Supreme (Plant-Based)',
    category: 'Matcha Latte',
    description: 'Menu favorit vegan dengan racikan Barista Oat Milk dan Matcha Ceremonial Uji.',
    unit: 'Cup',
    status: 'ACTIVE',
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'prd-5',
    code: 'PRD-MTC-005',
    name: 'Matcha Boba Aren Special',
    category: 'Specialty & Cold Foam',
    description: 'Matcha Latte dengan topping Boba Tapioca kenyal dan karamelisasi gula aren cair.',
    unit: 'Cup',
    status: 'DRAFT',
    createdAt: '2026-08-05T09:00:00Z',
    updatedAt: '2026-08-05T09:00:00Z',
  },
];

export const INITIAL_PRODUCT_PRICES: ProductPrice[] = [
  // PRD-MTC-001 Prices (History)
  {
    id: 'prc-1-v1',
    productId: 'prd-1',
    sellingPrice: 18000,
    effectiveDate: '2026-08-01',
    notes: 'Harga launching promo outlet',
    createdAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 'prc-1-v2',
    productId: 'prd-1',
    sellingPrice: 22000,
    effectiveDate: '2026-08-10',
    notes: 'Penyesuaian harga resmi reguler',
    createdAt: '2026-08-09T09:00:00Z',
  },

  // PRD-MTC-002 Prices
  {
    id: 'prc-2-v1',
    productId: 'prd-2',
    sellingPrice: 20000,
    effectiveDate: '2026-08-01',
    notes: 'Harga standar Ceremonial Pure',
    createdAt: '2026-08-01T09:00:00Z',
  },

  // PRD-MTC-003 Prices
  {
    id: 'prc-3-v1',
    productId: 'prd-3',
    sellingPrice: 25000,
    effectiveDate: '2026-08-01',
    notes: 'Harga standar Specialty Cheese',
    createdAt: '2026-08-01T09:00:00Z',
  },

  // PRD-MTC-004 Prices
  {
    id: 'prc-4-v1',
    productId: 'prd-4',
    sellingPrice: 28000,
    effectiveDate: '2026-08-01',
    notes: 'Harga premium Oat Milk base',
    createdAt: '2026-08-01T09:00:00Z',
  },

  // PRD-MTC-005 Prices (Draft product)
  {
    id: 'prc-5-v1',
    productId: 'prd-5',
    sellingPrice: 24000,
    effectiveDate: '2026-08-15',
    notes: 'Rencana harga rilis pertengahan bulan',
    createdAt: '2026-08-05T09:00:00Z',
  },
];

export const INITIAL_BOMS: BOM[] = [
  // PRD-MTC-001 BOM
  {
    id: 'bom-1',
    productId: 'prd-1',
    version: 'v1.0',
    effectiveDate: '2026-08-01',
    status: 'ACTIVE',
    yieldQuantity: 1,
    notes: 'Resep standar Signature Matcha Latte 16oz',
    createdAt: '2026-08-01T09:00:00Z',
  },
  // PRD-MTC-002 BOM
  {
    id: 'bom-2',
    productId: 'prd-2',
    version: 'v1.0',
    effectiveDate: '2026-08-01',
    status: 'ACTIVE',
    yieldQuantity: 1,
    notes: 'Resep Pure Matcha tanpa susu',
    createdAt: '2026-08-01T09:00:00Z',
  },
  // PRD-MTC-003 BOM
  {
    id: 'bom-3',
    productId: 'prd-3',
    version: 'v1.0',
    effectiveDate: '2026-08-01',
    status: 'ACTIVE',
    yieldQuantity: 1,
    notes: 'Resep Matcha Float Cheese Foam',
    createdAt: '2026-08-01T09:00:00Z',
  },
  // PRD-MTC-004 BOM
  {
    id: 'bom-4',
    productId: 'prd-4',
    version: 'v1.0',
    effectiveDate: '2026-08-01',
    status: 'ACTIVE',
    yieldQuantity: 1,
    notes: 'Resep Oat Milk Matcha Supreme',
    createdAt: '2026-08-01T09:00:00Z',
  },
  // PRD-MTC-005 BOM (Draft version)
  {
    id: 'bom-5',
    productId: 'prd-5',
    version: 'v1.0-draft',
    effectiveDate: '2026-08-15',
    status: 'DRAFT',
    yieldQuantity: 1,
    notes: 'Draft resep Boba Aren',
    createdAt: '2026-08-05T09:00:00Z',
  },
];

export const INITIAL_BOM_DETAILS: BOMDetail[] = [
  // Details for PRD-MTC-001 (bom-1) -> Signature Uji Matcha Latte 16oz
  // 12g Matcha Powder Latte (ing-2) -> 12 * 320 = Rp 3.840
  // 150ml Fresh Milk (ing-3) -> 150 * 18 = Rp 2.700
  // 25ml Brown Sugar (ing-6) -> 25 * 25 = Rp 625
  // 150g Es Kristal (ing-11) -> 150 * 2 = Rp 300
  // 1 Cup 16oz (ing-9) -> Rp 650
  // 1 Lid & Straw (ing-10) -> Rp 250
  // Total HPP = 3840 + 2700 + 625 + 300 + 650 + 250 = Rp 8.365
  { id: 'bd-1-1', bomId: 'bom-1', ingredientId: 'ing-2', quantity: 12, unit: 'gram', wastePercentage: 2 },
  { id: 'bd-1-2', bomId: 'bom-1', ingredientId: 'ing-3', quantity: 150, unit: 'ml', wastePercentage: 1 },
  { id: 'bd-1-3', bomId: 'bom-1', ingredientId: 'ing-6', quantity: 25, unit: 'ml', wastePercentage: 0 },
  { id: 'bd-1-4', bomId: 'bom-1', ingredientId: 'ing-11', quantity: 150, unit: 'gram', wastePercentage: 5 },
  { id: 'bd-1-5', bomId: 'bom-1', ingredientId: 'ing-9', quantity: 1, unit: 'pcs', wastePercentage: 0 },
  { id: 'bd-1-6', bomId: 'bom-1', ingredientId: 'ing-10', quantity: 1, unit: 'pcs', wastePercentage: 0 },

  // Details for PRD-MTC-002 (bom-2) -> Pure Ceremonial Ice Matcha
  // 10g Matcha Ceremonial (ing-1) -> 10 * 550 = Rp 5.500
  // 20ml Cane Sugar (ing-5) -> 20 * 15 = Rp 300
  // 180g Es Kristal (ing-11) -> 180 * 2 = Rp 360
  // 1 Cup 16oz (ing-9) -> Rp 650
  // 1 Lid & Straw (ing-10) -> Rp 250
  // Total HPP = 5500 + 300 + 360 + 650 + 250 = Rp 7.060
  { id: 'bd-2-1', bomId: 'bom-2', ingredientId: 'ing-1', quantity: 10, unit: 'gram', wastePercentage: 2 },
  { id: 'bd-2-2', bomId: 'bom-2', ingredientId: 'ing-5', quantity: 20, unit: 'ml', wastePercentage: 0 },
  { id: 'bd-2-3', bomId: 'bom-2', ingredientId: 'ing-11', quantity: 180, unit: 'gram', wastePercentage: 5 },
  { id: 'bd-2-4', bomId: 'bom-2', ingredientId: 'ing-9', quantity: 1, unit: 'pcs', wastePercentage: 0 },
  { id: 'bd-2-5', bomId: 'bom-2', ingredientId: 'ing-10', quantity: 1, unit: 'pcs', wastePercentage: 0 },

  // Details for PRD-MTC-003 (bom-3) -> Matcha Cheese Foam Float
  // 10g Matcha Powder Latte (ing-2) -> 10 * 320 = Rp 3.200
  // 140ml Fresh Milk (ing-3) -> 140 * 18 = Rp 2.520
  // 20ml Cane Sugar (ing-5) -> 20 * 15 = Rp 300
  // 30g Cheese Cold Foam Powder (ing-7) -> 30 * 120 = Rp 3.600
  // 120g Es Kristal (ing-11) -> 120 * 2 = Rp 240
  // 1 Cup 16oz (ing-9) -> Rp 650
  // 1 Lid & Straw (ing-10) -> Rp 250
  // Total HPP = 3200 + 2520 + 300 + 3600 + 240 + 650 + 250 = Rp 10.760
  { id: 'bd-3-1', bomId: 'bom-3', ingredientId: 'ing-2', quantity: 10, unit: 'gram' },
  { id: 'bd-3-2', bomId: 'bom-3', ingredientId: 'ing-3', quantity: 140, unit: 'ml' },
  { id: 'bd-3-3', bomId: 'bom-3', ingredientId: 'ing-5', quantity: 20, unit: 'ml' },
  { id: 'bd-3-4', bomId: 'bom-3', ingredientId: 'ing-7', quantity: 30, unit: 'gram' },
  { id: 'bd-3-5', bomId: 'bom-3', ingredientId: 'ing-11', quantity: 120, unit: 'gram' },
  { id: 'bd-3-6', bomId: 'bom-3', ingredientId: 'ing-9', quantity: 1, unit: 'pcs' },
  { id: 'bd-3-7', bomId: 'bom-3', ingredientId: 'ing-10', quantity: 1, unit: 'pcs' },

  // Details for PRD-MTC-004 (bom-4) -> Oat Milk Matcha Supreme
  // 12g Matcha Ceremonial (ing-1) -> 12 * 550 = Rp 6.600
  // 150ml Oat Milk (ing-4) -> 150 * 42 = Rp 6.300
  // 15ml Cane Sugar (ing-5) -> 15 * 15 = Rp 225
  // 140g Es Kristal (ing-11) -> 140 * 2 = Rp 280
  // 1 Cup 16oz (ing-9) -> Rp 650
  // 1 Lid & Straw (ing-10) -> Rp 250
  // Total HPP = 6600 + 6300 + 225 + 280 + 650 + 250 = Rp 14.305
  { id: 'bd-4-1', bomId: 'bom-4', ingredientId: 'ing-1', quantity: 12, unit: 'gram' },
  { id: 'bd-4-2', bomId: 'bom-4', ingredientId: 'ing-4', quantity: 150, unit: 'ml' },
  { id: 'bd-4-3', bomId: 'bom-4', ingredientId: 'ing-5', quantity: 15, unit: 'ml' },
  { id: 'bd-4-4', bomId: 'bom-4', ingredientId: 'ing-11', quantity: 140, unit: 'gram' },
  { id: 'bd-4-5', bomId: 'bom-4', ingredientId: 'ing-9', quantity: 1, unit: 'pcs' },
  { id: 'bd-4-6', bomId: 'bom-4', ingredientId: 'ing-10', quantity: 1, unit: 'pcs' },

  // Details for PRD-MTC-005 (bom-5 - Draft) -> Matcha Boba Aren Special
  { id: 'bd-5-1', bomId: 'bom-5', ingredientId: 'ing-2', quantity: 10, unit: 'gram' },
  { id: 'bd-5-2', bomId: 'bom-5', ingredientId: 'ing-3', quantity: 130, unit: 'ml' },
  { id: 'bd-5-3', bomId: 'bom-5', ingredientId: 'ing-6', quantity: 20, unit: 'ml' },
  { id: 'bd-5-4', bomId: 'bom-5', ingredientId: 'ing-8', quantity: 40, unit: 'gram' },
  { id: 'bd-5-5', bomId: 'bom-5', ingredientId: 'ing-9', quantity: 1, unit: 'pcs' },
  { id: 'bd-5-6', bomId: 'bom-5', ingredientId: 'ing-10', quantity: 1, unit: 'pcs' },
];

export const BUSINESS_RULES_LIST: BusinessRule[] = [
  {
    id: 'br-1',
    code: 'BR-PRD-001',
    title: 'Product Code Uniqueness',
    description: 'Kode produk harus unik di seluruh sistem untuk identifikasi SKU yang konsisten.',
    sqlConstraint: 'ALTER TABLE products ADD CONSTRAINT unique_product_code UNIQUE (code);',
    category: 'Data Integrity',
  },
  {
    id: 'br-2',
    code: 'BR-PRD-002',
    title: 'Product Activation Control',
    description: 'Produk hanya dapat dijual jika berstatus ACTIVE. Status DRAFT atau INACTIVE dilarang muncul di Kasir/Sales.',
    sqlConstraint: "CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE'))",
    category: 'Data Integrity',
  },
  {
    id: 'br-3',
    code: 'BR-PRD-003',
    title: 'Effective Date Pricing History',
    description: 'Harga jual menggunakan tanggal berlaku (effective date). Harga aktif pada tanggal transaksi adalah harga terbaru yang effective_date <= tanggal transaksi.',
    sqlConstraint: 'CREATE INDEX idx_product_prices_effective ON product_prices(product_id, effective_date DESC);',
    category: 'Price Management',
  },
  {
    id: 'br-4',
    code: 'BR-PRD-004',
    title: 'BOM Version Control & Single Active BOM',
    description: 'BOM memiliki versi (v1.0, v1.1). Hanya BISA ada 1 BOM berstatus ACTIVE per produk pada satu tanggal efektif.',
    sqlConstraint: 'CREATE UNIQUE INDEX idx_single_active_bom ON boms(product_id) WHERE status = \'ACTIVE\';',
    category: 'Recipe / BOM',
  },
  {
    id: 'br-5',
    code: 'BR-PRD-005',
    title: 'Non-Negative Ingredient Average Cost',
    description: 'Nilai Average Cost bahan baku pada tabel ingredients harus lebih besar atau sama dengan nol (>= 0).',
    sqlConstraint: 'CHECK (avg_cost >= 0)',
    category: 'Financial & Costing',
  },
  {
    id: 'br-6',
    code: 'BR-PRD-006',
    title: 'Positive BOM Quantity Requirements',
    description: 'Setiap takaran bahan baku dalam BOM Detail harus lebih besar dari 0 (> 0).',
    sqlConstraint: 'CHECK (quantity > 0)',
    category: 'Recipe / BOM',
  },
  {
    id: 'br-7',
    code: 'BR-PRD-007',
    title: 'Historical Transaction Price Integrity',
    description: 'Perubahan harga jual atau BOM baru tidak boleh merubah HPP/Harga pada transaksi penjualan historis yang sudah dicatat.',
    sqlConstraint: '-- Handled by snapshotting selling_price & HPP on sales_details table during transaction insert',
    category: 'Price Management',
  },
  {
    id: 'br-8',
    code: 'BR-PRD-008',
    title: 'Active Ingredient Constraint',
    description: 'Hanya bahan baku berstatus is_active = TRUE yang dapat ditambahkan atau digunakan dalam BOM produk.',
    sqlConstraint: 'TRIGGER trg_verify_active_ingredient ON bom_details BEFORE INSERT OR UPDATE...',
    category: 'Recipe / BOM',
  },
  {
    id: 'br-9',
    code: 'BR-PRD-009',
    title: 'Positive Selling Price Constraint',
    description: 'Harga jual produk harus bernilai positif (selling_price >= 0).',
    sqlConstraint: 'CHECK (selling_price >= 0)',
    category: 'Price Management',
  },
  {
    id: 'br-10',
    code: 'BR-PRD-010',
    title: 'Product Readiness Validation for Activation',
    description: 'Produk tidak boleh diubah ke status ACTIVE jika belum memiliki minimal 1 Harga Aktif dan 1 BOM Aktif yang memiliki item rincian bahan.',
    sqlConstraint: 'TRIGGER trg_validate_product_activation BEFORE UPDATE ON products...',
    category: 'Data Integrity',
  },
  {
    id: 'br-11',
    code: 'BR-PRD-011',
    title: 'Foreign Key Referential Constraints',
    description: 'Relasi FK antara products, product_prices, boms, bom_details, dan ingredients dijaga ketat dengan ON DELETE RESTRICT.',
    sqlConstraint: 'FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT',
    category: 'Data Integrity',
  },
  {
    id: 'br-12',
    code: 'BR-PRD-012',
    title: 'Audit Trail and Modification Timestamps',
    description: 'Seluruh tabel master wajib menyimpan created_at, updated_at, dan updated_by untuk kepentingan audit log.',
    sqlConstraint: 'TRIGGER trg_set_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_timestamp();',
    category: 'Data Integrity',
  },
  // PHASE 2 BUSINESS RULES
  {
    id: 'br-13',
    code: 'BR-OPN-001',
    title: 'Single Daily Operation Record Per Date',
    description: 'Hanya boleh ada 1 catatan operasional harian per tanggal untuk menjaga integritas pembukuan.',
    sqlConstraint: 'ALTER TABLE daily_operations ADD CONSTRAINT unique_date UNIQUE (date);',
    category: 'Daily Operations',
  },
  {
    id: 'br-14',
    code: 'BR-OPN-002',
    title: 'Previous Day Closing Verification',
    description: 'Buka toko tanggal baru memerlukan konfirmasi bahwa operasional hari sebelumnya telah ditutup (CLOSED).',
    sqlConstraint: 'TRIGGER trg_verify_prev_day_closed BEFORE INSERT ON daily_operations...',
    category: 'Daily Operations',
  },
  {
    id: 'br-15',
    code: 'BR-OPN-003',
    title: 'Opening Cash Float Isolation',
    description: 'Modal awal kasir (Opening Cash) wajib dicatat terpisah dan tidak dihitung sebagai omzet/sales revenue.',
    sqlConstraint: 'CHECK (amount >= 0); -- Opening cash is float money only',
    category: 'Daily Operations',
  },
  {
    id: 'br-16',
    code: 'BR-OPN-005',
    title: 'Main Warehouse to Booth Stock Issue',
    description: 'Pengeluaran bahan dari gudang utama ke booth gerobak wajib dicatat via Stock Issue untuk menjaga akurasi saldo.',
    sqlConstraint: 'FOREIGN KEY (daily_operation_id) REFERENCES daily_operations(id)',
    category: 'Daily Operations',
  },
  {
    id: 'br-17',
    code: 'BR-PUR-009',
    title: 'Weighted Average Cost (WAC) Auto Update',
    description: 'Rata-rata harga pokok bahan (avgCost) diupdate otomatis saat penerimaan barang baru: ((StokLama * CostLama) + (QtyBaru * CostBaru)) / StokTotal.',
    sqlConstraint: 'TRIGGER trg_update_weighted_average_cost AFTER INSERT ON goods_receipt_details...',
    category: 'Purchasing',
  },
  {
    id: 'br-18',
    code: 'BR-STK-001',
    title: 'Immutable Stock Movement Log',
    description: 'Setiap perubahan stok (Penerimaan, Issue, Opname, Waste) wajib dicatat sebagai mutasi stok yang tidak dapat diedit/dihapus.',
    sqlConstraint: 'CREATE TABLE stock_movements (id uuid PRIMARY KEY, movement_type text, quantity numeric...);',
    category: 'Stock Management',
  },
];

// ==========================================
// PHASE 2 SEED DATA
// ==========================================

export const INITIAL_DAILY_OPERATIONS: DailyOperation[] = [
  {
    id: 'dop-20260810',
    date: '2026-08-10',
    status: 'CLOSED',
    openedAt: '2026-08-10T07:30:00Z',
    closedAt: '2026-08-10T21:00:00Z',
    openedBy: 'Budi (Shift Pagi)',
    closedBy: 'Siti (Shift Malam)',
    notes: 'Operasional lancar, omzet sesuai kasir POS.',
    createdAt: '2026-08-10T07:30:00Z',
  },
  {
    id: 'dop-20260811',
    date: '2026-08-11',
    status: 'OPEN',
    openedAt: '2026-08-11T07:45:00Z',
    openedBy: 'Budi (Shift Pagi)',
    notes: 'Persiapan buka booth pagi, cuaca cerah.',
    createdAt: '2026-08-11T07:45:00Z',
  },
];

export const INITIAL_OPENING_CASH: OpeningCash[] = [
  {
    id: 'opc-20260810',
    dailyOperationId: 'dop-20260810',
    amount: 300000, // Rp 300.000 modal awal
    notes: 'Pecahan Rp 50.000 (2x), Rp 20.000 (5x), Rp 10.000 (10x)',
    createdAt: '2026-08-10T07:30:00Z',
  },
  {
    id: 'opc-20260811',
    dailyOperationId: 'dop-20260811',
    amount: 350000, // Rp 350.000 modal awal
    notes: 'Pecahan kembalian lengkap Rp 5.000, 10.000, 20.000',
    createdAt: '2026-08-11T07:45:00Z',
  },
];

export const INITIAL_STOCK_ISSUES: StockIssue[] = [
  {
    id: 'iss-1',
    issueNumber: 'ISS-20260811-001',
    dailyOperationId: 'dop-20260811',
    ingredientId: 'ing-2', // Matcha Powder Latte Grade
    quantityIssued: 500, // 500g dibawa ke booth
    unit: 'gram',
    issuedAt: '2026-08-11T08:00:00Z',
    notes: 'Restock bubuk matcha booth utama',
  },
  {
    id: 'iss-2',
    issueNumber: 'ISS-20260811-002',
    dailyOperationId: 'dop-20260811',
    ingredientId: 'ing-3', // UHT Fresh Milk
    quantityIssued: 10000, // 10 Liter ke booth
    unit: 'ml',
    issuedAt: '2026-08-11T08:05:00Z',
    notes: 'Susu UHT Fresh Milk 10 Kotak',
  },
];

export const INITIAL_PURCHASES: Purchase[] = [
  {
    id: 'po-1',
    purchaseNumber: 'PO-20260805-001',
    supplierName: 'PT Kyoto Premium Import',
    purchaseDate: '2026-08-05',
    totalAmount: 2750000,
    paymentStatus: 'PAID',
    notes: 'Pembelian Matcha Powder Uji Ceremonial 5 Kg',
    createdAt: '2026-08-05T10:00:00Z',
  },
  {
    id: 'po-2',
    purchaseNumber: 'PO-20260809-002',
    supplierName: 'CV Susu Segar Nusantara',
    purchaseDate: '2026-08-09',
    totalAmount: 1080000,
    paymentStatus: 'PAID',
    notes: 'UHT Milk Fresh Cream 60 Liter',
    createdAt: '2026-08-09T09:00:00Z',
  },
  {
    id: 'po-3',
    purchaseNumber: 'PO-20260811-003',
    supplierName: 'PT Packaging Indah Sukses',
    purchaseDate: '2026-08-11',
    totalAmount: 1800000,
    paymentStatus: 'PAYABLE',
    notes: 'Cup 16oz Custom Print & Straw 2.000 Pcs (Tempo 14 Hari)',
    createdAt: '2026-08-11T08:30:00Z',
  },
];

export const INITIAL_PURCHASE_DETAILS: PurchaseDetail[] = [
  {
    id: 'pod-1-1',
    purchaseId: 'po-1',
    ingredientId: 'ing-1',
    quantity: 5000, // 5.000 gram
    unit: 'gram',
    unitCost: 550, // Rp 550 / g
    totalCost: 2750000,
  },
  {
    id: 'pod-2-1',
    purchaseId: 'po-2',
    ingredientId: 'ing-3',
    quantity: 60000, // 60.000 ml
    unit: 'ml',
    unitCost: 18, // Rp 18 / ml
    totalCost: 1080000,
  },
  {
    id: 'pod-3-1',
    purchaseId: 'po-3',
    ingredientId: 'ing-9',
    quantity: 2000,
    unit: 'pcs',
    unitCost: 650,
    totalCost: 1300000,
  },
  {
    id: 'pod-3-2',
    purchaseId: 'po-3',
    ingredientId: 'ing-10',
    quantity: 2000,
    unit: 'pcs',
    unitCost: 250,
    totalCost: 500000,
  },
];

export const INITIAL_GOODS_RECEIPTS: GoodsReceipt[] = [
  {
    id: 'gr-1',
    receiptNumber: 'GR-20260805-001',
    purchaseId: 'po-1',
    receiptDate: '2026-08-05',
    status: 'VERIFIED',
    receivedBy: 'Gudang Utama - Agus',
    notes: 'Kondisi kemasan matcha utuh ter-seal aluminium foil.',
    createdAt: '2026-08-05T14:00:00Z',
  },
  {
    id: 'gr-2',
    receiptNumber: 'GR-20260809-002',
    purchaseId: 'po-2',
    receiptDate: '2026-08-09',
    status: 'VERIFIED',
    receivedBy: 'Gudang Utama - Agus',
    notes: 'Susu dingin kondisi segar, exp date jauh 2027.',
    createdAt: '2026-08-09T11:00:00Z',
  },
];

export const INITIAL_GOODS_RECEIPT_DETAILS: GoodsReceiptDetail[] = [
  {
    id: 'grd-1-1',
    goodsReceiptId: 'gr-1',
    ingredientId: 'ing-1',
    quantityReceived: 5000,
    unit: 'gram',
    conditionNotes: 'Sesuai spesifikasi Ceremonial Grade',
  },
  {
    id: 'grd-2-1',
    goodsReceiptId: 'gr-2',
    ingredientId: 'ing-3',
    quantityReceived: 60000,
    unit: 'ml',
    conditionNotes: 'Karton utuh tidak bocor',
  },
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'stm-1',
    ingredientId: 'ing-1',
    movementType: 'IN_PURCHASE',
    quantity: 5000,
    unit: 'gram',
    previousStock: 0,
    currentStock: 5000,
    referenceId: 'PO-20260805-001',
    notes: 'Penerimaan barang dari PT Kyoto Premium Import',
    createdAt: '2026-08-05T14:00:00Z',
  },
  {
    id: 'stm-2',
    ingredientId: 'ing-3',
    movementType: 'IN_PURCHASE',
    quantity: 60000,
    unit: 'ml',
    previousStock: 0,
    currentStock: 60000,
    referenceId: 'PO-20260809-002',
    notes: 'Penerimaan barang dari CV Susu Segar Nusantara',
    createdAt: '2026-08-09T11:00:00Z',
  },
  {
    id: 'stm-3',
    ingredientId: 'ing-2',
    movementType: 'OUT_STOCK_ISSUE',
    quantity: -500,
    unit: 'gram',
    previousStock: 5500,
    currentStock: 5000,
    referenceId: 'ISS-20260811-001',
    notes: 'Pengeluaran ke booth operasional hari ini',
    createdAt: '2026-08-11T08:00:00Z',
  },
];

export const INITIAL_STOCK_OPNAMES: StockOpname[] = [
  {
    id: 'opn-1',
    opnameNumber: 'OPN-20260808-001',
    opnameDate: '2026-08-08',
    ingredientId: 'ing-3', // Fresh Milk
    systemStock: 30200,
    physicalStock: 30000,
    difference: -200, // 200 ml tumpah / waste
    unit: 'ml',
    adjustmentReason: 'WASTE',
    status: 'APPROVED',
    notes: 'Tumpah saat pembukaan karton baru',
    createdAt: '2026-08-08T18:00:00Z',
  },
];

// Phase 3 Seed Data
export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-101',
    receiptNumber: 'POS-20260811-001',
    dailyOperationId: 'dop-3',
    subtotal: 46000,
    discount: 0,
    tax: 0,
    totalAmount: 46000,
    paymentMethod: 'CASH',
    cashPaid: 50000,
    cashChange: 4000,
    status: 'COMPLETED',
    soldBy: 'Budi (Kasir Shift Pagi)',
    notes: 'Pelanggan pertama hari ini',
    createdAt: '2026-08-11T08:30:00Z',
  },
  {
    id: 'sale-102',
    receiptNumber: 'POS-20260811-002',
    dailyOperationId: 'dop-3',
    subtotal: 54000,
    discount: 0,
    tax: 0,
    totalAmount: 54000,
    paymentMethod: 'QRIS',
    cashPaid: 54000,
    cashChange: 0,
    status: 'COMPLETED',
    soldBy: 'Budi (Kasir Shift Pagi)',
    notes: 'Pembayaran QRIS via BCA',
    createdAt: '2026-08-11T09:15:00Z',
  },
];

export const INITIAL_SALE_DETAILS: SaleDetail[] = [
  {
    id: 'sd-101-1',
    saleId: 'sale-101',
    productId: 'prod-1', // Uji Latte
    quantity: 2,
    sellingPrice: 23000,
    subtotal: 46000,
    cogsPerUnit: 6700,
    totalCogs: 13400,
  },
  {
    id: 'sd-102-1',
    saleId: 'sale-102',
    productId: 'prod-2', // Houjicha Cloud
    quantity: 2,
    sellingPrice: 27000,
    subtotal: 54000,
    cogsPerUnit: 7800,
    totalCogs: 15600,
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-101',
    expenseNumber: 'EXP-20260811-001',
    dailyOperationId: 'dop-3',
    category: 'ICE_CUBES',
    amount: 15000,
    paidTo: 'Pemasok Es Batu Kristal Pak Slamet',
    notes: 'Beli 2 Kristal Es Batu Balok',
    createdAt: '2026-08-11T07:45:00Z',
  },
  {
    id: 'exp-102',
    expenseNumber: 'EXP-20260811-002',
    dailyOperationId: 'dop-3',
    category: 'PARKING',
    amount: 5000,
    paidTo: 'Jukir Lapangan Merdeka',
    notes: 'Retribusi Parkir Lapak Gerobak',
    createdAt: '2026-08-11T08:00:00Z',
  },
];

export const INITIAL_PREPARATION_BATCHES: PreparationBatch[] = [
  {
    id: 'prp-101',
    prepNumber: 'PRP-20260811-001',
    dailyOperationId: 'dop-3',
    targetIngredientId: 'ing-5', // Simple Syrup
    yieldQuantity: 2000, // 2000 ml
    unit: 'ml',
    preparedBy: 'Siti (Barista)',
    notes: 'Membuat Sirup Gula Cair 2 Liter (Rasio 1kg gula : 1L air)',
    createdAt: '2026-08-11T07:30:00Z',
  },
];

export const INITIAL_PREPARATION_DETAILS: PreparationDetail[] = [
  {
    id: 'prpd-101-1',
    prepBatchId: 'prp-101',
    ingredientId: 'ing-4', // Sugar
    quantityUsed: 1000,
    unit: 'gram',
  },
];

export const INITIAL_PREPACK_BATCHES: PrePackBatchItem[] = [
  {
    id: 'ppk-101',
    batchNumber: 'BATCH-20260811-001',
    batchName: 'Paket Porsian Matcha Latte Original (50 Cup)',
    targetProductId: 'prod-1', // Uji Matcha Latte
    portionsCount: 50,
    preparedAt: '2026-08-10T21:00:00Z', // Dibungkus malam kemarin oleh gudang
    preparedBy: 'Budi (Petugas Stok Gudang Pusat)',
    dailyOperationId: 'dop-3',
    handedOverAt: '2026-08-11T07:15:00Z', // Diterima kasir pagi
    handedOverTo: 'Siti (Kasir Shift Pagi)',
    soldPortions: 38,
    remainingPortions: 12,
    status: 'HANDED_OVER_TO_CASHIER',
    notes: 'Paket 50 porsi lengkap (500g Powder Matcha, 10L Susu, 50 Cup & Sedotan)',
    createdAt: '2026-08-10T21:00:00Z',
  },
  {
    id: 'ppk-102',
    batchNumber: 'BATCH-20260811-002',
    batchName: 'Paket Porsian Houjicha Cold Foam (50 Cup)',
    targetProductId: 'prod-2', // Houjicha Cloud
    portionsCount: 50,
    preparedAt: '2026-08-10T21:30:00Z',
    preparedBy: 'Budi (Petugas Stok Gudang Pusat)',
    soldPortions: 0,
    remainingPortions: 50,
    status: 'READY_IN_WAREHOUSE',
    notes: 'Paket 50 porsi di Gudang Pusat, siap diambil kasir saat buka shift',
    createdAt: '2026-08-10T21:30:00Z',
  },
  {
    id: 'ppk-100',
    batchNumber: 'BATCH-20260810-001',
    batchName: 'Paket Porsian Pure Matcha Uji (50 Cup)',
    targetProductId: 'prod-3', // Pure Ceremonial Matcha
    portionsCount: 50,
    preparedAt: '2026-08-09T20:30:00Z',
    preparedBy: 'Budi (Petugas Stok Gudang Pusat)',
    dailyOperationId: 'dop-2',
    handedOverAt: '2026-08-10T07:00:00Z',
    handedOverTo: 'Siti (Kasir Shift Pagi)',
    soldPortions: 42,
    remainingPortions: 8,
    returnedAt: '2026-08-10T21:30:00Z',
    status: 'RETURNED_TO_WAREHOUSE',
    notes: 'Sisa 8 porsi kemarin sudah di-return ke Gudang Pusat & diputar ke stok bungkusan baru',
    createdAt: '2026-08-09T20:30:00Z',
  }
];



