# Panduan Memasang Google Sheets + Apps Script

Waktu: ±15 menit, cukup sekali. Setelah ini, setiap order baru cukup **tambah 1 baris** di Google Sheets.

---

## Langkah 1 — Buat Google Sheets

1. Buka **sheets.new** di browser (login dengan akun Google untuk usaha Anda).
2. Beri nama file, misalnya **Data Undangan**.

## Langkah 2 — Tempel Apps Script

1. Di Google Sheets: menu **Ekstensi → Apps Script**.
2. Hapus semua isi `Code.gs` yang ada, lalu **tempel seluruh isi** file `apps-script/Code.gs` dari proyek ini.
3. Klik ikon **Simpan** (💾).

## Langkah 3 — Siapkan sheet otomatis

1. Di bagian atas editor, pilih fungsi **`siapkanSheet`** pada daftar fungsi, lalu klik **▶ Jalankan**.
2. Muncul permintaan izin → **Tinjau izin** → pilih akun Anda.
3. Muncul peringatan *"Google hasn't verified this app"* → klik **Advanced / Lanjutan** →
   **Go to … (unsafe) / Buka … (tidak aman)** → **Allow / Izinkan**.
   Ini normal untuk skrip buatan sendiri; skrip ini hanya membaca & menulis di file Sheets Anda.
4. Kembali ke tab Google Sheets: sekarang ada tab **Klien** (lengkap dengan 1 baris contoh `raka-nadia`) dan tab **Ucapan**.

## Langkah 4 — Deploy sebagai Web App

1. Di editor Apps Script: **Terapkan (Deploy) → Deployment baru (New deployment)**.
2. Klik ikon ⚙ di samping "Pilih jenis" → **Aplikasi web (Web app)**.
3. Isi:
   - **Jalankan sebagai (Execute as):** Saya / Me
   - **Siapa yang memiliki akses (Who has access):** Siapa saja / **Anyone**
4. Klik **Terapkan** → salin **URL aplikasi web** (berakhiran `/exec`).

## Langkah 5 — Cek URL-nya

Buka di browser (ganti `URL_ANDA`):

```
URL_ANDA?action=get&slug=raka-nadia
```

Kalau benar, muncul teks yang diawali `{"ok":true,"data":{"slug":"raka-nadia", …`.

## Langkah 6 — Sambungkan ke website

Buka `config.js`, isi `apiUrl`:

```js
apiUrl: 'https://script.google.com/macros/s/XXXXXXXX/exec',
```

Lalu coba di komputer:

```
node tools/dev-server.js
```

Buka **http://localhost:5173/raka-nadia?to=Budi** → undangan tampil dengan data dari Google Sheets.
Coba kirim ucapan → muncul baris baru di tab **Ucapan**.

> Link demo (`/demo…`) tetap memakai data contoh lokal, jadi katalog tidak terganggu.

---

## Alur order sehari-hari

1. Pembeli bayar di Shopee → minta data lewat chat / form.
2. Di tab **Klien**, tambah 1 baris:
   - `slug` → alamat undangan, huruf kecil pakai tanda `-` (mis. `dimas-laras`)
   - `template` → nama folder tema (mis. `18-arabesque`)
   - `status` → isi **`draft`** dulu
   - `aktif_sampai` → tanggal berakhir sesuai paket (mis. `2027-05-14`)
   - isi kolom lainnya (lihat `docs/kolom-sheets.md`)
   - kolom berwarna merah (`_no_pesanan`, `_kontak`, `_paket`, `_catatan`) **hanya untuk Anda**, tidak pernah tampil di undangan
3. Cek: ubah `status` menjadi `aktif`, buka `domainanda.com/dimas-laras?to=Tes`.
4. Kirim link ke pembeli. Selesai — **tanpa upload ulang website**.

## Tips & hal penting

- **Tanggal:** tulis `2027-02-14 08:00`. Kalau Sheets terlanjur mengubahnya jadi format tanggal, tidak apa-apa — skrip sudah menanganinya.
- **Teks berbaris** (`cerita`, `rekening`): tekan **Alt+Enter** di dalam sel untuk baris baru.
- **Foto & musik:** boleh link share Google Drive (akses *Siapa saja yang memiliki link*), link gambar langsung (Cloudinary, dll.), atau alamat file di situs. Lihat `docs/kolom-sheets.md`.
- **Ucapan tidak pantas:** cukup hapus barisnya di tab **Ucapan**.
- **Mengubah kode Apps Script nanti:** setelah menyimpan, buka **Terapkan → Kelola deployment → ✏ Edit →
  Versi: Versi baru → Terapkan**. Tanpa ini, website tetap memakai kode lama. URL tidak berubah.
- **Undangan berakhir otomatis** setelah tanggal `aktif_sampai` — tamu melihat pesan "Undangan telah berakhir".
- **Fungsi `tesKlien`** di editor: jalankan untuk melihat data yang dikirim ke website (menu **Eksekusi / Log**).
