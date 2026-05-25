// =============================================================
// HIMAIF — Core App v2 (State, Auth, Navigation, Utils)
// 3 Roles: 'public' | 'pengurus' | 'admin'
// =============================================================

// ============================================================
// STATE
// ============================================================
const STATE = {
  role: 'public',          // 'public' | 'pengurus' | 'admin'
  user: null,              // { id, username, role, display_name }
  currentPage: 'home',
  activePeriode: '2024/2025',
  settings: {},
  cache: {},
};

// Convenience getters
const isAdmin    = () => STATE.role === 'admin';
const isPengurus = () => STATE.role === 'pengurus' || STATE.role === 'admin';
const isPublic   = () => STATE.role === 'public';

// Pages accessible only to pengurus+admin
const PENGURUS_PAGES = ['arsip', 'proker', 'dashboard', 'rapat', 'aspirasi'];
// Pages only for admin
const ADMIN_PAGES    = ['admin'];
// All restricted pages (not shown to public)
const RESTRICTED_PAGES = [...PENGURUS_PAGES, ...ADMIN_PAGES];

// ============================================================
// CACHE
// ============================================================
const CACHE_TTL = 60000;
function cacheGet(key) {
  const e = STATE.cache[key];
  if (!e) return null;
  if (Date.now() - e.ts > CACHE_TTL) { delete STATE.cache[key]; return null; }
  return e.data;
}
function cacheSet(key, data) { STATE.cache[key] = { data, ts: Date.now() }; }
function cacheClear(prefix) { Object.keys(STATE.cache).forEach(k => { if (k.startsWith(prefix)) delete STATE.cache[k]; }); }

// ============================================================
// TOAST
// ============================================================
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span style="flex:1;">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0'; toast.style.transform = 'translateX(110%)';
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ============================================================
// LOADING / EMPTY
// ============================================================
function setLoading(id, isLoad, msg = 'Memuat data...') {
  const el = document.getElementById(id);
  if (el && isLoad) el.innerHTML = `<div class="loading-wrap"><div class="spinner"></div><div class="loading-text">${msg}</div></div>`;
}
function emptyState(icon, title, desc, action = '') {
  return `<div class="empty-state"><div class="empty-icon">${icon}</div><div class="empty-title">${title}</div><div class="empty-desc">${desc}</div>${action}</div>`;
}

// ============================================================
// AUTH — login / logout
// ============================================================
async function doLogin(usernameVal, passwordVal) {
  const pwdInput = document.getElementById('login-pwd');
  const userInput = document.getElementById('login-username');
  try {
    const user = await DB_AUTH.login(usernameVal, passwordVal);
    if (!user) {
      showToast('Username atau password salah!', 'error');
      if (pwdInput) { pwdInput.style.borderColor = 'var(--danger)'; setTimeout(() => pwdInput.style.borderColor = '', 1500); }
      return;
    }
    STATE.role = user.role;
    STATE.user = user;
    closeModal('login-modal');
    updateSidebar();
    updateTopbar();
    showToast(`Selamat datang, ${user.display_name || user.username}! 🎉`, 'success');
    // If currently on a restricted page, redirect to home
    if (RESTRICTED_PAGES.includes(STATE.currentPage) && !canAccessPage(STATE.currentPage)) {
      navigate('home');
    } else {
      renderPage(STATE.currentPage);
    }
  } catch (e) {
    showToast('Terjadi kesalahan: ' + e.message, 'error');
  }
}

function doLogout() {
  STATE.role = 'public';
  STATE.user = null;
  updateSidebar();
  updateTopbar();
  showToast('Berhasil logout.', 'info');
  navigate('home');
}

function canAccessPage(page) {
  if (ADMIN_PAGES.includes(page))    return isAdmin();
  if (PENGURUS_PAGES.includes(page)) return isPengurus();
  return true; // public page
}

