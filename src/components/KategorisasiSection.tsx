import React, { useState, useRef } from 'react';
import { KategorisasiSiskohat, KesimpulanDokter } from '../types/ekg';
import { Mic, MicOff, CheckCircle2, AlertTriangle, XCircle, Sparkles, Loader2 } from 'lucide-react';

interface KategorisasiSectionProps {
  kategorisasi: KategorisasiSiskohat;
  kesimpulan: KesimpulanDokter;
  onKategorisasiChange: (updated: KategorisasiSiskohat) => void;
  onKesimpulanChange: (updated: KesimpulanDokter) => void;
}

export const KategorisasiSection: React.FC<KategorisasiSectionProps> = ({
  kategorisasi,
  kesimpulan,
  onKategorisasiChange,
  onKesimpulanChange,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Toggle category
  const selectKategori = (kat: 'KATEGORI_A' | 'KATEGORI_B' | 'KATEGORI_C') => {
    let rekom = 'Memenuhi Syarat Istithaah Kesehatan';
    let tindakMedis = 'Tidak memerlukan rujukan lanjutan.';
    let tindakSisko = 'Langsung simpan dan lanjut ke Modul 3 Siskohatkes (unggah berkas EKG maks. 500 KB).';
    let modul = 'Modul 3';

    if (kat === 'KATEGORI_B') {
      rekom = 'Memenuhi Syarat dengan Pendampingan (jika stabil)';
      tindakMedis =
        'Rujuk Spesialis Jantung (EKG lanjutan/Ekokardiografi LVEF) atau Spesialis Penyakit Dalam (cek TSH).';
      tindakSisko =
        'Input hasil rujukan spesialis, nilai LVEF (%), kadar TSH, dan obat pada Modul 4 & 9 Siskohatkes.';
      modul = 'Modul 4 & 9';
    } else if (kat === 'KATEGORI_C') {
      rekom = 'Tidak Memenuhi Syarat (TMS) Istithaah Kesehatan';
      tindakMedis = 'Evaluasi komprehensif tim medis & Satgas Istithaah Kesehatan.';
      tindakSisko =
        'Input diagnosa spesialis di Modul 8 & Berita Acara sebagai dasar penetapan status TMS Istithaah.';
      modul = 'Modul 8 & Berita Acara';
    }

    onKategorisasiChange({
      ...kategorisasi,
      kategori: kat,
      rekomendasiStatusIstithaah: rekom,
      tindakLanjutMedis: tindakMedis,
      tindakLanjutSiskohatkes: tindakSisko,
      modulInput: modul,
    });
  };

  const updateCentangB = (key: keyof KategorisasiSiskohat['centangB'], val: boolean) => {
    onKategorisasiChange({
      ...kategorisasi,
      centangB: {
        ...kategorisasi.centangB,
        [key]: val,
      },
    });
  };

  const updateCentangC = (key: keyof KategorisasiSiskohat['centangC'], val: boolean) => {
    onKategorisasiChange({
      ...kategorisasi,
      centangC: {
        ...kategorisasi.centangC,
        [key]: val,
      },
    });
  };

  // Voice dictation using Gemini 3.5 Transcribe
  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          await sendAudioToTranscribe(base64Audio);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      alert('Tidak dapat mengaktifkan mikrofon. Pastikan izin mikrofon browser aktif.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToTranscribe = async (base64String: string) => {
    setIsTranscribing(true);
    try {
      const response = await fetch('/api/gemini/transcribe-dictation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64: base64String,
          mimeType: 'audio/webm',
        }),
      });
      const data = await response.json();
      if (data.transcription) {
        onKesimpulanChange({
          ...kesimpulan,
          kesimpulanDiagnostik: kesimpulan.kesimpulanDiagnostik
            ? `${kesimpulan.kesimpulanDiagnostik} ${data.transcription}`
            : data.transcription,
        });
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      alert('Gagal mentranskripsi suara. Silakan coba kembali atau ketik manual.');
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION III: KATEGORISASI PENILAIAN SISKOHATKES */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              III
            </div>
            <h2 className="text-sm font-bold tracking-wide uppercase text-slate-900">
              Kategorisasi Penilaian Siskohatkes (KMHU 82/2026)
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Status: {kategorisasi.rekomendasiStatusIstithaah}
          </span>
        </div>

        <div className="space-y-3.5">
          {/* KATEGORI A */}
          <div
            onClick={() => selectKategori('KATEGORI_A')}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              kategorisasi.kategori === 'KATEGORI_A'
                ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600'
                : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="kategori_siskohat"
                checked={kategorisasi.kategori === 'KATEGORI_A'}
                onChange={() => selectKategori('KATEGORI_A')}
                className="mt-1 text-emerald-700 focus:ring-emerald-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase text-emerald-950 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    KATEGORI A: NORMAL / TIDAK ADA KELAINAN BERMAKNA
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    Memenuhi Syarat
                  </span>
                </div>
                <ul className="mt-2 text-xs text-slate-700 space-y-1 list-disc pl-5">
                  <li>Gambaran EKG Sinus Rhythm normal, frekuensi 60-100 bpm, tanpa tanda iskemik/infark/aritmia.</li>
                  <li className="font-semibold text-emerald-900">
                    Tindak Lanjut Siskohatkes: Langsung simpan dan lanjut ke Modul 3 Siskohatkes (unggah berkas EKG maks. 500 KB).
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* KATEGORI B */}
          <div
            onClick={() => selectKategori('KATEGORI_B')}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              kategorisasi.kategori === 'KATEGORI_B'
                ? 'border-amber-600 bg-amber-50/70 shadow-xs ring-1 ring-amber-600'
                : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="kategori_siskohat"
                checked={kategorisasi.kategori === 'KATEGORI_B'}
                onChange={() => selectKategori('KATEGORI_B')}
                className="mt-1 text-amber-600 focus:ring-amber-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase text-amber-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700" />
                    KATEGORI B: ABNORMAL — PERLU RUJUKAN SPESIALIS & EVALUASI PENGOBATAN
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                    Perlu Rujukan
                  </span>
                </div>

                {/* Sub Checklist Temuan B */}
                <div
                  className="mt-2.5 p-2.5 bg-white/90 rounded border border-amber-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    Centang Temuan Klinis Terdeteksi:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kategorisasi.centangB.suspekIskemik}
                        onChange={(e) => updateCentangB('suspekIskemik', e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span>Suspek Iskemik Miokard</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kategorisasi.centangB.kardiomegaliLVH}
                        onChange={(e) => updateCentangB('kardiomegaliLVH', e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span>Kardiomegali / LVH</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kategorisasi.centangB.avBlockSt1}
                        onChange={(e) => updateCentangB('avBlockSt1', e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span>AV Block St. I</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kategorisasi.centangB.takikardia}
                        onChange={(e) => updateCentangB('takikardia', e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span>Takikardia (&gt;100 bpm)</span>
                    </label>
                  </div>
                </div>

                <ul className="mt-2 text-xs text-slate-700 space-y-1 list-disc pl-5">
                  <li>
                    <strong>Tindak Lanjut Medis:</strong> Rujuk Spesialis Jantung (EKG lanjutan / Ekokardiografi LVEF) atau Spesialis Penyakit Dalam (cek TSH).
                  </li>
                  <li className="font-semibold text-amber-900">
                    <strong>Tindak Lanjut Siskohatkes:</strong> Input hasil rujukan spesialis, nilai LVEF (%), kadar TSH, dan obat pada Modul 4 & 9 Siskohatkes.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* KATEGORI C */}
          <div
            onClick={() => selectKategori('KATEGORI_C')}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              kategorisasi.kategori === 'KATEGORI_C'
                ? 'border-rose-600 bg-rose-50/70 shadow-xs ring-1 ring-rose-600'
                : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="radio"
                name="kategori_siskohat"
                checked={kategorisasi.kategori === 'KATEGORI_C'}
                onChange={() => selectKategori('KATEGORI_C')}
                className="mt-1 text-rose-600 focus:ring-rose-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase text-rose-950 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-700" />
                    KATEGORI C: ABNORMAL BERAT — INDIKASI TIDAK MEMENUHI SYARAT (TMS) ISTITHAAH
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-200 text-rose-900">
                    Kriteria TMS
                  </span>
                </div>

                {/* Sub Checklist Temuan C */}
                <div
                  className="mt-2.5 p-2.5 bg-white/90 rounded border border-rose-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    Centang Temuan Kriteria TMS Istithaah:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kategorisasi.centangC.atriumFibrilasiFlutter}
                        onChange={(e) => updateCentangC('atriumFibrilasiFlutter', e.target.checked)}
                        className="rounded text-rose-600"
                      />
                      <span className="font-semibold text-rose-900">Atrium Fibrilasi / Flutter</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kategorisasi.centangC.avBlockSt2_3}
                        onChange={(e) => updateCentangC('avBlockSt2_3', e.target.checked)}
                        className="rounded text-rose-600"
                      />
                      <span className="font-semibold text-rose-900">AV Block St. II / III</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kategorisasi.centangC.infarkMiokardAkut}
                        onChange={(e) => updateCentangC('infarkMiokardAkut', e.target.checked)}
                        className="rounded text-rose-600"
                      />
                      <span className="font-semibold text-rose-900">Infark Miokard Akut / Iskemik Operasi</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={kategorisasi.centangC.lvefDibawah40}
                        onChange={(e) => updateCentangC('lvefDibawah40', e.target.checked)}
                        className="rounded text-rose-600"
                      />
                      <span className="font-semibold text-rose-900">LVEF &lt; 40%</span>
                    </label>
                  </div>
                </div>

                <ul className="mt-2 text-xs text-slate-700 space-y-1 list-disc pl-5">
                  <li>
                    <strong>Tindak Lanjut Medis:</strong> Evaluasi komprehensif tim medis & Satgas Istithaah Kesehatan.
                  </li>
                  <li className="font-semibold text-rose-900">
                    <strong>Tindak Lanjut Siskohatkes:</strong> Input diagnosa spesialis di Modul 8 & Berita Acara sebagai dasar penetapan status TMS Istithaah.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION IV: KESIMPULAN KLINIS & PENGESAHAN DOKTER */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
              IV
            </div>
            <h2 className="text-sm font-bold tracking-wide uppercase text-slate-900">
              Kesimpulan Klinis & Pengesahan Dokter Pemeriksa
            </h2>
          </div>

          {/* Audio dictation action button */}
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={isTranscribing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-colors"
              >
                <Mic className="w-3.5 h-3.5 text-emerald-700" />
                <span>Dikte Suara Dokter</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold animate-pulse transition-colors"
              >
                <MicOff className="w-3.5 h-3.5" />
                <span>Berhenti & Transkripsikan Suara</span>
              </button>
            )}

            {isTranscribing && (
              <span className="flex items-center gap-1 text-xs text-slate-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Memproses transkripsi Gemini...</span>
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4">
          {/* Kesimpulan Diagnostik EKG */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Kesimpulan Diagnostik EKG:</span>
              <span className="text-[11px] font-normal text-slate-400">Dapat diedit atau didikte via suara</span>
            </label>
            <textarea
              rows={3}
              value={kesimpulan.kesimpulanDiagnostik}
              onChange={(e) =>
                onKesimpulanChange({
                  ...kesimpulan,
                  kesimpulanDiagnostik: e.target.value,
                })
              }
              placeholder="Contoh: Normal Sinus Rhythm, HR 72 bpm, normoaxis, PR interval normal, tidak ditemukan tanda iskemik miokard..."
              className="w-full text-xs p-3 border border-slate-300 rounded-md bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>

          {/* Rencana Rujukan / Tindak Lanjut Penanganan Jemaah */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rencana Rujukan / Tindak Lanjut Penanganan Jemaah:
            </label>
            <textarea
              rows={2}
              value={kesimpulan.rencanaRujukan}
              onChange={(e) =>
                onKesimpulanChange({
                  ...kesimpulan,
                  rencanaRujukan: e.target.value,
                })
              }
              placeholder="Contoh: Tidak memerlukan rujukan lanjutan / Rujuk Poli Jantung RSUD Pesanggrahan untuk Treadmill Test..."
              className="w-full text-xs p-3 border border-slate-300 rounded-md bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>

          {/* Pengesahan Dokter Signature Block & Kolom CAP */}
          <div className="pt-3 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="font-semibold text-slate-700">Tanggal Pembacaan EKG:</span>
                <input
                  type="text"
                  value={kesimpulan.tanggalPembacaan}
                  onChange={(e) =>
                    onKesimpulanChange({
                      ...kesimpulan,
                      tanggalPembacaan: e.target.value,
                    })
                  }
                  placeholder="13/10/2026"
                  className="w-32 px-2 py-1 border border-slate-300 rounded font-mono text-center text-xs"
                />
              </div>
              {/* Kolom CAP / STEMPEL BASAH dipindahkan ke halaman 1 tanpa teks di dalamnya */}
              <div
                title="Area Cap / Stempel Basah Faskes Pemeriksa Haji"
                className="w-48 h-18 border-2 border-dashed border-slate-400 rounded-md bg-slate-50/60"
              />
            </div>

            <div className="flex flex-col justify-between text-right">
              <div>
                <span className="font-semibold text-slate-700">Dokter Pembaca EKG / Spesialis Jantung:</span>
              </div>
              <div className="pt-4">
                <div className="font-semibold text-slate-900">{kesimpulan.dokterNama || 'dr. Pemeriksa EKG'}</div>
                <div className="text-slate-500 font-mono text-[11px]">
                  NIP / NIDN: {kesimpulan.nipNidn || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
