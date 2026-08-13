import React from 'react';
import { Download, Wifi, WifiOff, CheckCircle2, ShieldCheck, Smartphone, Laptop, X, RefreshCw, HardDrive, Zap } from 'lucide-react';

interface PwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  swRegistered: boolean;
  onInstall: () => void;
}

export const PwaModal: React.FC<PwaModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  isInstallable,
  isInstalled,
  swRegistered,
  onInstall,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#4C6444] text-white p-5 flex items-start justify-between relative">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Download className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Install Aplikasi Kasir Matcha (PWA)</h3>
              <p className="text-xs text-emerald-100/90 mt-0.5">Mode Offline & Service Worker Perangkat Kasir</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Status Badges Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Online/Offline Status */}
            <div className={`p-3.5 rounded-xl border flex items-center space-x-3 ${
              isOnline 
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                : 'bg-amber-50/80 border-amber-200 text-amber-900'
            }`}>
              <div className={`p-2 rounded-lg ${isOnline ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider opacity-75">Koneksi Internet</p>
                <p className="text-xs font-bold">{isOnline ? 'Online (Terhubung)' : 'Offline (Mode Lokal)'}</p>
              </div>
            </div>

            {/* Service Worker Status */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center space-x-3 text-slate-800">
              <div className="p-2 rounded-lg bg-[#4C6444] text-white">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Service Worker</p>
                <p className="text-xs font-bold text-slate-900">
                  {swRegistered ? 'Aktif & Tersimpan' : 'Siap Diaktifkan'}
                </p>
              </div>
            </div>
          </div>

          {/* Explanation Box */}
          <div className="p-4 rounded-xl bg-[#4C6444]/5 border border-[#4C6444]/20 space-y-2">
            <div className="flex items-center space-x-2 text-[#4C6444] font-bold text-sm">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Sistem Kasir Tahan Sinyal Buruk</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Seluruh transaksi POS, kas buka/tutup, stok bahan, dan rekonsiliasi tersimpan aman di penyimpanan lokal browser kasir. Aplikasi tetap dapat beroperasi 100% tanpa gangguan meskipun sinyal internet di gerobak/outlet terputus.
            </p>
          </div>

          {/* Primary Action Button */}
          {isInstalled ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-800">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold">Aplikasi Sudah Terpasang di Perangkat Ini!</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Anda dapat membuka Matcha Gerobak langsung dari layar utama atau menu aplikasi tablet/kasir.
                </p>
              </div>
            </div>
          ) : isInstallable ? (
            <button
              onClick={onInstall}
              className="w-full bg-[#4C6444] hover:bg-[#3d5036] text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-md hover:shadow-lg transition-all active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Install Aplikasi Sekarang (Satu Klik)</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs text-center font-medium">
              Gunakan menu titik tiga browser atau petunjuk di bawah untuk memasang PWA.
            </div>
          )}

          {/* Manual Install Instructions */}
          {!isInstalled && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-800">Petunjuk Pemasangan Manual per Perangkat:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Android / Chrome */}
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Android / Chrome</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Buka menu browser (⋮) &rarr; pilih <b>"Install Aplikasi"</b> atau <b>"Tambahkan ke Layar Utama"</b>.
                  </p>
                </div>

                {/* Desktop Chrome / Edge */}
                <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                  <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                    <Laptop className="w-3.5 h-3.5 text-emerald-700" />
                    <span>PC / Laptop / Tablet</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Klik ikon download <b>⊕</b> di address bar kanan browser &rarr; pilih <b>"Install"</b>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center space-x-1">
            <HardDrive className="w-3.5 h-3.5 text-slate-400" />
            <span>Versi Offline: <b>v1.1 (Service Worker Active)</b></span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
