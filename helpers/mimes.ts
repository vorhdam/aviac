const MimeMap = {
  image: ["webp", "jpeg", "png", "gif", "avif", "tiff", "heic", "bmp"],
  video: ["webm", "mp4", "quicktime", "x-matroska", "x-msvideo", "x-flv"],
  audio: ["webm", "mpeg", "wav", "ogg", "flac", "aac", "opus", "mp4"],
} as const satisfies Record<string, string[]>;

const ExtensionMap = {
  image: ["webp", "jpg", "png", "gif", "avif", "tif", "heic", "bmp"],
  video: ["webm", "mp4", "mov", "mkv", "avi", "flv"],
  audio: ["webm", "mp3", "wav", "ogg", "flac", "aac", "opus", "m4a"],
} as const satisfies Record<string, string[]>;

const FFmpegMap = {
  video: ["webm", "mp4", "mov", "matroska", "avi", "flv"],
  audio: ["webm", "mp3", "wav", "ogg", "flac", "adts", "ogg_opus", "ipod"],
} as const satisfies Record<string, string[]>;

type MimeCategory = keyof typeof MimeMap;
type ExtensionCategory = keyof typeof ExtensionMap;
type FFmpegCategory = keyof typeof FFmpegMap;

type Mime =
  | {
      [category in MimeCategory]: `${category}/${(typeof MimeMap)[category][number]}`;
    }[MimeCategory]
  | (string & {});

const Mimes: Mime[] = Object.entries(MimeMap).flatMap(([category, types]) =>
  types.map((type) => `${category}/${type}` as Mime),
);

type Extension =
  | {
      [category in ExtensionCategory]: `${(typeof ExtensionMap)[category][number]}`;
    }[ExtensionCategory]
  | (string & {});

const Extensions: Extension[] = Object.entries(ExtensionMap).flatMap(
  ([_, types]) => types.map((type) => `${type}` as Extension),
);

type FFmpeg =
  | {
      [category in FFmpegCategory]: `${(typeof FFmpegMap)[category][number]}`;
    }[FFmpegCategory]
  | (string & {});

const MimeExtensionDict = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/tiff": "tif",
  "image/heic": "heic",
  "image/bmp": "bmp",
  "video/webm": "webm",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/x-matroska": "mkv",
  "video/x-msvideo": "avi",
  "video/x-flv": "flv",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  "audio/flac": "flac",
  "audio/aac": "aac",
  "audio/opus": "opus",
  "audio/mp4": "m4a",
} as Record<Mime, Extension>;

const ExtensionMimeDict: Record<Extension, Mime> = Object.fromEntries(
  Object.entries(MimeExtensionDict).map(([mime, ext]) => [ext, mime]),
) as Record<Extension, Mime>;

const MimeFFmpegDict = {
  "video/webm": "webm",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/x-matroska": "matroska",
  "video/x-msvideo": "avi",
  "video/x-flv": "flv",
  "audio/webm": "webm",
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/ogg": "ogg",
  "audio/flac": "flac",
  "audio/aac": "adts",
  "audio/opus": "ogg_opus",
  "audio/mp4": "ipod",
} as Record<Mime, FFmpeg>;

const VideoCodecs: Partial<Record<FFmpeg, { vcodec: string; acodec: string }>> =
  {
    mp4: { vcodec: "libx264", acodec: "aac" },
    webm: { vcodec: "libvpx", acodec: "libopus" },
    matroska: { vcodec: "libx264", acodec: "aac" },
    mov: { vcodec: "libx264", acodec: "aac" },
    avi: { vcodec: "libxvid", acodec: "libmp3lame" },
    flv: { vcodec: "libx264", acodec: "aac" },
  };

const AudioCodecs: Partial<Record<FFmpeg, string>> = {
  webm: "libopus",
  mp3: "libmp3lame",
  wav: "pcm_s16le",
  ogg: "libvorbis",
  flac: "flac",
  adts: "aac",
  ogg_opus: "libopus",
  ipod: "aac",
};

function mimeToExtension(mime: string): Extension | null {
  return MimeExtensionDict[mime] ?? null;
}

function extensionToMime(extension: string): Mime | null {
  return ExtensionMimeDict[extension] ?? null;
}

function isImage(mime: string): boolean {
  return mime.startsWith("image/") && Mimes.includes(mime);
}

function isVideo(mime: string): boolean {
  return mime.startsWith("video/") && Mimes.includes(mime);
}

function isAudio(mime: string): boolean {
  return mime.startsWith("audio/") && Mimes.includes(mime);
}

export {
  AudioCodecs,
  Extensions,
  extensionToMime,
  isAudio,
  isImage,
  isVideo,
  MimeFFmpegDict,
  mimeToExtension,
  VideoCodecs,
  type Extension,
  type Mime,
};
