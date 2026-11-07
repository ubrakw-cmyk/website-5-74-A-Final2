'use strict';
/* ===================== Website 5,74 A ===================== */
const CFG = window.APP_CONFIG || {};
const SB_MODE = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY && window.supabase);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = d => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const safeUrl = u => /^https?:\/\//i.test(u || '') ? u : '';
const cssUrl = u => `url("${String(u).replace(/["\\\n\r]/g, '')}")`;

const ICON = {
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  x: '<path d="M18 6L6 18M6 6l12 12"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  left: '<path d="M15 18l-6-6 6-6"/>',
  right: '<path d="M9 18l6-6-6-6"/>',
  down: '<path d="M6 9l6 6 6-6"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  youtube: '<path d="M22 8.5a3 3 0 0 0-2.1-2.1C18 6 12 6 12 6s-6 0-7.9.4A3 3 0 0 0 2 8.5 31 31 0 0 0 1.6 12c0 1.2.1 2.4.4 3.5a3 3 0 0 0 2.1 2.1C6 18 12 18 12 18s6 0 7.9-.4a3 3 0 0 0 2.1-2.1c.3-1.1.4-2.3.4-3.5s-.1-2.4-.4-3.5z"/><path d="M10 15l5-3-5-3z"/>',
  tiktok: '<path d="M16 3v10.5a4.5 4.5 0 1 1-4.5-4.5"/><path d="M16 3c.3 2.5 2 4.3 4.5 4.5"/>'
};
const ico = (n, s = 20, sw = 2) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICON[n]}</svg>`;

/* ---------- struktur kelas ---------- */
const ROLES = [
  { key: 'wali', label: 'Wali Kelas', c: 'wali' },
  { key: 'ketua', label: 'Ketua Kelas', c: 'ketua' },
  { key: 'wakil', label: 'Wakil Ketua', c: 'ketua' },
  { key: 'sek1', label: 'Sekretaris 1', c: 'sek' }, { key: 'sek2', label: 'Sekretaris 2', c: 'sek' },
  { key: 'ben1', label: 'Bendahara 1', c: 'ben' }, { key: 'ben2', label: 'Bendahara 2', c: 'ben' },
  { key: 'zera1', label: 'Zetra 1', c: 'zera' }, { key: 'zera2', label: 'Zetra 2', c: 'zera' },
  { key: 'kes1', label: 'Kader Kesehatan 1', c: 'kes' }, { key: 'kes2', label: 'Kader Kesehatan 2', c: 'kes' },
  { key: 'lit1', label: 'Duta Literasi 1', c: 'lit' }, { key: 'lit2', label: 'Duta Literasi 2', c: 'lit' }
];
const GROUPS = [['sek1', 'sek2'], ['ben1', 'ben2'], ['zera1', 'zera2'], ['kes1', 'kes2'], ['lit1', 'lit2']];
const roleLabel = k => ROLES.find(r => r.key === k)?.label || k;
const roleClass = k => ROLES.find(r => r.key === k)?.c || '';

/* ---------- gambar: kompres sebelum simpan ---------- */
function compress(file, max = 1280, q = .78) {
  return new Promise((res, rej) => {
    const img = new Image(), u = URL.createObjectURL(file);
    img.onload = () => {
      let { width: w, height: h } = img;
      const k = Math.min(1, max / Math.max(w, h));
      w = Math.round(w * k); h = Math.round(h * k);
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(u);
      c.toBlob(b => b ? res(b) : rej(new Error('Gagal memproses gambar')), 'image/jpeg', q);
    };
    img.onerror = () => rej(new Error('File itu bukan gambar yang bisa dibaca'));
    img.src = u;
  });
}
const blobToData = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); });
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const b64 = s => btoa(unescape(encodeURIComponent(s)));

/* ===================== STORE: MODE DEMO (localStorage) ===================== */
const Local = {
  async init() {
    this.items = JSON.parse(localStorage.getItem('a574_items') || '[]');
    this.users = JSON.parse(localStorage.getItem('a574_users') || '[]');
    const s = localStorage.getItem('a574_session');
    return this.pub(this.users.find(u => u.id === s));
  },
  pub(u) { return u ? { id: u.id, name: u.name, email: u.email, role: u.role } : null; },
  save() { try { localStorage.setItem('a574_items', JSON.stringify(this.items)); } catch (e) { throw new Error('Penyimpanan browser penuh. Hubungkan Supabase supaya foto tidak terbatas.'); } },
  async signUp(name, email, pw) {
    email = email.trim().toLowerCase();
    if (this.users.some(u => u.email === email)) throw new Error('Email sudah terdaftar');
    const u = { id: uid('u'), name, email, pw: b64(pw), role: this.users.length ? 'member' : 'admin' };
    this.users.push(u); localStorage.setItem('a574_users', JSON.stringify(this.users));
    localStorage.setItem('a574_session', u.id);
    return this.pub(u);
  },
  async signIn(email, pw) {
    const u = this.users.find(x => x.email === email.trim().toLowerCase() && x.pw === b64(pw));
    if (!u) throw new Error('Email atau password salah');
    localStorage.setItem('a574_session', u.id);
    return this.pub(u);
  },
  async signOut() { localStorage.removeItem('a574_session'); },
  async list() { return [...this.items]; },
  async add(kind, data, user) {
    const it = { id: uid('i'), kind, owner: user.id, owner_name: user.name, data, created_at: new Date().toISOString() };
    this.items.push(it);
    try { this.save(); } catch (e) { this.items.pop(); throw e; }
    return it;
  },
  async update(id, data) {
    const it = this.items.find(i => i.id === id), old = it.data;
    it.data = data;
    try { this.save(); } catch (e) { it.data = old; throw e; }
    return it;
  },
  async remove(id) { this.items = this.items.filter(i => i.id !== id); this.save(); },
  async removeFile() { },
  async upload(file, user, big) { return { url: await blobToData(await compress(file, big ? 1280 : 900, .7)) }; },
  async profiles() { return this.users.map(u => this.pub(u)); },
  async setRole(id, role) {
    const u = this.users.find(x => x.id === id); u.role = role;
    localStorage.setItem('a574_users', JSON.stringify(this.users));
  },
  // sinkron antar tab di browser yang sama
  subscribe(cb) {
    window.addEventListener('storage', e => { if (e.key === 'a574_items') { this.items = JSON.parse(e.newValue || '[]'); cb(); } });
  }
};

/* ===================== STORE: SUPABASE ===================== */
const Sb = {
  async init() {
    this.c = supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
    const { data } = await this.c.auth.getSession();
    return data.session ? this.me(data.session.user) : null;
  },
  async me(u) {
    const { data } = await this.c.from('profiles').select('*').eq('id', u.id).maybeSingle();
    return { id: u.id, email: u.email, name: data?.name || (u.email || '').split('@')[0], role: data?.role || 'member' };
  },
  async signIn(email, password) {
    const { data, error } = await this.c.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(error.message === 'Invalid login credentials' ? 'Email atau password salah' : error.message);
    return this.me(data.user);
  },
  async signUp(name, email, password) {
    const { data, error } = await this.c.auth.signUp({ email: email.trim(), password, options: { data: { name } } });
    if (error) throw new Error(error.message);
    if (!data.session) throw new Error('Pendaftaran berhasil. Cek email untuk konfirmasi, lalu masuk.');
    return this.me(data.user);
  },
  async signOut() { await this.c.auth.signOut(); },
  async list() {
    const { data, error } = await this.c.from('items').select('*').order('created_at');
    if (error) throw new Error(error.message);
    return data;
  },
  async add(kind, data, user) {
    const { data: row, error } = await this.c.from('items').insert({ kind, data, owner_name: user.name }).select().single();
    if (error) throw new Error(error.message);
    return row;
  },
  async update(id, data) {
    const { data: row, error } = await this.c.from('items').update({ data }).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return row;
  },
  async remove(id) {
    const { error } = await this.c.from('items').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
  async removeFile(path) { if (path) await this.c.storage.from('photos').remove([path]).catch(() => { }); },
  async upload(file, user, big) {
    const blob = await compress(file, big ? 1920 : 1600, .8);
    const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.jpg`;
    const { error } = await this.c.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' });
    if (error) throw new Error(error.message);
    return { url: this.c.storage.from('photos').getPublicUrl(path).data.publicUrl, path };
  },
  async profiles() {
    const { data } = await this.c.from('profiles').select('*').order('name');
    return data || [];
  },
  async setRole(id, role) {
    const { error } = await this.c.from('profiles').update({ role }).eq('id', id);
    if (error) throw new Error(error.message);
  },
  // realtime: perubahan dari HP / laptop lain langsung muncul
  subscribe(cb) {
    try { this.c.channel('items-sync').on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, cb).subscribe(); } catch (e) { }
  }
};