// ============================================================
// NAVIGATION
// ============================================================
const PAGE_TITLES = {
  home: 'Beranda', about: 'Tentang HIMAIF & Prodi', pengurus: 'Data Pengurus',
  arsip: 'Arsip & LPJ', proker: 'Program Kerja', achievement: 'Pencapaian',
  materi: 'Bank Materi', projects: 'Galeri Project', blog: 'Tech Blog',
  rapat: 'Catatan Rapat', aspirasi: 'Kotak Aspirasi', dashboard: 'Dashboard',
  admin: 'Panel Admin',
};

function navigate(page) {
  // Access guard
  if (!canAccessPage(page)) {
    showToast('Halaman ini memerlukan login terlebih dahulu.', 'warning');
    openModal('login-modal');
    return;
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) { target.classList.add('active'); STATE.currentPage = page; }
  document.querySelectorAll(`.nav-item[data-page="${page}"]`).forEach(n => n.classList.add('active'));
  const titleEl = document.getElementById('topbar-title');
  if (titleEl) titleEl.textContent = PAGE_TITLES[page] || 'HIMAIF';
  closeSidebar();
  window.scrollTo(0, 0);
  renderPage(page);
}

async function renderPage(page) {
  switch (page) {
    case 'home':        await renderHome(); break;
    case 'about':       renderAbout(); break;
    case 'pengurus':    await renderPengurus(); break;
    case 'arsip':       await renderArsip(); break;
    case 'proker':      await renderProker(); break;
    case 'achievement': await renderAchievement(); break;
    case 'materi':      await renderMateri(); break;
    case 'projects':    await renderProjects(); break;
    case 'blog':        await renderBlog(); break;
    case 'rapat':       await renderRapat(); break;
    case 'aspirasi':    await renderAspirasi(); break;
    case 'dashboard':   await renderDashboard(); break;
    case 'admin':       renderAdmin(); break;
  }
}

// ============================================================
// SIDEBAR — dynamic based on role
// ============================================================
function updateSidebar() {
  const logo = STATE.settings.logo_url || '';
  const logoHtml = logo
    ? `<img src="${logo}" alt="HIMAIF Logo" style="width:42px;height:42px;border-radius:12px;object-fit:contain;background:#fff;padding:2px;">`
    : `<div class="sidebar-brand-icon">💻</div>`;

  // Build nav sections based on role
  const publicPages = [
    { page:'home',        icon:'🏠', label:'Beranda' },
    { page:'about',       icon:'ℹ️',  label:'Tentang HIMAIF & Prodi' },
  ];
  const himaifPages = [
    { page:'pengurus', icon:'👥', label:'Data Pengurus' },
  ];
  const orgPages = [
    { page:'arsip',    icon:'📁', label:'Arsip & LPJ' },
    { page:'proker',   icon:'📋', label:'Program Kerja' },
    { page:'rapat',    icon:'📝', label:'Catatan Rapat' },
    { page:'dashboard',icon:'📊', label:'Dashboard' },
  ];
  const mahasiswaPages = [
    { page:'achievement', icon:'🏆', label:'Pencapaian Prodi' },
    { page:'materi',      icon:'📚', label:'Bank Materi' },
    { page:'projects',    icon:'💡', label:'Galeri Project' },
    { page:'blog',        icon:'✍️',  label:'Tech Blog' },
    { page:'aspirasi',    icon:'📢', label:'Kotak Aspirasi' },
  ];

  function navItems(pages) {
    return pages.map(p => `
      <button class="nav-item${STATE.currentPage === p.page ? ' active' : ''}" data-page="${p.page}" onclick="navigate('${p.page}')">
        <span class="nav-icon">${p.icon}</span>${p.label}
      </button>`).join('');
  }

  // Build auth section (bottom of sidebar)
  let authSection = '';
  if (STATE.role === 'public') {
    authSection = `
      <div class="sidebar-section">
        <div class="sidebar-label">Akun</div>
        <button class="nav-item" onclick="openModal('login-modal')"><span class="nav-icon">🔑</span>Login</button>
      </div>`;
  } else {
    authSection = `
      <div class="sidebar-section">
        <div class="sidebar-label">Akun</div>
        <div class="nav-item" style="cursor:default;">
          <span class="nav-icon">${STATE.role === 'admin' ? '👑' : '🎓'}</span>
          <span style="font-size:12px;line-height:1.3;"><strong>${escapeHtml(STATE.user?.display_name || STATE.user?.username || '')}</strong><br><span style="color:var(--text-dim);font-size:11px;">${STATE.role === 'admin' ? 'Administrator' : 'Pengurus'}</span></span>
        </div>
        <button class="nav-item" onclick="doLogout()"><span class="nav-icon">🚪</span>Logout</button>
      </div>`;
  }

  // Admin section (only visible when admin)
  const adminSection = isAdmin() ? `
    <div class="sidebar-section">
      <div class="sidebar-label">Admin</div>
      <button class="nav-item${STATE.currentPage === 'admin' ? ' active' : ''}" data-page="admin" onclick="navigate('admin')"><span class="nav-icon">⚙️</span>Panel Admin</button>
    </div>` : '';

  // Organisasi section only for pengurus+
  const orgSection = isPengurus() ? `
    <div class="sidebar-section">
      <div class="sidebar-label">Organisasi</div>
      ${navItems(orgPages)}
    </div>` : '';

  const sidebarHtml = `
    <div class="sidebar-brand" onclick="navigate('home')" style="cursor:pointer;">
      ${logoHtml}
      <div class="sidebar-brand-text">
        <h2>HIMAIF</h2>
        <span>Teknik Informatika · UNIMA</span>
      </div>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-label">Utama</div>
      ${navItems(publicPages)}
    </div>

    <div class="sidebar-section">
      <div class="sidebar-label">HIMAIF</div>
      ${navItems(himaifPages)}
    </div>

    ${orgSection}

    <div class="sidebar-section">
      <div class="sidebar-label">Mahasiswa</div>
      ${navItems(mahasiswaPages)}
    </div>

    ${adminSection}
    ${authSection}

    <div class="sidebar-footer">
      HIMAIF © 2025 &nbsp;·&nbsp; <span>TI UNIMA</span>
      <div style="margin-top:6px;font-size:10px;color:var(--text-dim);opacity:0.7;">
        Project by <span style="color:var(--primary-light);font-weight:600;">Christian Tendean</span>
      </div>
    </div>`;

  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.innerHTML = sidebarHtml;
}

