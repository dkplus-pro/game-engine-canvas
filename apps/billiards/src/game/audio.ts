export interface BilliardsAudio {
  readonly start: () => void;
  readonly shot: () => void;
  readonly collision: () => void;
  readonly pocket: () => void;
  readonly foul: () => void;
}

export function createBilliardsAudio(): BilliardsAudio {
  let context: AudioContext | undefined;

  const getContext = () => {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
    return context;
  };

  const tone = (frequency: number, duration: number, gain: number, type: OscillatorType = "sine") => {
    const audio = getContext();
    const oscillator = audio.createOscillator();
    const volume = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
    volume.gain.setValueAtTime(gain, audio.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + duration);
    oscillator.connect(volume).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration);
  };

  return {
    start: () => {
      void getContext();
    },
    shot: () => tone(138, 0.12, 0.18, "triangle"),
    collision: () => tone(320, 0.055, 0.07, "sine"),
    pocket: () => {
      tone(220, 0.13, 0.1, "sine");
      window.setTimeout(() => tone(440, 0.11, 0.08, "triangle"), 80);
    },
    foul: () => tone(92, 0.28, 0.16, "sawtooth")
  };
}
