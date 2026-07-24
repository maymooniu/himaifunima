// =============================================================
// HIMAIF v2 — Pages 2: Proker, Achievement, Materi, Projects, Blog, Rapat, Aspirasi, Dashboard
// =============================================================

// ============================================================
// PROGRAM KERJA
// ============================================================
let _prokerCache = [];

async function renderProker() {
  setLoading('proker-stats', true);
  setLoading('proker-list', true);
  try {
    _prokerCache = await DB.getProker(STATE.activePeriode);
    renderProkerStats(_prokerCache);
    filterProker(); // applies current filter + renders
  } catch(e) {
    document.getElementById('proker-list').innerHTML = `<div class="info-box danger"><span>❌</span><span>Gagal memuat: ${escapeHtml(e.message)}</span></div>`;
  }
}

function renderProkerStats(data) {
  const total    = data.length;
  const selesai  = data.filter(p => p.status === 'selesai').length;
  const berjalan = data.filter(p => p.status === 'sedang_berjalan').length;
  const aktif    = data.filter(p => p.status === 'aktif').length;
  const batal    = data.filter(p => p.status === 'dibatalkan').length;
  const avg      = total ? Math.round(data.reduce((s,p) => s + (p.progress||0), 0) / total) : 0;
  const budget   = data.reduce((s,p) => s + (p.anggaran||0), 0);
  document.getElementById('proker-stats').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card blue">  <div class="stat-icon">📋</div><div class="stat-value">${total}</div>   <div class="stat-label">Total Proker</div></div>
      <div class="stat-card amber"> <div class="stat-icon">⚡</div><div class="stat-value">${berjalan}</div><div class="stat-label">Sedang Berjalan</div></div>
      <div class="stat-card green"> <div class="stat-icon">✅</div><div class="stat-value">${selesai}</div> <div class="stat-label">Selesai</div></div>
      <div class="stat-card orange"><div class="stat-icon">📊</div><div class="stat-value">${avg}%</div>   <div class="stat-label">Rata-rata Progress</div></div>
      <div class="stat-card teal">  <div class="stat-icon">💰</div><div class="stat-value" style="font-size:20px;">${formatCurrency(budget)}</div><div class="stat-label">Total Anggaran</div></div>
      <div class="stat-card red">   <div class="stat-icon">❌</div><div class="stat-value">${batal}</div>  <div class="stat-label">Dibatalkan</div></div>
    </div>`;
}

function filterProker() {
  const fs = document.getElementById('proker-filter-status')?.value || 'all';
  const fd = document.getElementById('proker-filter-divisi')?.value || 'all';
  const q  = (document.getElementById('proker-search')?.value || '').toLowerCase().trim();

  let data = [..._prokerCache];
  if (fs !== 'all') data = data.filter(p => p.status === fs);
  if (fd !== 'all') data = data.filter(p => p.divisi === fd);
  if (q)            data = data.filter(p =>
    (p.nama||'').toLowerCase().includes(q) ||
    (p.divisi||'').toLowerCase().includes(q) ||
    (p.ketua||'').toLowerCase().includes(q) ||
    (p.deskripsi||'').toLowerCase().includes(q)
  );

  const el = document.getElementById('proker-list');
  if (!el) return;

  const progColor = s => ({
    aktif:'var(--orange)', sedang_berjalan:'var(--blue-primary)',
    selesai:'var(--success)', dibatalkan:'var(--danger)',
  }[s] || 'var(--text-dim)');

  el.innerHTML = data.length
    ? data.map(p => `<div class="proker-card">
        <div class="proker-main">
          <div class="flex items-start justify-between gap-3 mb-2">
            <div>
              <div class="font-bold" style="font-size:15px;">${escapeHtml(p.nama)}</div>
              <div class="flex gap-2 mt-1 flex-wrap">
                ${getStatusBadge(p.status)}
                <span class="badge badge-blue">${escapeHtml(p.divisi)}</span>
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0;">
              <div class="font-mono font-bold text-orange" style="font-size:24px;">${p.progress}%</div>
            </div>
          </div>
          ${p.deskripsi ? `<div class="text-sm text-muted mb-3" style="line-height:1.65;">${escapeHtml(p.deskripsi)}</div>` : ''}
          <div class="flex gap-4 text-xs text-muted flex-wrap mb-2">
            <span>👤 ${escapeHtml(p.ketua || '—')}</span>
            <span>📅 Target: ${formatDate(p.target_tanggal)}</span>
            <span>💰 ${formatCurrency(p.anggaran)}</span>
          </div>
          <div class="proker-bar-wrap">
            <div class="proker-bar-fill" style="width:${p.progress}%;background:${progColor(p.status)};"></div>
          </div>
        </div>
        ${isAdmin() ? `
          <div style="flex-shrink:0;display:flex;flex-direction:column;gap:6px;">
            <button class="btn btn-ghost btn-sm" onclick="openEditProkerModal('${p.id}')">✏️ Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteProker('${p.id}','${escapeHtml(p.nama)}')">🗑️</button>
          </div>` : ''}
      </div>`).join('')
    : emptyState('📋', 'Tidak ada program kerja', 'Tidak ada proker yang cocok dengan filter yang dipilih.',
        isAdmin() ? `<button class="btn btn-primary" onclick="openAddProkerModal()">+ Tambah Proker</button>` : '');
}

async function deleteProker(id, nama) {
  if (!confirm(`Hapus proker "${nama}"?`)) return;
  try {
    await DB.deleteProker(id);
    _prokerCache = _prokerCache.filter(p => p.id !== id);
    renderProkerStats(_prokerCache);
    filterProker();
    showToast('Proker dihapus.', 'success');
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

// ============================================================
// PENCAPAIAN / ACHIEVEMENT
// ============================================================
let _achData = [];
let _achKat  = 'all';
let _achLvl  = 'all';

async function renderAchievement() {
  setLoading('ach-list', true);
  try {
    _achData = await DB.getPencapaian();
    const cats   = ['all', ...new Set(_achData.map(p => p.kategori).filter(Boolean))];
    const levels = ['all', 'Prodi', 'Regional', 'Nasional', 'Internasional'];
    document.getElementById('ach-filter-kat').innerHTML =
      cats.map(c => `<button class="filter-chip ${c === _achKat ? 'active' : ''}" onclick="_achKat='${c}';this.closest('.filter-bar').querySelectorAll('.filter-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active');renderAchList(_achKat,_achLvl)">${c === 'all' ? '🏆 Semua' : escapeHtml(c)}</button>`).join('');
    document.getElementById('ach-filter-lvl').innerHTML =
      levels.map(l => `<button class="filter-chip ${l === _achLvl ? 'active' : ''}" onclick="_achLvl='${l}';this.closest('.filter-bar').querySelectorAll('.filter-chip').forEach(b=>b.classList.remove('active'));this.classList.add('active');renderAchList(_achKat,_achLvl)">${l === 'all' ? 'Semua Level' : l}</button>`).join('');
    renderAchList(_achKat, _achLvl);
  } catch(e) {
    document.getElementById('ach-list').innerHTML = `<div class="info-box danger"><span>❌</span><span>${e.message}</span></div>`;
  }
}

function renderAchList(kat, lvl) {
  const q = (document.getElementById('ach-search')?.value || '').toLowerCase().trim();
  let data = [..._achData];
  if (kat !== 'all') data = data.filter(p => p.kategori === kat);
  if (lvl !== 'all') data = data.filter(p => p.level === lvl);
  if (q)             data = data.filter(p =>
    (p.nama||'').toLowerCase().includes(q) ||
    (p.prestasi||'').toLowerCase().includes(q)
  );
  const el = document.getElementById('ach-list');
  if (!el) return;
  el.innerHTML = data.length
    ? `<div class="ach-grid">
        ${data.map(p => `<div class="ach-card">
          <div class="ach-medal">${p.medal || '🏆'}</div>
          <div class="ach-prestasi">${escapeHtml(p.prestasi)}</div>
          <div class="ach-nama">👤 ${escapeHtml(p.nama)}</div>
          <div class="flex gap-1 flex-wrap" style="margin:8px 0;">
            ${getLevelBadge(p.level)}
            ${p.kategori ? `<span class="badge badge-gray">${escapeHtml(p.kategori)}</span>` : ''}
          </div>
          <div class="ach-date">📅 ${formatDate(p.tanggal)}</div>
          ${isAdmin() ? `<div style="margin-top:10px;display:flex;gap:6px;">
            <button class="btn btn-ghost btn-icon btn-sm" onclick="openEditAchModal('${p.id}')">✏️</button>
            <button class="btn btn-danger btn-icon btn-sm" onclick="deleteAch('${p.id}','${escapeHtml(p.prestasi)}')">🗑️</button>
          </div>` : ''}
        </div>`).join('')}
      </div>`
    : emptyState('🏆', 'Tidak ada prestasi', 'Belum ada prestasi untuk kategori ini.',
        isAdmin() ? `<button class="btn btn-primary" onclick="openModal('add-ach-modal')">+ Tambah Prestasi</button>` : '');
}

async function deleteAch(id, nama) {
  if (!confirm(`Hapus prestasi "${nama}"?`)) return;
  try {
    await DB.deletePencapaian(id);
    showToast('Prestasi dihapus.', 'success');
    _achData = _achData.filter(p => p.id !== id);
    renderAchList(_achKat, _achLvl);
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

// ============================================================
// ============================================================
// GALERI PROJECT
// ============================================================
let _projectData = [];
let _activeProjectKat = 'Semua';

async function renderProjects() {
  setLoading('project-list', true);
  try {
    _projectData = await DB.getProjects(isAdmin());
    filterProject(_activeProjectKat, null);
  } catch(e) {
    document.getElementById('project-list').innerHTML = `<div class="info-box danger"><span>❌</span><span>${e.message}</span></div>`;
  }
}

function filterProject(kat, btn) {
  if (btn) {
    _activeProjectKat = kat;
    btn?.closest('.filter-bar')?.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
    btn?.classList.add('active');
  }
  const q = (document.getElementById('project-search')?.value || '').toLowerCase().trim();
  let data = [..._projectData];
  if (_activeProjectKat !== 'Semua') data = data.filter(p => p.kategori === _activeProjectKat);
  if (q) data = data.filter(p =>
    (p.nama||'').toLowerCase().includes(q) ||
    (p.pembuat||'').toLowerCase().includes(q) ||
    (p.tags||'').toLowerCase().includes(q)
  );
  const el = document.getElementById('project-list');
  if (!el) return;
  el.innerHTML = data.length
    ? `<div class="proj-grid">
        ${data.map(p => `<div class="proj-card">
          <div class="flex justify-between items-start gap-2">
            <div class="proj-icon">${p.icon || '💻'}</div>
            <div class="flex gap-1 flex-wrap">${getStatusBadge(p.status)}<span class="badge badge-gray">${escapeHtml(p.kategori)}</span></div>
          </div>
          <div class="proj-name">${escapeHtml(p.nama)}</div>
          <div class="text-xs text-muted">👤 ${escapeHtml(p.pembuat)}${p.angkatan ? ` · Angk. ${p.angkatan}` : ''}</div>
          <div class="proj-desc">${escapeHtml(p.deskripsi || '')}</div>
          ${p.tags ? `<div class="proj-tags">${String(p.tags).split(',').map(t=>`<span class="proj-tag">${escapeHtml(t.trim())}</span>`).join('')}</div>` : ''}
          <div class="proj-actions">
            ${p.demo_url ? `<a href="${p.demo_url}" class="btn btn-secondary btn-sm" target="_blank">🚀 Demo</a>` : ''}
            ${p.repo_url ? `<a href="${p.repo_url}" class="btn btn-ghost btn-sm" target="_blank">🐙 GitHub</a>` : ''}
            ${isAdmin() && p.status === 'pending' ? `<button class="btn btn-success btn-sm ml-auto" onclick="approveProject('${p.id}')">✅</button>` : ''}
            ${isAdmin() ? `<button class="btn btn-danger btn-icon btn-sm ml-auto" onclick="deleteProject('${p.id}')">🗑️</button>` : ''}
          </div>
        </div>`).join('')}
      </div>`
    : emptyState('💡', 'Tidak ada project', isAdmin() ? 'Belum ada project yang disubmit.' : 'Belum ada project yang diapprove.',
        `<button class="btn btn-primary" onclick="openModal('add-project-modal')">+ Submit Project</button>`);
}

async function approveProject(id) {
  try { await DB.approveProject(id); showToast('Project diapprove!', 'success'); await renderProjects(); }
  catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}
async function deleteProject(id) {
  if (!confirm('Hapus project ini?')) return;
  try { await DB.deleteProject(id); showToast('Project dihapus.', 'success'); await renderProjects(); }
  catch(e) { showToast('Gagal: ' + e.message, 'error'); }
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
  } catch(e) {
    document.getElementById('blog-list').innerHTML = `<div class="info-box danger"><span>❌</span><span>${e.message}</span></div>`;
  }
}

function renderBlogList() {
  const statusF = document.getElementById('blog-filter-status')?.value || 'published';
  const q = (document.getElementById('blog-search')?.value || '').toLowerCase().trim();
  let data = [..._blogData];
  if (statusF !== 'all') data = data.filter(b => b.status === statusF);
  if (q) data = data.filter(b =>
    (b.judul||'').toLowerCase().includes(q) ||
    (b.penulis||'').toLowerCase().includes(q) ||
    (b.tags||'').toLowerCase().includes(q)
  );
  const el = document.getElementById('blog-list');
  if (!el) return;
  el.innerHTML = data.length
    ? data.map(b => `<div class="blog-card" onclick="openBlogDetail('${b.id}')">
        <div class="blog-emoji">${b.emoji || '📝'}</div>
        <div style="flex:1;min-width:0;">
          <div class="blog-title">${escapeHtml(b.judul)}</div>
          <div class="blog-author">✍️ ${escapeHtml(b.penulis)} · 📁 ${escapeHtml(b.divisi || 'Umum')} · ${timeAgo(b.published_at)}</div>
          <div class="flex gap-2 mb-2 flex-wrap">
            ${getStatusBadge(b.status)}
            ${b.tags ? String(b.tags).split(',').slice(0,3).map(t=>`<span class="badge badge-gray">${escapeHtml(t.trim())}</span>`).join('') : ''}
          </div>
          <div class="flex gap-2 items-center">
            <span class="text-xs text-muted">👁️ ${b.views || 0} views</span>
            ${isAdmin() ? `
              <div class="flex gap-1 ml-auto" onclick="event.stopPropagation()">
                ${b.status === 'pending' ? `<button class="btn btn-success btn-sm" onclick="approveBlog('${b.id}')">✅ Publish</button>` : ''}
                ${b.status === 'pending' ? `<button class="btn btn-danger btn-sm" onclick="rejectBlog('${b.id}')">❌ Tolak</button>` : ''}
                <button class="btn btn-danger btn-icon btn-sm" onclick="deleteBlog('${b.id}')">🗑️</button>
              </div>` : ''}
          </div>
        </div>
      </div>`).join('')
    : emptyState('✍️', 'Tidak ada artikel', 'Belum ada artikel yang published.',
        `<button class="btn btn-primary" onclick="openModal('submit-blog-modal')">✍️ Tulis Artikel</button>`);
}

function openBlogDetail(id) {
  const b = _blogData.find(x => x.id === id);
  if (!b) return;
  document.getElementById('blog-detail-title').textContent = `${b.emoji || '📝'} ${b.judul}`;
  document.getElementById('blog-detail-body').innerHTML = `
    <div class="flex gap-2 mb-4 flex-wrap">
      <span class="badge badge-orange">${escapeHtml(b.divisi || 'Umum')}</span>
      <span class="badge badge-gray">✍️ ${escapeHtml(b.penulis)}</span>
      <span class="badge badge-gray">${timeAgo(b.published_at)}</span>
      <span class="badge badge-gray">👁️ ${b.views || 0} views</span>
      ${b.tags ? String(b.tags).split(',').map(t => `<span class="badge badge-gray">${escapeHtml(t.trim())}</span>`).join('') : ''}
    </div>
    <div style="line-height:1.9;font-size:14px;white-space:pre-wrap;color:var(--text-sec);">${escapeHtml(b.isi || '')}</div>`;
  openModal('blog-detail-modal');
  try { DB.incrementViews(b.id, b.views || 0); b.views = (b.views || 0) + 1; } catch(_) {}
}

async function approveBlog(id) {
  try { await DB.approveBlog(id); showToast('Artikel dipublish!', 'success'); await renderBlog(); }
  catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}
async function rejectBlog(id) {
  try { await DB.rejectBlog(id); showToast('Artikel ditolak.', 'info'); await renderBlog(); }
  catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}
async function deleteBlog(id) {
  if (!confirm('Hapus artikel ini?')) return;
  try { await DB.deleteBlog(id); showToast('Artikel dihapus.', 'success'); await renderBlog(); }
  catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

// ============================================================
// CATATAN RAPAT
// ============================================================
let _rapatData = [];

async function renderRapat() {
  setLoading('rapat-stats', true);
  setLoading('rapat-list', true);
  try {
    _rapatData = await DB.getRapat();
    renderRapatStats(_rapatData);
    filterRapat();
  } catch(e) {
    document.getElementById('rapat-list').innerHTML = `<div class="info-box danger"><span>❌</span><span>${e.message}</span></div>`;
  }
}

function renderRapatStats(data) {
  const total    = data.length;
  const hadirSum = data.reduce((s,r) => s + (r.jumlah_hadir||0), 0);
  const totalSum = data.reduce((s,r) => s + (r.jumlah_total||0), 0);
  const avgHadir = total ? Math.round((hadirSum / totalSum) * 100) : 0;
  const spontan  = data.reduce((s,r) => s + (r.total_spontan||0), 0);
  document.getElementById('rapat-stats').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card blue">  <div class="stat-icon">📝</div><div class="stat-value">${total}</div>      <div class="stat-label">Total Rapat</div></div>
      <div class="stat-card orange"><div class="stat-icon">👥</div><div class="stat-value">${hadirSum}</div>    <div class="stat-label">Total Kehadiran</div></div>
      <div class="stat-card green"> <div class="stat-icon">📊</div><div class="stat-value">${avgHadir}%</div>  <div class="stat-label">Rata-rata Hadir</div></div>
      <div class="stat-card amber"> <div class="stat-icon">💰</div><div class="stat-value" style="font-size:18px;">${formatCurrency(spontan)}</div><div class="stat-label">Total Spontan</div></div>
    </div>`;
}

