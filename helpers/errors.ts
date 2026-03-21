export class FFmpegError extends Error {
  constructor(
    public readonly errorCode: number,
    public readonly stderr: string,
  ) {
    super(`FFmpeg exited with code ${errorCode}:\n${stderr}`);
    this.name = "FFmpegError";
  }
}

export class SharpError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SharpError";
  }
}

export class AviacError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "AviacError";
      }
}
