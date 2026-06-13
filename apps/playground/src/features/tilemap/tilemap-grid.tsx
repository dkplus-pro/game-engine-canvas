import type { TileMap } from "@game-engine-canvas/engine";

export function TileMapGrid({ map, label }: { readonly map: TileMap; readonly label: string }) {
  return (
    <section className="tilemap-card" aria-label={label}>
      <strong>{label}</strong>
      <div
        className="tilemap-grid"
        style={{
          gridTemplateColumns: `repeat(${map.width}, 1fr)`
        }}
      >
        {map.toRows().flatMap((row, y) =>
          row.map((tile, x) => (
            <span
              className={tile === 1 ? "tile wall" : "tile floor"}
              key={`${x}-${y}`}
            />
          ))
        )}
      </div>
    </section>
  );
}
