/**
 * Versusfy Supreme Speech Utility
 * Standardizes the voice of all AI Agents to match the Supreme Omni-Assistant.
 */

import { speakText, AgentVoice, stopAllVoice } from '../services/voiceService';

interface SpeakOptions {
  voice?: AgentVoice;
  onStart?: () => void;
  onEnd?: () => void;
  localOnly?: boolean;
}

export const speak = async (text: string, options: SpeakOptions = {}) => {
  if (typeof window === 'undefined') return;

  if (options.onStart) options.onStart();
  
  if (options.localOnly) {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const isMale = ['Charon', 'Fenrir', 'Zephyr', 'Puck'].includes(options.voice || 'Puck');
        
        const currentVoice = options.voice || 'Puck';
        if (currentVoice === 'Puck') {
          utterance.pitch = 0.95;
          utterance.rate = 1.0; // Natural and fluid
        } else if (currentVoice === 'Fenrir') {
          utterance.pitch = 0.85; 
          utterance.rate = 0.95;  
        } else {
          utterance.pitch = isMale ? 0.78 : (['Kore', 'Aoide'].includes(options.voice || '') ? 1.05 : 1.05);
          utterance.rate = isMale ? 0.95 : (['Kore', 'Aoide'].includes(options.voice || '') ? 0.98 : 0.95);
        }
        
        const voices = window.speechSynthesis.getVoices();
        let bestVoice;
        
        if (isMale) {
          bestVoice = voices.find(v => 
            (v.name.includes('Male') || v.name.includes('Google UK English Male') || v.name.includes('Daniel')) && 
            v.lang.startsWith('en-')
          );
        } else {
          bestVoice = voices.find(v => 
            (v.name.includes('Samantha') || v.name.includes('Victoria')) && 
            v.lang.startsWith('en-')
          );
        }
        
        if (bestVoice) utterance.voice = bestVoice;
        if (options.onEnd) {
          utterance.onend = options.onEnd;
          utterance.onerror = options.onEnd;
        }
        window.speechSynthesis.speak(utterance);
        return;
      }
    } catch (e) {
      console.warn("Local speech failed, falling back", e);
    }
  }

  try {
    await speakText(text, options.voice || 'Puck', options.onEnd);
  } catch (error) {
    console.error("Speech error, falling back to browser:", error);
    // Standardize browser fallback
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const isMale = ['Charon', 'Fenrir', 'Zephyr', 'Puck'].includes(options.voice || 'Puck');
      
      const currentVoice = options.voice || 'Puck';
      if (currentVoice === 'Puck') {
        utterance.pitch = 0.9;
        utterance.rate = 1.05;
      } else if (currentVoice === 'Fenrir') {
        utterance.pitch = 0.85; 
        utterance.rate = 1.02;  
      } else {
        utterance.pitch = isMale ? 0.78 : (['Kore', 'Aoide'].includes(options.voice || '') ? 1.05 : 1.05);
        utterance.rate = isMale ? 1.0 : (['Kore', 'Aoide'].includes(options.voice || '') ? 1.05 : 1.0);
      }
      
      const voices = window.speechSynthesis.getVoices();
      let bestVoice;
      
      if (isMale) {
        bestVoice = voices.find(v => 
          (v.name.includes('Male') || v.name.includes('Google UK English Male') || v.name.includes('Daniel')) && 
          v.lang.startsWith('en-')
        );
      } else {
        bestVoice = voices.find(v => 
          (v.name.includes('Samantha') || v.name.includes('Victoria')) && 
          v.lang.startsWith('en-')
        );
      }
      
      if (bestVoice) utterance.voice = bestVoice;
      if (options.onEnd) {
        utterance.onend = options.onEnd;
        utterance.onerror = options.onEnd;
      }
      window.speechSynthesis.speak(utterance);
    } else if (options.onEnd) {
      options.onEnd();
    }
  }
};

export const stopSpeaking = () => {
  if (typeof window !== 'undefined') {
    stopAllVoice();
  }
};

export const getVoices = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    return window.speechSynthesis.getVoices();
  }
  return [];
};