/* ===================== STATE ===================== */
const Store = SB_MODE ? Sb : Local;
const S = { user: null, items: [] };
const isAdmin = () => S.user?.role === 'admin';
const byKind = k => S.items.filter(i => i.kind === k);
const members = () => byKind('member');
const setting = () => byKind('setting')[0]?.data || {};
const roleItem = key => byKind('role').find(i => i.data.key === key);
const memberById = id => members().find(m => m.id === id);
const canDelete = it => isAdmin() || it.owner === S.user.id;
const handleOf = m => (m?.data?.handle || '').replace(/^@/, '');

async function addItem(kind, data) { const it = await Store.add(kind, data, S.user); S.items.push(it); return it; }
async function updItem(id, data) {
  const it = await Store.update(id, data);
  const i = S.items.findIndex(x => x.id === id); S.items[i] = { ...S.items[i], ...it, data };
}
async function delItem(id) {
  const it = S.items.find(i => i.id === id);
  if (!it || !confirm('Hapus item ini? Tindakan ini tidak bisa dibatalkan.')) return false;
  await Store.removeFile(it.data.path);
  await Store.remove(id);
  S.items = S.items.filter(i => i.id !== id);
  return true;
}
async function renameMember(id, data) {
  await updItem(id, data);
  for (const a of byKind('achievement').filter(a => a.data.memberId === id && a.data.memberName !== data.name)) await updItem(a.id, { ...a.data, memberName: data.name });
  for (const r of byKind('role').filter(r => r.data.memberId === id && r.data.name !== data.name)) await updItem(r.id, { ...r.data, name: data.name });
}

/* ===================== UI HELPERS ===================== */
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 3200);
}
function closeModal() { const m = $$('.mb').pop(); if (m) m.remove(); if (!$('.mb')) document.body.style.overflow = ''; }
function closeAll() { $$('.mb').forEach(m => m.remove()); document.body.style.overflow = ''; }
function openModal(html, cls = '', stack = false) {
  if (!stack) closeAll();
  const d = document.createElement('div'); d.className = 'mb' + (stack ? ' over' : '');
  d.innerHTML = `<div class="modal ${cls}"><button class="x" data-act="close" aria-label="Tutup">${ico('x', 18)}</button>${html}</div>`;
  d.addEventListener('mousedown', e => { if (e.target === d) closeModal(); });
  document.body.appendChild(d); document.body.style.overflow = 'hidden';
  markLoaded(d);
  return d;
}
// tombol memuat: efek shimmer (tanpa tulisan "loading")
async function busy(btn, fn) {
  if (btn) { btn.disabled = true; btn.classList.add('is-load'); }
  try { await fn(); } catch (e) { toast(e.message || 'Terjadi kesalahan'); }
  finally { if (btn && btn.isConnected) { btn.disabled = false; btn.classList.remove('is-load'); } }
}
/* gambar: tandai sudah termuat agar fade-in */
document.addEventListener('load', e => { if (e.target.tagName === 'IMG') e.target.classList.add('ld'); }, true);
document.addEventListener('error', e => { if (e.target.tagName === 'IMG') e.target.classList.add('ld'); }, true);
function markLoaded(root = document) { $$('img', root).forEach(i => { if (i.complete && i.naturalWidth > 0) i.classList.add('ld'); }); }

