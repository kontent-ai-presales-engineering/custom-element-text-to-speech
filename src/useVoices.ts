import { useCallback, useEffect, useState } from "react";

export const useVoices = () => {
  const [availableVoices, setAvailableVoices] = useState(() => window.speechSynthesis.getVoices());
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const onVoicesChanged = () => {
      const newVoices = window.speechSynthesis.getVoices();

      setAvailableVoices(newVoices);
      setSelectedVoice(prev => newVoices.find(v => v.name === prev?.name) || newVoices[0] || null);
    };

    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);

    return () => window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
  }, []);

  const onSelectedVoiceChange = useCallback((newVoiceName: string) => {
    const voice = availableVoices.find(v => v.name === newVoiceName);
    if (voice) {
      setSelectedVoice(voice);
    }
  }, [availableVoices, setSelectedVoice]);

  return { availableVoices, selectedVoice, setSelectedVoice: onSelectedVoiceChange };
};
