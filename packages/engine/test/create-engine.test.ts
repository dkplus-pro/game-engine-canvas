import { describe, expect, it } from "vitest";
import { createEngine } from "../src/index";

describe("createEngine", () => {
  it("returns package identity", () => {
    expect(createEngine()).toEqual({
      name: "game-engine-canvas",
      version: "0.1.0"
    });
  });
});
