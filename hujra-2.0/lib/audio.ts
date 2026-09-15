"use client";

/**
 * Audio transport.
 *
 * Two layers:
 * 1. REAL: LiveKit (livekit-client) with an ephemeral token endpoint
 *    `/api/livekit`, powered by LIVEKIT_API_KEY/SECRET + NEXT_PUBLIC_LIVEKIT_URL.
 *    Actual WebRTC mic → remote room audio.
 * 2. SIM: in-demo rooms there is no transport, so the "mic" is a synthetic
 *    audio graph that reacts to captions (energy rises while someone talks).
 *    The sim ALSO renders the mic state machine (unmute/mute) perfectly, so
 *    the whole speaker/listener UX can be demoed offline.
 */

export type AudioEngineState = {
  sim: boolean;
  connected: boolean;
  error?: string;
};

export interface AudioEngine {
  state(): AudioEngineState;
  join(roomId: string): Promise<void>;
  leave(): Promise<void>;
  setMic(enabled: boolean): Promise<void>;
  micEnabled(): boolean;
  /** briefly raise local "energy" — used by sim mode, live voiced by WebRTC */
  poke(): void;
}

class SimEngine implements AudioEngine {
  private mic = false;
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private noiseInterval: ReturnType<typeof setInterval> | null = null;
  private energyTtl = 0;

  async join(_roomId: string) {
    // Prepare an AudioContext lazily (needs a user gesture, which join is).
    if (typeof window !== "undefined") {
      try {
        this.ctx = new AudioContext();
        await this.ctx.resume();
      } catch {
        this.ctx = null;
      }
    }
  }

  async leave() {
    this.setMic(false);
    this.stopNoise();
    await this.ctx?.close().catch(() => undefined);
    this.ctx = null;
  }

  async setMic(enabled: boolean) {
    this.mic = enabled;
    if (!enabled) {
      this.stopNoise();
      return;
    }
    // light ambient "room tone" so the mic meter feels alive
    this.startNoise();
  }

  micEnabled() {
    return this.mic;
  }

  poke() {
    this.energyTtl = 1600;
  }

  state(): AudioEngineState {
    return { sim: true, connected: true };
  }

  private startNoise() {
    this.stopNoise();
    if (!this.ctx) return;
    this.osc = this.ctx.createOscillator();
    this.osc.type = "sine";
    this.osc.frequency.value = 0;
    this.gain = this.ctx.createGain();
    this.gain.gain.value = 0;
    this.osc.connect(this.gain).connect(this.ctx.destination);
    this.osc.start();
    this.noiseInterval = setInterval(() => {
      if (!this.ctx || !this.gain || !this.osc) return;
      const t = this.ctx.currentTime;
      this.osc.frequency.setValueAtTime(110 + Math.random() * 90, t);
      this.gain.gain.setValueAtTime(this.energyTtl > 0 ? 0.05 : 0.02, t);
      this.energyTtl = Math.max(0, this.energyTtl - 120);
    }, 120);
  }

  private stopNoise() {
    if (this.noiseInterval) clearInterval(this.noiseInterval);
    this.noiseInterval = null;
    try {
      this.osc?.stop();
    } catch {
      /* already stopped */
    }
    this.osc = null;
    this.gain = null;
  }
}

class LivekitEngine implements AudioEngine {
  private Room: any = null;
  private room: any = null;
  private mic = false;
  private error?: string;
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private raf: number | null = null;
  private muted = false;

  async join(roomId: string) {
    if (!this.Room) {
      const lk = await import("livekit-client");
      this.Room = lk.Room;
    }
    const room = new this.Room();
    this.room = room;

    const res = await fetch(`/api/livekit?room=${encodeURIComponent(roomId)}`);
    const data = await res.json();
    if (!data.token)
      throw new Error(data.error || "LiveKit token kayam nahi hui");

    await room.connect(process.env.NEXT_PUBLIC_LIVEKIT_URL!, data.token, {
      autoSubscribe: true,
    });
    this.connected = true;
    this.setupMeter();
  }

  connected = false;

  async leave() {
    await this.room?.disconnect();
    this.room = null;
    this.connected = false;
    cancelAnimationFrame(this.raf ?? 0);
  }

  async setMic(enabled: boolean) {
    this.mic = enabled;
    const room = this.room;
    if (!room) return;
    const pub =
      Array.from(room.localParticipant.audioTrackPublications)[0] ?? null;
    if (enabled && !pub) {
      await room.localParticipant.setMicrophoneEnabled(true);
    } else if (!enabled && pub) {
      await room.localParticipant.setMicrophoneEnabled(false);
    }
  }

  micEnabled() {
    return this.mic;
  }

  poke() {
    /* real WebRTC energy comes from the analyser — nothing to poke */
  }

  state(): AudioEngineState {
    if (this.error) return { sim: false, connected: false, error: this.error };
    return { sim: false, connected: this.connected };
  }

  private setupMeter() {
    try {
      this.ctx = new AudioContext();
    } catch {
      return;
    }
    const src = this.room?.localParticipant?.audioTrackPublication?.track;
    if (!src || !src.mediaStream) return;
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    src.mediaStream.getAudioTracks().forEach((track: MediaStreamTrack) => {
      // route the track into the analyser pipeline
      const stream = new MediaStream([track]);
      this.ctx?.createMediaStreamSource(stream)?.connect(this.analyser!);
    });
  }
}

export function createAudioEngine(): AudioEngine {
  const useLivekit =
    typeof window !== "undefined" &&
    !!process.env.NEXT_PUBLIC_LIVEKIT_URL &&
    !!process.env.NEXT_PUBLIC_LIVEKIT_API_KEY;
  return useLivekit ? new LivekitEngine() : new SimEngine();
}

/** Turn an analyser (or fake energy) into a 0..1 "loudness" value. */
export function loudness(
  analyser: AnalyserNode | null,
  data: Uint8Array<ArrayBuffer> | null,
): number {
  if (!analyser || !data) return 0;
  analyser.getByteFrequencyData(data);
  let sum = 0;
  for (let i = 0; i < data.length; i++) sum += data[i];
  const avg = sum / data.length;
  return Math.min(1, avg / 128);
}