/* ---------- animasi saat scroll (reveal) ---------- */
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => {
  if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); }
}), { threshold: .1, rootMargin: '0px 0px -5% 0px' }) : null;
function reveal(el) {
  el.classList.add('in');
  $$('[data-n]', el).forEach(countUp);
  const d = parseFloat(el.style.getPropertyValue('--d')) || 0;
  setTimeout(() => { el.classList.remove('rv', 'in'); el.style.removeProperty('--d'); }, (d + 1) * 1000 + 150);
}
function countUp(el) {
  const n = +el.dataset.n, t0 = performance.now();
  const step = t => { const p = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - p, 3); el.textContent = Math.round(n * e); if (p < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
const REVEAL_SEL = '.st h2,.st i,.st p,.st .btn,.about-photo,.soc,.masonry>.ph,.node,.mem,.ach-card,.admin-grid>.card,.pg,.empty,.foot';
function prepReveal(root = document) {
  const count = new Map();
  $$(REVEAL_SEL, root).forEach(el => {
    if (el.closest('.mb')) return;
    if (!io) { $$('[data-n]', el).forEach(e => e.textContent = e.dataset.n); return; }
    const p = el.parentElement, n = count.get(p) || 0; count.set(p, n + 1);
    el.style.setProperty('--d', Math.min(n * .07, .5) + 's');
    el.classList.add('rv'); io.observe(el);
  });
}
const avatar = (m, name, cls = '') => {
  const photo = m?.data?.photo;
  const nm = name || m?.data?.name || '?';
  return `<div class="av ${cls}">${photo ? `<img src="${esc(photo)}" alt="" loading="lazy">` : esc(nm.trim().charAt(0).toUpperCase())}</div>`;
};
const photoTile = it => `<button class="ph" data-act="open-photo" data-id="${it.id}"><img src="${esc(it.data.url)}" alt="${esc(it.data.caption || 'Foto')}" loading="lazy"><div class="cap">${esc(it.data.caption || '')}<small>oleh ${esc(it.owner_name || '-')}</small></div></button>`;
const title = (t, sub = '', white = false, extra = '') => `<div class="st"><h2 class="${white ? 'w' : ''}">${t}</h2><i></i>${sub ? `<p>${sub}</p>` : ''}${extra}</div>`;

function applyTheme() {
  const s = setting(), r = document.documentElement.style;
  r.setProperty('--hero', cssUrl(s.hero || 'assets/hero.jpg'));
  r.setProperty('--about', cssUrl(s.aboutPhoto || 'assets/about.jpg'));
}

/* ===================== AUTH SCREEN ===================== */
function renderAuth(mode = 'login', err = '') {
  applyTheme();
  $('#app').innerHTML = `
  <div class="auth">
    <div class="auth-box">
      <div class="brand"><i>5A</i> Website 5,74 A</div>
      <h1>Welcome to <em>5,74 A</em></h1>
      <p class="muted" style="text-align:center;font-size:14px">Masuk dulu untuk melihat kenangan kelas.</p>
      <div class="seg"><button data-act="auth-tab" data-m="login" class="${mode === 'login' ? 'on' : ''}">Masuk</button><button data-act="auth-tab" data-m="register" class="${mode === 'register' ? 'on' : ''}">Daftar</button></div>
      <form data-form="auth" data-mode="${mode}">
        ${mode === 'register' ? '<label class="f">Nama</label><input name="name" required maxlength="40" placeholder="Nama kamu">' : ''}
        <label class="f">Email</label><input name="email" type="email" required placeholder="kamu@email.com" autocomplete="email">
        <label class="f">Password</label><input name="pw" type="password" required minlength="6" placeholder="Minimal 6 karakter" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}">
        <div class="err">${esc(err)}</div>
        <button class="btn">${mode === 'login' ? 'Masuk' : 'Buat Akun'}</button>
      </form>
      ${SB_MODE ? '' : '<p class="demo">⚠ Mode demo: data hanya tersimpan di browser ini. Akun pertama yang mendaftar otomatis jadi admin.</p>'}
    </div>
  </div>`;
}

/* ===================== SHELL ===================== */
const NAV = [['home', 'Home'], ['tentang', 'Tentang'], ['media', 'Media'], ['struktur', 'Struktur'], ['anggota', 'Anggota'], ['prestasi', 'Prestasi']];
function renderShell() {
  const nav = [...NAV, ...(isAdmin() ? [['admin', 'Admin']] : [])];
  $('#app').innerHTML = `
  <header class="top" id="top">
    <a class="brand" href="#home"><i>5A</i><span><span class="long">Website </span>5,74 A</span></a>
    <nav id="nav"><span class="nav-ind"></span>${nav.map(n => `<a href="#${n[0]}" data-nav="${n[0]}">${n[1]}</a>`).join('')}</nav>
    <div class="who"><div><b>${esc(S.user.name)}</b><small>${isAdmin() ? 'Admin' : 'Anggota'}</small></div>
      <button class="btn ghost sm" data-act="logout" title="Keluar" aria-label="Keluar">${ico('logout', 16)}</button></div>
    <button class="burger" data-act="menu" aria-label="Menu">${ico('menu', 22)}</button>
  </header>
  <main id="page"></main>`;
}

/* ===================== SECTIONS ===================== */
const chars = t => [...t].map((c, i) => c === ' ' ? '<span class="ch sp" aria-hidden="true"></span>' : `<span class="ch" aria-hidden="true" style="--i:${i}">${esc(c)}</span>`).join('');
function secHome() {
  const s = setting();
  return `<section class="hero" id="home" data-sec>
    <div class="hero-layers"><div class="hero-bg"></div><div class="orb a"></div><div class="orb b"></div><div class="hero-shade"></div><div class="hero-blur"></div></div>
    <div class="hero-in">
      <span class="pill">Official Website</span>
      <h1 aria-label="Welcome to 5,74 A"><span class="l1">${chars('Welcome to')}</span><span class="l2">${chars('5,74 A')}</span></h1>
      <p class="tag">${esc(s.tagline || 'Satu kelas, satu cerita, seribu kenangan.')}</p>
      <div class="cta"><a class="btn" href="#media">Lihat Kenangan</a><a class="btn ghost" href="#anggota">Kenalan dengan Kita</a></div>
    </div>
    <a class="cue" href="#tentang" aria-label="Turun">${ico('down', 30)}</a>
  </section>`;
}

function socUrlHandle(u) {
  try {
    const url = new URL(u), p = url.pathname.split('/').filter(Boolean);
    const h = p.find(x => x.startsWith('@')) || p[0];
    return h ? (h.startsWith('@') ? h : '@' + h) : url.hostname.replace(/^www\./, '');
  } catch (e) { return u; }
}
function secAbout() {
  const s = setting();
  const soc = [['ig', 'Instagram', 'instagram'], ['tt', 'TikTok', 'tiktok'], ['yt', 'YouTube', 'youtube']];
  const cards = soc.map(([k, nm, ic]) => {
    const u = safeUrl(s[k]), inner = `
      <span class="big">${ico(ic, 230, 1.2)}</span>
      <div class="top2"><div class="ic">${ico(ic, 30)}</div><span class="tagp">Official</span></div>
      <div><h3>${nm}</h3><div class="hd">${u ? esc(socUrlHandle(u)) : 'Belum diisi'}</div></div>
      <span class="go">${u ? 'Kunjungi →' : 'Segera hadir'}</span>`;
    return u ? `<a class="soc ${k}" href="${esc(u)}" target="_blank" rel="noopener">${inner}</a>` : `<div class="soc ${k} off">${inner}</div>`;
  }).join('');
  return `<section class="sec" id="tentang" data-sec>
    ${title('Tentang 5,74 A', `<span style="white-space:pre-line">${esc(s.about) || 'Selamat datang di rumah digital kelas 5,74 A. Tempat kita menyimpan cerita, tawa, dan prestasi bersama.'}</span>`)}
    <div class="about-photo"><div class="stats">
      <div><b data-n="${members().length || 32}">${members().length || 32}</b><span>Siswa</span></div>
      <div><b ${+s.boys ? `data-n="${+s.boys}"` : ''}>${esc(s.boys) || '–'}</b><span>Laki-laki</span></div>
      <div><b ${+s.girls ? `data-n="${+s.girls}"` : ''}>${esc(s.girls) || '–'}</b><span>Perempuan</span></div></div></div>
    <div style="height:84px"></div>
    ${title('Media Sosial', 'Cerita mengalir di Instagram, tawa berseliweran di TikTok, dan momen terbaik kita tersimpan di YouTube. Tiga ruang, satu perjalanan diri.')}
    <div class="car-wrap"><button class="car-nav l" data-act="car" data-dir="-1" aria-label="Sebelumnya">${ico('left', 20)}</button><div class="car" id="car">${cards}</div><button class="car-nav r" data-act="car" data-dir="1" aria-label="Berikutnya">${ico('right', 20)}</button></div>
  </section>`;
}

function secMedia() {
  const list = byKind('media').filter(i => !i.data.target && !i.data.album).reverse();
  return `<section class="sec" id="media" data-sec>
    ${title('Media Kenangan', 'Foto-foto seru kelas kita. Kamu hanya bisa menghapus foto yang kamu unggah sendiri.', false, `<div style="margin-top:22px"><button class="btn" data-act="upload-media">${ico('plus', 18)} Unggah Foto</button></div>`)}
    ${list.length ? `<div class="masonry">${list.map(photoTile).join('')}</div>` : '<div class="empty">Belum ada foto. Jadi yang pertama mengunggah kenangan!</div>'}
  </section>`;
}

function nodeHtml(key) {
  const r = roleItem(key), name = r?.data.name || '';
  return `<button class="node c-${roleClass(key)}" data-act="open-node" data-key="${key}"><span class="rl">${roleLabel(key)}</span><span class="nm ${name ? '' : 'none'}">${esc(name) || 'Belum diisi'}</span></button>`;
}
function secStruct() {
  return `<section class="sec" id="struktur" data-sec>
    ${title('Struktur Kelas', 'Ketuk salah satu nama untuk melihat foto-fotonya.', true)}
    <div class="tree">
      <div class="lvl">${nodeHtml('wali')}</div><div class="vline"></div>
      <div class="lvl two">${nodeHtml('ketua')}${nodeHtml('wakil')}</div>
      <div class="vline long"></div>
      <div class="groups">${GROUPS.map(g => `<div class="grp"><div class="pair">${nodeHtml(g[0])}${nodeHtml(g[1])}</div></div>`).join('')}</div>
    </div>
  </section>`;
}

/* ----- anggota + pagination ----- */
const PER = 8; let mPage = 1, searchQ = '';
const memberCard = ({ m, n }) => `<button class="card mem" data-act="open-member" data-id="${m.id}">${avatar(m, m.data.name)}<div class="no">No. ${String(n).padStart(2, '0')}</div><h3>${esc(m.data.name)}</h3><div class="hd">${handleOf(m) ? '@' + esc(handleOf(m)) : ''}</div></button>`;
function mWrap() {
  if (!members().length) return `<div class="empty">Belum ada data anggota.${isAdmin() ? '<br><br><button class="btn" data-act="make-slots">Buat 32 slot anggota</button>' : '<br>Admin perlu membuat daftar anggota dulu.'}</div>`;
  const q = searchQ.toLowerCase();
  const all = members().map((m, i) => ({ m, n: i + 1 })).filter(x => x.m.data.name.toLowerCase().includes(q) || handleOf(x.m).toLowerCase().includes(q));
  if (!all.length) return '<div class="empty">Tidak ditemukan.</div>';
  const pages = Math.ceil(all.length / PER); if (mPage > pages) mPage = pages; if (mPage < 1) mPage = 1;
  const pager = pages > 1 ? `<div class="pg"><button data-act="mpage" data-p="${mPage - 1}" ${mPage <= 1 ? 'disabled' : ''}>Prev</button>${Array.from({ length: pages }, (_, i) => `<button class="${i + 1 === mPage ? 'on' : ''}" data-act="mpage" data-p="${i + 1}">${i + 1}</button>`).join('')}<button data-act="mpage" data-p="${mPage + 1}" ${mPage >= pages ? 'disabled' : ''}>Next</button></div>` : '';
  return `<div class="grid">${all.slice((mPage - 1) * PER, mPage * PER).map(memberCard).join('')}</div>${pager}`;
}
function secMembers() {
  return `<section class="sec" id="anggota" data-sec>
    ${title('Anggota Kelas', 'Temukan daftar lengkap anggota kelas kami di sini. Ketuk kartu untuk melihat profil, riwayat lomba, dan prestasinya.', true)}
    ${members().length ? `<input class="search" id="msearch" placeholder="Cari nama…" value="${esc(searchQ)}">` : ''}
    <div id="mwrap">${mWrap()}</div>
  </section>`;
}

function achCard(it) {
  return `<article class="card ach-card"><button class="ph" data-act="open-photo" data-id="${it.id}"><img src="${esc(it.data.url)}" alt="" loading="lazy"></button>
    <div class="body"><div class="who2">Prestasi ${esc(it.data.memberName)}</div><h3>${esc(it.data.title)}</h3>
    <p>${[it.data.rank, it.data.year].filter(Boolean).map(esc).join(' • ')}</p>${it.data.desc ? `<p style="margin-top:6px">${esc(it.data.desc)}</p>` : ''}
    ${canDelete(it) ? `<button class="btn danger sm" style="margin-top:12px" data-act="del" data-id="${it.id}">${ico('trash', 14)} Hapus</button>` : ''}</div></article>`;
}
function secAch() {
  const list = byKind('achievement').reverse();
  return `<section class="sec" id="prestasi" data-sec>
    ${title('Prestasi Kelas', 'Unggah prestasimu. Otomatis masuk ke profil anggota yang dipilih.', false, `<div style="margin-top:22px"><button class="btn" data-act="add-ach">${ico('plus', 18)} Tambah Prestasi</button></div>`)}
    ${list.length ? `<div class="grid ach">${list.map(achCard).join('')}</div>` : '<div class="empty">Belum ada prestasi yang diunggah.</div>'}
  </section>`;
}

async function secAdmin() {
  const s = setting(), ms = members();
  let profs = []; try { profs = await Store.profiles(); } catch (e) { }
  return `<section class="sec" id="admin" data-sec>
    ${title('Panel Admin', 'Atur isi website, daftar anggota, dan pengguna.', true)}
    <div class="admin-grid">
      <div class="card"><h3>Info Website</h3>
        <form data-form="settings">
          <label class="f">Deskripsi kelas</label><textarea name="about" placeholder="Ceritakan tentang kelas…">${esc(s.about)}</textarea>
          <label class="f">Kalimat di halaman depan</label><input name="tagline" maxlength="120" value="${esc(s.tagline)}" placeholder="Satu kelas, satu cerita, seribu kenangan.">
          <div class="f2"><div><label class="f">Jumlah laki-laki</label><input name="boys" type="number" min="0" value="${esc(s.boys)}"></div><div><label class="f">Jumlah perempuan</label><input name="girls" type="number" min="0" value="${esc(s.girls)}"></div></div>
          <label class="f">Instagram (link)</label><input name="ig" value="${esc(s.ig)}" placeholder="https://instagram.com/...">
          <label class="f">TikTok (link)</label><input name="tt" value="${esc(s.tt)}" placeholder="https://tiktok.com/@...">
          <label class="f">YouTube (link)</label><input name="yt" value="${esc(s.yt)}" placeholder="https://youtube.com/@...">
          <label class="f">Foto latar halaman depan</label>
          <label class="drop"><input type="file" name="hero" accept="image/*"><span>${s.hero ? 'Ganti foto latar' : 'Pilih foto latar'}</span></label>
          <label class="f">Foto kelas (bagian Tentang)</label>
          <label class="drop"><input type="file" name="aboutPhoto" accept="image/*"><span>${s.aboutPhoto ? 'Ganti foto kelas' : 'Pilih foto kelas'}</span></label>
          <button class="btn">Simpan</button>
        </form></div>
      <div class="card"><h3>Daftar Anggota (${ms.length})</h3>
        <form data-form="bulk"><label class="f">Tempel daftar nama (1 nama per baris)</label>
          <textarea name="list" placeholder="Nama anak 1&#10;Nama anak 2&#10;…" style="min-height:110px"></textarea><button class="btn sm">${ms.length ? 'Perbarui nama sesuai urutan' : 'Buat daftar anggota'}</button></form>
        ${ms.length ? `<label class="f" style="margin-top:22px">Edit satu per satu (nama & username)</label><form data-form="names"><div class="rows">${ms.map((m, i) => `<div class="row"><span class="n">${i + 1}</span><input name="n_${m.id}" value="${esc(m.data.name)}" maxlength="40" placeholder="Nama"><input name="h_${m.id}" value="${esc(handleOf(m))}" maxlength="30" placeholder="username" style="max-width:140px"></div>`).join('')}</div><button class="btn sm">Simpan</button></form>` : ''}
      </div>
      <div class="card"><h3>Pengguna (${profs.length})</h3><p class="muted" style="margin:4px 0 12px">Jadikan teman sebagai admin, atau cabut aksesnya.</p>
        <div class="rows">${profs.map(p => `<div class="urow"><div><b style="font-size:14px">${esc(p.name || p.email)}</b><div class="muted" style="font-size:12px">${esc(p.email || '')} · ${p.role === 'admin' ? 'Admin' : 'Anggota'}</div></div>
          ${p.id === S.user.id ? '<span class="badge">Kamu</span>' : `<button class="btn ghost sm" data-act="toggle-role" data-id="${p.id}" data-role="${p.role === 'admin' ? 'member' : 'admin'}">${p.role === 'admin' ? 'Cabut admin' : 'Jadikan admin'}</button>`}</div>`).join('') || '<p class="muted">Tidak ada data.</p>'}</div></div>
    </div></section>`;
}

/* skeleton saat data diambil dari server */
function skeletonPage() {
  return `<div class="sk-boot" style="min-height:100svh;margin-top:-70px" aria-hidden="true"><div class="sk-hero" style="padding-top:150px">
    <span class="sk sk-pill"></span><span class="sk sk-h1"></span><span class="sk sk-h1 s"></span><span class="sk sk-p"></span>
    <div class="sk-btns"><span class="sk sk-btn"></span><span class="sk sk-btn"></span></div></div></div>
    <div class="sk-sec" aria-hidden="true"><span class="sk t"></span><span class="sk b"></span><div class="g"><span class="sk"></span><span class="sk"></span><span class="sk"></span><span class="sk"></span></div></div>`;
}
async function renderAll(animate = true) {
  applyTheme();
  const admin = isAdmin() ? await secAdmin() : '';
  const page = $('#page'); if (!page) return;
  page.classList.toggle('still', !animate);
  page.innerHTML = secHome() + secAbout() + secMedia() + secStruct() + secMembers() + secAch() + admin + '<footer class="foot">Website 5,74 A · dibuat bersama untuk kenangan kita</footer>';
  markLoaded(page);
  if (animate) prepReveal(page);
  spy(true);
}
// lompat ke posisi tanpa animasi (aman untuk Safari lama yang belum mengenal behavior:'instant')
function jumpTo(y) { const h = document.documentElement, old = h.style.scrollBehavior; h.style.scrollBehavior = 'auto'; window.scrollTo(0, y); h.style.scrollBehavior = old; }
async function refreshPage() { const y = window.scrollY; await renderAll(false); jumpTo(y); }
function updateMembers() { const w = $('#mwrap'); if (!w) return; w.innerHTML = mWrap(); markLoaded(w); prepReveal(w); }

/* ---------- scroll: navbar, scrollspy, parallax hero ---------- */
function moveInd(cur) {
  const nav = $('#nav'), ind = $('.nav-ind'), a = nav && $(`[data-nav="${cur}"]`, nav);
  if (!ind) return;
  if (!a || window.innerWidth <= 900) { ind.style.opacity = 0; return; }
  ind.style.opacity = 1; ind.style.left = (a.offsetLeft - 10) + 'px'; ind.style.width = (a.offsetWidth + 20) + 'px';
}
function spy(force) {
  const top = $('#top'); if (!top) return;
  const y = window.scrollY;
  top.classList.toggle('solid', y > 40);
  let cur = 'home';
  for (const s of $$('section[data-sec]')) if (s.getBoundingClientRect().top <= 160) cur = s.id;
  if (cur !== spy.cur || force) {
    spy.cur = cur;
    $$('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === cur));
    moveInd(cur);
  }
  const bg = $('.hero-bg');
  if (bg && y < window.innerHeight * 1.3) {
    bg.style.setProperty('--py', (y * .28).toFixed(1));
    $('.hero-in')?.style.setProperty('--sp', Math.min(1, y / (window.innerHeight * .75)).toFixed(3));
  }
}
window.addEventListener('scroll', () => { if (!spy.t) spy.t = requestAnimationFrame(() => { spy.t = 0; spy(); }); }, { passive: true });
window.addEventListener('resize', () => moveInd(spy.cur));
document.fonts?.ready.then(() => moveInd(spy.cur));

/* ---------- efek liquid glass: kilau mengikuti kursor + ripple tombol ---------- */
document.addEventListener('pointermove', e => {
  const g = e.target.closest?.('.card,.soc'); if (!g) return;
  const r = g.getBoundingClientRect();
  g.style.setProperty('--mx', (e.clientX - r.left) + 'px'); g.style.setProperty('--my', (e.clientY - r.top) + 'px');
}, { passive: true });
document.addEventListener('pointerdown', e => {
  const b = e.target.closest?.('.btn'); if (!b || b.disabled) return;
  const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height) * 2, sp = document.createElement('span');
  sp.className = 'ripple'; sp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
  b.appendChild(sp); setTimeout(() => sp.remove(), 750);
});

/* ===================== MODALS ===================== */
function openPhoto(id) {
  const it = S.items.find(i => i.id === id); if (!it) return;
  const cap = it.kind === 'achievement' ? `Prestasi ${it.data.memberName}: ${it.data.title}` : it.data.caption;
  openModal(`<div class="lightbox"><div class="lb-img"><img src="${esc(it.data.url)}" alt=""></div>
    <div class="lb-meta"><div><b>${esc(cap || 'Foto')}</b><div class="muted" style="font-size:13px">Diunggah oleh ${esc(it.owner_name || '-')} · ${fmtDate(it.created_at)}</div></div>
    ${canDelete(it) ? `<button class="btn danger sm" data-act="del" data-id="${it.id}">${ico('trash', 14)} Hapus</button>` : ''}</div></div>`, 'wide', true);
}

function uploadModal(target, album) {
  const dest = album ? 'album ' + esc(memberById(album)?.data.name || 'anak ini') : target ? 'galeri ' + esc(roleLabel(target)) : 'galeri kelas';
  openModal(`<h3>Unggah Foto</h3><p class="muted">Foto akan masuk ke ${dest}. Bisa pilih banyak sekaligus.</p>
  <form data-form="media" data-target="${target || ''}" data-album="${album || ''}">
    <label class="drop" style="margin-top:16px"><input type="file" name="files" accept="image/*" multiple required><span>Ketuk untuk memilih foto…</span></label>
    <label class="f">Keterangan (opsional)</label><input name="caption" maxlength="120" placeholder="Misal: Study tour 2026">
    <button class="btn">Unggah</button></form>`);
}

function openNode(key) {
  const r = roleItem(key), m = r?.data.memberId ? memberById(r.data.memberId) : null, name = r?.data.name || '';
  const photos = byKind('media').filter(i => i.data.target === key).reverse();
  openModal(`<div class="mhead">${avatar(m, name || roleLabel(key), 'lg')}<div><span class="badge">${roleLabel(key)}</span><h3 style="margin-top:8px">${esc(name) || 'Belum diisi'}</h3>
      ${m ? `<button class="btn ghost sm" style="margin-top:8px" data-act="open-member" data-id="${m.id}">Lihat profil</button>` : ''}</div></div>
    ${isAdmin() ? `<form data-form="role" data-key="${key}" class="row"><input name="name" list="mlist" value="${esc(name)}" placeholder="Nama (pilih dari anggota atau ketik)" required>
      <datalist id="mlist">${members().map(x => `<option value="${esc(x.data.name)}">`).join('')}</datalist><button class="btn sm" style="margin:0;flex-shrink:0">Simpan</button></form>` : ''}
    <div class="sec2"><h4>Foto ${esc(name || roleLabel(key))}</h4><button class="btn sm" data-act="upload-node" data-key="${key}">${ico('plus', 14)} Tambah</button></div>
    ${photos.length ? `<div class="mini">${photos.map(photoTile).join('')}</div>` : '<div class="empty" style="margin-top:12px;padding:30px">Belum ada foto.</div>'}`, 'wide');
}

function openMember(id) {
  const m = memberById(id); if (!m) return;
  const idx = members().indexOf(m) + 1;
  const achs = byKind('achievement').filter(a => a.data.memberId === id).reverse();
  const roles = byKind('role').filter(r => r.data.memberId === id).map(r => roleLabel(r.data.key));
  const album = byKind('media').filter(i => i.data.album === id).reverse();
  openModal(`<div class="mhead">${avatar(m, m.data.name, 'lg')}<div><span class="badge">No. ${String(idx).padStart(2, '0')}</span>${roles.map(r => ` <span class="badge">${esc(r)}</span>`).join('')}
      <h3 style="margin-top:8px;font-size:26px">${esc(m.data.name)}</h3>
      ${handleOf(m) ? `<div class="hdl">@${esc(handleOf(m))}</div>` : ''}
      <p class="muted" style="font-size:14px;margin-top:4px">${esc(m.data.bio) || 'Belum ada bio.'}</p>
      ${isAdmin() ? `<button class="btn ghost sm" style="margin-top:10px" data-act="edit-member" data-id="${id}">${ico('edit', 14)} Edit profil</button>` : ''}</div></div>
    <div class="sec2"><h4>Riwayat lomba & prestasi (${achs.length})</h4><button class="btn sm" data-act="add-ach" data-id="${id}">${ico('plus', 14)} Tambah</button></div>
    ${achs.length ? `<ul class="hist">${achs.map(a => `<li><button data-act="open-photo" data-id="${a.id}"><img src="${esc(a.data.url)}" alt=""></button><div style="flex:1"><b>${esc(a.data.title)}</b><span>${[a.data.rank, a.data.year].filter(Boolean).map(esc).join(' • ') || '—'}</span></div>
      ${canDelete(a) ? `<button class="btn danger sm" data-act="del" data-id="${a.id}" title="Hapus">${ico('trash', 14)}</button>` : ''}</li>`).join('')}</ul>` : '<div class="empty" style="margin-top:12px;padding:28px">Belum ada prestasi tercatat.</div>'}
    <div class="sec2"><h4>Album foto ${esc(m.data.name.split(' ')[0])} (${album.length})</h4><button class="btn sm" data-act="upload-album" data-id="${id}">${ico('plus', 14)} Tambah foto</button></div>
    ${album.length ? `<div class="mini">${album.map(photoTile).join('')}</div>` : '<div class="empty" style="margin-top:12px;padding:28px">Album masih kosong. Tambahkan foto kenangan bersama dia!</div>'}`, 'wide');
}

function editMember(id) {
  const m = memberById(id);
  openModal(`<h3>Edit Profil</h3><form data-form="member" data-id="${id}">
    <label class="f">Nama</label><input name="name" required maxlength="40" value="${esc(m.data.name)}">
    <label class="f">Username (opsional)</label><input name="handle" maxlength="30" value="${esc(handleOf(m))}" placeholder="tanpa @">
    <label class="f">Bio singkat</label><textarea name="bio" maxlength="300">${esc(m.data.bio)}</textarea>
    <label class="f">Foto profil</label><label class="drop"><input type="file" name="photo" accept="image/*"><span>${m.data.photo ? 'Ganti foto' : 'Pilih foto'}</span></label>
    <button class="btn">Simpan</button></form>`);
}

function addAchModal(memberId) {
  const ms = members();
  if (!ms.length) return toast('Admin perlu membuat daftar anggota dulu.');
  const year = new Date().getFullYear();
  openModal(`<h3>Tambah Prestasi</h3><p class="muted">Akan tampil di bagian Prestasi dan di profil anggota terpilih.</p>
  <form data-form="ach">
    <label class="f">Prestasi siapa?</label><select name="member" required><option value="">— pilih nama —</option>${ms.map(m => `<option value="${m.id}" ${m.id === memberId ? 'selected' : ''}>${esc(m.data.name)}</option>`).join('')}</select>
    <label class="f">Nama lomba / prestasi</label><input name="title" required maxlength="100" placeholder="Misal: Olimpiade Sains Tingkat Kota">
    <div style="display:grid;grid-template-columns:2fr 1fr;gap:10px"><div><label class="f">Juara / peringkat</label><input name="rank" maxlength="40" placeholder="Juara 1"></div><div><label class="f">Tahun</label><input name="year" type="number" min="2000" max="2100" value="${year}"></div></div>
    <label class="f">Keterangan (opsional)</label><textarea name="desc" maxlength="300"></textarea>
    <label class="f">Foto</label><label class="drop"><input type="file" name="photo" accept="image/*" required><span>Ketuk untuk memilih foto…</span></label>
    <button class="btn">Unggah Prestasi</button></form>`);
}

async function enter() {
  renderShell();
  $('#page').innerHTML = skeletonPage();
  try { S.items = await Store.list(); S.sig = JSON.stringify(S.items); } catch (e) { toast(e.message); S.items = []; }
  await renderAll(true);
  const h = location.hash;
  if (h && h.length > 1) { try { document.querySelector(h)?.scrollIntoView(); } catch (e) { } }
  spy(true);
  startSync();
  setTimeout(maybeOfferInstall, 2200);
}

/* ---------- sinkronisasi antar perangkat ---------- */
let syncStarted = false, syncBusy = false;
async function syncNow() {
  if (!S.user || syncBusy || document.hidden) return;
  const ae = document.activeElement;
  if ($('.mb') || $('.is-load') || (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName))) return;   // jangan ganggu yang sedang mengetik / mengunggah / membuka foto
  syncBusy = true;
  try {
    const items = await Store.list(), sig = JSON.stringify(items);
    if (sig !== S.sig) { S.items = items; S.sig = sig; await refreshPage(); }
  } catch (e) { /* offline: coba lagi nanti */ }
  syncBusy = false;
}
function startSync() {
  if (syncStarted) return; syncStarted = true;
  let t; const soon = () => { clearTimeout(t); t = setTimeout(syncNow, 600); };
  Store.subscribe?.(soon);
  setInterval(syncNow, 25000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) syncNow(); });
  window.addEventListener('online', syncNow);
  window.addEventListener('focus', syncNow);
}

