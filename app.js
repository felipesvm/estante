(() => {
'use strict';
/* ================= utilidades ================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const ls = {
  get(k, d) { try { const v = localStorage.getItem('estante:' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('estante:' + k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem('estante:' + k); } catch {} }
};
const fmtSize = b => !b ? '—' : b >= 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB';
const fmtDate = t => t ? new Date(t).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const pct = p => Math.round((p || 0) * 100) + '%';
function ago(t) {
  if (!t) return '';
  const d0 = new Date(); d0.setHours(0,0,0,0);
  const diff = Math.round((d0.getTime() - new Date(new Date(t).setHours(0,0,0,0)).getTime()) / 864e5);
  if (diff <= 0) return 'hoje'; if (diff === 1) return 'ontem'; if (diff < 30) return `há ${diff} dias`;
  return fmtDate(t);
}
const MIME = { pdf: 'application/pdf', epub: 'application/epub+zip' };
const MK = { y: '#F2CF4A', g: '#9ED6A8', p: '#F2AEC6', b: '#A7CBEE' };
const STATUS = { quero: 'Quero ler', lendo: 'Lendo', lido: 'Lido' };
const BINDINGS = ['#2C5A4B','#6A3434','#2E486A','#5E4B2A','#4A3A5E','#2F5A5E','#7A4F2C','#38443B','#5B2F4A','#3D4F2B'];
const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,600;1,7..72,400&display=swap';

const I = {
  home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5L12 4l8 6.5V20h-5v-6H9v6H4z"/></svg>',
  open:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5.5c3-1 6-1 9 1 3-2 6-2 9-1V19c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6.5V20"/></svg>',
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.4 4.8-5"/></svg>',
  star:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>',
  starO:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/></svg>',
  shelf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4v15M9 4v15M13.5 5.5l3.8 13.6M3 20h18"/></svg>',
  mark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4.5l5 5L10 19H5v-5z"/><path d="M4 21h16"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1-3.6 3.8-5.5 7-5.5s6 1.9 7 5.5"/></svg>',
  tag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><path d="M3.5 12.5V4.5h8l9 9-8 8z"/><circle cx="8" cy="9" r="1.3"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>',
  dots:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="6" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18" cy="12" r="1.7"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  upload:'<svg class="big" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 8h12a5 5 0 0 1 5 5v27a4 4 0 0 0-4-4H9z"/><path d="M39 8H27a5 5 0 0 0-5 5"/><path d="M39 8v18M33 30l6-6 6 6M39 24v16"/></svg>',
  logo:'<svg class="logo" viewBox="0 0 34 34" fill="none"><rect x="5" y="6" width="6" height="22" rx="1.2" fill="currentColor"/><rect x="12.5" y="9" width="5" height="19" rx="1.2" fill="currentColor" opacity=".55"/><rect x="19.5" y="7.5" width="5.5" height="21" rx="1.2" transform="rotate(-12 22 18)" fill="currentColor" opacity=".8"/><path d="M3 29.5h28" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};

/* ================= estado ================= */
const S = {
  mode: 'local', ready: false, idb: null, db: null, col: null, assets: null, uid: null, usage: null,
  books: new Map(), hls: new Map(), pending: new Set(),
  v: { view: ls.get('view', 'home'), status: null, author: null, tag: null, q: '', sort: ls.get('sort', 'recent'), group: ls.get('group', 'none'), hq: '', hbook: '' }
};
if (!['home','books','authors','tags','highlights'].includes(S.v.view)) S.v.view = 'home';
const rset = Object.assign({ theme: 'auto', fontSize: 100, lineHeight: 1.6, font: 'literata', flow: 'paginated', pdfZoom: 1 }, ls.get('rset', {}));
const saveRset = () => ls.set('rset', rset);

/* ================= IndexedDB (cache neste aparelho) ================= */
function idbOpen() {
  return new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error('sem indexeddb'));
    const r = indexedDB.open('estante-leitura', 1);
    r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('meta', { keyPath: 'id' }); d.createObjectStore('files'); d.createObjectStore('kv'); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
}
function idb(store, mode, fn) {
  return new Promise((res, rej) => {
    if (!S.idb) return rej(new Error('sem armazenamento local'));
    let req;
    try {
      const tx = S.idb.transaction(store, mode); req = fn(tx.objectStore(store));
      tx.oncomplete = () => res(req ? req.result : undefined); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error);
    } catch (e) { rej(e); }
  });
}
const idbGet = (s, k) => idb(s, 'readonly', st => st.get(k));
const idbAll = s => idb(s, 'readonly', st => st.getAll());
const idbPut = (s, v, k) => idb(s, 'readwrite', st => k === undefined ? st.put(v) : st.put(v, k));
const idbDel = (s, k) => idb(s, 'readwrite', st => st.delete(k));

/* ================= persistência ================= */
const clean = o => JSON.parse(JSON.stringify(o));
const writers = new Map();
function persist(id) {
  S.pending.add(id);
  let w = writers.get(id);
  if (!w) { w = { running: false, dirty: false }; writers.set(id, w); }
  w.dirty = true;
  if (!w.running) runWriter(id, w);
}
async function runWriter(id, w) {
  w.running = true;
  let retried = false;
  try {
    while (w.dirty) {
      w.dirty = false;
      const obj = S.books.get(id) || S.hls.get(id);
      try {
        if (S.mode === 'cloud') { obj ? await S.col.doc(id).set(clean(obj)) : await S.col.doc(id).delete(); }
        else { obj ? await idbPut('meta', clean(obj)) : await idbDel('meta', id); }
      } catch (e) {
        if (e && e.code === 'unavailable' && !retried) { retried = true; await sleep(700 + Math.random() * 900); w.dirty = true; }
        else reportErr(e);
      }
    }
  } finally { w.running = false; S.pending.delete(id); }
}
function reportErr(e) {
  console.warn(e);
  const c = e && e.code;
  if (c === 'quota_exceeded') toast('O espaço de dados da estante está cheio. Exclua livros ou trechos antigos para continuar salvando.', { ms: 7000 });
  else if (c === 'revoked' || c === 'not_granted') toast('A estante perdeu o acesso ao armazenamento. Recarregue a página.', { ms: 7000 });
  else toast('Não foi possível salvar a última alteração. Verifique a conexão.', { ms: 5000 });
}
function applyDocs(list) {
  const nb = new Map(), nh = new Map();
  for (const d of list) {
    if (!d || !d.id) continue;
    if (d.kind === 'book') nb.set(d.id, { ...d, tags: [...(d.tags || [])], progress: { ...(d.progress || {}) } });
    else if (d.kind === 'hl') nh.set(d.id, { ...d, loc: { ...(d.loc || {}) } });
  }
  for (const id of S.pending) {
    const m = id[0] === 'b' ? nb : nh;
    const cur = S.books.get(id) || S.hls.get(id);
    if (cur) m.set(id, cur); else m.delete(id);
  }
  S.books = nb; S.hls = nh;
}
const scheduleMirror = debounce(() => {
  if (S.mode !== 'cloud') return;
  idbPut('kv', [...S.books.values(), ...S.hls.values()].map(clean), 'mirror:' + S.uid).catch(() => {});
}, 1500);

let sb = null;
const CFG = window.ESTANTE_CONFIG || {};
function sbErr(error) {
  const e = new Error((error && error.message) || 'erro');
  const st = String((error && (error.statusCode || error.status || error.code)) || '');
  e.code = st === '413' || /payload too large|exceeded the maximum|too large/i.test(e.message) ? 'too_large'
    : /quota/i.test(e.message) ? 'quota_or_state'
    : /fetch|network|timeout/i.test(e.message) ? 'unavailable'
    : /row-level security|not allowed|unauthorized|jwt/i.test(e.message) ? 'not_granted' : 'upstream_error';
  return e;
}
function makeCol() {
  const rows = new Map();
  let listener = null, onErr = null;
  const emit = debounce(() => listener && listener({ docs: [...rows.values()].map(d => ({ data: () => d })) }), 60);
  async function fetchAll() {
    const all = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb.from('items').select('data').range(from, from + 999);
      if (error) throw sbErr(error);
      all.push(...data);
      if (data.length < 1000) break;
    }
    rows.clear();
    all.forEach(r => r.data && rows.set(r.data.id, r.data));
    emit();
  }
  return {
    doc(id) {
      return {
        async set(obj) {
          const { error } = await sb.from('items').upsert({ user_id: S.uid, id, kind: obj.kind, data: obj, updated_at: new Date().toISOString() }, { onConflict: 'user_id,id' });
          if (error) throw sbErr(error);
          rows.set(id, obj);
        },
        async delete() {
          const { error } = await sb.from('items').delete().eq('id', id);
          if (error) throw sbErr(error);
          rows.delete(id);
        }
      };
    },
    onSnapshot(next, err) {
      listener = next; onErr = err;
      fetchAll().catch(e => onErr && onErr(e));
      let first = true;
      sb.channel('items-' + S.uid)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'items', filter: 'user_id=eq.' + S.uid }, p => {
          if (p.eventType === 'DELETE') { if (p.old && p.old.id) rows.delete(p.old.id); }
          else if (p.new && p.new.data) rows.set(p.new.data.id, p.new.data);
          emit();
        })
        .subscribe(status => { if (status === 'SUBSCRIBED') { if (!first) fetchAll().catch(() => {}); first = false; } });
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') fetchAll().catch(() => {}); });
    }
  };
}

function showAuth() {
  $('#shell').classList.add('authmode');
  let mode = 'in', busy = false, msg = '', ok = false;
  const draw = () => {
    const prevEmail = $('#a-email') ? $('#a-email').value : '';
    $('#view').innerHTML = `<div class="auth">
      <div class="brand">${I.logo}<div><b>Estante</b><small>sua biblioteca em qualquer aparelho</small></div></div>
      <h1>${mode === 'in' ? 'Entrar na sua estante' : 'Criar sua conta'}</h1>
      <p class="hint">${mode === 'in' ? 'Use o mesmo e-mail no notebook e no celular para ver os mesmos livros.' : 'Seus livros, o ponto onde parou e seus trechos ficam guardados nesta conta.'}</p>
      <form id="authForm" class="fields" novalidate>
        <div class="field"><label for="a-email">E-mail</label><input id="a-email" type="email" autocomplete="email" required value="${esc(prevEmail)}"></div>
        <div class="field"><label for="a-pass">Senha</label><input id="a-pass" type="password" autocomplete="${mode === 'in' ? 'current-password' : 'new-password'}" minlength="6" required></div>
        ${msg ? `<p class="amsg${ok ? ' ok' : ''}">${esc(msg)}</p>` : ''}
        <button class="btn primary block" type="submit" ${busy ? 'disabled' : ''}>${busy ? 'Aguarde…' : mode === 'in' ? 'Entrar' : 'Criar conta'}</button>
      </form>
      <p class="hint">${mode === 'in' ? 'Ainda não tem conta?' : 'Já tem conta?'} <button class="lnk" id="authSwap" type="button">${mode === 'in' ? 'Criar conta' : 'Entrar'}</button></p>
    </div>`;
    $('#authSwap').onclick = () => { mode = mode === 'in' ? 'up' : 'in'; msg = ''; draw(); };
    $('#authForm').onsubmit = async e => {
      e.preventDefault();
      const email = $('#a-email').value.trim(), password = $('#a-pass').value;
      if (!email || password.length < 6) { msg = 'Informe o e-mail e uma senha com pelo menos 6 caracteres.'; ok = false; draw(); return; }
      busy = true; msg = ''; draw();
      try {
        if (mode === 'in') {
          const { error } = await sb.auth.signInWithPassword({ email, password });
          if (error) throw error;
          location.reload(); return;
        } else {
          const { data, error } = await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin } });
          if (error) throw error;
          if (data.session) { location.reload(); return; }
          msg = `Enviamos um link de confirmação para ${email}. Abra o link e depois entre aqui.`; ok = true; mode = 'in';
        }
      } catch (err) {
        const m = String((err && err.message) || '');
        ok = false;
        msg = /invalid login/i.test(m) ? 'E-mail ou senha incorretos.'
          : /not confirmed/i.test(m) ? 'Confirme seu e-mail pelo link que enviamos antes de entrar.'
          : /already registered|already exists/i.test(m) ? 'Este e-mail já tem conta. Use “Entrar”.'
          : /rate limit/i.test(m) ? 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.'
          : 'Não foi possível concluir: ' + m;
      }
      busy = false; draw();
      const em = $('#a-email'); if (em && !em.value) em.value = email;
    };
  };
  draw();
}

