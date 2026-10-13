import React from 'react';
import { PatientIdentity } from '../types/ekg';
import { User, Calendar, Clock, FileText, Stethoscope } from 'lucide-react';

interface PatientFormProps {
  patient: PatientIdentity;
  onChange: (updated: PatientIdentity) => void;
}

export const PatientForm: React.FC<PatientFormProps> = ({ patient, onChange }) => {
  const updateField = <K extends keyof PatientIdentity>(field: K, value: PatientIdentity[K]) => {
    onChange({
      ...patient,
      [field]: value,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
            I
          </div>
          <h2 className="text-sm font-bold tracking-wide uppercase text-slate-900">
            Identitas Calon Jemaah Haji
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Dokumen Rekam Medis Resmi Siskohatkes 1448H/2027M
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Nama Lengkap */}
        <div className="md:col-span-2 lg:col-span-1">
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Nama Lengkap Jemaah:
          </label>
          <input
            type="text"
            value={patient.nama}
            onChange={(e) => updateField('nama', e.target.value)}
            placeholder="Contoh: H. AHMAD FAUZI"
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-colors uppercase"
          />
        </div>

        {/* Nomor Porsi & NIK */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            Nomor Porsi / NIK:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={patient.nomorPorsi}
              onChange={(e) => updateField('nomorPorsi', e.target.value)}
              placeholder="No. Porsi (10 digit)"
              className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-md bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 font-mono"
            />
            <input
              type="text"
              value={patient.nik}
              onChange={(e) => updateField('nik', e.target.value)}
              placeholder="NIK (16 digit)"
              className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-md bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 font-mono"
            />
          </div>
        </div>

        {/* Umur & Jenis Kelamin */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Umur & Jenis Kelamin:
          </label>
          <div className="flex items-center gap-2">
            <div className="relative w-24">
              <input
                type="number"
                value={patient.umur}
                onChange={(e) => updateField('umur', e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                placeholder="Umur"
                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-md bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 font-mono pr-7"
              />
              <span className="absolute right-2 top-2 text-[11px] text-slate-400">Thn</span>
            </div>
            <div className="flex items-center gap-2 border border-slate-300 rounded-md px-3 py-1.5 bg-slate-50/50 text-xs">
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="jenisKelamin"
                  checked={patient.jenisKelamin === 'L'}
                  onChange={() => updateField('jenisKelamin', 'L')}
                  className="text-emerald-700 focus:ring-emerald-600"
                />
                <span>Laki-Laki (L)</span>
              </label>
              <span className="text-slate-300">|</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="radio"
                  name="jenisKelamin"
                  checked={patient.jenisKelamin === 'P'}
                  onChange={() => updateField('jenisKelamin', 'P')}
                  className="text-emerald-700 focus:ring-emerald-600"
                />
                <span>Perempuan (P)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Kategori Haji */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kategori Haji:
          </label>
          <div className="flex items-center gap-4 border border-slate-300 rounded-md px-3 py-2 bg-slate-50/50 text-xs">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="kategoriHaji"
                checked={patient.kategoriHaji === 'Reguler'}
                onChange={() => updateField('kategoriHaji', 'Reguler')}
                className="text-emerald-700 focus:ring-emerald-600"
              />
              <span className="font-medium text-slate-800">Reguler</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="kategoriHaji"
                checked={patient.kategoriHaji === 'Haji Plus / Khusus'}
                onChange={() => updateField('kategoriHaji', 'Haji Plus / Khusus')}
                className="text-emerald-700 focus:ring-emerald-600"
              />
              <span className="font-medium text-slate-800">Haji Plus / Khusus</span>
            </label>
          </div>
        </div>

        {/* Tanggal & Waktu EKG */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Tanggal & Waktu EKG:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={patient.tanggalEkg}
              onChange={(e) => updateField('tanggalEkg', e.target.value)}
              placeholder="DD/MM/2026"
              className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-md bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 font-mono"
            />
            <div className="relative">
              <input
                type="text"
                value={patient.waktuEkg}
                onChange={(e) => updateField('waktuEkg', e.target.value)}
                placeholder="08:30"
                className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-md bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 font-mono pr-8"
              />
              <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-semibold">WIB</span>
            </div>
          </div>
        </div>

        {/* No. Rekam Medis (RM) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            No. Rekam Medis (RM):
          </label>
          <input
            type="text"
            value={patient.noRM}
            onChange={(e) => updateField('noRM', e.target.value)}
            placeholder="RM-2026-XXXXX"
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 font-mono"
          />
        </div>

        {/* Dokter Pemeriksa & NIP/NIDN */}
        <div className="md:col-span-2 lg:col-span-3 pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
              Dokter Pembaca EKG / Sp.JP / Sp.PD:
            </label>
            <input
              type="text"
              value={patient.dokterNama}
              onChange={(e) => updateField('dokterNama', e.target.value)}
              placeholder="dr. H. Hendra Setiawan, Sp.JP, FIHA"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              NIP / NIDN Dokter:
            </label>
            <input
              type="text"
              value={patient.nipNidn}
              onChange={(e) => updateField('nipNidn', e.target.value)}
              placeholder="197904122005011004"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
