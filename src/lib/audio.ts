const MUTED_KEY = "renda-vs:muted";

let ctx: AudioContext | null = null;
let muted = typeof window !== "undefined" && localStorage.getItem(MUTED_KEY) === "1";

function getCtx(): AudioContext | null {
  if (ctx) return ctx;
  try {
    const Ctor = (window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
    if (!Ctor) return null;
    ctx = new Ctor();
  } catch {
    return null;
  }
  return ctx;
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
  try {
    localStorage.setItem(MUTED_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
}

export function toggleMute(): boolean {
  setMuted(!muted);
  return muted;
}

export function playClick() {
  if (muted) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();

  const t0 = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(880, t0);
  osc.frequency.exponentialRampToValueAtTime(440, t0 + 0.04);
  gain.gain.setValueAtTime(0.18, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);
  osc.connect(gain).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + 0.06);
}
