import React, { useState, useRef } from 'react';
import { Upload, Camera, Sparkles, RefreshCw, ZoomIn, ZoomOut, Contrast, Image as ImageIcon } from 'lucide-react';
import { SAMPLE_PRESETS, EkgSamplePreset } from '../data/samples';
import { EkgStripCanvas } from './EkgStripCanvas';

interface EkgUploaderProps {
  onAnalyze: (imageBase64: string, mimeType: string) => Promise<void>;
  onSelectPreset: (preset: EkgSamplePreset) => void;
  selectedPresetId: string | null;
  isAnalyzing: boolean;
  uploadedImage: string | null;
  setUploadedImage: (img: string | null) => void;
  currentHeartRate: number;
}

export const EkgUploader: React.FC<EkgUploaderProps> = ({
  onAnalyze,
  onSelectPreset,
  selectedPresetId,
  isAnalyzing,
  uploadedImage,
  setUploadedImage,
  currentHeartRate,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isInverted, setIsInverted] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // File drop/selection handler
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon unggah file format gambar (JPG, PNG, atau WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Camera capture
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      alert('Tidak dapat mengakses kamera. Pastikan izin kamera aktif.');
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      setUploadedImage(dataUrl);
    }
    stopCamera();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const handleRunAnalysis = () => {
    if (!uploadedImage) {
      // If no custom image uploaded, generate canvas image of current preset
      const canvasEl = document.querySelector('canvas');
      if (canvasEl) {
        const dataUrl = canvasEl.toDataURL('image/png');
        onAnalyze(dataUrl, 'image/png');
      }
      return;
    }
    const mimeMatch = uploadedImage.match(/^data:(image\/\w+);base64,/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    onAnalyze(uploadedImage, mime);
  };

  // Active condition for canvas representation
  const activePreset = SAMPLE_PRESETS.find((p) => p.id === selectedPresetId);
  const condition =
    selectedPresetId === 'sample_afib'
      ? 'afib'
      : selectedPresetId === 'sample_avblock3'
      ? 'av_block_3'
      : selectedPresetId === 'sample_iskemik'
      ? 'st_depresi'
      : selectedPresetId === 'sample_takikardia_tsh'
      ? 'tachycardia'
      : 'normal';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-4">
        <div>
          <h2 className="text-sm font-bold tracking-wide uppercase text-slate-900 flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-700" />
            Pemeriksaan Foto EKG 12-Lead Calon Jemaah
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unggah rekaman fisik 12-lead atau pilih sampel klinis terstandar untuk interpretasi otomatis KMHU 82/2026.
          </p>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all shadow-xs ${
            isAnalyzing
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Memproses Gemini Multimodal...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Analisis Otomatis (Gemini AI KMHU 82)</span>
            </>
          )}
        </button>
      </div>

      {/* Preset selector strip */}
      <div className="mb-4">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Sampel Klinis Terverifikasi Siskohatkes (Uji Langsung):
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {SAMPLE_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id && !uploadedImage;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  stopCamera();
                  setUploadedImage(null);
                  onSelectPreset(preset);
                }}
                className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-slate-900 truncate">{preset.title.split('.')[1] || preset.title}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      preset.categoryBadge === 'Kategori A'
                        ? 'bg-emerald-100 text-emerald-800'
                        : preset.categoryBadge === 'Kategori B'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {preset.categoryBadge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{preset.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Viewport / Canvas Stage */}
      <div className="relative border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
        {/* Controls bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-100/90 border-b border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              {uploadedImage ? 'Foto EKG Terunggah' : `Visualisasi Lead: ${activePreset?.title || 'EKG Strip'}`}
            </span>
            <span className="text-slate-400">·</span>
            <span className="font-mono text-slate-600 text-[11px]">
              {uploadedImage ? 'Custom File' : activePreset?.leadsDescription?.slice(0, 50) + '...'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {uploadedImage && (
              <>
                <button
                  type="button"
                  onClick={() => setIsInverted(!isInverted)}
                  title="Invert Warna (Mempermudah baca EKG layar hitam)"
                  className={`p-1.5 rounded border text-xs ${
                    isInverted ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  <Contrast className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsHighContrast(!isHighContrast)}
                  title="Tingkatkan Kontras Garis Gelombang"
                  className={`px-2 py-1 rounded border text-[11px] font-medium ${
                    isHighContrast ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Kontras Tinggi
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
                  className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-mono text-slate-600 px-1">{Math.round(zoomLevel * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                  className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Ganti Foto</span>
            </button>

            {!isCameraActive ? (
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium"
              >
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                <span>Kamera</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopCamera}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-rose-300 bg-rose-50 text-rose-700 text-xs font-medium"
              >
                <span>Batal Kamera</span>
              </button>
            )}
          </div>
        </div>

        {/* Video feed or EKG Image Canvas */}
        <div className="p-3 flex items-center justify-center min-h-[360px] bg-slate-900/5">
          {isCameraActive ? (
            <div className="relative w-full max-w-xl flex flex-col items-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-md border border-slate-300 shadow-md bg-black"
              />
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Ambil Foto EKG Sekarang</span>
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Tutup
                </button>
              </div>
            </div>
          ) : uploadedImage ? (
            <div className="overflow-auto max-h-[480px] w-full flex items-center justify-center">
              <img
                src={uploadedImage}
                alt="Foto EKG Calon Jemaah"
                referrerPolicy="no-referrer"
                style={{
                  transform: `scale(${zoomLevel})`,
                  filter: `${isInverted ? 'invert(1) ' : ''}${isHighContrast ? 'contrast(170%) brightness(95%)' : ''}`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-w-full max-h-[440px] rounded object-contain shadow-xs border border-slate-300"
              />
            </div>
          ) : (
            <div className="w-full">
              <EkgStripCanvas
                heartRate={typeof currentHeartRate === 'number' ? currentHeartRate : 72}
                condition={condition}
                patientName={activePreset?.patient.nama || 'PASIEN'}
              />
            </div>
          )}
        </div>

        {/* Dropzone drag area footer */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="p-3 border-t border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Tarik & Lepas Foto EKG:</span>
            <span>Seret file ke area ini atau klik tombol Unggah (format JPG, PNG, WEBP, maks 10 MB).</span>
          </div>
          {uploadedImage && (
            <button
              type="button"
              onClick={() => setUploadedImage(null)}
              className="text-rose-600 hover:text-rose-800 font-semibold"
            >
              Hapus Foto (Kembali ke Rekaman Kalibrasi)
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};
