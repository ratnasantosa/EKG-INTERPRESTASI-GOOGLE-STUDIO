import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PatientForm } from './components/PatientForm';
import { EkgUploader } from './components/EkgUploader';
import { ParameterEditor } from './components/ParameterEditor';
import { KategorisasiSection } from './components/KategorisasiSection';
import { MatriksAlurTable } from './components/MatriksAlurTable';
import { OfficialPrintDocument } from './components/OfficialPrintDocument';
import { HistoryList } from './components/HistoryList';
import { SAMPLE_PRESETS, EkgSamplePreset } from './data/samples';
import { PatientIdentity, ParameterKlinis, KategorisasiSiskohat, KesimpulanDokter, EkgHistoryItem } from './types/ekg';
import { downloadPdfDocument, downloadWordDocument } from './utils/exportDocuments';
import { getEkgHistory, saveEkgToHistory, deleteEkgHistoryItem, clearAllEkgHistory } from './utils/historyStorage';
import { Printer, Download, Sparkles, AlertCircle, CheckCircle, FileText, FileDown, Loader2, ArrowLeft, Save, FolderClock } from 'lucide-react';

export default function App() {
  // Preset default
  const defaultPreset = SAMPLE_PRESETS[0];

  const [activeTab, setActiveTab] = useState<'editor' | 'matrix' | 'printPreview' | 'history'>('editor');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(defaultPreset.id);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [patient, setPatient] = useState<PatientIdentity>(defaultPreset.patient);
  const [parameters, setParameters] = useState<ParameterKlinis>(defaultPreset.parameter);
  const [kategorisasi, setKategorisasi] = useState<KategorisasiSiskohat>(defaultPreset.kategorisasi);
  const [kesimpulan, setKesimpulan] = useState<KesimpulanDokter>(defaultPreset.kesimpulan);

  // History state from localStorage
  const [history, setHistory] = useState<EkgHistoryItem[]>([]);

  // Current working history record ID if loaded from history
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load history on mount
  useEffect(() => {
    try {
      const stored = getEkgHistory();
      setHistory(stored);
    } catch (err) {
      console.error('Failed to load initial history:', err);
    }
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load a preset
  const handleSelectPreset = (preset: EkgSamplePreset) => {
    setSelectedPresetId(preset.id);
    setCurrentHistoryId(null);
    setPatient(preset.patient);
    setParameters(preset.parameter);
    setKategorisasi(preset.kategorisasi);
    setKesimpulan(preset.kesimpulan);
    setToastMessage({
      text: `Sampel klinis dimuat: ${preset.title} (${preset.categoryBadge})`,
      type: 'info',
    });
  };

  // Automated re-evaluation logic when doctor edits parameters manually
  const handleParametersChange = (updated: ParameterKlinis) => {
    setParameters(updated);

    // Evaluate category according to KMHU 82/2026:
    // Check Category C conditions first (TMS):
    const isAfib = updated.irama === 'atrial_fibrilasi_flutter';
    const isAvBlock2_3 = updated.gelombangP_PR === 'av_block_2' || updated.gelombangP_PR === 'av_block_3';
    const isInfark = updated.segmenST_T === 'st_elevasi_q_patologis';

    if (isAfib || isAvBlock2_3 || isInfark) {
      setKategorisasi({
        ...kategorisasi,
        kategori: 'KATEGORI_C',
        rekomendasiStatusIstithaah: 'Tidak Memenuhi Syarat (TMS) Istithaah Kesehatan',
        modulInput: 'Modul 8 & Berita Acara',
        tindakLanjutMedis: 'Evaluasi komprehensif tim medis & Satgas Istithaah Kesehatan.',
        tindakLanjutSiskohatkes: 'Input diagnosa spesialis di Modul 8 & Berita Acara sebagai dasar penetapan status TMS Istithaah.',
        kodeICD10: isAfib ? 'I48' : isAvBlock2_3 ? 'I44.1 / I44.2' : 'I21',
        centangC: {
          atriumFibrilasiFlutter: isAfib,
          avBlockSt2_3: isAvBlock2_3,
          infarkMiokardAkut: isInfark,
          lvefDibawah40: kategorisasi.centangC.lvefDibawah40,
        },
      });
      return;
    }

    // Check Category B conditions (Abnormal / Rujukan):
    const isIskemik = updated.segmenST_T === 'st_depresi_t_inverted';
    const isLVH = updated.hipertrofi === 'lvh';
    const isAvBlock1 = updated.gelombangP_PR === 'av_block_1';
    const isTakikardia = updated.lajuDenyutKategori === 'takikardia' || (typeof updated.lajuDenyutBpm === 'number' && updated.lajuDenyutBpm > 100);

    if (isIskemik || isLVH || isAvBlock1 || isTakikardia) {
      setKategorisasi({
        ...kategorisasi,
        kategori: 'KATEGORI_B',
        rekomendasiStatusIstithaah: isTakikardia
          ? 'TMS Sementara sampai kadar TSH & HR terkontrol'
          : 'Memenuhi Syarat dengan Pendampingan (jika stabil)',
        modulInput: isTakikardia ? 'Modul 3 & 4' : 'Modul 4 & 9',
        tindakLanjutMedis: isTakikardia
          ? 'Rujuk Spesialis Penyakit Dalam / Jantung & Pemeriksaan Lab TSH.'
          : 'Rujuk Spesialis Jantung (EKG lanjutan/Ekokardiografi LVEF).',
        tindakLanjutSiskohatkes: 'Input hasil rujukan spesialis, nilai LVEF (%), kadar TSH, dan obat pada Modul 4 & 9 Siskohatkes.',
        kodeICD10: isIskemik ? 'I25.9' : isLVH ? 'I51.7' : isTakikardia ? 'R00.0' : 'I44.0',
        centangB: {
          suspekIskemik: isIskemik,
          kardiomegaliLVH: isLVH,
          avBlockSt1: isAvBlock1,
          takikardia: isTakikardia,
        },
      });
      return;
    }

    // Default: Kategori A (Normal)
    setKategorisasi({
      ...kategorisasi,
      kategori: 'KATEGORI_A',
      rekomendasiStatusIstithaah: 'Memenuhi Syarat Istithaah Kesehatan',
      modulInput: 'Modul 3',
      tindakLanjutMedis: 'Tidak memerlukan rujukan lanjutan.',
      tindakLanjutSiskohatkes: 'Langsung simpan dan lanjut ke Modul 3 Siskohatkes (unggah berkas EKG maks. 500 KB).',
      kodeICD10: 'Z00.00',
      centangB: {
        suspekIskemik: false,
        kardiomegaliLVH: false,
        avBlockSt1: false,
        takikardia: false,
      },
      centangC: {
        atriumFibrilasiFlutter: false,
        avBlockSt2_3: false,
        infarkMiokardAkut: false,
        lvefDibawah40: false,
      },
    });
  };

  // Call Gemini multimodal vision API
  const handleAnalyzeEkg = async (imageBase64: string, mimeType: string) => {
    setIsAnalyzing(true);
    setToastMessage({
      text: 'Membaca citra lead EKG dengan model Gemini 3.8 Flash...',
      type: 'info',
    });

    try {
      const response = await fetch('/api/gemini/analyze-ekg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          patientData: {
            nama: patient.nama,
            umur: patient.umur,
            jenisKelamin: patient.jenisKelamin,
            nomorPorsi: patient.nomorPorsi,
          },
        }),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData.error || 'Gagal menganalisis citra EKG.');
      }

      const aiData = resData.data;

      // Map AI parameters
      const mappedParams: ParameterKlinis = {
        irama: aiData.irama?.status || 'sinus_rhythm',
        aritmiaLainnyaText: aiData.irama?.aritmiaDetail || '',
        lajuDenyutBpm: aiData.lajuDenyut?.bpm || 75,
        lajuDenyutKategori: aiData.lajuDenyut?.kategori || 'normal',
        aksis: aiData.aksis?.tipe || 'normal',
        gelombangP_PR: aiData.gelombangP_PR?.status || 'normal',
        durasiQRS: aiData.qrs_konduksi?.status || 'normal',
        segmenST_T: aiData.st_t?.status || 'normal',
        hipertrofi: aiData.hipertrofi?.status || 'normal',
      };

      setParameters(mappedParams);

      // Map AI categorization
      const aiKat = aiData.kategorisasi;
      const targetCategory =
        aiKat?.kategori === 'KATEGORI_C'
          ? 'KATEGORI_C'
          : aiKat?.kategori === 'KATEGORI_B'
          ? 'KATEGORI_B'
          : 'KATEGORI_A';

      setKategorisasi({
        kategori: targetCategory,
        rekomendasiStatusIstithaah:
          aiKat?.rekomendasiStatusIstithaah ||
          (targetCategory === 'KATEGORI_A'
            ? 'Memenuhi Syarat Istithaah Kesehatan'
            : targetCategory === 'KATEGORI_B'
            ? 'Memenuhi Syarat dengan Pendampingan (jika stabil)'
            : 'Tidak Memenuhi Syarat (TMS) Istithaah Kesehatan'),
        tindakLanjutMedis: aiKat?.tindakLanjutMedis || 'Evaluasi klinis sesuai panduan KMHU 82/2026.',
        tindakLanjutSiskohatkes: aiKat?.tindakLanjutSiskohatkes || 'Simpan hasil ke modul Siskohatkes.',
        modulInput: aiKat?.modulSiskohatkes || (targetCategory === 'KATEGORI_C' ? 'Modul 8' : 'Modul 3'),
        kodeICD10: aiKat?.kodeICD10 || '',
        centangB: {
          suspekIskemik: !!aiKat?.centangTemuan?.suspekIskemik || mappedParams.segmenST_T === 'st_depresi_t_inverted',
          kardiomegaliLVH: !!aiKat?.centangTemuan?.kardiomegaliLVH || mappedParams.hipertrofi === 'lvh',
          avBlockSt1: !!aiKat?.centangTemuan?.avBlockSt1 || mappedParams.gelombangP_PR === 'av_block_1',
          takikardia: !!aiKat?.centangTemuan?.takikardia || mappedParams.lajuDenyutKategori === 'takikardia',
        },
        centangC: {
          atriumFibrilasiFlutter:
            !!aiKat?.centangTemuan?.atriumFibrilasiFlutter || mappedParams.irama === 'atrial_fibrilasi_flutter',
          avBlockSt2_3:
            !!aiKat?.centangTemuan?.avBlockSt2_3 ||
            mappedParams.gelombangP_PR === 'av_block_2' ||
            mappedParams.gelombangP_PR === 'av_block_3',
          infarkMiokardAkut:
            !!aiKat?.centangTemuan?.infarkMiokardAkut || mappedParams.segmenST_T === 'st_elevasi_q_patologis',
          lvefDibawah40: !!aiKat?.centangTemuan?.lvefDibawah40,
        },
      });

      // Update conclusions
      setKesimpulan({
        ...kesimpulan,
        kesimpulanDiagnostik:
          aiData.kesimpulanDiagnostik ||
          `${mappedParams.irama.replace('_', ' ').toUpperCase()}, Laju ${mappedParams.lajuDenyutBpm} bpm, Aksis ${mappedParams.aksis}.`,
        rencanaRujukan:
          aiData.rencanaRujukanTindakLanjut ||
          (targetCategory === 'KATEGORI_A'
            ? 'Tidak memerlukan rujukan lanjutan kardiologi.'
            : 'Rujuk Spesialis Jantung / Penyakit Dalam untuk pemeriksaan penunjang lanjutan.'),
      });

      setToastMessage({
        text: `Analisis Selesai! Ditentukan: ${targetCategory.replace('_', ' ')} (${aiKat?.rekomendasiStatusIstithaah || ''})`,
        type: 'success',
      });
    } catch (err: any) {
      console.error('Error analyzing ECG:', err);
      setToastMessage({
        text: err.message || 'Terjadi kesalahan saat memproses interpretasi EKG.',
        type: 'error',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Direct PDF Download Handler
  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      setToastMessage({
        text: 'Menyiapkan halaman formulir Folio (F4) untuk render PDF...',
        type: 'info',
      });

      // Always switch to printPreview tab so the element is rendered visibly on screen
      setActiveTab('printPreview');

      // Wait 350ms for React re-render and browser layout paint
      await new Promise((resolve) => setTimeout(resolve, 350));

      const element = document.getElementById('official-print-document');
      if (!element) {
        throw new Error('Elemen dokumen formulir tidak ditemukan di DOM.');
      }

      const cleanName = (patient.nomorPorsi || patient.nama || 'Jemaah').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Siskohatkes_EKG_${cleanName}_Folio_F4.pdf`;

      await downloadPdfDocument('official-print-document', fileName, (status) => {
        setToastMessage({ text: status, type: 'info' });
      });

      setToastMessage({
        text: `Berkas PDF Folio (F4) berhasil diunduh: ${fileName}`,
        type: 'success',
      });
    } catch (error: any) {
      console.error('PDF download error:', error);
      setToastMessage({
        text: `Gagal merender PDF otomatis: ${error.message || 'Terjadi kesalahan'}. Beralih ke dialog cetak browser...`,
        type: 'error',
      });
      // Fallback to window.print()
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Direct Word (.doc) Download Handler
  const handleDownloadWord = () => {
    try {
      const cleanName = (patient.nomorPorsi || patient.nama || 'Jemaah').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Siskohatkes_EKG_${cleanName}_Folio_F4.doc`;
      downloadWordDocument(patient, parameters, kategorisasi, kesimpulan, fileName);
      setToastMessage({
        text: `Berkas Word Folio (F4) berhasil diunduh: ${fileName}. Siap dibuka & diedit di Word / Docs!`,
        type: 'success',
      });
    } catch (error: any) {
      console.error('Word download error:', error);
      setToastMessage({
        text: 'Gagal mengunduh file Word.',
        type: 'error',
      });
    }
  };

  // Print trigger
  const handlePrint = () => {
    setActiveTab('printPreview');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // Manual Save to localStorage History Handler
  const handleSaveToHistory = () => {
    const res = saveEkgToHistory({
      id: currentHistoryId || undefined,
      patient,
      parameters,
      kategorisasi,
      kesimpulan,
      uploadedImage,
    });

    if (res.success) {
      setHistory(getEkgHistory());
      setCurrentHistoryId(res.item.id);
      setToastMessage({
        text: res.message,
        type: 'success',
      });
    } else {
      setToastMessage({
        text: res.message,
        type: 'error',
      });
    }
  };

  // Load a history item back to editor
  const handleLoadHistoryItem = (item: EkgHistoryItem) => {
    setCurrentHistoryId(item.id);
    setSelectedPresetId(null);
    setPatient({ ...item.patient });
    setParameters({ ...item.parameters });
    setKategorisasi({ ...item.kategorisasi });
    setKesimpulan({ ...item.kesimpulan });
    setUploadedImage(item.uploadedImage || null);
    setActiveTab('editor');
    setToastMessage({
      text: `Data riwayat jemaah ${item.patient.nama || 'Jemaah'} berhasil dimuat ke formulir editor.`,
      type: 'success',
    });
  };

  // Delete history item
  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteEkgHistoryItem(id);
    setHistory(updated);
    if (currentHistoryId === id) {
      setCurrentHistoryId(null);
    }
    setToastMessage({
      text: 'Catatan pemeriksaan berhasil dihapus dari riwayat lokal.',
      type: 'info',
    });
  };

  // Clear all history
  const handleClearAllHistory = () => {
    clearAllEkgHistory();
    setHistory([]);
    setCurrentHistoryId(null);
    setToastMessage({
      text: 'Seluruh riwayat pemeriksaan lokal telah dibersihkan.',
      type: 'info',
    });
  };

  // Download Word for a specific history item
  const handleDownloadWordHistoryItem = (item: EkgHistoryItem) => {
    try {
      const cleanName = (item.patient.nomorPorsi || item.patient.nama || 'Jemaah').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Siskohatkes_EKG_${cleanName}_Folio_F4.doc`;
      downloadWordDocument(item.patient, item.parameters, item.kategorisasi, item.kesimpulan, fileName);
      setToastMessage({
        text: `Berkas Word Folio (F4) jemaah ${item.patient.nama || ''} berhasil diunduh.`,
        type: 'success',
      });
    } catch (err: any) {
      console.error('Word export error:', err);
      setToastMessage({
        text: 'Gagal mengunduh berkas Word.',
        type: 'error',
      });
    }
  };

  // Export JSON for Siskohatkes API / Database integration
  const handleExportJSON = () => {
    const exportData = {
      meta: {
        standard: 'KMHU NO. 82 TAHUN 2026',
        faskes: patient.faskesName || 'RSUD PESANGGRAHAN',
        hajiYear: '1448H/2027M',
        generatedAt: new Date().toISOString(),
      },
      patient,
      parameters,
      kategorisasi,
      kesimpulan,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Siskohatkes_EKG_${patient.nomorPorsi || 'Jemaah'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 selection:bg-emerald-500 selection:text-white pb-16">
      {/* Top Navbar */}
      <Header
        onPrintClick={handlePrint}
        onDownloadPdf={handleDownloadPdf}
        onDownloadWord={handleDownloadWord}
        isDownloadingPdf={isDownloadingPdf}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 print:hidden animate-fade-in max-w-md">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-lg border text-xs font-semibold ${
              toastMessage.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Banner Status Indicator Strip */}
        <div className="mb-6 p-4 rounded-lg bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-extrabold uppercase px-3 py-1 rounded-md tracking-wider ${
                kategorisasi.kategori === 'KATEGORI_A'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : kategorisasi.kategori === 'KATEGORI_B'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-rose-100 text-rose-900 border border-rose-300'
              }`}
            >
              {kategorisasi.kategori.replace('_', ' ')}
            </span>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Rekomendasi Siskohatkes: {kategorisasi.rekomendasiStatusIstithaah}
              </div>
              <div className="text-[11px] text-slate-500">
                Alur Modul: {kategorisasi.modulInput} • Kode ICD-10: {kategorisasi.kodeICD10 || 'Z00.00'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Simpan ke Riwayat Lokal */}
            <button
              type="button"
              onClick={handleSaveToHistory}
              title="Simpan hasil interpretasi dan data jemaah ini ke riwayat lokal perangkat"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan ke Riwayat</span>
            </button>

            {/* Akses Tab Riwayat */}
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              title="Buka daftar riwayat pemeriksaan jemaah yang tersimpan"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <FolderClock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Riwayat ({history.length})</span>
            </button>

            {/* Direct PDF Download */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors shadow-xs ${
                isDownloadingPdf
                  ? 'bg-emerald-800 cursor-not-allowed opacity-90'
                  : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Merender PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Simpan PDF</span>
                </>
              )}
            </button>

            {/* Direct Word (.doc) Download */}
            <button
              type="button"
              onClick={handleDownloadWord}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Unduh Word (.doc)</span>
            </button>

            {/* JSON Metadata */}
            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>JSON Data</span>
            </button>

            {/* Browser Print / Printer Dialog */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Printer</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: Main Editor & Interpretasi */}
        {activeTab === 'editor' && (
          <div className="space-y-6 print:hidden">
            {/* Section I: Identitas Calon Jemaah */}
            <PatientForm patient={patient} onChange={setPatient} />

            {/* Uploader, Camera & 12-Lead Canvas Visualizer */}
            <EkgUploader
              onAnalyze={handleAnalyzeEkg}
              onSelectPreset={handleSelectPreset}
              selectedPresetId={selectedPresetId}
              isAnalyzing={isAnalyzing}
              uploadedImage={uploadedImage}
              setUploadedImage={setUploadedImage}
              currentHeartRate={typeof parameters.lajuDenyutBpm === 'number' ? parameters.lajuDenyutBpm : 75}
            />

            {/* Section II: 7 Parameter Klinis EKG Table */}
            <ParameterEditor parameters={parameters} onChange={handleParametersChange} />

            {/* Section III & IV: Kategorisasi Siskohat & Pengesahan Dokter */}
            <KategorisasiSection
              kategorisasi={kategorisasi}
              kesimpulan={kesimpulan}
              onKategorisasiChange={setKategorisasi}
              onKesimpulanChange={setKesimpulan}
            />
          </div>
        )}

        {/* VIEW 2: Matriks Alur Siskohatkes (Page 2) */}
        {activeTab === 'matrix' && (
          <div className="print:hidden">
            <MatriksAlurTable parameters={parameters} kategorisasi={kategorisasi} />
          </div>
        )}

        {/* VIEW 3: Print Preview (Formulir Resmi 2 Halaman) */}
        {activeTab === 'printPreview' && (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950 print:hidden">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-white hover:bg-slate-100 border border-slate-300 font-semibold text-slate-700 transition-colors mr-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Editor</span>
                </button>
                <span>
                  <strong>Pratinjau Formulir Resmi Folio (F4) 2 Halaman:</strong> Standar KMHU No. 82 Tahun 2026 & RSUD Pesanggrahan (Ukuran Kertas 215 x 330 mm).
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs"
                >
                  {isDownloadingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileDown className="w-4 h-4" />
                  )}
                  <span>{isDownloadingPdf ? 'Merender F4...' : 'Unduh Berkas PDF (Folio F4)'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadWord}
                  className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>Unduh Berkas Word (Folio F4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Kirim ke Printer</span>
                </button>
              </div>
            </div>

            {/* The printable document view */}
            <OfficialPrintDocument
              patient={patient}
              parameters={parameters}
              kategorisasi={kategorisasi}
              kesimpulan={kesimpulan}
            />
          </div>
        )}

        {/* VIEW 4: Riwayat Pemeriksaan Jemaah (Penyimpanan Lokal localStorage) */}
        {activeTab === 'history' && (
          <div className="print:hidden">
            <HistoryList
              history={history}
              onLoadItem={handleLoadHistoryItem}
              onDeleteItem={handleDeleteHistoryItem}
              onClearAll={handleClearAllHistory}
              onDownloadWordItem={handleDownloadWordHistoryItem}
              onGoToEditor={() => setActiveTab('editor')}
            />
          </div>
        )}

        {/* Dedicated print container for browser print dialog if user is on other tabs */}
        {activeTab !== 'printPreview' && (
          <div className="hidden print:block">
            <OfficialPrintDocument
              patient={patient}
              parameters={parameters}
              kategorisasi={kategorisasi}
              kesimpulan={kesimpulan}
            />
          </div>
        )}
      </main>
    </div>
  );
}
