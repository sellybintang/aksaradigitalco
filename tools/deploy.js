// Menyiapkan folder publik .dist/ (dipakai GitHub Pages / Netlify saat build) dan opsional deploy ke Cloudflare Pages lewat Wrangler.
// Jalankan:  node tools/deploy.js            (siapkan .dist/ lalu upload)
//            node tools/deploy.js --cek      (hanya siapkan .dist/, tanpa upload; perintah build Netlify)
// Sekali di awal: npx wrangler login  (login akun Cloudflare di browser)
// Catatan: foto demo di demo-data/img-private/ ikut repo & ikut terunggah (tampil di demo online).
//            node tools/deploy.js --cek --base aksaradigitalco   (situs di subfolder, untuk GitHub Pages)
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, '.dist');
const PROJECT = process.env.CF_PROJECT || 'aksaradigitalco';
const IKUT = ['index.html', 'config.js', 'core', 'themes', 'assets', 'demo-data'];
// folder sumber/olahan yang tidak perlu dipublikasi
const LEWATI = (rel) => /(^|\/)src(\/|$)/.test(rel) || /(^|\/)(Thumbs\.db|\.DS_Store)$/.test(rel) || /\.(psd|ai|wav)$/i.test(rel);

fs.rmSync(DIST, { recursive: true, force: true });
let n = 0, bytes = 0;
const salin = (rel) => {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src) || LEWATI(rel.replace(/\\/g, '/'))) return;
  const st = fs.statSync(src);
  if (st.isDirectory()) { for (const f of fs.readdirSync(src)) salin(path.join(rel, f)); return; }
  if (st.size > 25 * 1024 * 1024) { console.warn('dilewati (>25 MB, batas Cloudflare):', rel); return; }
  fs.mkdirSync(path.dirname(path.join(DIST, rel)), { recursive: true });
  fs.copyFileSync(src, path.join(DIST, rel)); n++; bytes += st.size;
};
IKUT.forEach(salin);

// --base /nama-repo : situs di subfolder (GitHub Pages proyek). Semua alamat absolut (/assets/, /themes/, ...)
// di file teks diberi awalan subfolder, config.base diisi untuk mesin, dan 404.html = index.html (alamat /<slug>).
const iBase = process.argv.indexOf('--base');
const BASE = iBase > 0 ? '/' + String(process.argv[iBase + 1] || '').replace(/^\/+|\/+$/g, '') : '';
if (BASE && BASE !== '/') {
  const RX = /(["'`(\s=,])\/(assets|demo-data|themes|core|config\.js)(?=[\/'"`)\s?#]|$)/g;
  let ubah = 0;
  const rebase = (dir) => {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) { rebase(p); continue; }
      if (!/\.(html|js|css|json)$/i.test(f.name)) continue;
      const s = fs.readFileSync(p, 'utf8'), t = s.replace(RX, `$1${BASE}/$2`);
      if (t !== s) { fs.writeFileSync(p, t); ubah++; }
    }
  };
  rebase(DIST);
  fs.appendFileSync(path.join(DIST, 'config.js'), `\nwindow.UNDANGAN_CONFIG.base = '${BASE}';\n`);
  fs.copyFileSync(path.join(DIST, 'index.html'), path.join(DIST, '404.html'));
  fs.writeFileSync(path.join(DIST, '.nojekyll'), '');
  console.log(`✓ base ${BASE}: ${ubah} file disesuaikan, 404.html dibuat`);
}
console.log(`✓ .dist siap: ${n} file, ${(bytes / 1048576).toFixed(1)} MB`);
if (n > 20000) { console.error('Terlalu banyak file untuk Cloudflare Pages (maks. 20.000).'); process.exit(1); }

if (process.argv.includes('--cek')) process.exit(0);
execSync(`npx --yes wrangler@4 pages deploy "${DIST}" --project-name ${PROJECT} --branch main --commit-dirty=true`, { stdio: 'inherit', cwd: ROOT });
