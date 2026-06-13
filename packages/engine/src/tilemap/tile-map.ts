export class TileMap {
  private readonly tiles: number[];

  constructor(
    readonly width: number,
    readonly height: number,
    fill = 0
  ) {
    this.tiles = Array.from({ length: width * height }, () => fill);
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  get(x: number, y: number): number {
    if (!this.inBounds(x, y)) {
      return 0;
    }

    return this.tiles[this.index(x, y)] ?? 0;
  }

  set(x: number, y: number, value: number): this {
    if (this.inBounds(x, y)) {
      this.tiles[this.index(x, y)] = value;
    }

    return this;
  }

  fill(value: number): this {
    this.tiles.fill(value);
    return this;
  }

  count(value: number): number {
    return this.tiles.filter((tile) => tile === value).length;
  }

  toRows(): number[][] {
    const rows: number[][] = [];

    for (let y = 0; y < this.height; y += 1) {
      rows.push(this.tiles.slice(y * this.width, (y + 1) * this.width));
    }

    return rows;
  }

  clone(): TileMap {
    const map = new TileMap(this.width, this.height);

    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        map.set(x, y, this.get(x, y));
      }
    }

    return map;
  }

  private index(x: number, y: number): number {
    return y * this.width + x;
  }
}
