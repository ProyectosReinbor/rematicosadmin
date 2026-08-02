"use client";

import { useCallback, useRef } from "react";

interface VoiceConfig {
  enabled: boolean;
  rate: number;
  pitch: number;
  volume: number;
  lang: string;
}

const DEFAULT_CONFIG: VoiceConfig = {
  enabled: true,
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  lang: "es-CO",
};

export function useVoice(config: VoiceConfig = DEFAULT_CONFIG) {
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const getSynth = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      if (!synthRef.current) {
        synthRef.current = window.speechSynthesis;
      }
      return synthRef.current;
    }
    return null;
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!config.enabled) return;

      const synth = getSynth();
      if (!synth) return;

      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = config.lang;
      utterance.rate = config.rate;
      utterance.pitch = config.pitch;
      utterance.volume = config.volume;

      const voices = synth.getVoices();
      const femaleVoice = voices.find(
        (v) => v.lang.startsWith("es") && v.name.toLowerCase().includes("female")
      ) || voices.find((v) => v.lang.startsWith("es"));

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      synth.speak(utterance);
    },
    [config, getSynth]
  );

  const speakPayment = useCallback(
    (payerName: string, _amount: number) => {
      const message = `${payerName}, tu pago ha sido recibido. Gracias por comprar aquí. Que tengas un excelente día.`;
      speak(message);
    },
    [speak]
  );

  return { speak, speakPayment };
}