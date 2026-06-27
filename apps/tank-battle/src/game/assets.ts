import { AssetStore } from "@game-engine-canvas/engine";
import { publicAssetPath } from "./asset-path";

export interface TankBattleAssets {
  readonly store: AssetStore;
  readonly spriteAtlas?: HTMLImageElement;
  readonly missionAudio?: HTMLAudioElement;
}

export function loadTankBattleAssets(): TankBattleAssets {
  const store = new AssetStore();
  const atlas = new Image();
  atlas.decoding = "async";
  atlas.src = publicAssetPath("/assets/tank-battle-sprites.png");
  atlas.addEventListener("load", () => store.registerImage("tank-atlas", atlas), { once: true });

  const missionAudio =
    typeof Audio !== "undefined" ? new Audio(publicAssetPath("/assets/audio/mission-start.wav")) : undefined;
  if (missionAudio) {
    missionAudio.preload = "auto";
  }

  return { store, spriteAtlas: atlas, missionAudio };
}
