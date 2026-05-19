/**
 * TTS (Text-to-Speech) 工具
 * 使用浏览器内置 Web Speech API，自动选择最优音色：
 *   - iOS/macOS: Samantha / Karen / Daniel（系统级高质量离线声音）
 *   - Chrome:    Google US English（神经网络合成，音质好）
 *   - 其他:      首个 en-US 声音
 * 零延迟，无需网络，无需 API Key。
 */

// 按优先级排列的期望声音名称
const PREFERRED_VOICES = [
  "Samantha",           // macOS / iOS 高质量美式女声
  "Karen",              // macOS 澳式英语，自然
  "Daniel",             // macOS 英式男声
  "Google US English",  // Chrome 神经网络合成
  "Microsoft Aria Online (Natural) - English (United States)", // Edge Neural
  "Microsoft Guy Online (Natural) - English (United States)",
  "en-US-Neural2",
];

let _bestVoice: SpeechSynthesisVoice | null = null;
let _voicesLoaded = false;

/**
 * 从浏览器可用声音中挑选最优英语声音
 */
function getBestVoice(): SpeechSynthesisVoice | null {
  if (_bestVoice) return _bestVoice;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // 按优先列表匹配
  for (const preferred of PREFERRED_VOICES) {
    const match = voices.find((v) =>
      v.name.toLowerCase().includes(preferred.toLowerCase())
    );
    if (match) {
      _bestVoice = match;
      return match;
    }
  }

  // 降级：优先 en-US 的本地声音
  const localEnUS = voices.find((v) => v.lang === "en-US" && v.localService);
  if (localEnUS) { _bestVoice = localEnUS; return localEnUS; }

  // 再降级：任意 en-US
  const anyEnUS = voices.find((v) => v.lang.startsWith("en"));
  if (anyEnUS) { _bestVoice = anyEnUS; return anyEnUS; }

  return null;
}

/**
 * 初始化：等待声音列表加载完成
 * Chrome 需要等 voiceschanged 事件，iOS 同步可用
 */
function initVoices(): Promise<void> {
  if (_voicesLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      _voicesLoaded = true;
      resolve();
      return;
    }
    const handler = () => {
      _voicesLoaded = true;
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve();
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    // 超时保底（部分浏览器不触发 voiceschanged）
    setTimeout(() => { _voicesLoaded = true; resolve(); }, 1000);
  });
}

// 预加载声音列表
if ("speechSynthesis" in window) {
  initVoices();
}

// Chrome 长句静默 bug 修复：定期调用 resume() 防止被暂停
let _resumeTimer: ReturnType<typeof setInterval> | null = null;

function startResumeTimer() {
  if (_resumeTimer) return;
  _resumeTimer = setInterval(() => {
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.resume();
    } else {
      stopResumeTimer();
    }
  }, 5000);
}

function stopResumeTimer() {
  if (_resumeTimer) {
    clearInterval(_resumeTimer);
    _resumeTimer = null;
  }
}

/**
 * 核心播放函数
 */
function webSpeechSpeak(
  text: string,
  rate: number,
  onEnd: () => void,
  onError: () => void
): () => void {
  if (!("speechSynthesis" in window)) { onError(); return () => {}; }

  window.speechSynthesis.cancel();
  stopResumeTimer();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = Math.max(0.5, Math.min(2.0, rate));
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  const voice = getBestVoice();
  if (voice) utterance.voice = voice;

  utterance.onstart = () => startResumeTimer();
  utterance.onend = () => { stopResumeTimer(); onEnd(); };
  utterance.onerror = (e) => {
    stopResumeTimer();
    // "interrupted" 是主动取消，不算错误
    if ((e as SpeechSynthesisErrorEvent).error === "interrupted") return;
    onError();
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    stopResumeTimer();
    window.speechSynthesis.cancel();
  };
}

/**
 * 统一 speak 接口，零延迟本地播放
 * 返回 stop 函数用于中断播放
 */
export function speak(
  text: string,
  rate: number = 1.0,
  callbacks?: { onEnd?: () => void; onError?: () => void }
): { stop: () => void } {
  let cancelFn: (() => void) | null = null;
  let stopped = false;

  const stop = () => {
    stopped = true;
    cancelFn?.();
  };

  const doSpeak = () => {
    if (stopped) return;
    cancelFn = webSpeechSpeak(
      text,
      rate,
      () => { if (!stopped) callbacks?.onEnd?.(); },
      () => { if (!stopped) callbacks?.onError?.(); }
    );
  };

  // 确保声音列表已加载
  if (_voicesLoaded) {
    doSpeak();
  } else {
    initVoices().then(doSpeak);
  }

  return { stop };
}

/**
 * 停止所有当前播放
 */
export function stopAll() {
  stopResumeTimer();
  window.speechSynthesis?.cancel();
}
