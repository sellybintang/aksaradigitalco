/**
 * Penghubung Google Sheets ↔ website undangan.
 * Panduan lengkap: docs/panduan-google-sheets.md
 *
 * Sheet "Klien"  : baris 1 = nama kolom, 1 baris = 1 klien. Dibuat otomatis oleh siapkanSheet().
 * Sheet "Ucapan" : waktu | slug | nama | kehadiran | jumlah | ucapan  (diisi otomatis dari RSVP)
 *
 * Kolom yang namanya diawali "_" (mis. _no_pesanan, _kontak) TIDAK PERNAH dikirim ke website.
 * Pakai untuk catatan admin yang bersifat pribadi.
 */
const SHEET_KLIEN = 'Klien';
const SHEET_UCAPAN = 'Ucapan';
const MAX_UCAPAN = 150;

const KOLOM = [
  'slug', 'template', 'status', 'aktif_sampai',
  'pria_nama', 'pria_panggilan', 'pria_ortu', 'pria_foto', 'pria_ig',
  'wanita_nama', 'wanita_panggilan', 'wanita_ortu', 'wanita_foto', 'wanita_ig',
  'akad_judul', 'akad_mulai', 'akad_selesai', 'akad_tempat', 'akad_alamat', 'akad_maps',
  'resepsi_judul', 'resepsi_mulai', 'resepsi_selesai', 'resepsi_tempat', 'resepsi_alamat', 'resepsi_maps',
  'kutipan', 'kutipan_sumber', 'cerita', 'galeri', 'foto_sampul', 'foto_berdua', 'musik',
  'rekening', 'alamat_kado', 'kredit_foto', 'tanpa_foto', 'zona_waktu',
  '_no_pesanan', '_kontak', '_paket', '_catatan',
];
const KOLOM_TANGGAL = ['aktif_sampai', 'akad_mulai', 'akad_selesai', 'resepsi_mulai', 'resepsi_selesai'];

const CONTOH = {
  slug: 'raka-nadia', template: 'AD002', status: 'aktif', aktif_sampai: '2027-05-14',
  pria_nama: 'Raka Pradipta, S.T.', pria_panggilan: 'Raka', pria_ortu: 'Bapak Hendra Wijaya & Ibu Sari Lestari', pria_ig: 'raka.contoh',
  wanita_nama: 'Nadia Kirana, S.Ds.', wanita_panggilan: 'Nadia', wanita_ortu: 'Bapak Agus Santoso & Ibu Rina Melati', wanita_ig: 'nadia.contoh',
  akad_judul: 'Akad Nikah', akad_mulai: '2027-02-14 08:00', akad_selesai: '2027-02-14 10:00', akad_tempat: 'Masjid Al-Ikhlas', akad_alamat: 'Jl. Melati No. 10, Bandung',
  resepsi_judul: 'Resepsi', resepsi_mulai: '2027-02-14 11:00', resepsi_selesai: '2027-02-14 14:00', resepsi_tempat: 'Gedung Serbaguna Cendana', resepsi_alamat: 'Jl. Cendana Raya No. 25, Bandung',
  kutipan: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu merasa tenteram kepadanya.',
  kutipan_sumber: 'QS. Ar-Rum: 21',
  cerita: '2019|Pertemuan|Bertemu pertama kali saat penerbangan kami sama-sama tertunda.\n2025|Lamaran|Raka melamar Nadia di hadapan kedua keluarga.',
  rekening: 'BCA|1234567890|Raka Pradipta\nMandiri|0987654321|Nadia Kirana',
  alamat_kado: 'Jl. Melati No. 10, Bandung 40115',
  _no_pesanan: 'CONTOH-001', _paket: 'Premium', _catatan: 'Baris contoh — boleh dihapus',
};

/* ---------- jalankan sekali dari editor ---------- */

