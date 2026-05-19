/**
 * TTS (Text-to-Speech) 工具
 * 主方案：Google 翻译音频接口（免费，无需 Key，真人发音）
 * 降级方案：浏览器 Web Speech API
 *
 * Google 翻译 TTS 接口说明：
 *   - 完全免费，无需注册或 API Key
 *   - 使用 Google 翻译内部的真人录音（非合成）
 *   - 单次请求建议不超过 200 字符，长文本需分段请求
 */

// 音频缓存，避免重复请求相同文本
const audioCache = new Map<string, string>();

/**
 * 通过 Google 翻译接口获取英语发音音频 URL
 * 文本超过 200 字符时自动分段
 */
function googleTranslateTTSUrl(text: string): string {
  const encoded = encodeURIComponent(text);
  return `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encoded}&tl=en&client=gtx&ttsspeed=1`;
}

/**
 * 使用 Google 翻译接口播放音频
 * rate: 0.5–2.0，通过 Audio.playbackRate 控制语速
 */
async function googleTranslateSpeak(text: string, rate: number = 1.0): Promise<HTMLAudioElement> {
  // 长文本按句分段（超过 200 字符时）
  const segments = splitTextToSegments(text, 200);

  // 只返回第一段的 Audio 对象（多段由链式播放处理）
  const url = googleTranslateTTSUrl(segments[0]);
  const cacheKey = `${segments[0]}|gtx`;

  let audioUrl = audioCache.get(cacheKey);
  if (!audioUrl) {
    // 通过 fetch 获取音频并转成 blob URL（绕过 CORS referer 限制）
    const resp = await fetch(url, {
      headers: { Referer: "https://translate.google.com" },
    });
    if (!resp.ok) throw new Error(`Google Translate TTS error: ${resp.status}`);
    const blob = await resp.blob();
    audioUrl = URL.createObjectURL(blob);
    audioCache.set(cacheKey, audioUrl);
  }

  const audio = new Audio(audioUrl);
  audio.playbackRate = Math.max(0.5, Math.min(2.0, rate));

  // 如果有多段，链式播放后续段落
  if (segments.length > 1) {
    let segIdx = 1;
    const playNext = () => {
      if (segIdx >= segments.length) return;
      const segUrl = googleTranslateTTSUrl(segments[segIdx]);
      const segKey = `${segments[segIdx]}|gtx`;
      const segAudio = new Audio();
      segAudio.playbackRate = Math.max(0.5, Math.min(2.0, rate));

      const cachedSeg = audioCache.get(segKey);
      if (cachedSeg) {
        segAudio.src = cachedSeg;
        segAudio.onended = () => { segIdx++; playNext(); };
        segAudio.play().catch(() => {});
      } else {
        fetch(segUrl, { headers: { Referer: "https://translate.google.com" } })
          .then((r) => r.blob())
          .then((b) => {
            const u = URL.createObjectURL(b);
            audioCache.set(segKey, u);
            segAudio.src = u;
            segAudio.onended = () => { segIdx++; playNext(); };
            segAudio.play().catch(() => {});
          })
          .catch(() => {});
      }
    };
    // 替换 onended，在第一段结束后继续播放
    const origOnended = audio.onended;
    audio.onended = (e) => {
      playNext();
      if (origOnended) (origOnended as EventListener)(e);
    };
  }

  return audio;
}

/**
 * 将长文本按句子边界分割成不超过 maxLen 字符的片段
 */
function splitTextToSegments(text: string, maxLen: number): string[] {
  if (text.length <= maxLen) return [text];
  const segments: string[] = [];
  // 按句子标点分割
  const sentences = text.match(/[^.!?]+[.!?]*/g) ?? [text];
  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length > maxLen && current.length > 0) {
      segments.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) segments.push(current.trim());
  return segments.length > 0 ? segments : [text];
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
 * 统一 speak 接口
 * 优先 Google 翻译 TTS（真人发音），失败自动降级到 Web Speech API
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
      audio.onended = null;
      audio.pause();
      audio.currentTime = 0;
    }
    window.speechSynthesis?.cancel();
  };

  googleTranslateSpeak(text, rate)
    .then((a) => {
      if (stopped) return;
      audio = a;
      // 覆盖 onended 以触发回调（多段情况下 onended 已被链式覆盖）
      const origOnended = audio.onended;
      audio.onended = (e) => {
        if (origOnended) (origOnended as EventListener)(e);
        // 单段时直接触发 onEnd；多段时在链式末尾已无 onended，此处处理单段
        if (!stopped) callbacks?.onEnd?.();
      };
      audio.onerror = () => {
        if (!stopped) {
          // 降级到 Web Speech
          webSpeechSpeak(text, rate)
            .then(() => { if (!stopped) callbacks?.onEnd?.(); })
            .catch(() => { if (!stopped) callbacks?.onError?.(); });
        }
      };
      audio.play().catch(() => {
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

  return { stop };
}

/**
 * 停止所有当前播放
 */
export function stopAll() {
  window.speechSynthesis?.cancel();
}
