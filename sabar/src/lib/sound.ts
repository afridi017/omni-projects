let ctx: AudioContext | null = null;

export async function playTokenCallSound() {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (ctx.state === "suspended") await ctx.resume();
    const now = ctx.currentTime;

    const beep = (freq: number, start: number, dur: number, vol = 0.2) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(vol, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    };

    // Classic "token called" chime — three rising notes
    beep(660, now, 0.18);
    beep(880, now + 0.22, 0.18);
    beep(1320, now + 0.44, 0.4, 0.25);
  } catch {
    /* audio may be blocked, ignore */
  }
}

export async function playReadySound() {
  try {
    if (!ctx) {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (ctx.state === "suspended") await ctx.resume();
    const now = ctx.currentTime;
    const beep = (freq: number, start: number, dur: number, vol = 0.2) => {
      const osc = ctx!.createOscillator();
      const gain = ctx!.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(vol, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain).connect(ctx!.destination);
      osc.start(start);
      osc.stop(start + dur + 0.05);
    };
    // Happy "ready" jingle
    [523, 659, 784, 1047].forEach((f, i) => beep(f, now + i * 0.16, 0.22, 0.2));
  } catch {
    /* ignore */
  }
}
