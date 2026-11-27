// Merekam video pembuka undangan (MP4 vertikal 1080x1920) untuk video produk Shopee / Reels / TikTok.
// Alur: sampul -> ketuk "Buka Undangan" -> animasi pembuka -> isi undangan digulir per bagian.
// Jalankan:  node tools/render-video.js                  (semua tema di config.js -> katalog.koleksi)
//            node tools/render-video.js 19-nusantara     (satu tema)
// Hasil:     output/video/<tema>.mp4
// Butuh: Chrome/Edge + ffmpeg (winget install Gyan.FFmpeg).
const { spawn, execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 5198;
const DEBUG_PORT = 9334;
const VIEW = { w: 360, h: 640, scale: 3 };      // -> 1080x1920
const SECTIONS = ['hero', 'couple', 'countdown', 'events', 'maps', 'gallery', 'story', 'rsvp', 'gift', 'wishes'];

const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
];
const browserPath = process.env.BROWSER || BROWSERS.find((p) => fs.existsSync(p));
if (!browserPath) { console.error('Chrome/Edge tidak ditemukan.'); process.exit(1); }

function findFfmpeg() {
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
  return null;
}
const ffmpeg = findFfmpeg();
if (!ffmpeg) { console.error('ffmpeg tidak ditemukan. Pasang: winget install Gyan.FFmpeg'); process.exit(1); }

const box = { window: {} };
require('vm').runInNewContext(fs.readFileSync(path.join(ROOT, 'config.js'), 'utf8'), box);
const koleksi = ((box.window.UNDANGAN_CONFIG || {}).katalog || {}).koleksi || [];
const themes = process.argv[2] ? [process.argv[2]] : koleksi;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdpConnect() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) {
        const ws = new WebSocket(page.webSocketDebuggerUrl);
        await new Promise((ok, fail) => { ws.onopen = ok; ws.onerror = fail; });
        let id = 0; const waiting = new Map(); const handlers = {};
        ws.onmessage = (ev) => {
          const m = JSON.parse(ev.data);
          if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); }
          else if (m.method && handlers[m.method]) handlers[m.method](m.params);
        };
        const send = (method, params = {}) => new Promise((ok, fail) => {
          const n = ++id; waiting.set(n, (m) => (m.error ? fail(new Error(m.error.message)) : ok(m.result)));
          ws.send(JSON.stringify({ id: n, method, params }));
        });
        return { send, on: (ev, fn) => (handlers[ev] = fn), close: () => ws.close() };
      }
    } catch (e) { /* belum siap */ }
    await sleep(200);
  }
  throw new Error('Tidak bisa terhubung ke browser');
}

const evalJs = (cdp, expression) => cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }).then((r) => r.result && r.result.value);

// gulir halus ke elemen (easing), dijalankan di halaman
const SCROLL_FN = `window.__scrollTo = (sel, ms) => new Promise((done) => {
  const el = document.querySelector(sel); if (!el) return done(false);
  const start = scrollY, end = Math.max(0, el.getBoundingClientRect().top + scrollY - 40), t0 = performance.now();
  const ease = (t) => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
  const step = (now) => { const t = Math.min(1, (now - t0) / ms); scrollTo(0, start + (end - start) * ease(t)); t < 1 ? requestAnimationFrame(step) : done(true); };
  requestAnimationFrame(step);
});`;

