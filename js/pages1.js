// =============================================================
// HIMAIF — Page Renderers Part 1
// Home, About, Pengurus, Arsip
// =============================================================

// ============================================================
// HOME PAGE
// ============================================================
async function renderHome() {
  // Always render hero immediately (no DB needed)
  renderHomeHero();

  setLoading('home-stats', true);
  setLoading('home-news', true, 'Memuat berita...');

  try {
    const [berita, pengurusRows] = await Promise.all([
      DB.getBerita(),
      DB.getPengurus(STATE.activePeriode),
    ]);
    renderHomeStats(pengurusRows.length);
    renderHomeNews(berita);
  } catch (e) {
    console.warn('[Home] DB error:', e.message);
    // Render hero stats with zeros as fallback
    renderHomeStats(0);
    const newsEl = document.getElementById('home-news');
    if (newsEl) newsEl.innerHTML = `
      <div class="section-header">
        <div><div class="section-title">📰 Berita & Info <span>Terbaru</span></div></div>
      </div>
      <div class="info-box">ℹ️ Tidak dapat memuat berita — periksa koneksi internet dan Supabase.</div>`;
  }
}

function renderHomeHero() {
  const s = STATE.settings;
  document.getElementById('home-hero').innerHTML = `
    <div class="hero">
      <div class="hero-content">
        <div class="hero-badge">✨ Selamat Datang di HIMAIF</div>
        <h1>Himpunan Mahasiswa<br><span>Teknik Informatika</span></h1>
        <p>Wadah aspirasi, pengembangan diri, dan kolaborasi mahasiswa ${s.nama_prodi || 'Teknik Informatika'} ${s.nama_universitas || 'UNIMA'}. Bersama kita tumbuh, berinovasi, dan berkarya.</p>
        <div class="hero-actions">
          <button class="btn btn-accent btn-lg" onclick="navigate('pengurus')">👥 Kenali Pengurus</button>
          <button class="btn btn-ghost btn-lg" onclick="navigate('proker')">📋 Program Kerja</button>
          <button class="btn btn-ghost btn-lg" onclick="navigate('aspirasi')">📢 Aspirasi</button>
        </div>
      </div>
    </div>`;
}

async function renderHomeStats(pengurusCount) {
  try {
    const [proker, pencapaian, projects] = await Promise.all([
      DB.getProker(STATE.activePeriode),
      DB.getPencapaian(),
      DB.getProjects(),
    ]);
    document.getElementById('home-stats').innerHTML = `
      <div class="stats-grid">
        <div class="stat-card blue" onclick="navigate('pengurus')" style="cursor:pointer;"><div class="stat-icon">👥</div><div class="stat-value">${pengurusCount}</div><div class="stat-label">Pengurus Aktif</div><div class="stat-trend">Periode ${STATE.activePeriode}</div></div>
        <div class="stat-card amber" onclick="navigate('proker')" style="cursor:pointer;"><div class="stat-icon">📋</div><div class="stat-value">${proker.length}</div><div class="stat-label">Program Kerja</div><div class="stat-trend up">${proker.filter(p=>p.status==='selesai').length} selesai</div></div>
        <div class="stat-card green" onclick="navigate('achievement')" style="cursor:pointer;"><div class="stat-icon">🏆</div><div class="stat-value">${pencapaian.length}</div><div class="stat-label">Pencapaian</div></div>
        <div class="stat-card purple" onclick="navigate('projects')" style="cursor:pointer;"><div class="stat-icon">💡</div><div class="stat-value">${projects.length}</div><div class="stat-label">Galeri Project</div></div>
      </div>`;
  } catch {}
}

