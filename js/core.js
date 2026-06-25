// =============================================================
<<<<<<< HEAD
// HIMAIF v2 — Core: State, Auth, Navigation, Utilities
// =============================================================

// ============================================================
// GLOBAL STATE
// ============================================================
const STATE = {
  role:          'public',      // 'public' | 'pengurus' | 'admin'
  username:      '',
  displayName:   '',
  activePeriode: '2024/2025',
  settings:      {},
  activePage:    'home',
};

const DIVISI_LIST = [
  'Inti',
  'Akademik & Keilmuan',
  'PSDM',
  'Kominfo',
  'Mikat',
  'Hubungan Masyarakat',
  'Kewirausahaan',
];

// Pages accessible by role
const PAGE_ACCESS = {
  home:        ['public','pengurus','admin'],
  about:       ['public','pengurus','admin'],
  pengurus:    ['public','pengurus','admin'],
  achievement: ['public','pengurus','admin'],
  materi:      ['public','pengurus','admin'],
  projects:    ['public','pengurus','admin'],
  blog:        ['public','pengurus','admin'],
  aspirasi:    ['public','pengurus','admin'],
  // organisasi - pengurus+ only
  arsip:       ['pengurus','admin'],
  proker:      ['pengurus','admin'],
  rapat:       ['pengurus','admin'],
  dashboard:   ['pengurus','admin'],
  // admin only
  admin:       ['admin'],
};

// ============================================================
// INIT SETTINGS
// ============================================================
async function initSettings() {
  try {
    STATE.settings = await DB.getSettings();
    if (STATE.settings.periode_aktif) {
      STATE.activePeriode = STATE.settings.periode_aktif;
      const periodeSelect = document.getElementById('pengurus-periode');
      if (periodeSelect) periodeSelect.value = STATE.activePeriode;
    }
    // Apply logo
    const logo = STATE.settings.logo_url;
    if (logo) {
      const logoEl = document.getElementById('sidebar-logo');
      if (logoEl) {
        logoEl.className = 'sidebar-logo';
        logoEl.innerHTML = `<img src="${logo}" alt="HIMAIF Logo" onerror="this.parentElement.className='sidebar-logo-fallback';this.parentElement.innerHTML='⚙️'">`;
      }
    }
  } catch(e) {
    console.warn('[HIMAIF] Settings load failed:', e.message);
  }
}

// ============================================================
// AUTH
// ============================================================
async function doLogin() {
  const username = (document.getElementById('login-username')?.value || '').trim().toLowerCase();
  const password  = document.getElementById('login-pwd')?.value || '';

  if (!username || !password) { showToast('Username dan password wajib diisi!', 'error'); return; }

  const loginBtn = document.querySelector('#login-modal .btn-primary');
  if (loginBtn) { loginBtn.disabled = true; loginBtn.textContent = 'Memeriksa...'; }

  try {
    const user = await DB_AUTH.login(username, password);
    if (!user) {
      showToast('Username atau password salah!', 'error');
      return;
    }
    STATE.role        = user.role;
    STATE.username    = user.username;
    STATE.displayName = user.display_name || user.username;
    closeModal('login-modal');
    updateTopbar();
    updateSidebar();
    applyAdminUI();
    showToast(`Selamat datang, ${STATE.displayName}! 👋`, 'success');
    navigate('home');
  } catch(e) {
    showToast('Gagal login: ' + e.message, 'error');
  } finally {
    if (loginBtn) { loginBtn.disabled = false; loginBtn.textContent = '🔓 Login'; }
=======
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
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
  }
}

function doLogout() {
<<<<<<< HEAD
  STATE.role        = 'public';
  STATE.username    = '';
  STATE.displayName = '';
  updateTopbar();
  updateSidebar();
  applyAdminUI();
  showToast('Berhasil logout. Sampai jumpa!', 'info');
  navigate('home');
}

function isAdmin()    { return STATE.role === 'admin'; }
function isPengurus() { return STATE.role === 'pengurus' || STATE.role === 'admin'; }

function canAccess(page) {
  const allowed = PAGE_ACCESS[page] || ['admin'];
  return allowed.includes(STATE.role);
=======
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
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
}