function filterRapat() {
  const jenis = document.getElementById('rapat-filter-jenis')?.value || 'all';
  const q = (document.getElementById('rapat-search')?.value || '').toLowerCase().trim();
  let data = [..._rapatData];
  if (jenis !== 'all') data = data.filter(r => r.jenis === jenis);
  if (q) data = data.filter(r =>
    (r.judul||'').toLowerCase().includes(q) ||
    (r.tempat||'').toLowerCase().includes(q)
  );
  const el = document.getElementById('rapat-list');
  if (!el) return;
  el.innerHTML = data.length
    ? data.map(r => {
        const { day, mon } = formatDateCompact(r.tanggal);
        const pct = r.jumlah_total ? Math.round((r.jumlah_hadir / r.jumlah_total)*100) : 0;
        return `<div class="rapat-card" onclick="openRapatDetail('${r.id}')">
          <div class="rapat-date-box">
            <div class="rapat-day">${day}</div>
            <div class="rapat-mon">${mon}</div>
          </div>
          <div class="rapat-info">
            <div class="rapat-title">${escapeHtml(r.judul)}</div>
            <div class="rapat-meta flex-wrap gap-2">
              <span>📍 ${escapeHtml(r.tempat || '—')}</span>
              <span>⏰ ${r.waktu_mulai || '—'} – ${r.waktu_selesai || '—'}</span>
              <span class="badge badge-gray">${escapeHtml(r.jenis)}</span>
              <span>👥 ${r.jumlah_hadir}/${r.jumlah_total} (${pct}%)</span>
            </div>
          </div>
          <div style="flex-shrink:0;display:flex;flex-direction:column;align-items:flex-end;gap:6px;">
            <div style="font-size:24px;font-weight:900;font-family:var(--font-display);color:${pct>=75?'var(--success)':pct>=50?'var(--warning)':'var(--danger)'};">">${pct}%</div>
            ${isAdmin() ? `<div class="flex gap-1" onclick="event.stopPropagation()">
              <button class="btn btn-ghost btn-icon btn-sm" onclick="openEditRapatModal('${r.id}')">✏️</button>
              <button class="btn btn-danger btn-icon btn-sm" onclick="deleteRapat('${r.id}')">🗑️</button>
            </div>` : ''}
          </div>
        </div>`;
      }).join('')
    : emptyState('📝', 'Tidak ada catatan rapat', 'Belum ada rapat yang dicatat.',
        isAdmin() ? `<button class="btn btn-primary" onclick="openModal('add-rapat-modal')">+ Catat Rapat</button>` : '');
}

