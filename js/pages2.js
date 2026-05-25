// =============================================================
// HIMAIF — Page Renderers Part 2
// Proker, Achievement, Materi, Projects, Blog, Rapat, Aspirasi, Dashboard
// =============================================================

// ============================================================
// PROGRAM KERJA
// ============================================================
let _prokerCache = []; // module-level cache so filters work

async function renderProker() {
  setLoading('proker-stats', true);
  setLoading('proker-list', true);
  try {
    _prokerCache = await DB.getProker(STATE.activePeriode);
    renderProkerStats(_prokerCache);
    renderProkerList(_prokerCache);
  } catch (e) {
    document.getElementById('proker-list').innerHTML = `<div class="warning-box">⚠️ Gagal memuat: ${e.message}</div>`;
  }
}

function renderProkerStats(data) {
  const total = data.length;
  const selesai = data.filter(p => p.status === 'selesai').length;
  const berjalan = data.filter(p => p.status === 'sedang_berjalan').length;
  const aktif = data.filter(p => p.status === 'aktif').length;
  const batal = data.filter(p => p.status === 'dibatalkan').length;
  const avgProgress = total ? Math.round(data.reduce((s, p) => s + p.progress, 0) / total) : 0;
  const totalAnggaran = data.reduce((s, p) => s + (p.anggaran || 0), 0);

  document.getElementById('proker-stats').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card blue"><div class="stat-icon">📋</div><div class="stat-value">${total}</div><div class="stat-label">Total Proker</div></div>
      <div class="stat-card amber"><div class="stat-icon">⚡</div><div class="stat-value">${berjalan}</div><div class="stat-label">Sedang Berjalan</div></div>
      <div class="stat-card green"><div class="stat-icon">✅</div><div class="stat-value">${selesai}</div><div class="stat-label">Selesai</div></div>
      <div class="stat-card purple"><div class="stat-icon">📊</div><div class="stat-value">${avgProgress}%</div><div class="stat-label">Rata-rata Progress</div></div>
      <div class="stat-card teal"><div class="stat-icon">💰</div><div class="stat-value" style="font-size:22px;">${formatCurrency(totalAnggaran)}</div><div class="stat-label">Total Anggaran</div></div>
      <div class="stat-card red"><div class="stat-icon">❌</div><div class="stat-value">${batal}</div><div class="stat-label">Dibatalkan</div></div>
    </div>`;
}

function renderProkerList(allData) {
  // Use cached data if called from filter dropdowns (allData may be stale)
  const baseData = (allData && allData.length > 0) ? allData : _prokerCache;
  allData = baseData;
  const filterStatus = document.getElementById('proker-filter-status')?.value || 'all';
  const filterDiv = document.getElementById('proker-filter-div')?.value || 'all';
  const q = document.getElementById('proker-search')?.value?.toLowerCase() || '';

  let data = allData;
  if (filterStatus !== 'all') data = data.filter(p => p.status === filterStatus);
  if (filterDiv !== 'all') data = data.filter(p => p.divisi === filterDiv);
  if (q) data = data.filter(p => p.nama.toLowerCase().includes(q) || p.divisi.toLowerCase().includes(q));

  const progColor = (s) => ({ aktif:'var(--primary-light)', sedang_berjalan:'var(--accent)', selesai:'var(--success)', dibatalkan:'var(--danger)' }[s] || 'var(--text-dim)');

  document.getElementById('proker-list').innerHTML = data.length
    ? data.map(p => `
        <div class="proker-card">
          <div class="proker-main">
            <div class="flex items-start justify-between gap-3 mb-2">
              <div>
                <span class="font-bold" style="font-size:15px;">${escapeHtml(p.nama)}</span>
                <div class="flex gap-2 mt-1 flex-wrap">
                  ${getStatusBadge(p.status)}
                  <span class="badge badge-blue">${p.divisi}</span>
                </div>
              </div>
              <div style="text-align:right;flex-shrink:0;">
                <div class="font-mono font-bold text-accent" style="font-size:22px;">${p.progress}%</div>
              </div>
            </div>
            <div class="text-sm text-muted mb-3" style="line-height:1.6;">${escapeHtml(p.deskripsi || '')}</div>
            <div class="flex gap-4 text-xs text-muted flex-wrap mb-2">
              <span>👤 ${escapeHtml(p.ketua || '—')}</span>
              <span>📅 Target: ${formatDate(p.target_tanggal)}</span>
              <span>💰 ${formatCurrency(p.anggaran)}</span>
            </div>
            <div class="proker-progress-bar-wrap">
              <div class="proker-progress-fill" style="width:${p.progress}%;background:${progColor(p.status)};"></div>
            </div>
          </div>
          ${isAdmin() ? `
            <div style="flex-shrink:0;display:flex;flex-direction:column;gap:6px;">
              <button class="btn btn-ghost btn-sm" onclick="openEditProkerModal('${p.id}')">✏️ Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deleteProker('${p.id}','${escapeHtml(p.nama)}')">🗑️</button>
            </div>` : ''}
        </div>`).join('')
    : emptyState('📋', 'Tidak ada proker', 'Belum ada program kerja untuk filter ini.',
        isAdmin() ? `<button class="btn btn-primary" onclick="openAddProkerModal()">+ Tambah Proker</button>` : '');
}

async function deleteProker(id, nama) {
  if (!confirm(`Hapus proker "${nama}"?`)) return;
  try {
    await DB.deleteProker(id);
    showToast('Proker dihapus.', 'success');
    await renderProker();
  } catch (e) { showToast('Gagal: ' + e.message, 'error'); }
}

// ============================================================
// PENCAPAIAN
// ============================================================
let _pencapaianData = [];

async function renderAchievement() {
  setLoading('ach-list', true);
  try {
    _pencapaianData = await DB.getPencapaian();
    buildAchFilters(_pencapaianData);
    renderAchList('Semua', 'Semua');
  } catch (e) {
    document.getElementById('ach-list').innerHTML = `<div class="warning-box">⚠️ ${e.message}</div>`;
  }
}

function buildAchFilters(data) {
  const kats = ['Semua', ...new Set(data.map(a => a.kategori).filter(Boolean))];
  const lvls = ['Semua', ...new Set(data.map(a => a.level).filter(Boolean))];
  document.getElementById('ach-filter-kat').innerHTML = kats.map((c, i) =>
    `<button class="filter-chip ${i === 0 ? 'active' : ''}" onclick="filterAch('${c}', 'kat', this)">${c}</button>`).join('');
  document.getElementById('ach-filter-lvl').innerHTML = lvls.map((c, i) =>
    `<button class="filter-chip ${i === 0 ? 'active' : ''}" onclick="filterAch('${c}', 'lvl', this)">${c}</button>`).join('');
}

let _achKat = 'Semua', _achLvl = 'Semua';
function filterAch(val, type, btn) {
  if (type === 'kat') {
    _achKat = val;
    document.querySelectorAll('#ach-filter-kat .filter-chip').forEach(b => b.classList.remove('active'));
  } else {
    _achLvl = val;
    document.querySelectorAll('#ach-filter-lvl .filter-chip').forEach(b => b.classList.remove('active'));
  }
  btn.classList.add('active');
  renderAchList(_achKat, _achLvl);
}

function renderAchList(kat, lvl) {
  let data = _pencapaianData;
  if (kat !== 'Semua') data = data.filter(a => a.kategori === kat);
  if (lvl !== 'Semua') data = data.filter(a => a.level === lvl);
  const q = document.getElementById('ach-search')?.value?.toLowerCase() || '';
  if (q) data = data.filter(a => a.nama.toLowerCase().includes(q) || a.prestasi.toLowerCase().includes(q));

  document.getElementById('ach-list').innerHTML = data.length
    ? `<div class="ach-grid">${data.map(a => `
        <div class="ach-card">
          <div class="ach-medal">${a.medal || '🏆'}</div>
          <div class="ach-prestasi">${escapeHtml(a.prestasi)}</div>
          <div class="ach-nama">👤 ${escapeHtml(a.nama)}</div>
          <div class="flex gap-2 mt-2 flex-wrap">
            <span class="badge badge-gray">${a.kategori || '—'}</span>
            ${getStatusBadge(a.level)}
          </div>
          <div class="ach-date">📅 ${formatDate(a.tanggal)}</div>
          ${isAdmin() ? `<button class="btn btn-danger btn-sm mt-3" onclick="deletePencapaian('${a.id}')">🗑️ Hapus</button>` : ''}
        </div>`).join('')}</div>`
    : emptyState('🏆', 'Tidak ada pencapaian', 'Belum ada pencapaian untuk filter ini.',
        isAdmin() ? `<button class="btn btn-primary" onclick="openModal('add-ach-modal')">+ Tambah Pencapaian</button>` : '');
}

async function deletePencapaian(id) {
  if (!confirm('Hapus pencapaian ini?')) return;
  try {
    await DB.deletePencapaian(id);
    showToast('Pencapaian dihapus.', 'success');
    _pencapaianData = _pencapaianData.filter(a => a.id !== id);
    renderAchList(_achKat, _achLvl);
  } catch (e) { showToast('Gagal: ' + e.message, 'error'); }
}

async function saveAchievement() {
  const nama = document.getElementById('ach-nama').value.trim();
  const prestasi = document.getElementById('ach-prestasi').value.trim();
  if (!nama || !prestasi) { showToast('Nama dan prestasi wajib diisi!', 'error'); return; }
  try {
    const rows = await DB.addPencapaian({
      nama, prestasi,
      kategori: document.getElementById('ach-kategori').value,
      level: document.getElementById('ach-level').value,
      tanggal: document.getElementById('ach-tanggal').value,
      medal: document.getElementById('ach-medal').value || '🏆',
    });
    closeModal('add-ach-modal');
    showToast('Pencapaian berhasil ditambahkan!', 'success');
    _pencapaianData.unshift(rows[0]);
    buildAchFilters(_pencapaianData);
    renderAchList(_achKat, _achLvl);
  } catch (e) { showToast('Gagal simpan: ' + e.message, 'error'); }
}

// ============================================================
// BANK MATERI
// ============================================================
let _materiData = [];

async function renderMateri() {
  setLoading('materi-list', true);
  try {
    _materiData = await DB.getMateri();
    buildMateriFilters(_materiData);
    renderMateriList('Semua');
  } catch (e) {
    document.getElementById('materi-list').innerHTML = `<div class="warning-box">⚠️ ${e.message}</div>`;
  }
}

function buildMateriFilters(data) {
  const cats = ['Semua', ...new Set(data.map(m => m.kategori).filter(Boolean))];
  document.getElementById('materi-filters').innerHTML = cats.map((c, i) =>
    `<button class="filter-chip ${i === 0 ? 'active' : ''}" onclick="filterMateri('${c}', this)">${c}</button>`).join('');
}

function filterMateri(cat, btn) {
  document.querySelectorAll('#materi-filters .filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMateriList(cat);
}

function renderMateriList(cat) {
  let data = cat === 'Semua' ? _materiData : _materiData.filter(m => m.kategori === cat);
  const q = document.getElementById('materi-search')?.value?.toLowerCase() || '';
  if (q) data = data.filter(m => m.judul.toLowerCase().includes(q) || (m.tags || []).some(t => t.toLowerCase().includes(q)));

  document.getElementById('materi-list').innerHTML = data.length
    ? `<div class="materi-grid">${data.map(m => `
        <div class="materi-card">
          <div class="materi-icon-wrap">${m.icon || '📄'}</div>
          <div class="materi-title">${escapeHtml(m.judul)}</div>
          <div class="materi-desc">${escapeHtml(m.deskripsi || '')}</div>
          <div class="materi-tags">${(m.tags || []).map(t => `<span class="badge badge-blue">${t}</span>`).join('')}</div>
          <div class="flex justify-between text-xs text-muted mt-2 mb-3">
            <span><span class="badge badge-gray">${m.kategori}</span></span>
            ${m.ukuran ? `<span>💾 ${m.ukuran}</span>` : ''}
          </div>
          <div class="flex gap-2">
            ${m.file_url
              ? `<a href="${m.file_url}" class="btn btn-primary btn-sm w-full" target="_blank" style="justify-content:center;">⬇️ Download</a>`
              : `<button class="btn btn-ghost btn-sm w-full" onclick="showToast('File belum tersedia','warning')">⬇️ Download</button>`}
            ${isAdmin() ? `<button class="btn btn-danger btn-sm btn-icon" onclick="deleteMateri('${m.id}')">🗑️</button>` : ''}
          </div>
        </div>`).join('')}</div>`
    : emptyState('📚', 'Tidak ada materi', 'Belum ada materi untuk kategori ini.',
        isAdmin() ? `<button class="btn btn-primary" onclick="openModal('add-materi-modal')">+ Upload Materi</button>` : '');
}

async function deleteMateri(id) {
  if (!confirm('Hapus materi ini?')) return;
  try {
    await DB.deleteMateri(id);
    showToast('Materi dihapus.', 'success');
    _materiData = _materiData.filter(m => m.id !== id);
    renderMateriList('Semua');
  } catch (e) { showToast('Gagal: ' + e.message, 'error'); }
}

async function saveMateri() {
  const judul = document.getElementById('materi-judul').value.trim();
  if (!judul) { showToast('Judul wajib diisi!', 'error'); return; }
  const tagsRaw = document.getElementById('materi-tags-input').value;
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  try {
    const rows = await DB.addMateri({
      judul, tags,
      kategori: document.getElementById('materi-kategori').value,
      deskripsi: document.getElementById('materi-desc').value,
      ukuran: document.getElementById('materi-ukuran').value,
      icon: document.getElementById('materi-icon').value || '📄',
      diupload_oleh: document.getElementById('materi-uploader').value,
    });
    closeModal('add-materi-modal');
    showToast('Materi berhasil ditambahkan!', 'success');
    _materiData.unshift(rows[0]);
    buildMateriFilters(_materiData);
    renderMateriList('Semua');
  } catch (e) { showToast('Gagal simpan: ' + e.message, 'error'); }
}

// ============================================================
// GALERI PROJECT
// ============================================================
let _projectData = [];

async function renderProjects() {
  setLoading('project-list', true);
  try {
    _projectData = await DB.getProjects();
    renderProjectList('Semua');
  } catch (e) {
    document.getElementById('project-list').innerHTML = `<div class="warning-box">⚠️ ${e.message}</div>`;
  }
}

function filterProject(cat, btn) {
  document.querySelectorAll('#project-filters .filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProjectList(cat);
}

function renderProjectList(cat) {
  let data = cat === 'Semua' ? _projectData : _projectData.filter(p => p.kategori === cat);
  const q = document.getElementById('project-search')?.value?.toLowerCase() || '';
  if (q) data = data.filter(p => p.nama.toLowerCase().includes(q) || p.pembuat.toLowerCase().includes(q));

  document.getElementById('project-list').innerHTML = data.length
    ? `<div class="project-grid">${data.map(p => `
        <div class="project-card">
          <div class="project-thumb">${p.icon || '💻'}</div>
          <div class="project-body">
            <div class="flex items-start justify-between gap-2 mb-1">
              <div class="project-title">${escapeHtml(p.nama)}</div>
              ${getStatusBadge(p.status)}
            </div>
            <div class="project-author">👤 ${escapeHtml(p.pembuat)} · Angkatan ${p.angkatan || '—'}</div>
            <div class="text-sm text-muted mb-3" style="line-height:1.6;">${escapeHtml(p.deskripsi || '')}</div>
            <div class="flex gap-1 flex-wrap mb-3">${(p.tags || []).map(t => `<span class="badge badge-purple">${t}</span>`).join('')}</div>
            <div class="flex gap-2">
              ${p.demo_url ? `<a href="${p.demo_url}" class="btn btn-ghost btn-sm" target="_blank">👁️ Demo</a>` : `<button class="btn btn-ghost btn-sm" onclick="showToast('Demo tidak tersedia','info')">👁️ Demo</button>`}
              ${p.repo_url ? `<a href="${p.repo_url}" class="btn btn-ghost btn-sm" target="_blank">💻 Repo</a>` : `<button class="btn btn-ghost btn-sm" onclick="showToast('Repo tidak tersedia','info')">💻 Repo</button>`}
              ${isAdmin() ? `<button class="btn btn-danger btn-sm btn-icon" onclick="deleteProject('${p.id}')">🗑️</button>` : ''}
            </div>
          </div>
        </div>`).join('')}</div>`
    : emptyState('💡', 'Tidak ada project', 'Belum ada project untuk filter ini.',
        `<button class="btn btn-primary" onclick="openModal('add-project-modal')">+ Submit Project</button>`);
}

async function deleteProject(id) {
  if (!confirm('Hapus project ini?')) return;
  try {
    await DB.deleteProject(id);
    showToast('Project dihapus.', 'success');
    _projectData = _projectData.filter(p => p.id !== id);
    renderProjectList('Semua');
  } catch (e) { showToast('Gagal: ' + e.message, 'error'); }
}

async function saveProject() {
  const nama = document.getElementById('proj-nama').value.trim();
  const pembuat = document.getElementById('proj-pembuat').value.trim();
  if (!nama || !pembuat) { showToast('Nama dan pembuat wajib diisi!', 'error'); return; }
  const tags = document.getElementById('proj-tags').value.split(',').map(t => t.trim()).filter(Boolean);
  try {
    const rows = await DB.addProject({
      nama, pembuat, tags,
      angkatan: parseInt(document.getElementById('proj-angkatan').value) || null,
      kategori: document.getElementById('proj-kategori').value,
      deskripsi: document.getElementById('proj-desc').value,
      demo_url: document.getElementById('proj-demo').value,
      repo_url: document.getElementById('proj-repo').value,
      icon: document.getElementById('proj-icon').value || '💻',
      status: 'selesai',
    });
    closeModal('add-project-modal');
    showToast('Project berhasil disubmit!', 'success');
    _projectData.unshift(rows[0]);
    renderProjectList('Semua');
  } catch (e) { showToast('Gagal simpan: ' + e.message, 'error'); }
}

// ============================================================
// TECH BLOG
// ============================================================
let _blogData = [];

async function renderBlog() {
  setLoading('blog-list', true);
  try {
    _blogData = await DB.getBlog(isAdmin());
    renderBlogList();
  } catch (e) {
    document.getElementById('blog-list').innerHTML = `<div class="warning-box">⚠️ ${e.message}</div>`;
  }
}

function renderBlogList() {
  let data = _blogData;
  const q = document.getElementById('blog-search')?.value?.toLowerCase() || '';
  const filterStatus = document.getElementById('blog-filter-status')?.value || 'all';
  if (q) data = data.filter(b => b.judul.toLowerCase().includes(q) || b.penulis.toLowerCase().includes(q));
  if (filterStatus !== 'all') data = data.filter(b => b.status === filterStatus);

  document.getElementById('blog-list').innerHTML = data.length
    ? `<div class="blog-grid">${data.map(b => `
        <div class="blog-card">
          <div class="blog-thumb">${b.emoji || '📝'}</div>
          <div class="blog-body">
            <div class="flex gap-2 mb-2 flex-wrap">
              ${isAdmin() ? getStatusBadge(b.status) : ''}
              ${(b.tags || []).slice(0, 2).map(t => `<span class="badge badge-gray">${t}</span>`).join('')}
            </div>
            <div class="blog-title">${escapeHtml(b.judul)}</div>
            <div class="blog-excerpt">${escapeHtml(b.excerpt || '')}</div>
            <div class="blog-meta">
              <span>✍️ ${escapeHtml(b.penulis)}</span>
              <span>📅 ${formatDateShort(b.published_at || b.created_at)}</span>
              ${b.status === 'published' ? `<span>👁️ ${b.views}</span>` : ''}
            </div>
            ${isAdmin() && b.status === 'pending' ? `
              <div class="flex gap-2 mt-3">
                <button class="btn btn-success btn-sm" onclick="approveBlog('${b.id}')">✅ Approve</button>
                <button class="btn btn-danger btn-sm" onclick="rejectBlog('${b.id}')">❌ Tolak</button>
              </div>` : ''}
            ${isAdmin() && (b.status === 'published' || b.status === 'ditolak') ? `
              <div class="flex gap-2 mt-3">
                <button class="btn btn-danger btn-sm" onclick="deleteBlog('${b.id}')">🗑️ Hapus</button>
              </div>` : ''}
          </div>
        </div>`).join('')}</div>`
    : emptyState('✍️', 'Tidak ada artikel', 'Belum ada artikel blog.',
        `<button class="btn btn-primary" onclick="openModal('submit-blog-modal')">✍️ Tulis Artikel</button>`);
}

async function approveBlog(id) {
  try {
    await DB.approveBlog(id);
    showToast('Artikel disetujui dan dipublikasikan!', 'success');
    await renderBlog();
  } catch (e) { showToast('Gagal: ' + e.message, 'error'); }
}
async function rejectBlog(id) {
  try {
    await DB.rejectBlog(id);
    showToast('Artikel ditolak.', 'warning');
    await renderBlog();
  } catch (e) { showToast('Gagal: ' + e.message, 'error'); }
}
async function deleteBlog(id) {
  if (!confirm('Hapus artikel ini?')) return;
  try {
    await DB.deleteBlog(id);
    showToast('Artikel dihapus.', 'success');
    _blogData = _blogData.filter(b => b.id !== id);
    renderBlogList();
  } catch (e) { showToast('Gagal: ' + e.message, 'error'); }
}

async function submitBlog() {
  const judul = document.getElementById('blog-judul').value.trim();
  const isi = document.getElementById('blog-isi').value.trim();
  const penulis = document.getElementById('blog-penulis').value.trim();
  if (!judul || !isi || !penulis) { showToast('Judul, isi, dan nama penulis wajib diisi!', 'error'); return; }
  const tags = document.getElementById('blog-tags').value.split(',').map(t => t.trim()).filter(Boolean);
  try {
    await DB.addBlog({
      judul, penulis, tags,
      isi,
      divisi: document.getElementById('blog-divisi').value,
      excerpt: isi.substring(0, 160) + (isi.length > 160 ? '...' : ''),
      emoji: document.getElementById('blog-emoji').value || '📝',
      status: 'pending',
    });
    closeModal('submit-blog-modal');
    showToast('Artikel terkirim! Menunggu review admin sebelum dipublikasikan.', 'success');
    // Reset form
    ['blog-judul','blog-isi','blog-penulis','blog-tags'].forEach(id => { const el = document.getElementById(id); if(el) el.value=''; });
  } catch (e) { showToast('Gagal kirim: ' + e.message, 'error'); }
}

// ============================================================
// CATATAN RAPAT
// ============================================================
let _rapatData = [];

async function renderRapat() {
  setLoading('rapat-list', true);
  try {
    _rapatData = await DB.getRapat();
    renderRapatStats(_rapatData);
    renderRapatList(_rapatData);
  } catch (e) {
    document.getElementById('rapat-list').innerHTML = `<div class="warning-box">⚠️ ${e.message}</div>`;
  }
}

function renderRapatStats(data) {
  const totalHadir = data.reduce((s,r) => s + (r.jumlah_hadir || 0), 0);
  const totalSpontan = data.reduce((s,r) => s + (r.total_spontan || 0), 0);
  const avgKehadiran = data.length ? Math.round(data.reduce((s,r) => s + (r.jumlah_hadir / Math.max(r.jumlah_total,1) * 100), 0) / data.length) : 0;
  document.getElementById('rapat-stats').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card blue"><div class="stat-icon">📝</div><div class="stat-value">${data.length}</div><div class="stat-label">Total Rapat</div></div>
      <div class="stat-card green"><div class="stat-icon">👥</div><div class="stat-value">${avgKehadiran}%</div><div class="stat-label">Rata-rata Kehadiran</div></div>
      <div class="stat-card amber"><div class="stat-icon">💰</div><div class="stat-value" style="font-size:20px;">${formatCurrency(totalSpontan)}</div><div class="stat-label">Total Spontan Terkumpul</div></div>
    </div>`;
}

