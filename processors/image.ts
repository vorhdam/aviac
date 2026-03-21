import sharp, {
  type ResizeOptions,
  type WebpOptions,
  type AvifOptions,
  type JpegOptions,
  type PngOptions,
} from "sharp";
import { BaseProcessor } from "./base.ts";
import { isImage } from "../helpers/mimes.ts";
import { AviacError } from "../helpers/errors.ts";

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
  output: OutputFormat;
};

export class ImageProcessor extends BaseProcessor<ImageProcessor> {
  private config: ImageConfig = {
    resize: null,
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

  /** Convert to WebP. @example processor.webp({ quality : 75 })*/
  webp(options?: WebpOptions): this {
    this.config.output = { format: "webp", options };
    return this;
  }

  /** Convert to AVIF. @example processor.avif({ quality : 75 })*/
  avif(options?: AvifOptions): this {
    this.config.output = { format: "avif", options };
    return this;
  }

  /** Convert to JPEG. @example processor.jpeg({ quality : 75 })*/
  jpeg(options?: JpegOptions): this {
    this.config.output = { format: "jpeg", options };
    return this;
  }

  /** Convert to PNG. @example processor.png({ quality : 75 })*/
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
        outputBuffer = await pipeline.png(this.config.output.options).toBuffer();
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
