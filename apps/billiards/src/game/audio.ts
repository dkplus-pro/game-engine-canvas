export interface BilliardsAudio {
  readonly start: () => void;
  readonly cue: () => void;
  readonly pocket: () => void;
  readonly rail: () => void;
  readonly win: () => void;
}

export function createBilliardsAudio(): BilliardsAudio {
  let context: AudioContext | undefined;

  const getContext = () => {
    context ??= new AudioContext();
    return context;
  };

  const tone = (frequency: number, duration: number, type: OscillatorType, gainValue = 0.04) => {
    try {
      const audio = getContext();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency * 0.42), audio.currentTime + duration);
      gain.gain.setValueAtTime(gainValue, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + duration);
    } catch {
      // Web Audio is optional; browsers may block it until a user gesture.
    }
  };

  return {
    start: () => tone(220, 0.12, "sine", 0.025),
    cue: () => tone(440, 0.08, "triangle", 0.04),
    pocket: () => tone(160, 0.18, "sine", 0.05),
    rail: () => tone(260, 0.05, "square", 0.018),
    win: () => {
      tone(660, 0.12, "triangle", 0.035);
      setTimeout(() => tone(990, 0.16, "triangle", 0.03), 110);
    }
  };
}
