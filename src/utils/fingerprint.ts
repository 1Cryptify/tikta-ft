/**
 * Lightweight, privacy-friendly device identifier used for anti-abuse on the
 * public ticket-recovery page. It combines a canvas rendering fingerprint with
 * a few stable browser/screen attributes. No personal data is collected.
 *
 * The value is cached in localStorage for stability, and is only ever sent to
 * our own backend as an opaque string.
 */

const STORAGE_KEY = 'tk_device_fp';

const hashString = (value: string): string => {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < value.length; i++) {
    const ch = value.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
};

const canvasComponent = (): string => {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 240;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = '#f60';
    ctx.fillRect(120, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Tikta,FP!@#2026', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Tikta,FP!@#2026', 4, 17);

    return canvas.toDataURL();
  } catch {
    return 'canvas-error';
  }
};

export const getCanvasFingerprint = (): string => {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) return cached;

    const parts = [
      canvasComponent(),
      navigator.userAgent || '',
      navigator.language || '',
      `${screen.width}x${screen.height}`,
      String(screen.colorDepth || ''),
      String(new Date().getTimezoneOffset()),
      String(navigator.hardwareConcurrency || ''),
    ];

    const fp = `fp_${hashString(parts.join('|||'))}`;
    localStorage.setItem(STORAGE_KEY, fp);
    return fp;
  } catch {
    return 'fp_unknown';
  }
};
