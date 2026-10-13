# Sistem Pembaca Interpretasi EKG & Penetapan Istithaah Haji 2026 (KMHU No. 82 Tahun 2026)

Aplikasi medis klinis untuk membaca, menginterpretasikan foto rekaman EKG 12-lead secara otomatis menggunakan multimodal AI Gemini, mengevaluasi parameter kardiologi standar KMHU 82/2026, memetakan kategori Siskohatkes (Kategori A, B, C / TMS), serta menyusun dan mencetak Formulir Medis Siskohatkes 2 Halaman Resmi siap cetak / simpan PDF.

## User Review & Critical Decisions

> [!IMPORTANT]
> Berdasarkan konfirmasi dari klarifikasi sebelumnya, keputusan sistem dirumuskan sebagai berikut:

- **Confirmed Decision 1 (Format Output)**: Sistem menghasilkan **Formulir Resmi 2 Halaman Lengkap** yang dapat dicetak langsung (Print to PDF / Lembar Rekam Medis) presisi 1:1 mengikuti format resmi RSUD Pesanggrahan - Dokumen Rekam Medis Resmi Siskohatkes 1448H/2027M.
- **Confirmed Decision 2 (Interaksi & Koreksi)**: Analisis Otomatis Foto EKG dengan AI Vision Gemini, dilengkapi **Editor Koreksi Manual Klinis** bagi dokter pemeriksa (menyesuaikan checklist parameter, laju denyut, aksis, kesimpulan, dan rencana rujukan sebelum pengesahan).
- **Confirmed Decision 3 (Header Faskes)**: Default identitas fasilitas kesehatan menggunakan **RSUD PESANGGRAHAN JAKARTA SELATAN**, dengan fleksibilitas dokter untuk menyesuaikan nama Faskes / Rumah Sakit / Puskesmas pemeriksa bila diperlukan.
- **Additional Intelligence**: Terintegrasi Gemini Multimodal Vision (`gemini-3.8-flash` di backend aman) untuk membaca lead I, II, III, aVR, aVL, aVF, V1-V6, mendeteksi HR, PR interval, QRS, ST-T wave, aritmia, serta fitur input suara/dikte catatan dokter menggunakan `gemini-3.5-transcribe`.

---

## 1. Overview & Core Concept

### What It Does
1. **Unggah Foto EKG 12-Lead**: Dokter / perawat MCU mengunggah foto atau scan lembar EKG calon jemaah haji (mendukung drag-and-drop, kamera perangkat, dan contoh berkas EKG sampel klinis).
2. **Analisis Otomatis Berbasis KMHU 82/2026**: Backend Gemini menganalisis gambar EKG dan mengisi seluruh 7 Parameter Klinis:
   - **Irama (Rhythm)**: Sinus Rhythm, Sinus Tachycardia, Sinus Bradycardia, Atrium Fibrilasi / Atrial Flutter (Kriteria TMS), Aritmia Lainnya.
   - **Laju Denyut (Heart Rate)**: Nilai BPM, normal (60-100), takikardia (>100 bpm wajib cek TSH lab).
   - **Aksis Jantung (Axis)**: Normal (-30° s/d +90°), LAD, RAD, Extreme Axis.
   - **Gelombang P & PR Interval**: Normal (0.12 - 0.20s), AV Block Derajat I (rujukan), AV Block Derajat II / III (Kriteria TMS Permanen).
   - **Durasi QRS & Konduksi**: Normal (<0.12s), LBBB, RBBB.
   - **Segmen ST & Gelombang T**: Normal/Isoelektrik, ST Depresi/T Inverted (Suspek Iskemik Miokard), ST Elevasi/Q Patologis (Infark Miokard Akut/Lama).
   - **Hipertrofi / Pembesaran**: Normal, Kardiomegali / LVH (Sokolow-Lyon/Cornell), RVH (wajib rujuk echo ukur LVEF%).
3. **Kategorisasi Otomatis Siskohatkes**:
   - **Kategori A (Normal / Memenuhi Syarat)**: Lanjut Modul 3 Siskohatkes (<500 KB).
   - **Kategori B (Abnormal / Rujukan & Evaluasi)**: Memenuhi Syarat dengan Pendampingan / TMS Sementara (Modul 4 & 9 Siskohatkes).
   - **Kategori C (Abnormal Berat / TMS Istithaah)**: Input Modul 8 & Berita Acara (AFib/Flutter, AV Block II/III, Infark Miokard Akut, LVEF <40%).
