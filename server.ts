import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser for base64 ECG photo and audio payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Helper to initialize Gemini SDK
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// System instruction for ECG interpretation strictly adhering to KMHU No. 82 Tahun 2026
const ECG_ANALYSIS_SYSTEM_INSTRUCTION = `
Anda adalah dokter spesialis jantung & pembaca EKG resmi untuk pemeriksaan kesehatan calon jemaah haji Indonesia berdasarkan:
"KMHU NO. 82 TAHUN 2026 TENTANG PEDOMAN PENETAPAN ISTITHAAH KESEHATAN JEMAAH HAJI INDONESIA"
dan standar operasional SISKOHATKES RSUD PESANGGRAHAN (1448H/2027M).

Tugas Anda:
Analisis foto/scan rekaman EKG 12-lead yang diberikan dengan cermat dan objektif.
Ekstrak parameter klinis dan tentukan kategorisasi Siskohatkes secara akurat.

ATURAN KRITIS KLINIS KMHU 82/2026:
1. Irama Jantung (Rhythm):
   - Sinus Rhythm: normal
   - Sinus Tachycardia (> 100 bpm)
   - Sinus Bradycardia (< 60 bpm)
   - Atrium Fibrilasi / Atrial Flutter: KRITERIA LANGSUNG TIDAK MEMENUHI SYARAT (TMS) ISTITHAAH (Kategori C, ICD-10 I48)
   - Aritmia Lainnya: (sebutkan spesifik seperti PVC bermakna, PAC, SVT)

2. Laju Denyut (Heart Rate):
   - Hitung laju bpm (60-100 normal; >100 takikardia; <60 bradikardia).
   - Takikardia konsisten (>100 bpm) wajib cek lab TSH untuk menyingkirkan hipertiroidisme (Kategori B, TMS Sementara).

3. Aksis Jantung (Axis):
   - Normal Axis (-30° s/d +90°)
   - Left Axis Deviation (LAD)
   - Right Axis Deviation (RAD)
   - Extreme Axis
   (LAD/RAD dapat mengindikasikan hipertrofi ventrikel atau defek konduksi).

4. Gelombang P & PR Interval:
   - Normal (0.12 - 0.20 detik / 3-5 kotak kecil)
   - AV Block Derajat I (PR > 0.20s): Perlu Rujukan (Kategori B)
   - AV Block Derajat II (Mobitz I / II): KRITERIA PERMANEN TMS ISTITHAAH (Kategori C, ICD-10 I44.1)
   - AV Block Derajat III (Total Block): KRITERIA PERMANEN TMS ISTITHAAH (Kategori C, ICD-10 I44.2)

5. Durasi QRS & Konduksi:
   - Normal (< 0.12 detik / < 3 kotak kecil)
   - Left Bundle Branch Block (LBBB): LBBB baru memerlukan evaluasi ketat penyakit jantung iskemik (Kategori B)
   - Right Bundle Branch Block (RBBB)

6. Segmen ST & Gelombang T:
   - Normal / Isoelektrik
   - ST Depresi / T Inverted: Suspek Iskemik Miokard (Kategori B, ICD-10 Iskemik, Rujuk Sp.JP Treadmill/Angiografi)
   - ST Elevasi / Q Patologis: Infark Miokard Akut/Lama (Kategori C - TMS Istithaah, ICCU, ICD-10 I21)

7. Hipertrofi / Pembesaran:
   - Normal
   - Kardiomegali / LVH (Sokolow-Lyon S di V1 + R di V5/V6 >= 35mm atau Cornell criteria): Wajib Rujuk Ekokardiografi (Ukur LVEF %)
   - RVH

KATEGORISASI SISKOHATKES:
- KATEGORI A: NORMAL / TIDAK ADA KELAINAN BERMAKNA
  * Sinus Rhythm normal, frekuensi 60-100 bpm, aksis normal, tanpa iskemik/infark/aritmia.
  * Rekomendasi: Memenuhi Syarat Istithaah Kesehatan. Lanjut Modul 3 Siskohatkes (unggah berkas EKG < 500 KB).

- KATEGORI B: ABNORMAL — PERLU RUJUKAN SPESIALIS & EVALUASI PENGOBATAN
  * Temuan: Suspek Iskemik Miokard (ST Depresi/T Inverted), Kardiomegali/LVH, AV Block St. I, Takikardia (>100 bpm konsisten), LBBB baru.
  * Rekomendasi: Memenuhi Syarat dengan Pendampingan (jika stabil & LVEF >= 40%) ATAU TMS Sementara sampai kadar TSH & HR terkontrol.
  * Modul Siskohatkes: Modul 4 & 9 (input hasil rujukan, LVEF %, kadar TSH, resep obat).

- KATEGORI C: ABNORMAL BERAT — INDIKASI TIDAK MEMENUHI SYARAT (TMS) ISTITHAAH
  * Temuan: Atrium Fibrilasi / Flutter (ICD-10 I48), AV Block St. II / III (ICD-10 I44.1/I44.2), Infark Miokard Akut / STEMI / NSTEMI (ICD-10 I21), LVEF < 40%.
  * Rekomendasi: Tidak Memenuhi Syarat (TMS) Istithaah Kesehatan.
  * Modul Siskohatkes: Modul 8 & Berita Acara sebagai dasar penetapan status TMS.

Balas dalam format JSON terstruktur valid murni tanpa markdown formatting.
`;

