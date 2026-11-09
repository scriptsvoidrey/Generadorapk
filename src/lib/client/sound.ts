/**
 * Sonidos sintetizados con Web Audio API (sin archivos de audio).
 * El AudioContext se crea de forma lazy al primer gesto de usuario.
 */

let ctx: AudioContext | null = null;
let enabled = true;

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Llámalo desde el primer gesto de usuario (click) para desbloquear audio en móviles. */
export function unlockAudio(): void {
  ensureCtx();
}

export function setEnabled(value: boolean): void {
  enabled = value;
}

export function isEnabled(): boolean {
  return enabled;
}

interface ToneOpts {
  freq: number;
  endFreq?: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
}

function tone({ freq, endFreq, duration, type = "sine", gain = 0.08, delay = 0 }: ToneOpts): void {
  const ac = ensureCtx();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t0 + duration);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

/** Click corto y suave para navegación / botones. */
export function playClick(): void {
  if (!enabled) return;
  tone({ freq: 620, endFreq: 480, duration: 0.07, type: "triangle", gain: 0.05 });
}

/** Doble tono ascendente: éxito / build completado. */
export function playSuccess(): void {
  if (!enabled) return;
  tone({ freq: 523.25, duration: 0.12, type: "sine", gain: 0.09 });
  tone({ freq: 783.99, duration: 0.18, type: "sine", gain: 0.09, delay: 0.11 });
}

/** Tono descendente grave: error. */
export function playError(): void {
  if (!enabled) return;
  tone({ freq: 320, endFreq: 140, duration: 0.32, type: "sawtooth", gain: 0.06 });
}

/** Barrido ascendente: inicio de compilación. */
export function playBuildStart(): void {
  if (!enabled) return;
  tone({ freq: 300, endFreq: 900, duration: 0.28, type: "triangle", gain: 0.07 });
}
