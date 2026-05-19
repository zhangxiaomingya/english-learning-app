/**
 * TTS (Text-to-Speech) 工具
 * 主方案：Google 翻译音频接口（免费，无需 Key，真人发音）
 * 降级方案：浏览器 Web Speech API
 *
 * 注意：直接将 URL 赋给 Audio.src，不使用 fetch，
 * 浏览器加载 <audio> 资源不受 CORS 限制。
 */

// 音频对象缓存
const audioCache = new Map<string, HTMLAudioElement>();

function googleTranslateTTSUrl(text: string): string {
  return `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en-US&client=gtx&ttsspeed=1`;
}

/**
 * 将长文本按句子边界分割成不超过 maxLen 字符的片段
 */
function splitText(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const segments: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text];
  let current = "";
  for (const s of sentences) {
    if (current.length > 0 && (current + s).length > maxLen) {
      segments.push(current.trim());
      current = s;
    } else {
      current += s;
    }
  }
  if (current.trim()) segments.push(current.trim());
  return segments.length > 0 ? segments : [text];
}

/**
 * 创建一个 Audio 对象，直接用 URL 作为 src（无 CORS 问题）
 */
function makeAudio(text: string, rate: number): HTMLAudioElement {
  const cached = audioCache.get(text);
  if (cached) {
    cached.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    cached.currentTime = 0;
    return cached;
  }
  const audio = new Audio(googleTranslateTTSUrl(text));
  audio.playbackRate = Math.max(0.5, Math.min(2.0, rate));
  audioCache.set(text, audio);
  return audio;
}

/**
 * 链式播放多个文本片段
 * 全部播放完后调用 onEnd，任意出错调用 onError
 */
function playSegments(
  segments: string[],
  rate: number,
  idx: number,
  stopped: () => boolean,
  onEnd: () => void,
  onError: () => void
): HTMLAudioElement {
  const audio = makeAudio(segments[idx], rate);

  audio.onended = () => {
    if (stopped()) return;
    if (idx + 1 < segments.length) {
      playSegments(segments, rate, idx + 1, stopped, onEnd, onError);
    } else {
      onEnd();
    }
  };

  audio.onerror = () => {
    if (!stopped()) onError();
  };

  audio.play().catch(() => {
    if (!stopped()) onError();
  });

  return audio;
}

/**
 * 使用浏览器内置 Web Speech API（降级方案）
 */
function webSpeechSpeak(
  text: string,
  rate: number,
  onEnd: () => void,
  onError: () => void
): void {
  if (!("speechSynthesis" in window)) { onError(); return; }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.onend = onEnd;
  utterance.onerror = onError;
  window.speechSynthesis.speak(utterance);
}

/**
 * 统一 speak 接口
 * 优先 Google 翻译 TTS（直接 Audio src，无 CORS），失败降级到 Web Speech
 */
export function speak(
  text: string,
  rate: number = 1.0,
  callbacks?: { onEnd?: () => void; onError?: () => void }
): { stop: () => void } {
  let currentAudio: HTMLAudioElement | null = null;
  let stopped = false;

  const onEnd = () => { if (!stopped) callbacks?.onEnd?.(); };
  const onError = () => {
    if (stopped) return;
    // Google 翻译失败 → 降级 Web Speech
    webSpeechSpeak(text, rate, onEnd, () => { if (!stopped) callbacks?.onError?.(); });
  };

  const stop = () => {
    stopped = true;
    if (currentAudio) {
      currentAudio.onended = null;
      currentAudio.onerror = null;
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    window.speechSynthesis?.cancel();
  };

  const segments = splitText(text, 200);
  currentAudio = playSegments(segments, rate, 0, () => stopped, onEnd, onError);

  return { stop };
}

/**
 * 停止所有当前播放
 */
export function stopAll() {
  window.speechSynthesis?.cancel();
}
