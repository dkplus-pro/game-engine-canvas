import { InputState } from "./input-state";

export interface BrowserInputTarget {
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

export function bindBrowserInput(
  input: InputState,
  target: BrowserInputTarget = window
): () => void {
  const keyDown = (event: Event) => {
    input.keyDown((event as KeyboardEvent).code);
  };
  const keyUp = (event: Event) => {
    input.keyUp((event as KeyboardEvent).code);
  };
  const pointerMove = (event: Event) => {
    const pointer = event as PointerEvent;
    input.pointerMove(pointer.offsetX ?? pointer.clientX, pointer.offsetY ?? pointer.clientY);
  };
  const pointerDown = (event: Event) => {
    const pointer = event as PointerEvent;
    input.pointerDown(pointer.offsetX ?? pointer.clientX, pointer.offsetY ?? pointer.clientY);
  };
  const pointerUp = (event: Event) => {
    const pointer = event as PointerEvent;
    input.pointerUp(pointer.offsetX ?? pointer.clientX, pointer.offsetY ?? pointer.clientY);
  };

  target.addEventListener("keydown", keyDown);
  target.addEventListener("keyup", keyUp);
  target.addEventListener("pointermove", pointerMove);
  target.addEventListener("pointerdown", pointerDown);
  target.addEventListener("pointerup", pointerUp);

  return () => {
    target.removeEventListener("keydown", keyDown);
    target.removeEventListener("keyup", keyUp);
    target.removeEventListener("pointermove", pointerMove);
    target.removeEventListener("pointerdown", pointerDown);
    target.removeEventListener("pointerup", pointerUp);
  };
}
