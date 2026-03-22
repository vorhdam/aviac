import { AviacError } from "@/helpers/errors.ts";
import { isImage } from "@/helpers/mimes.ts";
import { BaseProcessor } from "@/processors/base.ts";
import sharp, {
  type AvifOptions,
  type JpegOptions,
  type PngOptions,
  type ResizeOptions,
  type WebpOptions,
} from "sharp";

type ResizeConfig = {
  width?: number;
  height?: number;
  options?: ResizeOptions;
};

type OutputFormat =
  | { format: "webp"; options?: WebpOptions }
  | { format: "avif"; options?: AvifOptions }
  | { format: "jpeg"; options?: JpegOptions }
  | { format: "png"; options?: PngOptions };

export type ImageConfig = {
  resize: ResizeConfig | null;
  saturation: number;
  output: OutputFormat;
};

export class ImageProcessor extends BaseProcessor<ImageProcessor> {
  private config: ImageConfig = {
    resize: null,
    saturation: 1,
    output: { format: "webp" },
  };

  constructor(file: File) {
    super(file);
    if (!isImage(file.type))
      throw new AviacError(
        `ImageProcessor recieved a non-image file: ${file.type}`,
      );
  }

  /**
   * Resize the image. Both width and height are optional (Sharp will
   * preserve aspect ratio when only one dimension is provided).
   * @example processor.resize(1920, 1080, { fit: "inside" })
  */
  resize(width?: number, height?: number, options?: ResizeOptions): this {
    this.config.resize = { width, height, options };
    return this;
  }

  /** * Adjust image saturation.
   * @param value 0 is grayscale, 1 is default, >1 increases saturation.
   * @example processor.saturation(1.5)
  */
  saturation(value: number): this {
    this.config.saturation = value;
    return this;
  }

  /** Convert to WebP.
   * @param options Sharp WebP options.
   * @example processor.webp({ quality : 75 })
  */
  webp(options?: WebpOptions): this {
    this.config.output = { format: "webp", options };
    return this;
  }

  /** Convert to AVIF.
   * @param options Sharp AVIF options.
   * @example processor.avif({ quality : 75 })
  */
  avif(options?: AvifOptions): this {
    this.config.output = { format: "avif", options };
    return this;
  }

  /** Convert to JPEG.
   * @param options Sharp JPEG options.
   * @example processor.jpeg({ quality : 75 })
  */
  jpeg(options?: JpegOptions): this {
    this.config.output = { format: "jpeg", options };
    return this;
  }

  /** Convert to PNG.
   * @param options Sharp PNG options.
   * @example processor.png({ quality : 75 })
  */
  png(options?: PngOptions): this {
    this.config.output = { format: "png", options };
    return this;
  }

  async execute(): Promise<File> {
    const arrayBuffer = await this.file.arrayBuffer();

    let pipeline = sharp(Buffer.from(arrayBuffer));

    if (this.config.resize) {
      const { width, height, options } = this.config.resize;
      pipeline = pipeline.resize(width, height, options);
    }

    if (this.config.saturation) {
      pipeline = pipeline.modulate({
        saturation: this.config.saturation,
      });
    }

    let outputMime: string;
    let outputBuffer: Buffer;

    switch (this.config.output?.format) {
      case "webp":
        outputBuffer = await pipeline
          .webp(this.config.output.options)
          .toBuffer();
        outputMime = "image/webp";
        break;

      case "avif":
        outputBuffer = await pipeline
          .avif(this.config.output.options)
          .toBuffer();
        outputMime = "image/avif";
        break;

      case "jpeg":
        outputBuffer = await pipeline
          .jpeg(this.config.output.options)
          .toBuffer();
        outputMime = "image/jpeg";
        break;

      case "png":
        outputBuffer = await pipeline
          .png(this.config.output.options)
          .toBuffer();
        outputMime = "image/png";
        break;

      default:
        outputBuffer = await pipeline.toBuffer();
        outputMime = this.file.type;
    }

    const name = this.createName(outputMime);
    return new File([outputBuffer], name, { type: outputMime });
  }
}
