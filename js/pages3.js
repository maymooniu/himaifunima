// =============================================================
// HIMAIF v2 — Pages 3: Admin Panel & All CRUD Modals
// =============================================================

// ============================================================
// ADMIN PANEL
// ============================================================
function renderAdmin() {
  const ct = document.getElementById('admin-content');
  if (!ct) return;

  if (!isAdmin()) {
    ct.innerHTML = `<div style="text-align:center;padding:80px 20px;">
      <div style="font-size:64px;margin-bottom:16px;">🔐</div>
      <div class="font-display" style="font-size:22px;font-weight:800;margin-bottom:8px;">Akses Admin Diperlukan</div>
      <p class="text-muted mb-4">Halaman ini hanya dapat diakses oleh Administrator HIMAIF.</p>
      <button class="btn btn-primary btn-lg" onclick="openModal('login-modal')">🔑 Login sebagai Admin</button>
    </div>`;
    return;
  }

  ct.innerHTML = `
    <div class="admin-header-bar mb-4">
      <div class="flex gap-2 items-center">
        <span style="font-size:20px;">👑</span>
        <span>Mode <strong>Admin</strong> aktif · ${escapeHtml(STATE.displayName)}</span>
      </div>
      <button class="btn btn-danger btn-sm" onclick="doLogout()">↩ Logout</button>
    </div>
    <div class="tabs" id="admin-main-tabs" style="flex-wrap:wrap;">
      <button class="tab-btn active" onclick="adminTab('pengurus',this)">👥 Pengurus</button>
      <button class="tab-btn" onclick="adminTab('proker',this)">📋 Proker</button>
      <button class="tab-btn" onclick="adminTab('lpj',this)">📄 LPJ</button>
      <button class="tab-btn" onclick="adminTab('berita',this)">📰 Berita</button>
      <button class="tab-btn" onclick="adminTab('blog',this)">✍️ Blog</button>
      <button class="tab-btn" onclick="adminTab('project',this)">💡 Projects</button>
      <button class="tab-btn" onclick="adminTab('pencapaian',this)">🏆 Prestasi</button>
      <button class="tab-btn" onclick="adminTab('materi',this)">📚 Materi</button>
      <button class="tab-btn" onclick="adminTab('users',this)">👤 Users</button>
      <button class="tab-btn" onclick="adminTab('settings',this)">⚙️ Pengaturan</button>
      <button class="tab-btn" onclick="adminTab('export',this)">📥 Export</button>
    </div>
    <div id="admin-tab-body" style="min-height:300px;"><div class="loading-wrap"><div class="spinner"></div></div></div>
    <div style="text-align:right;margin-top:32px;padding-top:16px;border-top:1px solid var(--border);">
      <span style="font-size:11px;color:var(--text-dim);">HIMAIF v2 · Project by <span style="color:var(--blue-primary);font-weight:700;">Christian Tendean</span></span>
    </div>`;

  adminTab('pengurus', document.querySelector('#admin-main-tabs .tab-btn'));
}

async function adminTab(tab, btn) {
  document.getElementById('admin-main-tabs')?.querySelectorAll('.tab-btn')
    .forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const ct = document.getElementById('admin-tab-body');
  setLoading('admin-tab-body', true);
  try {
    switch(tab) {
      case 'pengurus':  await adminTabPengurus(ct);  break;
      case 'proker':    await adminTabProker(ct);    break;
      case 'lpj':       await adminTabLPJ(ct);       break;
      case 'berita':    await adminTabBerita(ct);    break;
      case 'blog':      await adminTabBlog(ct);      break;
      case 'project':   await adminTabProject(ct);   break;
      case 'pencapaian':await adminTabPencapaian(ct);break;
      case 'materi':    await adminTabMateri(ct);    break;
      case 'users':     await adminTabUsers(ct);     break;
      case 'settings':  adminTabSettings(ct);        break;
      case 'export':    adminTabExport(ct);          break;
      default: ct.innerHTML = emptyState('🔧', 'Tab tidak dikenal', '');
    }
  } catch(e) {
    ct.innerHTML = `<div class="info-box danger"><span>❌</span><span>${e.message}</span></div>`;
  }
}