function updateTopbar() {
  const topbarRight = document.getElementById('topbar-right');
  if (!topbarRight) return;
  if (STATE.role === 'public') {
    topbarRight.innerHTML = `
      <div class="topbar-search-wrap">
        <span class="topbar-search-icon">🔍</span>
        <input type="text" class="topbar-search" placeholder="Cari halaman..." id="global-search" autocomplete="off">
      </div>
      <div class="admin-pill" id="login-pill" onclick="openModal('login-modal')">🔑 Login</div>`;
  } else {
    const roleLabel = STATE.role === 'admin' ? '👑 Admin' : '🎓 Pengurus';
    topbarRight.innerHTML = `
      <div class="topbar-search-wrap">
        <span class="topbar-search-icon">🔍</span>
        <input type="text" class="topbar-search" placeholder="Cari halaman..." id="global-search" autocomplete="off">
      </div>
      <div class="admin-pill" style="cursor:default;">
        <span class="admin-dot"></span>${roleLabel}: ${escapeHtml(STATE.user?.display_name || STATE.user?.username || '')}
        <button onclick="doLogout()" style="background:none;border:none;color:var(--accent);cursor:pointer;font-weight:700;margin-left:6px;font-size:13px;" title="Logout">✕</button>
      </div>`;
  }
  // Re-bind global search
  setTimeout(() => {
    const gs = document.getElementById('global-search');
    if (gs) gs.addEventListener('input', debounce(function() {
      const q = this.value.toLowerCase().trim();
      if (!q) return;
      const pages = [
        ['home','beranda'],['about','tentang himaif prodi'],['pengurus','pengurus anggota'],
        ['arsip','arsip lpj dokumentasi'],['proker','program kerja proker'],
        ['achievement','pencapaian prestasi'],['materi','materi ebook modul'],
        ['projects','project galeri karya'],['blog','blog artikel tutorial'],
        ['rapat','rapat notulen catatan'],['aspirasi','aspirasi saran kritik'],
        ['dashboard','dashboard statistik'],['admin','admin panel kelola'],
      ];
      const match = pages.find(([,kw]) => kw.split(' ').some(k => k.startsWith(q)));
      if (match) { navigate(match[0]); this.value = ''; }
    }, 400));
  }, 100);
}

