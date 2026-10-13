import React from 'react';
import { PatientIdentity, ParameterKlinis, KategorisasiSiskohat, KesimpulanDokter } from '../types/ekg';

interface OfficialPrintDocumentProps {
  patient: PatientIdentity;
  parameters: ParameterKlinis;
  kategorisasi: KategorisasiSiskohat;
  kesimpulan: KesimpulanDokter;
}

export const OfficialPrintDocument: React.FC<OfficialPrintDocumentProps> = ({
  patient,
  parameters,
  kategorisasi,
  kesimpulan,
}) => {
  const faskes = patient.faskesName || 'RSUD PESANGGRAHAN';
  const faskesLoc = patient.faskesLocation || 'JAKARTA SELATAN';

  return (
    <div
      id="official-print-document"
      className="official-print-document select-text"
      style={{
        fontFamily: 'Arial, Helvetica, sans-serif',
        color: '#0f172a',
        backgroundColor: '#f1f5f9',
        padding: '12px 0',
      }}
    >
      {/* ============================================================ */}
      {/* HALAMAN 1 DARI 2 (FOLIO / F4: 215mm x 330mm) - FIT 1 SHEET   */}
      {/* ============================================================ */}
      <div
        className="page bg-white mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:min-h-0 page-break"
        style={{
          width: '215mm',
          height: '330mm',
          maxHeight: '330mm',
          padding: '8mm 12mm 7mm 12mm',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden', // guarantees exactly 1 sheet
        }}
      >
        <div>
          {/* Top Header Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '9.5px',
              fontWeight: 'bold',
              letterSpacing: '0.4px',
              color: '#334155',
              borderBottom: '1.5px solid #0f172a',
              paddingBottom: '3px',
              marginBottom: '5px',
            }}
          >
            <span>{faskes} — FORMULIR MEDIS SISKOHATKES 1448H/2027M</span>
            <span>STANDAR KMHU NO. 82 TAHUN 2026</span>
          </div>

          {/* Title Header */}
          <div style={{ textAlign: 'center', marginBottom: '5px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#1e293b' }}>
              {faskes} {faskesLoc}
            </div>
            <h1 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: '#020617', margin: '1px 0' }}>
              LEMBAR INTERPRETASI ELEKTROKARDIOGRAM (EKG)
            </h1>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f172a' }}>
              STANDAR PENILAIAN SISKOHATKES & KRITERIA ISTITHAAH KESEHATAN
            </div>
            <div style={{ fontSize: '9px', color: '#475569', fontStyle: 'italic', marginTop: '1px' }}>
              Berdasarkan KMHU No. 82 Tahun 2026 tentang Pedoman Penetapan Istithaah Kesehatan Jemaah Haji Indonesia
            </div>
          </div>

          {/* Catatan Medis Operasional Box */}
          <div
            style={{
              border: '1px solid #0f172a',
              backgroundColor: '#f8fafc',
              padding: '5px 8px',
              marginBottom: '5px',
              fontSize: '8.5px',
              textAlign: 'justify',
              lineHeight: '1.35',
            }}
          >
            <span style={{ fontWeight: 'bold' }}>Catatan Medis Operasional:</span> Pemeriksaan EKG 12-lead wajib dilakukan bagi seluruh calon jemaah haji. Apabila ditemukan gambaran EKG abnormal, jemaah wajib menjalani rujukan medis lanjutan ke Spesialis Jantung/Penyakit Dalam dan hasilnya diinput ke Siskohatkes untuk pemantauan berkala atau penetapan status Istithaah Kesehatan.
          </div>

          {/* SECTION I: IDENTITAS CALON JEMAAH HAJI */}
          <div style={{ border: '1px solid #0f172a', marginBottom: '5px' }}>
            <div
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '9px',
                textTransform: 'uppercase',
                padding: '3px 8px',
                letterSpacing: '0.4px',
              }}
            >
              I. IDENTITAS CALON JEMAAH HAJI
            </div>
            <div style={{ padding: '5px 10px', fontSize: '9px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '20%', verticalAlign: 'middle', padding: '5px 6px', color: '#1e293b' }}>
                      <span style={{ fontWeight: '600' }}>Nama Lengkap Jemaah:</span>
                    </td>
                    <td style={{ width: '38%', verticalAlign: 'middle', padding: '5px 6px', borderBottom: '1px solid #94a3b8' }}>
                      <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {patient.nama || '—'}
                      </span>
                    </td>
                    <td style={{ width: '18%', verticalAlign: 'middle', padding: '5px 6px', color: '#1e293b' }}>
                      <span style={{ fontWeight: '600' }}>Nomor Porsi / NIK:</span>
                    </td>
                    <td style={{ width: '24%', verticalAlign: 'middle', padding: '5px 6px', borderBottom: '1px solid #94a3b8' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {patient.nomorPorsi || '—'} / {patient.nik || '—'}
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ verticalAlign: 'middle', padding: '5px 6px', color: '#1e293b' }}>
                      <span style={{ fontWeight: '600' }}>Umur & Jenis Kelamin:</span>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '5px 6px', borderBottom: '1px solid #94a3b8' }}>
                      <span style={{ fontWeight: 'bold', marginRight: '8px' }}>{patient.umur ? `${patient.umur} Thn` : '— Thn'}</span>
                      <span>| [{patient.jenisKelamin === 'L' ? ' ✓ ' : ' '}] L [{patient.jenisKelamin === 'P' ? ' ✓ ' : ' '}] P</span>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '5px 6px', color: '#1e293b' }}>
                      <span style={{ fontWeight: '600' }}>Kategori Haji:</span>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '5px 6px', borderBottom: '1px solid #94a3b8' }}>
                      <span>
                        [{patient.kategoriHaji === 'Reguler' ? ' ✓ ' : ' '}] Reguler [{patient.kategoriHaji === 'Haji Plus / Khusus' ? ' ✓ ' : ' '}] Haji Plus
                      </span>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ verticalAlign: 'middle', padding: '5px 6px', color: '#1e293b' }}>
                      <span style={{ fontWeight: '600' }}>Tanggal & Waktu EKG:</span>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '5px 6px', borderBottom: '1px solid #94a3b8' }}>
                      <span>
                        {patient.tanggalEkg || '—'} Pukul: {patient.waktuEkg || '—'} WIB
                      </span>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '5px 6px', color: '#1e293b' }}>
                      <span style={{ fontWeight: '600' }}>No. Rekam Medis:</span>
                    </td>
                    <td style={{ verticalAlign: 'middle', padding: '5px 6px', borderBottom: '1px solid #94a3b8' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                        {patient.noRM || '—'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION II: PARAMETER KLINIS INTERPRETASI EKG (12-LEAD) */}
          <div style={{ border: '1px solid #0f172a', marginBottom: '5px' }}>
            <div
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '9px',
                textTransform: 'uppercase',
                padding: '3px 8px',
                letterSpacing: '0.4px',
              }}
            >
              II. PARAMETER KLINIS INTERPRETASI EKG (12-LEAD)
            </div>
            <table style={{ width: '100%', fontSize: '8.5px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', borderBottom: '1px solid #0f172a' }}>
                  <th style={{ padding: '6px 4px', width: '28px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #94a3b8' }}>No</th>
                  <th style={{ padding: '6px 8px', width: '135px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #94a3b8' }}>Parameter EKG</th>
                  <th style={{ padding: '6px 12px', textAlign: 'center', verticalAlign: 'middle', borderRight: '1px solid #94a3b8' }}>Hasil Temuan / Opsi Klinis (Centang Sesuai Gambaran EKG)</th>
                  <th style={{ padding: '6px 10px', width: '190px', textAlign: 'center', verticalAlign: 'middle' }}>Keterangan Medis</th>
                </tr>
              </thead>
              <tbody style={{ color: '#0f172a' }}>
                {/* 1 */}
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle' }}>1</td>
                  <td style={{ padding: '6px 8px', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle' }}>
                    Irama Jantung
                    <span style={{ display: 'block', fontWeight: 'normal', color: '#64748b' }}>(Rhythm)</span>
                  </td>
                  <td style={{ padding: '6px 12px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.45' }}>
                    <div style={{ margin: '1px 0' }}>[{parameters.irama === 'sinus_rhythm' ? ' ✓ ' : ' '}] Sinus Rhythm (Normal)</div>
                    <div style={{ margin: '1px 0' }}>[{parameters.irama === 'sinus_tachycardia' ? ' ✓ ' : ' '}] Sinus Tachycardia (&gt; 100 bpm)</div>
                    <div style={{ margin: '1px 0' }}>[{parameters.irama === 'sinus_bradycardia' ? ' ✓ ' : ' '}] Sinus Bradycardia (&lt; 60 bpm)</div>
                    <div style={{ margin: '1px 0', fontWeight: 'bold' }}>[{parameters.irama === 'atrial_fibrilasi_flutter' ? ' ✓ ' : ' '}] Atrium Fibrilasi / Atrial Flutter (Kriteria TMS)</div>
                    <div style={{ margin: '1px 0' }}>
                      [{parameters.irama === 'aritmia_lainnya' ? ' ✓ ' : ' '}] Aritmia Lainnya:{' '}
                      <span>{parameters.aritmiaLainnyaText ? <strong>{parameters.aritmiaLainnyaText}</strong> : '—'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '6px 10px', verticalAlign: 'middle', color: '#334155', lineHeight: '1.35' }}>
                    Atrium Fibrilasi/Flutter merupakan kriteria langsung <strong>Tidak Memenuhi Syarat (TMS)</strong>.
                  </td>
                </tr>

                {/* 2 */}
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle' }}>2</td>
                  <td style={{ padding: '6px 8px', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle' }}>
                    Laju Denyut
                    <span style={{ display: 'block', fontWeight: 'normal', color: '#64748b' }}>(Heart Rate)</span>
                  </td>
                  <td style={{ padding: '6px 12px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.45' }}>
                    <div style={{ margin: '1px 0' }}>
                      Laju: <strong>{parameters.lajuDenyutBpm ? `${parameters.lajuDenyutBpm} bpm` : '— bpm'}</strong>
                    </div>
                    <div style={{ margin: '1px 0' }}>[{parameters.lajuDenyutKategori === 'normal' ? ' ✓ ' : ' '}] Normal (60 – 100 bpm)</div>
                    <div style={{ margin: '1px 0' }}>[{parameters.lajuDenyutKategori === 'takikardia' ? ' ✓ ' : ' '}] Takikardia (&gt; 100 bpm) → Wajib Cek TSH Lab</div>
                  </td>
                  <td style={{ padding: '6px 10px', verticalAlign: 'middle', color: '#334155', lineHeight: '1.35' }}>
                    Takikardia memerlukan konfirmasi lab TSH untuk mengesampingkan hipertiroidisme.
                  </td>
                </tr>

                {/* 3 */}
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle' }}>3</td>
                  <td style={{ padding: '6px 8px', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle' }}>
                    Aksis Jantung
                    <span style={{ display: 'block', fontWeight: 'normal', color: '#64748b' }}>(Axis)</span>
                  </td>
                  <td style={{ padding: '6px 12px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.45' }}>
                    <div style={{ margin: '1px 0' }}>[{parameters.aksis === 'normal' ? ' ✓ ' : ' '}] Normal Axis (-30° s/d +90°)</div>
                    <div style={{ margin: '1px 0' }}>[{parameters.aksis === 'lad' ? ' ✓ ' : ' '}] Left Axis Deviation (LAD)</div>
                    <div style={{ margin: '1px 0' }}>[{parameters.aksis === 'rad' ? ' ✓ ' : ' '}] Right Axis Deviation (RAD)</div>
                    <div style={{ margin: '1px 0' }}>[{parameters.aksis === 'extreme' ? ' ✓ ' : ' '}] Extreme Axis</div>
                  </td>
                  <td style={{ padding: '6px 10px', verticalAlign: 'middle', color: '#334155', lineHeight: '1.35' }}>
                    LAD/RAD dapat mengindikasikan hipertrofi ventrikel atau gangguan konduksi.
                  </td>
                </tr>

                {/* 4 */}
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle' }}>4</td>
                  <td style={{ padding: '6px 8px', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle' }}>Gelombang P & PR Interval</td>
                  <td style={{ padding: '6px 12px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.45' }}>
                    <div style={{ margin: '1px 0' }}>[{parameters.gelombangP_PR === 'normal' ? ' ✓ ' : ' '}] Normal (PR Interval 0.12 – 0.20s)</div>
                    <div style={{ margin: '1px 0' }}>[{parameters.gelombangP_PR === 'av_block_1' ? ' ✓ ' : ' '}] AV Block Derajat I (PR &gt; 0.20s) → Perlu Rujukan</div>
                    <div style={{ margin: '1px 0', fontWeight: 'bold' }}>[{parameters.gelombangP_PR === 'av_block_2' ? ' ✓ ' : ' '}] AV Block Derajat II (Mobitz I / II) (TMS)</div>
                    <div style={{ margin: '1px 0', fontWeight: 'bold' }}>[{parameters.gelombangP_PR === 'av_block_3' ? ' ✓ ' : ' '}] AV Block Derajat III (Total Block) (TMS)</div>
                  </td>
                  <td style={{ padding: '6px 10px', verticalAlign: 'middle', color: '#334155', lineHeight: '1.35' }}>
                    AV Block Derajat II dan III adalah kriteria permanen <strong>TMS Istithaah</strong>.
                  </td>
                </tr>

                {/* 5 */}
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle' }}>5</td>
                  <td style={{ padding: '6px 8px', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle' }}>Durasi QRS & Konduksi</td>
                  <td style={{ padding: '6px 12px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.45' }}>
                    <div style={{ margin: '1px 0' }}>[{parameters.durasiQRS === 'normal' ? ' ✓ ' : ' '}] Normal (&lt; 0.12s)</div>
                    <div style={{ margin: '1px 0' }}>[{parameters.durasiQRS === 'lbbb' ? ' ✓ ' : ' '}] Left Bundle Branch Block (LBBB)</div>
                    <div style={{ margin: '1px 0' }}>[{parameters.durasiQRS === 'rbbb' ? ' ✓ ' : ' '}] Right Bundle Branch Block (RBBB)</div>
                  </td>
                  <td style={{ padding: '6px 10px', verticalAlign: 'middle', color: '#334155', lineHeight: '1.35' }}>
                    LBBB baru memerlukan evaluasi ketat penyakit jantung iskemik.
                  </td>
                </tr>

                {/* 6 */}
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle' }}>6</td>
                  <td style={{ padding: '6px 8px', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle' }}>Segmen ST & Gelombang T</td>
                  <td style={{ padding: '6px 12px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.45' }}>
                    <div style={{ margin: '1px 0' }}>[{parameters.segmenST_T === 'normal' ? ' ✓ ' : ' '}] Normal / Isoelektrik</div>
                    <div style={{ margin: '1px 0' }}>[{parameters.segmenST_T === 'st_depresi_t_inverted' ? ' ✓ ' : ' '}] ST Depresi / T Inverted → Suspek Iskemik Miokard</div>
                    <div style={{ margin: '1px 0', fontWeight: 'bold' }}>[{parameters.segmenST_T === 'st_elevasi_q_patologis' ? ' ✓ ' : ' '}] ST Elevasi / Q Patologis → Infark Miokard Akut/Lama (TMS)</div>
                  </td>
                  <td style={{ padding: '6px 10px', verticalAlign: 'middle', color: '#334155', lineHeight: '1.35' }}>
                    Iskemik/Infark Akut atau Kronik indikasi operasi masuk kriteria <strong>TMS</strong>.
                  </td>
                </tr>

                {/* 7 */}
                <tr>
                  <td style={{ padding: '6px 4px', textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle' }}>7</td>
                  <td style={{ padding: '6px 8px', fontWeight: 'bold', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle' }}>Hipertrofi / Pembesaran</td>
                  <td style={{ padding: '6px 12px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.45' }}>
                    <div style={{ margin: '1px 0' }}>[{parameters.hipertrofi === 'normal' ? ' ✓ ' : ' '}] Normal</div>
                    <div style={{ margin: '1px 0' }}>[{parameters.hipertrofi === 'lvh' ? ' ✓ ' : ' '}] Kardiomegali / LVH (Sokolow-Lyon / Cornell)</div>
                    <div style={{ margin: '1px 0' }}>[{parameters.hipertrofi === 'rvh' ? ' ✓ ' : ' '}] RVH</div>
                  </td>
                  <td style={{ padding: '6px 10px', verticalAlign: 'middle', color: '#334155', lineHeight: '1.35' }}>
                    Kardiomegali wajib dirujuk untuk Ekokardiografi (ukur LVEF %).
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION III: KATEGORISASI PENILAIAN SISKOHATKES */}
          <div style={{ border: '1px solid #0f172a', marginBottom: '5px' }}>
            <div
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '9px',
                textTransform: 'uppercase',
                padding: '3px 8px',
                letterSpacing: '0.4px',
              }}
            >
              III. KATEGORISASI PENILAIAN SISKOHATKES (KMHU 82/2026)
            </div>
            <div style={{ padding: '5px 10px', fontSize: '8.5px', lineHeight: '1.35' }}>
              {/* Kategori A */}
              <div style={{ marginBottom: '3px', backgroundColor: kategorisasi.kategori === 'KATEGORI_A' ? '#f1f5f9' : 'transparent', padding: '3px 6px', borderRadius: '3px' }}>
                <div style={{ fontWeight: 'bold' }}>
                  [{kategorisasi.kategori === 'KATEGORI_A' ? ' ✓ ' : ' '}] KATEGORI A: NORMAL / TIDAK ADA KELAINAN BERMAKNA
                </div>
                <div style={{ paddingLeft: '14px', color: '#334155' }}>
                  • Gambaran EKG Sinus Rhythm normal, frekuensi 60-100 bpm, tanpa tanda iskemik/infark/aritmia.<br />
                  • <strong>Tindak Lanjut Siskohatkes:</strong> Langsung simpan dan lanjut ke Modul 3 Siskohatkes (unggah berkas EKG maks. 500 KB).
                </div>
              </div>

              {/* Kategori B */}
              <div style={{ marginBottom: '3px', backgroundColor: kategorisasi.kategori === 'KATEGORI_B' ? '#f1f5f9' : 'transparent', padding: '3px 6px', borderRadius: '3px' }}>
                <div style={{ fontWeight: 'bold' }}>
                  [{kategorisasi.kategori === 'KATEGORI_B' ? ' ✓ ' : ' '}] KATEGORI B: ABNORMAL — PERLU RUJUKAN SPESIALIS & EVALUASI PENGOBATAN
                </div>
                <div style={{ paddingLeft: '14px', color: '#334155' }}>
                  • Centang temuan: [{kategorisasi.centangB.suspekIskemik ? ' ✓ ' : ' '}] Suspek Iskemik Miokard [{kategorisasi.centangB.kardiomegaliLVH ? ' ✓ ' : ' '}] Kardiomegali/LVH [{kategorisasi.centangB.avBlockSt1 ? ' ✓ ' : ' '}] AV Block St. I [{kategorisasi.centangB.takikardia ? ' ✓ ' : ' '}] Takikardia (&gt;100 bpm)<br />
                  • <strong>Tindak Lanjut Medis:</strong> Rujuk Spesialis Jantung (EKG lanjutan/Ekokardiografi LVEF) atau Spesialis Penyakit Dalam (cek TSH).<br />
                  • <strong>Tindak Lanjut Siskohatkes:</strong> Input hasil rujukan spesialis, nilai LVEF (%), kadar TSH, dan obat pada Modul 4 & 9 Siskohatkes.
                </div>
              </div>

              {/* Kategori C */}
              <div style={{ backgroundColor: kategorisasi.kategori === 'KATEGORI_C' ? '#f1f5f9' : 'transparent', padding: '3px 6px', borderRadius: '3px' }}>
                <div style={{ fontWeight: 'bold', color: '#991b1b' }}>
                  [{kategorisasi.kategori === 'KATEGORI_C' ? ' ✓ ' : ' '}] KATEGORI C: ABNORMAL BERAT — INDIKASI TIDAK MEMENUHI SYARAT (TMS) ISTITHAAH
                </div>
                <div style={{ paddingLeft: '14px', color: '#334155' }}>
                  • Centang temuan: [{kategorisasi.centangC.atriumFibrilasiFlutter ? ' ✓ ' : ' '}] Atrium Fibrilasi / Flutter [{kategorisasi.centangC.avBlockSt2_3 ? ' ✓ ' : ' '}] AV Block St. II / III [{kategorisasi.centangC.infarkMiokardAkut ? ' ✓ ' : ' '}] Infark Miokard Akut/Iskemik Operasi [{kategorisasi.centangC.lvefDibawah40 ? ' ✓ ' : ' '}] LVEF &lt; 40%<br />
                  • <strong>Tindak Lanjut Medis:</strong> Evaluasi komprehensif tim medis & Satgas Istithaah Kesehatan.<br />
                  • <strong>Tindak Lanjut Siskohatkes:</strong> Input diagnosa spesialis di Modul 8 & Berita Acara sebagai dasar penetapan status TMS Istithaah.
                </div>
              </div>
            </div>
          </div>

          {/* SECTION IV: KESIMPULAN KLINIS & PENGESAHAN DOKTER */}
          <div style={{ border: '1px solid #0f172a' }}>
            <div
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '9px',
                textTransform: 'uppercase',
                padding: '3px 8px',
                letterSpacing: '0.4px',
              }}
            >
              IV. KESIMPULAN KLINIS & PENGESAHAN DOKTER PEMERIKSA
            </div>
            <div style={{ padding: '6px 10px', fontSize: '8.5px', lineHeight: '1.4' }}>
              <div style={{ marginBottom: '4px' }}>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>Kesimpulan Diagnostik EKG:</div>
                <div style={{ color: '#0f172a', fontWeight: '500', padding: '2px 0' }}>
                  {kesimpulan.kesimpulanDiagnostik || 'Normal Sinus Rhythm, HR 75 bpm, aksis normal, tidak ditemukan tanda iskemia atau infark miokard.'}
                </div>
              </div>

              <div style={{ marginBottom: '6px' }}>
                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>Rencana Rujukan / Tindak Lanjut Penanganan Jemaah:</div>
                <div style={{ color: '#0f172a', fontWeight: '500', padding: '2px 0' }}>
                  {kesimpulan.rencanaRujukan || 'Tidak memerlukan rujukan lanjutan kardiologi. Jemaah dapat melanjutkan tahapan pemeriksaan Siskohatkes.'}
                </div>
              </div>

              <table style={{ width: '100%', marginTop: '4px', borderCollapse: 'collapse' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '48%', verticalAlign: 'top', padding: '4px 6px' }}>
                      <div style={{ color: '#334155' }}>Tanggal Pembacaan EKG:</div>
                      <div style={{ fontWeight: 'bold', marginTop: '2px', color: '#0f172a' }}>
                        {kesimpulan.tanggalPembacaan || '13/10/2026'}
                      </div>
                      {/* Kolom CAP / STEMPEL BASAH dipindahkan ke Halaman 1 tanpa teks di dalamnya */}
                      <div
                        style={{
                          marginTop: '6px',
                          width: '180px',
                          height: '75px',
                          border: '1.5px dashed #475569',
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                        }}
                      />
                    </td>
                    <td style={{ width: '52%', textAlign: 'center', verticalAlign: 'top', padding: '4px 6px' }}>
                      <div style={{ fontSize: '8.5px', color: '#334155' }}>Dokter Pembaca EKG / Spesialis Jantung:</div>
                      <div style={{ height: '48px' }} />
                      <div style={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#0f172a' }}>
                        ( {kesimpulan.dokterNama || 'dr. Pemeriksa EKG, Sp.JP'} )
                      </div>
                      <div style={{ fontSize: '8px', fontFamily: 'monospace', marginTop: '3px', color: '#334155' }}>
                        NIP / NIDN: {kesimpulan.nipNidn || '198503152010011002'}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Page 1 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '8.5px',
            color: '#64748b',
            paddingTop: '4px',
            borderTop: '1px solid #cbd5e1',
          }}
        >
          <span>Lembar Evaluasi Klinis & Interpretasi EKG — Dokumen Rekam Medis Resmi Siskohatkes</span>
          <span>Halaman 1 dari 2 (Folio F4)</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* HALAMAN 2 DARI 2 (FOLIO / F4: 215mm x 330mm)                 */}
      {/* ============================================================ */}
      <div
        className="page bg-white mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:min-h-0 mt-8 print:mt-0"
        style={{
          width: '215mm',
          height: '330mm',
          maxHeight: '330mm',
          padding: '8mm 12mm 7mm 12mm',
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}
      >
        <div>
          {/* Top Header Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '9.5px',
              fontWeight: 'bold',
              letterSpacing: '0.4px',
              color: '#334155',
              borderBottom: '1.5px solid #0f172a',
              paddingBottom: '3px',
              marginBottom: '8px',
            }}
          >
            <span>{faskes} — FORMULIR MEDIS SISKOHATKES 1448H/2027M</span>
            <span>STANDAR KMHU NO. 82 TAHUN 2026</span>
          </div>

          {/* SECTION V: MATRIKS RINGKASAN ALUR INPUT SISKOHATKES */}
          <div style={{ border: '1px solid #0f172a', marginBottom: '8px' }}>
            <div
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '9.5px',
                textTransform: 'uppercase',
                padding: '3px 8px',
                letterSpacing: '0.4px',
              }}
            >
              V. MATRIKS RINGKASAN ALUR INPUT SISKOHATKES BERDASARKAN HASIL EKG
            </div>
            <table style={{ width: '100%', fontSize: '8.5px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', fontWeight: 'bold', borderBottom: '1px solid #0f172a' }}>
                  <th style={{ padding: '7px 10px', borderRight: '1px solid #94a3b8', width: '145px', verticalAlign: 'middle', textAlign: 'center' }}>Hasil EKG Jemaah</th>
                  <th style={{ padding: '7px 6px', borderRight: '1px solid #94a3b8', width: '90px', textAlign: 'center', verticalAlign: 'middle' }}>Kategori Siskohat</th>
                  <th style={{ padding: '7px 10px', borderRight: '1px solid #94a3b8', verticalAlign: 'middle', textAlign: 'center' }}>Tindak Lanjut Rujukan Medis</th>
                  <th style={{ padding: '7px 10px', borderRight: '1px solid #94a3b8', width: '145px', verticalAlign: 'middle', textAlign: 'center' }}>Modul Input Siskohatkes</th>
                  <th style={{ padding: '7px 10px', width: '155px', verticalAlign: 'middle', textAlign: 'center' }}>Rekomendasi Status Istithaah</th>
                </tr>
              </thead>
              <tbody style={{ color: '#0f172a' }}>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', fontWeight: '600', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    Sinus Rhythm Normal<br />
                    <span style={{ fontSize: '7.5px', color: '#64748b' }}>(HR 60-100 bpm, Aksis normal, tanpa iskemik)</span>
                  </td>
                  <td style={{ padding: '7px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#047857', verticalAlign: 'middle' }}>
                    Kategori A<br />(Normal)
                  </td>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.4' }}>Tidak memerlukan rujukan lanjutan.</td>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    <strong>Modul 3:</strong><br />Unggah berkas EKG (format jpg/png, &lt; 500 KB).
                  </td>
                  <td style={{ padding: '7px 10px', fontWeight: 'bold', color: '#047857', verticalAlign: 'middle', lineHeight: '1.4' }}>Memenuhi Syarat Istithaah Kesehatan</td>
                </tr>

                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', fontWeight: '600', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    ST Depresi / T Inverted<br />
                    <span style={{ fontSize: '7.5px', color: '#64748b' }}>(Suspek Iskemik Miokard)</span>
                  </td>
                  <td style={{ padding: '7px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#b45309', verticalAlign: 'middle' }}>
                    Kategori B<br />(Abnormal)
                  </td>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    Rujuk Dokter Spesialis Jantung (Treadmill test / Angiografi bila perlu).
                  </td>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    <strong>Modul 4 & 9:</strong><br />Input Diagnosa (ICD-10 Iskemik dan resep obat rutin.
                  </td>
                  <td style={{ padding: '7px 10px', fontWeight: 'bold', verticalAlign: 'middle', lineHeight: '1.4' }}>Memenuhi Syarat dengan Pendampingan (jika stabil)</td>
                </tr>

                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', fontWeight: '600', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    Kardiomegali / LVH<br />
                    <span style={{ fontSize: '7.5px', color: '#64748b' }}>(Pembesaran Jantung)</span>
                  </td>
                  <td style={{ padding: '7px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#b45309', verticalAlign: 'middle' }}>
                    Kategori B<br />(Abnormal)
                  </td>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    Rujuk Dokter Spesialis Jantung untuk Ekokardiografi (Ukur LVEF %).
                  </td>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    <strong>Modul 4:</strong><br />Input persentase LVEF (%) dan kondisi katup.
                  </td>
                  <td style={{ padding: '7px 10px', verticalAlign: 'middle', lineHeight: '1.4' }}>Memenuhi Syarat (LVEF ≥40%) / TMS (LVEF &lt;40%)</td>
                </tr>

                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', fontWeight: '600', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    Sinus Takikardia<br />
                    <span style={{ fontSize: '7.5px', color: '#64748b' }}>(HR &gt; 100 bpm konsisten)</span>
                  </td>
                  <td style={{ padding: '7px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#b45309', verticalAlign: 'middle' }}>
                    Kategori B<br />(Abnormal)
                  </td>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    Rujuk Spesialis Penyakit Dalam / Jantung & Pemeriksaan Lab TSH.
                  </td>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    <strong>Modul 3 & 4:</strong><br />Input nilai lab TSH dan terapi anti-aritmia/tiroid.
                  </td>
                  <td style={{ padding: '7px 10px', fontWeight: 'bold', color: '#b45309', verticalAlign: 'middle', lineHeight: '1.4' }}>TMS Sementara sampai kadar TSH & HR terkontrol</td>
                </tr>

                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', fontWeight: 'bold', color: '#991b1b', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    Atrium Fibrilasi / Flutter<br />
                    <span style={{ fontSize: '7.5px', color: '#991b1b', fontWeight: 'normal' }}>(Aritmia Berat)</span>
                  </td>
                  <td style={{ padding: '7px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#991b1b', verticalAlign: 'middle' }}>
                    Kategori C<br />(TMS)
                  </td>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    Rujuk Spesialis Jantung untuk evaluasi keamanan penerbangan (Fit to Fly).
                  </td>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    <strong>Modul 8 & Berita Acara:</strong><br />Input kode ICD-10 I48 dan status TMS.
                  </td>
                  <td style={{ padding: '7px 10px', fontWeight: 'bold', color: '#991b1b', verticalAlign: 'middle', lineHeight: '1.4' }}>Tidak Memenuhi Syarat (TMS) Istithaah Kesehatan</td>
                </tr>

                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', fontWeight: 'bold', color: '#991b1b', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    AV Block Derajat II / III<br />
                    <span style={{ fontSize: '7.5px', color: '#991b1b', fontWeight: 'normal' }}>(Total Heart Block)</span>
                  </td>
                  <td style={{ padding: '7px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#991b1b', verticalAlign: 'middle' }}>
                    Kategori C<br />(TMS)
                  </td>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    Rujuk Spesialis Jantung (Indikasi Pacemaker / TPM/PPM).
                  </td>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    <strong>Modul 8 & Berita Acara:</strong><br />Input kode ICD-10 I44.1/I44.2 dan status TMS.
                  </td>
                  <td style={{ padding: '7px 10px', fontWeight: 'bold', color: '#991b1b', verticalAlign: 'middle', lineHeight: '1.4' }}>Tidak Memenuhi Syarat (TMS) Istithaah Kesehatan</td>
                </tr>

                <tr>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', fontWeight: 'bold', color: '#991b1b', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    Infark Miokard Akut / ST Elevasi<br />
                    <span style={{ fontSize: '7.5px', color: '#991b1b', fontWeight: 'normal' }}>(AMI / STEMI / NSTEMI)</span>
                  </td>
                  <td style={{ padding: '7px 6px', borderRight: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 'bold', color: '#991b1b', verticalAlign: 'middle' }}>
                    Kategori C<br />(TMS)
                  </td>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    Penanganan Darurat Medis / Rawat Inap ICCU.
                  </td>
                  <td style={{ padding: '7px 10px', borderRight: '1px solid #cbd5e1', verticalAlign: 'middle', lineHeight: '1.4' }}>
                    <strong>Modul 8 & Berita Acara:</strong><br />Input kode ICD-10 I21 dan status TMS.
                  </td>
                  <td style={{ padding: '7px 10px', fontWeight: 'bold', color: '#991b1b', verticalAlign: 'middle', lineHeight: '1.4' }}>Tidak Memenuhi Syarat (TMS) Istithaah Kesehatan</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* STANDAR PROSEDUR OPERASIONAL (SPO) VERIFIKASI SISKOHATKES */}
          <div style={{ border: '1px solid #0f172a', padding: '7px 12px', backgroundColor: '#f8fafc', fontSize: '8.5px', marginBottom: '10px' }}>
            <div style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '3px', color: '#0f172a' }}>
              STANDAR PROSEDUR OPERASIONAL (SPO) VERIFIKASI SISKOHATKES {faskes}:
            </div>
            <ol style={{ paddingLeft: '16px', margin: 0, lineHeight: '1.45', color: '#334155' }}>
              <li style={{ marginBottom: '2px' }}>
                Petugas/Perawat MCU wajib memeriksa keterisian lembar EKG secara lengkap sebelum mengunggah berkas ke Modul 3 Siskohatkes.
              </li>
              <li style={{ marginBottom: '2px' }}>
                Dokter pemeriksa wajib mencantumkan NIP/NIDN pada lembar pengesahan dan memastikan kode ICD-10 yang diinput di Modul 8 sesuai dengan hasil rujukan spesialis.
              </li>
              <li>
                Berkas fisik lembar EKG asli dan interpretasi ini diarsip dalam Rekam Medis {faskes}.
              </li>
            </ol>
          </div>

          {/* Siskohatkes Verification Footer Notice */}
          <div
            style={{
              borderTop: '1px solid #cbd5e1',
              paddingTop: '10px',
              marginTop: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: '9px', lineHeight: '1.5', color: '#334155', maxWidth: '460px' }}>
              <div style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '9.5px', marginBottom: '2px' }}>
                Verifikasi Sistem Komputerisasi Haji Terpadu Kesehatan (Siskohatkes)
              </div>
              <div>Berdasarkan KMHU Nomor 82 Tahun 2026 tentang Pedoman Penetapan Istithaah Kesehatan Jemaah Haji Indonesia.</div>
              <div style={{ marginTop: '3px', color: '#64748b', fontSize: '8.5px', fontStyle: 'italic' }}>
                Dokumen Rekam Medis Resmi ini sah dan terintegrasi dengan modul pemeriksaan kesehatan haji nasional.
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '8.5px', color: '#475569' }}>
              <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{faskes}</div>
              <div>{faskesLoc}</div>
            </div>
          </div>
        </div>

        {/* Footer Page 2 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '8.5px',
            color: '#64748b',
            paddingTop: '4px',
            borderTop: '1px solid #cbd5e1',
          }}
        >
          <span>Lembar Evaluasi Klinis & Interpretasi EKG — Dokumen Rekam Medis Resmi Siskohatkes</span>
          <span>Halaman 2 dari 2 (Folio F4)</span>
        </div>
      </div>
    </div>
  );
};
