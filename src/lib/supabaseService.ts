import { getSupabase, isSupabaseConfigured, testSupabaseConnection } from './supabase';
import { Product, Ingredient, Sale, Purchase, Expense, DailyOperation, OpeningCash, PrePackBatchItem } from '../types';

/**
 * Service module for loading and saving POS & ERP data directly from Supabase PostgreSQL.
 * If Supabase is not configured yet, it gracefully falls back to local data.
 */

export const SupabaseService = {
  // Check connection status
  isReady(): boolean {
    return isSupabaseConfigured();
  },

  // Test Supabase connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    const res = await testSupabaseConnection();
    return {
      success: res.success,
      message: res.message
    };
  },

  // 1. PRODUCTS
  async fetchProducts(): Promise<Product[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (error || !data) return null;

    return data.map((item: any) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      category: item.category,
      description: item.description,
      unit: item.unit || 'Cup',
      status: item.status,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  },

  async saveProduct(product: Product): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase.from('products').upsert({
      id: product.id,
      code: product.code,
      name: product.name,
      category: product.category,
      description: product.description,
      unit: product.unit,
      status: product.status,
      updated_at: new Date().toISOString()
    });

    return !error;
  },

  // 2. INGREDIENTS
  async fetchIngredients(): Promise<Ingredient[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase.from('ingredients').select('*').order('name');
    if (error || !data) return null;

    return data.map((item: any) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      category: item.category,
      unit: item.unit,
      avgCost: Number(item.avg_cost || item.avgCost || 0),
      minStock: Number(item.min_stock || 0),
      currentStock: Number(item.current_stock || 0),
      isActive: item.is_active ?? true,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));
  },

  async saveIngredient(ingredient: Ingredient): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase.from('ingredients').upsert({
      id: ingredient.id,
      code: ingredient.code,
      name: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      avg_cost: ingredient.avgCost,
      min_stock: ingredient.minStock,
      current_stock: ingredient.currentStock,
      is_active: ingredient.isActive,
      updated_at: new Date().toISOString()
    });

    return !error;
  },

  // 3. SALES TRANSACTIONS (POS)
  async saveSaleTransaction(sale: Sale): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase.from('sales').insert({
      id: sale.id,
      receipt_number: sale.receiptNumber,
      daily_operation_id: sale.dailyOperationId,
      subtotal: sale.subtotal,
      discount: sale.discount,
      tax: sale.tax,
      total_amount: sale.totalAmount,
      payment_method: sale.paymentMethod,
      cash_paid: sale.cashPaid,
      cash_change: sale.cashChange,
      status: sale.status,
      sold_by: sale.soldBy,
      notes: sale.notes,
      created_at: sale.createdAt
    });

    return !error;
  },

  // 4. DAILY OPERATIONS & SHIFT
  async saveDailyOperation(op: DailyOperation): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase.from('daily_operations').upsert({
      id: op.id,
      date: op.date,
      status: op.status,
      opened_at: op.openedAt,
      closed_at: op.closedAt,
      opened_by: op.openedBy,
      closed_by: op.closedBy,
      actual_cash: op.actualCash,
      cash_variance: op.cashVariance,
      closing_notes: op.closingNotes,
      notes: op.notes
    });

    return !error;
  },

  // 5. EXPENSES
  async saveExpense(expense: Expense): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { error } = await supabase.from('expenses').insert({
      id: expense.id,
      expense_number: expense.expenseNumber,
      daily_operation_id: expense.dailyOperationId,
      category: expense.category,
      amount: expense.amount,
      paid_to: expense.paidTo,
      notes: expense.notes,
      created_at: expense.createdAt
    });

    return !error;
  }
};
