import { FFmpegError } from "@/helpers/errors";
import { tmpdir } from "node:os";
import { join } from "node:path";

export async function runFFmpeg(
  input: Uint8Array | File,
  args: string[],
  timeout: number = 30000,
): Promise<Uint8Array> {
  const tmpPath = join(tmpdir(), `ffmpeg-${crypto.randomUUID()}.tmp`);
  await Bun.write(tmpPath, input);

  // Replace pipe:0 with the actual file path
  const resolvedArgs = args.map((a) => (a === "pipe:0" ? tmpPath : a));

  const process = Bun.spawn(
    ["ffmpeg", "-hide_banner", "-loglevel", "error", ...resolvedArgs],
    {
      stdout: "pipe",
      stderr: "pipe",
    },
  );

  const timer = setTimeout(() => {
    process.kill();
  }, timeout);

  // Use the Response API to aggregate the output stream into one buffer efficiently
  const outResponse = new Response(process.stdout);
  const errResponse = new Response(process.stderr);

  const [result, errorText, exitCode] = await Promise.all([
    outResponse.arrayBuffer(),
    errResponse.text(),
    process.exited,
  ]);

  clearTimeout(timer);
  await Bun.file(tmpPath).delete(); // Clean up immediately

  if (exitCode !== 0) {
    throw new FFmpegError(exitCode ?? 1, errorText.trim() || "Unknown error");
  }

  return new Uint8Array(result);
}
