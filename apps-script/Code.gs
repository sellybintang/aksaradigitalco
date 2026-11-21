/**
 * Penghubung Google Sheets ↔ website undangan.
 * Pasang: buka Google Sheets → Ekstensi → Apps Script → tempel file ini →
 * Deploy → New deployment → Web app → Execute as: Me, Who has access: Anyone →
 * salin URL-nya ke config.js (apiUrl).
 *
 * Sheet "Klien"  : baris 1 = nama kolom (lihat docs/kolom-sheets.md), 1 baris = 1 klien.
 * Sheet "Ucapan" : kolom waktu | slug | nama | kehadiran | jumlah | ucapan  (diisi otomatis)
 *
 * Penting: format kolom tanggal (aktif_sampai, *_mulai, *_selesai) sebagai "Teks biasa"
 * dan isi dengan pola 2027-02-14 08:00 agar terbaca benar.
 */
const SHEET_KLIEN = 'Klien';
const SHEET_UCAPAN = 'Ucapan';
const MAX_UCAPAN = 150;

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
  // Hanya data milik slug ini yang dikirim — data klien lain tidak ikut terbuka.
  const data = {};
  Object.keys(k).forEach((key) => { if (key && key.charAt(0) !== '_') data[key] = k[key]; });
  return { ok: true, data: data, wishes: getUcapan_(slug) };
}

function findKlien_(slug) {
  if (!slug) return null;
  const values = sheet_(SHEET_KLIEN).getDataRange().getDisplayValues();
  const head = values[0].map((h) => String(h).trim());
  const iSlug = head.indexOf('slug');
  for (let r = 1; r < values.length; r++) {
    if (String(values[r][iSlug]).toLowerCase().trim() === slug) {
      const o = {};
      head.forEach((h, i) => { if (h) o[h] = values[r][i]; });
      o.status = String(o.status || 'aktif').toLowerCase().trim();
      return o;
    }
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
