import { AudioProcessor, ImageProcessor, VideoProcessor } from "@/index";

async function testImage() {
  const buffer = Bun.file("./assets/images/sample.png");
  const file = new File([buffer], "image.png", { type: "image/png" });
  try {
    console.time("Image processing finished.");
    const imageProcess = new ImageProcessor(file);
    const webp = await imageProcess.webp().execute();
    Bun.write(
      "./assets/exports/image.webp",
      Buffer.from(await webp.arrayBuffer()),
    );
    console.timeEnd("Image processing finished.");
  } catch (error: any) {
    console.error("Test failed:", error.message);
  }
}

async function testVideo() {
  const buffer = Bun.file("./assets/videos/sample.mp4");
  const file = new File([buffer], "video.mp4", { type: "video/mp4" });
  try {
    console.time("Video processing finished.");
    const videoProcess = new VideoProcessor(file);
    const webm = await videoProcess
      .webm()
      .args(["-deadline", "realtime", "-cpu-used", "8", "-threads", "0"])
      .execute();
    Bun.write(
      "./assets/exports/video.webm",
      Buffer.from(await webm.arrayBuffer()),
    );
    console.timeEnd("Video processing finished.");
  } catch (error: any) {
    console.error("Test failed:", error.message);
  }
}

async function testAudio() {
  const buffer = Bun.file("./assets/audios/sample.flac");
  const file = new File([buffer], "audio.flac", { type: "audio/flac" });
  try {
    console.time("Audio processing finished.");
    const audioProcess = new AudioProcessor(file);
    const webm = await audioProcess.webm().execute();
    Bun.write(
      "./assets/exports/audio.webm",
      Buffer.from(await webm.arrayBuffer()),
    );
    console.timeEnd("Audio processing finished.");
  } catch (error: any) {
    console.error("Test failed:", error.message);
  }
}

await Promise.all([testImage(), testVideo(), testAudio()]);
