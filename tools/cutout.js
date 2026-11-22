// Menghapus latar polos (kertas/dinding) dari foto/ilustrasi -> PNG transparan, opsional diwarnai duotone.
// Cara kerja: flood-fill dari tepi gambar; piksel ikut terhapus bila warnanya dekat dengan warna latar
// (median tepi) DAN dekat dengan tetangganya (mengikuti gradasi latar), sehingga berhenti di garis kontur.
// Pakai:
//   node tools/cutout.js in.jpg out.png [--tol 60] [--step 16] [--crop x,y,w,h] [--width 900]
//                                        [--duotone "#2a0709,#c9a14a,#f6e6bd"] [--flip]
//                                        [--line] [--paper-fill #f8f2e2] [--keep]   (lapisan line-art berlatar putih)
const { execFileSync } = require('child_process');
const fs = require('fs');
const findFfmpeg = require('./ffmpeg-path.js');

const args = process.argv.slice(2);
const [inp, out] = args;
if (!inp || !out) { console.error('pakai: node tools/cutout.js in.jpg out.png [opsi]'); process.exit(1); }
const opt = (k, d) => { const i = args.indexOf('--' + k); return i < 0 ? d : (args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true); };
const TOL = +opt('tol', 60), STEP = +opt('step', 16), WIDTH = +opt('width', 0);
const crop = opt('crop', '');
const duo = opt('duotone', '');
const ff = findFfmpeg();
const LINE = !!opt('line', false);                                   // line-art di atas putih
const PAPER_RGB = String(opt('paper-fill', '#f8f2e2')).replace('#', '').match(/../g).map((h) => parseInt(h, 16));

// 1) dekode -> RGBA mentah (dengan crop/scale opsional)
const vf = [crop && `crop=${crop.split(',').join(':').replace(/^(\d+):(\d+):(\d+):(\d+)$/, '$3:$4:$1:$2')}`, WIDTH && `scale=${WIDTH}:-2:flags=lanczos`, opt('flip', false) && 'hflip'].filter(Boolean);
const probe = execFileSync(ff, ['-v', 'error', '-i', inp, ...(vf.length ? ['-vf', vf.join(',')] : []), '-f', 'image2pipe', '-vcodec', 'png', '-frames:v', '1', 'pipe:1'], { maxBuffer: 1 << 28 });
const W = probe.readUInt32BE(16), H = probe.readUInt32BE(20);
const raw = execFileSync(ff, ['-v', 'error', '-i', inp, ...(vf.length ? ['-vf', vf.join(',')] : []), '-f', 'rawvideo', '-pix_fmt', 'rgba', '-frames:v', '1', 'pipe:1'], { maxBuffer: 1 << 28 });
const px = new Uint8ClampedArray(raw.buffer, raw.byteOffset, W * H * 4);

// 2) warna latar = median piksel tepi
const border = [];
for (let x = 0; x < W; x++) border.push(x, x + (H - 1) * W);
for (let y = 0; y < H; y++) border.push(y * W, y * W + W - 1);
const med = opt('bg', '') ? String(opt('bg')).replace('#', '').match(/../g).map((h) => parseInt(h, 16))   // --bg #ffffff: warna latar ditetapkan manual
  : [0, 1, 2].map((c) => { const v = border.map((i) => px[i * 4 + c]).sort((a, b) => a - b); return v[v.length >> 1]; });
const dist = (i, r, g, b) => Math.hypot(px[i * 4] - r, px[i * 4 + 1] - g, px[i * 4 + 2] - b);

// morfologi biner sederhana (kotak radius r)
const morph = (src, r, dilate) => {
  const tmp = new Uint8Array(W * H), dst = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {           // horizontal
    let v = dilate ? 0 : 1;
    for (let k = -r; k <= r && (dilate ? !v : v); k++) { const nx = x + k; if (nx < 0 || nx >= W) { if (!dilate) v = 0; continue; } v = src[y * W + nx]; }
    tmp[y * W + x] = v;
  }
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {           // vertikal
    let v = dilate ? 0 : 1;
    for (let k = -r; k <= r && (dilate ? !v : v); k++) { const ny = y + k; if (ny < 0 || ny >= H) { if (!dilate) v = 0; continue; } v = tmp[ny * W + x]; }
    dst[y * W + x] = v;
  }
  return dst;
};