function renderRapatList(allData) {
  const filterJenis = document.getElementById('rapat-filter-jenis')?.value || 'all';
  const q = document.getElementById('rapat-search')?.value?.toLowerCase() || '';
  let data = allData;
  if (filterJenis !== 'all') data = data.filter(r => r.jenis === filterJenis);
  if (q) data = data.filter(r => r.judul.toLowerCase().includes(q) || (r.tempat||'').toLowerCase().includes(q));

  document.getElementById('rapat-list').innerHTML = data.length
    ? data.map(r => {
        const pct = r.jumlah_total ? Math.round(r.jumlah_hadir / r.jumlah_total * 100) : 0;
        return `
          <div class="rapat-item" onclick="openRapatDetail('${r.id}')">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="rapat-title">${escapeHtml(r.judul)}</div>
                <div class="rapat-meta mt-1">
                  <span>📅 ${formatDateShort(r.tanggal)}</span>
                  <span>🕐 ${r.waktu_mulai || '—'}${r.waktu_selesai ? ' – ' + r.waktu_selesai : ''}</span>
                  <span>📍 ${escapeHtml(r.tempat || '—')}</span>
                  <span class="badge badge-blue">${r.jenis}</span>
                </div>
                ${r.agenda ? `<div class="text-sm text-muted mt-2 truncate">${escapeHtml(r.agenda)}</div>` : ''}
              </div>
              <div style="text-align:right;flex-shrink:0;">
                <div class="font-bold" style="font-size:18px;color:${pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--accent)' : 'var(--danger)'}">${r.jumlah_hadir}/${r.jumlah_total}</div>
                <div class="text-xs text-muted">kehadiran</div>
                ${r.total_spontan > 0 ? `<div class="text-xs text-accent mt-1">💰 ${formatCurrency(r.total_spontan)}</div>` : ''}
              </div>
            </div>
          </div>`;
      }).join('')
    : emptyState('📝', 'Tidak ada catatan rapat', 'Belum ada rapat yang dicatat.',
        isAdmin() ? `<button class="btn btn-primary" onclick="openModal('add-rapat-modal')">+ Tambah Rapat</button>` : '');
}

