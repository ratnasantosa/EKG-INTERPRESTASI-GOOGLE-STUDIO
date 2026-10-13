import React from 'react';
import { ParameterKlinis, IramaType, AksisType, PRBlockType, QRSType, STWaveType, HipertrofiType } from '../types/ekg';
import { Activity, AlertTriangle } from 'lucide-react';

interface ParameterEditorProps {
  parameters: ParameterKlinis;
  onChange: (updated: ParameterKlinis) => void;
}

export const ParameterEditor: React.FC<ParameterEditorProps> = ({ parameters, onChange }) => {
  const updateParam = <K extends keyof ParameterKlinis>(field: K, value: ParameterKlinis[K]) => {
    const next = { ...parameters, [field]: value };

    // Auto classify heart rate if bpm changed
    if (field === 'lajuDenyutBpm') {
      const bpm = typeof value === 'number' ? value : 0;
      if (bpm > 100) {
        next.lajuDenyutKategori = 'takikardia';
      } else if (bpm > 0 && bpm < 60) {
        next.lajuDenyutKategori = 'bradikardia';
      } else {
        next.lajuDenyutKategori = 'normal';
      }
    }

    onChange(next);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
            II
          </div>
          <h2 className="text-sm font-bold tracking-wide uppercase text-slate-900">
            Parameter Klinis Interpretasi EKG (12-Lead)
          </h2>
        </div>
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span>7 Parameter Wajib Sesuai KMHU No. 82 Tahun 2026</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
              <th className="py-2.5 px-3 w-10 text-center font-bold border-r border-slate-700">No</th>
              <th className="py-2.5 px-4 w-44 font-bold border-r border-slate-700">Parameter EKG</th>
              <th className="py-2.5 px-4 font-bold border-r border-slate-700">
                Hasil Temuan / Opsi Klinis (Centang Sesuai Gambaran EKG)
              </th>
              <th className="py-2.5 px-4 w-72 font-bold">Keterangan Medis & Siskohatkes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 border border-slate-200">
            {/* 1. Irama Jantung (Rhythm) */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                1
              </td>
              <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200 align-top">
                Irama Jantung
                <span className="block text-[11px] font-normal text-slate-500">(Rhythm)</span>
              </td>
              <td className="py-3 px-4 border-r border-slate-200 align-top">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="irama"
                      checked={parameters.irama === 'sinus_rhythm'}
                      onChange={() => updateParam('irama', 'sinus_rhythm' as IramaType)}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="text-slate-800 font-medium">Sinus Rhythm (Normal)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="irama"
                      checked={parameters.irama === 'sinus_tachycardia'}
                      onChange={() => updateParam('irama', 'sinus_tachycardia' as IramaType)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-slate-800">Sinus Tachycardia (&gt; 100 bpm)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="irama"
                      checked={parameters.irama === 'sinus_bradycardia'}
                      onChange={() => updateParam('irama', 'sinus_bradycardia' as IramaType)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-slate-800">Sinus Bradycardia (&lt; 60 bpm)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-rose-50/70 p-1.5 rounded border border-rose-200">
                    <input
                      type="radio"
                      name="irama"
                      checked={parameters.irama === 'atrial_fibrilasi_flutter'}
                      onChange={() => updateParam('irama', 'atrial_fibrilasi_flutter' as IramaType)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-rose-900 font-bold">
                      Atrium Fibrilasi / Atrial Flutter <span className="text-rose-600 font-extrabold">(Kriteria TMS)</span>
                    </span>
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer shrink-0">
                      <input
                        type="radio"
                        name="irama"
                        checked={parameters.irama === 'aritmia_lainnya'}
                        onChange={() => updateParam('irama', 'aritmia_lainnya' as IramaType)}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-slate-800">Aritmia Lainnya:</span>
                    </label>
                    <input
                      type="text"
                      value={parameters.aritmiaLainnyaText}
                      onChange={(e) => {
                        updateParam('irama', 'aritmia_lainnya' as IramaType);
                        updateParam('aritmiaLainnyaText', e.target.value);
                      }}
                      placeholder="Contoh: Ventricular Extrasystole (VES), SVT"
                      className="w-full text-xs px-2.5 py-1 border border-slate-300 rounded bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 bg-slate-50/30 text-slate-700 align-top">
                <div className="flex items-start gap-1.5 text-xs text-rose-800 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600 mt-0.5" />
                  <span>
                    Atrium Fibrilasi/Flutter merupakan kriteria langsung <strong>Tidak Memenuhi Syarat (TMS)</strong>.
                  </span>
                </div>
              </td>
            </tr>

            {/* 2. Laju Denyut (Heart Rate) */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                2
              </td>
              <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200 align-top">
                Laju Denyut
                <span className="block text-[11px] font-normal text-slate-500">(Heart Rate)</span>
              </td>
              <td className="py-3 px-4 border-r border-slate-200 align-top">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700">Laju:</span>
                    <input
                      type="number"
                      value={parameters.lajuDenyutBpm}
                      onChange={(e) =>
                        updateParam(
                          'lajuDenyutBpm',
                          e.target.value === '' ? '' : parseInt(e.target.value, 10)
                        )
                      }
                      placeholder="80"
                      className="w-20 text-xs px-2.5 py-1 border border-slate-300 rounded bg-white font-mono font-bold text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                    />
                    <span className="font-semibold text-slate-700">bpm</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="lajuKategori"
                        checked={parameters.lajuDenyutKategori === 'normal'}
                        onChange={() => updateParam('lajuDenyutKategori', 'normal')}
                        className="text-emerald-700 focus:ring-emerald-600"
                      />
                      <span className="text-slate-800 font-medium">Normal (60 – 100 bpm)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-amber-50/70 p-1.5 rounded border border-amber-200">
                      <input
                        type="radio"
                        name="lajuKategori"
                        checked={parameters.lajuDenyutKategori === 'takikardia'}
                        onChange={() => updateParam('lajuDenyutKategori', 'takikardia')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-amber-900 font-bold">
                        Takikardia (&gt; 100 bpm) → Wajib Cek TSH Lab
                      </span>
                    </label>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 bg-slate-50/30 text-slate-700 align-top">
                <span className="text-xs text-amber-900">
                  Takikardia memerlukan konfirmasi lab <strong>TSH</strong> untuk mengesampingkan hipertiroidisme (Kategori B, TMS Sementara).
                </span>
              </td>
            </tr>

            {/* 3. Aksis Jantung (Axis) */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                3
              </td>
              <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200 align-top">
                Aksis Jantung
                <span className="block text-[11px] font-normal text-slate-500">(Axis)</span>
              </td>
              <td className="py-3 px-4 border-r border-slate-200 align-top">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="aksis"
                      checked={parameters.aksis === 'normal'}
                      onChange={() => updateParam('aksis', 'normal' as AksisType)}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="text-slate-800 font-medium">Normal Axis (-30° s/d +90°)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="aksis"
                      checked={parameters.aksis === 'lad'}
                      onChange={() => updateParam('aksis', 'lad' as AksisType)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-slate-800">Left Axis Deviation (LAD)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="aksis"
                      checked={parameters.aksis === 'rad'}
                      onChange={() => updateParam('aksis', 'rad' as AksisType)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-slate-800">Right Axis Deviation (RAD)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="aksis"
                      checked={parameters.aksis === 'extreme'}
                      onChange={() => updateParam('aksis', 'extreme' as AksisType)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-slate-800">Extreme Axis</span>
                  </label>
                </div>
              </td>
              <td className="py-3 px-4 bg-slate-50/30 text-slate-700 align-top">
                <span className="text-xs text-slate-600">
                  LAD/RAD dapat mengindikasikan hipertrofi ventrikel atau defek konduksi.
                </span>
              </td>
            </tr>

            {/* 4. Gelombang P & PR Interval */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                4
              </td>
              <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200 align-top">
                Gelombang P & PR Interval
              </td>
              <td className="py-3 px-4 border-r border-slate-200 align-top">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gelombangP_PR"
                      checked={parameters.gelombangP_PR === 'normal'}
                      onChange={() => updateParam('gelombangP_PR', 'normal' as PRBlockType)}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="text-slate-800 font-medium">Normal (PR Interval 0.12 – 0.20s)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gelombangP_PR"
                      checked={parameters.gelombangP_PR === 'av_block_1'}
                      onChange={() => updateParam('gelombangP_PR', 'av_block_1' as PRBlockType)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-slate-800">AV Block Derajat I (PR &gt; 0.20s) → Perlu Rujukan</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-rose-50/70 p-1.5 rounded border border-rose-200">
                    <input
                      type="radio"
                      name="gelombangP_PR"
                      checked={parameters.gelombangP_PR === 'av_block_2'}
                      onChange={() => updateParam('gelombangP_PR', 'av_block_2' as PRBlockType)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-rose-900 font-bold">
                      AV Block Derajat II (Mobitz I / II) <span className="text-rose-600 font-extrabold">(TMS)</span>
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-rose-50/70 p-1.5 rounded border border-rose-200">
                    <input
                      type="radio"
                      name="gelombangP_PR"
                      checked={parameters.gelombangP_PR === 'av_block_3'}
                      onChange={() => updateParam('gelombangP_PR', 'av_block_3' as PRBlockType)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-rose-900 font-bold">
                      AV Block Derajat III (Total Block) <span className="text-rose-600 font-extrabold">(TMS)</span>
                    </span>
                  </label>
                </div>
              </td>
              <td className="py-3 px-4 bg-slate-50/30 text-slate-700 align-top">
                <span className="text-xs text-rose-800 font-medium">
                  AV Block Derajat II dan III adalah <strong>kriteria permanen TMS Istithaah</strong>.
                </span>
              </td>
            </tr>

            {/* 5. Durasi QRS & Konduksi */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                5
              </td>
              <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200 align-top">
                Durasi QRS & Konduksi
              </td>
              <td className="py-3 px-4 border-r border-slate-200 align-top">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="durasiQRS"
                      checked={parameters.durasiQRS === 'normal'}
                      onChange={() => updateParam('durasiQRS', 'normal' as QRSType)}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="text-slate-800 font-medium">Normal (&lt; 0.12s)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="durasiQRS"
                      checked={parameters.durasiQRS === 'lbbb'}
                      onChange={() => updateParam('durasiQRS', 'lbbb' as QRSType)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-slate-800 font-medium">Left Bundle Branch Block (LBBB)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="durasiQRS"
                      checked={parameters.durasiQRS === 'rbbb'}
                      onChange={() => updateParam('durasiQRS', 'rbbb' as QRSType)}
                      className="text-slate-700"
                    />
                    <span className="text-slate-800">Right Bundle Branch Block (RBBB)</span>
                  </label>
                </div>
              </td>
              <td className="py-3 px-4 bg-slate-50/30 text-slate-700 align-top">
                <span className="text-xs text-slate-700">
                  LBBB baru memerlukan evaluasi ketat penyakit jantung iskemik.
                </span>
              </td>
            </tr>

            {/* 6. Segmen ST & Gelombang T */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                6
              </td>
              <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200 align-top">
                Segmen ST & Gelombang T
              </td>
              <td className="py-3 px-4 border-r border-slate-200 align-top">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="segmenST_T"
                      checked={parameters.segmenST_T === 'normal'}
                      onChange={() => updateParam('segmenST_T', 'normal' as STWaveType)}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="text-slate-800 font-medium">Normal / Isoelektrik</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-amber-50/70 p-1.5 rounded border border-amber-200">
                    <input
                      type="radio"
                      name="segmenST_T"
                      checked={parameters.segmenST_T === 'st_depresi_t_inverted'}
                      onChange={() => updateParam('segmenST_T', 'st_depresi_t_inverted' as STWaveType)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-amber-900 font-semibold">
                      ST Depresi / T Inverted → Suspek Iskemik Miokard
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-rose-50/70 p-1.5 rounded border border-rose-200">
                    <input
                      type="radio"
                      name="segmenST_T"
                      checked={parameters.segmenST_T === 'st_elevasi_q_patologis'}
                      onChange={() => updateParam('segmenST_T', 'st_elevasi_q_patologis' as STWaveType)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-rose-900 font-bold">
                      ST Elevasi / Q Patologis → Infark Miokard Akut/Lama (Kriteria TMS)
                    </span>
                  </label>
                </div>
              </td>
              <td className="py-3 px-4 bg-slate-50/30 text-slate-700 align-top">
                <span className="text-xs text-rose-800 font-medium">
                  Iskemik/Infark Akut atau Kronik indikasi operasi masuk <strong>kriteria TMS</strong>.
                </span>
              </td>
            </tr>

            {/* 7. Hipertrofi / Pembesaran */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-3 px-3 text-center font-bold text-slate-700 bg-slate-50/50 border-r border-slate-200">
                7
              </td>
              <td className="py-3 px-4 font-bold text-slate-900 border-r border-slate-200 align-top">
                Hipertrofi / Pembesaran
              </td>
              <td className="py-3 px-4 border-r border-slate-200 align-top">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hipertrofi"
                      checked={parameters.hipertrofi === 'normal'}
                      onChange={() => updateParam('hipertrofi', 'normal' as HipertrofiType)}
                      className="text-emerald-700 focus:ring-emerald-600"
                    />
                    <span className="text-slate-800 font-medium">Normal</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hipertrofi"
                      checked={parameters.hipertrofi === 'lvh'}
                      onChange={() => updateParam('hipertrofi', 'lvh' as HipertrofiType)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-slate-800 font-medium">
                      Kardiomegali / LVH (Sokolow-Lyon / Cornell)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="hipertrofi"
                      checked={parameters.hipertrofi === 'rvh'}
                      onChange={() => updateParam('hipertrofi', 'rvh' as HipertrofiType)}
                      className="text-slate-700"
                    />
                    <span className="text-slate-800">RVH</span>
                  </label>
                </div>
              </td>
              <td className="py-3 px-4 bg-slate-50/30 text-slate-700 align-top">
                <span className="text-xs text-amber-900 font-medium">
                  Kardiomegali wajib dirujuk untuk <strong>Ekokardiografi</strong> (ukur LVEF %).
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