// ============================================================
// NAVIGATION
// ============================================================
<<<<<<< HEAD
function navigate(page) {
  if (!canAccess(page)) {
=======
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
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
    showToast('Halaman ini memerlukan login terlebih dahulu.', 'warning');
    openModal('login-modal');
    return;
  }
<<<<<<< HEAD

  // Deactivate all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Activate target page
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  else { console.warn('[HIMAIF] Page not found:', page); return; }

  STATE.activePage = page;

  // Update sidebar active state
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

  // Update topbar title
  const titles = {
    home: '🏠 Beranda', about: 'ℹ️ Tentang',
    pengurus: '👥 Data Pengurus', arsip: '📁 Arsip & LPJ',
    proker: '📋 Program Kerja', achievement: '🏆 Pencapaian',
    materi: '📚 Bank Materi', projects: '💡 Galeri Project',
    blog: '✍️ Tech Blog', rapat: '📝 Catatan Rapat',
    aspirasi: '📢 Kotak Aspirasi', dashboard: '📊 Dashboard',
    admin: '⚙️ Panel Admin',
  };
  document.getElementById('topbar-title').textContent = titles[page] || page;

  // Close mobile sidebar
  closeSidebar();

  // Load page content
  _renderPage(page);
}

function _renderPage(page) {
  switch(page) {
    case 'home':        renderHome();        break;
    case 'about':       renderAbout();       break;
    case 'pengurus':    renderPengurus();    break;
    case 'arsip':       renderArsip();       break;
    case 'proker':      renderProker();      break;
    case 'achievement': renderAchievement(); break;
    case 'materi':      renderMateri();      break;
    case 'projects':    renderProjects();    break;
    case 'blog':        renderBlog();        break;
    case 'rapat':       renderRapat();       break;
    case 'aspirasi':    renderAspirasi();    break;
    case 'dashboard':   renderDashboard();   break;
    case 'admin':       renderAdmin();       break;
=======
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
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
  }
}

// ============================================================
<<<<<<< HEAD
// SIDEBAR
// ============================================================
function updateSidebar() {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  const role = STATE.role;
  const isP  = isPengurus();
  const isA  = isAdmin();

  let html = '';

  // PUBLIC section
  html += `<div class="sidebar-section">
    <div class="sidebar-label">Umum</div>
    <button class="nav-item" data-page="home"        onclick="navigate('home')">        <span class="nav-icon">🏠</span> Beranda</button>
    <button class="nav-item" data-page="about"       onclick="navigate('about')">       <span class="nav-icon">ℹ️</span> Tentang HIMAIF</button>
    <button class="nav-item" data-page="pengurus"    onclick="navigate('pengurus')">    <span class="nav-icon">👥</span> Data Pengurus</button>
    <button class="nav-item" data-page="achievement" onclick="navigate('achievement')"> <span class="nav-icon">🏆</span> Pencapaian</button>
    <button class="nav-item" data-page="materi"      onclick="navigate('materi')">      <span class="nav-icon">📚</span> Bank Materi</button>
    <button class="nav-item" data-page="projects"    onclick="navigate('projects')">    <span class="nav-icon">💡</span> Galeri Project</button>
    <button class="nav-item" data-page="blog"        onclick="navigate('blog')">        <span class="nav-icon">✍️</span> Tech Blog</button>
    <button class="nav-item" data-page="aspirasi"    onclick="navigate('aspirasi')">    <span class="nav-icon">📢</span> Kotak Aspirasi</button>
  </div>`;

  // PENGURUS section
  if (isP) {
    html += `<div class="sidebar-section">
      <div class="sidebar-label">Organisasi</div>
      <button class="nav-item" data-page="arsip"    onclick="navigate('arsip')">    <span class="nav-icon">📁</span> Arsip &amp; LPJ</button>
      <button class="nav-item" data-page="proker"   onclick="navigate('proker')">   <span class="nav-icon">📋</span> Program Kerja</button>
      <button class="nav-item" data-page="rapat"    onclick="navigate('rapat')">    <span class="nav-icon">📝</span> Catatan Rapat</button>
      <button class="nav-item" data-page="dashboard"onclick="navigate('dashboard')"><span class="nav-icon">📊</span> Dashboard</button>
    </div>`;
  }

  // ADMIN section
  if (isA) {
    html += `<div class="sidebar-section">
      <div class="sidebar-label">Admin</div>
      <button class="nav-item" data-page="admin" onclick="navigate('admin')"><span class="nav-icon">⚙️</span> Panel Admin</button>
    </div>`;
  }

  nav.innerHTML = html;

  // Re-apply active state
  document.querySelector(`.nav-item[data-page="${STATE.activePage}"]`)?.classList.add('active');
}