// 3) penghalang: garis/warna (bukan kertas); --close R menutup celah garis kontur yang putus
const CLOSE = +opt('close', 0);
let wall = new Uint8Array(W * H);
if (CLOSE) { for (let i = 0; i < W * H; i++) wall[i] = dist(i, ...med) > TOL * .55 ? 1 : 0; wall = morph(wall, CLOSE, true); }

// 4) flood-fill dari tepi
let bg = new Uint8Array(W * H);
const stack = [];
for (const i of border) if (!wall[i] && dist(i, ...med) < TOL && !bg[i]) { bg[i] = 1; stack.push(i); }
while (stack.length) {
  const i = stack.pop(), x = i % W, y = (i / W) | 0;
  const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const nx = x + dx, ny = y + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    const j = ny * W + nx;
    if (bg[j] || wall[j]) continue;
    if (dist(j, ...med) < TOL && dist(j, r, g, b) < STEP) { bg[j] = 1; stack.push(j); }
  }
}
// setelah penutupan, kembalikan tepi siluet: latar = dilasi latar sebesar CLOSE, tapi hanya pada piksel bernada kertas
if (CLOSE) { const grown = morph(bg, CLOSE + 1, true); for (let i = 0; i < W * H; i++) if (grown[i] && !bg[i] && dist(i, ...med) < TOL * .7) bg[i] = 1; }
// --holes T,MIN: area bernada kertas yang terkurung (mis. di antara lengan & badan) dibuang bila cukup besar
const HOLES = opt('holes', '');
if (HOLES) {
  const [ht, hmin] = String(HOLES).split(',').map(Number), mark = new Uint8Array(W * H);
  for (let s = 0; s < W * H; s++) {
    if (bg[s] || mark[s] || dist(s, ...med) >= ht) continue;
    const comp = [s]; mark[s] = 1;
    for (let q = 0; q < comp.length; q++) { const i = comp[q], x = i % W, y = (i / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; if (!bg[j] && !mark[j] && dist(j, ...med) < ht) { mark[j] = 1; comp.push(j); } } }
    if (comp.length >= hmin) for (const i of comp) bg[i] = 1;
  }
}
// --paper C,MIN: area keabuan/pucat (chroma < C, tidak gelap) yang terkurung dibuang bila cukup besar
//   (membedakan kertas abu-krem dari kulit wayang yang dicat kuning)
const PAPER = opt('paper', '');
if (PAPER) {
  const [pc, pmin] = String(PAPER).split(',').map(Number), mark = new Uint8Array(W * H);
  const pale = (i) => { const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2]; return Math.max(r, g, b) - Math.min(r, g, b) < pc && (r + g + b) / 3 > 105; };
  for (let s = 0; s < W * H; s++) {
    if (bg[s] || mark[s] || !pale(s)) continue;
    const comp = [s]; mark[s] = 1;
    for (let q = 0; q < comp.length; q++) { const i = comp[q], x = i % W, y = (i / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; if (!bg[j] && !mark[j] && pale(j)) { mark[j] = 1; comp.push(j); } } }
    if (comp.length >= pmin) for (const i of comp) bg[i] = 1;
  }
}
// --seed x,y[;x,y...]: hapus area kertas yang terkurung mulai dari titik tertentu (koordinat setelah crop)
const SEED = opt('seed', '');
if (SEED) for (const pt of String(SEED).split(';')) {
  const [sx, sy] = pt.split(',').map(Number), s = sy * W + sx;
  const [r0, g0, b0] = [px[s * 4], px[s * 4 + 1], px[s * 4 + 2]];
  const st = [s]; bg[s] = 1;
  while (st.length) { const i = st.pop(), x = i % W, y = (i / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx;
      if (!bg[j] && !wall[j] && dist(j, r0, g0, b0) < TOL * .6) { bg[j] = 1; st.push(j); } } }
}
// buang pulau kecil (noda) yang terpisah: komponen isi < --min piksel
const MIN = +opt('min', 400), seen = new Uint8Array(W * H);
for (let s = 0; s < W * H; s++) {
  if (bg[s] || seen[s]) continue;
  const comp = [s]; seen[s] = 1;
  for (let q = 0; q < comp.length; q++) { const i = comp[q], x = i % W, y = (i / W) | 0;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; if (!bg[j] && !seen[j]) { seen[j] = 1; comp.push(j); } } }
  if (comp.length < MIN) for (const i of comp) bg[i] = 1;
}