/* ===================== EVENTS ===================== */
document.addEventListener('click', async e => {
  if (e.target.closest('#nav a') || !e.target.closest('#top')) $('#top')?.classList.remove('open');
  const el = e.target.closest('[data-act]'); if (!el) return;
  const { act, id, key, m } = el.dataset;
  switch (act) {
    case 'close': closeModal(); break;
    case 'reload': location.reload(); break;
    case 'install': if (deferredPrompt) { deferredPrompt.prompt(); const r = await deferredPrompt.userChoice.catch(() => ({})); deferredPrompt = null; hideInstall(); if (r.outcome !== 'accepted') snoozeInstall(); } break;
    case 'install-no': snoozeInstall(); hideInstall(); break;
    case 'demo': try { sessionStorage.setItem('a574_demo', '1'); } catch (e) { } boot(); break;
    case 'menu': $('#top').classList.toggle('open'); break;
    case 'car': $('#car')?.scrollBy({ left: +el.dataset.dir * 354, behavior: 'smooth' }); break;
    case 'mpage': mPage = +el.dataset.p; updateMembers(); $('#anggota')?.scrollIntoView(); break;
    case 'auth-tab': renderAuth(m); break;
    case 'logout': await Store.signOut(); S.user = null; S.items = []; closeAll(); $('#install')?.remove(); renderAuth(); break;
    case 'upload-media': uploadModal(); break;
    case 'upload-node': uploadModal(key); break;
    case 'upload-album': uploadModal(null, id); break;
    case 'open-photo': openPhoto(id); break;
    case 'open-node': openNode(key); break;
    case 'open-member': openMember(id); break;
    case 'edit-member': editMember(id); break;
    case 'add-ach': addAchModal(id); break;
    case 'del': await busy(el, async () => {
      const it = S.items.find(i => i.id === id), tgt = it?.data.target, alb = it?.data.album, mid = it?.data.memberId;
      if (await delItem(id)) {
        toast('Dihapus');
        if (tgt) openNode(tgt); else if (alb) openMember(alb); else if (mid && $('.mb .hist')) openMember(mid); else closeAll();
        await refreshPage();
      }
    }); break;
    case 'make-slots': await busy(el, async () => {
      for (let i = 1; i <= 32; i++) await addItem('member', { name: 'Anggota ' + i, bio: '', photo: '', handle: '' });
      toast('32 slot anggota dibuat. Ubah namanya di Panel Admin.'); await refreshPage();
    }); break;
    case 'toggle-role': await busy(el, async () => { await Store.setRole(id, el.dataset.role); toast('Peran diperbarui'); await refreshPage(); }); break;
  }
});

