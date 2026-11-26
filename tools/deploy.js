// Deploy situs ke Cloudflare Pages lewat Wrangler (upload langsung, tanpa GitHub).
// Jalankan:  node tools/deploy.js            (siapkan .dist/ lalu upload)
//            node tools/deploy.js --cek      (hanya siapkan .dist/, tanpa upload)
// Sekali di awal: npx wrangler login  (login akun Cloudflare di browser)
// Catatan: foto demo di demo-data/img-private/ IKUT terunggah (tidak ikut git, tapi tampil di demo online).
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
console.log(`✓ .dist siap: ${n} file, ${(bytes / 1048576).toFixed(1)} MB`);
if (n > 20000) { console.error('Terlalu banyak file untuk Cloudflare Pages (maks. 20.000).'); process.exit(1); }

if (process.argv.includes('--cek')) process.exit(0);
execSync(`npx --yes wrangler@4 pages deploy "${DIST}" --project-name ${PROJECT} --branch main --commit-dirty=true`, { stdio: 'inherit', cwd: ROOT });
