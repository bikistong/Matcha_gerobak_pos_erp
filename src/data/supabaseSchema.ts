export const SUPABASE_SQL_SCRIPT = `-- ============================================================================
-- MATCHA GEROBAK ERP - MANAGEMENT PRODUCT (BP-01)
-- Supabase (PostgreSQL 15+) Full DDL, Constraints, Functions & Triggers
-- Business Rules Baseline: BR-PRD-001 to BR-PRD-012
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. DROP EXISTING VIEWS, TABLES & FUNCTIONS (FOR CLEAN RE-INIT IF NEEDED)
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS v_cash_reconciliation CASCADE;
DROP VIEW IF EXISTS v_daily_pnl CASCADE;
DROP VIEW IF EXISTS v_inventory_valuation CASCADE;
DROP VIEW IF EXISTS view_product_costing_summary CASCADE;

DROP TABLE IF EXISTS sales_details CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS preparation_details CASCADE;
DROP TABLE IF EXISTS preparation_batches CASCADE;
DROP TABLE IF EXISTS goods_receipt_detail CASCADE;
DROP TABLE IF EXISTS goods_receipt CASCADE;
DROP TABLE IF EXISTS purchase_details CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS stock_movements CASCADE;
DROP TABLE IF EXISTS stock_opname CASCADE;
DROP TABLE IF EXISTS stock_issues CASCADE;
DROP TABLE IF EXISTS opening_cash CASCADE;
DROP TABLE IF EXISTS daily_operations CASCADE;
DROP TABLE IF EXISTS bom_details CASCADE;
DROP TABLE IF EXISTS boms CASCADE;
DROP TABLE IF EXISTS product_prices CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS ingredients CASCADE;

DROP FUNCTION IF EXISTS update_timestamp CASCADE;
DROP FUNCTION IF EXISTS fn_verify_active_ingredient CASCADE;
DROP FUNCTION IF EXISTS fn_validate_product_activation CASCADE;
DROP FUNCTION IF EXISTS fn_calculate_product_hpp CASCADE;
DROP FUNCTION IF EXISTS fn_get_active_selling_price CASCADE;
DROP FUNCTION IF EXISTS fn_update_weighted_average_cost CASCADE;
DROP FUNCTION IF EXISTS fn_process_pos_sale CASCADE;
DROP FUNCTION IF EXISTS fn_execute_daily_closing CASCADE;

-- ----------------------------------------------------------------------------
-- 2. CREATE MASTER TABLES WITH BR CONSTRAINTS
-- ----------------------------------------------------------------------------

-- Table: INGREDIENTS (Bahan Baku)
-- BR-PRD-005: avg_cost >= 0
-- BR-PRD-012: Audit timestamps
CREATE TABLE ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) NOT NULL UNIQUE, -- BR-PRD-001 equivalent for ingredient
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Powder & Tea', 'Dairy & Milk', 'Syrup & Sweetener', 'Packaging & Cup', 'Ice & Water', 'Topping')),
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('gram', 'ml', 'pcs', 'pack')),
    avg_cost NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (avg_cost >= 0), -- BR-PRD-005
    min_stock NUMERIC(10, 2) DEFAULT 0 CHECK (min_stock >= 0),
    current_stock NUMERIC(10, 2) DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: PRODUCTS (Master Produk)
-- BR-PRD-001: Unique Product Code
-- BR-PRD-002: Status Check ('DRAFT', 'ACTIVE', 'INACTIVE')
-- BR-PRD-012: Audit timestamps
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) NOT NULL UNIQUE, -- BR-PRD-001
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Pure Matcha', 'Matcha Latte', 'Specialty & Cold Foam', 'Toppings & Add-ons', 'Non-Matcha Series')),
    description TEXT,
    unit VARCHAR(20) NOT NULL DEFAULT 'Cup',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE')), -- BR-PRD-002
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: PRODUCT_PRICES (Histori Harga Jual Berdasarkan Effective Date)
-- BR-PRD-003: Effective Date Pricing History
-- BR-PRD-009: selling_price >= 0
-- BR-PRD-011: FK constraint to products
CREATE TABLE product_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT, -- BR-PRD-011
    selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0), -- BR-PRD-009
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE, -- BR-PRD-003
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_product_price_effective_date UNIQUE (product_id, effective_date)
);

-- Table: BOMS (Bill of Materials / Versioning Resep Produk)
-- BR-PRD-004: Versioning Resep & Effective Date
-- BR-PRD-011: FK to products
CREATE TABLE boms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT, -- BR-PRD-011
    version VARCHAR(20) NOT NULL, -- e.g. 'v1.0', 'v1.1'
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'ARCHIVED')),
    yield_quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00 CHECK (yield_quantity > 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- BR-PRD-004 Partial Index: Only ONE active BOM per product allowed!
CREATE UNIQUE INDEX idx_single_active_bom_per_product 
ON boms(product_id) 
WHERE status = 'ACTIVE';

-- Table: BOM_DETAILS (Rincian Takaran Bahan Baku per Versi Resep)
-- BR-PRD-006: quantity > 0
-- BR-PRD-011: FK to boms and ingredients (ON DELETE RESTRICT)
CREATE TABLE bom_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bom_id UUID NOT NULL REFERENCES boms(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT, -- BR-PRD-011
    quantity NUMERIC(10, 3) NOT NULL CHECK (quantity > 0), -- BR-PRD-006
    unit VARCHAR(20) NOT NULL CHECK (unit IN ('gram', 'ml', 'pcs', 'pack')),
    waste_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (waste_percentage >= 0 AND waste_percentage <= 100),
    notes TEXT,
    CONSTRAINT unique_bom_ingredient UNIQUE (bom_id, ingredient_id)
);

-- ----------------------------------------------------------------------------
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ----------------------------------------------------------------------------
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_product_prices_lookup ON product_prices(product_id, effective_date DESC);
CREATE INDEX idx_boms_product_status ON boms(product_id, status);
CREATE INDEX idx_bom_details_bom_id ON bom_details(bom_id);
CREATE INDEX idx_ingredients_active ON ingredients(is_active);

-- ----------------------------------------------------------------------------
-- 4. FUNCTIONS & TRIGGERS FOR BUSINESS LOGIC ENFORCEMENT
-- ----------------------------------------------------------------------------

-- A. Auto-update timestamp function (BR-PRD-012)
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_ingredients_updated_at 
    BEFORE UPDATE ON ingredients 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_boms_updated_at 
    BEFORE UPDATE ON boms 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- B. BR-PRD-008: Ensure only ACTIVE ingredients are added to BOM Detail
CREATE OR REPLACE FUNCTION fn_verify_active_ingredient()
RETURNS TRIGGER AS $$
DECLARE
    v_is_active BOOLEAN;
    v_ing_name VARCHAR(150);
BEGIN
    SELECT is_active, name INTO v_is_active, v_ing_name
    FROM ingredients
    WHERE id = NEW.ingredient_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Bahan baku dengan ID % tidak ditemukan.', NEW.ingredient_id;
    END IF;

    IF v_is_active = FALSE THEN
        RAISE EXCEPTION 'Gagal menambahkan bahan: "%" (ID %) berstatus INACTIVE (BR-PRD-008).', v_ing_name, NEW.ingredient_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_verify_active_ingredient
    BEFORE INSERT OR UPDATE ON bom_details
    FOR EACH ROW EXECUTE FUNCTION fn_verify_active_ingredient();

-- C. BR-PRD-010: Prevent activation of product if Price or Active BOM detail is missing
CREATE OR REPLACE FUNCTION fn_validate_product_activation()
RETURNS TRIGGER AS $$
DECLARE
    v_price_count INT;
    v_active_bom_count INT;
    v_bom_detail_count INT;
BEGIN
    -- Only check when transitioning TO 'ACTIVE' status
    IF NEW.status = 'ACTIVE' AND (OLD.status IS NULL OR OLD.status != 'ACTIVE') THEN
        
        -- 1. Check if product has at least one price
        SELECT COUNT(*) INTO v_price_count
        FROM product_prices
        WHERE product_id = NEW.id AND effective_date <= CURRENT_DATE;

        IF v_price_count = 0 THEN
            RAISE EXCEPTION 'Produk "%" (%) tidak dapat diaktifkan: Belum memiliki harga jual aktif (BR-PRD-010).', NEW.name, NEW.code;
        END IF;

        -- 2. Check if product has an active BOM
        SELECT COUNT(*) INTO v_active_bom_count
        FROM boms
        WHERE product_id = NEW.id AND status = 'ACTIVE' AND effective_date <= CURRENT_DATE;

        IF v_active_bom_count = 0 THEN
            RAISE EXCEPTION 'Produk "%" (%) tidak dapat diaktifkan: Belum memiliki BOM berstatus ACTIVE (BR-PRD-010).', NEW.name, NEW.code;
        END IF;

        -- 3. Check if active BOM has at least 1 detail item
        SELECT COUNT(bd.id) INTO v_bom_detail_count
        FROM boms b
        JOIN bom_details bd ON bd.bom_id = b.id
        WHERE b.product_id = NEW.id AND b.status = 'ACTIVE';

        IF v_bom_detail_count = 0 THEN
            RAISE EXCEPTION 'Produk "%" (%) tidak dapat diaktifkan: BOM aktif tidak memiliki item rincian bahan baku (BR-PRD-010).', NEW.name, NEW.code;
        END IF;

    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_product_activation
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION fn_validate_product_activation();

-- D. Helper Function: Calculate Theoretical Product HPP (COGS)
CREATE OR REPLACE FUNCTION fn_calculate_product_hpp(p_product_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    v_hpp NUMERIC(12,2) := 0.00;
BEGIN
    SELECT COALESCE(
        SUM(
            (bd.quantity * (1 + (bd.waste_percentage / 100.0))) * i.avg_cost
        ), 0.00
    ) INTO v_hpp
    FROM boms b
    JOIN bom_details bd ON bd.bom_id = b.id
    JOIN ingredients i ON i.id = bd.ingredient_id
    WHERE b.product_id = p_product_id 
      AND b.status = 'ACTIVE' 
      AND b.effective_date <= CURRENT_DATE;

    RETURN v_hpp;
END;
$$ LANGUAGE plpgsql;

-- E. Helper Function: Get Active Selling Price by Effective Date
CREATE OR REPLACE FUNCTION fn_get_active_selling_price(p_product_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS NUMERIC AS $$
DECLARE
    v_price NUMERIC(12,2) := 0.00;
BEGIN
    SELECT selling_price INTO v_price
    FROM product_prices
    WHERE product_id = p_product_id AND effective_date <= p_date
    ORDER BY effective_date DESC, created_at DESC
    LIMIT 1;

    RETURN COALESCE(v_price, 0.00);
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 5. VIEW FOR LIVE PRODUCT COSTING & GROSS MARGIN ANALYSIS
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW view_product_costing_summary AS
SELECT 
    p.id AS product_id,
    p.code AS product_code,
    p.name AS product_name,
    p.category,
    p.status AS product_status,
    fn_get_active_selling_price(p.id, CURRENT_DATE) AS active_selling_price,
    fn_calculate_product_hpp(p.id) AS theoretical_hpp,
    (fn_get_active_selling_price(p.id, CURRENT_DATE) - fn_calculate_product_hpp(p.id)) AS gross_margin_nominal,
    CASE 
        WHEN fn_get_active_selling_price(p.id, CURRENT_DATE) > 0 THEN
            ROUND(
                ((fn_get_active_selling_price(p.id, CURRENT_DATE) - fn_calculate_product_hpp(p.id)) 
                 / fn_get_active_selling_price(p.id, CURRENT_DATE)) * 100.0, 2
            )
        ELSE 0.00
    END AS gross_margin_percentage,
    b.version AS active_bom_version,
    (SELECT COUNT(*) FROM bom_details bd WHERE bd.bom_id = b.id) AS bom_item_count
FROM products p
LEFT JOIN boms b ON b.product_id = p.id AND b.status = 'ACTIVE';

-- ----------------------------------------------------------------------------
-- 6. PHASE 2: DAILY OPERATIONS, PURCHASING & STOCK MANAGEMENT TABLES
-- ----------------------------------------------------------------------------

-- Table: DAILY_OPERATIONS (Buka / Tutup Toko Operasional)
-- BR-OPN-001: Unique date constraint
CREATE TABLE daily_operations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE, -- BR-OPN-001: 1 date 1 operation
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'OPEN', 'CLOSED')),
    opened_at TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    opened_by VARCHAR(100),
    closed_by VARCHAR(100),
    actual_cash NUMERIC(12, 2) DEFAULT 0.00,
    cash_variance NUMERIC(12, 2) DEFAULT 0.00,
    closing_notes TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: OPENING_CASH (Modal Awal / Uang Kembalian Kasir)
-- BR-OPN-003: Isolated float money, non-revenue
CREATE TABLE opening_cash (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_operation_id UUID NOT NULL REFERENCES daily_operations(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: STOCK_ISSUES (Pengeluaran Stok Gudang Utama -> Booth Gerobak)
-- BR-OPN-005: Warehouse to Booth transfers
CREATE TABLE stock_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_number VARCHAR(50) NOT NULL UNIQUE,
    daily_operation_id UUID NOT NULL REFERENCES daily_operations(id) ON DELETE RESTRICT,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity_issued NUMERIC(10, 3) NOT NULL CHECK (quantity_issued > 0),
    unit VARCHAR(20) NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Table: PURCHASES (Pembelian Bahan Baku dari Supplier)
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_number VARCHAR(50) NOT NULL UNIQUE,
    supplier_name VARCHAR(150) NOT NULL,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PAYABLE' CHECK (payment_status IN ('PAID', 'PAYABLE')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: PURCHASE_DETAILS (Detail Rincian Item Pembelian)
CREATE TABLE purchase_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity NUMERIC(10, 3) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(20) NOT NULL,
    unit_cost NUMERIC(12, 2) NOT NULL CHECK (unit_cost >= 0),
    total_cost NUMERIC(14, 2) NOT NULL CHECK (total_cost >= 0)
);

-- Table: GOODS_RECEIPT (Penerimaan Fisik Barang Masuk)
CREATE TABLE goods_receipt (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(50) NOT NULL UNIQUE,
    purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE RESTRICT,
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'RECEIVED' CHECK (status IN ('RECEIVED', 'VERIFIED')),
    received_by VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: GOODS_RECEIPT_DETAILS
CREATE TABLE goods_receipt_detail (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goods_receipt_id UUID NOT NULL REFERENCES goods_receipt(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity_received NUMERIC(10, 3) NOT NULL CHECK (quantity_received >= 0),
    unit VARCHAR(20) NOT NULL,
    condition_notes TEXT
);

-- Table: STOCK_MOVEMENTS (Audit Trail Mutasi Stok Immutable)
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN ('IN_PURCHASE', 'OUT_STOCK_ISSUE', 'OUT_CONSUMPTION', 'ADJUSTMENT_OPNAME', 'WASTE')),
    quantity NUMERIC(10, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    previous_stock NUMERIC(10, 3) NOT NULL,
    current_stock NUMERIC(10, 3) NOT NULL,
    reference_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: STOCK_OPNAME (Pemeriksaan Physical Stock Count & Adjustment)
CREATE TABLE stock_opname (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    opname_number VARCHAR(50) NOT NULL UNIQUE,
    opname_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    system_stock NUMERIC(10, 3) NOT NULL,
    physical_stock NUMERIC(10, 3) NOT NULL CHECK (physical_stock >= 0),
    difference NUMERIC(10, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    adjustment_reason VARCHAR(30) NOT NULL CHECK (adjustment_reason IN ('WASTE', 'DAMAGED', 'DISCREPANCY', 'EXPIRED', 'OTHER')),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'APPROVED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 7. BR-PUR-009 TRIGGER: WEIGHTED AVERAGE COST (WAC) AUTOMATIC RECALCULATION
-- Formula: New Avg Cost = ((Current Stock * Current Avg Cost) + (Qty Received * Unit Cost)) / (Current Stock + Qty Received)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_weighted_average_cost()
RETURNS TRIGGER AS $$
DECLARE
    v_curr_stock NUMERIC(10, 3);
    v_curr_avg_cost NUMERIC(12, 2);
    v_new_avg_cost NUMERIC(12, 2);
    v_unit_cost NUMERIC(12, 2);
    v_new_total_stock NUMERIC(10, 3);
BEGIN
    -- Fetch current ingredient stock and average cost
    SELECT current_stock, avg_cost INTO v_curr_stock, v_curr_avg_cost
    FROM ingredients
    WHERE id = NEW.ingredient_id;

    -- Fetch unit cost from corresponding purchase detail
    SELECT pd.unit_cost INTO v_unit_cost
    FROM goods_receipt gr
    JOIN purchase_details pd ON pd.purchase_id = gr.purchase_id AND pd.ingredient_id = NEW.ingredient_id
    WHERE gr.id = NEW.goods_receipt_id
    LIMIT 1;

    IF v_unit_cost IS NOT NULL AND (v_curr_stock + NEW.quantity_received) > 0 THEN
        v_new_total_stock := v_curr_stock + NEW.quantity_received;
        
        -- WAC Formula (BR-PUR-009)
        v_new_avg_cost := ((v_curr_stock * v_curr_avg_cost) + (NEW.quantity_received * v_unit_cost)) / v_new_total_stock;

        -- Update ingredient avg_cost and current_stock
        UPDATE ingredients
        SET avg_cost = ROUND(v_new_avg_cost, 2),
            current_stock = v_new_total_stock,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.ingredient_id;

        -- Record Stock Movement
        INSERT INTO stock_movements (ingredient_id, movement_type, quantity, unit, previous_stock, current_stock, reference_id, notes)
        VALUES (
            NEW.ingredient_id,
            'IN_PURCHASE',
            NEW.quantity_received,
            NEW.unit,
            v_curr_stock,
            v_new_total_stock,
            (SELECT receipt_number FROM goods_receipt WHERE id = NEW.goods_receipt_id),
            'Penerimaan Barang & Update Average Cost (BR-PUR-009)'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_weighted_average_cost
    AFTER INSERT ON goods_receipt_detail
    FOR EACH ROW EXECUTE FUNCTION fn_update_weighted_average_cost();

-- ----------------------------------------------------------------------------
-- 8. SUPABASE ROW LEVEL SECURITY (RLS) POLICIES FOR ALL TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE boms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_receipt ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_receipt_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_opname ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on products" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on product_prices" ON product_prices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on ingredients" ON ingredients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on boms" ON boms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on bom_details" ON bom_details FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on daily_operations" ON daily_operations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on opening_cash" ON opening_cash FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on stock_issues" ON stock_issues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on purchases" ON purchases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on purchase_details" ON purchase_details FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on goods_receipt" ON goods_receipt FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on goods_receipt_detail" ON goods_receipt_detail FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on stock_movements" ON stock_movements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on stock_opname" ON stock_opname FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 9. PHASE 3: CORE TRANSACTIONS (SALES POS, EXPENSES & PREPARATION BATCHES)
-- ----------------------------------------------------------------------------

-- Table: SALES (Header Transaksi Penjualan POS)
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(50) NOT NULL UNIQUE, -- e.g. POS-20260811-001
    daily_operation_id UUID NOT NULL REFERENCES daily_operations(id) ON DELETE RESTRICT,
    subtotal NUMERIC(14, 2) NOT NULL CHECK (subtotal >= 0),
    discount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (discount >= 0),
    tax NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (tax >= 0),
    total_amount NUMERIC(14, 2) NOT NULL CHECK (total_amount >= 0),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('CASH', 'QRIS', 'DEBIT', 'TRANSFER')),
    cash_paid NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    cash_change NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'CANCELLED')),
    sold_by VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: SALES_DETAILS (Detail Rincian Item Produk Terjual)
CREATE TABLE sales_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0), -- Harga jual aktif saat transaksi
    subtotal NUMERIC(14, 2) NOT NULL CHECK (subtotal >= 0),
    cogs_per_unit NUMERIC(12, 2) NOT NULL CHECK (cogs_per_unit >= 0), -- HPP BOM aktif saat transaksi
    total_cogs NUMERIC(14, 2) NOT NULL CHECK (total_cogs >= 0)
);

-- Table: EXPENSES (Pengeluaran Operasional Gerobak BP-08)
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expense_number VARCHAR(50) NOT NULL UNIQUE, -- e.g. EXP-20260811-001
    daily_operation_id UUID NOT NULL REFERENCES daily_operations(id) ON DELETE RESTRICT,
    category VARCHAR(30) NOT NULL CHECK (category IN ('ICE_CUBES', 'PARKING', 'CLEANING', 'LPG_GAS', 'GALLON_WATER', 'SUPPLIES', 'OTHER')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    paid_to VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: PREPARATION_BATCHES (Pembuatan Bahan Setengah Jadi BP-05)
CREATE TABLE preparation_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prep_number VARCHAR(50) NOT NULL UNIQUE, -- e.g. PRP-20260811-001
    daily_operation_id UUID NOT NULL REFERENCES daily_operations(id) ON DELETE RESTRICT,
    target_ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    yield_quantity NUMERIC(10, 3) NOT NULL CHECK (yield_quantity > 0),
    unit VARCHAR(20) NOT NULL,
    prepared_by VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table: PREPARATION_DETAILS (Bahan Dasar yang Dikonsumsi)
CREATE TABLE preparation_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prep_batch_id UUID NOT NULL REFERENCES preparation_batches(id) ON DELETE CASCADE,
    ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE RESTRICT,
    quantity_used NUMERIC(10, 3) NOT NULL CHECK (quantity_used > 0),
    unit VARCHAR(20) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 10. ATOMIC TRANSACTION RPC FUNCTION: fn_process_pos_sale
-- Automates:
-- 1. Inserts into sales and sales_details.
-- 2. Decrements ingredients stock based on active BOM recipe (Qty Sold * BOM Qty).
-- 3. Inserts immutable stock_movements records (movement_type = 'OUT_CONSUMPTION').
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_process_pos_sale(
    p_receipt_number VARCHAR,
    p_daily_operation_id UUID,
    p_subtotal NUMERIC,
    p_discount NUMERIC,
    p_tax NUMERIC,
    p_total_amount NUMERIC,
    p_payment_method VARCHAR,
    p_cash_paid NUMERIC,
    p_cash_change NUMERIC,
    p_sold_by VARCHAR,
    p_items JSONB -- Array of [{product_id, quantity, selling_price, cogs_per_unit}]
) RETURNS UUID AS $$
DECLARE
    v_sale_id UUID;
    v_item JSONB;
    v_product_id UUID;
    v_qty INT;
    v_price NUMERIC;
    v_cogs NUMERIC;
    v_bom_id UUID;
    v_bom_rec RECORD;
    v_curr_stock NUMERIC;
    v_next_stock NUMERIC;
BEGIN
    -- Step 1: Create Sales Header
    INSERT INTO sales (
        receipt_number, daily_operation_id, subtotal, discount, tax,
        total_amount, payment_method, cash_paid, cash_change, sold_by
    ) VALUES (
        p_receipt_number, p_daily_operation_id, p_subtotal, p_discount, p_tax,
        p_total_amount, p_payment_method, p_cash_paid, p_cash_change, p_sold_by
    ) RETURNING id INTO v_sale_id;

    -- Step 2: Loop through sold items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_product_id := (v_item->>'product_id')::UUID;
        v_qty := (v_item->>'quantity')::INT;
        v_price := (v_item->>'selling_price')::NUMERIC;
        v_cogs := (v_item->>'cogs_per_unit')::NUMERIC;

        -- Insert Sales Detail
        INSERT INTO sales_details (
            sale_id, product_id, quantity, selling_price, subtotal, cogs_per_unit, total_cogs
        ) VALUES (
            v_sale_id, v_product_id, v_qty, v_price, (v_qty * v_price), v_cogs, (v_qty * v_cogs)
        );

        -- Fetch ACTIVE BOM for this product
        SELECT id INTO v_bom_id FROM boms WHERE product_id = v_product_id AND status = 'ACTIVE' LIMIT 1;

        IF v_bom_id IS NOT NULL THEN
            -- Deduct ingredients based on BOM recipe
            FOR v_bom_rec IN SELECT ingredient_id, quantity, unit FROM bom_details WHERE bom_id = v_bom_id
            LOOP
                -- Get current ingredient stock
                SELECT current_stock INTO v_curr_stock FROM ingredients WHERE id = v_bom_rec.ingredient_id FOR UPDATE;

                v_next_stock := GREATEST(0, v_curr_stock - (v_bom_rec.quantity * v_qty));

                -- Update ingredient stock
                UPDATE ingredients
                SET current_stock = v_next_stock, updated_at = CURRENT_TIMESTAMP
                WHERE id = v_bom_rec.ingredient_id;

                -- Record Stock Movement Audit Trail
                INSERT INTO stock_movements (
                    ingredient_id, movement_type, quantity, unit, previous_stock, current_stock, reference_id, notes
                ) VALUES (
                    v_bom_rec.ingredient_id,
                    'OUT_CONSUMPTION',
                    -(v_bom_rec.quantity * v_qty),
                    v_bom_rec.unit,
                    v_curr_stock,
                    v_next_stock,
                    p_receipt_number,
                    'Otomatis Konsumsi BOM Penjualan POS Kasir'
                );
            END LOOP;
        END IF;
    END LOOP;

    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 11. SUPABASE RLS POLICIES FOR PHASE 3
-- ----------------------------------------------------------------------------
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE preparation_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE preparation_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on sales" ON sales FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on sales_details" ON sales_details FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on preparation_batches" ON preparation_batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on preparation_details" ON preparation_details FOR ALL USING (true) WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 12. PHASE 4 VIEWS & DAILY CLOSING RPC (BP-09, BP-10, BP-11, BP-12)
-- ----------------------------------------------------------------------------

-- View: v_cash_reconciliation (BP-09 Cash Reconciliation)
CREATE OR REPLACE VIEW v_cash_reconciliation AS
SELECT 
    dop.id AS daily_operation_id,
    dop.date AS operation_date,
    dop.status AS operation_status,
    COALESCE(opc.amount, 0) AS opening_cash_float,
    COALESCE(sales_cash.total_cash_sales, 0) AS total_cash_sales,
    COALESCE(expenses_cash.total_cash_expenses, 0) AS total_cash_expenses,
    (COALESCE(opc.amount, 0) + COALESCE(sales_cash.total_cash_sales, 0) - COALESCE(expenses_cash.total_cash_expenses, 0)) AS expected_cash,
    dop.actual_cash,
    (COALESCE(dop.actual_cash, 0) - (COALESCE(opc.amount, 0) + COALESCE(sales_cash.total_cash_sales, 0) - COALESCE(expenses_cash.total_cash_expenses, 0))) AS cash_variance
FROM daily_operations dop
LEFT JOIN opening_cash opc ON opc.daily_operation_id = dop.id
LEFT JOIN (
    SELECT daily_operation_id, SUM(total_amount) AS total_cash_sales
    FROM sales
    WHERE payment_method = 'CASH' AND status = 'COMPLETED'
    GROUP BY daily_operation_id
) sales_cash ON sales_cash.daily_operation_id = dop.id
LEFT JOIN (
    SELECT daily_operation_id, SUM(amount) AS total_cash_expenses
    FROM expenses
    GROUP BY daily_operation_id
) expenses_cash ON expenses_cash.daily_operation_id = dop.id;

-- View: v_daily_pnl (BP-11 Financial Calculation & P&L Statement)
CREATE OR REPLACE VIEW v_daily_pnl AS
SELECT 
    dop.id AS daily_operation_id,
    dop.date AS operation_date,
    COALESCE(s.total_revenue, 0) AS total_revenue,
    COALESCE(s.total_cups_sold, 0) AS total_cups_sold,
    COALESCE(s.total_cogs, 0) AS total_cogs,
    (COALESCE(s.total_revenue, 0) - COALESCE(s.total_cogs, 0)) AS gross_profit,
    CASE 
        WHEN COALESCE(s.total_revenue, 0) > 0 
        THEN ROUND(((COALESCE(s.total_revenue, 0) - COALESCE(s.total_cogs, 0)) / s.total_revenue) * 100, 2)
        ELSE 0 
    END AS gross_margin_percentage,
    COALESCE(e.total_expenses, 0) AS operating_expenses,
    ((COALESCE(s.total_revenue, 0) - COALESCE(s.total_cogs, 0)) - COALESCE(e.total_expenses, 0)) AS net_operating_profit,
    CASE 
        WHEN COALESCE(s.total_revenue, 0) > 0 
        THEN ROUND((((COALESCE(s.total_revenue, 0) - COALESCE(s.total_cogs, 0)) - COALESCE(e.total_expenses, 0)) / s.total_revenue) * 100, 2)
        ELSE 0 
    END AS net_margin_percentage
FROM daily_operations dop
LEFT JOIN (
    SELECT 
        s.daily_operation_id,
        SUM(s.total_amount) AS total_revenue,
        SUM(sd.quantity) AS total_cups_sold,
        SUM(sd.total_cogs) AS total_cogs
    FROM sales s
    JOIN sales_details sd ON sd.sale_id = s.id
    WHERE s.status = 'COMPLETED'
    GROUP BY s.daily_operation_id
) s ON s.daily_operation_id = dop.id
LEFT JOIN (
    SELECT daily_operation_id, SUM(amount) AS total_expenses
    FROM expenses
    GROUP BY daily_operation_id
) e ON e.daily_operation_id = dop.id;

-- View: v_inventory_valuation (BP-12 Management Reporting - Inventory Valuation)
CREATE OR REPLACE VIEW v_inventory_valuation AS
SELECT 
    i.id AS ingredient_id,
    i.code,
    i.name,
    i.category,
    i.unit,
    i.current_stock,
    i.avg_cost AS weighted_avg_cost_idr,
    (i.current_stock * i.avg_cost) AS total_asset_valuation_idr,
    i.is_active
FROM ingredients i
ORDER BY total_asset_valuation_idr DESC;

-- RPC Function: fn_execute_daily_closing (BP-10 Daily Closing Atomic Lock)
CREATE OR REPLACE FUNCTION fn_execute_daily_closing(
    p_daily_operation_id UUID,
    p_actual_cash NUMERIC,
    p_closed_by VARCHAR,
    p_notes TEXT
) RETURNS JSONB AS $$
DECLARE
    v_expected_cash NUMERIC;
    v_variance NUMERIC;
    v_op_status VARCHAR;
BEGIN
    SELECT status INTO v_op_status FROM daily_operations WHERE id = p_daily_operation_id FOR UPDATE;
    
    IF v_op_status = 'CLOSED' THEN
        RAISE EXCEPTION 'Hari operasional ini sudah dikunci (Status: CLOSED).';
    END IF;

    -- Calculate expected cash
    SELECT expected_cash INTO v_expected_cash FROM v_cash_reconciliation WHERE daily_operation_id = p_daily_operation_id;
    v_variance := p_actual_cash - COALESCE(v_expected_cash, 0);

    -- Perform Lock and Update
    UPDATE daily_operations
    SET 
        status = 'CLOSED',
        closed_at = CURRENT_TIMESTAMP,
        closed_by = p_closed_by,
        actual_cash = p_actual_cash,
        cash_variance = v_variance,
        notes = p_notes
    WHERE id = p_daily_operation_id;

    RETURN jsonb_build_object(
        'status', 'SUCCESS',
        'daily_operation_id', p_daily_operation_id,
        'expected_cash', v_expected_cash,
        'actual_cash', p_actual_cash,
        'variance', v_variance,
        'closed_at', CURRENT_TIMESTAMP
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- END OF SUPABASE SQL SCRIPT
-- ============================================================================
`;