document.addEventListener('change', e => {
  if (e.target.type === 'file') {
    const span = e.target.closest('.drop')?.querySelector('span');
    const n = e.target.files.length;
    if (span && n) span.textContent = n > 1 ? `${n} foto dipilih` : e.target.files[0].name;
  }
});
document.addEventListener('input', e => {
  if (e.target.id === 'msearch') { searchQ = e.target.value; mPage = 1; updateMembers(); }
});

document.addEventListener('submit', async e => {
  const f = e.target.closest('form[data-form]'); if (!f) return;
  e.preventDefault();
  const type = f.dataset.form, fd = new FormData(f), btn = f.querySelector('button.btn:last-of-type') || f.querySelector('button');

  if (type === 'auth') {
    const mode = f.dataset.mode;
    await busy(btn, async () => {
      try {
        S.user = mode === 'login' ? await Store.signIn(fd.get('email'), fd.get('pw')) : await Store.signUp(fd.get('name').trim(), fd.get('email'), fd.get('pw'));
        await enter();
      } catch (er) { renderAuth(mode, er.message); }
    });
    return;
  }

  await busy(btn, async () => {
    if (type === 'media') {
      const target = f.dataset.target || null, album = f.dataset.album || null, files = [...f.files.files], caption = (fd.get('caption') || '').trim();
      let n = 0;
      for (const file of files) {
        const up = await Store.upload(file, S.user);
        await addItem('media', { url: up.url, path: up.path, caption, ...(target ? { target } : {}), ...(album ? { album } : {}) });
        n++;
      }
      toast(`${n} foto berhasil diunggah`);
      if (target) openNode(target); else if (album) openMember(album); else closeModal();
      await refreshPage();
    }
    if (type === 'ach') {
      const mem = memberById(fd.get('member'));
      const up = await Store.upload(fd.get('photo'), S.user);
      await addItem('achievement', { url: up.url, path: up.path, title: fd.get('title').trim(), rank: fd.get('rank').trim(), year: fd.get('year'), desc: fd.get('desc').trim(), memberId: mem.id, memberName: mem.data.name });
      toast('Prestasi berhasil diunggah'); closeModal(); await refreshPage();
    }
    if (type === 'member') {
      const id = f.dataset.id, m = memberById(id);
      const data = { ...m.data, name: fd.get('name').trim(), handle: fd.get('handle').trim().replace(/^@/, ''), bio: fd.get('bio').trim() };
      const file = fd.get('photo');
      if (file && file.size) { const up = await Store.upload(file, S.user); await Store.removeFile(m.data.photoPath); data.photo = up.url; data.photoPath = up.path; }
      await renameMember(id, data);
      toast('Profil disimpan'); openMember(id); await refreshPage();
    }
    if (type === 'names') {
      for (const m of members()) {
        const nm = (fd.get('n_' + m.id) || '').trim(), hd = (fd.get('h_' + m.id) || '').trim().replace(/^@/, '');
        if (nm && (nm !== m.data.name || hd !== handleOf(m))) await renameMember(m.id, { ...m.data, name: nm, handle: hd });
      }
      toast('Data anggota disimpan'); await refreshPage();
    }
    if (type === 'bulk') {
      const lines = (fd.get('list') || '').split('\n').map(x => x.trim()).filter(Boolean);
      if (!lines.length) throw new Error('Tulis minimal satu nama');
      for (let i = 0; i < lines.length; i++) {
        const ex = members()[i];
        if (ex) { if (ex.data.name !== lines[i]) await renameMember(ex.id, { ...ex.data, name: lines[i] }); }
        else await addItem('member', { name: lines[i], bio: '', photo: '', handle: '' });
      }
      toast(`${lines.length} nama tersimpan`); await refreshPage();
    }
    if (type === 'role') {
      const key = f.dataset.key, name = fd.get('name').trim();
      const mem = members().find(x => x.data.name.toLowerCase() === name.toLowerCase());
      const data = { key, name: mem ? mem.data.name : name, memberId: mem ? mem.id : null };
      const ex = roleItem(key);
      if (ex) await updItem(ex.id, data); else await addItem('role', data);
      toast('Struktur diperbarui'); openNode(key); await refreshPage();
    }
    if (type === 'settings') {
      const old = setting(), data = { ...old };
      ['about', 'tagline', 'boys', 'girls', 'ig', 'tt', 'yt'].forEach(k => data[k] = (fd.get(k) || '').toString().trim());
      for (const [field, pk] of [['hero', 'heroPath'], ['aboutPhoto', 'aboutPath']]) {
        const file = fd.get(field);
        if (file && file.size) { const up = await Store.upload(file, S.user, true); await Store.removeFile(old[pk]); data[field] = up.url; data[pk] = up.path || ''; }
      }
      const ex = byKind('setting')[0];
      if (ex) await updItem(ex.id, data); else await addItem('setting', data);
      toast('Pengaturan disimpan'); await refreshPage();
    }
  });
});

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
window.addEventListener('hashchange', closeAll);

