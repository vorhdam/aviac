import fs from "node:fs";
import { AudioProcessor } from "./processors/audio";
import { ImageProcessor } from "./processors/image";
import { VideoProcessor } from "./processors/video";
export * from "./helpers/mimes";

export { AudioProcessor, ImageProcessor, VideoProcessor };

async function testImage() {
  const buffer = fs.readFileSync("./assets/images/sample.png");
  const file = new File([buffer], "image.png", { type: "image/png" });
  try {
    const imageProcess = new ImageProcessor(file);
    const webp = await imageProcess.webp().execute();
    fs.writeFileSync(
      "./assets/exports/result.webp",
      Buffer.from(await webp.arrayBuffer()),
    );
  } catch (error: any) {
    console.error("Test failed:", error.message);
  }
}

async function testVideo() {
  const buffer = fs.readFileSync("./assets/videos/sample.mp4");
  const file = new File([buffer], "video.mp4", { type: "video/mp4" });
  try {
    const videoProcess = new VideoProcessor(file);
    const webm = await videoProcess.webm().execute();
    fs.writeFileSync(
      "./assets/exports/video.webm",
      Buffer.from(await webm.arrayBuffer()),
    );
  } catch (error: any) {
    console.error("Test failed:", error.message);
  }
}

async function testAudio() {
  const buffer = fs.readFileSync("./assets/audios/sample.mp3");
  const file = new File([buffer], "audio.mp3", { type: "audio/mpeg" });
  try {
    const audioProcess = new AudioProcessor(file);
    const webm = await audioProcess.webm().execute();
    fs.writeFileSync(
      "./assets/exports/audio.webm",
      Buffer.from(await webm.arrayBuffer()),
    );
  } catch (error: any) {
    console.error("Test failed:", error.message);
  }
}

await testImage();
console.log("Video test done.");

await testVideo();
console.log("Video test done.");

await testAudio();
console.log("Audio test done.");
