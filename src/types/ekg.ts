export interface PatientIdentity {
  nama: string;
  nomorPorsi: string;
  nik: string;
  umur: number | '';
  jenisKelamin: 'L' | 'P';
  kategoriHaji: 'Reguler' | 'Haji Plus / Khusus';
  tanggalEkg: string;
  waktuEkg: string;
  noRM: string;
  faskesName: string;
  faskesLocation: string;
  dokterNama: string;
  nipNidn: string;
}

export type IramaType = 
  | 'sinus_rhythm'
  | 'sinus_tachycardia'
  | 'sinus_bradycardia'
  | 'atrial_fibrilasi_flutter'
  | 'aritmia_lainnya';

export type AksisType = 'normal' | 'lad' | 'rad' | 'extreme';

export type PRBlockType = 'normal' | 'av_block_1' | 'av_block_2' | 'av_block_3';

export type QRSType = 'normal' | 'lbbb' | 'rbbb';

export type STWaveType = 'normal' | 'st_depresi_t_inverted' | 'st_elevasi_q_patologis';

export type HipertrofiType = 'normal' | 'lvh' | 'rvh';

export type KategoriSiskohatType = 'KATEGORI_A' | 'KATEGORI_B' | 'KATEGORI_C';

export interface ParameterKlinis {
  irama: IramaType;
  aritmiaLainnyaText: string;
  lajuDenyutBpm: number | '';
  lajuDenyutKategori: 'normal' | 'takikardia' | 'bradikardia';
  aksis: AksisType;
  gelombangP_PR: PRBlockType;
  durasiQRS: QRSType;
  segmenST_T: STWaveType;
  hipertrofi: HipertrofiType;
}

export interface KategorisasiSiskohat {
  kategori: KategoriSiskohatType;
  centangB: {
    suspekIskemik: boolean;
    kardiomegaliLVH: boolean;
    avBlockSt1: boolean;
    takikardia: boolean;
  };
  centangC: {
    atriumFibrilasiFlutter: boolean;
    avBlockSt2_3: boolean;
    infarkMiokardAkut: boolean;
    lvefDibawah40: boolean;
  };
  rekomendasiStatusIstithaah: string;
  tindakLanjutMedis: string;
  tindakLanjutSiskohatkes: string;
  modulInput: string;
  kodeICD10: string;
}

export interface KesimpulanDokter {
  kesimpulanDiagnostik: string;
  rencanaRujukan: string;
  tanggalPembacaan: string;
  dokterNama: string;
  nipNidn: string;
}

export interface MatriksRow {
  hasilEkg: string;
  kategoriSiskohat: 'Kategori A (Normal)' | 'Kategori B (Abnormal)' | 'Kategori C (TMS)';
  tindakLanjutRujukan: string;
  modulInput: string;
  rekomendasiStatus: string;
  kodeICD10?: string;
  highlight?: boolean;
}

export interface EkgHistoryItem {
  id: string;
  savedAt: string; // ISO string e.g. "2026-10-13T12:35:00.000Z"
  patient: PatientIdentity;
  parameters: ParameterKlinis;
  kategorisasi: KategorisasiSiskohat;
  kesimpulan: KesimpulanDokter;
  uploadedImage?: string | null;
  notes?: string;
}

