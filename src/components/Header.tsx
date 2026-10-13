import React, { useState } from 'react';
import { Printer, HeartPulse, FileDown, FileText, ChevronDown, Loader2, FolderClock } from 'lucide-react';

interface HeaderProps {
  onPrintClick: () => void;
  onDownloadPdf: () => void;
  onDownloadWord: () => void;
  isDownloadingPdf?: boolean;
  activeTab: 'editor' | 'matrix' | 'printPreview' | 'history';
  setActiveTab: (tab: 'editor' | 'matrix' | 'printPreview' | 'history') => void;
  historyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onPrintClick,
  onDownloadPdf,
  onDownloadWord,
  isDownloadingPdf = false,
  activeTab,
  setActiveTab,
  historyCount = 0,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <HeartPulse className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
                SISKOHATKES EKG 1448H/2027M
              </span>
              <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap block">
                Standar KMHU No. 82 Tahun 2026 • RSUD Pesanggrahan
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'editor'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Lembar Evaluasi & Interpretasi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Matriks Alur Siskohatkes (Hal 2)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('printPreview')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'printPreview'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Pratinjau Folio F4 (2 Halaman)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <FolderClock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Riwayat Jemaah</span>
              {historyCount > 0 && (
                <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'history' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Export & Print Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Direct PDF Download Button (Folio F4) */}
            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={isDownloadingPdf}
              title="Unduh langsung file PDF resmi 2 halaman ukuran Folio / F4"
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-xs whitespace-nowrap ${
                isDownloadingPdf
                  ? 'bg-emerald-800 cursor-not-allowed opacity-90'
                  : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Merender F4...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Unduh PDF (F4)</span>
                </>
              )}
            </button>

            {/* Direct Word (.doc) Download Button */}
            <button
              type="button"
              onClick={onDownloadWord}
              title="Unduh lembar formulir Folio F4 dalam format Microsoft Word (.doc) yang dapat diedit"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Unduh Word (.doc)</span>
            </button>

            {/* Additional Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                title="Pilihan Cetak Folio F4 & Opsi Lainnya"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs"
                  onClick={() => setDropdownOpen(false)}
                >
                  <button
                    type="button"
                    onClick={onDownloadPdf}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-800"
                  >
                    <FileDown className="w-4 h-4 text-emerald-600" />
                    <span>Unduh PDF Folio (F4)</span>
                  </button>
                  <button
                    type="button"
                    onClick={onDownloadWord}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-800"
                  >
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Unduh Dokumen Word (.doc)</span>
                  </button>
                  <button
                    type="button"
                    onClick={onPrintClick}
                    className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-800 border-t border-slate-100"
                  >
                    <Printer className="w-4 h-4 text-slate-500" />
                    <span>Cetak Printer (Print Dialog)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
