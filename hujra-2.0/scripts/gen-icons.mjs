// HUJRA 2.0 — icon generator (zero-dependency PNG writer).
// Dark gradient rounded sq + chai (tea) cup = brand. Generates 192 + 512.
// Run: node scripts/gen-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const t = Buffer.from(type, "ascii");
  const body = Buffer.concat([t, data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, c]);
}

function inRoundRect(x, y, x0, y0, x1, y1, r) {
  const nx = Math.max(x0 + r, Math.min(x1 - r, x));
  const ny = Math.max(y0 + r, Math.min(y1 - r, y));
  return Math.hypot(x - nx, y - ny) <= r;
}

/** 1 = inside the tea cup (lime), 0 = outside */
function inTeaCup(x, y, s) {
  const cx = s * 0.5;
  const cy = s * 0.52;
  const wr = s * 0.16; // cup half-width
  const top = cy - s * 0.13;
  const bottom = cy + s * 0.16;
  // body
  if (x >= cx - wr && x <= cx + wr && y >= top && y <= bottom) return 1;
  // handle
  const hx = cx + wr;
  const hdy = y - (cy + s * 0.03);
  if (hdy >= 0 && Math.hypot(x - (hx + s * 0.09), hdy) <= s * 0.09) return 1;
  // steam
  if (Math.abs(x - cx) <= s * 0.025 && y <= top - 0 && y >= top - s * 0.22)
    return 1;
  return 0;
}

function makePng(size) {
  const px = Buffer.alloc(size * size * 4);
  const R = size * 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let r = 0x07,
        g = 0x06,
        b = 0x0d,
        a = 255;

      if (!inRoundRect(x + 0.5, y + 0.5, 0, 0, size - 1, size - 1, R)) {
        a = 0;
        px[i] = r;
        px[i + 1] = g;
        px[i + 2] = b;
        px[i + 3] = a;
        continue;
      }

      // vertical gradient bg
      const t = y / size;
      r = Math.round(7 + 10 * t);
      g = Math.round(6 + 12 * t);
      b = Math.round(13 + 20 * t);

      // lime glow behind cup
      const gx = size * 0.5,
        gy = size * 0.5;
      const dg = Math.hypot(x - gx, y - gy) / (size * 0.55);
      if (dg < 1) {
        const glow = (1 - dg) * 0.22;
        r = Math.round(r + 160 * glow);
        g = Math.round(g + 230 * glow);
        b = Math.round(b + 60 * glow);
      }

      // tea cup
      if (inTeaCup(x, y, size)) {
        const cy = y / size;
        const shade = 1 - (cy - 0.36) * 1.2;
        r = Math.round(190 * shade);
        g = Math.round(230 * shade);
        b = Math.round(53 * shade);
      }

      px[i] = r;
      px[i + 1] = g;
      px[i + 2] = b;
      px[i + 3] = a;
    }
  }

  // ---- PNG encode ----
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter none
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  const png = Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return png;
}

for (const s of [192, 512]) {
  const png = makePng(s);
  const file = join(outDir, `icon-${s}.png`);
  writeFileSync(file, png);
  console.log(`wrote ${file} (${png.length} bytes)`);
}
console.log("done.");