// ---- PENGURUS TAB ----
async function adminTabPengurus(ct) {
  const data = await DB.getAllPengurus();
  ct.innerHTML = `
    <div class="section-header mb-4">
      <div><div class="card-title" style="font-size:16px;">Total ${data.length} pengurus (semua periode)</div></div>
      <button class="btn btn-primary btn-sm" onclick="openAddPengurusModal()">+ Tambah Pengurus</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Nama</th><th>NIM</th><th>Divisi</th><th>Jabatan</th><th>Periode</th><th>Semester</th><th>Aksi</th></tr></thead>
        <tbody>
          ${data.map(m => `<tr>
            <td><div class="flex items-center gap-2"><div class="avatar avatar-sm">${initials(m.nama)}</div><span class="font-bold">${escapeHtml(m.nama)}</span></div></td>
            <td class="font-mono text-sm">${m.nim}</td>
            <td><span class="badge badge-blue">${escapeHtml(m.divisi)}</span></td>
            <td>${escapeHtml(m.jabatan)}</td>
            <td><span class="badge badge-orange">${escapeHtml(m.periode)}</span></td>
            <td>${m.semester}</td>
            <td>
              <div class="td-actions">
                <button class="btn btn-ghost btn-sm" onclick="openEditPengurusModal('${m.id}')">✏️ Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deletePengurus('${m.id}','${escapeHtml(m.nama)}')">🗑️</button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ---- PROKER TAB ----
async function adminTabProker(ct) {
  const data = await DB.getProker(STATE.activePeriode);
  ct.innerHTML = `
    <div class="section-header mb-4">
      <div><div class="card-title" style="font-size:16px;">${data.length} Proker Periode ${STATE.activePeriode}</div></div>
      <button class="btn btn-primary btn-sm" onclick="openAddProkerModal()">+ Tambah Proker</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Nama</th><th>Divisi</th><th>Ketua</th><th>Status</th><th>Progress</th><th>Target</th><th>Aksi</th></tr></thead>
        <tbody>
          ${data.map(p => `<tr>
            <td class="font-bold">${escapeHtml(p.nama)}</td>
            <td><span class="badge badge-blue">${escapeHtml(p.divisi)}</span></td>
            <td>${escapeHtml(p.ketua || '—')}</td>
            <td>${getStatusBadge(p.status)}</td>
            <td>
              <div style="display:flex;align-items:center;gap:8px;min-width:100px;">
                <div class="progress-bar-wrap" style="flex:1;height:6px;border-radius:6px;">
                  <div class="progress-bar" style="width:${p.progress}%;background:var(--blue-primary);border-radius:6px;"></div>
                </div>
                <span class="text-xs font-bold">${p.progress}%</span>
              </div>
            </td>
            <td>${formatDateShort(p.target_tanggal)}</td>
            <td>
              <div class="td-actions">
                <button class="btn btn-ghost btn-sm" onclick="openEditProkerModal('${p.id}')">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProker('${p.id}','${escapeHtml(p.nama)}');adminTab('proker',null)">🗑️</button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ---- LPJ TAB ----
async function adminTabLPJ(ct) {
  const data = await DB.getLPJ(null);
  ct.innerHTML = `
    <div class="section-header mb-4">
      <div><div class="card-title" style="font-size:16px;">${data.length} Arsip LPJ</div></div>
      <button class="btn btn-primary btn-sm" onclick="openModal('add-lpj-modal')">+ Tambah LPJ</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Judul</th><th>Periode</th><th>Divisi</th><th>Tanggal</th><th>File</th><th>Aksi</th></tr></thead>
        <tbody>
          ${data.map(l => `<tr>
            <td class="font-bold">${escapeHtml(l.judul)}</td>
            <td><span class="badge badge-orange">${escapeHtml(l.periode)}</span></td>
            <td>${escapeHtml(l.divisi)}</td>
            <td>${formatDateShort(l.tanggal)}</td>
            <td>${l.file_url ? `<a href="${l.file_url}" class="btn btn-ghost btn-sm" target="_blank">⬇️</a>` : '<span class="text-muted text-xs">—</span>'}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteLPJ('${l.id}');adminTab('lpj',null)">🗑️</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ---- BERITA TAB ----
async function adminTabBerita(ct) {
  const data = await DB.getBerita();
  ct.innerHTML = `
    <div class="section-header mb-4">
      <div><div class="card-title" style="font-size:16px;">${data.length} Berita</div></div>
      <button class="btn btn-primary btn-sm" onclick="openModal('add-berita-modal')">+ Tambah Berita</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Judul</th><th>Kategori</th><th>Penulis</th><th>Featured</th><th>Tanggal</th><th>Aksi</th></tr></thead>
        <tbody>
          ${data.map(b => `<tr>
            <td class="font-bold">${b.emoji || '📰'} ${escapeHtml(b.judul)}</td>
            <td><span class="badge badge-blue">${escapeHtml(b.kategori)}</span></td>
            <td>${escapeHtml(b.penulis)}</td>
            <td>${b.is_featured ? '<span class="badge badge-orange">⭐ Ya</span>' : '<span class="badge badge-gray">Tidak</span>'}</td>
            <td>${formatDateShort(b.published_at)}</td>
            <td>
              <div class="td-actions">
                <button class="btn btn-ghost btn-sm" onclick="openEditBeritaModal('${b.id}')">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteBerita('${b.id}');adminTab('berita',null)">🗑️</button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ---- BLOG TAB ----
async function adminTabBlog(ct) {
  const data = await DB.getBlog(true);
  ct.innerHTML = `
    <div class="section-header mb-4">
      <div><div class="card-title" style="font-size:16px;">${data.length} Artikel Blog</div></div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Judul</th><th>Penulis</th><th>Status</th><th>Views</th><th>Tanggal</th><th>Aksi</th></tr></thead>
        <tbody>
          ${data.map(b => `<tr>
            <td class="font-bold">${b.emoji || '📝'} ${escapeHtml(b.judul)}</td>
            <td>${escapeHtml(b.penulis)}</td>
            <td>${getStatusBadge(b.status)}</td>
            <td>👁️ ${b.views || 0}</td>
            <td>${formatDateShort(b.created_at)}</td>
            <td>
              <div class="td-actions">
                ${b.status === 'pending' ? `<button class="btn btn-success btn-sm" onclick="approveBlog('${b.id}');adminTab('blog',null)">✅</button><button class="btn btn-danger btn-sm" onclick="rejectBlog('${b.id}');adminTab('blog',null)">❌</button>` : ''}
                <button class="btn btn-danger btn-sm" onclick="deleteBlog('${b.id}');adminTab('blog',null)">🗑️</button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ---- PROJECT TAB ----
async function adminTabProject(ct) {
  const data = await DB.getProjects(true);
  ct.innerHTML = `
    <div class="section-header mb-4">
      <div><div class="card-title" style="font-size:16px;">${data.length} Project</div></div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Nama</th><th>Pembuat</th><th>Kategori</th><th>Status</th><th>Aksi</th></tr></thead>
        <tbody>
          ${data.map(p => `<tr>
            <td class="font-bold">${p.icon || '💻'} ${escapeHtml(p.nama)}</td>
            <td>${escapeHtml(p.pembuat)}</td>
            <td><span class="badge badge-blue">${escapeHtml(p.kategori)}</span></td>
            <td>${getStatusBadge(p.status)}</td>
            <td>
              <div class="td-actions">
                ${p.status === 'pending' ? `<button class="btn btn-success btn-sm" onclick="approveProject('${p.id}');adminTab('project',null)">✅ Approve</button>` : ''}
                ${p.status === 'pending' ? `<button class="btn btn-danger btn-sm" onclick="DB.rejectProject('${p.id}').then(()=>{showToast('Ditolak','info');adminTab('project',null)}).catch(e=>showToast(e.message,'error'))">❌</button>` : ''}
                <button class="btn btn-danger btn-sm" onclick="deleteProject('${p.id}');adminTab('project',null)">🗑️</button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ---- PENCAPAIAN TAB ----
async function adminTabPencapaian(ct) {
  const data = await DB.getPencapaian();
  ct.innerHTML = `
    <div class="section-header mb-4">
      <div><div class="card-title" style="font-size:16px;">${data.length} Prestasi</div></div>
      <button class="btn btn-primary btn-sm" onclick="openModal('add-ach-modal')">+ Tambah Prestasi</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Medal</th><th>Nama/Tim</th><th>Prestasi</th><th>Level</th><th>Tanggal</th><th>Aksi</th></tr></thead>
        <tbody>
          ${data.map(p => `<tr>
            <td style="font-size:22px;">${p.medal || '🏆'}</td>
            <td class="font-bold">${escapeHtml(p.nama)}</td>
            <td>${escapeHtml(p.prestasi)}</td>
            <td>${getLevelBadge(p.level)}</td>
            <td>${formatDateShort(p.tanggal)}</td>
            <td>
              <div class="td-actions">
                <button class="btn btn-ghost btn-sm" onclick="openEditAchModal('${p.id}')">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="deleteAch('${p.id}','${escapeHtml(p.prestasi)}');adminTab('pencapaian',null)">🗑️</button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ---- MATERI TAB ----
async function adminTabMateri(ct) {
  const data = await DB.getMateri();
  ct.innerHTML = `
    <div class="section-header mb-4">
      <div><div class="card-title" style="font-size:16px;">${data.length} Materi</div></div>
      <button class="btn btn-primary btn-sm" onclick="openModal('add-materi-modal')">📤 Upload Materi</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Ikon</th><th>Judul</th><th>Kategori</th><th>Uploader</th><th>File</th><th>Aksi</th></tr></thead>
        <tbody>
          ${data.map(m => `<tr>
            <td style="font-size:22px;">${m.icon || '📄'}</td>
            <td class="font-bold">${escapeHtml(m.judul)}</td>
            <td><span class="badge badge-blue">${escapeHtml(m.kategori)}</span></td>
            <td>${escapeHtml(m.uploader || '—')}</td>
            <td>${m.file_url ? `<a href="${m.file_url}" class="btn btn-ghost btn-sm" target="_blank">⬇️</a>` : '<span class="text-muted text-xs">—</span>'}</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteMateri('${m.id}');adminTab('materi',null)">🗑️</button></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ---- USERS TAB ----
async function adminTabUsers(ct) {
  const users = await DB_AUTH.getAll();
  ct.innerHTML = `
    <div class="section-header mb-4">
      <div><div class="card-title" style="font-size:16px;">${users.length} Users Terdaftar</div></div>
      <button class="btn btn-primary btn-sm" onclick="openModal('add-user-modal')">+ Tambah User</button>
    </div>
    <div class="info-box mb-4"><span>ℹ️</span><span>3 tipe: <strong>admin</strong> (akses penuh), <strong>pengurus</strong> (lihat halaman organisasi), <strong>user</strong> (publik).</span></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Username</th><th>Nama Tampil</th><th>Role</th><th>Status</th><th>Dibuat</th><th>Aksi</th></tr></thead>
        <tbody>
          ${users.map(u => `<tr>
            <td class="font-mono font-bold">${escapeHtml(u.username)}</td>
            <td>${escapeHtml(u.display_name || '—')}</td>
            <td>${u.role==='admin' ? '<span class="badge badge-orange">👑 Admin</span>' : u.role==='pengurus' ? '<span class="badge badge-blue">🎓 Pengurus</span>' : '<span class="badge badge-gray">👤 User</span>'}</td>
            <td>${u.is_active ? '<span class="badge badge-green">Aktif</span>' : '<span class="badge badge-red">Nonaktif</span>'}</td>
            <td>${formatDateShort(u.created_at)}</td>
            <td>
              <div class="td-actions">
                <button class="btn btn-ghost btn-sm" onclick="openChangePasswordModal('${u.id}','${escapeHtml(u.username)}')">🔑 Ganti PW</button>
                <button class="btn btn-danger btn-sm" onclick="deleteUser('${u.id}','${escapeHtml(u.username)}')">🗑️</button>
              </div>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ---- SETTINGS TAB ----
function adminTabSettings(ct) {
  const s = STATE.settings;
  ct.innerHTML = `
    <div class="grid-2" style="gap:20px;align-items:start;">
      <div class="card">
        <div class="card-header"><span class="card-title">🏢 Informasi HIMAIF</span></div>
        <div class="card-body">
          ${settingField('nama_prodi', 'Nama Program Studi', s.nama_prodi || '')}
          ${settingField('nama_universitas', 'Nama Universitas', s.nama_universitas || '')}
          ${settingField('email_kontak', 'Email Kontak', s.email_kontak || '')}
          ${settingField('instagram', 'Instagram Handle', s.instagram || '')}
          ${settingField('periode_aktif', 'Periode Aktif', s.periode_aktif || '')}
          <button class="btn btn-primary w-full" onclick="saveSettings(['nama_prodi','nama_universitas','email_kontak','instagram','periode_aktif'])">💾 Simpan</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">🖼️ Logo HIMAIF</span></div>
        <div class="card-body">
          <div id="logo-preview-wrap" style="width:80px;height:80px;background:var(--bg-3);border:1px solid var(--border);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;">
            ${s.logo_url ? `<img src="${s.logo_url}" style="width:72px;height:72px;border-radius:10px;object-fit:contain;" onerror="this.parentElement.innerHTML='💻'">` : '💻'}
          </div>
          ${settingField('logo_url', 'URL Logo (PNG/SVG/JPG)', s.logo_url || '')}
          <div class="form-hint mb-3">Upload ke Supabase Storage atau Google Drive, lalu paste URL publik di sini.</div>
          <div class="flex gap-2">
            <button class="btn btn-ghost" onclick="previewLogo()">👁️ Preview</button>
            <button class="btn btn-primary" onclick="saveLogo()">💾 Simpan Logo</button>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">📝 Tentang &amp; Visi Misi HIMAIF</span></div>
        <div class="card-body">
          ${settingTextarea('tentang_himaif', 'Tentang HIMAIF', s.tentang_himaif || '', 4)}
          ${settingTextarea('visi_himaif', 'Visi HIMAIF', s.visi_himaif || '', 2)}
          ${settingTextarea('misi_himaif', 'Misi HIMAIF (satu per baris, awali dengan 1. 2. dll)', s.misi_himaif || '', 5)}
          <button class="btn btn-primary w-full" onclick="saveSettings(['tentang_himaif','visi_himaif','misi_himaif'])">💾 Simpan</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-title">🎓 Visi Misi Prodi</span></div>
        <div class="card-body">
          ${settingTextarea('visi_prodi', 'Visi Program Studi', s.visi_prodi || '', 2)}
          ${settingTextarea('misi_prodi', 'Misi Program Studi (satu per baris)', s.misi_prodi || '', 5)}
          <button class="btn btn-primary w-full" onclick="saveSettings(['visi_prodi','misi_prodi'])">💾 Simpan</button>
        </div>
      </div>
    </div>`;
}

function settingField(key, label, val) {
  return `<div class="form-group">
    <label class="form-label">${label}</label>
    <input type="text" class="form-control" id="setting-${key}" value="${escapeHtml(val)}">
  </div>`;
}
function settingTextarea(key, label, val, rows=3) {
  return `<div class="form-group">
    <label class="form-label">${label}</label>
    <textarea class="form-control" id="setting-${key}" rows="${rows}">${escapeHtml(val)}</textarea>
  </div>`;
}

async function saveSettings(keys) {
  try {
    for (const k of keys) {
      const el = document.getElementById('setting-' + k);
      if (el) {
        await DB.saveSetting(k, el.value);
        STATE.settings[k] = el.value;
      }
    }
    if (keys.includes('periode_aktif')) {
      STATE.activePeriode = STATE.settings.periode_aktif;
    }
    showToast('Pengaturan disimpan!', 'success');
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

function previewLogo() {
  const url  = document.getElementById('setting-logo_url')?.value.trim();
  const wrap = document.getElementById('logo-preview-wrap');
  if (!url || !wrap) return;
  wrap.innerHTML = `<img src="${url}" style="width:72px;height:72px;border-radius:10px;object-fit:contain;" onerror="this.parentElement.innerHTML='❌ Gagal muat'">`;
}
async function saveLogo() {
  const url = document.getElementById('setting-logo_url')?.value.trim() || '';
  try {
    await DB.saveSetting('logo_url', url);
    STATE.settings.logo_url = url;
    showToast('Logo disimpan!', 'success');
    // Update sidebar logo
    const logoEl = document.getElementById('sidebar-logo');
    if (logoEl && url) {
      logoEl.className = 'sidebar-logo';
      logoEl.innerHTML = `<img src="${url}" alt="HIMAIF" onerror="this.parentElement.className='sidebar-logo-fallback';this.parentElement.innerHTML='⚙️'">`;
    }
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

// ---- EXPORT TAB ----
function adminTabExport(ct) {
  ct.innerHTML = `
    <div class="section-title mb-4" style="font-size:18px;">📥 Export Data</div>
    <div class="grid-2" style="gap:14px;">
      ${[
        {icon:'👥', label:'Export Semua Pengurus (CSV)', fn:`exportAllPengurusCSV()`},
        {icon:'📋', label:'Export Program Kerja (CSV)', fn:`exportProkerCSV()`},
        {icon:'📝', label:'Export Catatan Rapat (CSV)', fn:`exportRapatCSV()`},
        {icon:'🏆', label:'Export Prestasi (CSV)', fn:`exportPencapaianCSV()`},
        {icon:'📢', label:'Export Aspirasi (CSV)', fn:`exportAspirasiCSV()`},
      ].map(e => `<button class="btn btn-ghost" style="justify-content:flex-start;padding:16px;" onclick="${e.fn}">
        <span style="font-size:22px;">${e.icon}</span>
        <span>${e.label}</span>
      </button>`).join('')}
    </div>`;
}

async function exportAllPengurusCSV() {
  try {
    const data = await DB.getAllPengurus();
    exportToCSV(
      ['Nama','NIM','Divisi','Jabatan','Semester','Tanggal Lahir','Periode'],
      data.map(m => [m.nama, m.nim, m.divisi, m.jabatan, m.semester, m.tanggal_lahir, m.periode]),
      'semua-pengurus-himaif'
    );
    showToast('Export berhasil!', 'success');
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

// ============================================================
// PENGURUS MODAL (ADD/EDIT)
// ============================================================
let _editingPengurusId = null;

function openAddPengurusModal() {
  _editingPengurusId = null;
  document.getElementById('pengurus-modal-title').textContent = '➕ Tambah Pengurus';
  document.getElementById('pengurus-modal-body').innerHTML = pengurusFormHtml();
  document.getElementById('pengurus-modal-save').onclick = savePengurus;
  openModal('pengurus-modal');
}

async function openEditPengurusModal(id) {
  const m = (_pengurusData.length ? _pengurusData : await DB.getAllPengurus()).find(x => x.id === id);
  if (!m) { showToast('Data tidak ditemukan', 'error'); return; }
  _editingPengurusId = id;
  document.getElementById('pengurus-modal-title').textContent = '✏️ Edit Pengurus';
  document.getElementById('pengurus-modal-body').innerHTML = pengurusFormHtml(m);
  document.getElementById('pengurus-modal-save').onclick = updatePengurus;
  openModal('pengurus-modal');
}

function pengurusFormHtml(m = {}) {
  return `
    <div class="form-row cols-2">
      <div class="form-group"><label class="form-label">Nama Lengkap *</label><input type="text" class="form-control" id="pm-nama" value="${escapeHtml(m.nama||'')}" placeholder="Nama lengkap..."></div>
      <div class="form-group"><label class="form-label">NIM *</label><input type="text" class="form-control" id="pm-nim" value="${escapeHtml(m.nim||'')}" placeholder="NIM..."></div>
      <div class="form-group"><label class="form-label">Divisi</label>
        <select class="form-control" id="pm-divisi">
          ${DIVISI_LIST.map(d => `<option value="${d}" ${m.divisi===d?'selected':''}>${d}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Jabatan *</label><input type="text" class="form-control" id="pm-jabatan" value="${escapeHtml(m.jabatan||'')}" placeholder="Ketua Umum, Sekretaris..."></div>
      <div class="form-group"><label class="form-label">Periode *</label>
        <select class="form-control" id="pm-periode">
          ${['2025/2026','2024/2025','2023/2024','2022/2023','2021/2022'].map(p => `<option ${(m.periode||STATE.activePeriode)===p?'selected':''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Semester</label><input type="number" class="form-control" id="pm-semester" value="${m.semester||1}" min="1" max="14"></div>
      <div class="form-group"><label class="form-label">Tanggal Lahir</label><input type="date" class="form-control" id="pm-tgl-lahir" value="${m.tanggal_lahir||''}"></div>
      <div class="form-group"><label class="form-label">Urutan (org chart)</label><input type="number" class="form-control" id="pm-urutan" value="${m.urutan||99}" min="1"></div>
    </div>
    <div class="form-group"><label class="form-label">Bio Singkat</label><textarea class="form-control" id="pm-bio" rows="2" placeholder="Deskripsi singkat...">${escapeHtml(m.bio||'')}</textarea></div>
    <div class="form-group"><label class="form-label">URL LinkedIn</label><input type="url" class="form-control" id="pm-linkedin" value="${escapeHtml(m.linkedin_url||'')}" placeholder="https://linkedin.com/in/..."></div>
    <div class="form-group"><label class="form-label">URL Foto</label><input type="url" class="form-control" id="pm-foto" value="${escapeHtml(m.foto_url||'')}" placeholder="https://..."></div>`;
}

function getPengurusFormData() {
  return {
    nama:         document.getElementById('pm-nama')?.value.trim() || '',
    nim:          document.getElementById('pm-nim')?.value.trim() || '',
    divisi:       document.getElementById('pm-divisi')?.value || 'Inti',
    jabatan:      document.getElementById('pm-jabatan')?.value.trim() || '',
    periode:      document.getElementById('pm-periode')?.value || STATE.activePeriode,
    semester:     parseInt(document.getElementById('pm-semester')?.value) || 1,
    tanggal_lahir:document.getElementById('pm-tgl-lahir')?.value || null,
    urutan:       parseInt(document.getElementById('pm-urutan')?.value) || 99,
    bio:          document.getElementById('pm-bio')?.value || '',
    linkedin_url: document.getElementById('pm-linkedin')?.value || '',
    foto_url:     document.getElementById('pm-foto')?.value || '',
  };
}

async function savePengurus() {
  const data = getPengurusFormData();
  if (!data.nama || !data.nim || !data.jabatan) { showToast('Nama, NIM, dan Jabatan wajib diisi!', 'error'); return; }
  try {
    await DB.addPengurus(data);
    closeModal('pengurus-modal');
    showToast(`${data.nama} berhasil ditambahkan!`, 'success');
    await renderPengurus();
  } catch(e) { showToast('Gagal simpan: ' + e.message, 'error'); }
}

async function updatePengurus() {
  const data = getPengurusFormData();
  if (!data.nama || !data.nim || !data.jabatan) { showToast('Nama, NIM, dan Jabatan wajib diisi!', 'error'); return; }
  try {
    await DB.updatePengurus(_editingPengurusId, data);
    closeModal('pengurus-modal');
    showToast('Data pengurus diperbarui!', 'success');
    await renderPengurus();
  } catch(e) { showToast('Gagal update: ' + e.message, 'error'); }
}

// ============================================================
// PROKER MODAL (ADD/EDIT)
// ============================================================
let _editingProkerId = null;

function openAddProkerModal() {
  _editingProkerId = null;
  document.getElementById('proker-modal-title').textContent = '➕ Tambah Program Kerja';
  document.getElementById('proker-modal-body').innerHTML = prokerFormHtml();
  document.getElementById('proker-modal-save').onclick = saveProker;
  openModal('proker-modal');
}

async function openEditProkerModal(id) {
  const p = _prokerCache.length ? _prokerCache.find(x => x.id === id) : null;
  if (!p) {
    const data = await DB.getProker(STATE.activePeriode);
    const found = data.find(x => x.id === id);
    if (!found) { showToast('Data tidak ditemukan', 'error'); return; }
    _editingProkerId = id;
    document.getElementById('proker-modal-title').textContent = '✏️ Edit Program Kerja';
    document.getElementById('proker-modal-body').innerHTML = prokerFormHtml(found);
  } else {
    _editingProkerId = id;
    document.getElementById('proker-modal-title').textContent = '✏️ Edit Program Kerja';
    document.getElementById('proker-modal-body').innerHTML = prokerFormHtml(p);
  }
  document.getElementById('proker-modal-save').onclick = updateProker;
  openModal('proker-modal');
}

function prokerFormHtml(p = {}) {
  return `
    <div class="form-group"><label class="form-label">Nama Program Kerja *</label><input type="text" class="form-control" id="pk-nama" value="${escapeHtml(p.nama||'')}" placeholder="Nama program kerja..."></div>
    <div class="form-row cols-2">
      <div class="form-group"><label class="form-label">Divisi *</label>
        <select class="form-control" id="pk-divisi">
          ${DIVISI_LIST.filter(d=>d!=='Inti').map(d=>`<option value="${d}" ${p.divisi===d?'selected':''}>${d}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Ketua Pelaksana</label><input type="text" class="form-control" id="pk-ketua" value="${escapeHtml(p.ketua||'')}" placeholder="Nama ketua..."></div>
      <div class="form-group"><label class="form-label">Status</label>
        <select class="form-control" id="pk-status">
          <option value="aktif" ${(p.status||'aktif')==='aktif'?'selected':''}>⏳ Belum Dimulai</option>
          <option value="sedang_berjalan" ${p.status==='sedang_berjalan'?'selected':''}>⚡ Sedang Berjalan</option>
          <option value="selesai" ${p.status==='selesai'?'selected':''}>✅ Selesai</option>
          <option value="dibatalkan" ${p.status==='dibatalkan'?'selected':''}>❌ Dibatalkan</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Progress (%)</label><input type="number" class="form-control" id="pk-progress" value="${p.progress||0}" min="0" max="100"></div>
      <div class="form-group"><label class="form-label">Target Tanggal</label><input type="date" class="form-control" id="pk-tanggal" value="${p.target_tanggal||''}"></div>
      <div class="form-group"><label class="form-label">Anggaran (Rp)</label><input type="number" class="form-control" id="pk-anggaran" value="${p.anggaran||0}" min="0"></div>
    </div>
    <div class="form-group"><label class="form-label">Deskripsi</label><textarea class="form-control" id="pk-desc" rows="3" placeholder="Deskripsi program kerja...">${escapeHtml(p.deskripsi||'')}</textarea></div>`;
}

function getProkerFormData() {
  return {
    nama:          document.getElementById('pk-nama')?.value.trim() || '',
    divisi:        document.getElementById('pk-divisi')?.value || '',
    ketua:         document.getElementById('pk-ketua')?.value || '',
    status:        document.getElementById('pk-status')?.value || 'aktif',
    progress:      parseInt(document.getElementById('pk-progress')?.value) || 0,
    target_tanggal:document.getElementById('pk-tanggal')?.value || null,
    anggaran:      parseInt(document.getElementById('pk-anggaran')?.value) || 0,
    deskripsi:     document.getElementById('pk-desc')?.value || '',
    periode:       STATE.activePeriode,
  };
}

async function saveProker() {
  const data = getProkerFormData();
  if (!data.nama) { showToast('Nama proker wajib diisi!', 'error'); return; }
  try {
    const res = await DB.addProker(data);
    closeModal('proker-modal');
    showToast('Proker ditambahkan!', 'success');
    _prokerCache.unshift({ ...data, id: res?.[0]?.id });
    renderProkerStats(_prokerCache);
    filterProker();
  } catch(e) { showToast('Gagal simpan: ' + e.message, 'error'); }
}

async function updateProker() {
  const data = getProkerFormData();
  try {
    await DB.updateProker(_editingProkerId, data);
    closeModal('proker-modal');
    showToast('Proker diperbarui!', 'success');
    const idx = _prokerCache.findIndex(p => p.id === _editingProkerId);
    if (idx !== -1) _prokerCache[idx] = { ..._prokerCache[idx], ...data };
    renderProkerStats(_prokerCache);
    filterProker();
  } catch(e) { showToast('Gagal update: ' + e.message, 'error'); }
}

// ============================================================
// RAPAT MODAL (ADD/EDIT)
// ============================================================
let _editingRapatId = null;

async function saveRapat() {
  const judul   = document.getElementById('r-judul')?.value.trim() || '';
  const tanggal = document.getElementById('r-tanggal')?.value || '';
  if (!judul || !tanggal) { showToast('Judul dan tanggal wajib diisi!', 'error'); return; }
  const data = {
    judul, tanggal,
    jenis:         document.getElementById('r-jenis')?.value || 'Bulanan',
    waktu_mulai:   document.getElementById('r-mulai')?.value || null,
    waktu_selesai: document.getElementById('r-selesai')?.value || null,
    tempat:        document.getElementById('r-tempat')?.value || '',
    pimpinan_rapat:document.getElementById('r-pimpinan')?.value || '',
    jumlah_hadir:  parseInt(document.getElementById('r-hadir')?.value) || 0,
    jumlah_total:  parseInt(document.getElementById('r-total')?.value) || 0,
    notulis:       document.getElementById('r-notulis')?.value || '',
    total_spontan: parseInt(document.getElementById('r-spontan')?.value) || 0,
    agenda:        document.getElementById('r-agenda')?.value || '',
    notulen:       document.getElementById('r-notulen')?.value || '',
    kesimpulan:    document.getElementById('r-kesimpulan')?.value || '',
    tindak_lanjut: document.getElementById('r-tindak')?.value || '',
  };
  try {
    if (_editingRapatId) {
      await DB.updateRapat(_editingRapatId, data);
      showToast('Rapat diperbarui!', 'success');
    } else {
      await DB.addRapat(data);
      showToast('Rapat dicatat!', 'success');
    }
    closeModal('add-rapat-modal');
    await renderRapat();
  } catch(e) { showToast('Gagal simpan: ' + e.message, 'error'); }
}

async function openEditRapatModal(id) {
  const r = _rapatData.find(x => x.id === id);
  if (!r) return;
  _editingRapatId = id;
  document.getElementById('add-rapat-title').textContent = '✏️ Edit Catatan Rapat';
  // Fill fields
  const fields = {
    'r-judul': r.judul, 'r-tanggal': r.tanggal, 'r-jenis': r.jenis,
    'r-mulai': r.waktu_mulai, 'r-selesai': r.waktu_selesai,
    'r-tempat': r.tempat, 'r-pimpinan': r.pimpinan_rapat,
    'r-hadir': r.jumlah_hadir, 'r-total': r.jumlah_total,
    'r-notulis': r.notulis, 'r-spontan': r.total_spontan,
    'r-agenda': r.agenda, 'r-notulen': r.notulen,
    'r-kesimpulan': r.kesimpulan, 'r-tindak': r.tindak_lanjut,
  };
  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  });
  document.getElementById('add-rapat-modal').querySelector('.modal-footer .btn-primary').onclick = saveRapat;
  openModal('add-rapat-modal');
}

// ============================================================
// ACHIEVEMENT MODAL (EDIT)
// ============================================================
let _editingAchId = null;

async function openEditAchModal(id) {
  const p = _achData.find(x => x.id === id);
  if (!p) return;
  _editingAchId = id;
  document.getElementById('ach-modal-title').textContent = '✏️ Edit Prestasi';
  document.getElementById('a-nama').value     = p.nama || '';
  document.getElementById('a-prestasi').value = p.prestasi || '';
  document.getElementById('a-kategori').value = p.kategori || '';
  document.getElementById('a-level').value    = p.level || 'Nasional';
  document.getElementById('a-tanggal').value  = p.tanggal || '';
  document.getElementById('a-medal').value    = p.medal || '🏆';
  document.getElementById('ach-modal-save').onclick = updateAchievement;
  openModal('add-ach-modal');
}

async function saveAchievement() {
  const data = {
    nama:     document.getElementById('a-nama')?.value.trim() || '',
    prestasi: document.getElementById('a-prestasi')?.value.trim() || '',
    kategori: document.getElementById('a-kategori')?.value || '',
    level:    document.getElementById('a-level')?.value || 'Nasional',
    tanggal:  document.getElementById('a-tanggal')?.value || null,
    medal:    document.getElementById('a-medal')?.value || '🏆',
  };
  if (!data.nama || !data.prestasi) { showToast('Nama dan prestasi wajib diisi!', 'error'); return; }
  try {
    if (_editingAchId) {
      await DB.updatePencapaian(_editingAchId, data);
      showToast('Prestasi diperbarui!', 'success');
    } else {
      await DB.addPencapaian(data);
      showToast('Prestasi ditambahkan!', 'success');
    }
    closeModal('add-ach-modal');
    _editingAchId = null;
    document.getElementById('ach-modal-save').onclick = saveAchievement;
    document.getElementById('ach-modal-title').textContent = '🏆 Tambah Pencapaian';
    await renderAchievement();
  } catch(e) { showToast('Gagal simpan: ' + e.message, 'error'); }
}

async function updateAchievement() { await saveAchievement(); }

// ============================================================
// SAVE OTHERS
// ============================================================
async function saveMateri() {
  const judul = document.getElementById('m-judul')?.value.trim() || '';
  if (!judul) { showToast('Judul wajib diisi!', 'error'); return; }
  try {
    await DB.addMateri({
      judul,
      kategori: document.getElementById('m-kategori')?.value || 'Referensi',
      icon:     document.getElementById('m-icon')?.value || '📄',
      ukuran:   document.getElementById('m-ukuran')?.value || '',
      uploader: document.getElementById('m-uploader')?.value || '',
      deskripsi:document.getElementById('m-desc')?.value || '',
      tags:     document.getElementById('m-tags')?.value || '',
      file_url: document.getElementById('m-url')?.value || '',
    });
    closeModal('add-materi-modal');
    showToast('Materi ditambahkan!', 'success');
    await renderMateri();
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

async function saveProject() {
  const nama = document.getElementById('p-nama')?.value.trim() || '';
  const pembuat = document.getElementById('p-pembuat')?.value.trim() || '';
  if (!nama || !pembuat) { showToast('Nama project dan pembuat wajib diisi!', 'error'); return; }
  try {
    await DB.addProject({
      nama, pembuat,
      angkatan: parseInt(document.getElementById('p-angkatan')?.value) || null,
      kategori: document.getElementById('p-kategori')?.value || 'Web App',
      icon:     document.getElementById('p-icon')?.value || '💻',
      demo_url: document.getElementById('p-demo')?.value || '',
      repo_url: document.getElementById('p-repo')?.value || '',
      deskripsi:document.getElementById('p-desc')?.value || '',
      tags:     document.getElementById('p-tags')?.value || '',
      status:   'pending',
    });
    closeModal('add-project-modal');
    showToast('Project disubmit! Menunggu review admin.', 'success');
    if (isAdmin()) await renderProjects();
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

async function saveLPJ() {
  const judul  = document.getElementById('lpj-judul')?.value.trim() || '';
  const periode = document.getElementById('lpj-periode')?.value || '';
  if (!judul || !periode) { showToast('Judul dan periode wajib diisi!', 'error'); return; }
  try {
    await DB.addLPJ({
      judul, periode,
      divisi:   document.getElementById('lpj-divisi')?.value || 'Semua Divisi',
      tanggal:  document.getElementById('lpj-tanggal')?.value || null,
      deskripsi:document.getElementById('lpj-desc')?.value || '',
      ukuran:   document.getElementById('lpj-ukuran')?.value || '',
      file_url: document.getElementById('lpj-url')?.value || '',
    });
    closeModal('add-lpj-modal');
    showToast('LPJ ditambahkan!', 'success');
    await renderArsipLPJ();
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

async function submitBlog() {
  const judul  = document.getElementById('b-judul')?.value.trim() || '';
  const penulis = document.getElementById('b-penulis')?.value.trim() || '';
  const isi    = document.getElementById('b-isi')?.value.trim() || '';
  if (!judul || !penulis || !isi) { showToast('Judul, penulis, dan isi wajib diisi!', 'error'); return; }
  try {
    await DB.addBlog({
      judul, penulis, isi,
      divisi: document.getElementById('b-divisi')?.value || 'Umum',
      emoji:  document.getElementById('b-emoji')?.value || '📝',
      tags:   document.getElementById('b-tags')?.value || '',
      status: 'pending',
    });
    closeModal('submit-blog-modal');
    showToast('Artikel disubmit! Menunggu review admin. ✅', 'success');
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

async function saveBerita() {
  const judul = document.getElementById('bn-judul')?.value.trim() || '';
  if (!judul) { showToast('Judul wajib diisi!', 'error'); return; }
  try {
    const beritaId = document.getElementById('add-berita-modal').dataset.editId;
    const data = {
      judul,
      kategori:   document.getElementById('bn-kategori')?.value || 'Umum',
      emoji:      document.getElementById('bn-emoji')?.value || '📰',
      penulis:    document.getElementById('bn-penulis')?.value || 'Admin HIMAIF',
      excerpt:    document.getElementById('bn-excerpt')?.value || '',
      konten:     document.getElementById('bn-konten')?.value || '',
      is_featured:document.getElementById('bn-featured')?.checked || false,
    };
    if (beritaId) {
      await DB.updateBerita(beritaId, data);
      delete document.getElementById('add-berita-modal').dataset.editId;
      document.getElementById('berita-modal-title').textContent = '📰 Tambah Berita';
      showToast('Berita diperbarui!', 'success');
    } else {
      await DB.addBerita(data);
      showToast('Berita dipublish!', 'success');
    }
    closeModal('add-berita-modal');
    await renderHome();
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

async function openEditBeritaModal(id) {
  const data = await DB.getBerita();
  const b = data.find(x => x.id === id);
  if (!b) return;
  document.getElementById('add-berita-modal').dataset.editId = id;
  document.getElementById('berita-modal-title').textContent = '✏️ Edit Berita';
  document.getElementById('bn-judul').value    = b.judul || '';
  document.getElementById('bn-kategori').value = b.kategori || 'Umum';
  document.getElementById('bn-emoji').value    = b.emoji || '📰';
  document.getElementById('bn-penulis').value  = b.penulis || '';
  document.getElementById('bn-excerpt').value  = b.excerpt || '';
  document.getElementById('bn-konten').value   = b.konten || '';
  document.getElementById('bn-featured').checked = b.is_featured || false;
  openModal('add-berita-modal');
}

async function deleteBerita(id) {
  if (!confirm('Hapus berita ini?')) return;
  try { await DB.deleteBerita(id); showToast('Berita dihapus.', 'success'); }
  catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

async function saveKegiatan() {
  const judul = document.getElementById('kg-judul')?.value.trim() || '';
  if (!judul) { showToast('Judul wajib diisi!', 'error'); return; }
  try {
    await DB.addKegiatan({
      judul,
      divisi:  document.getElementById('kg-divisi')?.value || '',
      periode: document.getElementById('kg-periode')?.value || STATE.activePeriode,
      tanggal: document.getElementById('kg-tanggal')?.value || null,
      emoji:   document.getElementById('kg-emoji')?.value || '📸',
      deskripsi:document.getElementById('kg-desc')?.value || '',
      ada_lpj: document.getElementById('kg-lpj')?.checked || false,
    });
    closeModal('add-kegiatan-modal');
    showToast('Kegiatan ditambahkan!', 'success');
    await renderArsipKegiatan();
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

// ============================================================
// USER MANAGEMENT
// ============================================================
let _editingUserId = null;

async function saveUser() {
  const username = (document.getElementById('u-username')?.value || '').trim().toLowerCase();
  const password = document.getElementById('u-password')?.value || '';
  const display  = document.getElementById('u-display')?.value.trim() || '';
  const role     = document.getElementById('u-role')?.value || 'pengurus';
  if (!username || !password) { showToast('Username dan password wajib diisi!', 'error'); return; }
  if (password.length < 6)   { showToast('Password minimal 6 karakter!', 'error'); return; }
  try {
    if (_editingUserId) {
      await DB_AUTH.update(_editingUserId, { username, password_hash: password, display_name: display, role });
      showToast('User diperbarui!', 'success');
    } else {
      await DB_AUTH.add({ username, password_hash: password, display_name: display, role, is_active: true });
      showToast(`User "${username}" ditambahkan!`, 'success');
    }
    closeModal('add-user-modal');
    _editingUserId = null;
    adminTab('users', document.querySelector('#admin-main-tabs .tab-btn[onclick*="users"]'));
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

function openChangePasswordModal(id, username) {
  document.getElementById('cp-username-label').textContent = username;
  document.getElementById('cp-new-pwd').value    = '';
  document.getElementById('cp-confirm-pwd').value = '';
  document.getElementById('cp-save-btn').onclick  = async () => {
    const newPwd = document.getElementById('cp-new-pwd')?.value || '';
    const confirm = document.getElementById('cp-confirm-pwd')?.value || '';
    if (!newPwd || newPwd.length < 6) { showToast('Password minimal 6 karakter!', 'error'); return; }
    if (newPwd !== confirm) { showToast('Password tidak cocok!', 'error'); return; }
    try {
      await DB_AUTH.changePassword(id, newPwd);
      closeModal('change-pwd-modal');
      showToast('Password berhasil diubah!', 'success');
    } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
  };
  openModal('change-pwd-modal');
}

async function deleteUser(id, username) {
  if (username === STATE.username) { showToast('Tidak dapat menghapus akun sendiri!', 'error'); return; }
  if (!confirm(`Hapus user "${username}"?`)) return;
  try {
    await DB_AUTH.delete(id);
    showToast(`User "${username}" dihapus.`, 'success');
    adminTab('users', document.querySelector('#admin-main-tabs .tab-btn[onclick*="users"]'));
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}