async function record(cdp, theme, outFile) {
  const [id, varian] = theme.split('~');
  const meta = Object.assign(JSON.parse(fs.readFileSync(path.join(ROOT, 'themes', id, 'meta.json'), 'utf8')),
    varian ? JSON.parse(fs.readFileSync(path.join(ROOT, 'themes', id, `meta.${varian}.json`), 'utf8')) : {});
  const frameDir = fs.mkdtempSync(path.join(os.tmpdir(), 'undangan-frames-'));
  const frames = [];
  cdp.on('Page.screencastFrame', async (p) => {
    const file = path.join(frameDir, `f${String(frames.length).padStart(5, '0')}.jpg`);
    fs.writeFileSync(file, Buffer.from(p.data, 'base64'));
    frames.push({ file, t: p.metadata.timestamp });
    cdp.send('Page.screencastFrameAck', { sessionId: p.sessionId }).catch(() => {});
  });

  // rekam=1: tampilan gulir utuh (video menggulir halaman), bukan mode slide
  await cdp.send('Page.navigate', { url: `http://localhost:${PORT}/${meta.demo}?theme=${id}&rekam=1&to=${encodeURIComponent('Budi Santoso')}` });
  // tunggu halaman & gambar siap
  for (let i = 0; i < 60; i++) {
    await sleep(300);
    const ok = await evalJs(cdp, `!!document.querySelector('[data-open]') && [...document.images].every(i => i.complete)`).catch(() => false);
    if (ok) break;
  }
  await evalJs(cdp, SCROLL_FN);
  await sleep(1200);

  // ulang semua animasi CSS dari awal tepat saat perekaman dimulai (animasi pembuka sampul ikut terekam)
  await evalJs(cdp, `document.getAnimations().forEach((a) => { a.currentTime = 0; a.play(); }), true`);
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: VIEW.w * VIEW.scale, maxHeight: VIEW.h * VIEW.scale, everyNthFrame: 1 });
  await sleep((meta.video && meta.video.sampul) || 3000);              // sampul (bisa diatur per tema di meta.json -> video.sampul)
  await evalJs(cdp, `document.querySelector('[data-open]').click(), true`);
  await sleep(3200);                                                    // animasi pembuka
  // urutan mengikuti posisi bagian di halaman (tiap tema bisa menyusun bagian berbeda)
  const urut = await evalJs(cdp, `JSON.stringify([...document.querySelectorAll('[data-shot]')].map((e) => e.dataset.shot).filter((s, i, a) => ${JSON.stringify(SECTIONS)}.includes(s) && a.indexOf(s) === i))`);
  for (const s of JSON.parse(urut || '[]')) {
    // hanya gulir ke bawah (lewati bagian yang sudah terlewat / ada di atas)
    const moved = await evalJs(cdp, `(() => { const el = document.querySelector('[data-shot="${s}"]'); return el && el.getBoundingClientRect().top > 60 ? window.__scrollTo('[data-shot="${s}"]', 1100) : false; })()`);
    if (moved) await sleep(1500);
  }
  await sleep(800);
  await cdp.send('Page.stopScreencast');
  await sleep(300);

  if (frames.length < 10) throw new Error(`frame terlalu sedikit (${frames.length})`);
  // susun daftar frame dengan durasi asli -> video 30fps konstan
  const list = frames.map((f, i) => {
    const dur = i < frames.length - 1 ? Math.max(0.001, frames[i + 1].t - f.t) : 0.8;
    return `file '${f.file.replace(/\\/g, '/')}'\nduration ${dur.toFixed(4)}`;
  }).join('\n') + `\nfile '${frames[frames.length - 1].file.replace(/\\/g, '/')}'\n`;
  const listFile = path.join(frameDir, 'list.txt');
  fs.writeFileSync(listFile, list);
  const dur = frames[frames.length - 1].t - frames[0].t + 0.8;
  // musik latar: pakai musik demo tema (file lokal) bila ada, atau MUSIK=path
  const demo = JSON.parse(fs.readFileSync(path.join(ROOT, 'demo-data', meta.demo + '.json'), 'utf8'));
  const musicFile = process.env.MUSIK || (demo.musik && demo.musik.startsWith('/') ? path.join(ROOT, demo.musik) : '');
  const audio = musicFile && fs.existsSync(musicFile)
    ? ['-stream_loop', '-1', '-i', musicFile, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '160k',
       '-af', `afade=t=in:d=1.2,afade=t=out:st=${Math.max(0, dur - 2.5).toFixed(2)}:d=2.5`, '-shortest']
    : [];
  execFileSync(ffmpeg, ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', listFile, ...audio,
    '-vf', `scale=${VIEW.w * VIEW.scale}:${VIEW.h * VIEW.scale}:force_original_aspect_ratio=decrease,pad=${VIEW.w * VIEW.scale}:${VIEW.h * VIEW.scale}:(ow-iw)/2:(oh-ih)/2,fps=30,format=yuv420p`,
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-movflags', '+faststart', outFile]);
  fs.rmSync(frameDir, { recursive: true, force: true });
  return { frames: frames.length, seconds: dur.toFixed(1), mb: (fs.statSync(outFile).size / 1048576).toFixed(1), musik: audio.length ? path.basename(musicFile) : 'tanpa musik' };
}

(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, 'dev-server.js')], { env: { ...process.env, PORT }, stdio: 'ignore' });
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'undangan-video-'));
  const chrome = spawn(browserPath, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--mute-audio', '--autoplay-policy=no-user-gesture-required',
    `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${profile}`, `--window-size=${VIEW.w},${VIEW.h}`, 'about:blank',
  ], { stdio: 'ignore' });
  try {
    await sleep(700);
    const cdp = await cdpConnect();
    await cdp.send('Page.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: VIEW.w, height: VIEW.h, deviceScaleFactor: VIEW.scale, mobile: true });
    const outDir = path.join(ROOT, 'output', 'video');
    fs.mkdirSync(outDir, { recursive: true });
    for (const theme of themes) {
      const out = path.join(outDir, `${theme.replace('~', '-')}.mp4`);
      const info = await record(cdp, theme, out);
      console.log(`✓ ${path.relative(ROOT, out)}  (${info.seconds} dtk, ${info.frames} frame, ${info.mb} MB, ${info.musik})`);
    }
    cdp.close();
  } finally {
    chrome.kill(); server.kill();
    await sleep(500);
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
