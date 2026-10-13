import React from 'react';
import { Table, ShieldAlert, CheckCircle2, AlertCircle, FileCheck } from 'lucide-react';
import { ParameterKlinis, KategorisasiSiskohat } from '../types/ekg';

interface MatriksAlurTableProps {
  parameters?: ParameterKlinis;
  kategorisasi?: KategorisasiSiskohat;
}

export const MatriksAlurTable: React.FC<MatriksAlurTableProps> = ({
  parameters,
  kategorisasi,
}) => {
  // Determine which row matches the current findings for active highlighting
  const isNormalActive =
    parameters?.irama === 'sinus_rhythm' &&
    parameters?.lajuDenyutKategori === 'normal' &&
    parameters?.segmenST_T === 'normal' &&
    parameters?.gelombangP_PR === 'normal' &&
    parameters?.hipertrofi === 'normal';

  const isIskemikActive = parameters?.segmenST_T === 'st_depresi_t_inverted';
  const isKardiomegaliActive = parameters?.hipertrofi === 'lvh';
  const isTakikardiaActive = parameters?.lajuDenyutKategori === 'takikardia' || parameters?.irama === 'sinus_tachycardia';
  const isAfibActive = parameters?.irama === 'atrial_fibrilasi_flutter';
  const isAvBlockActive = parameters?.gelombangP_PR === 'av_block_2' || parameters?.gelombangP_PR === 'av_block_3';
  const isInfarkActive = parameters?.segmenST_T === 'st_elevasi_q_patologis';

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              V
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide uppercase text-slate-900">
                Matriks Ringkasan Alur Input Siskohatkes Berdasarkan Hasil EKG
              </h2>
              <p className="text-[11px] text-slate-500">
                Panduan Operasional Input Sistem Komputerisasi Haji Terpadu Kesehatan (Siskohatkes 1448H/2027M)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <Table className="w-3.5 h-3.5 text-emerald-600" />
            <span>Halaman 2 Dokumen Rekam Medis</span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3.5 font-bold border-r border-slate-700 w-56">Hasil EKG Jemaah</th>
                <th className="py-2.5 px-3 font-bold border-r border-slate-700 w-32 text-center">Kategori Siskohat</th>
                <th className="py-2.5 px-3.5 font-bold border-r border-slate-700">Tindak Lanjut Rujukan Medis</th>
                <th className="py-2.5 px-3.5 font-bold border-r border-slate-700 w-48">Modul Input Siskohatkes</th>
                <th className="py-2.5 px-3.5 font-bold w-48">Rekomendasi Status Istithaah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 border border-slate-200">
              {/* Row 1: Sinus Rhythm Normal */}
              <tr className={`transition-colors ${isNormalActive ? 'bg-emerald-50/80 font-medium ring-1 ring-emerald-500' : 'hover:bg-slate-50/60'}`}>
                <td className="py-3 px-3.5 border-r border-slate-200 font-semibold text-slate-900">
                  Sinus Rhythm Normal
                  <span className="block text-[11px] font-normal text-slate-500">
                    (HR 60-100 bpm, Aksis normal, tanpa iskemik)
                  </span>
                </td>
                <td className="py-3 px-3 border-r border-slate-200 text-center">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Kategori A (Normal)
                  </span>
                </td>
                <td className="py-3 px-3.5 border-r border-slate-200 text-slate-700">
                  Tidak memerlukan rujukan lanjutan.
                </td>
                <td className="py-3 px-3.5 border-r border-slate-200 font-medium text-slate-800">
                  <strong>Modul 3:</strong> Unggah berkas EKG (format jpg/png, &lt; 500 KB).
                </td>
                <td className="py-3 px-3.5 text-emerald-800 font-bold">
                  Memenuhi Syarat Istithaah Kesehatan
                </td>
              </tr>

              {/* Row 2: ST Depresi / T Inverted */}
              <tr className={`transition-colors ${isIskemikActive ? 'bg-amber-50/80 font-medium ring-1 ring-amber-500' : 'hover:bg-slate-50/60'}`}>
                <td className="py-3 px-3.5 border-r border-slate-200 font-semibold text-slate-900">
                  ST Depresi / T Inverted
                  <span className="block text-[11px] font-normal text-slate-500">
                    (Suspek Iskemik Miokard)
                  </span>
                </td>
                <td className="py-3 px-3 border-r border-slate-200 text-center">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Kategori B (Abnormal)
                  </span>
                </td>
                <td className="py-3 px-3.5 border-r border-slate-200 text-slate-700">
                  Rujuk Dokter Spesialis Jantung (Treadmill test / Angiografi bila perlu).
                </td>
                <td className="py-3 px-3.5 border-r border-slate-200 text-slate-800">
                  <strong>Modul 4 & 9:</strong> Input Diagnosa ICD-10 Iskemik dan resep obat rutin.
                </td>
                <td className="py-3 px-3.5 text-amber-900 font-semibold">
                  Memenuhi Syarat dengan Pendampingan (jika stabil)
                </td>
              </tr>

              {/* Row 3: Kardiomegali / LVH */}
              <tr className={`transition-colors ${isKardiomegaliActive ? 'bg-amber-50/80 font-medium ring-1 ring-amber-500' : 'hover:bg-slate-50/60'}`}>
                <td className="py-3 px-3.5 border-r border-slate-200 font-semibold text-slate-900">
                  Kardiomegali / LVH
                  <span className="block text-[11px] font-normal text-slate-500">
                    (Pembesaran Jantung)
                  </span>
                </td>
                <td className="py-3 px-3 border-r border-slate-200 text-center">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Kategori B (Abnormal)
                  </span>
                </td>
                <td className="py-3 px-3.5 border-r border-slate-200 text-slate-700">
                  Rujuk Dokter Spesialis Jantung untuk Ekokardiografi (Ukur LVEF %).
                </td>
                <td className="py-3 px-3.5 border-r border-slate-200 text-slate-800">
                  <strong>Modul 4:</strong> Input persentase LVEF (%) dan kondisi katup.
                </td>
                <td className="py-3 px-3.5 text-slate-800">
                  <span className="font-semibold text-emerald-800">Memenuhi Syarat (LVEF ≥40%)</span> /{' '}
                  <span className="font-bold text-rose-700">TMS (LVEF &lt;40%)</span>
                </td>
              </tr>

              {/* Row 4: Sinus Takikardia */}
              <tr className={`transition-colors ${isTakikardiaActive ? 'bg-amber-50/80 font-medium ring-1 ring-amber-500' : 'hover:bg-slate-50/60'}`}>
                <td className="py-3 px-3.5 border-r border-slate-200 font-semibold text-slate-900">
                  Sinus Takikardia
                  <span className="block text-[11px] font-normal text-slate-500">
                    (HR &gt; 100 bpm konsisten)
                  </span>
                </td>
                <td className="py-3 px-3 border-r border-slate-200 text-center">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Kategori B (Abnormal)
                  </span>
                </td>
                <td className="py-3 px-3.5 border-r border-slate-200 text-slate-700">
                  Rujuk Spesialis Penyakit Dalam / Jantung & Pemeriksaan Lab TSH.
                </td>
                <td className="py-3 px-3.5 border-r border-slate-200 text-slate-800">
                  <strong>Modul 3 & 4:</strong> Input nilai lab TSH dan terapi anti-aritmia/tiroid.
                </td>
                <td className="py-3 px-3.5 text-amber-900 font-semibold">
                  TMS Sementara sampai kadar TSH & HR terkontrol
                </td>
              </tr>

              {/* Row 5: Atrium Fibrilasi / Flutter */}
              <tr className={`transition-colors ${isAfibActive ? 'bg-rose-50/80 font-medium ring-1 ring-rose-500' : 'hover:bg-slate-50/60'}`}>
                <td className="py-3 px-3.5 border-r border-slate-200 font-bold text-rose-950">
                  Atrium Fibrilasi / Flutter
                  <span className="block text-[11px] font-normal text-rose-800">
                    (Aritmia Berat)
                  </span>
                </td>
                <td className="py-3 px-3 border-r border-slate-200 text-center">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900">
                    Kategori C (TMS)
                  </span>
                </td>
                <td className="py-3 px-3.5 border-r border-slate-200 text-slate-700">
                  Rujuk Spesialis Jantung untuk evaluasi keamanan penerbangan (Fit to Fly).
                </td>
                <td className="py-3 px-3.5 border-r border-slate-200 text-slate-800">
                  <strong>Modul 8 & Berita Acara:</strong> Input kode ICD-10 <strong>I48</strong> dan status TMS.
                </td>
                <td className="py-3 px-3.5 text-rose-800 font-bold">
                  Tidak Memenuhi Syarat (TMS) Istithaah Kesehatan
                </td>
              </tr>

              {/* Row 6: AV Block Derajat II / III */}
              <tr className={`transition-colors ${isAvBlockActive ? 'bg-rose-50/80 font-medium ring-1 ring-rose-500' : 'hover:bg-slate-50/60'}`}>
                <td className="py-3 px-3.5 border-r border-slate-200 font-bold text-rose-950">
                  AV Block Derajat II / III
                  <span className="block text-[11px] font-normal text-rose-800">
                    (Total Heart Block)
                  </span>
                </td>
                <td className="py-3 px-3 border-r border-slate-200 text-center">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900">
                    Kategori C (TMS)
                  </span>
                </td>
                <td className="py-3 px-3.5 border-r border-slate-200 text-slate-700">
                  Rujuk Spesialis Jantung (Indikasi Pacemaker / TPM/PPM).
                </td>
                <td className="py-3 px-3.5 border-r border-slate-200 text-slate-800">
                  <strong>Modul 8 & Berita Acara:</strong> Input kode ICD-10 <strong>I44.1 / I44.2</strong> dan status TMS.
                </td>
                <td className="py-3 px-3.5 text-rose-800 font-bold">
                  Tidak Memenuhi Syarat (TMS) Istithaah Kesehatan
                </td>
              </tr>

              {/* Row 7: Infark Miokard Akut / ST Elevasi */}
              <tr className={`transition-colors ${isInfarkActive ? 'bg-rose-50/80 font-medium ring-1 ring-rose-500' : 'hover:bg-slate-50/60'}`}>
                <td className="py-3 px-3.5 border-r border-slate-200 font-bold text-rose-950">
                  Infark Miokard Akut / ST Elevasi
                  <span className="block text-[11px] font-normal text-rose-800">
                    (AMI / STEMI / NSTEMI)
                  </span>
                </td>
                <td className="py-3 px-3 border-r border-slate-200 text-center">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900">
                    Kategori C (TMS)
                  </span>
                </td>
                <td className="py-3 px-3.5 border-r border-slate-200 text-slate-700">
                  Penanganan Darurat Medis / Rawat Inap ICCU.
                </td>
                <td className="py-3 px-3.5 border-r border-slate-200 text-slate-800">
                  <strong>Modul 8 & Berita Acara:</strong> Input kode ICD-10 <strong>I21</strong> dan status TMS.
                </td>
                <td className="py-3 px-3.5 text-rose-800 font-bold">
                  Tidak Memenuhi Syarat (TMS) Istithaah Kesehatan
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Standar Prosedur Operasional (SPO) Verifikasi Siskohatkes */}
      <div className="bg-slate-50 border border-slate-300 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileCheck className="w-4 h-4 text-emerald-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Standar Prosedur Operasional (SPO) Verifikasi Siskohatkes RSUD Pesanggrahan:
          </h3>
        </div>
        <ol className="text-xs text-slate-700 space-y-2 list-decimal pl-5">
          <li>
            Petugas/Perawat MCU wajib memeriksa keterisian lembar EKG secara lengkap sebelum mengunggah berkas ke Modul 3 Siskohatkes.
          </li>
          <li>
            Dokter pemeriksa wajib mencantumkan NIP/NIDN pada lembar pengesahan dan memastikan kode ICD-10 yang diinput di Modul 8 sesuai dengan hasil rujukan spesialis.
          </li>
          <li>
            Berkas fisik lembar EKG asli dan interpretasi ini diarsip dalam Rekam Medis RSUD Pesanggrahan.
          </li>
        </ol>
      </div>
    </div>
  );
};