// ============================================================
// MODALS
// ============================================================
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
    document.body.style.overflow = '';
  }
});

// ============================================================
// SIDEBAR MOBILE
// ============================================================
function openSidebar() {
  document.querySelector('.sidebar')?.classList.add('open');
  document.querySelector('.sidebar-overlay')?.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeSidebar() {
  document.querySelector('.sidebar')?.classList.remove('open');
  document.querySelector('.sidebar-overlay')?.classList.remove('show');
  document.body.style.overflow = '';
}

// ============================================================
// TABS
// ============================================================
function switchTab(ns, name, btn) {
  document.querySelectorAll(`[id^="${ns}-tab-"]`).forEach(el => el.classList.remove('active'));
  document.getElementById(`${ns}-tab-${name}`)?.classList.add('active');
  if (btn?.closest('.tabs')) {
    btn.closest('.tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
}

// ============================================================
// UTILITIES
// ============================================================
function formatDate(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' }); }
  catch { return d; }
}
function formatDateShort(d) {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }); }
  catch { return d; }
}
function formatCurrency(n) { return 'Rp ' + (n||0).toLocaleString('id-ID'); }
function initials(name) { return (name||'').split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase(); }
function escapeHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(str||''));
  return d.innerHTML;
}
function debounce(fn, delay) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), delay); }; }

function getStatusBadge(status) {
  const map = {
    aktif:['badge-blue','Belum Dimulai'], sedang_berjalan:['badge-amber','Sedang Berjalan'],
    selesai:['badge-green','Selesai'], dibatalkan:['badge-red','Dibatalkan'],
    published:['badge-green','Published'], pending:['badge-amber','⏳ Pending'],
    ditolak:['badge-red','Ditolak'], ditinjau:['badge-amber','Ditinjau'],
    diproses:['badge-blue','Diproses'], diterima:['badge-green','Diterima'],
    draft:['badge-gray','Draft'],
    Nasional:['badge-blue','🌐 Nasional'], Regional:['badge-teal','📍 Regional'],
    Internasional:['badge-purple','🌏 Internasional'], Prodi:['badge-gray','🏫 Prodi'],
  };
  const [cls, label] = map[status] || ['badge-gray', status||'—'];
  return `<span class="badge ${cls}">${label}</span>`;
}

