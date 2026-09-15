// Generates PWA PNG icons without external deps.
// Dark rounded square + orange→red fire badge + white lightning bolt (SABAR brand).
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

/** True if point (x,y) inside rounded rect [x0,x1]x[y0,y1] with corner radius r */
function inRoundRect(x, y, x0, y0, x1, y1, r) {
  const nx = Math.max(x0 + r, Math.min(x1 - r, x));
  const ny = Math.max(y0 + r, Math.min(y1 - r, y));
  return Math.hypot(x - nx, y - ny) <= r;
}

function makePng(size) {
  const px = Buffer.alloc(size * size * 4);
  const R = size * 0.24; // outer corner radius

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      let r = 0x0b,
        g = 0x0b,
        b = 0x12,
        a = 255;

      // outer shape: rounded square (transparent corners)
      if (!inRoundRect(x + 0.5, y + 0.5, 0, 0, size - 1, size - 1, R)) {
        a = 0;
        px[i] = r;
        px[i + 1] = g;
        px[i + 2] = b;
        px[i + 3] = a;
        continue;
      }

      // subtle vertical gradient on background
      const t = y / size;
      r = Math.round(11 + 6 * t);
      g = Math.round(11 + 6 * t);
      b = Math.round(18 + 10 * t);

      // fire badge: centered rounded square (orange → red gradient)
      const nb = size * 0.3;
      const b0 = size * 0.2;
      const b1 = size * 0.8;
      if (inRoundRect(x + 0.5, y + 0.5, b0, b0, b1, b1, nb)) {
        const bx = (x - b0) / (b1 - b0);
        r = Math.round(255 - 100 * bx);
        g = Math.round(107 - 34 * bx);
        b = 0;
      }

      // white lightning bolt (two diagonal strokes through center)
      const cx = size / 2;
      const cy = size / 2;
      const d1 = Math.abs((x - cx) * 0.55 + (y - cy)) < size * 0.035;
      const d2 = Math.abs((x - cx) * 0.55 - (y - cy)) < size * 0.035;
      if (d1 || d2) {
        r = g = b = 255;
      }

      px[i] = r;
      px[i + 1] = g;
      px[i + 2] = b;
      px[i + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    px.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const size of [192, 512]) {
  const png = makePng(size);
  writeFileSync(join(outDir, `icon-${size}.png`), png);
  console.log(`✓ public/icons/icon-${size}.png (${png.length} bytes)`);
}
writeFileSync(join(outDir, "apple-touch-icon.png"), makePng(180));
console.log("✓ public/icons/apple-touch-icon.png");