function renderHomeNews(berita) {
  const featured = berita.find(n => n.is_featured);
  const rest = berita.filter(n => !n.is_featured).slice(0, 4);
  document.getElementById('home-news').innerHTML = `
    <div class="section-header">
      <div><div class="section-title">📰 Berita & Info <span>Terbaru</span></div><div class="section-sub">Update terkini dari kampus, prodi, dan kegiatan HIMAIF</div></div>
      ${isAdmin() ? `<button class="btn btn-primary btn-sm" onclick="openBeritaModal()">+ Tambah Berita</button>` : ''}
    </div>
    <div class="news-grid">
      ${featured ? `
        <div class="news-card featured" onclick="showToast('Halaman berita lengkap segera hadir!','info')">
          <div class="news-img">${featured.emoji || '📰'}</div>
          <div class="news-body">
            <div class="news-cat">${featured.kategori}</div>
            <div class="news-title">${escapeHtml(featured.judul)}</div>
            <div class="news-excerpt">${escapeHtml(featured.excerpt || '')}</div>
            <div class="news-meta"><span>📅 ${formatDateShort(featured.published_at)}</span><span>✍️ ${featured.penulis}</span></div>
          </div>
        </div>` : ''}
      ${rest.map(n => `
        <div class="news-card" onclick="showToast('Halaman berita lengkap segera hadir!','info')">
          <div class="news-img">${n.emoji || '📰'}</div>
          <div class="news-body">
            <div class="news-cat">${n.kategori}</div>
            <div class="news-title">${escapeHtml(n.judul)}</div>
            <div class="news-meta"><span>📅 ${formatDateShort(n.published_at)}</span></div>
          </div>
        </div>`).join('')}
    </div>
    <div class="grid-4 mt-6">
      ${[['📚','Bank Materi','E-book, modul, referensi','materi'],['💡','Galeri Project','Karya mahasiswa TI','projects'],['✍️','Tech Blog','Artikel & tutorial IT','blog'],['📢','Kotak Aspirasi','Kritik & saran anonim','aspirasi']].map(([icon,title,desc,page]) => `
        <div class="card" style="cursor:pointer;" onclick="navigate('${page}')">
          <div class="card-body text-center" style="padding:24px 16px;">
            <div style="font-size:34px;margin-bottom:10px;">${icon}</div>
            <div class="font-bold">${title}</div>
            <div class="text-sm text-muted mt-1">${desc}</div>
          </div>
        </div>`).join('')}
    </div>`;
}