/** Membuat sheet Klien (kolom + 1 contoh) dan sheet Ucapan. Aman dijalankan ulang. */
function siapkanSheet() {
  const ss = SpreadsheetApp.getActive();
  ss.setSpreadsheetTimeZone('Asia/Jakarta');
  let sh = ss.getSheetByName(SHEET_KLIEN);
  if (!sh) sh = ss.insertSheet(SHEET_KLIEN);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, KOLOM.length).setValues([KOLOM]).setFontWeight('bold').setBackground('#f3ede3');
    sh.setFrozenRows(1);
    sh.setFrozenColumns(1);
    // kolom tanggal & slug sebagai teks biasa agar tidak diubah otomatis oleh Sheets
    KOLOM.forEach((k, i) => { if (KOLOM_TANGGAL.indexOf(k) >= 0 || k === 'slug') sh.getRange(2, i + 1, 999, 1).setNumberFormat('@'); });
    sh.getRange(2, 1, 1, KOLOM.length).setValues([KOLOM.map((k) => CONTOH[k] || '')]);
    sh.getRange(1, KOLOM.indexOf('_no_pesanan') + 1, 1, 4).setBackground('#fde2e2');
  }
  sheet_(SHEET_UCAPAN, ['waktu', 'slug', 'nama', 'kehadiran', 'jumlah', 'ucapan']).setFrozenRows(1);
  const awal = ss.getSheetByName('Sheet1') || ss.getSheetByName('Lembar1');
  if (awal && awal.getLastRow() === 0 && ss.getSheets().length > 2) ss.deleteSheet(awal);
  Logger.log('Sheet siap. Cek tab "Klien" dan "Ucapan".');
}

/**
 * Mengisi baris demo katalog per SKU (ad001, ad002, ...) + ucapan contoh dari repo GitHub.
 * Hanya MENAMBAH slug yang belum ada — baris demo yang sudah kamu ubah di Sheets tidak ditimpa.
 * Sumber: demo-data/sheet-demo.json (dibuat dengan node tools/sheet-demo.js).
 */
const SUMBER_DEMO = 'https://raw.githubusercontent.com/sellybintang/aksaradigitalco/main/demo-data/sheet-demo.json';
function imporDemo() {
  const src = JSON.parse(UrlFetchApp.fetch(SUMBER_DEMO).getContentText());
  const sh = sheet_(SHEET_KLIEN);
  let head = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map((h) => String(h).trim());
  // kolom yang belum ada di sheet → ditambahkan di ujung kanan
  const baru = [];
  src.rows.forEach((r) => Object.keys(r).forEach((k) => { if (head.indexOf(k) < 0 && baru.indexOf(k) < 0) baru.push(k); }));
  if (baru.length) { sh.getRange(1, head.length + 1, 1, baru.length).setValues([baru]).setFontWeight('bold'); head = head.concat(baru); }
  const iSlug = head.indexOf('slug');
  const ada = sh.getLastRow() > 1 ? sh.getRange(2, iSlug + 1, sh.getLastRow() - 1, 1).getDisplayValues().map((x) => String(x[0]).toLowerCase().trim()) : [];
  const tambah = src.rows.filter((r) => ada.indexOf(String(r.slug).toLowerCase()) < 0);
  if (tambah.length) {
    const rg = sh.getRange(sh.getLastRow() + 1, 1, tambah.length, head.length);
    rg.setNumberFormat('@');   // semua teks biasa: tanggal, nomor rekening, dll. tidak diubah otomatis
    rg.setValues(tambah.map((r) => head.map((h) => (r[h] == null ? '' : String(r[h])))));
  }
  // ucapan contoh: hanya untuk slug yang belum punya ucapan sama sekali
  const uc = sheet_(SHEET_UCAPAN, ['waktu', 'slug', 'nama', 'kehadiran', 'jumlah', 'ucapan']);
  const punya = uc.getLastRow() > 1 ? uc.getRange(2, 2, uc.getLastRow() - 1, 1).getValues().map((x) => String(x[0]).toLowerCase()) : [];
  const ucapan = src.wishes.filter((w) => punya.indexOf(w.slug) < 0).reverse()
    .map((w) => [new Date(), w.slug, w.nama, w.kehadiran, w.jumlah, w.ucapan]);
  if (ucapan.length) uc.getRange(uc.getLastRow() + 1, 1, ucapan.length, 6).setValues(ucapan);
  Logger.log('Demo: %s baris ditambahkan, %s sudah ada. Ucapan contoh: %s.', tambah.length, src.rows.length - tambah.length, ucapan.length);
}