// ============================================================
// EXPORT HELPERS
// ============================================================
function exportToCSV(headers, rows, filename) {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c||'').replace(/"/g,'""')}"`).join(','))].join('\n');
  const blob = new Blob(['\ufeff'+csv], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=filename+'.csv'; a.click();
  URL.revokeObjectURL(url);
  showToast(`Export "${filename}.csv" berhasil!`, 'success');
}
async function exportPengurusCSV(periode) {
  try { const d = await DB.getPengurus(periode); exportToCSV(['Nama','NIM','Divisi','Jabatan','Semester','Tgl Lahir','Periode'], d.map(m=>[m.nama,m.nim,m.divisi,m.jabatan,m.semester,m.tanggal_lahir,m.periode]), `pengurus-${periode.replace('/','_')}`); } catch(e){showToast('Gagal: '+e.message,'error');}
}
async function exportProkerCSV(periode) {
  try { const d = await DB.getProker(periode); exportToCSV(['Nama','Divisi','Ketua','Status','Progress%','Target','Anggaran'], d.map(p=>[p.nama,p.divisi,p.ketua,p.status,p.progress,p.target_tanggal,p.anggaran]), `proker-${periode.replace('/','_')}`); } catch(e){showToast('Gagal: '+e.message,'error');}
}
async function exportPencapaianCSV() {
  try { const d = await DB.getPencapaian(); exportToCSV(['Nama','Prestasi','Kategori','Level','Tanggal'], d.map(p=>[p.nama,p.prestasi,p.kategori,p.level,p.tanggal]), 'pencapaian-prodi-ti'); } catch(e){showToast('Gagal: '+e.message,'error');}
}
async function exportRapatCSV() {
  try { const d = await DB.getRapat(); exportToCSV(['Judul','Tanggal','Tempat','Jenis','Hadir','Total','Spontan','Notulis'], d.map(r=>[r.judul,r.tanggal,r.tempat,r.jenis,r.jumlah_hadir,r.jumlah_total,r.total_spontan,r.notulis]), 'catatan-rapat'); } catch(e){showToast('Gagal: '+e.message,'error');}
}
async function exportAspirasiCSV() {
  try { const d = await DB.getAspirasi(); exportToCSV(['Kategori','Pesan','Status','Tanggal'], d.map(a=>[a.kategori,a.pesan,a.status,a.created_at]), 'aspirasi-himaif'); } catch(e){showToast('Gagal: '+e.message,'error');}
}
async function exportAllPengurusCSV() {
  try { const d = await DB.getAllPengurus(); exportToCSV(['Nama','NIM','Divisi','Jabatan','Semester','Tgl Lahir','Periode'], d.map(m=>[m.nama,m.nim,m.divisi,m.jabatan,m.semester,m.tanggal_lahir,m.periode]), 'semua-pengurus-himaif'); } catch(e){showToast('Gagal: '+e.message,'error');}
}

// ============================================================
// SETTINGS INIT
// ============================================================
const SETTINGS_DEFAULTS = {
  nama_prodi: 'Teknik Informatika',
  nama_universitas: 'Universitas Negeri Manado (UNIMA)',
  visi_himaif: 'Menjadi himpunan mahasiswa yang inovatif, berdedikasi, dan berkontribusi nyata bagi pengembangan ilmu teknologi informasi di lingkungan Universitas Negeri Manado.',
  misi_himaif: '1. Meningkatkan kompetensi akademik dan non-akademik anggota.\n2. Memfasilitasi pengembangan bakat dan minat di bidang teknologi.\n3. Membangun jejaring dan kolaborasi antar sivitas akademika.\n4. Mendorong riset dan inovasi teknologi mahasiswa.\n5. Menjadi wadah aspirasi dan komunikasi antara mahasiswa dengan institusi.',
  visi_prodi: 'Menjadi program studi unggulan yang menghasilkan lulusan kompeten, inovatif, dan berdaya saing global di bidang teknologi informasi.',
  misi_prodi: '1. Menyelenggarakan pendidikan berkualitas tinggi di bidang teknik informatika.\n2. Mendorong penelitian yang relevan dengan kebutuhan industri.\n3. Membangun kemitraan dengan industri dan institusi dalam dan luar negeri.\n4. Mengembangkan karakter mahasiswa yang profesional dan berintegritas.',
  email_kontak: 'himaif@unima.ac.id',
  instagram: '@himaif_unima',
  logo_url: '',
  tentang_himaif: 'HIMAIF (Himpunan Mahasiswa Teknik Informatika) adalah organisasi kemahasiswaan resmi yang mewadahi seluruh mahasiswa Program Studi Teknik Informatika Universitas Negeri Manado. HIMAIF berfungsi sebagai jembatan antara mahasiswa dengan civitas akademika kampus.',
  periode_aktif: '2024/2025',
};

async function initSettings() {
  // Always set defaults first so app works even offline
  STATE.settings = { ...SETTINGS_DEFAULTS };
  try {
    const rows = await DB.getSettings();
    if (rows && typeof rows === 'object') {
      STATE.settings = { ...SETTINGS_DEFAULTS, ...rows };
    }
    const ap = await DB.getActivePeriode();
    if (ap) STATE.activePeriode = ap.nama;
  } catch (e) {
    console.warn('[HIMAIF] Supabase tidak tersedia, menggunakan data default:', e.message);
    // App continues with defaults — fully functional offline/without DB
  }
}

// Legacy compat shims (used in pages3.js)
const isAdminLegacy = () => isAdmin();