// 4) alpha halus: blur 3x3 pada masker
const a = new Float32Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  let s = 0, n = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    s += bg[ny * W + nx] ? 0 : 1; n++;
  }
  a[y * W + x] = bg[y * W + x] ? 0 : s / n;
}

// 5) duotone opsional (gelap -> tengah -> terang)
const hex = (h) => [1, 3, 5].map((k) => parseInt(h.replace('#', '').padEnd(6, '0').substr(k - 1, 2), 16));
const stops = duo ? duo.split(',').map((s) => hex(s.trim())) : null;
for (let i = 0; i < W * H; i++) {
  const o = i * 4;
  if (stops) {
    let L = (.299 * px[o] + .587 * px[o + 1] + .114 * px[o + 2]) / 255;
    L = Math.min(1, Math.max(0, (L - .12) / .8));               // regang kontras
    const t = L * (stops.length - 1), k = Math.min(stops.length - 2, Math.floor(t)), f = t - k;
    for (let c = 0; c < 3; c++) px[o + c] = stops[k][c] + (stops[k + 1][c] - stops[k][c]) * f;
  }
  let al = a[i];
  if (LINE && al > 0) {
    const r = px[o], g = px[o + 1], b = px[o + 2], mn = Math.min(r, g, b);
    if (al < 1) {                                                   // tepi: alpha dari kegelapan, warna di-unpremultiply terhadap putih
      const ea = Math.min(1, Math.max(0, (252 - mn) / 75)); al = Math.max(al * .35, ea);
      if (al > .02) for (let c = 0; c < 3; c++) px[o + c] = Math.max(0, Math.min(255, 255 - (255 - px[o + c]) / al));
    }
    if (Math.min(px[o], px[o + 1], px[o + 2]) > 236) { px[o] = PAPER_RGB[0]; px[o + 1] = PAPER_RGB[1]; px[o + 2] = PAPER_RGB[2]; } // isi putih -> kertas
  }
  px[o + 3] = Math.round(al * 255);
}

// 6) potong ke bounding box isi (kecuali --keep: kanvas utuh agar lapisan tetap sejajar) + simpan PNG
let x0 = W, y0 = H, x1 = 0, y1 = 0;
if (opt('keep', false)) { x0 = 0; y0 = 0; x1 = W - 1; y1 = H - 1; }
else for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (px[(y * W + x) * 4 + 3] > 20) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
const tmp = out + '.rgba';
fs.writeFileSync(tmp, Buffer.from(px.buffer, px.byteOffset, px.length));
const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
execFileSync(ff, ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-i', tmp,
  '-vf', `crop=${cw}:${ch}:${x0}:${y0}`, '-frames:v', '1', '-compression_level', '9', out]);
fs.unlinkSync(tmp);
const kept = a.reduce((s, v) => s + (v > .5 ? 1 : 0), 0);
console.log(`✓ ${out}  ${cw}x${ch} @${x0},${y0}  latar rgb(${med.join(',')})  isi ${(kept / (W * H) * 100).toFixed(1)}%`);