/* ===================== BOOT ===================== */
/* ---------- pasang sebagai aplikasi (PWA) ---------- */
let deferredPrompt = null;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isPhone = () => matchMedia('(max-width:900px)').matches && matchMedia('(pointer:coarse)').matches;
const installSnoozed = () => { try { const t = +localStorage.getItem('a574_pwa_no'); return !!t && Date.now() - t < 7 * 864e5; } catch (e) { return false; } };
function snoozeInstall() { try { localStorage.setItem('a574_pwa_no', String(Date.now())); } catch (e) { } }
function hideInstall() { const el = $('#install'); if (!el) return; el.classList.add('out'); setTimeout(() => el.remove(), 380); }
function maybeOfferInstall() {
  if (!S.user || $('#install') || isStandalone() || !isPhone() || installSnoozed()) return;
  const ios = isIOS(); if (!deferredPrompt && !ios) return;
  const el = document.createElement('div'); el.id = 'install'; el.className = 'install';
  el.innerHTML = `<img src="icons/icon-192.png" alt=""><div class="tx"><b>Pasang aplikasi 5,74 A?</b><p>${ios ? 'Ketuk tombol <b>Bagikan</b> di Safari, lalu pilih <b>Tambah ke Layar Utama</b>.' : 'Buka lebih cepat dari layar utama HP, tampil layar penuh seperti aplikasi.'}</p></div>
    <div class="acts"><button class="btn ghost sm" data-act="install-no">${ios ? 'Mengerti' : 'Nanti'}</button>${ios ? '' : '<button class="btn sm" data-act="install">Pasang</button>'}</div>`;
  document.body.appendChild(el);
}
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; setTimeout(maybeOfferInstall, 1200); });
window.addEventListener('appinstalled', () => { deferredPrompt = null; hideInstall(); toast('Aplikasi terpasang'); });
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));

