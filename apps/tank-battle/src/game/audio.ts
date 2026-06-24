export interface TankAudio {
  readonly start: () => void;
  readonly shoot: () => void;
  readonly explosion: () => void;
  readonly powerUp: () => void;
}

export function createTankAudio(missionAudio?: HTMLAudioElement): TankAudio {
  let context: AudioContext | undefined;

  const getContext = () => {
    context ??= new AudioContext();
    return context;
  };

  const tone = (frequency: number, duration: number, type: OscillatorType, gainValue = 0.05) => {
    try {
      const audio = getContext();
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency * 0.35), audio.currentTime + duration);
      gain.gain.setValueAtTime(gainValue, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start();
      oscillator.stop(audio.currentTime + duration);
    } catch {
      // Audio is optional; browsers can block it before a user gesture.
    }
  };

  return {
    start: () => {
      void missionAudio?.play().catch(() => undefined);
      tone(220, 0.16, "square", 0.035);
    },
    shoot: () => tone(520, 0.07, "square", 0.045),
    explosion: () => tone(90, 0.24, "sawtooth", 0.08),
    powerUp: () => tone(880, 0.18, "triangle", 0.05)
  };
}