async function initStore() {
  try { S.idb = await idbOpen(); } catch { S.idb = null; }
  if (window.supabase && CFG.supabaseUrl && CFG.supabaseKey) {
    try {
      sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      const { data } = await sb.auth.getSession();
      const session = data && data.session;
      if (!session) { showAuth(); return; }
      S.mode = 'cloud'; S.uid = session.user.id; S.email = session.user.email; S.col = makeCol();
      sb.auth.onAuthStateChange(ev => { if (ev === 'SIGNED_OUT') location.reload(); });
    } catch (e) { console.warn(e); sb = null; S.mode = 'local'; }
  }
  if (S.mode === 'cloud') {
    const mirror = await idbGet('kv', 'mirror:' + S.uid).catch(() => null);
    if (Array.isArray(mirror)) applyDocs(mirror);
    S.ready = true; refreshUsage(); render();
    S.col.onSnapshot(snap => {
      applyDocs(snap.docs.map(d => d.data()));
      scheduleMirror(); refreshUsage(); renderSoon();
      if (!S.resumed) { S.resumed = true; resumeUploads(); }
    }, err => {
      console.warn(err);
      toast(err && err.code === 'not_granted'
        ? 'O banco do Supabase recusou o acesso. Confira se o arquivo supabase/schema.sql foi executado.'
        : 'Não foi possível carregar a estante da nuvem. Verifique a conexão e recarregue a página.', { ms: 9000 });
    });
  } else {
    try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch {}
    const all = await idbAll('meta').catch(() => []);
    applyDocs(all || []);
    S.ready = true; render();
  }
}
function refreshUsage() {
  if (S.mode !== 'cloud') return;
  let bytes = 0;
  for (const b of S.books.values()) if (b.path) bytes += b.size || 0;
  S.usage = { bytes, maxBytes: (CFG.storageLimitMB || 1024) * 1048576 };
}

/* ================= arquivos ================= */
function blobToB64(blob) {
  return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => { const s = fr.result; res(s.slice(s.indexOf(',') + 1)); }; fr.onerror = () => rej(fr.error); fr.readAsDataURL(blob); });
}
function b64ToBytes(s) {
  if (typeof Uint8Array.fromBase64 === 'function') return Uint8Array.fromBase64(s);
  const bin = atob(s); const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
const Files = {
  async cached(id) { try { const v = await idbGet('files', id); return v || null; } catch { return null; } },
  async cache(id, blob) { try { await idbPut('files', blob, id); } catch (e) { console.warn('cache', e); } },
  async get(b, onp) {
    const c = await this.cached(b.id);
    if (c) return c instanceof Blob ? await c.arrayBuffer() : c;
    if (S.mode === 'cloud' && b.path) {
      onp && onp(0);
      const { data, error } = await sb.storage.from('books').download(b.path);
      if (error || !data) { const e = new Error('missing'); e.code = 'missing'; throw e; }
      onp && onp(1);
      const blob = new Blob([data], { type: MIME[b.format] });
      this.cache(b.id, blob);
      return await blob.arrayBuffer();
    }
    const e = new Error('nofile'); e.code = S.mode === 'cloud' ? (b.upload === 'pending' ? 'pending' : 'nofile') : 'nofile'; throw e;
  },
  async upload(blob, onp, b) {
    const path = `${S.uid}/${b.id}.${b.format}`;
    const opts = { contentType: MIME[b.format], upsert: true };
    onp(0);
    let { error } = await sb.storage.from('books').upload(path, blob, opts);
    if (error && /fetch|network|timeout/i.test(error.message || '')) { await sleep(1500); ({ error } = await sb.storage.from('books').upload(path, blob, opts)); }
    if (error) throw sbErr(error);
    onp(1);
    return path;
  }
};
async function uploadBook(id, onp) {
  let b = S.books.get(id); if (!b) return;
  const blob = await Files.cached(id);
  if (!blob) { b.upload = 'failed'; persist(id); return; }
  b.upload = 'pending'; persist(id); renderSoon();
  try {
    const path = await Files.upload(blob instanceof Blob ? blob : new Blob([blob]), onp || (() => {}), b);
    b = S.books.get(id);
    if (!b) { sb.storage.from('books').remove([path]).catch(() => {}); return; }
    b.path = path; b.upload = 'done'; persist(id);
  } catch (e) {
    console.warn(e);
    b = S.books.get(id); if (b) { b.upload = 'failed'; persist(id); }
    const c = e && e.code;
    const msg = c === 'too_large' ? 'o arquivo passa do limite de tamanho por arquivo do Supabase'
      : c === 'not_granted' ? 'o Supabase recusou o envio (confira se o schema.sql foi executado)'
      : c === 'quota_or_state' ? 'o espaço de armazenamento do Supabase está cheio'
      : c === 'rate_limited' ? 'muitos envios seguidos; tente de novo em instantes'
      : 'a conexão falhou';
    toast(`O livro ficou salvo só neste aparelho: ${msg}. Abra os detalhes do livro para tentar enviar de novo.`, { ms: 8000 });
  }
  refreshUsage(); renderSoon();
}
async function resumeUploads() {
  for (const b of [...S.books.values()]) {
    if ((b.upload === 'pending' || b.upload === 'failed') && !b.path && await Files.cached(b.id)) {
      if (b.upload === 'pending') await uploadBook(b.id);
    }
  }
}

/* ================= importação ================= */
function cleanTitle(t) {
  t = String(t || '').trim();
  if (t.length < 2) return '';
  if (/^(microsoft (word|powerpoint)|untitled|sem t[ií]tulo|document\d*$)/i.test(t)) return '';
  if (/\.(docx?|pdf|indd|tex|odt)$/i.test(t)) return '';
  return t;
}
const fileTitle = n => n.replace(/\.(pdf|epub)$/i, '').replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
function thumbFromCanvas(c) { try { return c.toDataURL('image/jpeg', 0.72); } catch { return null; } }
function imgToThumb(url) {
  return new Promise(res => {
    const img = new Image();
    img.onload = () => { const w = 220, h = Math.round(img.height * (w / img.width)) || 330; const c = document.createElement('canvas'); c.width = w; c.height = Math.min(h, 440); c.getContext('2d').drawImage(img, 0, 0, w, h); res(thumbFromCanvas(c)); };
    img.onerror = () => res(null); img.src = url;
  });
}
async function pdfMeta(buf) {
  if (!window.pdfjsLib) return {};
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf), isEvalSupported: false }).promise;
  let info = {};
  try { info = (await pdf.getMetadata()).info || {}; } catch {}
  let cover = null;
  try {
    const page = await pdf.getPage(1); const v1 = page.getViewport({ scale: 1 }); const vp = page.getViewport({ scale: 220 / v1.width });
    const c = document.createElement('canvas'); c.width = Math.floor(vp.width); c.height = Math.floor(vp.height);
    const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise; cover = thumbFromCanvas(c);
  } catch {}
  const pages = pdf.numPages; pdf.destroy();
  return { title: cleanTitle(info.Title), author: String(info.Author || '').trim(), cover, pages };
}
async function epubMeta(buf) {
  if (!window.ePub) return {};
  const book = ePub(buf);
  try {
    await book.ready;
    const md = await book.loaded.metadata;
    let cover = null;
    try { const url = await book.coverUrl(); if (url) cover = await imgToThumb(url); } catch {}
    return { title: cleanTitle(md.title), author: String(md.creator || '').trim(), cover };
  } finally { try { book.destroy(); } catch {} }
}
async function importFiles(list) {
  if (!S.ready) { toast('A estante ainda está carregando. Tente de novo em alguns segundos.'); return; }
  const all = [...list];
  const files = all.filter(f => /\.(pdf|epub)$/i.test(f.name));
  if (all.length > files.length) toast(`${all.length - files.length} arquivo(s) ignorado(s): a estante aceita PDF e EPUB.`, { ms: 5000 });
  for (const f of files) {
    if ([...S.books.values()].some(b => b.fileName === f.name && b.size === f.size)) { toast(`“${f.name}” já está na estante.`); continue; }
    const short = f.name.length > 40 ? f.name.slice(0, 38) + '…' : f.name;
    const t = toast(`Lendo “${short}”…`, { sticky: true });
    try {
      const fmt = /\.pdf$/i.test(f.name) ? 'pdf' : 'epub';
      const buf = await f.arrayBuffer();
      const meta = await (fmt === 'pdf' ? pdfMeta(buf.slice(0)) : epubMeta(buf.slice(0))).catch(e => { console.warn(e); return {}; });
      const b = {
        id: uid('b'), kind: 'book', format: fmt, title: meta.title || fileTitle(f.name), author: meta.author || '',
        tags: [], status: 'quero', favorite: false, size: f.size, fileName: f.name, cover: meta.cover || null,
        pages: meta.pages || null, addedAt: Date.now(), openedAt: 0, progress: { pct: 0 }, path: null,
        upload: S.mode === 'cloud' ? 'pending' : 'local'
      };
      if (b.cover && b.cover.length > 120000) b.cover = null;
      await Files.cache(b.id, new Blob([buf], { type: MIME[fmt] }));
      S.books.set(b.id, b); persist(b.id); renderSoon();
      if (S.mode === 'cloud') {
        const tt = b.title.length > 34 ? b.title.slice(0, 32) + '…' : b.title;
        await uploadBook(b.id, p => t.set(`Enviando “${tt}” · ${Math.round(p * 100)}%`));
      }
      t.set(`“${b.title}” entrou na estante.`); t.close(2600);
    } catch (e) {
      console.warn(e); t.set(`Não foi possível ler “${short}”. O arquivo pode estar corrompido ou protegido.`); t.close(6500);
    }
  }
}

/* ================= toasts ================= */
function toast(msg, { sticky = false, action = null, ms = 3200 } = {}) {
  const el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status');
  const span = document.createElement('span'); span.textContent = msg; el.append(span);
  let timer;
  const close = (d = 0) => { clearTimeout(timer); timer = setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 260); }, d); };
  if (action) { const b = document.createElement('button'); b.textContent = action.label; b.onclick = () => { action.fn(); close(); }; el.append(b); }
  $('#toasts').append(el);
  if (!sticky) close(ms);
  return { set: m => { span.textContent = m; }, close };
}