function openRapatDetail(id) {
  const r = _rapatData.find(x => x.id === id);
  if (!r) return;
  const pct = r.jumlah_total ? Math.round(r.jumlah_hadir / r.jumlah_total * 100) : 0;
  document.getElementById('rapat-modal-body').innerHTML = `
    <div class="stats-grid mb-4">
      <div class="stat-card green" style="padding:16px;"><div class="stat-value" style="font-size:26px;">${r.jumlah_hadir}/${r.jumlah_total}</div><div class="stat-label">Kehadiran (${pct}%)</div></div>
      <div class="stat-card amber" style="padding:16px;"><div class="stat-value" style="font-size:20px;">${formatCurrency(r.total_spontan)}</div><div class="stat-label">Total Spontan</div></div>
    </div>
    <div class="grid-2 mb-4" style="gap:10px;">
      <div><div class="form-label">Tanggal</div><div>📅 ${formatDate(r.tanggal)}</div></div>
      <div><div class="form-label">Waktu</div><div>🕐 ${r.waktu_mulai || '—'} – ${r.waktu_selesai || '—'}</div></div>
      <div><div class="form-label">Tempat</div><div>📍 ${escapeHtml(r.tempat || '—')}</div></div>
      <div><div class="form-label">Jenis Rapat</div><div><span class="badge badge-blue">${r.jenis}</span></div></div>
      <div><div class="form-label">Notulis</div><div>✍️ ${escapeHtml(r.notulis || '—')}</div></div>
      <div><div class="form-label">Pimpinan</div><div>👤 ${escapeHtml(r.pimpinan_rapat || '—')}</div></div>
    </div>
    ${r.agenda ? `<div class="form-label">Agenda</div><div class="card p-4 mb-3 text-sm text-muted">${escapeHtml(r.agenda)}</div>` : ''}
    ${r.notulen ? `<div class="form-label">Notulen / Isi Rapat</div><div class="card p-4 mb-3 text-sm text-muted" style="white-space:pre-wrap;line-height:1.8;">${escapeHtml(r.notulen)}</div>` : ''}
    ${r.kesimpulan ? `<div class="form-label">Kesimpulan</div><div class="card p-4 mb-3 text-sm text-muted">${escapeHtml(r.kesimpulan)}</div>` : ''}
    ${r.tindak_lanjut ? `<div class="form-label">Tindak Lanjut</div><div class="card p-4 mb-3 text-sm" style="color:var(--accent);">${escapeHtml(r.tindak_lanjut)}</div>` : ''}
    <div class="flex gap-2 mt-3 flex-wrap">
      <button class="btn btn-ghost btn-sm" onclick="exportRapatCSV()">📥 Export CSV</button>
      ${isAdmin() ? `<button class="btn btn-danger btn-sm" onclick="deleteRapat('${r.id}');closeModal('rapat-modal')">🗑️ Hapus</button>` : ''}
    </div>`;
  document.getElementById('rapat-modal-title').textContent = r.judul;
  openModal('rapat-modal');
}

