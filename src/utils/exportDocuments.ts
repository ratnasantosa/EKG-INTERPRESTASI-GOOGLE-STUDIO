import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PatientIdentity, ParameterKlinis, KategorisasiSiskohat, KesimpulanDokter } from '../types/ekg';

/**
 * Standard Folio / F4 dimensions in millimeters:
 * Width: 215 mm (8.5 inches)
 * Height: 330 mm (13.0 inches)
 */
export const FOLIO_F4_WIDTH_MM = 215;
export const FOLIO_F4_HEIGHT_MM = 330;

/**
 * Direct PDF Download generator using html2canvas & jsPDF for Folio / F4 paper size.
 * Captures the exact dashboard layout cleanly, eliminating any preview borders/shadows,
 * removing oklch color issues, and generating crisp vector-like text alignment.
 */
export async function downloadPdfDocument(
  elementId: string,
  fileName: string = 'Formulir_EKG_Siskohatkes_Folio_F4.pdf',
  onProgress?: (status: string) => void
): Promise<void> {
  const container = document.getElementById(elementId);
  if (!container) {
    throw new Error('Elemen formulir tidak ditemukan di tampilan.');
  }

  // Find all page elements
  const pages = Array.from(container.querySelectorAll<HTMLElement>('.page'));
  if (pages.length === 0) {
    throw new Error('Halaman formulir tidak ditemukan di dalam dokumen.');
  }

  onProgress?.('Menyiapkan generator PDF Folio (F4)...');

  // Initialize jsPDF with Folio / F4 custom dimensions [215, 330]
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [FOLIO_F4_WIDTH_MM, FOLIO_F4_HEIGHT_MM],
    compress: true,
  });

  for (let i = 0; i < pages.length; i++) {
    onProgress?.(`Merender halaman ${i + 1} dari ${pages.length} (Folio F4)...`);
    const pageEl = pages[i];

    // Scroll into view to ensure render tree layout is active
    pageEl.scrollIntoView({ behavior: 'instant', block: 'start' });

    // html2canvas with onclone hook to strip/convert oklch colors & clean preview borders
    const canvas = await html2canvas(pageEl, {
      scale: 2, // 2x resolution for crisp text & borders
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1200,
      onclone: (clonedDoc) => {
        // 1. Remove preview borders & box shadows on cloned pages
        const clonedPages = clonedDoc.querySelectorAll<HTMLElement>('.page');
        clonedPages.forEach((p) => {
          p.style.boxShadow = 'none';
          p.style.border = 'none';
          p.style.margin = '0 auto';
        });

        // 2. Remove or convert oklch in all <style> blocks
        const styles = clonedDoc.querySelectorAll('style');
        styles.forEach((s) => {
          if (s.textContent && s.textContent.includes('oklch')) {
            s.textContent = s.textContent.replace(/oklch\([^)]+\)/g, '#1e293b');
          }
        });

        // 3. Helper canvas context for native browser color parsing
        const helperCanvas = clonedDoc.createElement('canvas');
        helperCanvas.width = 1;
        helperCanvas.height = 1;
        const ctx = helperCanvas.getContext('2d');

        const toRgb = (val: string): string => {
          if (!val || !val.includes('oklch')) return val;
          return val.replace(/oklch\([^)]+\)/g, (match) => {
            if (!ctx) return '#1e293b';
            try {
              ctx.fillStyle = '#000000';
              ctx.fillStyle = match;
              return ctx.fillStyle;
            } catch {
              return '#1e293b';
            }
          });
        };

        // 4. Convert all elements with computed oklch to standard rgb/hex
        const allEls = clonedDoc.querySelectorAll<HTMLElement>('*');
        allEls.forEach((el) => {
          const computed = window.getComputedStyle(el);
          const colorProps = [
            'color',
            'backgroundColor',
            'borderColor',
            'borderTopColor',
            'borderRightColor',
            'borderBottomColor',
            'borderLeftColor',
            'outlineColor',
          ] as const;

          for (const p of colorProps) {
            const val = computed.getPropertyValue(p);
            if (val && val.includes('oklch')) {
              el.style.setProperty(p, toRgb(val), 'important');
            }
          }
        });
      },
    });

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error(`Gagal membaca dimensi halaman ${i + 1}.`);
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    if (i > 0) {
      pdf.addPage([FOLIO_F4_WIDTH_MM, FOLIO_F4_HEIGHT_MM], 'portrait');
    }

    // Map canvas strictly onto the Folio / F4 sheet (215mm x 330mm)
    pdf.addImage(imgData, 'JPEG', 0, 0, FOLIO_F4_WIDTH_MM, FOLIO_F4_HEIGHT_MM, undefined, 'FAST');
  }

  onProgress?.('Menyimpan berkas PDF Folio (F4)...');
  pdf.save(fileName);
}

/**
 * Direct Microsoft Word (.doc) Download generator for Folio / F4 paper.
 * Built with Word-native tables, explicit vertical alignment (valign="middle"),
 * clean text without strike-throughs or overlapping border lines,
 * and exact visual fidelity matching the official dashboard form.
 */