/* ================= consultas ================= */
const authorOf = b => (b.author || '').trim();
const hlsOf = id => [...S.hls.values()].filter(h => h.bookId === id).sort(hlOrder);
function hlOrder(a, b) { return (a.loc.page || 0) - (b.loc.page || 0) || (a.pct || 0) - (b.pct || 0) || a.createdAt - b.createdAt; }
function counts() {
  const c = { all: 0, lendo: 0, quero: 0, lido: 0, fav: 0 };
  for (const b of S.books.values()) { c.all++; c[b.status] = (c[b.status] || 0) + 1; if (b.favorite) c.fav++; }
  return c;
}
function authors() {
  const m = new Map();
  for (const b of S.books.values()) { const a = authorOf(b); if (!a) continue; if (!m.has(a)) m.set(a, []); m.get(a).push(b); }
  return [...m.entries()].sort((x, y) => y[1].length - x[1].length || x[0].localeCompare(y[0], 'pt'));
}
function tags() {
  const m = new Map();
  for (const b of S.books.values()) for (const t of b.tags || []) { if (!m.has(t)) m.set(t, []); m.get(t).push(b); }
  return [...m.entries()].sort((x, y) => y[1].length - x[1].length || x[0].localeCompare(y[0], 'pt'));
}
const SORTS = {
  recent: (a, b) => (b.openedAt || b.addedAt) - (a.openedAt || a.addedAt),
  added: (a, b) => b.addedAt - a.addedAt,
  title: (a, b) => a.title.localeCompare(b.title, 'pt', { sensitivity: 'base' }),
  author: (a, b) => (authorOf(a) || '~').localeCompare(authorOf(b) || '~', 'pt') || a.title.localeCompare(b.title, 'pt'),
  progress: (a, b) => (b.progress?.pct || 0) - (a.progress?.pct || 0)
};
function filtered() {
  const v = S.v; let a = [...S.books.values()];
  if (v.status === 'fav') a = a.filter(b => b.favorite); else if (v.status) a = a.filter(b => b.status === v.status);
  if (v.author) a = a.filter(b => authorOf(b) === v.author);
  if (v.tag) a = a.filter(b => (b.tags || []).includes(v.tag));
  if (v.q) { const q = norm(v.q); a = a.filter(b => norm(`${b.title} ${b.author} ${(b.tags || []).join(' ')} ${b.fileName}`).includes(q)); }
  return a.sort(SORTS[v.sort] || SORTS.recent);
}
function progLabel(b) {
  const p = b.progress || {};
  if (b.format === 'pdf' && p.page) return `p. ${p.page} de ${p.total || b.pages || '?'} · ${pct(p.pct)}`;
  if (p.pct) return `${pct(p.pct)} lido${p.chapter ? ' · ' + p.chapter : ''}`;
  return 'Não iniciado';
}

/* ================= componentes ================= */
function hash(s) { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) | 0; return Math.abs(h); }
function coverHTML(b) {
  if (b.cover) return `<img src="${esc(b.cover)}" alt="" loading="lazy">`;
  const bg = BINDINGS[hash(b.title + b.author) % BINDINGS.length];
  return `<div class="gen" style="background:${bg}"><div><b>${esc(b.title)}</b><hr></div><small>${esc(authorOf(b) || b.format.toUpperCase())}</small></div>`;
}
function syncBadge(b) {
  if (S.mode !== 'cloud') return '';
  if (b.upload === 'pending') return '<span class="sync">enviando…</span>';
  if (b.upload === 'failed') return '<span class="sync">só aqui</span>';
  return '';
}
function cardHTML(b) {
  const p = b.progress?.pct || 0;
  return `<article class="bk" data-act="open" data-id="${b.id}" tabindex="0" aria-label="Abrir ${esc(b.title)}">
    <div class="cover">${coverHTML(b)}<span class="fmt">${b.format.toUpperCase()}</span>${b.favorite ? `<span class="fav">${I.star}</span>` : ''}${syncBadge(b)}
      <button class="more" data-act="details" data-id="${b.id}" aria-label="Detalhes de ${esc(b.title)}">${I.dots}</button></div>
    <div class="t">${esc(b.title)}</div>
    <div class="a">${esc(authorOf(b) || 'Autor desconhecido')}</div>
    ${b.status === 'lido' ? '<div class="pmeta done">Lido</div>' : (b.status === 'lendo' || p > 0) ? `<div class="prog"><i style="width:${(p * 100).toFixed(1)}%"></i></div><div class="pmeta">${esc(progLabel(b))}</div>` : ''}
  </article>`;
}
function contHTML(b) {
  const p = b.progress?.pct || 0;
  return `<article class="cont" data-act="open" data-id="${b.id}" tabindex="0">
    <div class="cover">${coverHTML(b)}</div>
    <div class="cinfo"><div class="t">${esc(b.title)}</div><div class="a">${esc(authorOf(b) || 'Autor desconhecido')}</div>
      <div class="prog"><i style="width:${(p * 100).toFixed(1)}%"></i></div>
      <div class="pmeta">${esc(progLabel(b))}${b.openedAt ? ' · ' + ago(b.openedAt) : ''}</div>
      <span class="go">Continuar ${I.arrow}</span></div>
  </article>`;
}
const gridHTML = list => `<div class="grid">${list.map(cardHTML).join('')}</div>`;
function stackHTML(list) { return `<div class="stack">${list.slice(0, 3).map(b => `<div class="cover">${coverHTML(b)}</div>`).join('')}</div>`; }
function hlHTML(h, withBook) {
  const b = S.books.get(h.bookId);
  const where = h.loc.page ? `p. ${h.loc.page}` : (h.loc.chapter ? h.loc.chapter + ' · ' : '') + pct(h.pct);
  return `<article class="hl" style="--mk:var(--mk-${h.color || 'y'})">
    <blockquote><span>${esc(h.text)}</span></blockquote>
    ${h.note ? `<div class="note">${esc(h.note)}</div>` : ''}
    <footer><span>${esc(where)}</span><span>${fmtDate(h.createdAt)}</span><span class="sp"></span>
      ${b ? `<button class="lnk" data-act="gohl" data-id="${h.id}">Ir ao trecho</button>` : ''}
      <button class="lnk muted" data-act="note" data-id="${h.id}">${h.note ? 'Editar nota' : 'Nota'}</button>
      <button class="lnk muted" data-act="copyhl" data-id="${h.id}">Copiar</button>
      <button class="lnk muted" data-act="delhl" data-id="${h.id}">Excluir</button></footer>
  </article>`;
}

/* ================= renderização da estante ================= */
let rafId = 0;
function renderSoon() { if (!rafId) rafId = requestAnimationFrame(() => { rafId = 0; render(); }); }
function render() { renderSide(); renderBnav(); renderView(); if (!$('#modal').hidden && Modal.refresh) Modal.refresh(); if (R.open && R.panel === 'hls') renderPanel(); }

function navBtn(label, icon, attrs, on, count) {
  return `<button class="ni${on ? ' on' : ''}" data-act="nav" ${attrs}>${icon}<span>${esc(label)}</span>${count != null ? `<em>${count}</em>` : ''}</button>`;
}
function syncLine() {
  if (!S.ready) return '<small><i class="off"></i>carregando…</small>';
  return S.mode === 'cloud' ? '<small><i></i>sincronizada entre aparelhos</small>' : '<small><i class="off"></i>salva neste navegador</small>';
}
function renderSide() {
  const v = S.v, c = counts(), au = authors(), tg = tags();
  const isBooks = st => v.view === 'books' && !v.author && !v.tag && v.status === st;
  $('#mbrand').innerHTML = `${I.logo}<div><b>Estante</b>${syncLine()}</div>`;
  let usage = '';
  if (S.mode === 'cloud' && S.usage && S.usage.maxBytes) {
    const r = S.usage.bytes / S.usage.maxBytes;
    usage = `<div class="meter"><i style="width:${Math.min(100, r * 100).toFixed(1)}%"></i></div><span>${fmtSize(S.usage.bytes)} de ${fmtSize(S.usage.maxBytes)} usados na nuvem</span>
      <span class="who">${esc(S.email || '')} · <button class="lnk" data-act="logout">Sair</button></span>`;
  } else if (S.mode === 'local' && S.ready) usage = `<span>Os livros ficam guardados neste navegador e não passam para outros aparelhos.</span>`;
  $('#side').innerHTML = `
    <div class="brand">${I.logo}<div><b>Estante</b>${syncLine()}</div></div>
    <label for="fileIn" class="btn primary block">${I.plus}Adicionar livros</label>
    <nav class="snav">
      ${navBtn('Início', I.home, 'data-view="home"', v.view === 'home')}
      ${navBtn('Lendo agora', I.open, 'data-view="books" data-status="lendo"', isBooks('lendo'), c.lendo)}
      ${navBtn('Quero ler', I.clock, 'data-view="books" data-status="quero"', isBooks('quero'), c.quero)}
      ${navBtn('Lidos', I.check, 'data-view="books" data-status="lido"', isBooks('lido'), c.lido)}
      ${navBtn('Favoritos', I.starO, 'data-view="books" data-status="fav"', isBooks('fav'), c.fav)}
      ${navBtn('Todos os livros', I.shelf, 'data-view="books"', isBooks(null), c.all)}
      ${navBtn('Trechos salvos', I.mark, 'data-view="highlights"', v.view === 'highlights', S.hls.size)}
    </nav>
    <div class="sgroup"><h4>Autores ${au.length > 6 ? '<button data-act="nav" data-view="authors">ver todos</button>' : ''}</h4>
      ${au.length ? au.slice(0, 6).map(([a, l]) => navBtn(a, I.user, `data-view="books" data-author="${esc(a)}"`, v.view === 'books' && v.author === a, l.length)).join('') : '<p class="empty-side">Os autores aparecem aqui conforme você adiciona livros.</p>'}
    </div>
    <div class="sgroup"><h4>Temas ${tg.length ? '<button data-act="nav" data-view="tags">ver todos</button>' : ''}</h4>
      ${tg.length ? `<div class="tagcloud">${tg.slice(0, 14).map(([t, l]) => `<button class="tg${v.view === 'books' && v.tag === t ? ' on' : ''}" data-act="nav" data-view="books" data-tag="${esc(t)}">${esc(t)}<em>${l.length}</em></button>`).join('')}</div>` : '<p class="empty-side">Adicione temas nos detalhes de cada livro (botão ••• na capa).</p>'}
    </div>
    <div class="sfoot">${usage}</div>`;
}
function renderBnav() {
  const v = S.v.view;
  $('#bnav').innerHTML = `
    <button data-act="nav" data-view="home" class="${v === 'home' ? 'on' : ''}">${I.home}Início</button>
    <button data-act="nav" data-view="books" class="${v === 'books' || v === 'authors' || v === 'tags' ? 'on' : ''}">${I.shelf}Estante</button>
    <button data-act="nav" data-view="highlights" class="${v === 'highlights' ? 'on' : ''}">${I.mark}Trechos</button>
    <label for="fileIn" class="add">${I.plus}Adicionar</label>`;
}