// ============================================================
// TOPBAR
// ============================================================
function updateTopbar() {
  const rightEl = document.getElementById('topbar-right');
  if (!rightEl) return;

  if (STATE.role === 'public') {
    rightEl.innerHTML = `
      <div class="search-wrap" style="position:relative;">
        <span style="position:absolute;left:11px;color:var(--text-dim);font-size:14px;">🔍</span>
        <input type="text" placeholder="Cari halaman..." id="global-search" style="padding-left:32px;background:none;border:none;outline:none;color:var(--text);font-size:13px;width:160px;" autocomplete="off">
      </div>
      <div class="user-pill login-btn" onclick="openModal('login-modal')">🔑 Login</div>`;
  } else {
    const roleLabel = isAdmin() ? '👑 Admin' : '🎓 Pengurus';
    const roleColor = isAdmin() ? 'var(--orange)' : 'var(--teal-light)';
    rightEl.innerHTML = `
      <div class="search-wrap" style="position:relative;">
        <span style="position:absolute;left:11px;color:var(--text-dim);font-size:14px;">🔍</span>
        <input type="text" placeholder="Cari halaman..." id="global-search" style="padding-left:32px;background:none;border:none;outline:none;color:var(--text);font-size:13px;width:160px;" autocomplete="off">
      </div>
      <div class="user-pill" onclick="doLogout()" title="Klik untuk logout">
        <div class="user-dot"></div>
        <span style="color:${roleColor};font-size:11px;">${roleLabel}</span>
        <span class="text-sm font-bold">${escapeHtml(STATE.displayName || STATE.username)}</span>
        <span style="color:var(--text-dim);font-size:11px;">↩ Logout</span>
      </div>`;
  }
}

// ============================================================
// ADMIN UI
// ============================================================
function applyAdminUI() {
  const adminOnlyEls = document.querySelectorAll('.admin-only');
  adminOnlyEls.forEach(el => {
    el.style.display = isAdmin() ? '' : 'none';
  });
  // Aspirasi inbox - pengurus+
  const aspInbox = document.getElementById('asp-inbox-section');
  if (aspInbox) aspInbox.style.display = isPengurus() ? '' : 'none';
  // Blog filter
  const blogFilterAll = document.querySelector('#blog-filter-status option[value="all"]');
  if (blogFilterAll) blogFilterAll.style.display = isAdmin() ? '' : 'none';
}

// ============================================================
// MOBILE SIDEBAR
// ============================================================
function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebar-overlay')?.classList.remove('show');
=======
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
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
  document.body.style.overflow = '';
}

// ============================================================
<<<<<<< HEAD
// TAB SWITCHER (generic)
// ============================================================
function switchTab(groupId, tabId, btn) {
  const prefix = `${groupId}-tab-`;
  // Deactivate all tab contents for this group
  document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => el.classList.remove('active'));
  // Activate selected
  document.getElementById(prefix + tabId)?.classList.add('active');
  // Update tab buttons
  if (btn) {
    btn.closest('.tabs')?.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
=======
// TABS
// ============================================================
function switchTab(ns, name, btn) {
  document.querySelectorAll(`[id^="${ns}-tab-"]`).forEach(el => el.classList.remove('active'));
  document.getElementById(`${ns}-tab-${name}`)?.classList.add('active');
  if (btn?.closest('.tabs')) {
    btn.closest('.tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
    btn.classList.add('active');
  }
}

// ============================================================
<<<<<<< HEAD
// MODAL HELPERS
// ============================================================
function openModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) {
    el.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span style="flex:1;">${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(110%)';
    setTimeout(() => toast.remove(), 320);
  }, duration);
}

// ============================================================
// LOADING STATE HELPER
// ============================================================
function setLoading(elId, show = true, msg = 'Memuat...') {
  const el = document.getElementById(elId);
  if (!el) return;
  if (show) el.innerHTML = `<div class="loading-wrap"><div class="spinner"></div><div class="loading-text">${msg}</div></div>`;
}

// ============================================================
// EMPTY STATE HELPER
// ============================================================
function emptyState(icon, title, desc, action = '') {
  return `<div class="empty-state">
    <div class="empty-icon">${icon}</div>
    <div class="empty-title">${title}</div>
    <div class="empty-desc">${desc}</div>
    ${action ? `<div style="margin-top:16px;">${action}</div>` : ''}
  </div>`;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0,2).toUpperCase();
  return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
}

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
  } catch { return d; }
}

function formatDateShort(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
  } catch { return d; }
}

function formatDateCompact(d) {
  if (!d) return '—';
  try {
    const dt = new Date(d);
    return {
      day: dt.toLocaleDateString('id-ID', { day: '2-digit' }),
      mon: dt.toLocaleDateString('id-ID', { month: 'short' }),
      year: dt.getFullYear(),
    };
  } catch { return { day:'--', mon:'---', year:'----' }; }
}

