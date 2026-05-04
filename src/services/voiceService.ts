export type AgentVoice = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Aoide' | 'Zephyr';

let currentAudioContext: AudioContext | null = null;

// Standard Gemini voices: Aoide, Charon, Fenrir, Kore, Puck, Zephyr
const VALID_GEMINI_VOICES = ['Aoide', 'Charon', 'Fenrir', 'Kore', 'Puck', 'Zephyr'];

export const stopAllVoice = () => {
  if (currentAudioContext && currentAudioContext.state !== 'closed') {
    try {
      currentAudioContext.close().catch(() => {});
    } catch (e) {
      console.warn("AudioContext close failed:", e);
    }
    currentAudioContext = null;
  }
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Ensures audio context is active. Call this from a user gesture!
 */
export async function ensureAudioUnlocked(): Promise<AudioContext> {
  if (!currentAudioContext || currentAudioContext.state === 'closed') {
    currentAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (currentAudioContext.state === 'suspended') {
    await currentAudioContext.resume();
  }
  return currentAudioContext;
}

/**
 * Creates a standard WAV header for 16-bit Mono PCM data
 */
function createWavHeader(dataLength: number, sampleRate: number): Uint8Array {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);

  /* RIFF identifier */
  view.setUint32(0, 0x52494646, false); // "RIFF"
  /* file length */
  view.setUint32(4, 36 + dataLength, true);
  /* RIFF type */
  view.setUint32(8, 0x57415645, false); // "WAVE"

  /* format chunk identifier */
  view.setUint32(12, 0x666d7420, false); // "fmt "
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, 1, true); // Mono
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);

  /* data chunk identifier */
  view.setUint32(36, 0x64617461, false); // "data"
  /* data chunk length */
  view.setUint32(40, dataLength, true);

  return new Uint8Array(header);
}

export async function speakText(text: string, voice: AgentVoice = 'Puck', onEnd?: () => void): Promise<void> {
  // Stop any previous speech
  stopAllVoice();

  // Resume context (Must be initiated from a user gesture stack to work in browser)
  const audioContext = await ensureAudioUnlocked();

  try {
    console.log(`[VOICE SERVICE] Requesting audio for voice: ${voice} via Proxy`);
    
    // Add persona instructions for the TTS model if it's a specialized voice
    let processedText = text;
    if (voice === 'Fenrir') {
      processedText = `Say with a very deep, husky, masculine foreman voice: ${text}`;
    } else if (voice === 'Charon') {
      processedText = `Say with a deep, authoritative, resonant masculine voice: ${text}`;
    } else if (voice === 'Zephyr') {
      processedText = `Say with a gravelly, seasoned construction worker voice: ${text}`;
    }

    const response = await fetch('/api/ai/v2/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: processedText }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              voiceName: VALID_GEMINI_VOICES.includes(voice) ? voice : 'Aoide'
            }
          }
        }
      })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Proxy Voice Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const base64Audio = data.audio;

    if (base64Audio) {
      console.log(`[VOICE SERVICE] Received audio via Proxy`);
      
      // Conversion from base64 to ArrayBuffer
      const byteCharacters = atob(base64Audio);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      let audioBuffer;
      try {
        audioBuffer = await audioContext.decodeAudioData(byteArray.buffer.slice(0));
      } catch (decodeError) {
        // Fallback for raw PCM data
        const wavHeader = createWavHeader(byteArray.length, 24000);
        const wavArray = new Uint8Array(wavHeader.length + byteArray.length);
        wavArray.set(wavHeader);
        wavArray.set(byteArray, wavHeader.length);
        
        try {
          audioBuffer = await audioContext.decodeAudioData(wavArray.buffer);
        } catch (retryError) {
          console.error("[VOICE SERVICE] Audio decoding failed entirely.", retryError);
          throw retryError;
        }
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      source.onended = () => {
        if (onEnd) onEnd();
      };
      
      source.start();
    } else {
      throw new Error("EMPTY_AUDIO_RESPONSE");
    }
  } catch (error: any) {
    console.error("[VOICE SERVICE] SDK FAILURE:", error);
    
    // If the primary TTS model fails, try gemini-2.0-flash as a backup if we wanted to be robust,
    // but here we fall back to browser speech synthesis as it is the safest local fallback.
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const isMale = ['Charon', 'Fenrir', 'Zephyr'].includes(voice);
      
      utterance.pitch = isMale ? 0.7 : 1.0;
      utterance.rate = isMale ? 0.8 : 0.9;
      
      const voices = window.speechSynthesis.getVoices();
      let bestVoice;
      if (isMale) {
        bestVoice = voices.find(v => v.name.includes('Male') || v.name.includes('Daniel') || v.name.includes('Google UK English Male'));
      } else {
        bestVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Samantha'));
      }
      
      if (bestVoice) utterance.voice = bestVoice;

      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd;
      }
      window.speechSynthesis.speak(utterance);
    } else if (onEnd) {
      onEnd();
    }
  }
}