let lastKey = '';
function renderView() {
  const root = $('#view'), v = S.v;
  if (!S.ready) return;
  const key = JSON.stringify([v.view, v.status, v.author, v.tag]);
  if (key !== lastKey || !$('#results', root)) {
    lastKey = key;
    root.innerHTML = `<div id="vhead"></div><div id="vtools"></div><div id="results"></div>`;
    $('#vtools').innerHTML = toolsHTML();
  }
  const [head, body] = VIEWS[v.view]();
  $('#vhead').innerHTML = head;
  $('#results').innerHTML = body;
}
function toolsHTML() {
  const v = S.v;
  if (v.view === 'books') return `<div class="tools">
    <label class="search">${I.search}<span class="sr">Buscar</span><input id="q" type="search" placeholder="Buscar por título, autor ou tema" value="${esc(v.q)}" autocomplete="off"></label>
    <label class="sel">Ordenar<select id="sort">${[['recent','Lidos recentemente'],['added','Adicionados'],['title','Título'],['author','Autor'],['progress','Progresso']].map(([k, l]) => `<option value="${k}"${v.sort === k ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
    <label class="sel">Agrupar<select id="group">${[['none','Sem grupos'],['author','Por autor'],['tag','Por tema'],['status','Por status']].map(([k, l]) => `<option value="${k}"${v.group === k ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
  </div>`;
  if (v.view === 'highlights') {
    const books = [...new Set([...S.hls.values()].map(h => h.bookId))].map(id => S.books.get(id)).filter(Boolean).sort((a, b) => a.title.localeCompare(b.title, 'pt'));
    return `<div class="tools">
      <label class="search">${I.search}<span class="sr">Buscar nos trechos</span><input id="hq" type="search" placeholder="Buscar nos trechos e notas" value="${esc(v.hq)}" autocomplete="off"></label>
      <label class="sel">Livro<select id="hbook"><option value="">Todos</option>${books.map(b => `<option value="${b.id}"${v.hbook === b.id ? ' selected' : ''}>${esc(b.title.length > 48 ? b.title.slice(0, 46) + '…' : b.title)}</option>`).join('')}</select></label>
    </div>`;
  }
  return '';
}
function emptyLibrary() {
  return `<div class="empty">${I.upload}<h3>Sua estante está vazia</h3>
    <p>Adicione livros em PDF ou EPUB. Eles ficam guardados aqui, junto com a página em que você parou e os trechos que destacar${S.mode === 'cloud' ? ', e aparecem também no celular e no notebook' : ''}.</p>
    <label for="fileIn" class="btn primary">${I.plus}Escolher arquivos</label>
    <span class="hint">No computador, você também pode arrastar os arquivos para esta janela.</span></div>`;
}
const VIEWS = {
  home() {
    const c = counts();
    const head = `<div class="vhead"><div><div class="eyebrow">Início</div><h1>Sua estante</h1>
      <p>${c.all} ${c.all === 1 ? 'livro' : 'livros'} · ${c.lendo} em leitura · ${S.hls.size} ${S.hls.size === 1 ? 'trecho salvo' : 'trechos salvos'}</p></div></div>`;
    if (!c.all) return [head, emptyLibrary()];
    const reading = [...S.books.values()].filter(b => b.status === 'lendo').sort((a, b) => (b.openedAt || b.addedAt) - (a.openedAt || a.addedAt));
    const recent = [...S.books.values()].sort(SORTS.added).slice(0, 12);
    const lastHls = [...S.hls.values()].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
    let body = '';
    if (reading.length) body += `<section class="section"><h2>Continuar lendo</h2><div class="shelf">${reading.map(contHTML).join('')}</div></section>`;
    body += `<section class="section"><h2>Adicionados recentemente ${c.all > 12 ? '<button data-act="nav" data-view="books">Ver todos</button>' : ''}</h2>${gridHTML(recent)}</section>`;
    if (lastHls.length) body += `<section class="section"><h2>Últimos trechos <button data-act="nav" data-view="highlights">Ver todos</button></h2><div class="hls">${lastHls.map(h => { const b = S.books.get(h.bookId); return hlHTML(h).replace('<footer>', `<footer><b style="color:var(--ink);font-weight:600">${esc(b ? b.title : 'Livro excluído')}</b>`); }).join('')}</div></section>`;
    return [head, body];
  },
  books() {
    const v = S.v, list = filtered();
    let eyebrow = 'Estante', title = 'Todos os livros';
    if (v.author) { eyebrow = 'Autor'; title = v.author; }
    else if (v.tag) { eyebrow = 'Tema'; title = v.tag; }
    else if (v.status) title = { lendo: 'Lendo agora', quero: 'Quero ler', lido: 'Lidos', fav: 'Favoritos' }[v.status];
    const head = `<div class="vhead"><div><div class="eyebrow">${eyebrow}</div><h1>${esc(title)}</h1><p>${list.length} ${list.length === 1 ? 'livro' : 'livros'}${v.q ? ` para “${esc(v.q)}”` : ''}</p></div>
      ${(v.author || v.tag) ? `<button class="btn sm" data-act="nav" data-view="books">${I.x}Limpar filtro</button>` : ''}</div>`;
    if (!S.books.size) return [head, emptyLibrary()];
    if (!list.length) return [head, `<div class="empty"><h3>Nada por aqui</h3><p>${v.q ? 'Nenhum livro corresponde à busca.' : v.status === 'fav' ? 'Marque livros como favoritos nos detalhes de cada um.' : 'Nenhum livro nesta seção ainda.'}</p></div>`];
    if (v.group === 'none') return [head, gridHTML(list)];
    const groups = new Map();
    for (const b of list) {
      const keys = v.group === 'author' ? [authorOf(b) || 'Autor desconhecido'] : v.group === 'tag' ? ((b.tags && b.tags.length) ? b.tags : ['Sem tema']) : [STATUS[b.status] || 'Quero ler'];
      for (const k of keys) { if (!groups.has(k)) groups.set(k, []); groups.get(k).push(b); }
    }
    const order = [...groups.keys()].sort((a, b) => {
      if (v.group === 'status') return ['Lendo', 'Quero ler', 'Lido'].indexOf(a) - ['Lendo', 'Quero ler', 'Lido'].indexOf(b);
      const last = x => x === 'Sem tema' || x === 'Autor desconhecido';
      return last(a) - last(b) || a.localeCompare(b, 'pt');
    });
    return [head, order.map(k => `<h3 class="ghead">${esc(k)}<span>${groups.get(k).length}</span></h3>${gridHTML(groups.get(k))}`).join('')];
  },
  authors() {
    const au = authors();
    const unknown = [...S.books.values()].filter(b => !authorOf(b)).length;
    const head = `<div class="vhead"><div><div class="eyebrow">Estante</div><h1>Autores</h1><p>${au.length} ${au.length === 1 ? 'autor' : 'autores'}${unknown ? ` · ${unknown} sem autor definido` : ''}</p></div></div>`;
    if (!au.length) return [head, `<div class="empty"><h3>Nenhum autor ainda</h3><p>O autor é lido do próprio arquivo quando possível. Você pode editá-lo nos detalhes de cada livro.</p></div>`];
    return [head, `<div class="people">${au.map(([a, l]) => `<button class="person" data-act="nav" data-view="books" data-author="${esc(a)}">${stackHTML(l)}<div><b>${esc(a)}</b><span>${l.length} ${l.length === 1 ? 'livro' : 'livros'}</span></div></button>`).join('')}</div>`];
  },
  tags() {
    const tg = tags();
    const head = `<div class="vhead"><div><div class="eyebrow">Estante</div><h1>Temas</h1><p>${tg.length} ${tg.length === 1 ? 'tema' : 'temas'}</p></div></div>`;
    if (!tg.length) return [head, `<div class="empty"><h3>Nenhum tema ainda</h3><p>Abra os detalhes de um livro (botão ••• na capa) e adicione temas como “Filosofia”, “Trabalho” ou “Ficção científica”.</p></div>`];
    return [head, `<div class="people">${tg.map(([t, l]) => `<button class="person" data-act="nav" data-view="books" data-tag="${esc(t)}">${stackHTML(l)}<div><b>${esc(t)}</b><span>${l.length} ${l.length === 1 ? 'livro' : 'livros'}</span></div></button>`).join('')}</div>`];
  },
  highlights() {
    const v = S.v;
    let list = [...S.hls.values()];
    if (v.hbook) list = list.filter(h => h.bookId === v.hbook);
    if (v.hq) { const q = norm(v.hq); list = list.filter(h => norm(h.text + ' ' + (h.note || '')).includes(q)); }
    const head = `<div class="vhead"><div><div class="eyebrow">Anotações</div><h1>Trechos salvos</h1><p>${list.length} ${list.length === 1 ? 'trecho' : 'trechos'}</p></div></div>`;
    if (!S.hls.size) return [head, `<div class="empty">${I.mark.replace('<svg', '<svg class="big"')}<h3>Nenhum trecho salvo</h3><p>Enquanto lê, selecione um trecho do texto e escolha uma cor para guardá-lo aqui, com nota se quiser.</p></div>`];
    if (!list.length) return [head, `<div class="empty"><h3>Nada encontrado</h3><p>Nenhum trecho corresponde à busca.</p></div>`];
    const by = new Map();
    for (const h of list) { if (!by.has(h.bookId)) by.set(h.bookId, []); by.get(h.bookId).push(h); }
    const order = [...by.keys()].sort((a, b) => Math.max(...by.get(b).map(h => h.createdAt)) - Math.max(...by.get(a).map(h => h.createdAt)));
    return [head, order.map(id => {
      const b = S.books.get(id), hs = by.get(id).sort(hlOrder);
      return `<div class="bookhead">${b ? `<div class="cover">${coverHTML(b)}</div>` : ''}<div><b>${esc(b ? b.title : 'Livro excluído')}</b><span>${esc(b ? (authorOf(b) || 'Autor desconhecido') : '')} · ${hs.length} ${hs.length === 1 ? 'trecho' : 'trechos'}</span></div>${b ? `<button class="btn sm" data-act="open" data-id="${b.id}">Abrir</button>` : ''}</div><div class="hls">${hs.map(h => hlHTML(h)).join('')}</div>`;
    }).join('')];
  }
};

function nav(el) {
  const d = el.dataset, v = S.v;
  v.view = d.view || 'home'; v.status = d.status || null; v.author = d.author || null; v.tag = d.tag || null;
  if (v.view !== 'books') v.q = '';
  ls.set('view', v.view === 'books' && (v.author || v.tag || v.status) ? 'books' : v.view);
  $('#shell').classList.remove('drawer');
  render();
  $('#main').scrollTo({ top: 0 });
}

/* ================= modal: detalhes e notas ================= */
const Modal = {
  refresh: null,
  open(html, refresh) { const m = $('#modal'); m.innerHTML = html; m.hidden = false; this.refresh = refresh || null; const f = m.querySelector('[autofocus]'); if (f && matchMedia('(hover:hover)').matches) f.focus(); },
  close() { const m = $('#modal'); m.hidden = true; m.innerHTML = ''; this.refresh = null; }
};
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') Modal.close(); });

function openDetails(id) {
  let confirming = false;
  const draw = () => {
    const b = S.books.get(id); if (!b) { Modal.close(); return; }
    const n = hlsOf(id).length;
    const allA = authors().map(x => x[0]), allT = tags().map(x => x[0]).filter(t => !(b.tags || []).includes(t));
    const store = S.mode !== 'cloud' ? 'Neste navegador' : b.upload === 'done' ? 'Na nuvem' : b.upload === 'pending' ? 'Enviando…' : 'Só neste aparelho';
    return `<div class="sheet" role="dialog" aria-modal="true" aria-label="Detalhes do livro">
      <header><h2>Detalhes do livro</h2><button class="ib" data-act="close" aria-label="Fechar">${I.x}</button></header>
      <div class="body">
        <div class="dtop"><div class="cover">${coverHTML(b)}</div>
          <div class="fields">
            <div class="field"><label for="d-title">Título</label><input id="d-title" value="${esc(b.title)}"></div>
            <div class="field"><label for="d-author">Autor</label><input id="d-author" list="d-authors" value="${esc(b.author)}" placeholder="Autor desconhecido"><datalist id="d-authors">${allA.map(a => `<option value="${esc(a)}">`).join('')}</datalist></div>
          </div></div>
        <div class="field"><span class="flabel">Temas</span>
          <div class="chips">${(b.tags || []).map(t => `<span class="chip">${esc(t)}<button data-act="rmtag" data-tag="${esc(t)}" aria-label="Remover tema ${esc(t)}">${I.x}</button></span>`).join('')}
            <input id="d-tag" list="d-tags" placeholder="${(b.tags || []).length ? 'Adicionar tema' : 'Ex.: Filosofia, Romance, Trabalho'}" aria-label="Adicionar tema" enterkeyhint="done"><datalist id="d-tags">${allT.map(t => `<option value="${esc(t)}">`).join('')}</datalist></div>
          <span class="hint">Pressione Enter ou vírgula para adicionar.</span></div>
        <div class="field"><span class="flabel">Status</span>
          <div class="seg">${Object.entries(STATUS).map(([k, l]) => `<button data-act="status" data-st="${k}" class="${b.status === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>
        <button class="favbtn${b.favorite ? ' on' : ''}" data-act="fav">${b.favorite ? I.star : I.starO}${b.favorite ? 'Favorito' : 'Marcar como favorito'}</button>
        <dl class="ficha">
          <div><dt>Formato</dt><dd>${b.format.toUpperCase()} · ${fmtSize(b.size)}</dd></div>
          <div><dt>${b.format === 'pdf' ? 'Páginas' : 'Progresso'}</dt><dd>${b.format === 'pdf' ? (b.progress?.total || b.pages || '—') : pct(b.progress?.pct)}</dd></div>
          <div><dt>Onde parou</dt><dd>${esc(progLabel(b))}</dd></div>
          <div><dt>Adicionado</dt><dd>${fmtDate(b.addedAt)}</dd></div>
          <div><dt>Última leitura</dt><dd>${b.openedAt ? fmtDate(b.openedAt) : '—'}</dd></div>
          <div><dt>Arquivo</dt><dd>${store}${S.mode === 'cloud' && b.upload === 'failed' ? ` · <button class="lnk" data-act="retry">enviar de novo</button>` : ''}</dd></div>
        </dl>
        ${confirming ? `<div class="confirm"><p>Excluir “${esc(b.title)}”${n ? ` e ${n} ${n === 1 ? 'trecho salvo' : 'trechos salvos'}` : ''}? Isso não pode ser desfeito.</p><button class="btn sm" data-act="nodel">Cancelar</button><button class="btn sm danger solid" data-act="dodel">Excluir</button></div>` : ''}
        <div class="actions"><button class="btn primary" data-act="open" data-id="${b.id}">${I.open}${b.progress?.pct ? 'Continuar leitura' : 'Começar a ler'}</button>
          ${n ? `<button class="btn" data-act="bookhls">${I.mark}${n} ${n === 1 ? 'trecho' : 'trechos'}</button>` : ''}
          <span class="sp"></span><button class="btn danger" data-act="askdel">Excluir</button></div>
      </div></div>`;
  };
  const sheetHandlers = () => {
    const m = $('#modal');
    const save = () => {
      const b = S.books.get(id); if (!b) return;
      const t = $('#d-title', m).value.trim(), a = $('#d-author', m).value.trim();
      if ((t && t !== b.title) || a !== (b.author || '')) { if (t) b.title = t; b.author = a; persist(id); renderSoon(); }
    };
    $('#d-title', m).addEventListener('change', save);
    $('#d-author', m).addEventListener('change', save);
    const ti = $('#d-tag', m);
    const addTag = () => {
      const b = S.books.get(id); const vals = ti.value.split(',').map(s => s.trim()).filter(Boolean);
      if (!b || !vals.length) return;
      let ch = false; for (const v of vals) if (!b.tags.some(t => norm(t) === norm(v))) { b.tags.push(v.slice(0, 40)); ch = true; }
      ti.value = '';
      if (ch) { persist(id); redraw(true); }
    };
    ti.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } });
    ti.addEventListener('change', () => { if (ti.value.includes(',') || [...$('#d-tags', m).options].some(o => o.value === ti.value)) addTag(); });
    ti.addEventListener('blur', () => { if (ti.value.trim()) addTag(); });
  };
  const redraw = (focusTag) => {
    const m = $('#modal'); const st = m.querySelector('.sheet')?.scrollTop || 0;
    m.innerHTML = draw(); sheetHandlers();
    const sh = m.querySelector('.sheet'); if (sh) sh.scrollTop = st;
    if (focusTag) $('#d-tag', m)?.focus();
  };
  Modal.open(draw(), () => { const a = document.activeElement; if (a && a.closest && a.closest('#modal') && a.matches('input')) return; redraw(); });
  sheetHandlers();
  Modal.handler = act => {
    const b = S.books.get(id); if (!b) return;
    if (act.dataset.act === 'status') { b.status = act.dataset.st; persist(id); redraw(); renderSoon(); }
    else if (act.dataset.act === 'fav') { b.favorite = !b.favorite; persist(id); redraw(); renderSoon(); }
    else if (act.dataset.act === 'rmtag') { b.tags = b.tags.filter(t => t !== act.dataset.tag); persist(id); redraw(); renderSoon(); }
    else if (act.dataset.act === 'askdel') { confirming = true; redraw(); }
    else if (act.dataset.act === 'nodel') { confirming = false; redraw(); }
    else if (act.dataset.act === 'dodel') { Modal.close(); deleteBook(id); }
    else if (act.dataset.act === 'retry') { uploadBook(id); redraw(); }
    else if (act.dataset.act === 'bookhls') { Modal.close(); S.v.view = 'highlights'; S.v.hbook = id; S.v.hq = ''; lastKey = ''; render(); $('#main').scrollTo({ top: 0 }); }
  };
}
function openNote(hid) {
  const h = S.hls.get(hid); if (!h) return;
  let color = h.color || 'y';
  const html = () => `<div class="sheet" role="dialog" aria-modal="true" aria-label="Nota do trecho">
    <header><h2>Nota do trecho</h2><button class="ib" data-act="close" aria-label="Fechar">${I.x}</button></header>
    <div class="body">
      <div class="hl" style="--mk:var(--mk-${color});border:0;padding:0;background:none"><blockquote><span>${esc(h.text.length > 600 ? h.text.slice(0, 600) + '…' : h.text)}</span></blockquote></div>
      <div class="field"><label for="n-text">Sua nota</label><textarea id="n-text" autofocus placeholder="O que esse trecho significa para você?">${esc(h.note || '')}</textarea></div>
      <div class="field"><span class="flabel">Cor</span><div class="colors">${Object.keys(MK).map(k => `<button class="cdot${k === color ? ' on' : ''}" data-act="ncolor" data-c="${k}" aria-label="Cor ${k}"><i style="background:${MK[k]}"></i></button>`).join('')}</div></div>
      <div class="actions"><span class="sp"></span><button class="btn" data-act="close">Cancelar</button><button class="btn primary" data-act="nsave">Salvar nota</button></div>
    </div></div>`;
  Modal.open(html());
  Modal.handler = act => {
    if (act.dataset.act === 'ncolor') { const txt = $('#n-text').value; color = act.dataset.c; $('#modal').innerHTML = html(); $('#n-text').value = txt; }
    else if (act.dataset.act === 'nsave') {
      const cur = S.hls.get(hid); if (!cur) return Modal.close();
      const recolor = cur.color !== color;
      cur.note = $('#n-text').value.trim().slice(0, 4000); cur.color = color; persist(hid); Modal.close(); renderSoon();
      if (recolor && R.open && R.kind === 'epub') { EpubR.removeHl(cur); EpubR.addHl(cur); }
      toast('Nota salva');
    }
  };
}
function deleteBook(id) {
  const b = S.books.get(id); if (!b) return;
  const hs = hlsOf(id);
  S.books.delete(id); persist(id);
  for (const h of hs) { S.hls.delete(h.id); persist(h.id); }
  idbDel('files', id).catch(() => {}); ls.del('loc:' + id);
  if (S.mode === 'cloud' && b.path) sb.storage.from('books').remove([b.path]).catch(() => {});
  if (S.v.hbook === id) S.v.hbook = '';
  render(); toast(`“${b.title}” foi excluído.`);
  refreshUsage();
}
function deleteHl(hid) {
  const h = S.hls.get(hid); if (!h) return;
  S.hls.delete(hid); persist(hid);
  if (R.open && R.kind === 'epub' && R.id === h.bookId) EpubR.removeHl(h);
  renderSoon();
  toast('Trecho excluído', { action: { label: 'Desfazer', fn: () => { S.hls.set(h.id, h); persist(h.id); if (R.open && R.kind === 'epub' && R.id === h.bookId) EpubR.addHl(h); renderSoon(); } }, ms: 5000 });
}
async function copyText(t) {
  try { await navigator.clipboard.writeText(t); toast('Trecho copiado'); }
  catch { toast('Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.'); }
}

/* ================= leitor ================= */
const R = { open: false, id: null, kind: null, token: null, panel: null, sel: null, lock: null, progTimer: 0 };
function readerTheme() {
  if (rset.theme !== 'auto') return rset.theme;
  const t = document.documentElement.dataset.theme;
  const dark = t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  return dark ? 'noite' : 'claro';
}
function applyReaderTheme() {
  $('#reader').dataset.rt = readerTheme();
  if (R.open && R.kind === 'epub') EpubR.restyle();
}
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (R.open) applyReaderTheme(); });

function setLoad(msg, isErr) {
  const l = $('#rLoad'); l.hidden = false; $('#rLoadMsg').textContent = msg;
  l.querySelector('.spinner').hidden = !!isErr; $('#rLoadBack').hidden = !isErr;
}
function saveProgress(p) {
  const b = S.books.get(R.id); if (!b) return;
  b.progress = { ...(b.progress || {}), ...p };
  S.pending.add(b.id);
  clearTimeout(R.progTimer);
  R.progTimer = setTimeout(() => persist(b.id), 1500);
}
function flushProgress() { if (R.progTimer) { clearTimeout(R.progTimer); R.progTimer = 0; if (R.id && S.books.get(R.id)) persist(R.id); } }
async function wakeLock() {
  try { if (navigator.wakeLock && document.visibilityState === 'visible') R.lock = await navigator.wakeLock.request('screen'); } catch {}
}
async function openBook(id, goto) {
  const b = S.books.get(id); if (!b) return;
  if (R.open) closeReader();
  Modal.close();
  const tok = {}; Object.assign(R, { open: true, id, kind: b.format, token: tok, panel: null, sel: null });
  const rd = $('#reader'); rd.hidden = false; rd.classList.remove('immersive');
  $('#rTitle').textContent = b.title; $('#rAuthor').textContent = authorOf(b) || 'Autor desconhecido';
  $('#rPanel').hidden = true; $('#selPill').hidden = true; $('#endNote').hidden = true;
  $$('.rtop [data-panel]').forEach(x => x.classList.remove('on'));
  $('#rLeft').textContent = ''; $('#rRight').textContent = ''; $('#rRange').disabled = true;
  applyReaderTheme();
  setLoad('Abrindo o livro…');
  b.openedAt = Date.now(); if (b.status === 'quero') b.status = 'lendo'; persist(id);
  try {
    const buf = await Files.get(b, p => { if (R.token === tok) setLoad(`Baixando o livro… ${Math.round(p * 100)}%`); });
    if (R.token !== tok) return;
    setLoad('Preparando as páginas…');
    if (b.format === 'pdf') { if (!window.pdfjsLib) throw Object.assign(new Error(), { code: 'lib' }); await PdfR.open(buf, b, goto, tok); }
    else { if (!window.ePub) throw Object.assign(new Error(), { code: 'lib' }); await EpubR.open(buf, b, goto, tok); }
    if (R.token !== tok) return;
    $('#rLoad').hidden = true;
    wakeLock();
  } catch (e) {
    console.error(e);
    if (R.token !== tok) return;
    const c = e && e.code;
    setLoad(c === 'pending' ? 'Este livro ainda está sendo enviado do aparelho onde foi adicionado. Deixe a estante aberta lá até o envio terminar.'
      : c === 'nofile' ? (S.mode === 'cloud' ? 'O arquivo deste livro ficou só no aparelho onde foi adicionado. Abra a estante nele e use “enviar de novo” nos detalhes do livro.' : 'O arquivo deste livro não está mais neste navegador. Exclua-o e adicione o arquivo de novo.')
      : c === 'missing' ? 'O arquivo deste livro não foi encontrado no armazenamento. Exclua-o e adicione de novo.'
      : c === 'lib' ? 'O leitor não carregou. Verifique a conexão e recarregue a página.'
      : 'Não foi possível abrir este livro. O arquivo pode estar corrompido ou protegido por DRM.', true);
  }
}
function closeReader() {
  if (!R.open) return;
  flushProgress();
  R.token = null;
  try { PdfR.destroy(); } catch (e) { console.warn(e); }
  try { EpubR.destroy(); } catch (e) { console.warn(e); }
  try { R.lock && R.lock.release(); } catch {}
  R.lock = null; R.open = false; R.id = null; R.kind = null; R.sel = null; R.panel = null;
  $('#reader').hidden = true;
  render();
}
function toggleImmersive(force) { const r = $('#reader'); r.classList.toggle('immersive', force); }

/* ---------- seleção / trechos ---------- */
function showSel(p) { R.sel = p; $('#selPill').hidden = false; $('#reader').classList.remove('immersive'); }
function hideSel(src) { if (!R.sel || !src || R.sel.src === src) { R.sel = null; $('#selPill').hidden = true; } }
function saveSel(color) {
  const p = R.sel; if (!p) return;
  const withNote = color === 'note';
  const h = { id: uid('h'), kind: 'hl', bookId: R.id, text: p.text.slice(0, 6000), note: '', color: withNote ? 'y' : color, loc: p.loc, pct: p.pct || 0, createdAt: Date.now() };
  S.hls.set(h.id, h); persist(h.id);
  try { p.clear(); } catch {}
  hideSel();
  if (R.kind === 'epub') EpubR.addHl(h);
  if (withNote) openNote(h.id);
  else toast('Trecho salvo', { action: { label: 'Adicionar nota', fn: () => openNote(h.id) } });
  if (R.panel === 'hls') renderPanel();
}
document.addEventListener('selectionchange', debounce(() => {
  if (!R.open || R.kind !== 'pdf') return;
  const s = getSelection();
  if (!s || s.isCollapsed || !s.rangeCount) return hideSel('pdf');
  const n = s.anchorNode; const el = n && (n.nodeType === 1 ? n : n.parentElement);
  const pg = el && el.closest && el.closest('.pg');
  if (!pg || !$('#pdfView').contains(pg)) return hideSel('pdf');
  const text = s.toString().replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, ' ').trim();
  if (!text) return hideSel('pdf');
  showSel({ src: 'pdf', text, loc: { page: +pg.dataset.n }, pct: +pg.dataset.n / (PdfR.n || 1), clear: () => s.removeAllRanges() });
}, 220));

/* ---------- painel lateral ---------- */
function openPanel(name) {
  if (R.panel === name) return closePanel();
  R.panel = name; $('#rPanel').hidden = false;
  $$('.rtop [data-panel]').forEach(x => x.classList.toggle('on', x.dataset.panel === name));
  renderPanel();
}
function closePanel() { R.panel = null; $('#rPanel').hidden = true; $$('.rtop [data-panel]').forEach(x => x.classList.remove('on')); }
function renderPanel() {
  const name = R.panel, body = $('#rpBody'); if (!name) return;
  const b = S.books.get(R.id);
  if (name === 'toc') {
    $('#rpTitle').textContent = 'Sumário';
    const toc = R.kind === 'pdf' ? PdfR.toc : EpubR.toc;
    let html = '';
    if (R.kind === 'pdf') html += `<div class="field" style="margin-bottom:14px"><label for="jump">Ir para a página</label><div style="display:flex;gap:8px"><input id="jump" inputmode="numeric" placeholder="1 – ${PdfR.n || ''}" style="flex:1;padding:8px 10px;border-radius:8px;border:1px solid var(--r-line);background:transparent"><button class="btn sm" id="jumpGo">Ir</button></div></div>`;
    if (!toc) html += '<p class="rempty">Carregando sumário…</p>';
    else if (!toc.length) html += '<p class="rempty">Este livro não tem sumário.</p>';
    else {
      let curIdx = -1;
      if (R.kind === 'pdf') toc.forEach((t, i) => { if (t.page && t.page <= (PdfR.cur || 1)) curIdx = i; });
      else curIdx = toc.findIndex(t => t.label === EpubR.chapter);
      html += `<div class="toc">${toc.map((t, i) => `<button data-toc="${i}" class="${i === curIdx ? 'cur' : ''}" style="padding-left:${8 + t.depth * 16}px">${esc(t.label)}${t.page ? `<small>${t.page}</small>` : ''}</button>`).join('')}</div>`;
    }
    body.innerHTML = html;
    const cur = body.querySelector('.toc .cur'); if (cur) cur.scrollIntoView({ block: 'center' });
    const jg = $('#jumpGo');
    if (jg) { const go = () => { const n = parseInt($('#jump').value, 10); if (n) { PdfR.goTo(clamp(n, 1, PdfR.n)); if (innerWidth < 900) closePanel(); } }; jg.onclick = go; $('#jump').onkeydown = e => { if (e.key === 'Enter') go(); }; }
  } else if (name === 'hls') {
    $('#rpTitle').textContent = 'Trechos deste livro';
    const hs = hlsOf(R.id);
    body.innerHTML = hs.length ? hs.map(h => `<div class="rhl" style="--mkr:${MK[h.color || 'y']}${readerTheme() === 'noite' ? '88' : 'cc'}">
        <blockquote data-rgo="${h.id}"><span>${esc(h.text)}</span></blockquote>${h.note ? `<div class="note">${esc(h.note)}</div>` : ''}
        <footer><span>${esc(h.loc.page ? 'p. ' + h.loc.page : (h.loc.chapter ? h.loc.chapter + ' · ' : '') + pct(h.pct))}</span><span class="sp"></span>
        <button data-rgo="${h.id}">Ir</button><button data-act="note" data-id="${h.id}">Nota</button><button data-act="delhl" data-id="${h.id}">Excluir</button></footer></div>`).join('')
      : '<p class="rempty">Selecione um trecho do texto e escolha uma cor para salvá-lo aqui. Os trechos também aparecem na seção “Trechos salvos” da estante.</p>';
  } else if (name === 'set') {
    $('#rpTitle').textContent = 'Ajustes de leitura';
    const th = [['auto', 'Auto', 'linear-gradient(135deg,#FAFAF6 50%,#151716 50%)', '#1D201E'], ['claro', 'Claro', '#FAFAF6', '#1D201E'], ['sepia', 'Sépia', '#F4EAD5', '#3A2E21'], ['noite', 'Noite', '#151716', '#D4D0C7']];
    let html = `<div class="rset"><div><h4>Tema</h4><div class="themes">${th.map(([k, l, bg, fg]) => `<button data-rt="${k}" class="${rset.theme === k ? 'on' : ''}"><i style="background:${bg};color:${fg}">${k === 'auto' ? '' : 'Aa'}</i>${l}</button>`).join('')}</div></div>`;
    if (R.kind === 'epub') {
      html += `<div><h4>Tamanho do texto</h4><div class="stepper"><button data-fs="-10" aria-label="Diminuir texto">A−</button><output>${rset.fontSize}%</output><button data-fs="10" aria-label="Aumentar texto">A+</button></div></div>
        <div><h4>Espaçamento entre linhas</h4><div class="rseg">${[[1.4, 'Compacto'], [1.6, 'Normal'], [1.9, 'Amplo']].map(([v, l]) => `<button data-lh="${v}" class="${rset.lineHeight === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>
        <div><h4>Fonte</h4><div class="rseg">${[['literata', 'Literata'], ['original', 'Do livro'], ['sans', 'Sem serifa']].map(([v, l]) => `<button data-ff="${v}" class="${rset.font === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>
        <div><h4>Modo de leitura</h4><div class="rseg">${[['paginated', 'Páginas'], ['scrolled', 'Rolagem']].map(([v, l]) => `<button data-flow="${v}" class="${rset.flow === v ? 'on' : ''}">${l}</button>`).join('')}</div></div>`;
    } else {
      html += `<div><h4>Zoom</h4><div class="stepper"><button data-zoom="-0.1" aria-label="Diminuir zoom">−</button><output>${Math.round(PdfR.zoom * 100)}%</output><button data-zoom="0.1" aria-label="Aumentar zoom">+</button></div>
        <button class="btn sm" data-zoom="reset" style="margin-top:10px">Ajustar à largura</button></div>`;
    }
    if (b) html += `<div><h4>Status do livro</h4><div class="rseg">${Object.entries(STATUS).map(([k, l]) => `<button data-rst="${k}" class="${b.status === k ? 'on' : ''}">${l}</button>`).join('')}</div></div>`;
    body.innerHTML = html + '</div>';
  }
}
$('#rPanel').addEventListener('click', e => {
  const t = e.target.closest('button,blockquote'); if (!t) return;
  const d = t.dataset;
  if (d.toc != null) {
    const it = (R.kind === 'pdf' ? PdfR.toc : EpubR.toc)[+d.toc];
    if (it) { R.kind === 'pdf' ? (it.page && PdfR.goTo(it.page)) : EpubR.display(it.href); }
    if (innerWidth < 900) closePanel();
  } else if (d.rgo) { const h = S.hls.get(d.rgo); if (h) gotoLoc(h); if (innerWidth < 900) closePanel(); }
  else if (d.rt) { rset.theme = d.rt; saveRset(); applyReaderTheme(); renderPanel(); }
  else if (d.fs) { rset.fontSize = clamp(rset.fontSize + +d.fs, 70, 200); saveRset(); EpubR.restyle(true); renderPanel(); }
  else if (d.lh) { rset.lineHeight = +d.lh; saveRset(); EpubR.restyle(true); renderPanel(); }
  else if (d.ff) { rset.font = d.ff; saveRset(); EpubR.restyle(true); renderPanel(); }
  else if (d.flow) { if (rset.flow !== d.flow) { rset.flow = d.flow; saveRset(); const cfi = EpubR.cfi; const id = R.id; closeReader(); openBook(id, cfi ? { cfi } : null); } }
  else if (d.zoom) { PdfR.setZoom(d.zoom === 'reset' ? 1 : PdfR.zoom + +d.zoom); renderPanel(); }
  else if (d.rst) { const b = S.books.get(R.id); if (b) { b.status = d.rst; persist(b.id); renderPanel(); } }
});
function gotoLoc(h) { if (R.kind === 'pdf' && h.loc.page) PdfR.goTo(h.loc.page); else if (R.kind === 'epub' && h.loc.cfi) EpubR.display(h.loc.cfi); }

/* ---------- PDF ---------- */
if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
const PdfR = {
  pdf: null, n: 0, cur: 1, zoom: 1, toc: null,
  async open(buf, b, goto, tok) {
    this.toc = null; this.cur = 1;
    this.pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf), isEvalSupported: false }).promise;
    if (R.token !== tok) { this.pdf.destroy(); this.pdf = null; return; }
    this.n = this.pdf.numPages;
    const p1 = await this.pdf.getPage(1); const v = p1.getViewport({ scale: 1 });
    this.sizes = Array.from({ length: this.n }, () => [v.width, v.height]);
    this.view = $('#pdfView'); this.wrap = $('#pages'); this.wrap.innerHTML = '';
    this.els = []; const frag = document.createDocumentFragment();
    for (let i = 1; i <= this.n; i++) { const d = document.createElement('div'); d.className = 'pg'; d.dataset.n = i; d.innerHTML = `<span class="pgno">${i}</span>`; frag.append(d); this.els.push(d); }
    this.wrap.append(frag);
    this.zoom = rset.pdfZoom || 1; this.rendered = new Map(); this.want = new Set();
    this.view.hidden = false;
    this.lastW = this.view.clientWidth;
    this.layout();
    this.io = new IntersectionObserver(es => {
      for (const e of es) { const i = +e.target.dataset.n; if (e.isIntersecting) this.want.add(i); else { this.want.delete(i); this.unrender(i); } }
      this.pump();
    }, { root: this.view, rootMargin: '1400px 0px' });
    this.els.forEach(e => this.io.observe(e));
    this.onScroll = () => { if (!this.raf) this.raf = requestAnimationFrame(() => { this.raf = 0; this.track(); }); };
    this.view.addEventListener('scroll', this.onScroll, { passive: true });
    this.ro = new ResizeObserver(debounce(() => { if (!this.pdf) return; const w = this.view.clientWidth; if (Math.abs(w - this.lastW) > 2) { this.lastW = w; const c = this.cur, f = this.frac(); this.layout(); this.goTo(c, f); } }, 150));
    this.ro.observe(this.view);
    this.onTap = e => { if (e.pointerType !== 'touch') return; const s = getSelection(); if (s && !s.isCollapsed) return; if (Math.abs(e.clientX - (this.px || 0)) > 8 || Math.abs(e.clientY - (this.py || 0)) > 8) return; toggleImmersive(); };
    this.onDown = e => { this.px = e.clientX; this.py = e.clientY; };
    this.view.addEventListener('pointerdown', this.onDown); this.view.addEventListener('pointerup', this.onTap);
    const bp = b.progress || {};
    const start = goto && goto.page ? goto.page : (bp.page || 1);
    this.goTo(clamp(start, 1, this.n), goto ? 0 : (bp.off || 0));
    const rg = $('#rRange'); rg.min = 1; rg.max = this.n; rg.step = 1; rg.disabled = this.n < 2;
    this.track(true);
    if (!b.pages || b.pages !== this.n) { b.pages = this.n; }
    this.loadOutline();
  },
  scale() { const W = this.view.clientWidth; const avail = Math.max(240, Math.min(W - (W < 600 ? 12 : 56), 960)); return avail / this.sizes[0][0] * this.zoom; },
  layout() {
    this.s = this.scale();
    this.els.forEach((el, k) => { const [w, h] = this.sizes[k]; el.style.width = Math.round(w * this.s) + 'px'; el.style.height = Math.round(h * this.s) + 'px'; el.style.setProperty('--scale-factor', this.s); });
    for (const i of [...this.rendered.keys()]) this.unrender(i);
    this.pump();
  },
  async pump() {
    if (this.busy) return; this.busy = true;
    try {
      while (this.pdf) {
        const next = [...this.want].filter(i => !this.rendered.has(i)).sort((a, b) => Math.abs(a - this.cur) - Math.abs(b - this.cur))[0];
        if (!next) break;
        await this.renderPage(next);
      }
    } finally { this.busy = false; }
  },
  async renderPage(i) {
    const el = this.els[i - 1], token = {}; this.rendered.set(i, token);
    try {
      const page = await this.pdf.getPage(i);
      const v1 = page.getViewport({ scale: 1 });
      if (Math.abs(v1.width - this.sizes[i - 1][0]) > 1 || Math.abs(v1.height - this.sizes[i - 1][1]) > 1) {
        this.sizes[i - 1] = [v1.width, v1.height]; el.style.width = Math.round(v1.width * this.s) + 'px'; el.style.height = Math.round(v1.height * this.s) + 'px';
      }
      const vp = page.getViewport({ scale: this.s }); const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const c = document.createElement('canvas'); c.width = Math.floor(vp.width * dpr); c.height = Math.floor(vp.height * dpr);
      token.task = page.render({ canvasContext: c.getContext('2d'), viewport: vp, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null });
      await token.task.promise;
      if (this.rendered.get(i) !== token) return;
      el.querySelectorAll('canvas,.textLayer').forEach(n => n.remove());
      const tl = document.createElement('div'); tl.className = 'textLayer';
      el.append(c, tl); el.classList.add('done');
      try { const t = pdfjsLib.renderTextLayer({ textContentSource: page.streamTextContent(), container: tl, viewport: vp, textDivs: [] }); await t.promise; } catch (e) { console.warn('texto', e); }
    } catch (e) {
      if (!e || e.name !== 'RenderingCancelledException') console.warn(e);
      if (this.rendered.get(i) === token) this.rendered.delete(i);
    }
  },
  unrender(i) {
    const t = this.rendered.get(i); if (!t) return;
    try { t.task && t.task.cancel(); } catch {}
    this.rendered.delete(i);
    const el = this.els[i - 1]; el.querySelectorAll('canvas,.textLayer').forEach(n => n.remove()); el.classList.remove('done');
  },
  idxAt() {
    const y = this.view.scrollTop + this.view.clientHeight * 0.35;
    let lo = 0, hi = this.n - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (this.els[m].offsetTop <= y) lo = m; else hi = m - 1; }
    return lo;
  },
  frac() { const el = this.els[this.cur - 1]; return el ? clamp((this.view.scrollTop - el.offsetTop) / el.offsetHeight, 0, 1) : 0; },
  track(force) {
    if (!this.pdf) return;
    const cur = this.idxAt() + 1;
    if (cur !== this.cur || force) {
      this.cur = cur;
      $('#rLeft').innerHTML = `p. <input id="pgIn" inputmode="numeric" value="${cur}" aria-label="Página atual"> de ${this.n}`;
      $('#rRight').textContent = pct(cur / this.n);
      $('#rRange').value = cur;
      if (cur === this.n && this.n > 1) { const b = S.books.get(R.id); $('#endNote').hidden = !b || b.status === 'lido'; } else $('#endNote').hidden = true;
      if (R.panel === 'toc') renderPanel();
    }
    if (!force) saveProgress({ page: cur, total: this.n, pct: cur / this.n, off: +this.frac().toFixed(3) });
  },
  goTo(n, frac = 0) { const el = this.els[n - 1]; if (!el) return; this.view.scrollTop = el.offsetTop - (frac ? 0 : 60) + frac * el.offsetHeight; this.cur = n; this.track(true); },
  setZoom(z) { const c = this.cur, f = this.frac(); this.zoom = clamp(Math.round(z * 10) / 10, 0.5, 3); rset.pdfZoom = this.zoom; saveRset(); this.layout(); this.goTo(c, f); },
  async loadOutline() {
    const pdf = this.pdf;
    try { const o = await pdf.getOutline(); const out = []; if (o) await this.flat(pdf, o, 0, out); if (this.pdf === pdf) this.toc = out; }
    catch { if (this.pdf === pdf) this.toc = []; }
    if (R.panel === 'toc') renderPanel();
  },
  async flat(pdf, items, depth, out) {
    for (const it of items) {
      let page = null;
      try {
        let d = it.dest; if (typeof d === 'string') d = await pdf.getDestination(d);
        if (Array.isArray(d) && d[0] != null) page = typeof d[0] === 'object' ? (await pdf.getPageIndex(d[0])) + 1 : d[0] + 1;
      } catch {}
      out.push({ label: it.title || '—', page, depth });
      if (it.items && it.items.length && depth < 3) await this.flat(pdf, it.items, depth + 1, out);
    }
  },
  destroy() {
    if (!this.pdf && !this.io) return;
    this.io && this.io.disconnect(); this.ro && this.ro.disconnect();
    if (this.view) { this.view.removeEventListener('scroll', this.onScroll); this.view.removeEventListener('pointerdown', this.onDown); this.view.removeEventListener('pointerup', this.onTap); this.view.hidden = true; }
    for (const i of [...(this.rendered || new Map()).keys()]) this.unrender(i);
    try { this.pdf && this.pdf.destroy(); } catch {}
    this.pdf = null; this.io = null; this.ro = null; this.toc = null;
    if (this.wrap) this.wrap.innerHTML = '';
  }
};

/* ---------- EPUB ---------- */
const EPUB_THEMES = { claro: { bg: '#FAFAF6', fg: '#1D201E' }, sepia: { bg: '#F4EAD5', fg: '#3A2E21' }, noite: { bg: '#151716', fg: '#D4D0C7' } };
const FONT_STACK = { literata: '"Literata", Georgia, serif', sans: '"Instrument Sans", system-ui, -apple-system, sans-serif', original: '' };
const EpubR = {
  book: null, rend: null, toc: null, cfi: null, pct: 0, chapter: '',
  async open(buf, b, goto, tok) {
    this.toc = null; this.cfi = null; this.chapter = ''; this.flatToc = [];
    const book = this.book = ePub(buf);
    $('#epubWrap').hidden = false;
    const el = $('#epubView'); el.innerHTML = '';
    const scrolled = rset.flow === 'scrolled';
    this.rend = book.renderTo(el, { width: '100%', height: '100%', flow: scrolled ? 'scrolled-doc' : 'paginated', spread: 'auto', minSpreadWidth: 1000, allowScriptedContent: false, method: 'write' });
    $('#ePrev').hidden = scrolled; $('#eNext').hidden = scrolled;
    this.rend.hooks.content.register(contents => this.onContent(contents));
    this.rend.on('relocated', loc => this.onRelocated(loc));
    this.rend.on('selected', (cfiRange, contents) => {
      let text = '';
      try { text = this.rend.getRange(cfiRange).toString(); } catch { try { text = contents.window.getSelection().toString(); } catch {} }
      text = text.replace(/[ \t]+/g, ' ').trim();
      if (!text) return;
      showSel({ src: 'epub', text, loc: { cfi: cfiRange, chapter: this.chapter || '' }, pct: this.pct, clear: () => { try { contents.window.getSelection().removeAllRanges(); } catch {} } });
    });
    book.loaded.navigation.then(nav => {
      if (this.book !== book) return;
      const out = []; const walk = (items, d) => items.forEach(it => { out.push({ label: (it.label || '').trim() || '—', href: it.href, depth: d }); if (it.subitems && it.subitems.length && d < 3) walk(it.subitems, d + 1); });
      walk(nav.toc || [], 0); this.toc = out;
      this.flatToc = out.map(t => ({ ...t, base: String(t.href || '').split('#')[0].replace(/^(\.\.\/)+/, '') }));
      if (this.cfi && this.lastHref) this.chapter = this.chapterOf(this.lastHref);
      if (R.panel === 'toc') renderPanel();
    }).catch(() => { this.toc = []; });
    const target = goto && goto.cfi ? goto.cfi : (b.progress && b.progress.cfi) || undefined;
    try { await this.rend.display(target); } catch (e) { console.warn(e); await this.rend.display(); }
    if (R.token !== tok) return;
    for (const h of hlsOf(b.id)) this.addHl(h);
    const key = 'loc:' + b.id; const saved = ls.get(key, null);
    if (saved) { try { book.locations.load(saved); this.locReady(); } catch {} }
    if (!book.locations.length()) {
      book.ready.then(() => book.locations.generate(1600)).then(() => {
        if (this.book !== book) return;
        try { ls.set(key, book.locations.save()); } catch {}
        this.locReady();
      }).catch(e => console.warn('locations', e));
    }
  },
  locReady() {
    if (!this.book || !this.book.locations.length()) return;
    const rg = $('#rRange'); rg.min = 0; rg.max = 1000; rg.step = 1; rg.disabled = false;
    if (this.cfi) { this.pct = this.book.locations.percentageFromCfi(this.cfi) || 0; rg.value = Math.round(this.pct * 1000); this.updateInfo(); }
  },
  onContent(contents) {
    const doc = contents.document;
    try { const l = doc.createElement('link'); l.rel = 'stylesheet'; l.href = FONTS_URL; doc.head.append(l); } catch {}
    const st = doc.createElement('style'); st.id = 'estante-style'; doc.head.append(st);
    this.styleDoc(doc);
    doc.addEventListener('selectionchange', () => { const s = doc.getSelection(); if (!s || s.isCollapsed) hideSel('epub'); });
    doc.addEventListener('click', e => this.tap(e, contents));
    let sx = 0, sy = 0, stt = 0;
    doc.addEventListener('touchstart', e => { const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; stt = Date.now(); }, { passive: true });
    doc.addEventListener('touchend', e => {
      if (rset.flow === 'scrolled') return;
      const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      const s = doc.getSelection(); if (s && !s.isCollapsed) return;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - stt < 700) { this.lastSwipe = Date.now(); dx < 0 ? this.next() : this.prev(); }
    }, { passive: true });
    doc.addEventListener('keydown', onReaderKey);
  },
  css() {
    const t = EPUB_THEMES[readerTheme()] || EPUB_THEMES.claro, ff = FONT_STACK[rset.font];
    const force = readerTheme() !== 'claro';
    return `html,body{background:${t.bg} !important;color:${t.fg} !important}
      body{font-size:${rset.fontSize}% !important;line-height:${rset.lineHeight} !important;${ff ? `font-family:${ff} !important;` : ''}-webkit-text-size-adjust:100%;text-rendering:optimizeLegibility}
      ${ff ? 'body p,body div,body span,body li,body blockquote,body td,body dd,body dt,body em,body i,body b,body strong,body a{font-family:inherit !important}' : ''}
      p,li,blockquote,dd{line-height:inherit !important}
      ${force ? 'body *{color:inherit !important;background-color:transparent !important;border-color:currentColor}' : ''}
      a{color:inherit !important}
      img,svg,video{max-width:100% !important;height:auto}
      ::selection{background:rgba(242,207,74,.5)}`;
  },
  styleDoc(doc) { const st = doc.getElementById('estante-style'); if (st) st.textContent = this.css(); },
  restyle(reflow) {
    if (!this.rend) return;
    try { this.rend.getContents().forEach(c => this.styleDoc(c.document)); } catch {}
    const t = EPUB_THEMES[readerTheme()] || EPUB_THEMES.claro;
    $('#epubView').style.background = t.bg;
    if (reflow && this.cfi) { const cfi = this.cfi; clearTimeout(this.rt); this.rt = setTimeout(() => { try { this.rend.resize(); this.rend.display(cfi); } catch {} }, 180); }
  },
  tap(e, contents) {
    if (e.target && e.target.closest && e.target.closest('a')) return;
    const s = contents.document.getSelection(); if (s && !s.isCollapsed) return;
    if (Date.now() - (this.lastSwipe || 0) < 450) return;
    if (rset.flow === 'scrolled') return toggleImmersive();
    const fr = contents.document.defaultView.frameElement; const cr = $('#epubView').getBoundingClientRect();
    const x = (fr ? fr.getBoundingClientRect().left : cr.left) + e.clientX; const rel = (x - cr.left) / cr.width;
    if (rel < 0.28) this.prev(); else if (rel > 0.72) this.next(); else toggleImmersive();
  },
  onRelocated(loc) {
    if (!loc || !loc.start) return;
    this.cfi = loc.start.cfi; this.lastHref = loc.start.href;
    if (this.book.locations.length()) this.pct = this.book.locations.percentageFromCfi(this.cfi) || 0;
    else if (typeof loc.start.percentage === 'number' && loc.start.percentage > 0) this.pct = loc.start.percentage;
    this.chapter = this.chapterOf(loc.start.href);
    hideSel('epub');
    if (this.book.locations.length()) $('#rRange').value = Math.round(this.pct * 1000);
    this.updateInfo();
    const b = S.books.get(R.id);
    $('#endNote').hidden = !(loc.atEnd && b && b.status !== 'lido');
    saveProgress({ cfi: this.cfi, pct: loc.atEnd ? 1 : +this.pct.toFixed(4), chapter: this.chapter });
    if (R.panel === 'toc') renderPanel();
  },
  updateInfo() {
    $('#rLeft').textContent = this.chapter || '';
    $('#rRight').textContent = this.book && this.book.locations.length() ? pct(this.pct) : 'calculando…';
  },
  chapterOf(href) {
    if (!href) return '';
    let best = '';
    for (const t of this.flatToc || []) if (t.base && (href === t.base || href.endsWith('/' + t.base) || href.endsWith(t.base))) { best = t.label; break; }
    return best;
  },
  addHl(h) {
    if (!this.rend || !h.loc || !h.loc.cfi) return;
    try { this.rend.annotations.highlight(h.loc.cfi, { id: h.id }, () => openNote(h.id), 'ehl', { fill: MK[h.color || 'y'], 'fill-opacity': '0.38', 'mix-blend-mode': readerTheme() === 'noite' ? 'normal' : 'multiply' }); } catch (e) { console.warn(e); }
  },
  removeHl(h) { if (!this.rend || !h.loc || !h.loc.cfi) return; try { this.rend.annotations.remove(h.loc.cfi, 'highlight'); } catch {} },
  display(t) { if (this.rend) this.rend.display(t).catch(e => console.warn(e)); },
  next() { if (this.rend) this.rend.next(); },
  prev() { if (this.rend) this.rend.prev(); },
  destroy() {
    if (!this.book && !this.rend) return;
    try { this.rend && this.rend.destroy(); } catch {}
    try { this.book && this.book.destroy(); } catch {}
    this.rend = null; this.book = null; this.toc = null;
    $('#epubView').innerHTML = ''; $('#epubWrap').hidden = true;
  }
};

/* ---------- controles do leitor ---------- */
$('#rBack').onclick = closeReader;
$('#rLoadBack').onclick = closeReader;
$('#rShow').onclick = () => toggleImmersive(false);
$('#rpClose').onclick = closePanel;
$('#ePrev').onclick = () => EpubR.prev();
$('#eNext').onclick = () => EpubR.next();
$('#markRead').onclick = () => { const b = S.books.get(R.id); if (b) { b.status = 'lido'; b.progress = { ...(b.progress || {}), pct: 1 }; persist(b.id); } $('#endNote').hidden = true; toast('Marcado como lido'); };
$$('.rtop [data-panel]').forEach(b => b.onclick = () => openPanel(b.dataset.panel));
$('#selPill').addEventListener('mousedown', e => e.preventDefault());
$('#selPill').addEventListener('click', e => { const t = e.target.closest('[data-hlc]'); if (t) saveSel(t.dataset.hlc); });
const rg = $('#rRange');
rg.addEventListener('input', () => {
  if (R.kind === 'pdf') { $('#rRight').textContent = `→ p. ${rg.value}`; }
  else $('#rRight').textContent = `→ ${Math.round(rg.value / 10)}%`;
});
rg.addEventListener('change', () => {
  if (R.kind === 'pdf') PdfR.goTo(+rg.value);
  else if (EpubR.book && EpubR.book.locations.length()) EpubR.display(EpubR.book.locations.cfiFromPercentage(rg.value / 1000));
});
$('#rLeft').addEventListener('change', e => { if (e.target.id === 'pgIn') { const n = parseInt(e.target.value, 10); if (n) PdfR.goTo(clamp(n, 1, PdfR.n)); } });
$('#rLeft').addEventListener('keydown', e => { if (e.target.id === 'pgIn' && e.key === 'Enter') e.target.blur(); });
function onReaderKey(e) {
  if (!R.open) return;
  const tg = e.target; if (tg && tg.matches && tg.matches('input,textarea,select')) return;
  if (e.key === 'Escape') { if (!$('#modal').hidden) Modal.close(); else if (R.panel) closePanel(); else closeReader(); return; }
  if (!$('#modal').hidden) return;
  if (R.kind === 'epub' && rset.flow !== 'scrolled') {
    if (['ArrowRight', 'PageDown'].includes(e.key)) { e.preventDefault(); EpubR.next(); }
    else if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); EpubR.prev(); }
  }
}
document.addEventListener('keydown', e => { if (R.open) return onReaderKey(e); if (e.key === 'Escape') { if (!$('#modal').hidden) Modal.close(); else $('#shell').classList.remove('drawer'); } });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushProgress(); else if (R.open && !R.lock) wakeLock(); });
window.addEventListener('pagehide', flushProgress);
window.addEventListener('resize', debounce(() => { if (R.open && R.kind === 'epub' && EpubR.rend) { const cfi = EpubR.cfi; try { EpubR.rend.resize(); if (cfi) EpubR.display(cfi); } catch {} } }, 250));

/* ================= eventos da estante ================= */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (!t) return;
  const a = t.dataset.act, id = t.dataset.id;
  if (t.closest('#modal') && Modal.handler && !['open', 'close', 'note', 'delhl', 'copyhl', 'gohl'].includes(a)) { Modal.handler(t); return; }
  switch (a) {
    case 'nav': nav(t); break;
    case 'open': e.stopPropagation(); openBook(id); break;
    case 'details': e.stopPropagation(); openDetails(id); break;
    case 'close': Modal.close(); break;
    case 'logout': if (sb) sb.auth.signOut().finally(() => location.reload()); break;
    case 'drawer': $('#shell').classList.add('drawer'); break;
    case 'note': openNote(id); break;
    case 'delhl': deleteHl(id); break;
    case 'copyhl': { const h = S.hls.get(id); if (h) { const b = S.books.get(h.bookId); copyText(`“${h.text}”${b ? `\n— ${b.title}${authorOf(b) ? ', ' + authorOf(b) : ''}${h.loc.page ? ', p. ' + h.loc.page : ''}` : ''}${h.note ? `\n\nNota: ${h.note}` : ''}`); } break; }
    case 'gohl': { const h = S.hls.get(id); if (h) openBook(h.bookId, h.loc.page ? { page: h.loc.page } : { cfi: h.loc.cfi }); break; }
  }
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('article[data-act="open"]')) { e.preventDefault(); openBook(e.target.dataset.id); }
});
$('#scrim').onclick = () => $('#shell').classList.remove('drawer');
$('#view').addEventListener('input', e => {
  if (e.target.id === 'q') { S.v.q = e.target.value; renderView(); }
  else if (e.target.id === 'hq') { S.v.hq = e.target.value; renderView(); }
});
$('#view').addEventListener('change', e => {
  if (e.target.id === 'sort') { S.v.sort = e.target.value; ls.set('sort', S.v.sort); renderView(); }
  else if (e.target.id === 'group') { S.v.group = e.target.value; ls.set('group', S.v.group); renderView(); }
  else if (e.target.id === 'hbook') { S.v.hbook = e.target.value; renderView(); }
});
$('#fileIn').addEventListener('change', e => { const f = [...e.target.files]; e.target.value = ''; $('#shell').classList.remove('drawer'); importFiles(f); });
let dragDepth = 0;
window.addEventListener('dragenter', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) { dragDepth++; $('#drop').hidden = false; e.preventDefault(); } });
window.addEventListener('dragover', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
window.addEventListener('dragleave', () => { dragDepth = Math.max(0, dragDepth - 1); if (!dragDepth) $('#drop').hidden = true; });
window.addEventListener('drop', e => { e.preventDefault(); dragDepth = 0; $('#drop').hidden = true; if (e.dataTransfer && e.dataTransfer.files.length) importFiles(e.dataTransfer.files); });

renderSide(); renderBnav();
initStore();
})();
