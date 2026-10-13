import { EkgHistoryItem, PatientIdentity, ParameterKlinis, KategorisasiSiskohat, KesimpulanDokter } from '../types/ekg';
import { SAMPLE_PRESETS } from '../data/samples';

const STORAGE_KEY = 'siskohatkes_ekg_history_v1';

/**
 * Retrieves all saved EKG interpretation records from browser localStorage.
 * On first initialization (when key is null), seeds with clinical standard presets.
 * Results are sorted with newest first.
 */
export function getEkgHistory(): EkgHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    
    // First time visit: seed with realistic clinical presets
    if (raw === null) {
      const initialSeed: EkgHistoryItem[] = SAMPLE_PRESETS.map((preset, index) => {
        // Stagger saved timestamps
        const timeAgoMs = (index + 1) * 3600000; // 1h, 2h, 3h ago
        const pastDate = new Date(Date.now() - timeAgoMs).toISOString();
        return {
          id: `seed_${preset.id}`,
          savedAt: pastDate,
          patient: { ...preset.patient },
          parameters: { ...preset.parameter },
          kategorisasi: { ...preset.kategorisasi },
          kesimpulan: { ...preset.kesimpulan },
          uploadedImage: null,
          notes: `Data sampel klinis: ${preset.title}`,
        };
      });

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialSeed));
      } catch (err) {
        console.warn('Unable to persist initial seed:', err);
      }

      return initialSeed;
    }

    if (!raw) return [];
    const items: EkgHistoryItem[] = JSON.parse(raw);
    if (!Array.isArray(items)) return [];
    
    // Sort descending by savedAt
    return items.sort((a, b) => {
      const dateA = new Date(a.savedAt).getTime() || 0;
      const dateB = new Date(b.savedAt).getTime() || 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Failed to read EKG history from localStorage:', error);
    return [];
  }
}

/**
 * Saves or updates an EKG interpretation record in browser localStorage.
 * Automatically handles QuotaExceededError by omitting heavy image base64 if needed.
 */
export function saveEkgToHistory(data: {
  id?: string;
  patient: PatientIdentity;
  parameters: ParameterKlinis;
  kategorisasi: KategorisasiSiskohat;
  kesimpulan: KesimpulanDokter;
  uploadedImage?: string | null;
  notes?: string;
}): { success: boolean; item: EkgHistoryItem; message: string } {
  try {
    const history = getEkgHistory();
    const nowIso = new Date().toISOString();
    
    // Generate ID or preserve existing
    const recordId = data.id || `ekg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    const newItem: EkgHistoryItem = {
      id: recordId,
      savedAt: nowIso,
      patient: { ...data.patient },
      parameters: { ...data.parameters },
      kategorisasi: { ...data.kategorisasi },
      kesimpulan: { ...data.kesimpulan },
      uploadedImage: data.uploadedImage || null,
      notes: data.notes || '',
    };

    // Check if updating existing record
    const existingIndex = history.findIndex((h) => h.id === recordId);
    let updatedHistory: EkgHistoryItem[];

    if (existingIndex >= 0) {
      updatedHistory = [...history];
      updatedHistory[existingIndex] = newItem;
    } else {
      updatedHistory = [newItem, ...history];
    }

    // Try saving to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      return {
        success: true,
        item: newItem,
        message: `Data pemeriksaan jemaah ${newItem.patient.nama || 'Jemaah'} berhasil disimpan ke riwayat lokal.`,
      };
    } catch (quotaError: any) {
      // If QuotaExceededError, strip uploadedImage base64 strings to save space
      console.warn('Storage quota exceeded, retrying without heavy image data...', quotaError);
      
      const compressedHistory = updatedHistory.map((item) => ({
        ...item,
        uploadedImage: null, // strip base64 to preserve patient clinical data
      }));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(compressedHistory));
      return {
        success: true,
        item: { ...newItem, uploadedImage: null },
        message: `Data pemeriksaan jemaah ${newItem.patient.nama || 'Jemaah'} berhasil disimpan (tanpa lampiran foto demi hemat memori lokal).`,
      };
    }
  } catch (error: any) {
    console.error('Failed to save to localStorage:', error);
    return {
      success: false,
      item: null as any,
      message: `Gagal menyimpan riwayat: ${error?.message || 'Kesalahan penyimpanan lokal'}`,
    };
  }
}

/**
 * Deletes a single record by its unique ID.
 */
export function deleteEkgHistoryItem(id: string): EkgHistoryItem[] {
  try {
    const history = getEkgHistory();
    const filtered = history.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('Failed to delete history item:', error);
    return getEkgHistory();
  }
}

/**
 * Clears all history from localStorage.
 */
export function clearAllEkgHistory(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  } catch (error) {
    console.error('Failed to clear history:', error);
  }
}
