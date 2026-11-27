/* Tema 24 — Danau Kembang Api · Danau, Angsa, Lampu Taman & Kolibri
 * Dibangun dari mesin Lembah Wisteria. Sampul 2.5D berlapis: kamera menyapu danau (angsa, jembatan, landmark kota)
 * lalu mundur -> lampu taman & kembang api (berkelip) -> rumbai & kanopi bunga (berayun) -> (teks nama)
 * -> dua kolibri (melayang) -> rumpun mawar & peony depan. Opening: tirai belah lukisan danau.
 */
(function () {
  const NOTE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3z"/></svg>';
  const pad = (n) => String(n).padStart(2, '0');
  let uid = 0;

  /* ---------- ornamen SVG ---------- */
  // sulur emas simetris
  const scroll = (side) => `<path d="M0 20 C 20 20, 26 6, 44 8 C 58 10, 58 26, 46 28 C 38 29, 36 20, 42 18 M44 8 C 62 4, 74 14, 92 14 C 104 14, 112 8, 120 8" transform="${side === 'r' ? 'translate(260 0) scale(-1 1)' : ''}"/>`;
  const ornament = (cls) => `<div class="lw-dew ${cls || ''}" aria-hidden="true"><i class="lw-dew__dot"></i><svg viewBox="0 0 20 28">
    <path d="M10 2 C10 2 3 11.5 3 17.5 A7 7 0 0 0 17 17.5 C17 11.5 10 2 10 2 Z" class="lw-dew__drop"/>
    <path d="M7 16.5 A3.4 3.4 0 0 0 9.4 21" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".75"/></svg><i class="lw-dew__dot"></i></div>`;

  // sudut filigri emas
  const corner = `<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
    <path d="M4 60 V22 Q4 4 22 4 H60"/><path d="M10 54 V26 Q10 10 26 10 H54" stroke-width=".9"/>
    <path d="M16 46 C 16 30, 22 22, 34 20 C 42 19, 44 28, 37 29 C 32 30, 31 24, 35 24"/>
    <path d="M46 16 C 30 16, 22 22, 20 34 C 19 42, 28 44, 29 37 C 30 32, 24 31, 24 35"/></g>
    <circle cx="4" cy="4" r="3.4" class="nu-fill"/><circle cx="22" cy="22" r="2.4" class="nu-fill"/></svg>`;
  const corners = ['tl', 'tr', 'bl', 'br'].map((p) => `<i class="nu-k nu-k--${p}">${corner}</i>`).join('');

  // aset: ilustrasi keraton (karya pemilik toko) + gunungan (CC0, lihat assets/nusantara/SUMBER.md)
  const ASSET = '/assets/nusantara/';
  const ROSE = '/assets/danau-kembang-api/kolibri-mini.webp';
  const gunungan = (cls) => `<img class="nu-kayon ti-rose ${cls || ''}" src="${ROSE}" alt="" aria-hidden="true">`;

  // ilustrasi keraton 2.5D: lapisan terpisah (PNG transparan, kanvas sama) yang ditumpuk dari belakang ke depan.
  // --d = kedalaman untuk efek parallax (0 = diam, makin besar makin dekat ke layar)
  const LAYER = '/assets/danau-kembang-api/';
  // belakang: danau & landmark, kabut terang, kembang api, lampu taman, rumbai & kanopi — depan (di atas teks): kolibri, bunga
  const back = () => `
    <img class="nu-lay nu-lay--kertas dk-lay--danau" style="--d:.08" src="${LAYER}01-latar-danau.webp" alt="">
    <i class="dk-veil" aria-hidden="true"></i>
    <img class="nu-lay dk-lay--kembang" style="--d:.2" src="${LAYER}kembang-api.webp" alt="">
    <img class="nu-lay dk-lay--lampu" style="--d:.24" src="${LAYER}02-lampu.webp" alt="">
    <img class="nu-lay dk-lay--kanopi" style="--d:.38" src="${LAYER}03-kanopi.webp" alt="">`;
  const front = () => `
    <img class="nu-lay dk-lay--kolibri" style="--d:.6" src="${LAYER}04-kolibri.webp" alt="">
    <img class="nu-lay dk-lay--bunga" style="--d:1.3" src="${LAYER}05-bunga-bawah.webp" alt="">`;
  const layers = () => back() + front();
  // kunang-kunang / partikel cahaya
  const SPARK = [[6, 30, 0], [92, 34, 1.3], [9, 48, 2.6], [90, 52, 3.7], [5, 64, 1.9], [94, 68, .6], [12, 80, 3.1], [86, 82, 4.3], [30, 90, 2.2], [68, 92, 4.8]];
  const sparks = () => `<div class="lw-sparks">${SPARK.map(([x, y, t]) => `<i style="left:${x}%;top:${y}%;animation-delay:${t}s"></i>`).join('')}</div>`;
  const art = (extra) => `<div class="nu-art" aria-hidden="true">${back()}${extra || ''}${sparks()}${front()}</div>`;
  // potongan ilustrasi untuk hero (atas / bawah)
  const strip = (pos) => `<div class="nu-strip nu-strip--${pos}" aria-hidden="true"><div class="nu-stack">${layers()}</div></div>`;

  // kupu-kupu (sayap mengepak, terbang melintas)
  const butterfly = (i) => `<i class="nu-bf nu-bf--${i}"><svg viewBox="0 0 40 30"><g class="nu-bf__w nu-bf__w--l"><path d="M20 15 C 12 0, 0 2, 4 12 C 0 20, 10 26, 20 16 Z"/></g><g class="nu-bf__w nu-bf__w--r"><path d="M20 15 C 28 0, 40 2, 36 12 C 40 20, 30 26, 20 16 Z"/></g><path d="M20 9 V 22" stroke="#1f3d2b" stroke-width="1.4"/></svg></i>`;
  const butterflies = () => [1, 2, 3].map(butterfly).join('');

  // dua lembar kertas batik bersobek (dengan gunungan) yang menutup / tersibak
  function panels() {
    return `<div class="nu-panel nu-panel--l pr-panel" aria-hidden="true"><div class="nu-panel__in pr-panel__in">${gunungan('nu-panel__kayon')}</div></div>
      <div class="nu-panel nu-panel--r pr-panel" aria-hidden="true"><div class="nu-panel__in pr-panel__in">${gunungan('nu-panel__kayon')}</div></div>`;
  }

  // awan mega mendung (4 lapis)
  const cloudPath = 'M10 50 C 2 50 0 38 10 35 C 8 22 24 16 32 25 C 36 8 60 6 66 21 C 74 10 94 12 96 27 C 110 24 118 40 108 48 C 104 52 98 52 94 50 Z';
  const cloud = (cls) => `<svg class="nu-cloud ${cls}" viewBox="0 0 120 60" aria-hidden="true">${[1, .76, .52, .3].map((k, i) =>
    `<path d="${cloudPath}" transform="translate(60 40) scale(${k}) translate(-60 -40)" class="nu-cloud__${i}"/>`).join('')}</svg>`;

  // tepi kertas sobek berlapis
  function tear(seed, pos) {
    let x = seed * 7919 % 233280;
    const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
    const edge = (lo, hi) => { let p = `M0 40 L0 ${(lo + rnd() * (hi - lo)).toFixed(1)}`; for (let i = 6; i < 400; i += 5 + rnd() * 9) p += ` L${i.toFixed(1)} ${(lo + rnd() * (hi - lo)).toFixed(1)}`; return p + ` L400 ${(lo + rnd() * (hi - lo)).toFixed(1)} L400 40 Z`; };
    return `<svg class="nu-tear nu-tear--${pos}" viewBox="0 0 400 40" preserveAspectRatio="none" aria-hidden="true">
      <path d="${edge(0, 14)}" class="nu-tear__b"/><path d="${edge(12, 26)}" class="nu-tear__f"/></svg>`;
  }
  let tears = 0;
  const torn = () => tear(++tears * 7 + 1, 'top') + tear(tears * 13 + 5, 'bot');
  const clouds = (a, b) => cloud('nu-cloud--' + a) + cloud('nu-cloud--' + b);

  const frame = (h, url, alt, cls, ph) => `<div class="nu-frame ${cls || ''}">${corners}<div class="nu-frame__in">${h.img(url, alt, '', ph)}</div></div>`;
  const title = (shot, sub, main) => `<h2 class="nu-title" data-shot="${shot}">${gunungan('nu-kayon--mini')}<small>${sub}</small>${main}${ornament()}</h2>`;

  window.UndanganTheme = {
    render(d, h) {
      const g = d.groom, b = d.bride, e0 = d.events[0] || {};
      const dt = h.parseDate(e0.start);
      const stamp = dt ? `${pad(dt.getDate())} . ${pad(dt.getMonth() + 1)} . ${dt.getFullYear()}` : '';
      const guest = h.guest || 'Tamu Undangan';
      const ini = h.initials(g.nick, b.nick);
      // versi tanpa foto: diminta lewat kolom tanpa_foto, atau otomatis bila tidak ada foto sama sekali
      const ilus = d.noPhoto || (!d.couplephoto && !d.cover && !g.photo && !b.photo);
      const wy = (k) => `<img class="nu-wy nu-wy--${k}" src="${ASSET}${k === 'pria' ? 'pria' : 'wanita'}.webp" alt="" aria-hidden="true">`;
      const panggung = () => `<div class="nu-frame nu-frame--hero nu-frame--ilus">${corners}<div class="nu-frame__in nu-ilus">
        <i class="nu-ilus__glow"></i>${gunungan('nu-ilus__kayon')}<img class="nu-pasangan" src="${ASSET}pasangan.webp" alt="Ilustrasi ${h.esc(g.nick)} & ${h.esc(b.nick)}"><i class="nu-ilus__lantai"></i></div></div>`;
      const oval = (p, k) => (ilus || !p.photo)
        ? `<div class="nu-oval nu-oval--${k === 'pria' ? 'l' : 'r'} nu-oval--ilus"><img class="nu-potret" src="${ASSET}pasangan-${k}.webp" alt=""></div>`
        : `<div class="nu-oval nu-oval--${k === 'pria' ? 'l' : 'r'}">${h.img(p.photo, p.name, '', h.initials(p.nick))}</div>`;
      tears = 0;
      const pr_pair = () => ['pria', 'wanita'].map((k) => { const p = k === 'pria' ? g : b; return `
        <article class="nu-person" data-reveal><div class="nu-frame nu-frame--sm">${corners}<div class="nu-frame__in nu-oval--ilus"><img class="nu-potret" src="${ASSET}pasangan-${k}.webp" alt=""></div></div>
          <h3>${h.esc(p.name)}</h3>${p.parents ? `<p>${k === 'pria' ? 'Putra' : 'Putri'} dari<br><b>${h.esc(p.parents)}</b></p>` : ''}</article>`; }).join('<p class="nu-amp" aria-hidden="true">&amp;</p>');

      const person = (p, role) => `
        <article class="nu-person" data-reveal>
          ${frame(h, p.photo, p.name, 'nu-frame--sm', h.initials(p.nick))}
          <h3>${h.esc(p.name)}</h3>
          ${p.parents ? `<p>${role === 'pria' ? 'Putra' : 'Putri'} dari<br><b>${h.esc(p.parents)}</b></p>` : ''}
          ${p.ig ? `<a href="https://instagram.com/${h.esc(p.ig)}" target="_blank" rel="noopener">@${h.esc(p.ig)}</a>` : ''}
        </article>`;

      const who = (p, role) => `<h3>${h.esc(p.nick)}</h3><p class="nu-who__name">${h.esc(p.name)}</p>
        ${p.parents ? `<small>${role === 'pria' ? 'Putra' : 'Putri'} dari</small><p class="nu-who__ortu">${h.esc(p.parents)}</p>` : ''}
        ${p.ig ? `<a href="https://instagram.com/${h.esc(p.ig)}" target="_blank" rel="noopener">@${h.esc(p.ig)}</a>` : ''}`;

      // berkas kalender .ics (Akad / Resepsi) sebagai data URI
      const ics = (e) => {
        const st = h.parseDate(e.start); if (!st) return h.calendarUrl(e, d);
        const en = h.parseDate(e.end) || new Date(st.getTime() + 2 * 3600e3);
        const z = (t) => t.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        const tx = (v) => String(v || '').replace(/[\\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
        const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Undangan Digital//ID', 'BEGIN:VEVENT', 'UID:' + z(st) + '-' + (e.title || 'acara').replace(/\s+/g, '') + '@undangan',
          'DTSTAMP:' + z(new Date()), 'DTSTART:' + z(st), 'DTEND:' + z(en), 'SUMMARY:' + tx((e.title || 'Acara') + ' ' + g.nick + ' & ' + b.nick),
          'LOCATION:' + tx([e.place, e.address].filter(Boolean).join(', ')), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
        return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(body);
      };
      const event = (e) => `
        <article class="nu-event" data-reveal>
          <div class="nu-event__crest">${ornament('ti-div--crest')}</div>
          ${corners}
          <h3>${h.esc(e.title)}</h3>
          <p class="nu-event__date">${h.esc(h.date(e.start))}</p>
          <p class="nu-event__time">Pukul ${h.esc(h.time(e.start))}${e.end ? ' – ' + h.esc(h.time(e.end)) : ''} ${h.esc(e.tz || 'WIB')}</p>
          <p><b>${h.esc(e.place)}</b>${e.address ? `<br>${h.esc(e.address)}` : ''}</p>
          <div class="nu-event__btns">
            <a class="nu-btn nu-btn--line" href="${h.esc(ics(e))}" download="${h.esc((e.title || 'acara').toLowerCase().replace(/[^a-z0-9]+/g, '-'))}.ics">Tambah ke Kalender</a>
          </div>
        </article>`;

      const medal = (k, label) => `<div class="nu-medal"><svg viewBox="0 0 100 100" aria-hidden="true">
        <g fill="none" stroke="currentColor"><circle cx="50" cy="50" r="46" stroke-width="2"/><circle cx="50" cy="50" r="40" stroke-width=".8" stroke-dasharray="2 3"/></g>
        ${Array.from({ length: 12 }, (_, i) => `<circle cx="${50 + 46 * Math.cos(i * Math.PI / 6)}" cy="${50 + 46 * Math.sin(i * Math.PI / 6)}" r="3" class="nu-fill"/>`).join('')}</svg>
        <span data-cd="${k}">00</span><small>${label}</small></div>`;

      // ---------- Lokasi & Maps: tab per lokasi (akad / resepsi), peta berbingkai kubah ----------
      const q = (e) => [e.place, e.address].filter(Boolean).join(', ');
      const koord = (e) => { const m = String(e.maps || '').match(/(-?\d{1,2}\.\d{3,}),\s*(-?\d{1,3}\.\d{3,})/); return m ? m[1] + ',' + m[2] : ''; };
      const venues = [];
      for (const e of d.events) { if (!q(e)) continue; const dup = venues.find((v) => v.q === q(e)); if (dup) { dup.title += ' & ' + e.title; continue; }
        const at = koord(e) || e.address || e.place;   // nama gedung sering tidak dikenal peta: cari pakai alamat
        venues.push({ q: q(e), title: e.title, place: e.place, address: e.address,
          embed: 'https://www.google.com/maps?q=' + encodeURIComponent(at) + '&hl=id&z=15&output=embed',
          gmaps: h.mapsUrl(e), waze: 'https://waze.com/ul?q=' + encodeURIComponent(at) + '&navigate=yes' }); }
      const v0 = venues[0];
      const peta = () => `
    ${title('maps', 'Penunjuk Arah', 'Lokasi Acara')}
    <div class="ti-map" data-reveal data-venues="${h.esc(JSON.stringify(venues))}">
      ${venues.length > 1 ? `<div class="ti-map__tabs" role="tablist">${venues.map((v, i) => `<button type="button" role="tab" class="ti-map__tab${i ? '' : ' is-on'}" data-i="${i}">${h.esc(v.title)}</button>`).join('')}</div>` : ''}
      <h3 class="ti-map__place" data-v="place">${h.esc(v0.place || v0.title)}</h3>
      <p class="ti-map__addr" data-v="address">${h.esc(v0.address)}</p>
      <div class="ti-map__frame"><iframe data-v="embed" data-src="${h.esc(v0.embed)}" title="Peta lokasi acara" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><span class="ti-map__pin" aria-hidden="true"></span></div>
      <div class="ti-map__btns">
        <a class="nu-btn ti-btn--solid" data-v="gmaps" href="${h.esc(v0.gmaps)}" target="_blank" rel="noopener">Buka Google Maps</a>
        <button type="button" class="nu-btn ti-btn--line" data-copy="${h.esc(v0.q)}" data-copied="Tersalin ✓" data-status="Alamat berhasil disalin ke papan klip." data-v="copy">Salin Alamat</button>
      </div>
      <p class="lw-status" role="status" aria-live="polite"></p>
    </div>`;

      const roman = (n) => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][n] || String(n + 1);
      const sections = [
        () => `
    ${title('couple', 'Dua Hati, Satu Janji', 'Kedua Mempelai')}
    <p class="nu-lead">Dengan memohon rahmat Tuhan Yang Maha Esa, kami bermaksud menyelenggarakan pernikahan putra-putri kami:</p>
    <div class="nu-people">${ilus ? pr_pair() : person(g, 'pria') + '<p class="nu-amp" aria-hidden="true">&amp;</p>' + person(b, 'wanita')}</div>
    ${d.quote ? `<div class="nu-quote" data-reveal>${corners}${gunungan('nu-kayon--mini')}<p>${h.esc(d.quote)}</p>${d.quoteSource ? `<cite>${h.esc(d.quoteSource)}</cite>` : ''}</div>` : ''}`,
        () => `
    ${title('countdown', 'Menghitung Hari', 'Menuju Hari Bahagia')}
    <div class="nu-count" data-countdown="${h.esc(e0.start)}" data-reveal>${medal('d', 'Hari')}${medal('h', 'Jam')}${medal('m', 'Menit')}${medal('s', 'Detik')}</div>
    <div class="nu-sub">
      ${title('events', 'Waktu &amp; Tempat', 'Rangkaian Acara')}
      ${d.events.map(event).join('')}
    </div>`,
        (d.story.length || (d.gallery.length && !d.noPhoto)) && (() => `
    ${d.gallery.length && !d.noPhoto ? `${title('gallery', 'Momen Bahagia', 'Galeri')}
    <div class="nu-gallery lw-gallery">${d.gallery.map((u, i) => `
      <button class="nu-gal" data-reveal data-zoom="${h.esc(u)}" aria-label="Perbesar foto ${i + 1}">${frame(h, u, 'Foto ' + (i + 1), 'nu-frame--gal')}</button>`).join('')}
    </div>` : ''}
    ${d.story.length ? `<div class="${d.gallery.length && !d.noPhoto ? 'nu-sub' : ''}">${title('story', 'Perjalanan Cinta', 'Kisah Kami')}
    <ol class="ti-story">${d.story.map((s, i) => `
      <li class="ti-story__card" data-reveal><span class="ti-story__pill">${s.date ? h.esc(s.date) : 'Bab ' + roman(i)}</span><h3>${h.esc(s.title)}</h3><p>${h.esc(s.text)}</p></li>`).join('')}
    </ol></div>` : ''}`),
        venues.length && peta,
        () => `
    ${title('rsvp', 'Mohon Konfirmasi', 'Kehadiran')}
    <form class="nu-form" data-rsvp data-reveal>
      ${corners}
      <label>Nama<input name="nama" maxlength="60" required autocomplete="name"></label>
      <fieldset class="nu-choice"><legend>Status Kehadiran</legend>
        <label><input type="radio" name="hadir" value="Hadir" checked><span>Hadir</span></label>
        <label><input type="radio" name="hadir" value="Masih Ragu"><span>Ragu</span></label>
        <label><input type="radio" name="hadir" value="Tidak Hadir"><span>Berhalangan</span></label>
      </fieldset>
      <label>Jumlah Tamu<select name="jumlah"><option>1</option><option>2</option><option>3</option><option>4</option></select></label>
      <label>Ucapan &amp; Doa<textarea name="ucapan" rows="3" maxlength="500" placeholder="Tulis ucapan dan doa restu"></textarea></label>
      <button type="submit" class="nu-btn nu-btn--gold">Kirim Ucapan</button>
      <p class="nu-form__done" data-rsvp-done hidden>Terima kasih, konfirmasi Anda sudah kami terima.</p>
    </form>
    <div class="nu-sub">${title('wishes', 'Doa Restu', 'Ucapan &amp; Doa')}
    <div class="nu-wishes" data-wishes></div></div>
    ${(d.gifts.length || d.giftAddress) ? `<div class="nu-sub">${title('gift', 'Tanda Kasih', 'Amplop Digital')}
    <p class="nu-lead">Doa restu Anda adalah hadiah terindah. Bila ingin memberi tanda kasih, dapat melalui:</p>
    ${d.gifts.map((x) => `
      <article class="nu-gift" data-reveal>
        <div><small>${h.esc(x.bank)}</small><b>${h.esc(x.number)}</b><span>a.n. ${h.esc(x.name)}</span></div>
        <button class="nu-btn nu-btn--line" data-copy="${h.esc(x.number)}" data-copied="Tersalin ✓" data-status="Nomor ${h.esc(x.bank)} berhasil disalin.">Salin Nomor</button>
      </article>`).join('')}
    ${d.giftAddress ? `<article class="nu-gift" data-reveal><div><small>Kirim Kado</small><span>${h.esc(d.giftAddress)}</span></div><button class="nu-btn nu-btn--line" data-copy="${h.esc(d.giftAddress)}" data-copied="Tersalin ✓" data-status="Alamat kado berhasil disalin.">Salin Alamat</button></article>` : ''}
    <p class="lw-status" role="status" aria-live="polite"></p></div>` : ''}`,
      ].filter(Boolean);
      const SEC_ID = { couple: 'sec-mempelai', countdown: 'sec-acara', gallery: 'sec-kisah', story: 'sec-kisah', maps: 'sec-maps', rsvp: 'sec-rsvp' };
      const secs = sections.map((f, i) => { const html = f(), k = (html.match(/data-shot="(\w+)"/) || [])[1]; return `
  <section class="nu-sec ${i % 2 ? 'nu-sec--cream' : 'nu-sec--dark'}"${SEC_ID[k] ? ` id="${SEC_ID[k]}"` : ''}>${html}
  </section>`; }).join('\n');

      return `
<canvas class="nu-petals" aria-hidden="true"></canvas>
<i class="nu-band nu-band--l" aria-hidden="true"></i><i class="nu-band nu-band--r" aria-hidden="true"></i>

<section class="nu-cover" id="cover">
  ${art(`
    <div class="nu-cover__text">
      <p class="nu-cover__sub">The Wedding of</p>
      <h1 class="nu-cover__names"><span>${h.esc(g.nick)}</span><em>&amp;</em><span>${h.esc(b.nick)}</span></h1>
      <p class="nu-cover__date">${h.esc(stamp)}</p>
      <div class="nu-cover__guest"><small>Kepada Yth. Bapak/Ibu/Saudara/i</small><b>${h.esc(guest)}</b></div>
      <button class="nu-btn nu-btn--navy" data-open>Buka Undangan</button>
      <p class="nu-cover__note">Mohon maaf apabila ada kesalahan penulisan nama/gelar</p>
    </div>`)}
  ${panels()}
</section>

<!-- satu ruang danau yang sama di belakang semua halaman: kamera bergerak masuk tiap pindah halaman -->
<div class="dk-world" aria-hidden="true">${back()}${front()}</div>

<main id="main">
  <section class="nu-hero" data-shot="hero">
    <div class="nu-hero__top">${strip('top')}</div>
    <div class="nu-hero__arch" data-reveal>${ilus ? panggung() : frame(h, d.couplephoto || d.cover, `${g.nick} & ${b.nick}`, 'nu-frame--hero', ini)}</div>
    <p class="nu-hero__kicker" data-reveal>The Wedding of</p>
    <h1 data-reveal>${h.esc(g.nick)}<span>&amp;</span>${h.esc(b.nick)}</h1>
    ${ornament()}
    <p class="nu-hero__date" data-reveal>${h.esc(h.date(e0.start))}</p>
    <div class="nu-hero__bottom">${strip('bottom')}</div>
  </section>

${secs}

  <footer class="nu-footer">
    ${art(`
      <div class="nu-footer__text">
        <p class="nu-footer__thanks">Terima Kasih</p>
        ${ornament()}
        <p>Atas kehadiran dan doa restu Bapak/Ibu/Saudara/i, kami ucapkan terima kasih.</p>
        <h2><span>${h.esc(g.nick)}</span><em>&amp;</em><span>${h.esc(b.nick)}</span></h2>
      </div>`).replace('class="nu-art"', 'class="nu-art nu-art--static"')}
    <div class="nu-footer__credit">
      ${d.photoCredit ? `<small>Foto: ${h.esc(d.photoCredit)}</small>` : ''}
      ${h.brand ? `<small>Undangan digital oleh ${h.esc(h.brand)}</small>` : ''}
    </div>
  </footer>
</main>

<div class="nu-lightbox" hidden data-list="${h.esc(JSON.stringify(d.gallery))}"><button class="nu-lightbox__close" aria-label="Tutup">×</button><button class="nu-lightbox__nav nu-lightbox__nav--prev" aria-label="Sebelumnya">‹</button><img alt=""><button class="nu-lightbox__nav nu-lightbox__nav--next" aria-label="Berikutnya">›</button></div>
<nav class="lw-dock" aria-label="Navigasi undangan">${[
  ['couple', 'Mempelai', '<path d="M12 21s-7-4.4-9.3-9A5.2 5.2 0 0 1 12 6.2 5.2 5.2 0 0 1 21.3 12C19 16.6 12 21 12 21z"/>'],
  ['countdown', 'Acara', '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'],
  ['sec-kisah', 'Kisah', '<path d="M12 20c-4-3-8-6.2-8-10.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 8 2.5C20 13.8 16 17 12 20z"/><path d="M12 7v13"/>'],
  ['maps', 'Maps', '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>'],
  ['rsvp', 'RSVP', '<path d="M4 5.5h16v11H8.5L4 20z"/><path d="M8 9.5h8M8 12.5h5"/>'],
].filter(([k]) => k !== 'sec-kisah' || d.story.length || (d.gallery.length && !d.noPhoto)).filter(([k]) => k !== 'maps' || venues.length)
  .map(([k, t, ic]) => `<button type="button" data-go="${k}"><svg viewBox="0 0 24 24" aria-hidden="true">${ic}</svg><span>${t}</span></button>`).join('')}<button type="button" class="lw-dock__music" data-music aria-label="Putar/hentikan musik"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="lw-eq" d="M6 16V9M10 18V6M14 16V9M18 14v-3"/></svg><span>Musik</span></button></nav>`;
    },

    renderWish(w, h) {
      return `<article class="nu-wish"><header><b>${h.esc(w.nama)}</b>${w.kehadiran ? `<span>${h.esc(({ 'Tidak Hadir': 'Berhalangan', 'Masih Ragu': 'Ragu' })[w.kehadiran] || w.kehadiran)}</span>` : ''}</header><p>${h.esc(w.ucapan)}</p></article>`;
    },

    mount(root) {
      // latar ilustrasi halaman isi: aktif hanya bila filenya tersedia
      for (const k of ['terang', 'gelap']) { const im = new Image(); im.onload = () => root.classList.add('has-bg-' + k); im.src = '/assets/danau-kembang-api/bg-' + k + '-atas.webp'; }
      { const op = new Image(); op.onload = () => root.classList.add('has-opening'); op.src = '/assets/danau-kembang-api/opening.webp'; }
      // navigasi bawah: gulir ke bagian, tandai bagian yang sedang dibaca
      const dock = root.querySelector('.lw-dock');
      if (dock) {
        const btns = [...dock.querySelectorAll('[data-go]')];
        const target = (k) => root.querySelector(k.startsWith('sec-') ? '#' + k : '[data-shot="' + k + '"]');
        btns.forEach((bt) => bt.addEventListener('click', () => { const el = target(bt.dataset.go); if (!el) return;
          if (document.body.classList.contains('u-slide')) return el.scrollIntoView({ behavior: 'smooth' });   // mode slide: pindah halaman
          scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: 'smooth' }); }));
        const mark = () => { let on = null; for (const bt of btns) { const el = target(bt.dataset.go); if (el && el.getBoundingClientRect().top < innerHeight * .45) on = bt; } btns.forEach((x) => x.classList.toggle('is-on', x === on)); };
        addEventListener('scroll', mark, { passive: true }); mark();
      }

      // kamera "masuk ke dalam" panorama: tiap halaman (slide / bagian yang sedang dibaca) punya zoom & arah sorot
      // sendiri; latar danau bergeser halus ke sana, bingkai bunga & lampu melebar ke tepi seolah kita melangkah masuk.
      const world = root.querySelector('.dk-world');
      if (world) {
        const halaman = [...root.querySelectorAll('#main > *')];
        const KAMERA = [[1, 0], [1.14, -7], [1.24, 6], [1.32, -5], [1.2, 8], [1.28, -8], [1.12, 4], [1.36, 0]];
        const diam = document.documentElement.classList.contains('u-shot') || matchMedia('(prefers-reduced-motion: reduce)').matches;
        const aktif = () => {
          if (document.body.classList.contains('u-slide')) return Math.max(0, halaman.findIndex((s) => s.classList.contains('u-slide-on')));
          let best = 0, jarak = 1e9;
          halaman.forEach((s, i) => { const r = s.getBoundingClientRect(); const d = Math.abs(r.top + r.height / 2 - innerHeight / 2); if (d < jarak) { jarak = d; best = i; } });
          return best;
        };
        let z = 1, x = 0, px = 0, py = 0, tpx = 0, tpy = 0;
        addEventListener('pointermove', (e) => { tpx = e.clientX / innerWidth * 2 - 1; tpy = e.clientY / innerHeight * 2 - 1; }, { passive: true });
        addEventListener('deviceorientation', (e) => { if (e.gamma != null) { tpx = Math.max(-1, Math.min(1, e.gamma / 25)); tpy = Math.max(-1, Math.min(1, (e.beta - 45) / 30)); } }, { passive: true });
        const kamera = () => {
          const i = aktif(), [tz, tx] = KAMERA[i % KAMERA.length];
          const k = diam ? 1 : .035;
          z += (tz - z) * k; x += (tx - x) * k; px += (tpx * 8 - px) * .06; py += (tpy * 6 - py) * .06;
          world.style.setProperty('--cz', z.toFixed(4));
          world.style.setProperty('--cx', x.toFixed(2) + '%');
          world.style.setProperty('--buka', ((z - 1) / .36).toFixed(3));
          world.style.setProperty('--px', px.toFixed(2)); world.style.setProperty('--py', py.toFixed(2));
          if (!diam) requestAnimationFrame(kamera);
        };
        kamera();
        if (diam) { addEventListener('scroll', kamera, { passive: true }); }
      }

      // efek 2.5D: lapisan bergeser sesuai kedalaman (--d) mengikuti kemiringan HP / gerak jari / scroll.
      // Tanpa input, ada "napas" pelan otomatis supaya ilustrasi tetap terasa hidup.
      if (!document.documentElement.classList.contains('u-shot') && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const cover = root.querySelector('.nu-cover .nu-art');
        let tx = 0, ty = 0, cx = 0, cy = 0, lastInput = -1e9;
        const aim = (x, y) => { tx = Math.max(-1, Math.min(1, x)) * 10; ty = Math.max(-1, Math.min(1, y)) * 8; lastInput = performance.now(); };
        addEventListener('pointermove', (e) => aim(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1), { passive: true });
        addEventListener('deviceorientation', (e) => { if (e.gamma != null) aim(e.gamma / 25, (e.beta - 45) / 30); }, { passive: true });
        const scrollers = [...root.querySelectorAll('.nu-strip, .nu-art--static, .nu-sec')];
        const tick = (now) => {
          if (now - lastInput > 2500) { tx = Math.sin(now / 2300) * 6; ty = Math.cos(now / 3100) * 4; }  // napas otomatis
          cx += (tx - cx) * .06; cy += (ty - cy) * .06;
          if (cover) { cover.style.setProperty('--px', cx.toFixed(2)); cover.style.setProperty('--py', cy.toFixed(2)); }
          for (const el of scrollers) {
            const r = el.getBoundingClientRect();
            if (r.bottom < -100 || r.top > innerHeight + 100) continue;
            el.style.setProperty('--sy', (((r.top + r.height / 2) - innerHeight / 2) / innerHeight * 16).toFixed(2));
            if (el.classList.contains('nu-sec')) { el.style.setProperty('--bx', (cx * .6).toFixed(2) + 'px'); el.style.setProperty('--by', Math.max(-10, Math.min(10, ((r.top + r.height / 2) - innerHeight / 2) / innerHeight * -14 + cy * .6)).toFixed(2) + 'px'); }
          }
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
      root.querySelectorAll('[data-status]').forEach((bt) => bt.addEventListener('click', () => {
        const st = bt.closest('.ti-map, .nu-sub, .nu-sec').querySelector('.lw-status'); if (!st) return;
        st.textContent = bt.dataset.status; st.classList.add('is-on'); clearTimeout(st._t); st._t = setTimeout(() => st.classList.remove('is-on'), 2600);
      }));
      const map = root.querySelector('.ti-map');
      if (map) {
        const vs = JSON.parse(map.dataset.venues || '[]'), fr = map.querySelector('iframe');
        const load = () => { if (!fr.src && fr.dataset.src) fr.src = fr.dataset.src; };
        if (document.documentElement.classList.contains('u-shot')) load();
        else if ('IntersectionObserver' in window) { const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { load(); io.disconnect(); } }, { rootMargin: '400px' }); io.observe(map); }
        else load();
        map.querySelectorAll('.ti-map__tab').forEach((t) => t.addEventListener('click', () => {
          const v = vs[+t.dataset.i]; if (!v) return;
          map.querySelectorAll('.ti-map__tab').forEach((x) => x.classList.toggle('is-on', x === t));
          map.querySelector('[data-v=place]').textContent = v.place || v.title;
          map.querySelector('[data-v=address]').textContent = v.address;
          fr.dataset.src = v.embed; fr.src = v.embed;
          map.querySelector('[data-v=gmaps]').href = v.gmaps;
          map.querySelector('[data-v=copy]').dataset.copy = v.q;
        }));
      }
      const lb = root.querySelector('.nu-lightbox'), img = lb.querySelector('img');
      const list = JSON.parse(lb.dataset.list || '[]'); let cur = 0;
      const show = (i) => { cur = (i + list.length) % list.length; img.src = list[cur]; };
      const close = () => { lb.hidden = true; img.src = ''; };
      root.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => { if (!b.dataset.zoom) return; const i = list.indexOf(b.dataset.zoom); if (i >= 0) show(i); else img.src = b.dataset.zoom; lb.hidden = false; }));
      lb.querySelector('.nu-lightbox__nav--prev').addEventListener('click', (e) => { e.stopPropagation(); show(cur - 1); });
      lb.querySelector('.nu-lightbox__nav--next').addEventListener('click', (e) => { e.stopPropagation(); show(cur + 1); });
      lb.addEventListener('click', (e) => { if (e.target !== img) close(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

      // kelopak & salju halus berjatuhan
      const cv = root.querySelector('.nu-petals'), ctx = cv.getContext('2d');
      const still = document.documentElement.classList.contains('u-shot') || matchMedia('(prefers-reduced-motion: reduce)').matches;
      let W = 0, H = 0, ps = [];
      const mk = (y) => ({ x: Math.random() * W, y: y ?? Math.random() * H, r: 3 + Math.random() * 4, vy: .35 + Math.random() * .6, vx: (Math.random() - .5) * .4, a: Math.random() * 6.28, va: (Math.random() - .5) * .04, gold: Math.random() < .5, ph: Math.random() * 6.28 });
      const resize = () => { const dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ps = Array.from({ length: Math.round(W * H / 17000) }, () => mk()); };
      resize(); addEventListener('resize', resize);
      const petal = (p) => {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
        ctx.fillStyle = p.gold ? 'rgba(240,170,186,.85)' : 'rgba(255,255,255,.92)';
        for (let k = 0; k < (p.gold ? 1 : 5); k++) { ctx.rotate(k ? 1.2566 : 0); ctx.beginPath(); ctx.ellipse(0, -p.r * .9, p.r * .45, p.r * .9, 0, 0, 6.28); ctx.fill(); }
        if (!p.gold) { ctx.fillStyle = 'rgba(255,236,170,.9)'; ctx.beginPath(); ctx.arc(0, 0, p.r * .25, 0, 6.28); ctx.fill(); }
        ctx.restore();
      };
      let t = 0;
      const draw = () => {
        ctx.clearRect(0, 0, W, H);
        for (const p of ps) {
          if (!still) { p.y += p.vy; p.x += p.vx + Math.sin(t * .02 + p.ph) * .3; p.a += p.va; if (p.y > H + 10) Object.assign(p, mk(-10)); }
          petal(p);
        }
        t++; if (!still) requestAnimationFrame(draw);
      };
      draw();
    },

    onOpen(root) {
      // kertas batik bersobek menutup, lalu tersibak lagi memperlihatkan isi undangan
      const cover = root.querySelector('#cover');
      cover.classList.add('is-closing');
      return new Promise((ok) => {
        setTimeout(() => { cover.classList.add('is-open'); ok(); }, 950);
        setTimeout(() => cover.classList.add('is-gone'), 2300);
      });
    },
  };
})();
