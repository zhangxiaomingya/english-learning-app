/**
 * TTS (Text-to-Speech) 工具
 * 优先使用 Google Cloud TTS（Neural2 真人级语音）
 * 未配置 API Key 时自动降级到浏览器 Web Speech API
 *
 * 使用方式：
 *   在项目根目录的 .env 文件中添加：
 *   VITE_GOOGLE_TTS_API_KEY=你的APIKey
 */

const GOOGLE_TTS_API_KEY = import.meta.env.VITE_GOOGLE_TTS_API_KEY as string | undefined;

// 音频缓存，避免重复请求同一段文字
const audioCache = new Map<string, string>();

/**
 * 使用 Google Cloud TTS 合成语音，返回 audio blob URL
 * voice: Neural2-A（女声）或 Neural2-D（男声），均为美式英语真人级音色
 */
async function googleTTS(text: string, rate: number = 1.0): Promise<HTMLAudioElement> {
  const cacheKey = `${text}|${rate}`;
  let url = audioCache.get(cacheKey);

  if (!url) {
    const speakingRate = Math.max(0.25, Math.min(4.0, rate));
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: "en-US",
            name: "en-US-Neural2-D", // 男声，自然流畅；改 Neural2-F 为女声
          },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate,
            pitch: 0,
            effectsProfileId: ["headphone-class-device"],
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google TTS error: ${response.status}`);
    }

    const data = await response.json();
    const binary = atob(data.audioContent);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "audio/mp3" });
    url = URL.createObjectURL(blob);
    audioCache.set(cacheKey, url);
  }

  const audio = new Audio(url);
  return audio;
}

/**
 * 使用浏览器内置 Web Speech API（降级方案）
 */
function webSpeechSpeak(text: string, rate: number = 1.0): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!("speechSynthesis" in window)) {
      reject(new Error("Web Speech API not supported"));
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = rate;
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * 统一 speak 接口：优先 Google TTS，失败降级到 Web Speech
 * 返回 stop 函数用于中断播放
 */
export function speak(
  text: string,
  rate: number = 1.0,
  callbacks?: { onEnd?: () => void; onError?: () => void }
): { stop: () => void } {
  let audio: HTMLAudioElement | null = null;
  let stopped = false;

  const stop = () => {
    stopped = true;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    window.speechSynthesis?.cancel();
  };

  if (GOOGLE_TTS_API_KEY) {
    googleTTS(text, rate)
      .then((a) => {
        if (stopped) return;
        audio = a;
        audio.onended = () => {
          if (!stopped) callbacks?.onEnd?.();
        };
        audio.onerror = () => {
          if (!stopped) callbacks?.onError?.();
        };
        audio.play().catch(() => {
          // Google TTS 失败降级
          if (!stopped) {
            webSpeechSpeak(text, rate)
              .then(() => { if (!stopped) callbacks?.onEnd?.(); })
              .catch(() => { if (!stopped) callbacks?.onError?.(); });
          }
        });
      })
      .catch(() => {
        if (!stopped) {
          webSpeechSpeak(text, rate)
            .then(() => { if (!stopped) callbacks?.onEnd?.(); })
            .catch(() => { if (!stopped) callbacks?.onError?.(); });
        }
      });
  } else {
    webSpeechSpeak(text, rate)
      .then(() => { if (!stopped) callbacks?.onEnd?.(); })
      .catch(() => { if (!stopped) callbacks?.onError?.(); });
  }

  return { stop };
}

/**
 * 停止所有当前播放
 */
export function stopAll() {
  window.speechSynthesis?.cancel();
}
