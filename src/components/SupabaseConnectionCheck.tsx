import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Table, 
  Terminal, 
  Copy, 
  ExternalLink,
  Wifi,
  WifiOff,
  Code
} from 'lucide-react';
import { testSupabaseConnection, getSupabaseClient, SUPABASE_URL, isSupabaseConfigured, ConnectionTestResult } from '../utils/supabaseClient';

export interface SupabaseConnectionCheckProps {
  className?: string;
  autoCheck?: boolean;
}

export const SupabaseConnectionCheck: React.FC<SupabaseConnectionCheckProps> = ({ 
  className = '', 
  autoCheck = true 
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ConnectionTestResult | null>(null);
  const [sampleProducts, setSampleProducts] = useState<any[]>([]);
  const [copied, setCopied] = useState<boolean>(false);

  const runConnectionCheck = async () => {
    setLoading(true);
    setSampleProducts([]);
    
    try {
      // 1. Run primary connection & table existence test
      const testRes = await testSupabaseConnection();
      setResult(testRes);

      // 2. If connected & products table exists, try fetching up to 3 sample records
      if (testRes.success && testRes.details?.productsTableExists) {
        const client = getSupabaseClient();
        if (client) {
          const { data, error } = await client
            .from('products')
            .select('id, name, category, created_at')
            .limit(3);

          if (!error && data) {
            setSampleProducts(data);
          }
        }
      }
    } catch (err: any) {
      setResult({
        success: false,
        message: `Unhandled exception during connection test: ${err?.message || String(err)}`,
        details: {
          connected: false,
          productsTableExists: false,
          error: err?.message || String(err)
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoCheck) {
      runConnectionCheck();
    }
  }, [autoCheck]);

  const copySqlInstruction = () => {
    const sqlNotice = `DROP TABLE IF EXISTS products CASCADE;\nCREATE TABLE products (\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n  code VARCHAR(50) UNIQUE NOT NULL,\n  name VARCHAR(100) NOT NULL,\n  category VARCHAR(50) NOT NULL,\n  unit VARCHAR(20) NOT NULL DEFAULT 'pcs',\n  is_active BOOLEAN NOT NULL DEFAULT true,\n  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP\n);`;
    navigator.clipboard.writeText(sqlNotice);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isConfigured = isSupabaseConfigured();

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            !result 
              ? 'bg-slate-100 text-slate-600'
              : result.success
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
          }`}>
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <span>Supabase Connection & 'products' Table Diagnostic</span>
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-md">
              Target Endpoint: {SUPABASE_URL}
            </p>
          </div>
        </div>

        <button
          onClick={runConnectionCheck}
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>{loading ? 'Testing Connection...' : 'Test Connection'}</span>
        </button>
      </div>

      {/* Main Status Display */}
      {loading ? (
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Pinging Supabase & querying 'products' table...</p>
        </div>
      ) : result ? (
        <div className="space-y-4">
          {/* Status Alert Banner */}
          <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
            result.success
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : result.details?.connected
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            {result.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : result.details?.connected ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm">
                  {result.success 
                    ? 'Connected & Relation Exists!' 
                    : result.details?.connected 
                      ? 'Connected to Supabase (Relation "products" Missing)' 
                      : 'Connection Failed'}
                </p>
                <span className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full ${
                  result.success
                    ? 'bg-emerald-200 text-emerald-900'
                    : result.details?.connected
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-rose-200 text-rose-900'
                }`}>
                  {result.success ? 'Connected' : 'Error'}
                </span>
              </div>
              <p className="text-xs leading-relaxed">{result.message}</p>
            </div>
          </div>

          {/* Diagnostic Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
                {isConfigured ? <Wifi className="w-3.5 h-3.5 text-emerald-600" /> : <WifiOff className="w-3.5 h-3.5 text-rose-500" />}
                <span>Client Configuration</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">
                {isConfigured ? 'Valid Credentials' : 'Unconfigured / Invalid'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <span>PostgreSQL Ping</span>
              </div>
              <p className="font-bold text-slate-800 text-sm">
                {result.details?.connected ? 'Online (200 OK)' : 'Unreachable'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
                <Table className="w-3.5 h-3.5 text-purple-600" />
                <span>'products' Relation</span>
              </div>
              <p className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                <span>{result.details?.productsTableExists ? 'Table Found' : 'Missing (42P01)'}</span>
                {result.details?.productCount !== undefined && (
                  <span className="text-xs font-medium text-slate-500">({result.details.productCount} rows)</span>
                )}
              </p>
            </div>
          </div>

          {/* Sample fetched record if available */}
          {sampleProducts.length > 0 && (
            <div className="bg-slate-900 text-slate-100 rounded-xl p-4 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-400 font-sans border-b border-slate-800 pb-2">
                <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                  <Code className="w-4 h-4" /> Sample Record from public.products:
                </span>
                <span>{sampleProducts.length} record(s) fetched</span>
              </div>
              <pre className="overflow-x-auto text-[11px] text-slate-300 pt-1">
                {JSON.stringify(sampleProducts, null, 2)}
              </pre>
            </div>
          )}

          {/* Error troubleshooting guide if products table is missing */}
          {!result.success && !result.details?.productsTableExists && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Terminal className="w-4 h-4 text-amber-700" />
                  <span>How to fix relation "products" does not exist</span>
                </h4>
                <button
                  onClick={copySqlInstruction}
                  className="text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy SQL Table DDL'}</span>
                </button>
              </div>

              <ol className="text-xs text-amber-900 space-y-1.5 list-decimal list-inside font-medium leading-relaxed">
                <li>Buka Dashboard Supabase Anda: <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-amber-950 inline-flex items-center gap-0.5">Supabase Dashboard <ExternalLink className="w-3 h-3" /></a></li>
                <li>Pilih menu <b>SQL Editor</b> &rarr; <b>New Query</b>.</li>
                <li>Buka menu <b>SQL Schema Explorer</b> di aplikasi ini, klik <b>Copy SQL Script DDL</b>, lalu jalankan di Supabase.</li>
                <li>Pastikan seluruh teks dieksekusi tanpa ada teks yang ter-highlight (tombol bertuliskan <b>"Run"</b>).</li>
              </ol>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-xs text-slate-500">
          Klik "Test Connection" untuk memeriksa koneksi Supabase & keberadaan tabel 'products'.
        </div>
      )}
    </div>
  );
};

export default SupabaseConnectionCheck;
