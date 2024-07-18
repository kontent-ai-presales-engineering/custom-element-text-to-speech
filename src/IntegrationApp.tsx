import { useState } from 'react';
import { useConfig } from './customElement/CustomElementContext';
import { ElementValue, useElements } from './customElement/selectors';
import { Config } from './customElement/config';
import { useVoices } from './useVoices';
import { match } from 'ts-pattern';

export const IntegrationApp = () => {
  const config = useConfig();
  const watchedElementsValues = useElements(config.elementsToRead);
  const { availableVoices, setSelectedVoice, selectedVoice } = useVoices();
  const [selectedElementCodename, setSelectedElementCodename] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [playerState, setPlayerState] = useState<PlayerState>(PlayerState.Stopped);

  const onRead = () => {
    if (!selectedVoice || !watchedElementsValues) {
      return;
    }
    const textToRead = getTextToRead(watchedElementsValues, config, selectedElementCodename);
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.voice = selectedVoice;
    utterance.onstart = () => setPlayerState(PlayerState.Playing);
    utterance.onend = () => setPlayerState(PlayerState.Stopped);

    utterance.onpause = () => setPlayerState(PlayerState.Paused);
    utterance.onresume = () => setPlayerState(PlayerState.Playing);

    utterance.onboundary = (event) => setProgress(event.charIndex / textToRead.length);

    window.speechSynthesis.speak(utterance);
  };

  const onPause = () => window.speechSynthesis.pause();

  const onResume = () => window.speechSynthesis.resume();

  const onCancel = () => {
    window.speechSynthesis.cancel();
    setPlayerState(PlayerState.Stopped);
    setProgress(0);
  };

  return (
    <div>
      <select
        value={selectedVoice ? selectedVoice.name : ''}
        onChange={setSelectedVoice}
      >
        {availableVoices.map((voice) => (
          <option key={voice.name} value={voice.name}>
            {voice.name}
          </option>
        ))}
      </select>
      {config.behaviour === "pickOne" && watchedElementsValues?.size && (
        <select
          value={selectedElementCodename || ''}
          onChange={(e) => setSelectedElementCodename(e.target.value)}
        >
          {Array.from(watchedElementsValues.keys()).map((codename) => (
            <option key={codename} value={codename}>
              {codename}
            </option>
          ))}
        </select>
      )}
      {selectedVoice && selectedVoice.name}
      {match(playerState)
        .with(PlayerState.Stopped, () => <button onClick={onRead}>Read</button>)
        .with(PlayerState.Playing, () => <button onClick={onPause}>Pause</button>)
        .with(PlayerState.Paused, () => <button onClick={onResume}>Resume</button>)
        .exhaustive()
      }
      <button onClick={onCancel} disabled={playerState === PlayerState.Stopped}>Cancel</button>
      {(progress * 100).toFixed(0)}%
    </div>
  );
};

IntegrationApp.displayName = 'IntegrationApp';

const getTextToRead = (elements: ReadonlyMap<string, ElementValue>, config: Config, selectedElementCodename: string | null) => {
  switch (config.behaviour) {
    case "readAll":
      return Array.from(elements.values())
        .map(getElementText)
        .join(" ");
    case "pickOne":
      return selectedElementCodename
        ? getElementText(elements.get(selectedElementCodename) ?? "")
        : [...elements.values()].map(getElementText).join(" ");
  }
};

const getElementText = (element: ElementValue) =>
  typeof element === "string"
    ? element
    : element.map(o => o.name).join(", ");

enum PlayerState {
  Stopped = "Stopped",
  Playing = "Playing",
  Paused = "Paused",
}
