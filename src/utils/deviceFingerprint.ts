/**
 * Client-side deterministic device fingerprinting.
 * Combines hardware, screen, canvas rendering, and platform attributes to produce
 * a durable identifier that survives incognito mode and localStorage clearing.
 */

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';

    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial', sans-serif";
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('XBZ-SECURE-2026', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('XBZ-SECURE-2026', 4, 17);

    return simpleHash(canvas.toDataURL());
  } catch {
    return 'canvas-fallback';
  }
}

export function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'server_render';

  try {
    const screenInfo = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
    const navInfo = `${navigator.userAgent}_${navigator.language}_${navigator.hardwareConcurrency || 4}`;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
    const canvasHash = getCanvasFingerprint();

    const rawId = `${screenInfo}#${navInfo}#${timezone}#${canvasHash}`;
    const computedHash = 'dev_' + simpleHash(rawId);

    // Save in localStorage as well for fast access, but fall back to deterministic hash
    try {
      localStorage.setItem('xbz_device_id', computedHash);
    } catch {}

    return computedHash;
  } catch {
    return 'dev_default_client';
  }
}