function openRapatDetail(id) {
  const r = _rapatData.find(x => x.id === id);
  if (!r) return;
  const pct = r.jumlah_total ? Math.round((r.jumlah_hadir / r.jumlah_total)*100) : 0;
  document.getElementById('rapat-detail-title').textContent = `📝 ${r.judul}`;
  document.getElementById('rapat-detail-body').innerHTML = `
    <div class="flex gap-2 mb-4 flex-wrap">
      <span class="badge badge-orange">${escapeHtml(r.jenis)}</span>
      <span class="badge badge-blue">📅 ${formatDate(r.tanggal)}</span>
      ${r.tempat ? `<span class="badge badge-gray">📍 ${escapeHtml(r.tempat)}</span>` : ''}
      ${r.waktu_mulai ? `<span class="badge badge-gray">⏰ ${r.waktu_mulai}${r.waktu_selesai ? ' – ' + r.waktu_selesai : ''}</span>` : ''}
    </div>
    <div class="grid-2 mb-4" style="gap:10px;">
      <div class="card p-4"><div class="text-xs text-muted mb-1">Pimpinan Rapat</div><div class="font-bold">${escapeHtml(r.pimpinan_rapat || '—')}</div></div>
      <div class="card p-4"><div class="text-xs text-muted mb-1">Notulis</div><div class="font-bold">${escapeHtml(r.notulis || '—')}</div></div>
      <div class="card p-4"><div class="text-xs text-muted mb-1">Kehadiran</div>
        <div class="font-bold">${r.jumlah_hadir}/${r.jumlah_total} anggota (${pct}%)</div>
        <div class="progress-bar-wrap mt-2"><div class="progress-bar" style="width:${pct}%;background:${pct>=75?'var(--success)':pct>=50?'var(--orange)':'var(--danger)'}"></div></div>
      </div>
      <div class="card p-4"><div class="text-xs text-muted mb-1">Total Spontan</div><div class="font-bold text-orange">${formatCurrency(r.total_spontan)}</div></div>
    </div>
    ${r.agenda ? `<div class="mb-3"><div class="font-bold mb-2">📋 Agenda</div><div class="card p-4 text-sm text-muted" style="white-space:pre-wrap;line-height:1.75;">${escapeHtml(r.agenda)}</div></div>` : ''}
    ${r.notulen ? `<div class="mb-3"><div class="font-bold mb-2">📝 Notulen Rapat</div><div class="card p-4 text-sm text-muted" style="white-space:pre-wrap;line-height:1.75;">${escapeHtml(r.notulen)}</div></div>` : ''}
    ${r.kesimpulan ? `<div class="mb-3"><div class="font-bold mb-2">✅ Kesimpulan</div><div class="card p-4 text-sm text-muted" style="white-space:pre-wrap;line-height:1.75;">${escapeHtml(r.kesimpulan)}</div></div>` : ''}
    ${r.tindak_lanjut ? `<div><div class="font-bold mb-2">➡️ Tindak Lanjut</div><div class="card p-4 text-sm text-muted" style="white-space:pre-wrap;line-height:1.75;">${escapeHtml(r.tindak_lanjut)}</div></div>` : ''}`;
  openModal('rapat-detail-modal');
}

