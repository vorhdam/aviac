import { AviacError } from "../helpers/errors";
import { runFFmpeg } from "../helpers/ffmpeg";
import {
  isVideo,
  MimeFFmpegDict,
  VideoCodecs,
  type Mime,
} from "../helpers/mimes";
import { BaseProcessor } from "./base";

export type VideoConfig = {
  mime?: Extract<Mime, `video/${string}`>;
  videoBitrate?: string;
  audioBitrate?: string;
  resize?: [number, number];
  fps?: number;
  mute?: boolean;
  args?: string[];
};

export class VideoProcessor extends BaseProcessor<VideoProcessor> {
  private config: VideoConfig = {};

  constructor(file: File) {
    super(file);
    if (!isVideo(file.type))
      throw new AviacError(
        `VideoProcessor recieved a non-video file: ${file.type}`,
      );
  }

  /** Convert to WebM. @example processor.webm()*/
  webm(): this {
    this.config.mime = "video/webm";
    return this;
  }

  /** Convert to MP4. @example processor.mp4()*/
  mp4(): this {
    this.config.mime = "video/mp4";
    return this;
  }

  /** Convert to MOV (Quicktime). @example processor.mov()*/
  mov(): this {
    this.config.mime = "video/quicktime";
    return this;
  }

  /** Convert to MKV (Matroska). @example processor.mkv()*/
  mkv(): this {
    this.config.mime = "video/x-matroska";
    return this;
  }

  /** Convert to AVI (MSVideo). @example processor.avi()*/
  avi(): this {
    this.config.mime = "video/x-msvideo";
    return this;
  }

  /** Convert to FLV. @example processor.flv()*/
  flv(): this {
    this.config.mime = "video/x-flv";
    return this;
  }

  /** Set video bitrate. @example processor.videoBitrate("2M")*/
  videoBitrate(bitrate: string): this {
    this.config.videoBitrate = bitrate;
    return this;
  }

  /** Set video bitrate. @example processor.audioBitrate("192k")*/
  audioBitrate(bitrate: string): this {
    this.config.audioBitrate = bitrate;
    return this;
  }

  /** Resize output. Pass -1 for a dimension to preserve aspect ratio. @example processor.resize(1920, 1080)*/
  resize(width: number, height: number): this {
    this.config.resize = [width, height];
    return this;
  }

  /** Set frame per second. @example processor.fps(24)*/
  fps(value: number): this {
    this.config.fps = value;
    return this;
  }

  /** Remove audio from video. @example processor.mute()*/
  mute(): this {
    this.config.mute = true;
    return this;
  }

  /** Extend FFmpeg arguments. @example processor.args("-b:a 192k", "-b:v 2M")*/
  args(args: string[]): this {
    this.config.args = args;
    return this;
  }

  async execute(): Promise<File> {
    console.log("Started video processing...");
    const outputMime = this.config.mime ?? "video/webm";
    const inputExtension = MimeFFmpegDict[this.file.type as Mime] ?? "webm";
    const outputExtension = MimeFFmpegDict[outputMime] ?? "webm";
    const codecs = VideoCodecs[outputExtension] ?? {
      vcodec: "copy",
      acodec: "copy",
    };

    const args: string[] = [
      // Input: read from stdin
      "-f",
      inputExtension,
      "-i",
      "pipe:0",

      // Video codec
      "-vcodec",
      codecs.vcodec,

      // Audio
      ...(this.config.mute
        ? ["-an"]
        : [
            "-acodec",
            codecs.acodec,
            ...(this.config.audioBitrate
              ? ["-b:a", this.config.audioBitrate]
              : []),
          ]),

      // Optional video filters
      ...(this.config.videoBitrate ? ["-b:v", this.config.videoBitrate] : []),
      ...(this.config.fps ? ["-r", String(this.config.fps)] : []),
      ...(this.config.resize
        ? ["-vf", `scale=${this.config.resize[0]}:${this.config.resize[1]}`]
        : []),

      // Extra caller-supplied flags
      ...(this.config.args ?? []),

      // Output: write to stdout, movflags required for streaming mp4
      ...(outputExtension === "mp4"
        ? ["-movflags", "frag_keyframe+empty_moov"]
        : []),
      "-f",
      outputExtension,
      "pipe:1",
    ];

    const input = new Uint8Array(await this.file.arrayBuffer());
    const output = await runFFmpeg(input, args);

    const name = this.createName(outputMime);
    return new File([output], name, { type: outputMime });
  }
}