export function downloadWordDocument(
  patient: PatientIdentity,
  parameters: ParameterKlinis,
  kategorisasi: KategorisasiSiskohat,
  kesimpulan: KesimpulanDokter,
  fileName: string = 'Formulir_EKG_Siskohatkes_Folio_F4.doc'
): void {
  const faskes = patient.faskesName || 'RSUD PESANGGRAHAN';
  const faskesLoc = patient.faskesLocation || 'JAKARTA SELATAN';

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Formulir Medis Siskohatkes KMHU 82/2026 (Folio F4)</title>
<!--[if gte mso 9]>
<xml>
<w:WordDocument>
<w:View>Print</w:View>
<w:Zoom>100</w:Zoom>
<w:DoNotOptimizeForBrowser/>
</w:WordDocument>
</xml>
<![endif]-->
<style>
  @page Section1 {
    size: 215mm 330mm; /* Standar Folio / F4 */
    margin: 10mm 12mm 10mm 12mm;
    mso-header-margin: 8mm;
    mso-footer-margin: 8mm;
    mso-paper-source: 0;
  }
  div.Section1 { page: Section1; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 8.5pt;
    line-height: 1.35;
    color: #0f172a;
  }
  p { margin: 0; padding: 0; }
  table {
    width: 100%;
    border-collapse: collapse;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
    margin-bottom: 5pt;
  }
  th, td {
    mso-line-height-rule: exactly;
    vertical-align: middle;
  }
  .sec-tbl {
    width: 100%;
    border: 1.5pt solid #0f172a;
    border-collapse: collapse;
    margin-bottom: 5pt;
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
  }
  .sec-header {
    background-color: #0f172a;
    color: #ffffff;
    font-weight: bold;
    font-size: 8.5pt;
    padding: 3.5pt 6pt;
    text-transform: uppercase;
    letter-spacing: 0.3pt;
  }
  .top-meta {
    font-size: 8.5pt;
    font-weight: bold;
    border-bottom: 1.5pt solid #0f172a;
    padding-bottom: 2pt;
    margin-bottom: 4pt;
  }
  .top-meta td {
    padding: 1pt 3pt;
    vertical-align: middle;
  }
  .doc-title {
    text-align: center;
    margin-bottom: 4pt;
  }
  .doc-title h1 {
    font-size: 11pt;
    font-weight: bold;
    margin: 1pt 0;
    text-transform: uppercase;
    color: #020617;
  }
  .doc-title h2 {
    font-size: 9.5pt;
    font-weight: bold;
    margin: 1pt 0;
    color: #0f172a;
  }
  .doc-title p {
    font-size: 8pt;
    font-style: italic;
    color: #475569;
    margin: 1pt 0;
  }
  .catatan-box {
    border: 1pt solid #0f172a;
    background-color: #f8fafc;
    padding: 4.5pt 6pt;
    font-size: 8pt;
    text-align: justify;
    line-height: 1.35;
    margin-bottom: 5pt;
  }
  .tbl-bordered th, .tbl-bordered td {
    border: 1pt solid #cbd5e1;
    font-size: 8pt;
    padding: 4.5pt 6pt;
    vertical-align: middle;
  }
  .tbl-bordered th {
    background-color: #f1f5f9;
    font-weight: bold;
    border-bottom: 1.5pt solid #0f172a;
    text-align: center;
    vertical-align: middle;
    padding: 5pt 5pt;
  }
  .footer-meta {
    font-size: 8pt;
    color: #64748b;
    border-top: 1pt solid #cbd5e1;
    padding-top: 3pt;
    margin-top: 5pt;
  }
  .footer-meta td {
    padding: 1pt 3pt;
    vertical-align: middle;
  }
  .check-mark {
    color: #047857;
    font-weight: bold;
  }
  .page-break {
    page-break-before: always;
    mso-break-type: section-break;
  }
</style>
</head>
<body>
<div class="Section1">

  <!-- ==================== HALAMAN 1 (FOLIO F4) ==================== -->
  <table class="top-meta" cellpadding="0" cellspacing="0">
    <tr>
      <td align="left" valign="middle">${faskes} — FORMULIR MEDIS SISKOHATKES 1448H/2027M</td>
      <td align="right" valign="middle">STANDAR KMHU NO. 82 TAHUN 2026</td>
    </tr>
  </table>

  <div class="doc-title">
    <div style="font-size:9.5pt; font-weight:bold; text-transform:uppercase; color:#1e293b;">${faskes} ${faskesLoc}</div>
    <h1>LEMBAR INTERPRETASI ELEKTROKARDIOGRAM (EKG)</h1>
    <h2>STANDAR PENILAIAN SISKOHATKES & KRITERIA ISTITHAAH KESEHATAN</h2>
    <p>Berdasarkan KMHU No. 82 Tahun 2026 tentang Pedoman Penetapan Istithaah Kesehatan Jemaah Haji Indonesia</p>
  </div>

  <div class="catatan-box">
    <b>Catatan Medis Operasional:</b> Pemeriksaan EKG 12-lead wajib dilakukan bagi seluruh calon jemaah haji. Apabila ditemukan gambaran EKG abnormal, jemaah wajib menjalani rujukan medis lanjutan ke Spesialis Jantung/Penyakit Dalam dan hasilnya diinput ke Siskohatkes untuk pemantauan berkala atau penetapan status Istithaah Kesehatan.
  </div>

  <!-- I. IDENTITAS CALON JEMAAH HAJI -->
  <table class="sec-tbl" cellpadding="0" cellspacing="0">
    <tr bgcolor="#0f172a">
      <td colspan="4" class="sec-header" valign="middle">I. IDENTITAS CALON JEMAAH HAJI</td>
    </tr>
    <tr>
      <td width="20%" valign="middle" style="padding:4pt 6pt; font-size:8.5pt; color:#1e293b;"><b>Nama Lengkap Jemaah:</b></td>
      <td width="38%" valign="middle" style="padding:4pt 6pt; font-size:8.5pt; border-bottom:1pt solid #cbd5e1;"><b>${patient.nama || '—'}</b></td>
      <td width="18%" valign="middle" style="padding:4pt 6pt; font-size:8.5pt; color:#1e293b;"><b>Nomor Porsi / NIK:</b></td>
      <td width="24%" valign="middle" style="padding:4pt 6pt; font-size:8.5pt; border-bottom:1pt solid #cbd5e1;"><b>${patient.nomorPorsi || '—'} / ${patient.nik || '—'}</b></td>
    </tr>
    <tr>
      <td valign="middle" style="padding:4pt 6pt; font-size:8.5pt; color:#1e293b;"><b>Umur & Jenis Kelamin:</b></td>
      <td valign="middle" style="padding:4pt 6pt; font-size:8.5pt; border-bottom:1pt solid #cbd5e1;">
        <b>${patient.umur ? `${patient.umur} Thn` : '— Thn'}</b> &nbsp;|&nbsp; 
        [${patient.jenisKelamin === 'L' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] L &nbsp;
        [${patient.jenisKelamin === 'P' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] P
      </td>
      <td valign="middle" style="padding:4pt 6pt; font-size:8.5pt; color:#1e293b;"><b>Kategori Haji:</b></td>
      <td valign="middle" style="padding:4pt 6pt; font-size:8.5pt; border-bottom:1pt solid #cbd5e1;">
        [${patient.kategoriHaji === 'Reguler' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Reguler &nbsp;
        [${patient.kategoriHaji === 'Haji Plus / Khusus' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Haji Plus
      </td>
    </tr>
    <tr>
      <td valign="middle" style="padding:4pt 6pt; font-size:8.5pt; color:#1e293b;"><b>Tanggal & Waktu EKG:</b></td>
      <td valign="middle" style="padding:4pt 6pt; font-size:8.5pt; border-bottom:1pt solid #cbd5e1;">${patient.tanggalEkg || '—'} Pukul: ${patient.waktuEkg || '—'} WIB</td>
      <td valign="middle" style="padding:4pt 6pt; font-size:8.5pt; color:#1e293b;"><b>No. Rekam Medis (RM):</b></td>
      <td valign="middle" style="padding:4pt 6pt; font-size:8.5pt; border-bottom:1pt solid #cbd5e1;"><b>${patient.noRM || '—'}</b></td>
    </tr>
  </table>

  <!-- II. PARAMETER KLINIS 12-LEAD -->
  <table class="sec-tbl" cellpadding="0" cellspacing="0">
    <tr bgcolor="#0f172a">
      <td colspan="4" class="sec-header" valign="middle">II. PARAMETER KLINIS INTERPRETASI EKG (12-LEAD)</td>
    </tr>
    <tr bgcolor="#f1f5f9">
      <td width="5%" align="center" valign="middle" style="padding:5pt 4pt; border:1pt solid #cbd5e1; border-bottom:1.5pt solid #0f172a; font-weight:bold; text-align:center;">No</td>
      <td width="22%" align="center" valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; border-bottom:1.5pt solid #0f172a; font-weight:bold; text-align:center;">Parameter EKG</td>
      <td width="45%" align="center" valign="middle" style="padding:5pt 8pt; border:1pt solid #cbd5e1; border-bottom:1.5pt solid #0f172a; font-weight:bold; text-align:center;">Hasil Temuan / Opsi Klinis (Centang Sesuai Gambaran EKG)</td>
      <td width="28%" align="center" valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; border-bottom:1.5pt solid #0f172a; font-weight:bold; text-align:center;">Keterangan Medis</td>
    </tr>

    <!-- Row 1 -->
    <tr>
      <td align="center" valign="middle" style="padding:5pt 4pt; text-align:center; font-weight:bold; border:1pt solid #cbd5e1;">1</td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1;"><b>Irama Jantung</b><br><span style="color:#64748b; font-size:7.5pt;">(Rhythm)</span></td>
      <td valign="middle" style="padding:5pt 8pt; line-height:1.4; border:1pt solid #cbd5e1;">
        [${parameters.irama === 'sinus_rhythm' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Sinus Rhythm (Normal)<br>
        [${parameters.irama === 'sinus_tachycardia' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Sinus Tachycardia (&gt; 100 bpm)<br>
        [${parameters.irama === 'sinus_bradycardia' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Sinus Bradycardia (&lt; 60 bpm)<br>
        [${parameters.irama === 'atrial_fibrilasi_flutter' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] <b>Atrium Fibrilasi / Atrial Flutter (Kriteria TMS)</b><br>
        [${parameters.irama === 'aritmia_lainnya' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Aritmia Lainnya: <b>${parameters.aritmiaLainnyaText || '—'}</b>
      </td>
      <td valign="middle" style="padding:5pt 6pt; line-height:1.35; color:#334155; border:1pt solid #cbd5e1;">Atrium Fibrilasi/Flutter merupakan kriteria langsung <b>Tidak Memenuhi Syarat (TMS)</b>.</td>
    </tr>

    <!-- Row 2 -->
    <tr>
      <td align="center" valign="middle" style="padding:5pt 4pt; text-align:center; font-weight:bold; border:1pt solid #cbd5e1;">2</td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1;"><b>Laju Denyut</b><br><span style="color:#64748b; font-size:7.5pt;">(Heart Rate)</span></td>
      <td valign="middle" style="padding:5pt 8pt; line-height:1.4; border:1pt solid #cbd5e1;">
        Laju: <b>${parameters.lajuDenyutBpm ? `${parameters.lajuDenyutBpm} bpm` : '— bpm'}</b><br>
        [${parameters.lajuDenyutKategori === 'normal' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Normal (60 – 100 bpm)<br>
        [${parameters.lajuDenyutKategori === 'takikardia' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] <b>Takikardia (&gt; 100 bpm) &rarr; Wajib Cek TSH Lab</b>
      </td>
      <td valign="middle" style="padding:5pt 6pt; line-height:1.35; color:#334155; border:1pt solid #cbd5e1;">Takikardia memerlukan konfirmasi lab TSH untuk mengesampingkan hipertiroidisme.</td>
    </tr>

    <!-- Row 3 -->
    <tr>
      <td align="center" valign="middle" style="padding:5pt 4pt; text-align:center; font-weight:bold; border:1pt solid #cbd5e1;">3</td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1;"><b>Aksis Jantung</b><br><span style="color:#64748b; font-size:7.5pt;">(Axis)</span></td>
      <td valign="middle" style="padding:5pt 8pt; line-height:1.4; border:1pt solid #cbd5e1;">
        [${parameters.aksis === 'normal' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Normal Axis (-30° s/d +90°)<br>
        [${parameters.aksis === 'lad' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Left Axis Deviation (LAD)<br>
        [${parameters.aksis === 'rad' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Right Axis Deviation (RAD)<br>
        [${parameters.aksis === 'extreme' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Extreme Axis
      </td>
      <td valign="middle" style="padding:5pt 6pt; line-height:1.35; color:#334155; border:1pt solid #cbd5e1;">LAD/RAD dapat mengindikasikan hipertrofi ventrikel atau gangguan konduksi.</td>
    </tr>

    <!-- Row 4 -->
    <tr>
      <td align="center" valign="middle" style="padding:5pt 4pt; text-align:center; font-weight:bold; border:1pt solid #cbd5e1;">4</td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1;"><b>Gelombang P & PR Interval</b></td>
      <td valign="middle" style="padding:5pt 8pt; line-height:1.4; border:1pt solid #cbd5e1;">
        [${parameters.gelombangP_PR === 'normal' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Normal (PR Interval 0.12 – 0.20s)<br>
        [${parameters.gelombangP_PR === 'av_block_1' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] AV Block Derajat I (PR &gt; 0.20s) &rarr; Perlu Rujukan<br>
        [${parameters.gelombangP_PR === 'av_block_2' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] <b>AV Block Derajat II (Mobitz I / II) (TMS)</b><br>
        [${parameters.gelombangP_PR === 'av_block_3' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] <b>AV Block Derajat III (Total Block) (TMS)</b>
      </td>
      <td valign="middle" style="padding:5pt 6pt; line-height:1.35; color:#334155; border:1pt solid #cbd5e1;">AV Block Derajat II dan III adalah kriteria permanen <b>TMS Istithaah</b>.</td>
    </tr>

    <!-- Row 5 -->
    <tr>
      <td align="center" valign="middle" style="padding:5pt 4pt; text-align:center; font-weight:bold; border:1pt solid #cbd5e1;">5</td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1;"><b>Durasi QRS & Konduksi</b></td>
      <td valign="middle" style="padding:5pt 8pt; line-height:1.4; border:1pt solid #cbd5e1;">
        [${parameters.durasiQRS === 'normal' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Normal (&lt; 0.12s)<br>
        [${parameters.durasiQRS === 'lbbb' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Left Bundle Branch Block (LBBB)<br>
        [${parameters.durasiQRS === 'rbbb' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Right Bundle Branch Block (RBBB)
      </td>
      <td valign="middle" style="padding:5pt 6pt; line-height:1.35; color:#334155; border:1pt solid #cbd5e1;">LBBB baru memerlukan evaluasi ketat penyakit jantung iskemik.</td>
    </tr>

    <!-- Row 6 -->
    <tr>
      <td align="center" valign="middle" style="padding:5pt 4pt; text-align:center; font-weight:bold; border:1pt solid #cbd5e1;">6</td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1;"><b>Segmen ST & Gelombang T</b></td>
      <td valign="middle" style="padding:5pt 8pt; line-height:1.4; border:1pt solid #cbd5e1;">
        [${parameters.segmenST_T === 'normal' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Normal / Isoelektrik<br>
        [${parameters.segmenST_T === 'st_depresi_t_inverted' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] ST Depresi / T Inverted &rarr; Suspek Iskemik Miokard<br>
        [${parameters.segmenST_T === 'st_elevasi_q_patologis' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] <b>ST Elevasi / Q Patologis &rarr; Infark Miokard Akut/Lama (TMS)</b>
      </td>
      <td valign="middle" style="padding:5pt 6pt; line-height:1.35; color:#334155; border:1pt solid #cbd5e1;">Iskemik/Infark Akut atau Kronik indikasi operasi masuk kriteria <b>TMS</b>.</td>
    </tr>

    <!-- Row 7 -->
    <tr>
      <td align="center" valign="middle" style="padding:5pt 4pt; text-align:center; font-weight:bold; border:1pt solid #cbd5e1;">7</td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1;"><b>Hipertrofi / Pembesaran</b></td>
      <td valign="middle" style="padding:5pt 8pt; line-height:1.4; border:1pt solid #cbd5e1;">
        [${parameters.hipertrofi === 'normal' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Normal<br>
        [${parameters.hipertrofi === 'lvh' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Kardiomegali / LVH (Sokolow-Lyon / Cornell)<br>
        [${parameters.hipertrofi === 'rvh' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] RVH
      </td>
      <td valign="middle" style="padding:5pt 6pt; line-height:1.35; color:#334155; border:1pt solid #cbd5e1;">Kardiomegali wajib dirujuk untuk Ekokardiografi (ukur LVEF %).</td>
    </tr>
  </table>

  <!-- III. KATEGORISASI SISKOHATKES -->
  <table class="sec-tbl" cellpadding="0" cellspacing="0">
    <tr bgcolor="#0f172a">
      <td class="sec-header" valign="middle">III. KATEGORISASI PENILAIAN SISKOHATKES (KMHU 82/2026)</td>
    </tr>
    <tr>
      <td style="padding:5pt 8pt; font-size:8pt; line-height:1.35;">
        <!-- Kategori A -->
        <table cellpadding="0" cellspacing="0" style="width:100%; margin-bottom:3pt; border-collapse:collapse; ${kategorisasi.kategori === 'KATEGORI_A' ? 'background-color:#f1f5f9; border:1pt solid #94a3b8;' : ''}">
          <tr>
            <td style="padding:3.5pt 5pt;">
              <b>[${kategorisasi.kategori === 'KATEGORI_A' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] KATEGORI A: NORMAL / TIDAK ADA KELAINAN BERMAKNA</b><br>
              <span style="color:#334155;">&bull; Gambaran EKG Sinus Rhythm normal, frekuensi 60-100 bpm, tanpa tanda iskemik/infark/aritmia.<br>
              &bull; <b>Tindak Lanjut Siskohatkes:</b> Langsung simpan dan lanjut ke Modul 3 Siskohatkes (unggah berkas EKG maks. 500 KB).</span>
            </td>
          </tr>
        </table>

        <!-- Kategori B -->
        <table cellpadding="0" cellspacing="0" style="width:100%; margin-bottom:3pt; border-collapse:collapse; ${kategorisasi.kategori === 'KATEGORI_B' ? 'background-color:#f1f5f9; border:1pt solid #94a3b8;' : ''}">
          <tr>
            <td style="padding:3.5pt 5pt;">
              <b>[${kategorisasi.kategori === 'KATEGORI_B' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] KATEGORI B: ABNORMAL — PERLU RUJUKAN SPESIALIS & EVALUASI PENGOBATAN</b><br>
              <span style="color:#334155;">&bull; Centang temuan: 
              [${kategorisasi.centangB.suspekIskemik ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Suspek Iskemik Miokard &nbsp;
              [${kategorisasi.centangB.kardiomegaliLVH ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Kardiomegali/LVH &nbsp;
              [${kategorisasi.centangB.avBlockSt1 ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] AV Block St. I &nbsp;
              [${kategorisasi.centangB.takikardia ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Takikardia (&gt;100 bpm)<br>
              &bull; <b>Tindak Lanjut Medis:</b> Rujuk Spesialis Jantung (EKG lanjutan/Ekokardiografi LVEF) atau Spesialis Penyakit Dalam (cek TSH).<br>
              &bull; <b>Tindak Lanjut Siskohatkes:</b> Input hasil rujukan spesialis, nilai LVEF (%), kadar TSH, dan obat pada Modul 4 & 9 Siskohatkes.</span>
            </td>
          </tr>
        </table>

        <!-- Kategori C -->
        <table cellpadding="0" cellspacing="0" style="width:100%; margin-bottom:0; border-collapse:collapse; ${kategorisasi.kategori === 'KATEGORI_C' ? 'background-color:#fef2f2; border:1pt solid #f87171;' : ''}">
          <tr>
            <td style="padding:3.5pt 5pt;">
              <b style="color:#991b1b;">[${kategorisasi.kategori === 'KATEGORI_C' ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] KATEGORI C: ABNORMAL BERAT — INDIKASI TIDAK MEMENUHI SYARAT (TMS) ISTITHAAH</b><br>
              <span style="color:#334155;">&bull; Centang temuan: 
              [${kategorisasi.centangC.atriumFibrilasiFlutter ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Atrium Fibrilasi / Flutter &nbsp;
              [${kategorisasi.centangC.avBlockSt2_3 ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] AV Block St. II / III &nbsp;
              [${kategorisasi.centangC.infarkMiokardAkut ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] Infark Miokard Akut/Iskemik Operasi &nbsp;
              [${kategorisasi.centangC.lvefDibawah40 ? '<b class="check-mark">&#10003;</b>' : '&nbsp;'}] LVEF &lt; 40%<br>
              &bull; <b>Tindak Lanjut Medis:</b> Evaluasi komprehensif tim medis & Satgas Istithaah Kesehatan.<br>
              &bull; <b>Tindak Lanjut Siskohatkes:</b> Input diagnosa spesialis di Modul 8 & Berita Acara sebagai dasar penetapan status TMS Istithaah.</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- IV. KESIMPULAN & PENGESAHAN -->
  <table class="sec-tbl" cellpadding="0" cellspacing="0">
    <tr bgcolor="#0f172a">
      <td class="sec-header" valign="middle">IV. KESIMPULAN KLINIS & PENGESAHAN DOKTER PEMERIKSA</td>
    </tr>
    <tr>
      <td style="padding:5pt 8pt; font-size:8pt; line-height:1.35;">
        <div style="margin-bottom:3pt;">
          <div style="font-weight:bold; color:#1e293b;">Kesimpulan Diagnostik EKG:</div>
          <div style="padding:2pt 0; font-weight:bold; color:#0f172a; margin-bottom:4pt;">
            ${kesimpulan.kesimpulanDiagnostik || 'Normal Sinus Rhythm, HR 75 bpm, aksis normal, tidak ditemukan tanda iskemia atau infark miokard.'}
          </div>
        </div>

        <div style="margin-bottom:3pt;">
          <div style="font-weight:bold; color:#1e293b;">Rencana Rujukan / Tindak Lanjut Penanganan Jemaah:</div>
          <div style="padding:2pt 0; font-weight:bold; color:#0f172a; margin-bottom:4pt;">
            ${kesimpulan.rencanaRujukan || 'Tidak memerlukan rujukan lanjutan kardiologi. Jemaah dapat melanjutkan tahapan pemeriksaan Siskohatkes.'}
          </div>
        </div>

        <table cellpadding="0" cellspacing="0" style="width:100%; margin-top:4pt; border-collapse:collapse;">
          <tr>
            <td width="48%" valign="top" style="padding:3pt 4pt;">
              <div style="color:#334155;">Tanggal Pembacaan EKG:</div>
              <div style="font-weight:bold; margin-top:2pt; color:#0f172a;">
                ${kesimpulan.tanggalPembacaan || '13/10/2026'}
              </div>
              <!-- Kolom CAP / STEMPEL BASAH di Halaman 1 tanpa teks di dalamnya -->
              <table cellpadding="0" cellspacing="0" style="width:140pt; height:56pt; border:1.5pt dashed #475569; background-color:#ffffff; margin-top:5pt; border-collapse:collapse;">
                <tr>
                  <td align="center" valign="middle" style="height:56pt; padding:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
            <td width="52%" align="center" valign="top" style="padding:3pt 4pt; text-align:center;">
              <div style="font-size:8pt; color:#334155;">Dokter Pembaca EKG / Spesialis Jantung:</div>
              <div style="height:36pt;">&nbsp;</div>
              <div style="font-weight:bold; text-transform:uppercase; color:#0f172a; text-align:center;">
                ( ${kesimpulan.dokterNama || 'dr. Pemeriksa EKG, Sp.JP'} )
              </div>
              <div style="font-size:7.5pt; font-family:monospace; margin-top:3pt; color:#334155;">
                NIP / NIDN: <b>${kesimpulan.nipNidn || '198503152010011002'}</b>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <table class="footer-meta" cellpadding="0" cellspacing="0">
    <tr>
      <td align="left" valign="middle">Lembar Evaluasi Klinis & Interpretasi EKG — Dokumen Rekam Medis Resmi Siskohatkes</td>
      <td align="right" valign="middle">Halaman 1 dari 2 (Folio F4)</td>
    </tr>
  </table>

  <!-- ==================== HALAMAN 2 (PAGE BREAK) ==================== -->
  <div class="page-break"></div>
  <br clear="all" style="page-break-before:always; mso-break-type:section-break;">

  <table class="top-meta" cellpadding="0" cellspacing="0" style="margin-top:6pt;">
    <tr>
      <td align="left" valign="middle">${faskes} — FORMULIR MEDIS SISKOHATKES 1448H/2027M</td>
      <td align="right" valign="middle">STANDAR KMHU NO. 82 TAHUN 2026</td>
    </tr>
  </table>

  <!-- V. MATRIKS RINGKASAN ALUR INPUT SISKOHATKES -->
  <table class="sec-tbl" cellpadding="0" cellspacing="0">
    <tr bgcolor="#0f172a">
      <td colspan="5" class="sec-header" valign="middle">V. MATRIKS RINGKASAN ALUR INPUT SISKOHATKES BERDASARKAN HASIL EKG</td>
    </tr>
    <tr bgcolor="#f1f5f9">
      <td width="22%" align="center" valign="middle" style="padding:5pt 5pt; border:1pt solid #cbd5e1; border-bottom:1.5pt solid #0f172a; font-weight:bold; text-align:center;">Hasil EKG Jemaah</td>
      <td width="14%" align="center" valign="middle" style="padding:5pt 4pt; border:1pt solid #cbd5e1; border-bottom:1.5pt solid #0f172a; font-weight:bold; text-align:center;">Kategori Siskohat</td>
      <td width="26%" align="center" valign="middle" style="padding:5pt 5pt; border:1pt solid #cbd5e1; border-bottom:1.5pt solid #0f172a; font-weight:bold; text-align:center;">Tindak Lanjut Rujukan Medis</td>
      <td width="20%" align="center" valign="middle" style="padding:5pt 5pt; border:1pt solid #cbd5e1; border-bottom:1.5pt solid #0f172a; font-weight:bold; text-align:center;">Modul Input Siskohatkes</td>
      <td width="18%" align="center" valign="middle" style="padding:5pt 5pt; border:1pt solid #cbd5e1; border-bottom:1.5pt solid #0f172a; font-weight:bold; text-align:center;">Rekomendasi Status Istithaah</td>
    </tr>

    <!-- Matriks Row 1 -->
    <tr>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        <b>Sinus Rhythm Normal</b><br>
        <span style="font-size:7.5pt; color:#64748b;">(HR 60-100 bpm, Aksis normal, tanpa iskemik)</span>
      </td>
      <td align="center" valign="middle" style="padding:5pt 4pt; text-align:center; font-weight:bold; color:#047857; border:1pt solid #cbd5e1;">
        Kategori A<br>(Normal)
      </td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">Tidak memerlukan rujukan lanjutan.</td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        <b>Modul 3:</b><br>Unggah berkas EKG (format jpg/png, &lt; 500 KB).
      </td>
      <td valign="middle" style="padding:5pt 6pt; font-weight:bold; color:#047857; border:1pt solid #cbd5e1; line-height:1.35;">Memenuhi Syarat Istithaah Kesehatan</td>
    </tr>

    <!-- Matriks Row 2 -->
    <tr>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        <b>ST Depresi / T Inverted</b><br>
        <span style="font-size:7.5pt; color:#64748b;">(Suspek Iskemik Miokard)</span>
      </td>
      <td align="center" valign="middle" style="padding:5pt 4pt; text-align:center; font-weight:bold; color:#b45309; border:1pt solid #cbd5e1;">
        Kategori B<br>(Abnormal)
      </td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        Rujuk Dokter Spesialis Jantung (Treadmill test / Angiografi bila perlu).
      </td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        <b>Modul 4 & 9:</b><br>Input Diagnosa (ICD-10 Iskemik dan resep obat rutin).
      </td>
      <td valign="middle" style="padding:5pt 6pt; font-weight:bold; border:1pt solid #cbd5e1; line-height:1.35;">Memenuhi Syarat dengan Pendampingan (jika stabil)</td>
    </tr>

    <!-- Matriks Row 3 -->
    <tr>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        <b>Kardiomegali / LVH</b><br>
        <span style="font-size:7.5pt; color:#64748b;">(Pembesaran Jantung)</span>
      </td>
      <td align="center" valign="middle" style="padding:5pt 4pt; text-align:center; font-weight:bold; color:#b45309; border:1pt solid #cbd5e1;">
        Kategori B<br>(Abnormal)
      </td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        Rujuk Dokter Spesialis Jantung untuk Ekokardiografi (Ukur LVEF %).
      </td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        <b>Modul 4:</b><br>Input persentase LVEF (%) dan kondisi katup.
      </td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">Memenuhi Syarat (LVEF &ge;40%) / TMS (LVEF &lt;40%)</td>
    </tr>

    <!-- Matriks Row 4 -->
    <tr>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        <b>Sinus Takikardia</b><br>
        <span style="font-size:7.5pt; color:#64748b;">(HR &gt; 100 bpm konsisten)</span>
      </td>
      <td align="center" valign="middle" style="padding:5pt 4pt; text-align:center; font-weight:bold; color:#b45309; border:1pt solid #cbd5e1;">
        Kategori B<br>(Abnormal)
      </td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        Rujuk Spesialis Penyakit Dalam / Jantung & Pemeriksaan Lab TSH.
      </td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        <b>Modul 3 & 4:</b><br>Input nilai lab TSH dan terapi anti-aritmia/tiroid.
      </td>
      <td valign="middle" style="padding:5pt 6pt; font-weight:bold; color:#b45309; border:1pt solid #cbd5e1; line-height:1.35;">TMS Sementara sampai kadar TSH & HR terkontrol</td>
    </tr>

    <!-- Matriks Row 5 -->
    <tr>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35; color:#b91c1c;">
        <b>Atrium Fibrilasi / Flutter</b><br>
        <span style="font-size:7.5pt; color:#64748b;">(Aritmia Berat)</span>
      </td>
      <td align="center" valign="middle" style="padding:5pt 4pt; text-align:center; font-weight:bold; color:#b91c1c; border:1pt solid #cbd5e1;">
        Kategori C<br>(TMS)
      </td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        Rujuk Spesialis Jantung untuk evaluasi keamanan penerbangan (Fit to Fly).
      </td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        <b>Modul 8 & Berita Acara:</b><br>Input kode ICD-10 I48 dan status TMS.
      </td>
      <td valign="middle" style="padding:5pt 6pt; font-weight:bold; color:#b91c1c; border:1pt solid #cbd5e1; line-height:1.35;">Tidak Memenuhi Syarat (TMS) Istithaah Kesehatan</td>
    </tr>

    <!-- Matriks Row 6 -->
    <tr>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35; color:#b91c1c;">
        <b>AV Block Derajat II / III</b><br>
        <span style="font-size:7.5pt; color:#64748b;">(Total Heart Block)</span>
      </td>
      <td align="center" valign="middle" style="padding:5pt 4pt; text-align:center; font-weight:bold; color:#b91c1c; border:1pt solid #cbd5e1;">
        Kategori C<br>(TMS)
      </td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        Rujuk Spesialis Jantung (Indikasi Pacemaker / TPM/PPM).
      </td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        <b>Modul 8 & Berita Acara:</b><br>Input kode ICD-10 I44.1/I44.2 dan status TMS.
      </td>
      <td valign="middle" style="padding:5pt 6pt; font-weight:bold; color:#b91c1c; border:1pt solid #cbd5e1; line-height:1.35;">Tidak Memenuhi Syarat (TMS) Istithaah Kesehatan</td>
    </tr>

    <!-- Matriks Row 7 -->
    <tr>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35; color:#b91c1c;">
        <b>Infark Miokard Akut / ST Elevasi</b><br>
        <span style="font-size:7.5pt; color:#64748b;">(AMI / STEMI / NSTEMI)</span>
      </td>
      <td align="center" valign="middle" style="padding:5pt 4pt; text-align:center; font-weight:bold; color:#b91c1c; border:1pt solid #cbd5e1;">
        Kategori C<br>(TMS)
      </td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        Penanganan Darurat Medis / Rawat Inap ICCU.
      </td>
      <td valign="middle" style="padding:5pt 6pt; border:1pt solid #cbd5e1; line-height:1.35;">
        <b>Modul 8 & Berita Acara:</b><br>Input kode ICD-10 I21 dan status TMS.
      </td>
      <td valign="middle" style="padding:5pt 6pt; font-weight:bold; color:#b91c1c; border:1pt solid #cbd5e1; line-height:1.35;">Tidak Memenuhi Syarat (TMS) Istithaah Kesehatan</td>
    </tr>
  </table>

  <!-- STANDAR PROSEDUR OPERASIONAL -->
  <table class="sec-tbl" cellpadding="0" cellspacing="0">
    <tr bgcolor="#f1f5f9">
      <td style="padding:4.5pt 8pt; font-weight:bold; font-size:8pt; border-bottom:1pt solid #0f172a; color:#0f172a;">
        STANDAR PROSEDUR OPERASIONAL (SPO) VERIFIKASI SISKOHATKES ${faskes}:
      </td>
    </tr>
    <tr>
      <td style="padding:5pt 8pt; font-size:8pt; background-color:#f8fafc;">
        <ol style="margin:0; padding-left:14pt; line-height:1.45; color:#334155;">
          <li style="margin-bottom:2pt;">Petugas/Perawat MCU wajib memeriksa keterisian lembar EKG secara lengkap sebelum mengunggah berkas ke Modul 3 Siskohatkes.</li>
          <li style="margin-bottom:2pt;">Dokter pemeriksa wajib mencantumkan NIP/NIDN pada lembar pengesahan dan memastikan kode ICD-10 yang diinput di Modul 8 sesuai dengan hasil rujukan spesialis.</li>
          <li>Berkas fisik lembar EKG asli dan interpretasi ini diarsip dalam Rekam Medis ${faskes}.</li>
        </ol>
      </td>
    </tr>
  </table>

  <!-- Verification Notice -->
  <table cellpadding="0" cellspacing="0" style="margin-top:6pt; margin-bottom:0; width:100%; border-collapse:collapse; border-top:1pt solid #cbd5e1; padding-top:4pt;">
    <tr>
      <td width="65%" valign="middle" style="font-size:8pt; color:#334155; line-height:1.4; padding:3pt 4pt;">
        <b>Verifikasi Sistem Komputerisasi Haji Terpadu Kesehatan (Siskohatkes)</b><br>
        Berdasarkan KMHU Nomor 82 Tahun 2026 tentang Pedoman Penetapan Istithaah Kesehatan Jemaah Haji.<br>
        <span style="font-size:7.5pt; color:#64748b; font-style:italic;">Dokumen Rekam Medis Resmi ini sah dan terintegrasi dengan modul pemeriksaan kesehatan haji nasional.</span>
      </td>
      <td width="35%" align="right" valign="middle" style="text-align:right; font-size:8pt; padding:3pt 4pt;">
        <b>${faskes}</b><br>
        <span style="color:#64748b;">${faskesLoc}</span>
      </td>
    </tr>
  </table>

  <table class="footer-meta" cellpadding="0" cellspacing="0">
    <tr>
      <td align="left" valign="middle">Lembar Evaluasi Klinis & Interpretasi EKG — Dokumen Rekam Medis Resmi Siskohatkes</td>
      <td align="right" valign="middle">Halaman 2 dari 2 (Folio F4)</td>
    </tr>
  </table>

</div>
</body>
</html>
`;

  // Create Word document Blob
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