async function saveRapat() {
  const judul = document.getElementById('rapat-judul').value.trim();
  const tanggal = document.getElementById('rapat-tanggal').value;
  if (!judul || !tanggal) { showToast('Judul dan tanggal wajib diisi!', 'error'); return; }
  try {
    const rows = await DB.addRapat({
      judul, tanggal,
      waktu_mulai: document.getElementById('rapat-waktu-mulai').value || null,
      waktu_selesai: document.getElementById('rapat-waktu-selesai').value || null,
      tempat: document.getElementById('rapat-tempat').value,
      jenis: document.getElementById('rapat-jenis').value,
      jumlah_hadir: parseInt(document.getElementById('rapat-hadir').value) || 0,
      jumlah_total: parseInt(document.getElementById('rapat-total').value) || 0,
      total_spontan: parseInt(document.getElementById('rapat-spontan').value) || 0,
      notulis: document.getElementById('rapat-notulis').value,
      pimpinan_rapat: document.getElementById('rapat-pimpinan').value,
      agenda: document.getElementById('rapat-agenda').value,
      notulen: document.getElementById('rapat-notulen').value,
      kesimpulan: document.getElementById('rapat-kesimpulan').value,
      tindak_lanjut: document.getElementById('rapat-tindak-lanjut').value,
    });
    closeModal('add-rapat-modal');
    showToast('Catatan rapat berhasil disimpan!', 'success');
    _rapatData.unshift(rows[0]);
    renderRapatStats(_rapatData);
    renderRapatList(_rapatData);
    // Reset form
    ['rapat-judul','rapat-tanggal','rapat-waktu-mulai','rapat-waktu-selesai','rapat-tempat','rapat-hadir','rapat-total','rapat-spontan','rapat-notulis','rapat-pimpinan','rapat-agenda','rapat-notulen','rapat-kesimpulan','rapat-tindak-lanjut'].forEach(id => { const el=document.getElementById(id); if(el)el.value=''; });
  } catch (e) { showToast('Gagal simpan: ' + e.message, 'error'); }
}

