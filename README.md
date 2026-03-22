# AVIAC

An Asynchronous Video, Image and Audio Compresser (hence the name Aviac) that uses Sharp and FFmpeg to process your files in a Bun and Typescript server environment.

It uses Sharp to compress images in memory with great quality and sub-second duration.
It leverages the performance of Bun processes to spawn FFmpeg and compress your audio and video files.

Unfortunatelly for most FFmpeg operations you must use temporary files. I couldn't find a workaround for this yet, but fortunatelly this doesn't increase server costs by much.

## Usage

### Image

If you want to turn any image into a **.webp** file use this.

```
const imageProcess = new ImageProcessor(file);
const result = await imageProcess.webp().execute();
```

### Video

If you want to turn any video into a **.webm** file use this.

```
const videoProcess = new VideoProcessor(file);
const webm = await videoProcess.webm().execute();
```

### Audio

If you want to turn any audio into a **.webm** file use this.

```
const audioProcess = new AudioProcessor(file);
const result = await audioProcess.webm().execute();
```