async function deleteRapat(id) {
  if (!confirm('Hapus catatan rapat ini?')) return;
  try {
    await DB.deleteRapat(id);
    showToast('Rapat dihapus.', 'success');
    _rapatData = _rapatData.filter(r => r.id !== id);
    renderRapatStats(_rapatData);
    filterRapat();
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

// ============================================================
// ASPIRASI
// ============================================================
let _aspData = [];

async function renderAspirasi() {
  applyAdminUI();
  if (isPengurus()) {
    const aspInbox = document.getElementById('asp-inbox-section');
    if (aspInbox) aspInbox.style.display = '';
    await loadAspirasi();
  }
}

async function loadAspirasi() {
  setLoading('asp-list', true);
  try {
    _aspData = await DB.getAspirasi();
    filterAsp();
  } catch(e) {
    document.getElementById('asp-list').innerHTML = `<div class="info-box danger"><span>❌</span><span>${e.message}</span></div>`;
  }
}

function renderSingleMediaItemHtml(url) {
  if (!url || !url.trim()) return '';
  const u = url.trim();
  const lowerUrl = u.toLowerCase();

  if (lowerUrl.startsWith('data:image/') || lowerUrl.match(/\.(jpg|jpeg|png|webp|gif|svg)($|\?)/)) {
    return `<img src="${escapeHtml(u)}" alt="Lampiran Foto" style="max-width:100%;max-height:300px;border-radius:8px;border:1px solid var(--border);cursor:pointer;object-fit:contain;" onclick="openPhotoLightboxDirect('${escapeHtml(u)}', '📷 Lampiran Foto Aspirasi')">`;
  } else if (lowerUrl.startsWith('data:video/') || lowerUrl.match(/\.(mp4|webm|ogg)($|\?)/)) {
    return `<video src="${escapeHtml(u)}" controls preload="metadata" style="max-width:100%;max-height:240px;border-radius:8px;border:1px solid var(--border);"></video>`;
  } else {
    return `<a href="${escapeHtml(u)}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">📎 Buka Lampiran / Media Link</a>`;
  }
}

function renderAspirasiMediaHtml(mediaUrl) {
  if (!mediaUrl || !mediaUrl.trim()) return '';
  const raw = mediaUrl.trim();

  if (raw.startsWith('[')) {
    try {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length) {
        return `<div class="mt-2 mb-2 flex flex-col gap-2">
          ${list.map(item => {
            const u = typeof item === 'object' ? item.url : item;
            return renderSingleMediaItemHtml(u);
          }).join('')}
        </div>`;
      }
    } catch(e) {}
  }

  return `<div class="mt-2 mb-2">${renderSingleMediaItemHtml(raw)}</div>`;
}

function filterAsp() {
  const statusF = document.getElementById('asp-filter-status')?.value || 'all';
  const katF    = document.getElementById('asp-filter-kat')?.value || 'all';
  let data = [..._aspData];
  if (statusF !== 'all') data = data.filter(a => a.status === statusF);
  if (katF !== 'all')    data = data.filter(a => a.kategori === katF);
  const el = document.getElementById('asp-list');
  if (!el) return;
  el.innerHTML = data.length
    ? data.map(a => `<div class="asp-card">
        <div class="flex justify-between items-start gap-3">
          <div class="flex gap-2 flex-wrap items-center">
            <span class="badge badge-blue">${escapeHtml(a.kategori)}</span>
            ${a.urgensi === 'tinggi' ? '<span class="badge badge-red">🔴 Urgen</span>' : a.urgensi === 'rendah' ? '<span class="badge badge-gray">🟢 Rendah</span>' : ''}
            ${getStatusBadge(a.status)}
          </div>
          <div class="text-xs text-muted flex-shrink-0">${timeAgo(a.created_at)}</div>
        </div>
        <div class="asp-message">${escapeHtml(a.pesan)}</div>
        ${renderAspirasiMediaHtml(a.media_url)}
        ${a.catatan_admin ? `<div class="info-box mb-2" style="font-size:12px;"><span>💬</span><span><strong>Catatan Admin:</strong> ${escapeHtml(a.catatan_admin)}</span></div>` : ''}
        ${isAdmin() ? `<div class="flex gap-2 flex-wrap mt-2" onclick="event.stopPropagation()">
          <select class="form-control" style="width:auto;padding:4px 8px;font-size:12px;" id="asp-status-${a.id}" onchange="updateAspStatus('${a.id}',this.value)">
            <option value="ditinjau" ${a.status==='ditinjau'?'selected':''}>🔍 Ditinjau</option>
            <option value="diproses" ${a.status==='diproses'?'selected':''}>⚙️ Diproses</option>
            <option value="diterima" ${a.status==='diterima'?'selected':''}>✅ Diterima</option>
            <option value="ditolak"  ${a.status==='ditolak'?'selected':''}>❌ Ditolak</option>
          </select>
          <button class="btn btn-danger btn-sm" onclick="deleteAsp('${a.id}')">🗑️ Hapus</button>
        </div>` : ''}
      </div>`).join('')
    : emptyState('📢', 'Tidak ada aspirasi', 'Belum ada aspirasi masuk.');
}

async function submitAspirasi() {
  const kategori  = document.getElementById('asp-kategori')?.value || 'Umum';
  const urgensi   = document.getElementById('asp-urgensi')?.value || 'sedang';
  const pesan     = (document.getElementById('asp-pesan')?.value || '').trim();

  const mode = document.querySelector('input[name="asp-attach-mode"]:checked')?.value || 'file';
  let media_url = '';

  if (mode === 'file') {
    media_url = (document.getElementById('asp-media-url')?.value || '').trim();
  } else {
    media_url = (document.getElementById('asp-link-input')?.value || '').trim();
  }

  if (pesan.length < 10) { showToast('Pesan minimal 10 karakter!', 'error'); return; }

  try {
    await DB.addAspirasi({ kategori, urgensi, pesan, media_url });
    document.getElementById('asp-pesan').value = '';
    const linkIn = document.getElementById('asp-link-input');
    if (linkIn) linkIn.value = '';
    if (typeof clearAspirasiMedia === 'function') clearAspirasiMedia();
    showToast('Aspirasi berhasil dikirim! Terima kasih. 🙏', 'success');
  } catch(e) { showToast('Gagal kirim: ' + e.message, 'error'); }
}

async function updateAspStatus(id, status) {
  try {
    await DB.updateAspStatus(id, status, null);
    showToast('Status diperbarui!', 'success');
    const item = _aspData.find(a => a.id === id);
    if (item) item.status = status;
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

async function deleteAsp(id) {
  if (!confirm('Hapus aspirasi ini?')) return;
  try {
    await DB.deleteAspirasi(id);
    showToast('Aspirasi dihapus.', 'success');
    _aspData = _aspData.filter(a => a.id !== id);
    filterAsp();
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

// ============================================================
// DASHBOARD
// ============================================================
async function renderDashboard() {
  setLoading('dashboard-content', true, 'Mengumpulkan statistik...');
  try {
    const d = await DB.getDashboardStats(STATE.activePeriode);
    const { pengurus, proker, pencapaian, projects, blog, rapat, aspirasi, berita } = d;

    const selesai  = proker.filter(p => p.status === 'selesai').length;
    const berjalan = proker.filter(p => p.status === 'sedang_berjalan').length;
    const avgProg  = proker.length ? Math.round(proker.reduce((s,p)=>s+(p.progress||0),0)/proker.length) : 0;
    const hadirSum = rapat.reduce((s,r)=>s+(r.jumlah_hadir||0),0);
    const totalSum = rapat.reduce((s,r)=>s+(r.jumlah_total||0),0);
    const avgHadir = totalSum ? Math.round((hadirSum/totalSum)*100) : 0;
    const aspPend  = aspirasi.filter(a => a.status === 'ditinjau').length;
    const totalViews = blog.reduce((s,b)=>s+(b.views||0),0);

    document.getElementById('dashboard-content').innerHTML = `
      <div class="stats-grid mb-6">
        <div class="stat-card orange"><div class="stat-icon">👥</div><div class="stat-value">${pengurus.length}</div><div class="stat-label">Pengurus Aktif</div></div>
        <div class="stat-card blue">  <div class="stat-icon">📋</div><div class="stat-value">${proker.length}</div><div class="stat-label">Total Proker</div></div>
        <div class="stat-card green"> <div class="stat-icon">✅</div><div class="stat-value">${selesai}</div><div class="stat-label">Proker Selesai</div></div>
        <div class="stat-card amber"> <div class="stat-icon">⚡</div><div class="stat-value">${berjalan}</div><div class="stat-label">Proker Berjalan</div></div>
        <div class="stat-card teal">  <div class="stat-icon">🏆</div><div class="stat-value">${pencapaian.length}</div><div class="stat-label">Total Prestasi</div></div>
        <div class="stat-card purple"><div class="stat-icon">💡</div><div class="stat-value">${projects.length}</div><div class="stat-label">Galeri Project</div></div>
        <div class="stat-card blue">  <div class="stat-icon">✍️</div><div class="stat-value">${blog.length}</div><div class="stat-label">Artikel Blog</div></div>
        <div class="stat-card orange"><div class="stat-icon">👁️</div><div class="stat-value">${totalViews}</div><div class="stat-label">Total Views Blog</div></div>
        <div class="stat-card green"> <div class="stat-icon">📝</div><div class="stat-value">${rapat.length}</div><div class="stat-label">Total Rapat</div></div>
        <div class="stat-card amber"> <div class="stat-icon">👥</div><div class="stat-value">${avgHadir}%</div><div class="stat-label">Rata-rata Hadir Rapat</div></div>
        <div class="stat-card red">   <div class="stat-icon">📢</div><div class="stat-value">${aspPend}</div><div class="stat-label">Aspirasi Pending</div></div>
      </div>

      <div class="grid-2 mb-6" style="gap:20px;">
        <div class="card">
          <div class="card-header"><span class="card-title">📊 Progress Program Kerja</span></div>
          <div class="card-body">
            <div style="font-size:48px;font-family:var(--font-display);font-weight:900;color:var(--blue-primary);margin-bottom:4px;">${avgProg}%</div>
            <div class="text-muted text-sm mb-3">Rata-rata progress ${proker.length} proker periode ini</div>
            <div class="progress-bar-wrap" style="height:12px;border-radius:12px;margin-bottom:12px;">
              <div class="progress-bar" style="width:${avgProg}%;background:linear-gradient(90deg,var(--orange-hover),var(--orange));border-radius:12px;"></div>
            </div>
            <div class="flex gap-4 text-sm text-muted flex-wrap">
              <span>✅ Selesai: <strong>${selesai}</strong></span>
              <span>⚡ Berjalan: <strong>${berjalan}</strong></span>
              <span>⏳ Belum: <strong>${proker.filter(p=>p.status==='aktif').length}</strong></span>
              <span>❌ Batal: <strong>${proker.filter(p=>p.status==='dibatalkan').length}</strong></span>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">👥 Statistik Rapat</span></div>
          <div class="card-body">
            <div style="font-size:48px;font-family:var(--font-display);font-weight:900;color:${avgHadir>=75?'var(--success)':avgHadir>=50?'var(--orange)':'var(--danger)'};margin-bottom:4px;">${avgHadir}%</div>
            <div class="text-muted text-sm mb-3">Rata-rata kehadiran dari ${rapat.length} rapat</div>
            <div class="progress-bar-wrap" style="height:12px;border-radius:12px;margin-bottom:12px;">
              <div class="progress-bar" style="width:${avgHadir}%;background:${avgHadir>=75?'var(--success)':avgHadir>=50?'var(--orange)':'var(--danger)'};border-radius:12px;"></div>
            </div>
            <div class="flex gap-4 text-sm text-muted flex-wrap">
              <span>📅 Rapat: <strong>${rapat.length}</strong></span>
              <span>👥 Total Hadir: <strong>${hadirSum}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><span class="card-title">📢 Aspirasi Masuk</span></div>
        <div class="card-body">
          <div class="flex gap-4 flex-wrap">
            ${[{k:'ditinjau',l:'Ditinjau',c:'badge-blue'},{k:'diproses',l:'Diproses',c:'badge-amber'},{k:'diterima',l:'Diterima',c:'badge-green'},{k:'ditolak',l:'Ditolak',c:'badge-red'}]
              .map(s => `<div class="card p-4 flex-1" style="min-width:120px;text-align:center;border:1px solid var(--border);">
                <div style="font-size:24px;font-weight:900;font-family:var(--font-display);">${aspirasi.filter(a=>a.status===s.k).length}</div>
                <span class="badge ${s.c} mt-1">${s.l}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  } catch(e) {
    document.getElementById('dashboard-content').innerHTML = `<div class="info-box danger"><span>❌</span><span>Gagal memuat dashboard: ${escapeHtml(e.message)}</span></div>`;
  }
}

// ============================================================
// GALERI HIMAIF PAGE
// ============================================================
let _galeriData = [];
let _activeGaleriKat = 'Semua';
let _activeGaleriDiv = 'all';
let _activeGaleriPeriode = '2025/2026';

async function renderGaleri() {
  setLoading('galeri-list', true, 'Memuat galeri HIMAIF...');
  try {
    _galeriData = await DB.getGaleri();
    const selPeriode = document.getElementById('galeri-filter-periode')?.value;
    if (selPeriode) _activeGaleriPeriode = selPeriode;
    updateGaleriDivisiOptions();
    filterGaleri(_activeGaleriKat, _activeGaleriDiv, null);
  } catch(e) {
    document.getElementById('galeri-list').innerHTML = `<div class="info-box danger"><span>❌</span><span>${escapeHtml(e.message)}</span></div>`;
  }
}

function onGaleriPeriodeChange(periode) {
  _activeGaleriPeriode = periode;
  _activeGaleriDiv = 'all';
  updateGaleriDivisiOptions();
  filterGaleri(_activeGaleriKat, 'all', null);
}

function updateGaleriDivisiOptions() {
  const divSelect = document.getElementById('galeri-filter-divisi');
  if (!divSelect) return;

  let relevantPhotos = [..._galeriData];
  if (_activeGaleriPeriode && _activeGaleriPeriode !== 'all') {
    relevantPhotos = relevantPhotos.filter(g => (g.periode || '2025/2026') === _activeGaleriPeriode);
  }

  // Get unique divisions from relevant period photos, plus standard list fallback
  const uniqueDivisions = [...new Set(relevantPhotos.map(g => g.divisi).filter(Boolean))];
  const allKnownDivisions = [...new Set([...DIVISI_LIST, 'Kerohanian', ...uniqueDivisions])];

  divSelect.innerHTML = `<option value="all">Semua Divisi</option>` +
    allKnownDivisions.map(d => `<option value="${escapeHtml(d)}" ${d === _activeGaleriDiv ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('');
}

function filterGaleri(kat, div, btn) {
  if (btn && kat) {
    _activeGaleriKat = kat;
    btn.closest('.filter-bar')?.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  } else if (kat) {
    _activeGaleriKat = kat;
  }

  if (div !== null && div !== undefined) {
    _activeGaleriDiv = div;
  } else {
    _activeGaleriDiv = document.getElementById('galeri-filter-divisi')?.value || _activeGaleriDiv || 'all';
  }

  const selPeriode = document.getElementById('galeri-filter-periode')?.value || _activeGaleriPeriode || 'all';
  const q = (document.getElementById('galeri-search')?.value || '').toLowerCase().trim();
  let data = [..._galeriData];

  if (selPeriode && selPeriode !== 'all') {
    data = data.filter(g => (g.periode || '2025/2026') === selPeriode);
  }

  if (_activeGaleriKat && _activeGaleriKat !== 'Semua') {
    data = data.filter(g => g.kategori === _activeGaleriKat);
  }

  if (_activeGaleriDiv && _activeGaleriDiv !== 'all') {
    data = data.filter(g => g.divisi === _activeGaleriDiv);
  }

  if (q) {
    data = data.filter(g =>
      (g.judul || '').toLowerCase().includes(q) ||
      (g.kategori || '').toLowerCase().includes(q) ||
      (g.divisi || '').toLowerCase().includes(q) ||
      (g.periode || '').toLowerCase().includes(q) ||
      (g.deskripsi || '').toLowerCase().includes(q)
    );
  }

  const el = document.getElementById('galeri-list');
  if (!el) return;

  el.innerHTML = data.length
    ? `<div class="galeri-grid">
        ${data.map(g => `<div class="galeri-card" onclick="openPhotoLightbox('${g.id}')">
          <div class="galeri-img-wrap">
            <img src="${escapeHtml(g.foto_url)}" alt="${escapeHtml(g.judul)}" class="galeri-img" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80'">
            <div class="galeri-overlay">
              <span class="galeri-zoom-icon">🔍 Zoom Foto</span>
            </div>
          </div>
          <div class="galeri-body">
            <div class="galeri-badges mb-2">
              <span class="badge badge-orange">${escapeHtml(g.kategori || 'Kegiatan')}</span>
              ${g.divisi ? `<span class="badge badge-blue">${escapeHtml(g.divisi)}</span>` : ''}
              <span class="badge badge-gray font-mono">${escapeHtml(g.periode || '2025/2026')}</span>
            </div>
            <div class="galeri-title">${escapeHtml(g.judul)}</div>
            ${g.deskripsi ? `<div class="text-xs text-muted mt-1">${escapeHtml(g.deskripsi)}</div>` : ''}
            ${g.tanggal ? `<div class="text-xs text-dim mt-2 font-mono">📅 ${escapeHtml(g.tanggal)}</div>` : ''}
            ${isAdmin() ? `<div class="mt-3 flex justify-end" onclick="event.stopPropagation()">
              <button class="btn btn-danger btn-icon btn-sm" onclick="deleteGaleri('${g.id}')" title="Hapus Foto">🗑️</button>
            </div>` : ''}
          </div>
        </div>`).join('')}
      </div>`
    : emptyState('📷', 'Foto tidak ditemukan', isAdmin() ? 'Belum ada foto yang ditambahkan untuk filter ini.' : 'Belum ada foto pada periode/kategori ini.',
        isAdmin() ? `<button class="btn btn-primary" onclick="openAddGaleriModal()">+ Tambah Foto</button>` : '');
}

function openAddGaleriModal() {
  document.getElementById('galeri-judul').value = '';
  document.getElementById('galeri-url').value = '';
  document.getElementById('galeri-deskripsi').value = '';
  openModal('add-galeri-modal');
}

async function saveGaleri() {
  const judul = document.getElementById('galeri-judul')?.value.trim();
  const foto_url = document.getElementById('galeri-url')?.value.trim();
  const kategori = document.getElementById('galeri-kategori')?.value;
  const divisi = document.getElementById('galeri-divisi')?.value;
  const periode = document.getElementById('galeri-periode')?.value || '2025/2026';
  const deskripsi = document.getElementById('galeri-deskripsi')?.value.trim();

  if (!judul || !foto_url) {
    showToast('Judul foto dan URL foto wajib diisi!', 'error');
    return;
  }

  try {
    await DB.addGaleri({
      judul,
      foto_url,
      kategori,
      divisi,
      periode,
      deskripsi,
      tanggal: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    });
    closeModal('add-galeri-modal');
    showToast('Foto berhasil ditambahkan!', 'success');
    await renderGaleri();
  } catch(e) {
    showToast('Gagal menyimpan foto: ' + e.message, 'error');
  }
}

async function deleteGaleri(id) {
  if (!confirm('Apakah Anda yakin ingin menghapus foto ini?')) return;
  try {
    await DB.deleteGaleri(id);
    showToast('Foto berhasil dihapus.', 'info');
    await renderGaleri();
  } catch(e) {
    showToast('Gagal menghapus foto: ' + e.message, 'error');
  }
}

function openPhotoLightbox(id) {
  const photo = _galeriData.find(g => g.id === id);
  if (!photo) return;
  document.getElementById('lightbox-title').textContent = '📷 ' + photo.judul;
  const imgEl = document.getElementById('lightbox-img');
  imgEl.src = photo.foto_url;
  imgEl.onerror = () => { imgEl.src = 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80'; };
  document.getElementById('lightbox-meta').innerHTML = `
    <strong>Periode:</strong> ${escapeHtml(photo.periode || '2025/2026')} | 
    <strong>Kategori:</strong> ${escapeHtml(photo.kategori)} | 
    <strong>Divisi:</strong> ${escapeHtml(photo.divisi || 'Inti')} 
    ${photo.tanggal ? `| <strong>Tanggal:</strong> ${escapeHtml(photo.tanggal)}` : ''}`;
  openModal('photo-lightbox-modal');
}