async function deleteRapat(id) {
  if (!confirm('Hapus catatan rapat ini?')) return;
  try {
    await DB.deleteRapat(id);
    showToast('Rapat dihapus.', 'success');
    _rapatData = _rapatData.filter(r => r.id !== id);
    renderRapatStats(_rapatData);
    renderRapatList(_rapatData);
  } catch (e) { showToast('Gagal: ' + e.message, 'error'); }
}

// ============================================================
// ASPIRASI
// ============================================================
let _aspirasiData = [];

async function renderAspirasi() {
  // Aspirasi list: only pengurus and admin can see submitted aspirations
  const aspListSection = document.getElementById('asp-list-section');
  if (aspListSection) {
    aspListSection.style.display = isPengurus() ? '' : 'none';
  }
  const aspFiltersWrap = document.getElementById('asp-filters-wrap');
  if (aspFiltersWrap) {
    aspFiltersWrap.style.display = isPengurus() ? '' : 'none';
  }
  const aspFilters = document.getElementById('asp-filters');
  if (aspFilters) {
    aspFilters.style.display = isPengurus() ? '' : 'none';
  }
  const aspListHeader = document.getElementById('asp-list-header');
  if (aspListHeader) {
    aspListHeader.style.display = isPengurus() ? '' : 'none';
  }

  if (!isPengurus()) {
    if (document.getElementById('asp-list')) {
      document.getElementById('asp-list').innerHTML = '';
    }
    return;
  }

  setLoading('asp-list', true);
  try {
    _aspirasiData = await DB.getAspirasi();
    buildAspFilters(_aspirasiData);
    renderAspList('Semua');
  } catch (e) {
    document.getElementById('asp-list').innerHTML = `<div class="warning-box">⚠️ ${e.message}</div>`;
  }
}

