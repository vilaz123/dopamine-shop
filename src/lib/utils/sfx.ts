// 盲盒开盒合成音效：用 Web Audio API 现场合成，无音频文件，免费且瞬时。
// 所有方法在 AudioContext 不可用时静默降级，绝不抛错影响开盒流程。
// 受 ui-store 的 soundEnabled 偏好控制（默认开）。

let ctx: AudioContext | null = null;
let muted = false;

/** 由 ui-store 同步静音状态。 */
export function setSfxMuted(value: boolean) {
  muted = value;
}

export function isSfxMuted() {
  return muted;
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (muted) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    // 浏览器策略：需在用户手势内 resume。
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** 噪声 buffer（一次性生成复用，避免每次创建）。 */
let noiseBuf: AudioBuffer | null = null;
function getNoise(c: AudioContext): AudioBuffer {
  if (!noiseBuf || noiseBuf.sampleRate !== c.sampleRate) {
    const len = Math.floor(c.sampleRate * 1.2);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    noiseBuf = buf;
  }
  return noiseBuf;
}

/** 单个正弦/三角"叮"音。 */
function tone(c: AudioContext, freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.18) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(gain, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(g).connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.02);
}

/** 摇晃：低频带通噪声短促咔哒循环。 */
export function playShake() {
  const c = ensureCtx();
  if (!c) return;
  const now = c.currentTime;
  for (let i = 0; i < 5; i++) {
    const t = now + i * 0.16;
    const src = c.createBufferSource();
    src.buffer = getNoise(c);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(420 + i * 40, t);
    bp.Q.value = 0.9;
    const g = c.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.12, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    src.connect(bp).connect(g).connect(c.destination);
    src.start(t);
    src.stop(t + 0.14);
  }
}

/** 撕开：高频噪声上扫，模拟"嘶啦"。 */
export function playTear() {
  const c = ensureCtx();
  if (!c) return;
  const now = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = getNoise(c);
  const hp = c.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.setValueAtTime(600, now);
  hp.frequency.exponentialRampToValueAtTime(5200, now + 0.28);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(0.22, now + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
  src.connect(hp).connect(g).connect(c.destination);
  src.start(now);
  src.stop(now + 0.32);
}

type Rarity = "common" | "rare" | "super-rare" | "hidden";

/** 揭晓：按稀有度升档的琶音。hidden 多一层金色长尾。 */
export function playReveal(rarity: Rarity) {
  const c = ensureCtx();
  if (!c) return;
  const now = c.currentTime;
  // 五声音阶上行，稀有度越高音越多越高。
  const scales: Record<Rarity, number[]> = {
    common: [659.25], // E5 单音
    rare: [659.25, 987.77], // E5 + B5
    "super-rare": [659.25, 880.0, 1318.51], // E5 A5 E6
    hidden: [523.25, 659.25, 783.99, 1046.5, 1567.98], // C5 E5 G5 C6 G6
  };
  const notes = scales[rarity];
  notes.forEach((f, i) => tone(c, f, now + i * 0.09, 0.42, "triangle", 0.2));
  if (rarity === "hidden") {
    // 金色长尾：高音叠加 + 低频衬底，制造"传说"余韵。
    tone(c, 2093, now + 0.36, 0.9, "sine", 0.12);
    tone(c, 261.63, now, 1.1, "sine", 0.08);
  }
}

/** 加购"啵":短促下行 sine，按钮触感音。 */
export function playPop() {
  const c = ensureCtx();
  if (!c) return;
  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(330, now);
  osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(0.22, now + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  osc.connect(g).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.14);
}

/** 金币落地双叮：飞金币到达购物车时响。 */
export function playCoin() {
  const c = ensureCtx();
  if (!c) return;
  const now = c.currentTime;
  tone(c, 1318.51, now, 0.18, "triangle", 0.16);
  tone(c, 1567.98, now + 0.07, 0.22, "triangle", 0.16);
}

/** 选项咔哒：chip 选中时响，短噪声 click。 */
export function playChip() {
  const c = ensureCtx();
  if (!c) return;
  const now = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = getNoise(c);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1800;
  bp.Q.value = 1.2;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(0.14, now + 0.003);
  g.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
  src.connect(bp).connect(g).connect(c.destination);
  src.start(now);
  src.stop(now + 0.06);
}

/** 收藏心形 pop：上行小二度 ding。 */
export function playFav() {
  const c = ensureCtx();
  if (!c) return;
  const now = c.currentTime;
  tone(c, 880.0, now, 0.16, "sine", 0.14);
  tone(c, 1174.66, now + 0.06, 0.2, "sine", 0.12);
}
