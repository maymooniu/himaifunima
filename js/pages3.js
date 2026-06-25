// =============================================================
<<<<<<< HEAD
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
=======
// HIMAIF — Admin Panel + All Modal Handlers
// =============================================================

// ============================================================
// ADMIN MAIN RENDER
// ============================================================
function renderAdmin() {
  if (!isAdmin()) {
    document.getElementById('admin-content').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔐</div>
        <div class="empty-title">Akses Admin Diperlukan</div>
        <div class="empty-desc">Login sebagai admin untuk mengakses panel pengelolaan konten website HIMAIF.</div>
        <button class="btn btn-primary btn-lg" onclick="openModal('login-modal')">🔑 Login Admin</button>
      </div>`;
    return;
  }
  document.getElementById('admin-content').innerHTML = `
    <div class="warning-box mb-4">
      <span>🔑</span>
      <span>Anda sedang dalam <strong>Mode Admin</strong>. Semua konten dapat diedit dan dihapus. Berhati-hatilah.</span>
      <button class="btn btn-danger btn-sm" style="margin-left:auto;" onclick="adminLogout()">Logout</button>
    </div>
    <div class="tabs" id="admin-main-tabs">
      <button class="tab-btn active" onclick="switchAdminTab('pengurus', this)">👥 Pengurus</button>
      <button class="tab-btn" onclick="switchAdminTab('proker', this)">📋 Proker</button>
      <button class="tab-btn" onclick="switchAdminTab('lpj', this)">📄 LPJ</button>
      <button class="tab-btn" onclick="switchAdminTab('blog', this)">✍️ Blog</button>
      <button class="tab-btn" onclick="switchAdminTab('berita', this)">📰 Berita</button>
      <button class="tab-btn" onclick="switchAdminTab('settings', this)">⚙️ Pengaturan</button>
      <button class="tab-btn" onclick="switchAdminTab('export', this)">📥 Export</button>
    </div>
    <div id="admin-tab-body"></div>`;

  switchAdminTab('pengurus', document.querySelector('#admin-main-tabs .tab-btn'));
}

async function switchAdminTab(tab, btn) {
  if (btn && btn.closest('#admin-main-tabs')) {
    btn.closest('#admin-main-tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  const ct = document.getElementById('admin-tab-body');
  setLoading('admin-tab-body', true);

  if (tab === 'pengurus') {
    ct.innerHTML = `
      <div class="section-header">
        <div><div class="section-title" style="font-size:18px;">Kelola Pengurus</div></div>
        <div class="flex gap-2 flex-wrap">
          <select class="form-control" style="width:auto;" id="admin-periode-sel" onchange="loadAdminPengurus()">
            ${(await DB.getPeriodes()).map(p => `<option value="${p.nama}" ${p.nama === STATE.activePeriode ? 'selected' : ''}>${p.nama}${p.is_active ? ' (Aktif)' : ''}</option>`).join('')}
          </select>
          <button class="btn btn-primary" onclick="openModal('add-pengurus-modal')">+ Tambah Pengurus</button>
          <button class="btn btn-ghost btn-sm" onclick="exportPengurusCSV(document.getElementById('admin-periode-sel').value)">📥 Export CSV</button>
        </div>
      </div>
      <div id="admin-pengurus-table"><div class="loading-wrap"><div class="spinner"></div></div></div>`;
    await loadAdminPengurus();

  } else if (tab === 'proker') {
    ct.innerHTML = `
      <div class="section-header">
        <div><div class="section-title" style="font-size:18px;">Kelola Program Kerja</div></div>
        <div class="flex gap-2">
          <button class="btn btn-primary" onclick="openAddProkerModal()">+ Tambah Proker</button>
          <button class="btn btn-ghost btn-sm" onclick="exportProkerCSV(STATE.activePeriode)">📥 Export CSV</button>
        </div>
      </div>
      <div id="admin-proker-table"><div class="loading-wrap"><div class="spinner"></div></div></div>`;
    await loadAdminProker();

  } else if (tab === 'lpj') {
    const lpjData = await DB.getLPJ();
    ct.innerHTML = `
      <div class="section-header">
        <div><div class="section-title" style="font-size:18px;">Kelola Arsip LPJ</div></div>
        <button class="btn btn-primary" onclick="openModal('add-lpj-modal')">+ Tambah LPJ</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Judul</th><th>Periode</th><th>Divisi</th><th>Tanggal</th><th>Ukuran</th><th>Aksi</th></tr></thead>
          <tbody>
            ${lpjData.map(l => `
              <tr>
                <td class="font-bold">${escapeHtml(l.judul)}</td>
                <td>${l.periode}</td>
                <td>${l.divisi}</td>
                <td>${formatDate(l.tanggal)}</td>
                <td>${l.ukuran || '—'}</td>
                <td>
                  <div class="td-actions">
                    ${l.file_url ? `<a href="${l.file_url}" class="btn btn-ghost btn-sm" target="_blank">⬇️</a>` : ''}
                    <button class="btn btn-danger btn-sm" onclick="deleteLPJ('${l.id}');switchAdminTab('lpj',null)">🗑️</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

  } else if (tab === 'blog') {
    const blogData = await DB.getBlog(true);
    ct.innerHTML = `
      <div class="section-header">
        <div><div class="section-title" style="font-size:18px;">Kelola Tech Blog</div></div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Judul</th><th>Penulis</th><th>Divisi</th><th>Status</th><th>Views</th><th>Tanggal</th><th>Aksi</th></tr></thead>
          <tbody>
            ${blogData.map(b => `
              <tr>
                <td class="font-bold" style="max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(b.judul)}</td>
                <td>${escapeHtml(b.penulis)}</td>
                <td>${b.divisi || '—'}</td>
                <td>${getStatusBadge(b.status)}</td>
                <td>${b.views || 0}</td>
                <td>${formatDateShort(b.published_at || b.created_at)}</td>
                <td>
                  <div class="td-actions">
                    ${b.status === 'pending' ? `<button class="btn btn-success btn-sm" onclick="approveBlog('${b.id}');switchAdminTab('blog',null)">✅</button>
                    <button class="btn btn-danger btn-sm" onclick="rejectBlog('${b.id}');switchAdminTab('blog',null)">❌</button>` : ''}
                    <button class="btn btn-danger btn-sm" onclick="deleteBlog('${b.id}');switchAdminTab('blog',null)">🗑️</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

  } else if (tab === 'berita') {
    const beritaData = await DB.getBerita();
    ct.innerHTML = `
      <div class="section-header">
        <div><div class="section-title" style="font-size:18px;">Kelola Berita</div></div>
        <button class="btn btn-primary" onclick="openBeritaModal()">+ Tambah Berita</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Emoji</th><th>Judul</th><th>Kategori</th><th>Featured</th><th>Tanggal</th><th>Aksi</th></tr></thead>
          <tbody>
            ${beritaData.map(n => `
              <tr>
                <td style="font-size:24px;">${n.emoji}</td>
                <td class="font-bold">${escapeHtml(n.judul)}</td>
                <td><span class="badge badge-gray">${n.kategori}</span></td>
                <td>${n.is_featured ? '<span class="badge badge-amber">⭐ Featured</span>' : '—'}</td>
                <td>${formatDateShort(n.published_at)}</td>
                <td>
                  <div class="td-actions">
                    <button class="btn btn-danger btn-sm" onclick="deleteBerita('${n.id}');switchAdminTab('berita',null)">🗑️</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;

  } else if (tab === 'settings') {
    const s = STATE.settings;
    ct.innerHTML = `
      <div class="section-title mb-4" style="font-size:18px;">⚙️ Pengaturan Website</div>
      <div class="grid-2">
        <div class="card">
          <div class="card-header"><span class="card-header-title">Informasi Umum</span></div>
          <div class="card-body">
            ${[['nama_prodi','Nama Prodi'],['nama_universitas','Nama Universitas'],['email_kontak','Email Kontak'],['instagram','Instagram'],['periode_aktif','Periode Aktif']].map(([k,l]) => `
              <div class="form-group">
                <label class="form-label">${l}</label>
                <input type="text" class="form-control" id="setting-${k}" value="${escapeHtml(s[k] || '')}">
              </div>`).join('')}
            <button class="btn btn-primary w-full" onclick="saveSettingGroup(['nama_prodi','nama_universitas','email_kontak','instagram','periode_aktif'])">💾 Simpan Informasi</button>
          </div>
        </div>
        <div>
          <div class="card mb-4">
            <div class="card-header"><span class="card-header-title">Visi & Misi HIMAIF</span></div>
            <div class="card-body">
              <div class="form-group"><label class="form-label">Visi</label><textarea class="form-control" id="setting-visi_himaif" rows="3">${escapeHtml(s['visi_himaif'] || '')}</textarea></div>
              <div class="form-group"><label class="form-label">Misi (satu baris per poin)</label><textarea class="form-control" id="setting-misi_himaif" rows="6">${escapeHtml(s['misi_himaif'] || '')}</textarea></div>
              <button class="btn btn-primary w-full" onclick="saveSettingGroup(['visi_himaif','misi_himaif'])">💾 Simpan Visi Misi HIMAIF</button>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><span class="card-header-title">Visi & Misi Prodi</span></div>
            <div class="card-body">
              <div class="form-group"><label class="form-label">Visi Prodi</label><textarea class="form-control" id="setting-visi_prodi" rows="3">${escapeHtml(s['visi_prodi'] || '')}</textarea></div>
              <div class="form-group"><label class="form-label">Misi Prodi</label><textarea class="form-control" id="setting-misi_prodi" rows="6">${escapeHtml(s['misi_prodi'] || '')}</textarea></div>
              <div class="form-group"><label class="form-label">Tentang HIMAIF (deskripsi)</label><textarea class="form-control" id="setting-tentang_himaif" rows="4">${escapeHtml(s['tentang_himaif'] || '')}</textarea></div>
              <button class="btn btn-primary w-full" onclick="saveSettingGroup(['visi_prodi','misi_prodi','tentang_himaif'])">💾 Simpan Visi Misi Prodi</button>
            </div>
          </div>
        </div>
      </div>`;

  } else if (tab === 'export') {
    ct.innerHTML = `
      <div class="section-title mb-4" style="font-size:18px;">📥 Export Data</div>
      <div class="grid-3">
        ${[
          ['👥','Data Pengurus Aktif','Daftar lengkap pengurus periode aktif','exportPengurusCSV("' + STATE.activePeriode + '")'],
          ['📋','Program Kerja','Semua proker periode aktif','exportProkerCSV("' + STATE.activePeriode + '")'],
          ['🏆','Pencapaian Prodi','Seluruh pencapaian mahasiswa','exportPencapaianCSV()'],
          ['📝','Catatan Rapat','Semua notulen rapat','exportRapatCSV()'],
          ['📢','Data Aspirasi','Seluruh aspirasi masuk','exportAspirasiCSV()'],
          ['📄','Arsip Semua Pengurus','Semua periode pengurus','exportAllPengurusCSV()'],
        ].map(([icon, title, desc, fn]) => `
          <div class="card">
            <div class="card-body text-center">
              <div style="font-size:40px;margin-bottom:12px;">${icon}</div>
              <div class="font-bold mb-1">${title}</div>
              <div class="text-sm text-muted mb-4">${desc}</div>
              <button class="btn btn-primary btn-sm w-full" onclick="${fn}">📥 Export CSV</button>
            </div>
          </div>`).join('')}
      </div>`;
  }
}

async function loadAdminPengurus() {
  const periode = document.getElementById('admin-periode-sel')?.value || STATE.activePeriode;
  const data = await DB.getPengurus(periode);
  document.getElementById('admin-pengurus-table').innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Nama</th><th>NIM</th><th>Divisi</th><th>Jabatan</th><th>Semester</th><th>Urutan</th><th>Aksi</th></tr></thead>
        <tbody>
          ${data.map(m => `
            <tr>
              <td><div class="flex items-center gap-2"><div class="avatar avatar-sm">${initials(m.nama)}</div><span class="font-bold">${escapeHtml(m.nama)}</span></div></td>
              <td class="font-mono text-sm">${m.nim}</td>
              <td><span class="badge badge-blue">${m.divisi}</span></td>
              <td>${escapeHtml(m.jabatan)}</td>
              <td>${m.semester}</td>
              <td>${m.urutan}</td>
              <td>
                <div class="td-actions">
                  <button class="btn btn-ghost btn-sm" onclick="openEditPengurusModal('${m.id}')">✏️ Edit</button>
                  <button class="btn btn-danger btn-sm" onclick="deletePengurusAdmin('${m.id}','${escapeHtml(m.nama)}')">🗑️</button>
                </div>
              </td>
            </tr>`).join('')}
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
        </tbody>
      </table>
    </div>`;
}

<<<<<<< HEAD
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
=======
async function loadAdminProker() {
  const data = await DB.getProker(STATE.activePeriode);
  document.getElementById('admin-proker-table').innerHTML = `
    <div class="table-wrap">
      <table>
        <thead><tr><th>Nama</th><th>Divisi</th><th>Ketua</th><th>Status</th><th>Progress</th><th>Target</th><th>Anggaran</th><th>Aksi</th></tr></thead>
        <tbody>
          ${data.map(p => `
            <tr>
              <td class="font-bold">${escapeHtml(p.nama)}</td>
              <td>${p.divisi}</td>
              <td>${escapeHtml(p.ketua || '—')}</td>
              <td>${getStatusBadge(p.status)}</td>
              <td><div style="width:80px;height:6px;background:var(--bg-3);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${p.progress}%;background:var(--accent);border-radius:3px;"></div></div><span class="text-xs text-muted">${p.progress}%</span></td>
              <td>${formatDate(p.target_tanggal)}</td>
              <td>${formatCurrency(p.anggaran)}</td>
              <td>
                <div class="td-actions">
                  <button class="btn btn-ghost btn-sm" onclick="openEditProkerModal('${p.id}')">✏️</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteProker('${p.id}','${escapeHtml(p.nama)}');loadAdminProker()">🗑️</button>
                </div>
              </td>
            </tr>`).join('')}
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
        </tbody>
      </table>
    </div>`;
}

<<<<<<< HEAD
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
=======
// ============================================================
// PENGURUS CRUD MODALS
// ============================================================
const DIVISI_LIST = ['Inti','Akademik & Keilmuan','PSDM','Kominfo','Mikat','Kewirausahaan'];
const JABATAN_LIST = ['Ketua Umum','Wakil Ketua','Sekretaris Umum','Bendahara Umum','Kepala Divisi','Wakil Kepala Divisi','Sekretaris','Bendahara','Anggota'];

function pengurusFormHtml(m = {}) {
  return `
    <div class="grid-2">
      <div class="form-group"><label class="form-label">Nama Lengkap *</label><input type="text" class="form-control" id="pf-nama" value="${escapeHtml(m.nama||'')}" placeholder="Nama lengkap..."></div>
      <div class="form-group"><label class="form-label">NIM *</label><input type="text" class="form-control" id="pf-nim" value="${m.nim||''}" placeholder="NIM..."></div>
      <div class="form-group"><label class="form-label">Divisi *</label>
        <select class="form-control" id="pf-divisi">
          ${DIVISI_LIST.map(d => `<option value="${d}" ${(m.divisi||'Inti') === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Jabatan *</label>
        <select class="form-control" id="pf-jabatan">
          ${JABATAN_LIST.map(j => `<option value="${j}" ${(m.jabatan||'Anggota') === j ? 'selected' : ''}>${j}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Tanggal Lahir</label><input type="date" class="form-control" id="pf-tl" value="${m.tanggal_lahir||''}"></div>
      <div class="form-group"><label class="form-label">Semester</label><input type="number" class="form-control" id="pf-sem" value="${m.semester||''}" min="1" max="14" placeholder="Semester aktif..."></div>
      <div class="form-group"><label class="form-label">Periode *</label>
        <select class="form-control" id="pf-periode">
          ${['2024/2025','2023/2024','2022/2023','2021/2022'].map(p => `<option value="${p}" ${(m.periode||STATE.activePeriode) === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Urutan Tampilan</label><input type="number" class="form-control" id="pf-urutan" value="${m.urutan||99}" min="1" placeholder="Urutan di org chart..."></div>
    </div>
    <div class="form-group"><label class="form-label">Bio / Deskripsi Singkat</label><textarea class="form-control" id="pf-bio" rows="3" placeholder="Bio singkat...">${escapeHtml(m.bio||'')}</textarea></div>
    <div class="form-group"><label class="form-label">LinkedIn URL</label><input type="text" class="form-control" id="pf-linkedin" value="${m.linkedin_url||''}" placeholder="https://linkedin.com/in/..."></div>`;
}

function openAddPengurusModal() {
  document.getElementById('add-pengurus-title').textContent = '➕ Tambah Pengurus';
  document.getElementById('add-pengurus-body').innerHTML = pengurusFormHtml();
  document.getElementById('add-pengurus-save').onclick = savePengurus;
  openModal('add-pengurus-modal');
}

let _editingPengurusId = null;
async function openEditPengurusModal(id) {
  // Find from all loaded data
  let m = _pengurusData.find(x => x.id === id);
  if (!m) {
    try { const rows = await DB.getPengurus(STATE.activePeriode); m = rows.find(x => x.id === id); } catch {}
  }
  if (!m) { showToast('Data tidak ditemukan.', 'error'); return; }
  _editingPengurusId = id;
  document.getElementById('add-pengurus-title').textContent = '✏️ Edit Pengurus';
  document.getElementById('add-pengurus-body').innerHTML = pengurusFormHtml(m);
  document.getElementById('add-pengurus-save').onclick = updatePengurus;
  openModal('add-pengurus-modal');
}

async function savePengurus() {
  const nama = document.getElementById('pf-nama').value.trim();
  const nim = document.getElementById('pf-nim').value.trim();
  if (!nama || !nim) { showToast('Nama dan NIM wajib diisi!', 'error'); return; }
  try {
    await DB.addPengurus({
      nama, nim,
      divisi: document.getElementById('pf-divisi').value,
      jabatan: document.getElementById('pf-jabatan').value,
      tanggal_lahir: document.getElementById('pf-tl').value || null,
      semester: parseInt(document.getElementById('pf-sem').value) || 1,
      periode: document.getElementById('pf-periode').value,
      urutan: parseInt(document.getElementById('pf-urutan').value) || 99,
      bio: document.getElementById('pf-bio').value,
      linkedin_url: document.getElementById('pf-linkedin').value,
    });
    closeModal('add-pengurus-modal');
    showToast(`Pengurus "${nama}" berhasil ditambahkan!`, 'success');
    cacheClear('pengurus');
    await renderPengurus();
    if (document.getElementById('admin-pengurus-table')) await loadAdminPengurus();
  } catch (e) { showToast('Gagal simpan: ' + e.message, 'error'); }
}

async function updatePengurus() {
  const nama = document.getElementById('pf-nama').value.trim();
  if (!nama) { showToast('Nama wajib diisi!', 'error'); return; }
  try {
    await DB.updatePengurus(_editingPengurusId, {
      nama,
      nim: document.getElementById('pf-nim').value.trim(),
      divisi: document.getElementById('pf-divisi').value,
      jabatan: document.getElementById('pf-jabatan').value,
      tanggal_lahir: document.getElementById('pf-tl').value || null,
      semester: parseInt(document.getElementById('pf-sem').value) || 1,
      periode: document.getElementById('pf-periode').value,
      urutan: parseInt(document.getElementById('pf-urutan').value) || 99,
      bio: document.getElementById('pf-bio').value,
      linkedin_url: document.getElementById('pf-linkedin').value,
    });
    closeModal('add-pengurus-modal');
    showToast(`Data pengurus "${nama}" berhasil diperbarui!`, 'success');
    cacheClear('pengurus');
    await renderPengurus();
    if (document.getElementById('admin-pengurus-table')) await loadAdminPengurus();
  } catch (e) { showToast('Gagal update: ' + e.message, 'error'); }
}

async function deletePengurusAdmin(id, nama) {
  if (!confirm(`Hapus pengurus "${nama}"? Data tidak dapat dikembalikan.`)) return;
  try {
    await DB.deletePengurus(id);
    showToast(`Pengurus "${nama}" dihapus.`, 'success');
    cacheClear('pengurus');
    await loadAdminPengurus();
  } catch (e) { showToast('Gagal hapus: ' + e.message, 'error'); }
}

async function deletePengurus(id, nama) {
  if (!confirm(`Hapus pengurus "${nama}"?`)) return;
  try {
    await DB.deletePengurus(id);
    showToast(`Pengurus dihapus.`, 'success');
    _pengurusData = _pengurusData.filter(m => m.id !== id);
    renderOrgChart(_pengurusData);
    renderPengurusList(_pengurusData);
  } catch (e) { showToast('Gagal hapus: ' + e.message, 'error'); }
}

// ============================================================
// PROKER MODALS
// ============================================================
let _editingProkerId = null;
async function openAddProkerModal() {
  _editingProkerId = null;
  document.getElementById('proker-modal-title').textContent = '➕ Tambah Program Kerja';
  document.getElementById('proker-modal-body').innerHTML = prokerFormHtml();
  document.getElementById('proker-modal-save').onclick = saveProker;
  openModal('proker-modal');
}

async function openEditProkerModal(id) {
  const data = await DB.getProker(STATE.activePeriode);
  const p = data.find(x => x.id === id);
  if (!p) { showToast('Data tidak ditemukan.', 'error'); return; }
  _editingProkerId = id;
  document.getElementById('proker-modal-title').textContent = '✏️ Edit Program Kerja';
  document.getElementById('proker-modal-body').innerHTML = prokerFormHtml(p);
  document.getElementById('proker-modal-save').onclick = updateProker;
  openModal('proker-modal');
}

function prokerFormHtml(p = {}) {
  return `
    <div class="form-group"><label class="form-label">Nama Program Kerja *</label><input type="text" class="form-control" id="pkf-nama" value="${escapeHtml(p.nama||'')}" placeholder="Nama proker..."></div>
    <div class="grid-2">
      <div class="form-group"><label class="form-label">Divisi *</label>
        <select class="form-control" id="pkf-divisi">
          ${DIVISI_LIST.filter(d=>d!=='Inti').map(d => `<option value="${d}" ${(p.divisi||'') === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label class="form-label">Ketua Pelaksana</label><input type="text" class="form-control" id="pkf-ketua" value="${escapeHtml(p.ketua||'')}" placeholder="Nama ketua..."></div>
      <div class="form-group"><label class="form-label">Status</label>
        <select class="form-control" id="pkf-status">
          <option value="aktif" ${(p.status||'aktif')==='aktif'?'selected':''}>Belum Dimulai</option>
          <option value="sedang_berjalan" ${p.status==='sedang_berjalan'?'selected':''}>Sedang Berjalan</option>
          <option value="selesai" ${p.status==='selesai'?'selected':''}>Selesai</option>
          <option value="dibatalkan" ${p.status==='dibatalkan'?'selected':''}>Dibatalkan</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Progress (%)</label><input type="number" class="form-control" id="pkf-progress" value="${p.progress||0}" min="0" max="100"></div>
      <div class="form-group"><label class="form-label">Target Tanggal</label><input type="date" class="form-control" id="pkf-tanggal" value="${p.target_tanggal||''}"></div>
      <div class="form-group"><label class="form-label">Anggaran (Rp)</label><input type="number" class="form-control" id="pkf-anggaran" value="${p.anggaran||0}" min="0"></div>
    </div>
    <div class="form-group"><label class="form-label">Deskripsi</label><textarea class="form-control" id="pkf-desc" rows="3" placeholder="Deskripsi program kerja...">${escapeHtml(p.deskripsi||'')}</textarea></div>`;
}

async function saveProker() {
  const nama = document.getElementById('pkf-nama').value.trim();
  if (!nama) { showToast('Nama proker wajib diisi!', 'error'); return; }
  try {
    await DB.addProker({
      nama, periode: STATE.activePeriode,
      divisi: document.getElementById('pkf-divisi').value,
      ketua: document.getElementById('pkf-ketua').value,
      status: document.getElementById('pkf-status').value,
      progress: parseInt(document.getElementById('pkf-progress').value) || 0,
      target_tanggal: document.getElementById('pkf-tanggal').value || null,
      anggaran: parseInt(document.getElementById('pkf-anggaran').value) || 0,
      deskripsi: document.getElementById('pkf-desc').value,
    });
    closeModal('proker-modal');
    showToast('Proker berhasil ditambahkan!', 'success');
    await renderProker();
    if (document.getElementById('admin-proker-table')) await loadAdminProker();
  } catch (e) { showToast('Gagal simpan: ' + e.message, 'error'); }
}

async function updateProker() {
  try {
    await DB.updateProker(_editingProkerId, {
      nama: document.getElementById('pkf-nama').value.trim(),
      divisi: document.getElementById('pkf-divisi').value,
      ketua: document.getElementById('pkf-ketua').value,
      status: document.getElementById('pkf-status').value,
      progress: parseInt(document.getElementById('pkf-progress').value) || 0,
      target_tanggal: document.getElementById('pkf-tanggal').value || null,
      anggaran: parseInt(document.getElementById('pkf-anggaran').value) || 0,
      deskripsi: document.getElementById('pkf-desc').value,
    });
    closeModal('proker-modal');
    showToast('Proker berhasil diperbarui!', 'success');
    await renderProker();
    if (document.getElementById('admin-proker-table')) await loadAdminProker();
  } catch (e) { showToast('Gagal update: ' + e.message, 'error'); }
}

// ============================================================
// LPJ MODAL
// ============================================================
async function saveLPJ() {
  const judul = document.getElementById('lpj-judul').value.trim();
  const periode = document.getElementById('lpj-periode').value;
  if (!judul || !periode) { showToast('Judul dan periode wajib diisi!', 'error'); return; }
  try {
    await DB.addLPJ({
      judul, periode,
      tanggal: document.getElementById('lpj-tanggal').value || null,
      divisi: document.getElementById('lpj-divisi').value,
      deskripsi: document.getElementById('lpj-desc').value,
      ukuran: document.getElementById('lpj-ukuran').value,
      file_url: document.getElementById('lpj-url').value,
    });
    closeModal('add-lpj-modal');
    showToast('LPJ berhasil ditambahkan!', 'success');
    await renderArsip();
    switchAdminTab('lpj', null);
  } catch (e) { showToast('Gagal simpan: ' + e.message, 'error'); }
}

// ============================================================
// BERITA MODAL
// ============================================================
function openBeritaModal() {
  openModal('add-berita-modal');
}
async function saveBerita() {
  const judul = document.getElementById('berita-judul').value.trim();
  if (!judul) { showToast('Judul wajib diisi!', 'error'); return; }
  try {
    await DB.addBerita({
      judul,
      kategori: document.getElementById('berita-kategori').value,
      excerpt: document.getElementById('berita-excerpt').value,
      konten: document.getElementById('berita-konten').value,
      emoji: document.getElementById('berita-emoji').value || '📰',
      penulis: document.getElementById('berita-penulis').value || 'Admin HIMAIF',
      is_featured: document.getElementById('berita-featured').checked,
    });
    closeModal('add-berita-modal');
    showToast('Berita berhasil ditambahkan!', 'success');
    await renderHome();
    switchAdminTab('berita', null);
  } catch (e) { showToast('Gagal simpan: ' + e.message, 'error'); }
}
async function deleteBerita(id) {
  if (!confirm('Hapus berita ini?')) return;
  try { await DB.deleteBerita(id); showToast('Berita dihapus.', 'success'); }
  catch (e) { showToast('Gagal: ' + e.message, 'error'); }
}

// ============================================================
// SETTINGS SAVE
// ============================================================
async function saveSettingGroup(keys) {
  try {
    for (const k of keys) {
      const el = document.getElementById('setting-' + k);
      if (el) { await DB.saveSetting(k, el.value); STATE.settings[k] = el.value; }
    }
    showToast('Pengaturan berhasil disimpan!', 'success');
  } catch (e) { showToast('Gagal simpan: ' + e.message, 'error'); }
}

// ============================================================
// EXTRA EXPORTS
// ============================================================
async function exportAspirasiCSV() {
  try {
    const data = await DB.getAspirasi();
    exportToCSV(
      ['Kategori','Pesan','Status','Tanggal'],
      data.map(a => [a.kategori, a.pesan, a.status, a.created_at]),
      'aspirasi-himaif'
    );
  } catch (e) { showToast('Gagal export: ' + e.message, 'error'); }
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
}

async function exportAllPengurusCSV() {
  try {
    const data = await DB.getAllPengurus();
    exportToCSV(
      ['Nama','NIM','Divisi','Jabatan','Semester','Tanggal Lahir','Periode'],
      data.map(m => [m.nama, m.nim, m.divisi, m.jabatan, m.semester, m.tanggal_lahir, m.periode]),
      'semua-pengurus-himaif'
    );
<<<<<<< HEAD
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
=======
  } catch (e) { showToast('Gagal export: ' + e.message, 'error'); }
}

// Init handled in index.html inline script

// ============================================================
// ADMIN EXTRA TABS: Users & Logo
// ============================================================

// Append to switchAdminTab — called from HTML tabs
async function renderAdminUsers() {
  const ct = document.getElementById('admin-tab-body');
  setLoading('admin-tab-body', true);
  try {
    const users = await DB_AUTH.getAll();
    ct.innerHTML = `
      <div class="section-header">
        <div><div class="section-title" style="font-size:18px;">Manajemen Pengguna</div></div>
        <button class="btn btn-primary" onclick="openModal('add-user-modal')">+ Tambah User</button>
      </div>
      <div class="info-box mb-4"><span>ℹ️</span><span>Password disimpan di database, tidak di-hardcode. Terdapat 3 tipe: <strong>admin</strong> (akses penuh), <strong>pengurus</strong> (lihat halaman organisasi), <strong>user</strong> (publik).</span></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Username</th><th>Nama Tampil</th><th>Role</th><th>Status</th><th>Dibuat</th><th>Aksi</th></tr></thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td class="font-mono font-bold">${escapeHtml(u.username)}</td>
                <td>${escapeHtml(u.display_name||'—')}</td>
                <td>${u.role === 'admin' ? '<span class="badge badge-amber">👑 Admin</span>' : u.role === 'pengurus' ? '<span class="badge badge-blue">🎓 Pengurus</span>' : '<span class="badge badge-gray">👤 User</span>'}</td>
                <td>${u.is_active ? '<span class="badge badge-green">Aktif</span>' : '<span class="badge badge-red">Nonaktif</span>'}</td>
                <td>${formatDateShort(u.created_at)}</td>
                <td>
                  <div class="td-actions">
                    <button class="btn btn-ghost btn-sm" onclick="openChangePasswordModal('${u.id}','${escapeHtml(u.username)}')">🔑 Ganti Password</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteUser('${u.id}','${escapeHtml(u.username)}')">🗑️</button>
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  } catch(e) {
    ct.innerHTML = `<div class="warning-box">⚠️ ${e.message}</div>`;
  }
}

async function saveNewUser() {
  const username = document.getElementById('nu-username').value.trim().toLowerCase();
  const password = document.getElementById('nu-password').value;
  const role = document.getElementById('nu-role').value;
  const displayName = document.getElementById('nu-display').value.trim();
  if (!username || !password) { showToast('Username dan password wajib diisi!','error'); return; }
  try {
    await DB_AUTH.add({ username, password_hash: password, role, display_name: displayName, is_active: true });
    closeModal('add-user-modal');
    showToast(`User "${username}" berhasil ditambahkan!`,'success');
    renderAdminUsers();
  } catch(e) { showToast('Gagal: '+e.message,'error'); }
}

function openChangePasswordModal(id, username) {
  document.getElementById('cp-user-label').textContent = username;
  document.getElementById('cp-new-pwd').value = '';
  document.getElementById('cp-save-btn').onclick = async () => {
    const newPwd = document.getElementById('cp-new-pwd').value;
    if (!newPwd || newPwd.length < 6) { showToast('Password minimal 6 karakter!','error'); return; }
    try {
      await DB_AUTH.changePassword(id, newPwd);
      closeModal('change-pwd-modal');
      showToast('Password berhasil diperbarui!','success');
    } catch(e) { showToast('Gagal: '+e.message,'error'); }
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
  };
  openModal('change-pwd-modal');
}

async function deleteUser(id, username) {
<<<<<<< HEAD
  if (username === STATE.username) { showToast('Tidak dapat menghapus akun sendiri!', 'error'); return; }
  if (!confirm(`Hapus user "${username}"?`)) return;
  try {
    await DB_AUTH.delete(id);
    showToast(`User "${username}" dihapus.`, 'success');
    adminTab('users', document.querySelector('#admin-main-tabs .tab-btn[onclick*="users"]'));
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}
=======
  if (!confirm(`Hapus user "${username}"? Tindakan ini tidak dapat dibatalkan.`)) return;
  try {
    await DB_AUTH.delete(id);
    showToast(`User "${username}" dihapus.`,'success');
    renderAdminUsers();
  } catch(e) { showToast('Gagal: '+e.message,'error'); }
}

async function renderAdminLogoSettings() {
  const ct = document.getElementById('admin-tab-body');
  const currentLogo = STATE.settings.logo_url || '';
  ct.innerHTML = `
    <div class="section-title mb-4" style="font-size:18px;">🖼️ Logo & Tampilan</div>
    <div class="grid-2">
      <div class="card">
        <div class="card-header"><span class="card-header-title">Logo HIMAIF</span></div>
        <div class="card-body">
          <div style="margin-bottom:20px;">
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">Preview Logo Saat Ini:</div>
            <div id="logo-preview-wrap" style="width:80px;height:80px;background:var(--bg-3);border:1px solid var(--border);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:32px;">
              ${currentLogo ? `<img src="${currentLogo}" style="width:72px;height:72px;border-radius:10px;object-fit:contain;" onerror="this.parentElement.innerHTML='💻'">` : '💻'}
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">URL Logo (link gambar publik)</label>
            <input type="url" class="form-control" id="logo-url-input" value="${escapeHtml(currentLogo)}" placeholder="https://... (PNG/JPG/SVG, transparan lebih baik)">
            <div class="form-hint">Masukkan URL gambar logo HIMAIF. Disarankan berukuran minimal 200×200px dengan background transparan.</div>
          </div>
          <div class="form-group">
            <label class="form-label">Preview sebelum simpan</label>
            <button class="btn btn-ghost btn-sm" onclick="previewLogo()">👁️ Preview</button>
          </div>
          <button class="btn btn-primary" onclick="saveLogo()">💾 Simpan Logo</button>
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="card-header-title">Panduan Logo</span></div>
        <div class="card-body">
          <div class="text-sm text-muted" style="line-height:1.8;">
            <p class="mb-2">✅ <strong>Format yang disarankan:</strong> PNG dengan background transparan atau SVG</p>
            <p class="mb-2">✅ <strong>Ukuran ideal:</strong> 200×200px atau lebih (persegi)</p>
            <p class="mb-2">✅ <strong>Cara upload:</strong> Upload ke Google Drive (buat publik), Supabase Storage, atau hosting gambar seperti imgbb.com</p>
            <p class="mb-2">⚠️ Logo akan tampil di: Sidebar kiri atas, Panel Admin, dan halaman statis lainnya</p>
            <p class="mb-3">📌 Untuk Supabase Storage: buka bucket → upload → copy public URL</p>
            <div class="info-box" style="font-size:12px;"><span>ℹ️</span><span>Jika menggunakan Google Drive: ubah link share ke format <code style="font-family:var(--font-mono);background:var(--bg-3);padding:1px 5px;border-radius:4px;">https://drive.google.com/uc?id=FILE_ID</code></span></div>
          </div>
        </div>
      </div>
    </div>`;
}

function previewLogo() {
  const url = document.getElementById('logo-url-input')?.value.trim();
  const wrap = document.getElementById('logo-preview-wrap');
  if (!url || !wrap) return;
  wrap.innerHTML = `<img src="${url}" style="width:72px;height:72px;border-radius:10px;object-fit:contain;" onerror="this.parentElement.innerHTML='❌ Gagal muat'">`;
}

async function saveLogo() {
  const url = document.getElementById('logo-url-input')?.value.trim() || '';
  try {
    await DB.saveSetting('logo_url', url);
    STATE.settings.logo_url = url;
    showToast('Logo berhasil disimpan!','success');
    updateSidebar(); // Refresh sidebar with new logo
  } catch(e) { showToast('Gagal simpan logo: '+e.message,'error'); }
}

// Extend switchAdminTab to handle new tabs
const _origSwitchAdminTab = switchAdminTab;
window.switchAdminTab = async function(tab, btn) {
  if (tab === 'users') {
    if (btn?.closest('#admin-main-tabs')) {
      btn.closest('#admin-main-tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    await renderAdminUsers();
    return;
  }
  if (tab === 'logo') {
    if (btn?.closest('#admin-main-tabs')) {
      btn.closest('#admin-main-tabs').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
    await renderAdminLogoSettings();
    return;
  }
  return _origSwitchAdminTab(tab, btn);
};

// Extend renderAdmin to add extra tabs
const _origRenderAdmin = renderAdmin;
window.renderAdmin = function() {
  if (!isAdmin()) {
    document.getElementById('admin-content').innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔐</div>
        <div class="empty-title">Akses Admin Diperlukan</div>
        <div class="empty-desc">Halaman ini hanya dapat diakses oleh Administrator HIMAIF.</div>
        <button class="btn btn-primary btn-lg" onclick="openModal('login-modal')">🔑 Login Admin</button>
      </div>`;
    return;
  }
  document.getElementById('admin-content').innerHTML = `
    <div class="warning-box mb-4">
      <span>🔑</span>
      <span>Anda sedang dalam <strong>Mode Admin</strong>. Semua konten dapat diedit dan dihapus.</span>
      <button class="btn btn-danger btn-sm" style="margin-left:auto;" onclick="doLogout()">Logout</button>
    </div>
    <div class="tabs" id="admin-main-tabs" style="flex-wrap:wrap;">
      <button class="tab-btn active" onclick="switchAdminTab('pengurus', this)">👥 Pengurus</button>
      <button class="tab-btn" onclick="switchAdminTab('proker', this)">📋 Proker</button>
      <button class="tab-btn" onclick="switchAdminTab('lpj', this)">📄 LPJ</button>
      <button class="tab-btn" onclick="switchAdminTab('blog', this)">✍️ Blog</button>
      <button class="tab-btn" onclick="switchAdminTab('berita', this)">📰 Berita</button>
      <button class="tab-btn" onclick="switchAdminTab('users', this)">👤 Users</button>
      <button class="tab-btn" onclick="switchAdminTab('logo', this)">🖼️ Logo</button>
      <button class="tab-btn" onclick="switchAdminTab('settings', this)">⚙️ Pengaturan</button>
      <button class="tab-btn" onclick="switchAdminTab('export', this)">📥 Export</button>
    </div>
    <div id="admin-tab-body"></div>
    <div style="text-align:right;margin-top:32px;padding-top:16px;border-top:1px solid var(--border);">
      <span style="font-size:11px;color:var(--text-dim);opacity:0.6;">Project by <span style="color:var(--primary-light);font-weight:600;">Christian Tendean</span> · HIMAIF UNIMA 2025</span>
    </div>`;
  switchAdminTab('pengurus', document.querySelector('#admin-main-tabs .tab-btn'));
};
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
