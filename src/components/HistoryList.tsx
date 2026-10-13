import React, { useState, useMemo } from 'react';
import { EkgHistoryItem, KategoriSiskohatType } from '../types/ekg';
import { 
  Search, 
  Trash2, 
  ArrowRightCircle, 
  FileText, 
  Calendar, 
  Clock, 
  User, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FolderClock, 
  RefreshCw,
  Sparkles,
  Download
} from 'lucide-react';

interface HistoryListProps {
  history: EkgHistoryItem[];
  onLoadItem: (item: EkgHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onDownloadWordItem: (item: EkgHistoryItem) => void;
  onGoToEditor: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onLoadItem,
  onDeleteItem,
  onClearAll,
  onDownloadWordItem,
  onGoToEditor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | KategoriSiskohatType>('ALL');

  // Stats
  const stats = useMemo(() => {
    const total = history.length;
    const catA = history.filter((h) => h.kategorisasi?.kategori === 'KATEGORI_A').length;
    const catB = history.filter((h) => h.kategorisasi?.kategori === 'KATEGORI_B').length;
    const catC = history.filter((h) => h.kategorisasi?.kategori === 'KATEGORI_C').length;
    return { total, catA, catB, catC };
  }, [history]);

  // Filtered Items
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      // Category filter
      if (filterCategory !== 'ALL' && item.kategorisasi?.kategori !== filterCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nama = (item.patient?.nama || '').toLowerCase();
        const porsi = (item.patient?.nomorPorsi || '').toLowerCase();
        const nik = (item.patient?.nik || '').toLowerCase();
        const rm = (item.patient?.noRM || '').toLowerCase();
        const diagnosa = (item.kesimpulan?.kesimpulanDiagnostik || '').toLowerCase();

        return (
          nama.includes(query) ||
          porsi.includes(query) ||
          nik.includes(query) ||
          rm.includes(query) ||
          diagnosa.includes(query)
        );
      }

      return true;
    });
  }, [history, filterCategory, searchQuery]);

  const formatSavedDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <FolderClock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Riwayat Hasil Interpretasi EKG Jemaah
              </h2>
              <p className="text-xs text-slate-500">
                Penyimpanan lokal perangkat (localStorage) • Tersedia {history.length} rekam data pemeriksaan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onGoToEditor}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <span>+ Pemeriksaan Baru</span>
            </button>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Apakah Anda yakin ingin menghapus SELURUH riwayat pemeriksaan EKG? Tindakan ini tidak dapat dibatalkan.')) {
                    onClearAll();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                title="Hapus seluruh data riwayat dari localStorage"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Semua</span>
              </button>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Pemeriksaan</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.total}</div>
          </div>
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
            <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Kategori A (Normal)</span>
            </div>
            <div className="text-xl font-extrabold text-emerald-900 mt-0.5">{stats.catA}</div>
          </div>
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg">
            <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Kategori B (Rujukan)</span>
            </div>
            <div className="text-xl font-extrabold text-amber-900 mt-0.5">{stats.catB}</div>
          </div>
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg">
            <div className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Kategori C (TMS)</span>
            </div>
            <div className="text-xl font-extrabold text-rose-900 mt-0.5">{stats.catC}</div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan Nama Jemaah, Nomor Porsi, NIK, No RM..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterCategory === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('KATEGORI_A')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterCategory === 'KATEGORI_A'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Kategori A ({stats.catA})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('KATEGORI_B')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterCategory === 'KATEGORI_B'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Kategori B ({stats.catB})
          </button>
          <button
            type="button"
            onClick={() => setFilterCategory('KATEGORI_C')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              filterCategory === 'KATEGORI_C'
                ? 'bg-rose-700 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Kategori C ({stats.catC})
          </button>
        </div>
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <FolderClock className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            {history.length === 0 ? 'Belum Ada Riwayat Pemeriksaan' : 'Tidak Ditemukan Hasil yang Cocok'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-relaxed">
            {history.length === 0
              ? 'Pemeriksaan EKG jemaah yang telah dianalisis atau disimpan akan tercatat di sini dan tersimpan otomatis di perangkat Anda.'
              : `Tidak ditemukan data jemaah dengan kata kunci "${searchQuery}" atau filter kategori yang dipilih.`}
          </p>
          {history.length === 0 ? (
            <button
              type="button"
              onClick={onGoToEditor}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Activity className="w-4 h-4" />
              <span>Buka Editor & Mulai Pemeriksaan EKG</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilterCategory('ALL');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Pencarian & Filter</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredHistory.map((item) => {
            const isCatA = item.kategorisasi?.kategori === 'KATEGORI_A';
            const isCatB = item.kategorisasi?.kategori === 'KATEGORI_B';
            const isCatC = item.kategorisasi?.kategori === 'KATEGORI_C';

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Main Identity & Clinical Info */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md tracking-wider ${
                        isCatA
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : isCatB
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}
                    >
                      {item.kategorisasi?.kategori?.replace('_', ' ') || 'KATEGORI A'}
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {item.kategorisasi?.rekomendasiStatusIstithaah || '-'}
                    </span>
                    <span className="text-[11px] text-slate-400">•</span>
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Disimpan: {formatSavedDate(item.savedAt)}</span>
                    </span>
                  </div>

                  {/* Patient Name & Details */}
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-base font-bold text-slate-900 tracking-tight">
                      {item.patient?.nama || 'Tanpa Nama Jemaah'}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      Porsi: <strong className="text-slate-800">{item.patient?.nomorPorsi || '-'}</strong>
                    </span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs font-mono text-slate-500">
                      NIK: {item.patient?.nik || '-'}
                    </span>
                    <span className="text-xs text-slate-400">|</span>
                    <span className="text-xs text-slate-600">
                      {item.patient?.umur ? `${item.patient.umur} Thn` : ''} ({item.patient?.jenisKelamin || '-'}) • {item.patient?.kategoriHaji || 'Reguler'}
                    </span>
                  </div>

                  {/* Clinical Conclusion Snippet */}
                  <div className="text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded border border-slate-200">
                    <div className="font-semibold text-slate-800 line-clamp-2">
                      <span className="text-slate-500 font-normal">Diagnostik EKG: </span>
                      {item.kesimpulan?.kesimpulanDiagnostik || 'Tidak ada catatan diagnostik.'}
                    </div>
                    {item.kesimpulan?.rencanaRujukan && (
                      <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        <span className="font-semibold text-slate-600">Rencana: </span>
                        {item.kesimpulan.rencanaRujukan}
                      </div>
                    )}
                  </div>

                  {/* Meta / Doctor / Parameters */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                    <span>
                      Tanggal EKG: <strong>{item.patient?.tanggalEkg || '-'}</strong> (Pukul {item.patient?.waktuEkg || '-'})
                    </span>
                    <span>•</span>
                    <span>
                      No. RM: <strong className="font-mono">{item.patient?.noRM || '-'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Dokter: <strong>{item.kesimpulan?.dokterNama || item.patient?.dokterNama || '-'}</strong>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {/* Primary CTA: Load into Editor */}
                  <button
                    type="button"
                    onClick={() => onLoadItem(item)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-xs"
                    title="Buka dan muat data jemaah ini ke formulir editor"
                  >
                    <ArrowRightCircle className="w-4 h-4" />
                    <span>Muat ke Editor</span>
                  </button>

                  <div className="flex items-center gap-1.5 w-full">
                    {/* Direct Word Export */}
                    <button
                      type="button"
                      onClick={() => onDownloadWordItem(item)}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
                      title="Unduh langsung berkas Word Folio F4 untuk jemaah ini"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Word (.doc)</span>
                    </button>

                    {/* Delete Item */}
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Hapus data riwayat pemeriksaan untuk ${item.patient?.nama || 'jemaah ini'}?`)) {
                          onDeleteItem(item.id);
                        }
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Hapus rekaman ini dari riwayat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
