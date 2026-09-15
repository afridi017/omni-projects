"use client";

/**
 * Room recording.
 * Real mode: MediaRecorder on the local user's mic/loopback stream (or a
 * getDisplayMedia + getUserMedia mix). Demo mode: a MockMediaRecorder that
 * produces a real WAV-from-silence download so recordings work without a
 * transport. The UI labels the badge accordingly.
 */

export interface Recorder {
  start(): Promise<void>;
  stop(): Promise<void>;
  onData?: (blob: Blob, mime: string) => void;
  status: "idle" | "recording" | "stopped";
}

export function createRoomRecorder(
  streamProvider: () => Promise<MediaStream | null>,
): Recorder {
  const rec: Recorder = {
    start: async () => {},
    stop: async () => {},
    status: "idle",
  };
  const useMedia =
    typeof MediaRecorder !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia;

  if (useMedia) {
    let mr: MediaRecorder | null = null;
    let chunks: Blob[] = [];
    rec.start = async () => {
      const stream = await streamProvider();
      const mime = pickMime();
      chunks = [];
      mr = new MediaRecorder(stream ?? new MediaStream(), {
        mimeType: mime,
      });
      mr.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      mr.onstop = () => {
        rec.status = "stopped";
        const blob = new Blob(chunks, { type: mime });
        rec.onData?.(blob, mime);
      };
      mr.start();
      rec.status = "recording";
    };
    rec.stop = async () => {
      mr?.stop();
      mr = null;
    };
    return rec;
  }

  // Mock recorder fallback: silence → WAV download.
  let startTs = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  rec.start = async () => {
    startTs = Date.now();
    rec.status = "recording";
    timer = setInterval(() => {
      // keep `status` fresh for the DOT badge
      rec.status = "recording";
    }, 2000);
  };
  rec.stop = async () => {
    if (timer) clearInterval(timer);
    rec.status = "stopped";
    const seconds = (Date.now() - startTs) / 1000;
    const blob = silenceWav(seconds);
    rec.onData?.(blob, "audio/wav");
  };
  return rec;
}

function pickMime(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  for (const c of candidates) {
    if (
      typeof MediaRecorder !== "undefined" &&
      MediaRecorder.isTypeSupported(c)
    )
      return c;
  }
  return "audio/webm";
}

function silenceWav(seconds: number): Blob {
  const rate = 8000;
  const samples = Math.max(1, Math.round(seconds * rate));
  const bytesPerSample = 2;
  const dataSize = samples * bytesPerSample;
  const buf = new ArrayBuffer(44 + dataSize);
  const dv = new DataView(buf);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) dv.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  dv.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true); // PCM
  dv.setUint16(22, 1, true); // mono
  dv.setUint32(24, rate, true);
  dv.setUint32(28, rate * bytesPerSample, true);
  dv.setUint16(32, bytesPerSample, true);
  dv.setUint16(34, 16, true);
  writeStr(36, "data");
  dv.setUint32(40, dataSize, true);
  return new Blob([buf], { type: "audio/wav" });
}

/** Saves a recording blob (download). Returns a label for the UI. */
export function saveRecording(blob: Blob, roomName: string): string {
  const ext = blob.type.includes("webm")
    ? "webm"
    : blob.type.includes("ogg")
      ? "ogg"
      : blob.type.includes("mp4")
        ? "m4a"
        : "wav";
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = `hujra-${roomName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.${ext}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return `Recording saved (${(blob.size / 1024).toFixed(0)} KB) — demo/voice track`;
}
