import { FFmpegError } from "./errors";

export async function runFFmpeg(
  input: Uint8Array,
  args: string[],
  timeout: number = 30000,
): Promise<Uint8Array> {
  const process = Bun.spawn(
    ["ffmpeg", "-hide_banner", "-loglevel", "error", ...args],
    {
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    },
  );

  const timer = setTimeout(() => {
    process.kill();
    throw new FFmpegError(
      124,
      "The FFmpeg process timed out and has been terminated.",
    );
  }, timeout);

  try {
    process.stdin.write(input);
  } finally {
    process.stdin.end();
  }

  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  for await (const chunk of process.stdout) {
    chunks.push(chunk);
    totalBytes += chunk.byteLength;
  }

  const exitCode = await process.exited;
  clearTimeout(timer);

  if (exitCode !== 0) {
    const errorChunks: Uint8Array[] = [];
    for await (const chunk of process.stderr) {
      errorChunks.push(chunk);
    }
    const errorText = Buffer.concat(errorChunks).toString("utf8").trim();
    throw new FFmpegError(exitCode, errorText);
  }

  const result = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return result;
}