4. **Matriks Alur Input Siskohatkes & Kode ICD-10**: Pemetaan otomatis tabel Halaman 2 (ICD-10 I48, I44.1/I44.2, I21, LVEF, TSH, modul input).
5. **Formulir Resmi 2 Halaman & Cetak PDF**: Format presisi dokumen rekam medis resmi untuk arsip fisik RSUD dan entri Siskohatkes Kemenag RI.

### Target Audience / Persona
- Dokter Pemeriksa MCU Haji, Dokter Spesialis Jantung & Pembuluh Darah (Sp.JP), Dokter Spesialis Penyakit Dalam (Sp.PD), dan Tim Pemeriksa Kesehatan Haji Indonesia (TKHI/Satgas Istithaah).

---

## 2. User Experience & Visual Design

### Key User Flows
```
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│ 1. Input Identitas      │ ----> │ 2. Unggah & Analisis    │ ----> │ 3. Review & Koreksi     │
│    Jemaah & Dokter      │       │    Foto EKG (Gemini AI) │       │    Parameter Klinis     │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
                                                                                 │
                                                                                 ▼
┌─────────────────────────┐       ┌─────────────────────────┐       ┌─────────────────────────┐
│ 6. Unduh / Cetak PDF    │ <---- │ 5. Matriks Alur         │ <---- │ 4. Penetapan Kategori   │
│    2 Halaman Resmi      │       │    Siskohatkes (Hal 2)  │       │    Istithaah (Hal 1)    │
└─────────────────────────┘       └─────────────────────────┘       └─────────────────────────┘
```

### Visual Identity & Theme
- **Aesthetic Direction**: Clinical Precision, Institutional Indonesian Health Standard, High-Legibility Medical Typography.
- **Palette**:
  - Background: Clean Medical Slate (`#F8FAFC`, `#FFFFFF`)
  - Accent Primary: Deep Siskohat Navy (`#0F2942`) & Emerald Health (`#047857`)
  - Warning/Alert: Telemetry Amber (`#D97706`) & Critical Rose (`#DC2626`)
  - Borders: Crisp 1px hairline dividers (`border-slate-300`)
- **Print Optimization**: Dedicated CSS `@media print` with exact A4 portrait dimensions, zero cutoff, matching the exact lines, checkboxes `[✓]`, headers, tables, and signature stamps shown in the source document.

---

## 3. Key Product Decisions & Trade-Offs

- **Server-Side Gemini API Proxy**: Menjalankan analisis EKG multimodal melalui `/api/gemini/analyze-ekg` dan `/api/gemini/transcribe-dictation` menggunakan `@google/genai` dengan model `gemini-3.8-flash` dan `gemini-3.5-transcribe` sesuai panduan keamanan AI Studio.
- **Dua Mode Tampilan**:
  - *Mode Kerja / Dashboard*: Antarmuka digital responsif dengan pratinjau citra EKG, zoom/pan detail lead, panduan klinis real-time, dan input cepat.
  - *Mode Formulir Resmi (Print Preview)*: Pratinjau 2 Halaman A4 identik 100% dengan lembar rekam medis RSUD Pesanggrahan KMHU 82/2026.
- **Presets & EKG Sampel Klinis**: Menyediakan 4 sampel EKG klinis pra-konfigurasi (Normal Sinus, Iskemik ST Depresi/T Inverted, Atrial Fibrilasi TMS, AV Block Derajat III Total Block) untuk pengujian instan tanpa harus mencari file sendiri.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React 19 Frontend (SPA)                         │
│  - IdentitasJemaahForm (Nama, Porsi/NIK, Usia, JK, Tgl, No RM)         │
│  - EkgImageUploader (File Dropzone, Camera, Lead Zoom Viewer)          │
│  - ParameterKlinisEditor (7 Parameter Tabel I-II, Interaktif)          │
│  - KategorisasiSiskohatSection (Kategori A, B, C KMHU 82/2026)         │
│  - MatriksSiskohatTable (Halaman 2 Alur Input & Kode ICD-10)           │
│  - OfficialPrintDocument (2-Page A4 Precision Printable Medical Sheet) │
│  - DoctorVoiceDictation (Dikte Catatan Klinis dengan Transcribe)       │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                         HTTP POST (JSON / Base64)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      Express Backend / API Routes                      │
│  - POST /api/gemini/analyze-ekg                                        │
│    -> Calls @google/genai (model: gemini-3.8-flash)                    │
│    -> Multimodal image inspection & structured JSON schema extraction  │
│  - POST /api/gemini/transcribe-dictation                               │
│    -> Calls @google/genai (model: gemini-3.5-transcribe)               │
│    -> Audio stream/base64 to text for doctor notes                     │
└────────────────────────────────────────────────────────────────────────┘
```