function buildAspFilters(data) {
  const cats = ['Semua', ...new Set(data.map(a => a.kategori).filter(Boolean))];
  document.getElementById('asp-filters').innerHTML = cats.map((c, i) =>
    `<button class="filter-chip ${i === 0 ? 'active' : ''}" onclick="filterAsp('${c}', this)">${c}</button>`).join('');
}

function filterAsp(cat, btn) {
  document.querySelectorAll('#asp-filters .filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAspList(cat);
}

function renderAspList(cat) {
  let data = cat === 'Semua' ? _aspirasiData : _aspirasiData.filter(a => a.kategori === cat);
  const filterStatus = document.getElementById('asp-filter-status')?.value || 'all';
  if (filterStatus !== 'all') data = data.filter(a => a.status === filterStatus);

  document.getElementById('asp-list').innerHTML = data.length
    ? data.map(a => `
        <div class="asp-card">
          <div class="flex gap-2 mb-2 flex-wrap">
            <span class="badge badge-gray">${a.kategori}</span>
            ${getStatusBadge(a.status)}
          </div>
          <div class="asp-text">${escapeHtml(a.pesan)}</div>
          ${a.catatan_admin && isAdmin() ? `<div class="info-box mb-2" style="font-size:12px;"><span>💬</span><span>Catatan Admin: ${escapeHtml(a.catatan_admin)}</span></div>` : ''}
          <div class="asp-meta">
            <span>🕐 ${formatDateShort(a.created_at)}</span>
            ${isAdmin() ? `
              <div class="flex gap-2 items-center flex-wrap">
                <select class="form-control" style="width:auto;padding:4px 10px;font-size:12px;" onchange="updateAspStatus('${a.id}',this.value)">
                  <option value="ditinjau" ${a.status==='ditinjau'?'selected':''}>Ditinjau</option>
                  <option value="diproses" ${a.status==='diproses'?'selected':''}>Diproses</option>
                  <option value="diterima" ${a.status==='diterima'?'selected':''}>Diterima</option>
                  <option value="ditolak" ${a.status==='ditolak'?'selected':''}>Ditolak</option>
                </select>
                <button class="btn btn-danger btn-sm" onclick="deleteAspirasi('${a.id}')">🗑️</button>
              </div>` : ''}
          </div>
        </div>`).join('')
    : emptyState('📢', 'Tidak ada aspirasi', 'Belum ada aspirasi masuk untuk filter ini.');
}

async function updateAspStatus(id, status) {
  try {
    await DB.updateAspirasiStatus(id, status, null);
    const item = _aspirasiData.find(a => a.id === id);
    if (item) item.status = status;
    showToast('Status aspirasi diperbarui.', 'success');
    renderAspList('Semua');
  } catch (e) { showToast('Gagal: ' + e.message, 'error'); }
}

async function submitAspirasi() {
  const pesan = document.getElementById('asp-pesan').value.trim();
  const kat = document.getElementById('asp-kategori').value;
  if (!pesan) { showToast('Pesan tidak boleh kosong!', 'error'); return; }
  if (pesan.length < 10) { showToast('Pesan terlalu pendek, minimal 10 karakter.', 'error'); return; }
  try {
    const rows = await DB.addAspirasi({ pesan, kategori: kat });
    document.getElementById('asp-pesan').value = '';
    showToast('Aspirasi berhasil dikirim! Identitas Anda terlindungi. 🔒', 'success');
    _aspirasiData.unshift(rows[0]);
    buildAspFilters(_aspirasiData);
    renderAspList('Semua');
  } catch (e) { showToast('Gagal kirim: ' + e.message, 'error'); }
}

async function deleteAspirasi(id) {
  if (!confirm('Hapus aspirasi ini?')) return;
  try {
    await DB.deleteAspirasi(id);
    showToast('Aspirasi dihapus.', 'success');
    _aspirasiData = _aspirasiData.filter(a => a.id !== id);
    renderAspList('Semua');
  } catch (e) { showToast('Gagal: ' + e.message, 'error'); }
}

// ============================================================
// DASHBOARD
// ============================================================
async function renderDashboard() {
  setLoading('dashboard-content', true, 'Mengumpulkan statistik...');
  try {
    const stats = await DB.getDashboardStats(STATE.activePeriode);
    const { pengurus, proker, pencapaian, projects, blog, rapat, aspirasi, materi } = stats;

    const prokerSelesai = proker.filter(p => p.status === 'selesai').length;
    const prokerBerjalan = proker.filter(p => p.status === 'sedang_berjalan').length;
    const aspDitinjau = aspirasi.filter(a => a.status === 'ditinjau').length;
    const totalViews = blog.reduce((s, b) => s + (b.views || 0), 0);
    const avgProgress = proker.length ? Math.round(proker.reduce((s, p) => s + p.progress, 0) / proker.length) : 0;
    const totalSpontan = rapat.reduce((s, r) => s + (r.total_spontan || 0), 0);

    document.getElementById('dashboard-content').innerHTML = `
      <!-- Main Stats -->
      <div class="stats-grid">
        <div class="stat-card blue"><div class="stat-icon">👥</div><div class="stat-value">${pengurus.length}</div><div class="stat-label">Pengurus Aktif</div><div class="stat-trend">Periode ${STATE.activePeriode}</div></div>
        <div class="stat-card amber"><div class="stat-icon">📋</div><div class="stat-value">${proker.length}</div><div class="stat-label">Total Proker</div><div class="stat-trend up">${prokerSelesai} selesai</div></div>
        <div class="stat-card green"><div class="stat-icon">🏆</div><div class="stat-value">${pencapaian.length}</div><div class="stat-label">Pencapaian</div></div>
        <div class="stat-card purple"><div class="stat-icon">💡</div><div class="stat-value">${projects.length}</div><div class="stat-label">Galeri Project</div></div>
        <div class="stat-card teal"><div class="stat-icon">✍️</div><div class="stat-value">${blog.length}</div><div class="stat-label">Artikel Blog</div><div class="stat-trend">👁️ ${totalViews} views</div></div>
        <div class="stat-card red"><div class="stat-icon">📢</div><div class="stat-value">${aspirasi.length}</div><div class="stat-label">Aspirasi</div><div class="stat-trend">${aspDitinjau} menunggu</div></div>
        <div class="stat-card blue"><div class="stat-icon">📝</div><div class="stat-value">${rapat.length}</div><div class="stat-label">Catatan Rapat</div><div class="stat-trend">💰 ${formatCurrency(totalSpontan)} spontan</div></div>
        <div class="stat-card amber"><div class="stat-icon">📚</div><div class="stat-value">${materi.length}</div><div class="stat-label">Bank Materi</div></div>
      </div>

      <div class="grid-2 mt-4">
        <!-- Proker breakdown -->
        <div class="card">
          <div class="card-header"><span class="card-header-title">📋 Status Program Kerja</span><span class="badge badge-amber">${avgProgress}% avg progress</span></div>
          <div class="card-body">
            ${[['aktif','Belum Dimulai','var(--primary-light)'],['sedang_berjalan','Sedang Berjalan','var(--accent)'],['selesai','Selesai','var(--success)'],['dibatalkan','Dibatalkan','var(--danger)']].map(([s,l,c]) => {
              const n = proker.filter(p => p.status === s).length;
              const pct = proker.length ? Math.round(n / proker.length * 100) : 0;
              return `<div class="mb-3">
                <div class="flex justify-between text-sm mb-1"><span>${l}</span><span class="font-bold">${n} <span class="text-muted">(${pct}%)</span></span></div>
                <div style="height:6px;background:var(--bg-3);border-radius:3px;overflow:hidden;">
                  <div style="height:100%;width:${pct}%;background:${c};border-radius:3px;transition:width 0.6s;"></div>
                </div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Aspirasi overview -->
        <div class="card">
          <div class="card-header"><span class="card-header-title">📢 Overview Aspirasi</span></div>
          <div class="card-body">
            ${[['ditinjau','Menunggu Tinjauan','var(--accent)'],['diproses','Sedang Diproses','var(--primary-light)'],['diterima','Diterima','var(--success)'],['ditolak','Ditolak','var(--danger)']].map(([s,l,c]) => {
              const n = aspirasi.filter(a => a.status === s).length;
              const pct = aspirasi.length ? Math.round(n / aspirasi.length * 100) : 0;
              return `<div class="flex items-center gap-3 mb-3">
                <div style="width:8px;height:8px;border-radius:50%;background:${c};flex-shrink:0;"></div>
                <div class="flex-1"><div class="text-sm font-bold">${l}</div></div>
                <div class="font-bold" style="color:${c};">${n}</div>
              </div>`;
            }).join('')}
            ${aspDitinjau > 0 ? `<div class="warning-box mt-3" style="font-size:12px;"><span>⚠️</span><span>${aspDitinjau} aspirasi menunggu tindakan admin.</span></div>` : ''}
          </div>
        </div>

        <!-- Rapat stats -->
        <div class="card">
          <div class="card-header"><span class="card-header-title">📝 Statistik Rapat</span></div>
          <div class="card-body">
            ${rapat.length > 0 ? `
              <div class="text-sm mb-3"><span class="text-muted">Total rapat tercatat:</span> <span class="font-bold">${rapat.length}</span></div>
              <div class="text-sm mb-3"><span class="text-muted">Total spontan terkumpul:</span> <span class="font-bold text-accent">${formatCurrency(totalSpontan)}</span></div>
              <div class="text-sm mb-3"><span class="text-muted">Rata-rata kehadiran:</span> <span class="font-bold text-success">${rapat.length ? Math.round(rapat.reduce((s,r) => s + (r.jumlah_hadir / Math.max(r.jumlah_total,1)*100), 0) / rapat.length) : 0}%</span></div>
            ` : '<div class="text-muted text-sm">Belum ada rapat tercatat.</div>'}
          </div>
        </div>

        <!-- Quick links -->
        <div class="card">
          <div class="card-header"><span class="card-header-title">🚀 Aksi Cepat Admin</span></div>
          <div class="card-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              <button class="btn btn-ghost btn-sm" onclick="navigate('pengurus')">👥 Kelola Pengurus</button>
              <button class="btn btn-ghost btn-sm" onclick="navigate('proker')">📋 Kelola Proker</button>
              <button class="btn btn-ghost btn-sm" onclick="navigate('blog')">✍️ Review Blog</button>
              <button class="btn btn-ghost btn-sm" onclick="navigate('aspirasi')">📢 Lihat Aspirasi</button>
              <button class="btn btn-ghost btn-sm" onclick="exportPengurusCSV('${STATE.activePeriode}')">📥 Export Pengurus</button>
              <button class="btn btn-ghost btn-sm" onclick="exportProkerCSV('${STATE.activePeriode}')">📥 Export Proker</button>
            </div>
          </div>
        </div>
      </div>`;
  } catch (e) {
    document.getElementById('dashboard-content').innerHTML = `<div class="warning-box">⚠️ Gagal memuat dashboard: ${e.message}</div>`;
  }
}