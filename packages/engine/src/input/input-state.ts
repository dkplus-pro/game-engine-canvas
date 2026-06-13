import { Vec2 } from "../math";

export class InputState {
  readonly pointer = new PointerState();

  private readonly downKeys = new Set<string>();
  private readonly pressedKeys = new Set<string>();
  private readonly releasedKeys = new Set<string>();

  keyDown(code: string): void {
    if (!this.downKeys.has(code)) {
      this.pressedKeys.add(code);
    }

    this.downKeys.add(code);
  }

  keyUp(code: string): void {
    if (this.downKeys.delete(code)) {
      this.releasedKeys.add(code);
    }
  }

  isKeyDown(code: string): boolean {
    return this.downKeys.has(code);
  }

  wasKeyPressed(code: string): boolean {
    return this.pressedKeys.has(code);
  }

  wasKeyReleased(code: string): boolean {
    return this.releasedKeys.has(code);
  }

  pointerMove(x: number, y: number): void {
    this.pointer.position.set(x, y);
  }

  pointerDown(x: number, y: number): void {
    this.pointerMove(x, y);
    this.pointer.down = true;
    this.pointer.pressed = true;
  }

  pointerUp(x: number, y: number): void {
    this.pointerMove(x, y);
    this.pointer.down = false;
    this.pointer.released = true;
  }

  endFrame(): void {
    this.pressedKeys.clear();
    this.releasedKeys.clear();
    this.pointer.pressed = false;
    this.pointer.released = false;
  }
}

export class PointerState {
  readonly position = new Vec2();
  down = false;
  pressed = false;
  released = false;
}