function formatCurrency(n) {
  if (!n && n !== 0) return 'Rp 0';
  if (n >= 1_000_000_000) return `Rp ${(n/1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000)     return `Rp ${(n/1_000_000).toFixed(1)}Jt`;
  if (n >= 1_000)         return `Rp ${(n/1_000).toFixed(0)}K`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

function getStatusBadge(status) {
  const map = {
    aktif:           ['badge-blue',   '⏳ Belum Dimulai'],
    sedang_berjalan: ['badge-amber',  '⚡ Berjalan'],
    selesai:         ['badge-green',  '✅ Selesai'],
    dibatalkan:      ['badge-red',    '❌ Dibatalkan'],
    published:       ['badge-green',  '✅ Published'],
    pending:         ['badge-amber',  '⏳ Pending'],
    ditolak:         ['badge-red',    '❌ Ditolak'],
    ditinjau:        ['badge-blue',   '🔍 Ditinjau'],
    diproses:        ['badge-amber',  '⚙️ Diproses'],
    diterima:        ['badge-green',  '✅ Diterima'],
    rejected:        ['badge-red',    '❌ Ditolak'],
    approved:        ['badge-green',  '✅ Approved'],
  };
  const [cls, label] = map[status] || ['badge-gray', status || '—'];
  return `<span class="badge ${cls}">${label}</span>`;
}

function getLevelBadge(level) {
  const map = {
    Prodi:           'badge-blue',
    Regional:        'badge-teal',
    Nasional:        'badge-orange',
    Internasional:   'badge-purple',
  };
  return `<span class="badge ${map[level] || 'badge-gray'}">🌐 ${level}</span>`;
}

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)   return 'Baru saja';
  if (diff < 3600) return `${Math.floor(diff/60)} menit lalu`;
  if (diff < 86400)return `${Math.floor(diff/3600)} jam lalu`;
  if (diff < 2592000) return `${Math.floor(diff/86400)} hari lalu`;
  return formatDateShort(dateStr);
}

// ============================================================
// EXPORT CSV
// ============================================================
function exportToCSV(headers, rows, filename) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(',')),
  ].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = `${filename}-${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

async function exportPengurusCSV(periode) {
  try {
    const data = await DB.getPengurus(periode || STATE.activePeriode);
    exportToCSV(
      ['Nama','NIM','Divisi','Jabatan','Semester','Tanggal Lahir','Periode'],
      data.map(m => [m.nama, m.nim, m.divisi, m.jabatan, m.semester, m.tanggal_lahir, m.periode]),
      'pengurus-himaif'
    );
    showToast('Export CSV berhasil!', 'success');
  } catch(e) { showToast('Gagal export: ' + e.message, 'error'); }
}

async function exportProkerCSV() {
  try {
    const data = await DB.getProker(STATE.activePeriode);
    exportToCSV(
      ['Nama','Divisi','Ketua','Status','Progress (%)','Target','Anggaran','Deskripsi'],
      data.map(p => [p.nama, p.divisi, p.ketua, p.status, p.progress, p.target_tanggal, p.anggaran, p.deskripsi]),
      'proker-himaif'
    );
    showToast('Export CSV berhasil!', 'success');
  } catch(e) { showToast('Gagal export: ' + e.message, 'error'); }
}

async function exportRapatCSV() {
  try {
    const data = await DB.getRapat();
    exportToCSV(
      ['Judul','Tanggal','Jenis','Tempat','Hadir','Total','Pimpinan','Notulis'],
      data.map(r => [r.judul, r.tanggal, r.jenis, r.tempat, r.jumlah_hadir, r.jumlah_total, r.pimpinan_rapat, r.notulis]),
      'rapat-himaif'
    );
    showToast('Export CSV berhasil!', 'success');
  } catch(e) { showToast('Gagal export: ' + e.message, 'error'); }
}

async function exportPencapaianCSV() {
  try {
    const data = await DB.getPencapaian();
    exportToCSV(
      ['Nama/Tim','Prestasi','Kategori','Level','Tanggal'],
      data.map(p => [p.nama, p.prestasi, p.kategori, p.level, p.tanggal]),
      'pencapaian-himaif'
    );
    showToast('Export CSV berhasil!', 'success');
  } catch(e) { showToast('Gagal export: ' + e.message, 'error'); }
}

async function exportAspirasiCSV() {
  try {
    const data = await DB.getAspirasi();
    exportToCSV(
      ['Kategori','Pesan','Status','Tanggal'],
      data.map(a => [a.kategori, a.pesan, a.status, a.created_at]),
      'aspirasi-himaif'
    );
    showToast('Export CSV berhasil!', 'success');
  } catch(e) { showToast('Gagal export: ' + e.message, 'error'); }
}
=======
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
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
