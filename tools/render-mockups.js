// Membuat gambar katalog Shopee (PNG 1080×1080), memakai Chrome/Edge yang sudah terpasang.
// Jalankan:  node tools/render-mockups.js                  (semua tema + foto gabungan)
//            node tools/render-mockups.js 03-analog-story   (satu tema)
//            node tools/render-mockups.js pilihan           (hanya tema di config.js → katalog.koleksi)
//            node tools/render-mockups.js koleksi           (hanya foto gabungan / bundel)
// Hasil:     output/katalog/<tema>/<nomor>-<layout>.png  dan  output/katalog/_koleksi/<nomor>-<layout>.png
// Cara kerja: Chrome headless dikendalikan lewat DevTools Protocol, menunggu semua foto
// selesai dimuat (tanda data-ready di halaman mockup), baru memotret.
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = 5199;
const DEBUG_PORT = 9333;
const LAYOUTS = ['utama', 'nama-tamu', 'fitur', 'tampilan', 'cara-order'];
const KOLEKSI = ['koleksi-kipas', 'koleksi-grid', 'koleksi-deret'];
const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
];
const browserPath = process.env.BROWSER || BROWSERS.find((p) => fs.existsSync(p));
if (!browserPath) { console.error('Chrome/Edge tidak ditemukan. Set variabel BROWSER ke path browser.'); process.exit(1); }

// baca config.js (file untuk browser) agar daftar koleksi sama dengan yang dipakai halaman mockup
const cfgBox = { window: {} };
require('vm').runInNewContext(fs.readFileSync(path.join(ROOT, 'config.js'), 'utf8'), cfgBox);
const pilihan = ((cfgBox.window.UNDANGAN_CONFIG || {}).katalog || {}).koleksi || [];
const semua = fs.readdirSync(path.join(ROOT, 'themes')).filter((t) => fs.existsSync(path.join(ROOT, 'themes', t, 'meta.json')));

const arg = process.argv[2];
const jobs = [];
const temaJobs = (list) => list.forEach((t) => LAYOUTS.forEach((l, i) => jobs.push({ dir: t, file: `${i + 1}-${l}.png`, url: `theme=${t}&layout=${l}` })));
const koleksiJobs = () => KOLEKSI.forEach((l, i) => jobs.push({ dir: '_koleksi', file: `${i + 1}-${l.replace('koleksi-', '')}.png`, url: `layout=${l}` }));
if (!arg) { temaJobs(semua); koleksiJobs(); }
else if (arg === 'koleksi') koleksiJobs();
else if (arg === 'pilihan') { temaJobs(pilihan); koleksiJobs(); }
else temaJobs([arg]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function cdpConnect() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) {
        const ws = new WebSocket(page.webSocketDebuggerUrl);
        await new Promise((ok, fail) => { ws.onopen = ok; ws.onerror = fail; });
        let id = 0; const waiting = new Map();
        ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); } };
        const send = (method, params = {}) => new Promise((ok, fail) => {
          const n = ++id; waiting.set(n, (m) => (m.error ? fail(new Error(m.error.message)) : ok(m.result)));
          ws.send(JSON.stringify({ id: n, method, params }));
        });
        return { send, close: () => ws.close() };
      }
    } catch (e) { /* browser belum siap */ }
    await sleep(200);
  }
  throw new Error('Tidak bisa terhubung ke browser');
}

(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, 'dev-server.js')], { env: { ...process.env, PORT }, stdio: 'ignore' });
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'undangan-render-'));
  const chrome = spawn(browserPath, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--mute-audio',
    `--remote-debugging-port=${DEBUG_PORT}`, `--user-data-dir=${profile}`, '--window-size=1080,1080', 'about:blank',
  ], { stdio: 'ignore' });

  try {
    await sleep(600);
    const cdp = await cdpConnect();
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1080, deviceScaleFactor: 1, mobile: false });
    for (const job of jobs) {
      const outDir = path.join(ROOT, 'output', 'katalog', job.dir);
      fs.mkdirSync(outDir, { recursive: true });
      await cdp.send('Page.navigate', { url: `http://localhost:${PORT}/tools/mockup.html?${job.url}` });
      const t0 = Date.now();
      let ready = false;
      while (!ready && Date.now() - t0 < 60000) {
        await sleep(300);
        const r = await cdp.send('Runtime.evaluate', { expression: 'document.body && document.body.dataset.ready === "1"', returnByValue: true }).catch(() => null);
        ready = !!(r && r.result && r.result.value);
      }
      const shot = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1080, height: 1080, scale: 1 } });
      const file = path.join(outDir, job.file);
      fs.writeFileSync(file, Buffer.from(shot.data, 'base64'));
      console.log(ready ? '✓' : '⚠ (waktu habis, cek hasilnya)', path.relative(ROOT, file));
    }
    cdp.close();
  } finally {
    chrome.kill();
    server.kill();
    await sleep(500);
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 });
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