/** Cek data yang akan diterima website untuk satu slug (lihat hasilnya di Log eksekusi). */
function tesKlien() {
  Logger.log(JSON.stringify(getKlien_('raka-nadia'), null, 2));
}

/* ---------- web app ---------- */

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'get') return json_(getKlien_(String(p.slug || '').toLowerCase().trim()));
  return json_({ ok: false, error: 'unknown_action' });
}

function doPost(e) {
  let body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json_({ ok: false, error: 'bad_json' }); }
  if (body.action !== 'rsvp') return json_({ ok: false, error: 'unknown_action' });

  const slug = String(body.slug || '').toLowerCase().trim();
  const klien = findKlien_(slug);
  if (!klien || isExpired_(klien) || klien.status === 'draft') return json_({ ok: false, error: 'notfound' });

  const clean = (s, n) => String(s || '').replace(/[\r\n]+/g, ' ').trim().slice(0, n);
  const nama = clean(body.nama, 60);
  if (!nama) return json_({ ok: false, error: 'nama_kosong' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet_(SHEET_UCAPAN, ['waktu', 'slug', 'nama', 'kehadiran', 'jumlah', 'ucapan'])
      .appendRow([new Date(), slug, nama, clean(body.kehadiran, 20), clean(body.jumlah, 3), clean(body.ucapan, 500)]);
  } finally { lock.releaseLock(); }
  return json_({ ok: true });
}

/* ---------- internal ---------- */
function getKlien_(slug) {
  const k = findKlien_(slug);
  if (!k || k.status === 'draft') return { ok: false, error: 'notfound' };
  if (isExpired_(k)) return { ok: false, error: 'expired' };
  // Hanya data milik slug ini yang dikirim, tanpa kolom "_" — data klien lain & catatan admin tidak terbuka.
  const data = {};
  Object.keys(k).forEach((key) => { if (key && key.charAt(0) !== '_') data[key] = k[key]; });
  return { ok: true, data: data, wishes: getUcapan_(slug) };
}

function findKlien_(slug) {
  if (!slug) return null;
  const range = sheet_(SHEET_KLIEN).getDataRange();
  const raw = range.getValues();
  const shown = range.getDisplayValues();
  const tz = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
  const head = shown[0].map((h) => String(h).trim());
  const iSlug = head.indexOf('slug');
  for (let r = 1; r < raw.length; r++) {
    if (String(shown[r][iSlug]).toLowerCase().trim() !== slug) continue;
    const o = {};
    head.forEach((h, i) => {
      if (!h) return;
      const v = raw[r][i];
      // Tanggal yang sudah diubah Sheets menjadi format tanggal → kembalikan ke pola 2027-02-14 08:00
      if (v instanceof Date) {
        const adaJam = v.getHours() || v.getMinutes();
        o[h] = Utilities.formatDate(v, tz, adaJam ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd');
      } else {
        o[h] = shown[r][i];
      }
    });
    o.status = String(o.status || 'aktif').toLowerCase().trim();
    return o;
  }
  return null;
}

function isExpired_(k) {
  if (!k.aktif_sampai) return false;
  const d = new Date(String(k.aktif_sampai).replace(' ', 'T'));
  return !isNaN(d) && Date.now() > d.getTime() + 86400000;
}

function getUcapan_(slug) {
  const sh = SpreadsheetApp.getActive().getSheetByName(SHEET_UCAPAN);
  if (!sh || sh.getLastRow() < 2) return [];
  const rows = sh.getRange(2, 1, sh.getLastRow() - 1, 6).getValues();
  const out = [];
  for (let i = rows.length - 1; i >= 0 && out.length < MAX_UCAPAN; i--) {
    const r = rows[i];
    if (String(r[1]).toLowerCase() === slug && r[5]) out.push({ nama: r[2], kehadiran: r[3], ucapan: r[5] });
  }
  return out; // jumlah tamu tidak dikirim ke publik
}

function sheet_(name, header) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); if (header) sh.appendRow(header); }
  return sh;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