// ============================================================
// ABOUT PAGE
// ============================================================
function renderAbout() {
  const s = STATE.settings;
  const misiHimaif = (s.misi_himaif || '').split('\n').filter(Boolean);
  const misiProdi = (s.misi_prodi || '').split('\n').filter(Boolean);

  document.getElementById('about-content').innerHTML = `
    <div class="grid-2 mb-6">
      <div class="card">
        <div class="card-body">
          <div style="font-size:48px;margin-bottom:14px;">💻</div>
          <h3 style="font-family:var(--font-display);font-size:20px;font-weight:800;margin-bottom:10px;">Apa itu HIMAIF?</h3>
          <p class="text-muted" style="line-height:1.8;">${s.tentang_himaif || 'HIMAIF adalah organisasi kemahasiswaan resmi mahasiswa Teknik Informatika UNIMA.'}</p>
          <div class="flex gap-2 flex-wrap mt-4">
            <span class="badge badge-blue">📅 Periode ${STATE.activePeriode}</span>
            <span class="badge badge-amber">📍 UNIMA, Tondano</span>
            <span class="badge badge-green">✅ Aktif</span>
          </div>
        </div>
      </div>
      <div>
        <div class="card mb-3">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-3"><span style="font-size:20px;">🌟</span><span class="font-bold" style="font-size:15px;">Visi HIMAIF</span></div>
            <p class="text-muted" style="font-style:italic;line-height:1.75;font-size:13.5px;">"${s.visi_himaif || '—'}"</p>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-3"><span style="font-size:20px;">🎯</span><span class="font-bold" style="font-size:15px;">Misi HIMAIF</span></div>
            <ol style="padding-left:18px;color:var(--text-muted);">
              ${misiHimaif.map(m => `<li style="margin-bottom:6px;font-size:13px;line-height:1.6;">${m.replace(/^\d+\.\s*/,'')}</li>`).join('')}
            </ol>
          </div>
        </div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="section-header mt-4">
      <div><div class="section-title">Tentang Prodi <span>${s.nama_prodi || 'Teknik Informatika'}</span></div><div class="section-sub">${s.nama_universitas || 'UNIMA'}</div></div>
    </div>
    <div class="grid-2 mb-4">
      <div class="card">
        <div class="card-body">
          <div style="font-size:48px;margin-bottom:14px;">🎓</div>
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:800;margin-bottom:10px;">Prodi ${s.nama_prodi || 'TI'} UNIMA</h3>
          <p class="text-muted" style="line-height:1.8;font-size:13.5px;">Program Studi ${s.nama_prodi || 'Teknik Informatika'} ${s.nama_universitas || 'UNIMA'} merupakan program studi yang berfokus pada ilmu komputer, pengembangan perangkat lunak, dan teknologi informasi. Prodi ini telah menghasilkan lulusan kompeten yang berkiprah di berbagai industri teknologi nasional maupun internasional.</p>
          <div class="flex gap-2 flex-wrap mt-4">
            <span class="badge badge-green">✅ Akreditasi Baik Sekali</span>
            <span class="badge badge-blue">🏛️ Sejak 2008</span>
            <span class="badge badge-amber">📍 Tondano, Sulut</span>
          </div>
        </div>
      </div>
      <div>
        <div class="card mb-3">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-3"><span style="font-size:20px;">🌟</span><span class="font-bold" style="font-size:15px;">Visi Prodi</span></div>
            <p class="text-muted" style="font-style:italic;line-height:1.75;font-size:13.5px;">"${s.visi_prodi || '—'}"</p>
          </div>
        </div>
        <div class="card">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-3"><span style="font-size:20px;">🎯</span><span class="font-bold" style="font-size:15px;">Misi Prodi</span></div>
            <ol style="padding-left:18px;color:var(--text-muted);">
              ${misiProdi.map(m => `<li style="margin-bottom:6px;font-size:13px;line-height:1.6;">${m.replace(/^\d+\.\s*/,'')}</li>`).join('')}
            </ol>
          </div>
        </div>
      </div>
    </div>
    <div class="grid-4">
      <div class="stat-card blue"><div class="stat-icon">👩‍🎓</div><div class="stat-value">400+</div><div class="stat-label">Mahasiswa Aktif</div></div>
      <div class="stat-card amber"><div class="stat-icon">👨‍🏫</div><div class="stat-value">25+</div><div class="stat-label">Dosen</div></div>
      <div class="stat-card green"><div class="stat-icon">🎓</div><div class="stat-value">800+</div><div class="stat-label">Alumni</div></div>
      <div class="stat-card purple"><div class="stat-icon">🏆</div><div class="stat-value">50+</div><div class="stat-label">Prestasi Nasional</div></div>
    </div>`;
}

// ============================================================
// PENGURUS PAGE
// ============================================================
let _pengurusData = [];

async function renderPengurus() {
  const container = document.getElementById('page-pengurus');
  const periodeEl = document.getElementById('pengurus-periode');
  const periode = periodeEl?.value || STATE.activePeriode;

  setLoading('org-chart-wrap', true, 'Memuat struktur organisasi...');
  setLoading('pengurus-table-body', true, 'Memuat daftar pengurus...');

  try {
    _pengurusData = await DB.getPengurus(periode);
    renderOrgChart(_pengurusData);
    renderPengurusList(_pengurusData);
  } catch (e) {
    document.getElementById('org-chart-wrap').innerHTML = `<div class="warning-box">⚠️ Gagal memuat: ${e.message}</div>`;
    showToast('Gagal memuat data pengurus', 'error');
  }
}

