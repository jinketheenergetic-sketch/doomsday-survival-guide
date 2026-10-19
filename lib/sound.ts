/**
 * 合成短音。
 *
 * 六种音效全部由 Web Audio API 的振荡器与增益包络现场生成，不加载任何音频文件。
 * 音效默认关闭：每次播放前读取 `Settings.soundEnabled`，关闭、浏览器不支持或
 * 合成失败时静默跳过，绝不影响交互。
 */

import { storageAdapter } from "@/lib/storage";

export const SOUND_NAMES = [
  "click",
  "good",
  "bad",
  "unlock",
  "star",
  "ending",
] as const;

export type SoundName = (typeof SOUND_NAMES)[number];

interface Note {
  /** 频率（Hz）。 */
  frequency: number;
  /** 相对播放起点的延迟（秒）。 */
  at: number;
  /** 持续时间（秒）。 */
  duration: number;
  type: OscillatorType;
  /** 峰值增益，保持整体音量轻柔。 */
  gain: number;
}

const RECIPES: Record<SoundName, readonly Note[]> = {
  click: [
    { frequency: 520, at: 0, duration: 0.06, type: "triangle", gain: 0.07 },
  ],
  good: [
    { frequency: 523.25, at: 0, duration: 0.1, type: "sine", gain: 0.11 },
    { frequency: 783.99, at: 0.09, duration: 0.16, type: "sine", gain: 0.11 },
  ],
  bad: [
    { frequency: 196, at: 0, duration: 0.14, type: "sawtooth", gain: 0.06 },
    { frequency: 146.83, at: 0.11, duration: 0.22, type: "sawtooth", gain: 0.06 },
  ],
  unlock: [
    { frequency: 523.25, at: 0, duration: 0.1, type: "triangle", gain: 0.09 },
    { frequency: 659.25, at: 0.08, duration: 0.1, type: "triangle", gain: 0.09 },
    { frequency: 783.99, at: 0.16, duration: 0.18, type: "triangle", gain: 0.09 },
  ],
  star: [
    { frequency: 1046.5, at: 0, duration: 0.12, type: "sine", gain: 0.08 },
    { frequency: 1567.98, at: 0.1, duration: 0.2, type: "sine", gain: 0.06 },
  ],
  ending: [
    { frequency: 392, at: 0, duration: 0.24, type: "triangle", gain: 0.09 },
    { frequency: 523.25, at: 0.14, duration: 0.24, type: "triangle", gain: 0.09 },
    { frequency: 659.25, at: 0.28, duration: 0.42, type: "triangle", gain: 0.08 },
  ],
};

type AudioContextConstructor = new () => AudioContext;

let audioContext: AudioContext | null = null;
let unavailable = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined" || unavailable) return null;
  if (audioContext) return audioContext;

  const Constructor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextConstructor })
      .webkitAudioContext;

  if (!Constructor) {
    unavailable = true;
    return null;
  }

  try {
    audioContext = new Constructor();
    return audioContext;
  } catch {
    unavailable = true;
    return null;
  }
}

/** 播放一个具名短音；音效关闭时立即返回。 */
export function playSound(name: SoundName): void {
  if (!storageAdapter.getSettings().soundEnabled) return;

  const context = getAudioContext();
  if (!context) return;

  try {
    // 浏览器要求首次发声必须在用户手势之后；挂起时恢复上下文。
    if (context.state === "suspended") void context.resume();

    const start = context.currentTime + 0.01;

    for (const note of RECIPES[name]) {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      const noteStart = start + note.at;

      oscillator.type = note.type;
      oscillator.frequency.setValueAtTime(note.frequency, noteStart);

      // 短促起音 + 指数衰减，避免爆音。
      envelope.gain.setValueAtTime(0.0001, noteStart);
      envelope.gain.linearRampToValueAtTime(note.gain, noteStart + 0.012);
      envelope.gain.exponentialRampToValueAtTime(
        0.0001,
        noteStart + note.duration,
      );

      oscillator.connect(envelope);
      envelope.connect(context.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + note.duration + 0.02);
    }
  } catch {
    // 合成失败不应打断游戏交互。
  }
}
