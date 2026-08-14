import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase credentials from Vite environment variables with fallback
const env = (import.meta as any).env || {};
export const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://ykilzxypwxwarfflhyey.supabase.co';
export const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlraWx6eHlwd3h3YXJmZmxoeWV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MDczOTEsImV4cCI6MjEwMjE4MzM5MX0.LQHUj8OxJ7u2Sn_O6yWCzIfrglmcviR7Tmg6TfKtfdE';

export const isSupabaseConfigured = (): boolean => {
  return (
    typeof SUPABASE_URL === 'string' &&
    SUPABASE_URL.trim().length > 0 &&
    !SUPABASE_URL.includes('your-project-id') &&
    typeof SUPABASE_ANON_KEY === 'string' &&
    SUPABASE_ANON_KEY.trim().length > 0 &&
    !SUPABASE_ANON_KEY.includes('your-anon-key')
  );
};

let clientInstance: SupabaseClient | null = null;

/**
 * Returns the initialized Supabase client instance.
 * Uses lazy initialization to prevent startup crashes when keys are missing.
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return clientInstance;
};

export const supabaseClient = getSupabaseClient();

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: {
    connected: boolean;
    productsTableExists: boolean;
    productCount?: number;
    error?: string;
  };
}

/**
 * Test utility to verify connection to Supabase and check if the 'products' table exists.
 */
export const testSupabaseConnection = async (): Promise<ConnectionTestResult> => {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL & Anon Key belum dikonfigurasi di file .env',
      details: {
        connected: false,
        productsTableExists: false,
        error: 'Missing or placeholder credentials'
      }
    };
  }

  try {
    // Check connection and query 'products' table
    const { count, error } = await client
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (error) {
      // Check if error specifically indicates missing table (PostgreSQL 42P01)
      const isMissingTable =
        error.code === '42P01' ||
        error.message?.toLowerCase().includes('does not exist') ||
        error.message?.toLowerCase().includes('products');

      if (isMissingTable) {
        return {
          success: false,
          message: 'Koneksi ke Supabase berhasil, namun tabel "products" belum dibuat. Harap jalankan SQL DDL di Supabase SQL Editor.',
          details: {
            connected: true,
            productsTableExists: false,
            error: error.message
          }
        };
      }

      return {
        success: false,
        message: `Koneksi Supabase gagal: ${error.message}`,
        details: {
          connected: false,
          productsTableExists: false,
          error: error.message
        }
      };
    }

    return {
      success: true,
      message: `Koneksi Supabase berhasil! Tabel "products" ditemukan (Jumlah baris: ${count ?? 0}).`,
      details: {
        connected: true,
        productsTableExists: true,
        productCount: count ?? 0
      }
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Gagal melakukan ping ke Supabase: ${errorMsg}`,
      details: {
        connected: false,
        productsTableExists: false,
        error: errorMsg
      }
    };
  }
};
