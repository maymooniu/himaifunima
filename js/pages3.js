// =============================================================
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
        </tbody>
      </table>
    </div>`;
}

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
        </tbody>
      </table>
    </div>`;
}

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
}

async function exportAllPengurusCSV() {
  try {
    const data = await DB.getAllPengurus();
    exportToCSV(
      ['Nama','NIM','Divisi','Jabatan','Semester','Tanggal Lahir','Periode'],
      data.map(m => [m.nama, m.nim, m.divisi, m.jabatan, m.semester, m.tanggal_lahir, m.periode]),
      'semua-pengurus-himaif'
    );
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
  };
  openModal('change-pwd-modal');
}

async function deleteUser(id, username) {
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