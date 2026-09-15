"use client";

import { uid } from "./utils";

const pick = <T>(arr: readonly T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

const HAI = [
  "",
  " yaar ",
  " bhai ",
  " dekho ",
  " suno ",
  " basically ",
  " obviously ",
];

const OPENERS: Array<[string, string]> = [
  ["tapay", "Yar kal wali tapay ki raat kya thi, abhi bhi yaad aati hai"],
  ["cricket", "Bhai, kal ka match dekh ke neend hi nahi aai"],
  ["cricket", "Pakistani bowling dekh ke to pata nahi kya haal ho jata hai"],
  ["gup", "2 baje tak chatting karne ka maza hi kuch aur hai"],
  ["food", "Peshawar ki seekh kabab chai ke saath — jannat ka nasha"],
  ["hujra", "Hujra culture to duniya ka best social system hai"],
  ["chai", "Ek tamam chai chaiye abhi, koi doge?"],
  ["gup", "Kis ko pata tha ki aaj ki gup itni aage jayegi"],
  ["cricket", "Shaheen ke over me to bara josh aata hai"],
  ["tapay", "Tapay to sirf local culture me milte hain, yar"],
];

const CLOSERS: Array<[string, string]> = [
  ["tapay", "tapay, tapay, tapay!"],
  ["baki", "baki to theek hai"],
  ["mazak", "mazak mazak me hi sahi"],
  ["mazak", "khair, yar"],
  ["waqt", "khuda hafiz phir milte hain"],
  ["hujra", "hujra to aise hi chalta rahe"],
  ["chai", "chai khatam, phir se banate hain"],
  ["gup", "aur haan, kal phir milte hain isi time"],
];

function speak(name: string, topic: string): string {
  const seg = pick(OPENERS);
  const topicBit =
    topic.toLowerCase().includes("cricket") && !seg[0].includes("cricket")
      ? ` Aur match ke baare me to socho, ${pick(CLOSERS)[1]}`
      : "";
  const outro = pick(CLOSERS);
  return name + pick(HAI) + seg[1] + " — " + outro[1] + topicBit;
}

function akhriPow(name: string): string {
  return pick([
    `Chalo ${name}, aaj ke liye itna kafi`,
    `${name} ne bara aala point kiya`,
    `Eik aur baat ${name}, kal plan pakka`,
    `Suno suno, ${name} ki baat suno`,
  ]);
}

interface CaptionCallback {
  id: string;
  text: string;
  speaker: string;
  t: number;
  seg: number;
}

/**
 * Urdu live-caption pipeline.
 * In a production build this is MediaRecorder → Web Speech (Urdu) via a
 * streaming speech service or on-device ASR. Here we synthesize honest,
 * category-typed gup lines as "captions" so the live-captions UI is real and
 * testable. Set ENGINE to "mock" explicitly; anything with a real engine can
 * swap `run(line, speaker)` for a real ASR hook later.
 */
export class UrduCaptionTicker {
  private timer: ReturnType<typeof setInterval> | null = null;
  private seg = 0;

  constructor(
    private opts: {
      onLine: (c: CaptionCallback) => void;
      speed?: number;
      enabled?: boolean;
    },
  ) {}

  start(topics: string[]) {
    if (this.timer) return;
    const run = () => {
      const speaker = "Afridi Bhai";
      const topic = topics[Math.floor(Math.random() * topics.length)] ?? "";
      const text =
        Math.random() < 0.7 ? speak(speaker, topic) : akhriPow(speaker);
      this.seg++;
      this.opts.onLine({
        id: uid("cap"),
        text,
        speaker,
        t: Date.now(),
        seg: this.seg,
      });
    };
    run();
    const interval = this.opts.speed ?? 4200;
    this.timer = setInterval(run, interval);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }
}

/** tiny helper for rendering Urdu-script text with proper alignment */
export function urduDir(): "rtl" {
  return "rtl";
}
