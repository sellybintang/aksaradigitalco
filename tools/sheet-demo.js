// Menyusun baris demo per SKU (ad001, ad002, ...) untuk Google Sheets dari data demo lokal.
// Hasil: demo-data/sheet-demo.json  →  diimpor ke Sheets lewat fungsi imporDemo() di Apps Script.
// Jalankan:  node tools/sheet-demo.js
// Setelah diimpor, data demo cukup diubah langsung di Sheets (foto, musik, nama, acara, ucapan contoh).
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const box = { window: {} };
require('vm').runInNewContext(fs.readFileSync(path.join(ROOT, 'config.js'), 'utf8'), box);
const SKU = box.window.UNDANGAN_CONFIG.sku || {};

const rows = [], wishes = [];
for (const [kode, folder] of Object.entries(SKU)) {
  const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'themes', folder, 'meta.json'), 'utf8'));
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, 'demo-data', meta.demo + '.json'), 'utf8'));
  const slug = kode.toLowerCase();
  const row = {};
  for (const [k, v] of Object.entries(d)) if (!k.startsWith('_') && typeof v !== 'object') row[k] = v;
  Object.assign(row, { slug, template: kode, status: 'aktif', aktif_sampai: '2099-12-31',
    _paket: 'DEMO', _catatan: `Demo katalog ${kode} · ${meta.nama} (link: /${slug})` });
  rows.push(row);
  for (const w of d._ucapan || []) wishes.push({ slug, nama: w.nama, kehadiran: w.kehadiran || '', jumlah: '', ucapan: w.ucapan });
  console.log(`${kode}  ${meta.nama.padEnd(16)}  /${slug}  musik: ${row.musik || '-'}`);
}
fs.writeFileSync(path.join(ROOT, 'demo-data', 'sheet-demo.json'), JSON.stringify({ rows, wishes }, null, 2) + '\n');
console.log(`✓ demo-data/sheet-demo.json: ${rows.length} baris demo, ${wishes.length} ucapan contoh`);
