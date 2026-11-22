// Mencari ffmpeg: variabel FFMPEG, PATH, atau instalasi winget (Gyan.FFmpeg).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

module.exports = function ffmpegPath() {
  if (process.env.FFMPEG) return process.env.FFMPEG;
  try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); return 'ffmpeg'; } catch (e) { /* lanjut */ }
  const base = path.join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Packages');
  if (fs.existsSync(base)) {
    for (const d of fs.readdirSync(base).filter((x) => /FFmpeg/i.test(x))) {
      const stack = [path.join(base, d)];
      while (stack.length) {
        const cur = stack.pop();
        for (const f of fs.readdirSync(cur, { withFileTypes: true })) {
          const p = path.join(cur, f.name);
          if (f.isDirectory()) stack.push(p); else if (f.name.toLowerCase() === 'ffmpeg.exe') return p;
        }
      }
    }
  }
  console.error('ffmpeg tidak ditemukan. Pasang: winget install Gyan.FFmpeg');
  process.exit(1);
};
