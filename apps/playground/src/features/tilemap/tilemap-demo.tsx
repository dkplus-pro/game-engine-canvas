import { createTileMapSamples } from "./create-tilemap-samples";
import { TileMapGrid } from "./tilemap-grid";

export function TileMapDemo() {
  const { dungeon, cave } = createTileMapSamples();

  return (
    <div className="demo-grid">
      <section className="panel" aria-label="Tilemap facts">
        <p className="lesson-kicker">Demo 07</p>
        <h1>TileMap & Procgen</h1>
        <p className="copy">TileMap 用数字格子表示地图，生成器负责写入墙和地面。</p>
        <div className="fact">
          <span>Rooms</span>
          <strong>{dungeon.rooms.length}</strong>
        </div>
        <div className="fact">
          <span>Dungeon Floor</span>
          <strong>{dungeon.map.count(0)}</strong>
        </div>
        <div className="fact">
          <span>Cave Floor</span>
          <strong>{cave.count(0)}</strong>
        </div>
      </section>
      <section className="tilemap-showcase" aria-label="Generated maps">
        <TileMapGrid label="Dungeon" map={dungeon.map} />
        <TileMapGrid label="Cave" map={cave} />
      </section>
    </div>
  );
}