function renderOrgChart(data) {
  const inti = data.filter(d => d.divisi === 'Inti').sort((a,b) => a.urutan - b.urutan);
  const divisi = [...new Set(data.filter(d => d.divisi !== 'Inti').map(d => d.divisi))];

  document.getElementById('org-chart-wrap').innerHTML = `
    <div class="org-tree">
      <div class="org-level-label">🏛️ Inti Himpunan</div>
      <div class="org-level">
        ${inti.map(m => orgCardHtml(m, true)).join('')}
      </div>
      ${divisi.map(div => {
        const members = data.filter(d => d.divisi === div).sort((a,b) => a.urutan - b.urutan);
        return `
          <div class="org-level-label">📁 ${div}</div>
          <div class="org-level">
            ${members.map(m => orgCardHtml(m, false)).join('')}
          </div>`;
      }).join('')}
    </div>`;
}

function orgCardHtml(m, isInti) {
  return `
    <div class="org-card ${isInti ? 'inti' : ''}" onclick="openMemberModal('${m.id}')">
      <div class="org-avatar">${initials(m.nama)}</div>
      <div class="org-name">${m.nama.split(' ')[0]}</div>
      <div class="org-role">${m.jabatan}</div>
      ${m.divisi !== 'Inti' ? `<div class="org-div">${m.divisi}</div>` : ''}
      <div class="org-tooltip">
        <h4>${escapeHtml(m.nama)}</h4>
        <p>📋 ${m.jabatan}${m.divisi !== 'Inti' ? ' — ' + m.divisi : ''}</p>
        <p>🎓 NIM: <span style="font-family:var(--font-mono)">${m.nim}</span></p>
        <p>📚 Semester ${m.semester}</p>
        ${m.bio ? `<p style="margin-top:6px;font-style:italic;color:var(--text-dim);">"${escapeHtml(m.bio)}"</p>` : ''}
        ${m.linkedin_url ? `<p style="color:var(--primary-light);">🔗 LinkedIn tersedia</p>` : ''}
        <p style="margin-top:8px;color:var(--accent);font-size:10px;font-weight:700;">KLIK UNTUK DETAIL →</p>
      </div>
    </div>`;
}

