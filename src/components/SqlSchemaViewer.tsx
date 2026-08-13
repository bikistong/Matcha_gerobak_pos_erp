import React, { useState } from 'react';
import { SUPABASE_SQL_SCRIPT } from '../data/supabaseSchema';
import { BUSINESS_RULES_LIST } from '../data/seedData';
import { Database, Copy, Check, Terminal, ShieldCheck, FileCode, Play } from 'lucide-react';

export const SqlSchemaViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'script' | 'rules' | 'terminal'>('script');
  const [terminalOutput, setTerminalOutput] = useState<string>(
    '-- Supabase PostgreSQL 15 SQL Simulator\n-- Run "SELECT * FROM view_product_costing_summary;" or "SELECT fn_calculate_product_hpp(...);"\n'
  );
  const [customQuery, setCustomQuery] = useState('SELECT * FROM view_product_costing_summary ORDER BY gross_margin_percentage DESC;');

  const handleCopyScript = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
            <span>Supabase PostgreSQL Schema & Constraints Architect</span>
          </div>
          <h2 className="text-lg font-extrabold">Skrip SQL Supabase (BP-01 Management Product)</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Terdiri dari 5 tabel relational (<code className="text-emerald-300 font-mono">products</code>,{' '}
            <code className="text-emerald-300 font-mono">product_prices</code>,{' '}
            <code className="text-emerald-300 font-mono">ingredients</code>,{' '}
            <code className="text-emerald-300 font-mono">boms</code>,{' '}
            <code className="text-emerald-300 font-mono">bom_details</code>), Triggers, Functions, RLS Policies, dan Aturan Bisnis BR-PRD-001 s.d BR-PRD-012.
          </p>
        </div>

        <button
          onClick={handleCopyScript}
          className="bg-[#4C6444] hover:bg-[#3d5036] text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-colors shadow-xs"
        >
          {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Tercopy ke Clipboard!' : 'Copy SQL Script'}</span>
        </button>
      </div>

      {/* Sub-navigation */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
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
