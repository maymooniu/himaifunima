// =============================================================
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
  'Pendamping Pengurus',
  'Akademik',
  'PSDM',
  'Media & Komunikasi',
  'Minat Bakat',
  'Hubungan Masyarakat',
  'Kewirausahaan',
];

// Pages accessible by role
const PAGE_ACCESS = {
  home:        ['public','pengurus','admin'],
  about:       ['public','pengurus','admin'],
  pengurus:    ['public','pengurus','admin'],
  achievement: ['public','pengurus','admin'],
  projects:    ['public','pengurus','admin'],
  galeri:      ['public','pengurus','admin'],
  blog:        ['public','pengurus','admin'],
  aspirasi:    ['public','pengurus','admin'],
  // organisasi - pengurus+ only
  arsip:       ['public','pengurus','admin'],
  proker:      ['pengurus','admin'],
  rapat:       ['pengurus','admin'],
  dashboard:   ['pengurus','admin'],
  // admin only
  admin:       ['admin'],
};

// ============================================================
// INIT SETTINGS
// ============================================================
function convertGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  return trimmed;
}

async function initSettings() {
  try {
    STATE.settings = await DB.getSettings();
    if (STATE.settings.periode_aktif) {
      STATE.activePeriode = STATE.settings.periode_aktif;
      const periodeSelect = document.getElementById('pengurus-periode');
      if (periodeSelect) periodeSelect.value = STATE.activePeriode;
    }
    // Apply logo
    const rawLogo = STATE.settings.logo_url;
    if (rawLogo) {
      const logo = convertGoogleDriveUrl(rawLogo);
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
  }
}

function doLogout() {
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
}

// ============================================================
// NAVIGATION
// ============================================================
function navigate(page, updateHash = true) {
  if (!canAccess(page)) {
    showToast('Halaman ini memerlukan login terlebih dahulu.', 'warning');
    openModal('login-modal');
    return;
  }

  // Deactivate all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Activate target page
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  else { console.warn('[HIMAIF] Page not found:', page); return; }

  STATE.activePage = page;
  if (updateHash && window.location.hash !== '#' + page) {
    window.location.hash = page;
  }

  // Update sidebar active state
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-page="${page}"]`)?.classList.add('active');

  // Update topbar title
  const titles = {
    home: '🏠 Beranda', about: 'ℹ️ Tentang',
    pengurus: '👥 Data Pengurus', arsip: '📁 Arsip & LPJ',
    proker: '📋 Program Kerja', achievement: '🏆 Pencapaian',
    projects: '💡 Galeri Project',
    galeri: '📷 Galeri HIMAIF',
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
    case 'projects':    renderProjects();    break;
    case 'galeri':      renderGaleri();      break;
    case 'blog':        renderBlog();        break;
    case 'rapat':       renderRapat();       break;
    case 'aspirasi':    renderAspirasi();    break;
    case 'dashboard':   renderDashboard();   break;
    case 'admin':       renderAdmin();       break;
  }
}

// ============================================================
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
    <button class="nav-item" data-page="arsip"       onclick="navigate('arsip')">       <span class="nav-icon">📁</span> Arsip &amp; LPJ</button>
    <button class="nav-item" data-page="achievement" onclick="navigate('achievement')"> <span class="nav-icon">🏆</span> Pencapaian</button>
    <button class="nav-item" data-page="projects"    onclick="navigate('projects')">    <span class="nav-icon">💡</span> Galeri Project</button>
    <button class="nav-item" data-page="galeri"      onclick="navigate('galeri')">      <span class="nav-icon">📷</span> Galeri HIMAIF</button>
    <button class="nav-item" data-page="blog"        onclick="navigate('blog')">        <span class="nav-icon">✍️</span> Tech Blog</button>
    <button class="nav-item" data-page="aspirasi"    onclick="navigate('aspirasi')">    <span class="nav-icon">📢</span> Kotak Aspirasi</button>
  </div>`;

  // PENGURUS section
  if (isP) {
    html += `<div class="sidebar-section">
      <div class="sidebar-label">Organisasi</div>
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
  document.body.style.overflow = '';
}

// ============================================================
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
    btn.classList.add('active');
  }
}

// ============================================================
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

function renderAvatarHtml(m, avatarClass = 'avatar avatar-sm', style = '') {
  if (!m) return `<div class="${avatarClass}" ${style ? `style="${style}"` : ''}>?</div>`;
  if (m.foto_url && m.foto_url.trim()) {
    const url = escapeHtml(convertGoogleDriveUrl(m.foto_url.trim()));
    const init = escapeHtml(initials(m.nama));
    return `<div class="${avatarClass}" ${style ? `style="${style}"` : ''}><img src="${url}" alt="${escapeHtml(m.nama || '')}" onerror="this.onerror=null;this.parentElement.innerHTML='${init}'"></div>`;
  }
  return `<div class="${avatarClass}" ${style ? `style="${style}"` : ''}>${escapeHtml(initials(m.nama))}</div>`;
}

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
  } catch { return d; }
}

// ============================================================
// IMAGE UPLOAD & INTERACTIVE MANUAL CROP HELPER
// ============================================================
let _currentCropper = null;
let _cropTargetUrlInputId = null;
let _cropPreviewContainerId = null;

function handleImageFileUpload(inputEl, targetUrlInputId, previewContainerId, defaultRatio = 1, isCircle = false) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('File yang dipilih harus berupa gambar (JPG, PNG, WebP).', 'error');
    return;
  }

  _cropTargetUrlInputId = targetUrlInputId;
  _cropPreviewContainerId = previewContainerId;

  const reader = new FileReader();
  reader.onload = function(e) {
    const cropImg = document.getElementById('crop-modal-img');
    if (!cropImg) return;

    if (_currentCropper) {
      _currentCropper.destroy();
      _currentCropper = null;
    }

    cropImg.src = e.target.result;
    openModal('image-crop-modal');

    // Initialize Cropper after modal is displayed
    setTimeout(() => {
      if (typeof Cropper !== 'undefined') {
        _currentCropper = new Cropper(cropImg, {
          aspectRatio: defaultRatio,
          viewMode: 1,
          dragMode: 'move',
          autoCropArea: 0.9,
          restore: false,
          guides: true,
          center: true,
          highlight: false,
          cropBoxMovable: true,
          cropBoxResizable: true,
          toggleDragModeOnDblclick: false,
          ready: function() {
            const box = document.querySelector('#image-crop-modal .cropper-view-box');
            const face = document.querySelector('#image-crop-modal .cropper-face');
            if (isCircle) {
              box?.classList.add('circle-crop');
              face?.classList.add('circle-crop');
            } else {
              box?.classList.remove('circle-crop');
              face?.classList.remove('circle-crop');
            }
          }
        });
      } else {
        console.warn('[HIMAIF] Cropper.js library unavailable');
      }
    }, 180);
  };
  reader.readAsDataURL(file);
  inputEl.value = '';
}

function setCropRatio(ratio) {
  if (_currentCropper) {
    _currentCropper.setAspectRatio(ratio);
    const box = document.querySelector('#image-crop-modal .cropper-view-box');
    const face = document.querySelector('#image-crop-modal .cropper-face');
    if (ratio === 1) {
      box?.classList.add('circle-crop');
      face?.classList.add('circle-crop');
    } else {
      box?.classList.remove('circle-crop');
      face?.classList.remove('circle-crop');
    }
  }
}

function rotateCrop(deg) {
  if (_currentCropper) {
    _currentCropper.rotate(deg);
  }
}

function applyCroppedImage() {
  if (!_currentCropper) {
    closeModal('image-crop-modal');
    return;
  }

  const canvas = _currentCropper.getCroppedCanvas({
    width: 600,
    height: 600,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
  });

  if (!canvas) {
    showToast('Gagal memotong gambar.', 'error');
    return;
  }

  const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
  const targetUrlInput = document.getElementById(_cropTargetUrlInputId);
  const previewContainer = document.getElementById(_cropPreviewContainerId);

  if (targetUrlInput) {
    targetUrlInput.value = croppedDataUrl;
  }

  if (previewContainer) {
    const kbSize = Math.round(croppedDataUrl.length / 1024);
    previewContainer.innerHTML = `
      <div class="flex items-center gap-3 p-2 bg-3 border border-orange border-radius mt-2">
        <img src="${croppedDataUrl}" style="width:44px;height:44px;border-radius:50%;object-fit:cover;">
        <div class="text-xs text-success font-bold">✓ Foto berhasil dipotong (${kbSize} KB)</div>
      </div>`;
  }

  closeModal('image-crop-modal');
  showToast('Foto berhasil dipotong dan siap disimpan!', 'success');
}

function openPhotoLightboxDirect(url, title = '📷 Lampiran Foto') {
  if (!url) return;
  const tEl = document.getElementById('lightbox-title');
  if (tEl) tEl.textContent = title;
  const imgEl = document.getElementById('lightbox-img');
  if (imgEl) imgEl.src = url;
  const metaEl = document.getElementById('lightbox-meta');
  if (metaEl) metaEl.textContent = '';
  openModal('photo-lightbox-modal');
}

function toggleAspirasiAttachMode(mode) {
  const fileWrap = document.getElementById('asp-attach-file-wrap');
  const linkWrap = document.getElementById('asp-attach-link-wrap');
  if (mode === 'file') {
    if (fileWrap) fileWrap.style.display = '';
    if (linkWrap) linkWrap.style.display = 'none';
  } else {
    if (fileWrap) fileWrap.style.display = 'none';
    if (linkWrap) linkWrap.style.display = '';
  }
}

function toggleFormAttachMode(fileWrapId, linkWrapId, mode) {
  const fileWrap = document.getElementById(fileWrapId);
  const linkWrap = document.getElementById(linkWrapId);
  if (mode === 'file') {
    if (fileWrap) fileWrap.style.display = '';
    if (linkWrap) linkWrap.style.display = 'none';
  } else {
    if (fileWrap) fileWrap.style.display = 'none';
    if (linkWrap) linkWrap.style.display = '';
  }
}

let _aspMediaList = [];

function removeAspirasiMedia(index) {
  _aspMediaList.splice(index, 1);
  syncAspirasiMediaPreview();
}

function clearAspirasiMedia() {
  _aspMediaList = [];
  syncAspirasiMediaPreview();
}

function syncAspirasiMediaPreview() {
  const urlInput = document.getElementById('asp-media-url');
  const preview = document.getElementById('asp-media-preview');

  if (urlInput) {
    urlInput.value = _aspMediaList.length ? JSON.stringify(_aspMediaList) : '';
  }

  if (preview) {
    if (!_aspMediaList.length) {
      preview.innerHTML = '';
      return;
    }

    let html = `<div class="grid grid-2 gap-2 mt-2">`;
    _aspMediaList.forEach((item, idx) => {
      const isImg = item.type === 'image';
      html += `
        <div class="p-2 bg-3 border border-orange border-radius relative flex flex-col justify-between" style="overflow:hidden;">
          ${isImg
            ? `<img src="${item.url}" style="width:100%;height:120px;object-fit:cover;border-radius:6px;cursor:pointer;" onclick="openPhotoLightboxDirect('${item.url}')">`
            : `<video src="${item.url}" controls preload="metadata" style="width:100%;height:120px;object-fit:cover;border-radius:6px;"></video>`
          }
          <div class="flex items-center justify-between mt-1 text-xs">
            <span class="text-success font-bold">${isImg ? '📷 Foto' : '🎥 Video'} (${item.sizeKb} KB)</span>
            <button type="button" class="btn btn-danger btn-icon btn-sm" style="padding:2px 6px;" onclick="removeAspirasiMedia(${idx})">🗑️</button>
          </div>
        </div>`;
    });
    html += `</div>`;
    preview.innerHTML = html;
  }
}

async function handleAspirasiMediaUpload(inputEl) {
  const files = inputEl.files ? Array.from(inputEl.files) : [];
  if (!files.length) return;

  const preview = document.getElementById('asp-media-preview');
  if (preview) preview.innerHTML = `<div class="text-xs text-muted mt-2">⌛ Memproses ${files.length} file...</div>`;

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = new Image();
          img.onload = function() {
            const canvas = document.createElement('canvas');
            const maxDim = 800;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            const sizeKb = Math.round(compressedDataUrl.length / 1024);
            _aspMediaList.push({ type: 'image', url: compressedDataUrl, sizeKb });
            resolve();
          };
          img.onerror = resolve;
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    } else if (file.type.startsWith('video/')) {
      const maxMb = 10;
      if (file.size > maxMb * 1024 * 1024) {
        showToast(`File video "${file.name}" > ${maxMb}MB dilewati.`, 'warning');
        continue;
      }
      await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = function(e) {
          const sizeKb = Math.round(file.size / 1024);
          _aspMediaList.push({ type: 'video', url: e.target.result, sizeKb });
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
  }

  inputEl.value = '';
  syncAspirasiMediaPreview();
  showToast(`${files.length} file berhasil dilampirkan!`, 'success');
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