function renderPengurusList(data) {
  const q = document.getElementById('pengurus-search')?.value?.toLowerCase() || '';
  const filterDiv = document.getElementById('pengurus-filter-div')?.value || 'all';
  let filtered = data;
  if (q) filtered = filtered.filter(m => m.nama.toLowerCase().includes(q) || m.nim.includes(q) || m.jabatan.toLowerCase().includes(q));
  if (filterDiv !== 'all') filtered = filtered.filter(m => m.divisi === filterDiv);

  document.getElementById('pengurus-table-body').innerHTML = filtered.length
    ? `<div class="table-wrap">
        <table>
          <thead><tr>
            <th>Anggota</th><th>NIM</th><th>Divisi</th><th>Jabatan</th>
            <th>Semester</th><th>Tgl Lahir</th>
            ${isAdmin() ? '<th>Aksi</th>' : ''}
          </tr></thead>
          <tbody>
            ${filtered.map(m => `
              <tr onclick="openMemberModal('${m.id}')" style="cursor:pointer;">
                <td>
                  <div class="flex items-center gap-2">
                    <div class="avatar avatar-sm">${initials(m.nama)}</div>
                    <span class="font-bold">${escapeHtml(m.nama)}</span>
                  </div>
                </td>
                <td class="font-mono text-sm">${m.nim}</td>
                <td>${getStatusBadge(m.divisi === 'Inti' ? null : null) || ''}<span class="badge badge-blue">${m.divisi}</span></td>
                <td>${escapeHtml(m.jabatan)}</td>
                <td>${m.semester}</td>
                <td>${formatDate(m.tanggal_lahir)}</td>
                ${isAdmin() ? `<td onclick="event.stopPropagation()">
                  <div class="td-actions">
                    <button class="btn btn-ghost btn-sm" onclick="openEditPengurusModal('${m.id}')">✏️</button>
                    <button class="btn btn-danger btn-sm" onclick="deletePengurus('${m.id}','${escapeHtml(m.nama)}')">🗑️</button>
                  </div>
                </td>` : ''}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`
    : emptyState('👥', 'Tidak ada data pengurus', 'Belum ada pengurus untuk filter ini.');
}

function openMemberModal(id) {
  const m = _pengurusData.find(x => x.id === id);
  if (!m) return;
  document.getElementById('member-modal-body').innerHTML = `
    <div class="text-center mb-5">
      <div class="avatar avatar-xl" style="margin:0 auto 14px;">${initials(m.nama)}</div>
      <div class="font-display" style="font-size:21px;font-weight:800;">${escapeHtml(m.nama)}</div>
      <div class="flex gap-2 justify-center mt-2 flex-wrap">
        <span class="badge badge-amber">${m.jabatan}</span>
        <span class="badge badge-blue">${m.divisi}</span>
      </div>
    </div>
    <div class="grid-2" style="gap:10px;margin-bottom:16px;">
      <div class="card p-4"><div class="text-xs text-muted mb-1">NIM</div><div class="font-mono font-bold">${m.nim}</div></div>
      <div class="card p-4"><div class="text-xs text-muted mb-1">Semester</div><div class="font-bold">${m.semester}</div></div>
      <div class="card p-4"><div class="text-xs text-muted mb-1">Tanggal Lahir</div><div class="font-bold">${formatDate(m.tanggal_lahir)}</div></div>
      <div class="card p-4"><div class="text-xs text-muted mb-1">Periode</div><div class="font-bold">${m.periode}</div></div>
    </div>
    ${m.bio ? `<div class="card p-4 mb-3" style="font-style:italic;color:var(--text-muted);">"${escapeHtml(m.bio)}"</div>` : ''}
    ${m.linkedin_url ? `<a href="${m.linkedin_url}" class="btn btn-ghost btn-sm" target="_blank" rel="noopener">🔗 Lihat LinkedIn</a>` : ''}`;
  openModal('member-modal');
}

// ============================================================
// ARSIP PAGE
// ============================================================
async function renderArsip() {
  // Render pengurus arsip
  await renderArsipPengurus();
  // Render LPJ
  await renderArsipLPJ();
  // Render kegiatan
  await renderArsipKegiatan();
}

async function renderArsipPengurus() {
  const periodeFilter = document.getElementById('arsip-periode-filter')?.value || 'all';
  setLoading('arsip-pengurus-list', true);
  try {
    const periodes = await DB.getPeriodes();
    const arsipPeriodes = periodes.filter(p => !p.is_active);
    const filtered = periodeFilter === 'all' ? arsipPeriodes : arsipPeriodes.filter(p => p.nama === periodeFilter);

    // Build periode filter dropdown
    document.getElementById('arsip-periode-filter').innerHTML =
      `<option value="all">Semua Periode</option>` +
      arsipPeriodes.map(p => `<option value="${p.nama}" ${p.nama === periodeFilter ? 'selected' : ''}>${p.nama}</option>`).join('');

    let html = '';
    for (const p of filtered) {
      const members = await DB.getPengurus(p.nama);
      if (!members.length) continue;
      html += `
        <div class="card mb-4">
          <div class="card-header">
            <span class="font-bold font-display">📁 Periode ${p.nama}</span>
            <span class="badge badge-gray">${members.length} anggota</span>
          </div>
          <div class="table-wrap" style="border:none;border-radius:0;">
            <table>
              <thead><tr><th>Nama</th><th>NIM</th><th>Jabatan</th><th>Divisi</th><th>Semester</th></tr></thead>
              <tbody>
                ${members.map(m => `
                  <tr>
                    <td class="font-bold">${escapeHtml(m.nama)}</td>
                    <td class="font-mono text-sm">${m.nim}</td>
                    <td>${escapeHtml(m.jabatan)}</td>
                    <td><span class="badge badge-blue">${m.divisi}</span></td>
                    <td>${m.semester}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
          </div>
          <div class="card-footer flex justify-end gap-2">
            <button class="btn btn-ghost btn-sm" onclick="exportPengurusCSV('${p.nama}')">📥 Export CSV</button>
          </div>
        </div>`;
    }
    document.getElementById('arsip-pengurus-list').innerHTML = html || emptyState('📁', 'Tidak ada arsip', 'Belum ada arsip pengurus periode lalu.');
  } catch (e) {
    document.getElementById('arsip-pengurus-list').innerHTML = `<div class="warning-box">⚠️ ${e.message}</div>`;
  }
}

