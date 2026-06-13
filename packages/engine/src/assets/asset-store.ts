export type ImageAsset = CanvasImageSource;

export class AssetStore {
  private readonly images = new Map<string, ImageAsset>();

  registerImage(key: string, image: ImageAsset): this {
    this.images.set(key, image);
    return this;
  }

  getImage(key: string): ImageAsset | undefined {
    return this.images.get(key);
  }

  requireImage(key: string): ImageAsset {
    const image = this.getImage(key);

    if (!image) {
      throw new Error(`Image asset "${key}" is not registered.`);
    }

    return image;
  }

  hasImage(key: string): boolean {
    return this.images.has(key);
  }

  async loadImage(key: string, src: string): Promise<ImageAsset> {
    if (typeof Image === "undefined") {
      throw new Error("Image loading is only available in browser-like environments.");
    }

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const nextImage = new Image();
      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error(`Failed to load image "${src}".`));
      nextImage.src = src;
    });

    this.registerImage(key, image);
    return image;
  }
}
