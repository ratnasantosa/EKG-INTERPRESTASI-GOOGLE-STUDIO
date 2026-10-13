import React, { useRef, useEffect } from 'react';

interface EkgStripCanvasProps {
  heartRate: number;
  condition: 'normal' | 'st_depresi' | 'afib' | 'av_block_3' | 'tachycardia';
  patientName?: string;
  className?: string;
}

export const EkgStripCanvas: React.FC<EkgStripCanvasProps> = ({
  heartRate = 72,
  condition = 'normal',
  patientName = 'PASIEN CONTOH',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background: Medical ECG paper (warm faint pink / peach)
    ctx.fillStyle = '#fff5f5';
    ctx.fillRect(0, 0, width, height);

    // 1mm fine grid lines (approx 4px)
    ctx.strokeStyle = '#fecdd3';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < width; x += 5) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 5) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // 5mm large grid lines (approx 25px)
    ctx.strokeStyle = '#fda4af';
    ctx.lineWidth = 1.0;
    for (let x = 0; x < width; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Header info on strip
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`25mm/s  10mm/mV  HR:${heartRate}bpm  ID:${patientName.slice(0, 20)}`, 15, 18);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('12-LEAD DIAGNOSTIC ECG RECORDER • CAL: 1mV [__|--|__]', 15, 32);

    // Grid of leads: 4 columns x 3 rows + bottom Lead II rhythm strip
    // Rows:
    // Lead I, aVR, V1, V4
    // Lead II, aVL, V2, V5
    // Lead III, aVF, V3, V6
    // Lead II (Continuous rhythm strip)
    const leadMatrix = [
      ['Lead I', 'Lead aVR', 'Lead V1', 'Lead V4'],
      ['Lead II', 'Lead aVL', 'Lead V2', 'Lead V5'],
      ['Lead III', 'Lead aVF', 'Lead V3', 'Lead V6'],
    ];

    const colWidth = width / 4;
    const rowHeight = (height - 90) / 3;

    // Draw ECG waves for each lead slot
    leadMatrix.forEach((row, rIdx) => {
      row.forEach((leadLabel, cIdx) => {
        const startX = cIdx * colWidth;
        const endX = startX + colWidth;
        const baselineY = 45 + rIdx * rowHeight + rowHeight / 2;

        // Label
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(leadLabel, startX + 10, baselineY - 26);

        // Waveform styling
        ctx.strokeStyle = '#09090b';
        ctx.lineWidth = 1.4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();

        let isLeadInverted = leadLabel === 'Lead aVR';
        drawLeadWave(
          ctx,
          startX,
          endX,
          baselineY,
          leadLabel,
          condition,
          heartRate,
          isLeadInverted
        );
        ctx.stroke();
      });
    });

    // Bottom continuous Rhythm Strip: Lead II
    const rhythmBaselineY = height - 32;
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('Lead II (Continuous Rhythm Strip)', 15, rhythmBaselineY - 26);

    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    drawLeadWave(
      ctx,
      0,
      width,
      rhythmBaselineY,
      'Lead II (Long)',
      condition,
      heartRate,
      false
    );
    ctx.stroke();

  }, [heartRate, condition, patientName]);

  // Helper to draw realistic P-Q-R-S-T complexes
  const drawLeadWave = (
    ctx: CanvasRenderingContext2D,
    startX: number,
    endX: number,
    baselineY: number,
    leadName: string,
    cond: 'normal' | 'st_depresi' | 'afib' | 'av_block_3' | 'tachycardia',
    hr: number,
    inverted: boolean
  ) => {
    const inv = inverted ? -1 : 1;
    // Beat period in pixels (25mm/s -> 1s is ~125px). HR 60 -> 125px per beat. HR 120 -> 62px per beat
    const beatPeriod = Math.max(38, Math.round((60 / hr) * 110));

    let x = startX + 12;
    ctx.moveTo(startX, baselineY);
    ctx.lineTo(x, baselineY);

    while (x < endX) {
      if (cond === 'afib') {
        // Fibrillatory baseline (undulating small rapid bumps)
        const fibSteps = 6;
        for (let f = 0; f < fibSteps; f++) {
          const fx = x + f * 4;
          const fy = baselineY + (Math.sin(fx * 0.4) * 2.5 + Math.cos(fx * 0.7) * 1.5);
          ctx.lineTo(fx, fy);
        }
        x += fibSteps * 4;

        // QRS complex with irregular intervals
        const qrsH = 28 * inv;
        ctx.lineTo(x + 2, baselineY + 2 * inv);
        ctx.lineTo(x + 5, baselineY - qrsH); // R peak
        ctx.lineTo(x + 8, baselineY + 7 * inv); // S
        ctx.lineTo(x + 12, baselineY);
        x += 12;

        // Fibrillatory tail
        const rest = Math.floor(Math.random() * 40 + 25);
        for (let r = 0; r < rest; r += 4) {
          ctx.lineTo(x + r, baselineY + Math.sin((x + r) * 0.5) * 2);
        }
        x += rest;
      } else if (cond === 'av_block_3') {
        // Total AV block: independent P waves & wide/slow QRS
        // Independent P wave
        ctx.lineTo(x + 4, baselineY - 4 * inv);
        ctx.lineTo(x + 8, baselineY);
        x += 18;

        // Wide QRS
        ctx.lineTo(x + 2, baselineY + 3 * inv);
        ctx.lineTo(x + 7, baselineY - 26 * inv);
        ctx.lineTo(x + 14, baselineY + 10 * inv);
        ctx.lineTo(x + 18, baselineY);
        x += 18;

        // T wave
        ctx.lineTo(x + 8, baselineY - 7 * inv);
        ctx.lineTo(x + 16, baselineY);
        x += 24;

        // Extra dissociated P wave
        ctx.lineTo(x + 4, baselineY - 4 * inv);
        ctx.lineTo(x + 8, baselineY);
        x += beatPeriod - 68;
      } else {
        // Normal, ST-Depression, or Tachycardia
        const isDepressedST =
          cond === 'st_depresi' && (leadName.includes('V4') || leadName.includes('V5') || leadName.includes('V6') || leadName.includes('Lead I'));

        // P Wave
        ctx.lineTo(x + 4, baselineY - 3.5 * inv);
        ctx.lineTo(x + 8, baselineY);
        x += 8;

        // PR segment
        ctx.lineTo(x + 8, baselineY);
        x += 8;

        // QRS complex
        const rHeight = (leadName.includes('V5') || leadName.includes('V6') ? 34 : 26) * inv;
        ctx.lineTo(x + 2, baselineY + 2 * inv); // Q
        ctx.lineTo(x + 5, baselineY - rHeight); // R
        ctx.lineTo(x + 8, baselineY + 5 * inv); // S
        x += 8;

        // ST Segment
        if (isDepressedST) {
          // Horizontal ST depression ~ 2mm below baseline
          ctx.lineTo(x + 4, baselineY + 5 * inv);
          ctx.lineTo(x + 12, baselineY + 5 * inv);
          x += 12;
          // Inverted T Wave
          ctx.lineTo(x + 8, baselineY + 8 * inv);
          ctx.lineTo(x + 16, baselineY);
          x += 16;
        } else {
          // Normal isoelectric ST
          ctx.lineTo(x + 8, baselineY);
          x += 8;
          // Normal upright T wave
          ctx.lineTo(x + 8, baselineY - 6.5 * inv);
          ctx.lineTo(x + 16, baselineY);
          x += 16;
        }

        // Isoelectric TP segment until next beat
        const remainder = Math.max(8, beatPeriod - 48);
        ctx.lineTo(x + remainder, baselineY);
        x += remainder;
      }
    }
  };

  return (
    <div className={`overflow-x-auto border border-rose-300 rounded-md bg-white shadow-inner ${className}`}>
      <canvas
        ref={canvasRef}
        width={960}
        height={420}
        className="w-full h-auto block select-none"
      />
    </div>
  );
};