async function renderArsipLPJ() {
  const periodeFilter = document.getElementById('arsip-lpj-periode')?.value || 'all';
  const divisiFilter = document.getElementById('arsip-lpj-divisi')?.value || 'all';
  setLoading('arsip-lpj-list', true);
  try {
    let data = await DB.getLPJ(periodeFilter !== 'all' ? periodeFilter : null);
    if (divisiFilter !== 'all') data = data.filter(l => l.divisi === divisiFilter || l.divisi === 'Semua Divisi');
    document.getElementById('arsip-lpj-list').innerHTML = data.length
      ? data.map(l => `
          <div class="card mb-3">
            <div class="card-body flex items-center gap-4">
              <div style="font-size:38px;">📄</div>
              <div class="flex-1 min-w-0">
                <div class="font-bold mb-1">${escapeHtml(l.judul)}</div>
                <div class="text-sm text-muted">${escapeHtml(l.deskripsi || '')}</div>
                <div class="flex gap-3 mt-2 text-xs text-muted flex-wrap">
                  <span>📅 ${formatDate(l.tanggal)}</span>
                  <span>📁 ${l.divisi}</span>
                  <span>🗓️ ${l.periode}</span>
                  ${l.ukuran ? `<span>💾 ${l.ukuran}</span>` : ''}
                </div>
              </div>
              <div class="flex gap-2" style="flex-shrink:0;">
                ${l.file_url ? `<a href="${l.file_url}" class="btn btn-primary btn-sm" target="_blank">⬇️ Download</a>` : `<button class="btn btn-ghost btn-sm" onclick="showToast('File belum tersedia','warning')">⬇️ Download</button>`}
                ${isAdmin() ? `<button class="btn btn-danger btn-sm" onclick="deleteLPJ('${l.id}')">🗑️</button>` : ''}
              </div>
            </div>
          </div>`).join('')
      : emptyState('📄', 'Tidak ada LPJ', 'Belum ada LPJ untuk filter ini.');
  } catch (e) {
    document.getElementById('arsip-lpj-list').innerHTML = `<div class="warning-box">⚠️ ${e.message}</div>`;
  }
}

async function renderArsipKegiatan() {
  setLoading('arsip-kegiatan-list', true);
  try {
    const data = await DB.getKegiatan();
    document.getElementById('arsip-kegiatan-list').innerHTML = data.length
      ? `<div class="ach-grid">${data.map(k => `
          <div class="ach-card">
            <div class="ach-medal">${k.emoji || '📸'}</div>
            <div class="ach-prestasi">${escapeHtml(k.judul)}</div>
            <div class="ach-nama">📁 ${k.divisi || '—'}</div>
            <div class="ach-info">${escapeHtml(k.deskripsi || '')}</div>
            <div class="ach-date">📅 ${formatDate(k.tanggal)} &bull; ${k.periode}</div>
            ${k.ada_lpj ? `<span class="badge badge-green mt-2">📄 Ada LPJ</span>` : `<span class="badge badge-gray mt-2">Tanpa LPJ</span>`}
          </div>`).join('')}</div>`
      : emptyState('📸', 'Tidak ada kegiatan', 'Belum ada arsip kegiatan tercatat.');
  } catch (e) {
    document.getElementById('arsip-kegiatan-list').innerHTML = `<div class="warning-box">⚠️ ${e.message}</div>`;
  }
}

async function deleteLPJ(id) {
  if (!confirm('Hapus LPJ ini?')) return;
  try {
    await DB.deleteLPJ(id);
    showToast('LPJ dihapus.', 'success');
    cacheClear('lpj');
    await renderArsipLPJ();
  } catch (e) { showToast('Gagal hapus: ' + e.message, 'error'); }
}