const isLocalHost = location.protocol === 'file:' || /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname);
const hasCfg = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
const demoOk = () => { try { return sessionStorage.getItem('a574_demo') === '1'; } catch (e) { return false; } };

function renderSetup(reason) {
  applyTheme();
  const lib = reason === 'lib';
  $('#app').innerHTML = `
  <div class="auth"><div class="auth-box" style="width:min(580px,100%)">
    <div class="brand"><i>5A</i> Website 5,74 A</div>
    <h1 style="font-size:24px;margin-top:18px">${lib ? 'Library database gagal dimuat' : 'Satu langkah lagi: sambungkan database'}</h1>
    ${lib ? `<p class="muted" style="margin-top:10px;font-size:14px">Koneksi internet mungkin terputus atau diblokir. Coba muat ulang halaman ini.</p>
      <button class="btn" style="margin-top:18px" data-act="reload">Muat ulang</button>` : `
    <p class="muted" style="margin-top:10px;font-size:14px;line-height:1.7">Website sudah online, tapi <b style="color:#fff">belum tersambung ke database</b>. Tanpa database, foto dan data hanya tersimpan di browser masing-masing, jadi yang kamu simpan di HP <b style="color:#fff">tidak akan muncul di laptop</b> (dan sebaliknya).</p>
    <ol style="margin:16px 0 0 20px;font-size:14px;line-height:1.9;color:var(--desc)">
      <li>Buat project gratis di <b style="color:var(--cyan)">supabase.com</b></li>
      <li>SQL Editor → tempel isi <b style="color:#fff">supabase.sql</b> → Run</li>
      <li>Authentication → Email → matikan <b style="color:#fff">Confirm email</b></li>
      <li>Isi <b style="color:#fff">SUPABASE_URL</b> &amp; <b style="color:#fff">SUPABASE_ANON_KEY</b> di file <b style="color:#fff">config.js</b>, lalu commit ke GitHub</li>
      <li>Vercel akan deploy ulang otomatis. Selesai.</li>
    </ol>
    <button class="btn ghost sm" style="margin-top:20px;width:100%" data-act="demo">Lanjut mode demo (data tidak tersinkron)</button>`}
  </div></div>`;
}

async function boot() {
  if (hasCfg && !window.supabase) return renderSetup('lib');
  if (!SB_MODE && !isLocalHost && !demoOk()) return renderSetup('cfg');
  try { S.user = await Store.init(); } catch (e) { console.error(e); S.user = null; }
  if (S.user) await enter(); else renderAuth();
}
boot();
