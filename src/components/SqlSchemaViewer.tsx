import React, { useState } from 'react';
import { SUPABASE_SQL_SCRIPT } from '../data/supabaseSchema';
import { BUSINESS_RULES_LIST } from '../data/seedData';
import { Database, Copy, Check, Terminal, ShieldCheck, FileCode, Play, Wifi, WifiOff, RefreshCw, KeyRound } from 'lucide-react';
import { SupabaseService } from '../lib/supabaseService';
import { SupabaseConnectionCheck } from './SupabaseConnectionCheck';

export const SqlSchemaViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'script' | 'rules' | 'terminal' | 'connection'>('connection');
  const [connectionState, setConnectionState] = useState<{ testing: boolean; result: { success: boolean; message: string } | null }>({
    testing: false,
    result: null
  });
  const [terminalOutput, setTerminalOutput] = useState<string>(
    '-- Supabase PostgreSQL 15 SQL Simulator\n-- Run "SELECT * FROM view_product_costing_summary;" or "SELECT fn_calculate_product_hpp(...);"\n'
  );
  const [customQuery, setCustomQuery] = useState('SELECT * FROM view_product_costing_summary ORDER BY gross_margin_percentage DESC;');

  const handleCopyScript = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleTestConnection = async () => {
    setConnectionState({ testing: true, result: null });
    const res = await SupabaseService.testConnection();
    setConnectionState({ testing: false, result: res });
  };

  const handleRunSimulatorQuery = () => {
    setTerminalOutput(
      `Executing Query: \n${customQuery}\n\n` +
      `------------------------------------------------------------------------------------------------------------------\n` +
      `product_code | product_name                     | selling_price | theoretical_hpp | gross_margin_nom | margin_pct |\n` +
      `------------------------------------------------------------------------------------------------------------------\n` +
      `PRD-MTC-004  | Oat Milk Matcha Supreme 16oz     | Rp 28.000,00  | Rp 14.305,00    | Rp 13.695,00     | 48.91%     |\n` +
      `PRD-MTC-003  | Matcha Cheese Foam Float         | Rp 25.000,00  | Rp 10.760,00    | Rp 14.240,00     | 56.96%     |\n` +
      `PRD-MTC-002  | Pure Ceremonial Ice Matcha       | Rp 20.000,00  | Rp  7.060,00    | Rp 12.940,00     | 64.70%     |\n` +
      `PRD-MTC-001  | Signature Uji Matcha Latte 16oz  | Rp 22.000,00  | Rp  8.365,00    | Rp 13.635,00     | 61.98%     |\n` +
      `------------------------------------------------------------------------------------------------------------------\n` +
      `(4 rows returned in 12ms. All constraints BR-PRD-001..012 satisfied.)`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold uppercase mb-1">
            <Database className="w-4 h-4" />
            <span>Supabase PostgreSQL Schema & Integration Engine</span>
          </div>
          <h2 className="text-lg font-extrabold">Integrasi Database Supabase Real-time</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Terdiri dari SDK <code className="text-emerald-300 font-mono">@supabase/supabase-js</code>, tabel-tabel relational (<code className="text-emerald-300 font-mono">products</code>,{' '}
            <code className="text-emerald-300 font-mono">ingredients</code>, <code className="text-emerald-300 font-mono">sales_transactions</code>, <code className="text-emerald-300 font-mono">daily_operations</code>), Triggers, Functions, dan RLS Policies.
          </p>
        </div>

        <button
          onClick={handleCopyScript}
          className="bg-[#4C6444] hover:bg-[#3d5036] text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-colors shadow-xs"
        >
          {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Tercopy ke Clipboard!' : 'Copy SQL Script DDL'}</span>
        </button>
      </div>

      {/* Sub-navigation */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('connection')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 ${
            activeSubTab === 'connection'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Wifi className="w-4 h-4" />
          <span>Status Live Supabase</span>
        </button>

        <button
          onClick={() => setActiveSubTab('script')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 ${
            activeSubTab === 'script'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Skrip SQL DDL Lengkap</span>
        </button>

        <button
          onClick={() => setActiveSubTab('rules')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 ${
            activeSubTab === 'rules'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Matriks Business Rules (BR-PRD)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('terminal')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center space-x-2 ${
            activeSubTab === 'terminal'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Terminal className="w-4 h-4 text-teal-400" />
          <span>SQL Query Simulator</span>
        </button>
      </div>

      {/* SUB-TAB 0: LIVE SUPABASE CONNECTION STATUS */}
      {activeSubTab === 'connection' && (
        <div className="space-y-6">
          <SupabaseConnectionCheck />

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            {/* Instructions Step-by-Step */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">Langkah Integrasi Supabase:</h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#4C6444] text-white flex items-center justify-center font-bold text-xs">1</div>
                  <h5 className="font-bold text-slate-900 text-sm">Salin SQL DDL Schema</h5>
                  <p className="text-xs text-slate-600">Klik tombol <b>"Copy SQL Script DDL"</b> di atas, lalu buka SQL Editor di Dashboard Supabase Anda dan jalankan (*Run*).</p>
                  <div className="text-[11px] bg-amber-50 text-amber-900 p-2 rounded-lg border border-amber-200 mt-1 font-medium">
                    ⚠️ <b>Penting:</b> Jangan highlight/blok teks tertentu. Pastikan tombol di Supabase bertuliskan <b>"Run"</b> (bukan <i>"Run selected"</i>).
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#4C6444] text-white flex items-center justify-center font-bold text-xs">2</div>
                  <h5 className="font-bold text-slate-900 text-sm">Ambil API Credentials</h5>
                  <p className="text-xs text-slate-600">Buka menu <b>Project Settings &gt; API</b> di Supabase, lalu dapatkan <b>Project URL</b> dan <b>anon public key</b>.</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#4C6444] text-white flex items-center justify-center font-bold text-xs">3</div>
                  <h5 className="font-bold text-slate-900 text-sm">Isi Environment Variables</h5>
                  <p className="text-xs text-slate-600">Tambahkan variabel berikut ke <code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-[11px]">.env</code> / Settings AI Studio:</p>
                </div>
              </div>

              <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-slate-400 font-sans text-xs border-b border-slate-800 pb-2">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span>Format Variabel Lingkungan Supabase (.env)</span>
                </div>
                <pre className="text-xs overflow-x-auto leading-relaxed select-all">
{`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* SUB-TAB 1: COMPLETE SQL DDL CODE */}
      {activeSubTab === 'script' && (
        <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>supabase_schema_matcha_gerobak.sql</span>
            <span>PostgreSQL 15+ / Supabase Compatible</span>
          </div>
          <pre className="p-5 text-xs text-emerald-400 font-mono overflow-x-auto max-h-[600px] leading-relaxed select-all">
            {SUPABASE_SQL_SCRIPT}
          </pre>
        </div>
      )}

      {/* SUB-TAB 2: BUSINESS RULES MATRIX */}
      {activeSubTab === 'rules' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BUSINESS_RULES_LIST.map(br => (
            <div key={br.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                    {br.code}
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded font-semibold">
                    {br.category}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-2">{br.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{br.description}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">PostgreSQL Implementation:</p>
                <code className="block bg-slate-900 text-teal-300 text-[11px] font-mono p-2 rounded border border-slate-800 overflow-x-auto">
                  {br.sqlConstraint}
                </code>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUB-TAB 3: TERMINAL SIMULATOR */}
      {activeSubTab === 'terminal' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <label className="block text-xs font-bold text-slate-700">Tuliskan Query SQL Supabase untuk Diuji:</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customQuery}
                onChange={e => setCustomQuery(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-900 text-emerald-400 border border-slate-800 rounded-lg focus:outline-hidden"
              />
              <button
                onClick={handleRunSimulatorQuery}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute SQL</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl p-5 border border-slate-800 overflow-x-auto shadow-xl">
            <pre className="whitespace-pre-wrap">{terminalOutput}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
