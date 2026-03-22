import { AviacError } from "@/helpers/errors";
import { runFFmpeg } from "@/helpers/ffmpeg";
import {
  AudioCodecs,
  isAudio,
  MimeFFmpegDict,
  type Mime,
} from "@/helpers/mimes";
import { BaseProcessor } from "@/processors/base";

export type AudioConfig = {
  mime?: Extract<Mime, `audio/${string}`>;
  bitrate?: string;
  sampleRate?: number;
  channels?: "mono" | "stereo";
  args?: string[];
};

export class AudioProcessor extends BaseProcessor<AudioProcessor> {
  private config: AudioConfig = {};

  constructor(file: File) {
    super(file);
    if (!isAudio(file.type))
      throw new AviacError(
        `AudioProcessor recieved a non-audio file: ${file.type}`,
      );
  }

  /** Convert to WebM. @example processor.webm()*/
  webm(): this {
    this.config.mime = "audio/webm";
    return this;
  }

  /** Convert to MP3. @example processor.mp3()*/
  mp3(): this {
    this.config.mime = "audio/mpeg";
    return this;
  }

  /** Convert to WAV. @example processor.wav()*/
  wav(): this {
    this.config.mime = "audio/wav";
    return this;
  }

  /** Convert to OGG. @example processor.ogg()*/
  ogg(): this {
    this.config.mime = "audio/ogg";
    return this;
  }

  /** Convert to FLAC. @example processor.flac()*/
  flac(): this {
    this.config.mime = "audio/flac";
    return this;
  }

  /** Set bitrate. 
   * @param bitrate The bitrate of the audio.
   * @example processor.bitrate("192k")
  */
  bitrate(bitrate: string): this {
    this.config.bitrate = bitrate;
    return this;
  }

  /** Set sample rate. 
   * @param hertz The audio sample rate in hertz.
   * @example processor.sampleRate(44100)
  */
  sampleRate(hertz: number): this {
    this.config.sampleRate = hertz;
    return this;
  }

  /** Set channel type. 
   * @param channels Select from "mono" or "stereo" channels.
   * @example processor.channels("stereo")
  */
  channels(channels: "mono" | "stereo"): this {
    this.config.channels = channels;
    return this;
  }

  /** Extend FFmpeg arguments. 
   * @param args Additional FFmpeg arguments.
   * @example processor.args("-b:a 192k")
  */
  args(args: string[]): this {
    this.config.args = args;
    return this;
  }

  async execute(): Promise<File> {
    const outputMime = this.config.mime ?? "audio/webm";
    const outputExtension = MimeFFmpegDict[outputMime] ?? "webm";
    const codec = AudioCodecs[outputExtension] ?? "copy";

    const args: string[] = [
      "-i",
      "pipe:0",

      // codec
      "-acodec", codec,
      // bitrate
      ...(this.config.bitrate ? ["-b:a", this.config.bitrate] : []),
      // sample rate
      ...(this.config.sampleRate
        ? ["-ar", String(this.config.sampleRate)]
        : []),
      // channels
      ...(this.config.channels
        ? ["-ac", this.config.channels === "mono" ? "1" : "2"]
        : []),
      // extensions
      ...(this.config.args ?? []),
      
      "-f",
      outputExtension,
      "pipe:1",
    ];

    const output = await runFFmpeg(this.file, args);

    return new File([output], this.createName(outputMime), {
      type: outputMime,
    });
  }
}
