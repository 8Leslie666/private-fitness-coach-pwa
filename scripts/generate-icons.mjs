import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

const outDir = join(process.cwd(), 'public', 'icons');
mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function drawIcon(size) {
  const radius = size * 0.22;
  const cx = size / 2;
  const cy = size / 2;
  const pixels = Buffer.alloc((size * 4 + 1) * size);

  const setPixel = (x, y, r, g, b, a = 255) => {
    const row = y * (size * 4 + 1);
    const idx = row + 1 + x * 4;
    pixels[idx] = r;
    pixels[idx + 1] = g;
    pixels[idx + 2] = b;
    pixels[idx + 3] = a;
  };

  for (let y = 0; y < size; y += 1) {
    pixels[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x += 1) {
      setPixel(x, y, 255, 255, 255, 255);
    }
  }

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = Math.abs(x - cx) - size * 0.28;
      const dy = Math.abs(y - cy) - size * 0.28;
      const outside = Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) > radius * 0.42;
      if (!outside) setPixel(x, y, 239, 246, 255, 255);
    }
  }

  const barColor = [37, 99, 235];
  const barY = Math.round(size * 0.48);
  const barH = Math.round(size * 0.08);
  const left = Math.round(size * 0.2);
  const right = Math.round(size * 0.8);
  for (let y = barY; y < barY + barH; y += 1) {
    for (let x = left; x < right; x += 1) setPixel(x, y, ...barColor);
  }

  const plateW = Math.round(size * 0.08);
  const plateH = Math.round(size * 0.24);
  for (const px of [Math.round(size * 0.24), Math.round(size * 0.68)]) {
    for (let y = Math.round(size * 0.4); y < Math.round(size * 0.4) + plateH; y += 1) {
      for (let x = px; x < px + plateW; x += 1) setPixel(x, y, 15, 23, 42, 255);
    }
  }

  const pngHeader = Buffer.from('\x89PNG\r\n\x1a\n', 'binary');
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    pngHeader,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(pixels)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const size of [192, 512]) {
  writeFileSync(join(outDir, `icon-${size}.png`), drawIcon(size));
}