// API endpoint to analyze ECG image
app.post('/api/gemini/analyze-ekg', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', patientData } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Foto EKG wajib diunggah (imageBase64 required).' });
    }

    // Clean base64 header if included
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const ai = getGeminiClient();

    const promptText = `
Analisis rekaman foto EKG 12-lead ini secara terperinci.
Konteks Calon Jemaah:
Nama: ${patientData?.nama || 'Belum diisi'}
Umur: ${patientData?.umur || 'Belum diisi'} tahun
Jenis Kelamin: ${patientData?.jenisKelamin || 'L/P'}
Nomor Porsi: ${patientData?.nomorPorsi || '-'}

Harap kembalikan respon JSON dengan skema berikut:
{
  "irama": {
    "status": "sinus_rhythm" | "sinus_tachycardia" | "sinus_bradycardia" | "atrial_fibrilasi_flutter" | "aritmia_lainnya",
    "keterangan": string,
    "aritmiaDetail": string
  },
  "lajuDenyut": {
    "bpm": number,
    "kategori": "normal" | "takikardia" | "bradikardia",
    "wajibCekTSH": boolean,
    "keterangan": string
  },
  "aksis": {
    "tipe": "normal" | "lad" | "rad" | "extreme",
    "derajat": string,
    "keterangan": string
  },
  "gelombangP_PR": {
    "status": "normal" | "av_block_1" | "av_block_2" | "av_block_3",
    "prIntervalDetik": number,
    "keterangan": string,
    "isTMS": boolean
  },
  "qrs_konduksi": {
    "status": "normal" | "lbbb" | "rbbb",
    "durasiDetik": number,
    "keterangan": string
  },
  "st_t": {
    "status": "normal" | "st_depresi_t_inverted" | "st_elevasi_q_patologis",
    "leadTerlibat": string,
    "keterangan": string,
    "isIskemikInfark": boolean
  },
  "hipertrofi": {
    "status": "normal" | "lvh" | "rvh",
    "kriteria": string,
    "wajibEchoLVEF": boolean,
    "keterangan": string
  },
  "kategorisasi": {
    "kategori": "KATEGORI_A" | "KATEGORI_B" | "KATEGORI_C",
    "namaKategori": string,
    "rekomendasiStatusIstithaah": "Memenuhi Syarat Istithaah Kesehatan" | "Memenuhi Syarat dengan Pendampingan" | "TMS Sementara" | "Tidak Memenuhi Syarat (TMS) Istithaah Kesehatan",
    "tindakLanjutMedis": string,
    "tindakLanjutSiskohatkes": string,
    "modulSiskohatkes": string,
    "kodeICD10": string,
    "centangTemuan": {
      "suspekIskemik": boolean,
      "kardiomegaliLVH": boolean,
      "avBlockSt1": boolean,
      "takikardia": boolean,
      "atriumFibrilasiFlutter": boolean,
      "avBlockSt2_3": boolean,
      "infarkMiokardAkut": boolean,
      "lvefDibawah40": boolean
    }
  },
  "kesimpulanDiagnostik": string,
  "rencanaRujukanTindakLanjut": string,
  "catatanLead": string
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: promptText,
          },
        ],
      },
      config: {
        systemInstruction: ECG_ANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
      },
    });

    const jsonText = response.text ? response.text.trim() : '{}';
    let parsedResult;
    try {
      parsedResult = JSON.parse(jsonText);
    } catch {
      // Clean possible markdown code fences if present
      const cleaned = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    return res.json({ success: true, data: parsedResult });
  } catch (error: any) {
    console.error('Error analyzing ECG with Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Gagal memproses interpretasi EKG dengan Gemini AI.',
    });
  }
});

// API endpoint to transcribe doctor voice dictation
app.post('/api/gemini/transcribe-dictation', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data is required.' });
    }

    const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, '');

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          {
            text: 'Transkripsikan rekaman audio dikte medis dokter ini secara akurat ke dalam bahasa Indonesia untuk kesimpulan klinis atau rencana rujukan EKG calon jemaah haji.',
          },
        ],
      },
    });

    const transcription = response.text ? response.text.trim() : '';
    return res.json({ success: true, transcription });
  } catch (error: any) {
    console.error('Error transcribing audio with Gemini:', error);
    return res.status(500).json({
      error: error.message || 'Gagal mentranskripsi audio dikte dokter.',
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Siskohatkes EKG App server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
