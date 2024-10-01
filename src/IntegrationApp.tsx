import { useState } from 'react';
import { useConfig } from './customElement/CustomElementContext';
import { ElementValue, useElements } from './customElement/selectors';
import { Config } from './customElement/config';
import { useVoices } from './useVoices';
import { match } from 'ts-pattern';
import { Dropdown } from './components/Dropdown';
import { Button } from './components/Button';
import { app, appRow } from "./integrationApp.module.css";

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
    <div className={app}>
      <div className={appRow}>
        <Dropdown
          emptyText="Choose a voice"
          options={availableVoices.map(v => v.name)}
          selectedOption={selectedVoice?.name ?? null}
          onSelect={setSelectedVoice}
        />
        {config.behaviour === "pickOne" && watchedElementsValues?.size && (
          <Dropdown
            emptyText="Choose an element to read"
            options={Array.from(watchedElementsValues.keys())}
            selectedOption={selectedElementCodename ?? null}
            onSelect={setSelectedElementCodename}
          />
        )}
        <div>progress: {(progress * 100).toFixed(0)}%</div>
      </div>

      <div className={appRow}>
        {match(playerState)
          .with(PlayerState.Stopped, () => <Button type="primary" onClick={onRead}>Read</Button>)
          .with(PlayerState.Playing, () => <Button type="primary" onClick={onPause}>Pause</Button>)
          .with(PlayerState.Paused, () => <Button type="primary" onClick={onResume}>Resume</Button>)
          .exhaustive()
        }
        <Button type="secondary" onClick={onCancel} isDisabled={playerState === PlayerState.Stopped}>Cancel</Button>
      </div>
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
