// =============================================================
// HIMAIF v2 — Pages 1: Home, About, Pengurus, Arsip
// =============================================================

// ============================================================
// HOME PAGE
// ============================================================
async function renderHome() {
  renderHomeHero();
  try {
    const [berita, pencapaian, pengurus] = await Promise.all([
      DB.getBerita(),
      DB.getPencapaian(),
      DB.getPengurus(STATE.activePeriode),
    ]);
    renderHomeStats(pengurus, pencapaian, berita);
    renderHomeNews(berita, pencapaian);
  } catch(e) {
    document.getElementById('home-stats').innerHTML = `<div class="info-box warning mt-2"><span>⚠️</span><span>Database belum terhubung. Pastikan Supabase sudah dikonfigurasi dan SQL sudah dijalankan.</span></div>`;
    document.getElementById('home-news').innerHTML = '';
  }
}

function renderHomeHero() {
  const s = STATE.settings;
  const nama = s.nama_himaif || 'HIMAIF';
  const periode = STATE.activePeriode;
  document.getElementById('home-hero').innerHTML = `
    <div class="hero">
      <div class="hero-grid"></div>
      <div class="hero-content">
        <div class="hero-badge">⚙️ Periode Aktif ${escapeHtml(periode)}</div>
        <h1>Himpunan Mahasiswa<br><span>Teknik Informatika</span></h1>
        <p>${escapeHtml(s.tentang_himaif || 'Organisasi kemahasiswaan resmi yang mewadahi seluruh mahasiswa Program Studi Teknik Informatika Universitas Negeri Manado. Inovatif, kolaboratif, dan berdedikasi.')}</p>
        <div class="hero-actions">
          <button class="btn btn-primary btn-lg" onclick="navigate('pengurus')">👥 Data Pengurus</button>
          <button class="btn btn-outline btn-lg" onclick="navigate('about')">ℹ️ Tentang Kami</button>
        </div>
      </div>
      <div class="hero-deco"></div>
    </div>`;
}

function renderHomeStats(pengurus, pencapaian, berita) {
  const totalP   = pengurus.length;
  const nasional = pencapaian.filter(p => p.level === 'Nasional' || p.level === 'Internasional').length;
  const featured = berita.filter(b => b.is_featured).length;
  const divCount = [...new Set(pengurus.map(p => p.divisi))].length;

  document.getElementById('home-stats').innerHTML = `
    <div class="stats-grid mb-6">
      <div class="stat-card orange">
        <div class="stat-icon">⚙️</div>
        <div class="stat-value">${totalP}</div>
        <div class="stat-label">Pengurus Aktif</div>
      </div>
      <div class="stat-card green">
        <div class="stat-icon">🏆</div>
        <div class="stat-value">${pencapaian.length}</div>
        <div class="stat-label">Total Prestasi</div>
      </div>
    </div>`;
}

function renderHomeNews(berita, pencapaian) {
  let html = '';
  // Latest news section
  if (berita.length > 0) {
    html += `<div class="section-header"><div><div class="section-title">📰 Berita <span>Terbaru</span></div></div><button class="btn btn-ghost btn-sm" onclick="navigate('about')">Lihat semua →</button></div>`;
    const featured = berita.find(b => b.is_featured);
    const others   = berita.filter(b => !b.is_featured || b.id !== (featured||{}).id).slice(0, 4);
    html += `<div class="news-grid mb-6">`;
    if (featured) {
      html += `<div class="news-card featured" onclick="openBeritaDetail('${featured.id}')">
        <div class="news-img" style="font-size:52px;">${featured.emoji || '📰'}</div>
        <div class="news-body">
          <div class="news-cat">⭐ Featured · ${escapeHtml(featured.kategori)}</div>
          <div class="news-title">${escapeHtml(featured.judul)}</div>
          <div class="news-excerpt">${escapeHtml(featured.excerpt || '')}</div>
          <div class="news-meta"><span>✍️ ${escapeHtml(featured.penulis)}</span><span>${timeAgo(featured.published_at)}</span></div>
        </div>
      </div>`;
    }
    others.forEach(b => {
      html += `<div class="news-card" onclick="openBeritaDetail('${b.id}')">
        <div class="news-img" style="font-size:36px;padding:22px;">${b.emoji || '📰'}</div>
        <div class="news-body">
          <div class="news-cat">${escapeHtml(b.kategori)}</div>
          <div class="news-title line-clamp-2">${escapeHtml(b.judul)}</div>
          <div class="news-excerpt line-clamp-2">${escapeHtml(b.excerpt || '')}</div>
          <div class="news-meta"><span>${timeAgo(b.published_at)}</span></div>
        </div>
      </div>`;
    });
    html += `</div>`;
  }
  // Recent achievements
  if (pencapaian.length > 0) {
    const recent = pencapaian.slice(0, 4);
    html += `<div class="section-header"><div><div class="section-title">🏆 Prestasi <span>Terkini</span></div></div><button class="btn btn-ghost btn-sm" onclick="navigate('achievement')">Lihat semua →</button></div>
    <div class="ach-grid mb-4">
      ${recent.map(p => `<div class="ach-card">
        <div class="ach-medal">${p.medal || '🏆'}</div>
        <div class="ach-prestasi">${escapeHtml(p.prestasi)}</div>
        <div class="ach-nama">👤 ${escapeHtml(p.nama)}</div>
        <div class="flex gap-1 flex-wrap" style="margin:6px 0;">${getLevelBadge(p.level)}<span class="badge badge-gray">${escapeHtml(p.kategori || 'Prestasi')}</span></div>
        <div class="ach-date">📅 ${formatDate(p.tanggal)}</div>
      </div>`).join('')}
    </div>`;
  }

  if (!berita.length && !pencapaian.length) {
    html = `<div class="card"><div class="card-body">${emptyState('📋', 'Data belum tersedia', 'Tambahkan berita dan pencapaian melalui Panel Admin setelah login.', isAdmin() ? `<button class="btn btn-primary" onclick="navigate('admin')">⚙️ Buka Admin Panel</button>` : '')}</div></div>`;
  }
  document.getElementById('home-news').innerHTML = html;
}

let _beritaCache = [];
function openBeritaDetail(id) {
  const b = _beritaCache.find(x => x.id === id);
  if (!b) return;
  const modal = document.createElement('div');
  modal.className = 'modal-overlay open';
  modal.innerHTML = `<div class="modal" style="max-width:700px;">
    <div class="modal-header">
      <div class="modal-title">${escapeHtml(b.judul)}</div>
      <button class="modal-close" onclick="this.closest('.modal-overlay').remove();document.body.style.overflow=''">✕</button>
    </div>
    <div class="modal-body">
      <div class="flex gap-2 mb-4 flex-wrap">
        <span class="badge badge-orange">${escapeHtml(b.kategori)}</span>
        <span class="badge badge-gray">✍️ ${escapeHtml(b.penulis)}</span>
        <span class="badge badge-gray">📅 ${formatDate(b.published_at)}</span>
      </div>
      ${b.excerpt ? `<p style="color:var(--text-sec);font-style:italic;margin-bottom:16px;font-size:14px;line-height:1.7;">${escapeHtml(b.excerpt)}</p><div class="divider"></div>` : ''}
      <div style="line-height:1.85;font-size:14px;white-space:pre-wrap;">${escapeHtml(b.konten || '')}</div>
    </div>
    <div class="modal-footer"><button class="btn btn-ghost" onclick="this.closest('.modal-overlay').remove();document.body.style.overflow=''">Tutup</button></div>
  </div>`;
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  modal.addEventListener('click', e => { if(e.target === modal) { modal.remove(); document.body.style.overflow=''; }});
}

// Override renderHome to also cache berita
const _origRenderHome = renderHome;
async function renderHome() {
  renderHomeHero();
  try {
    const [berita, pencapaian, pengurus] = await Promise.all([
      DB.getBerita(),
      DB.getPencapaian(),
      DB.getPengurus(STATE.activePeriode),
    ]);
    _beritaCache = berita;
    renderHomeStats(pengurus, pencapaian, berita);
    renderHomeNews(berita, pencapaian);
  } catch(e) {
    document.getElementById('home-stats').innerHTML = `<div class="info-box warning mt-2"><span>⚠️</span><span>Database belum terhubung. Pastikan Supabase sudah dikonfigurasi dan SQL sudah dijalankan. Error: ${escapeHtml(e.message)}</span></div>`;
    document.getElementById('home-news').innerHTML = '';
  }
}

// ============================================================
// ABOUT PAGE
// ============================================================
async function renderAbout() {
  setLoading('about-content', true, 'Memuat info...');
  const s = STATE.settings;
  const misiH = (s.misi_himaif || '').replace(/\\n/g, '\n').split('\n').filter(Boolean);
  const misiP = (s.misi_prodi || '').replace(/\\n/g, '\n').split('\n').filter(Boolean);
  document.getElementById('about-content').innerHTML = `
    <!-- HIMAIF Section -->
    <div class="card mb-4">
      <div class="card-header">
        <span class="card-title">🏢 Tentang HIMAIF</span>
        <span class="badge badge-orange">EST. 2017</span>
      </div>
      <div class="card-body">
        <div class="grid-2" style="gap:24px;align-items:start;">
          <div>
            <p style="color:var(--text-sec);line-height:1.85;margin-bottom:20px;">
              ${escapeHtml(s.tentang_himaif || 'HIMAIF (Himpunan Mahasiswa Teknik Informatika) adalah organisasi kemahasiswaan resmi yang mewadahi seluruh mahasiswa Program Studi Teknik Informatika Universitas Negeri Manado.')}
            </p>
            <div class="flex gap-2 flex-wrap">
              ${s.instagram ? `<a href="https://instagram.com/${s.instagram.replace('@','')}" target="_blank" class="btn btn-ghost btn-sm">📸 ${escapeHtml(s.instagram)}</a>` : ''}
              ${s.email_kontak ? `<a href="mailto:${s.email_kontak}" class="btn btn-ghost btn-sm">✉️ ${escapeHtml(s.email_kontak)}</a>` : ''}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div class="card" style="border-color:var(--border-orange);">
              <div class="card-body p-4">
                <div class="flex gap-2 items-center mb-2"><span style="font-size:20px;">🌟</span><span class="font-bold">Visi HIMAIF</span></div>
                <p style="font-style:italic;color:var(--text-sec);font-size:13px;line-height:1.75;">"${escapeHtml(s.visi_himaif || 'Menjadi himpunan mahasiswa yang inovatif, berdedikasi, dan berkontribusi nyata.')}"</p>
              </div>
            </div>
            <div class="card">
              <div class="card-body p-4">
                <div class="flex gap-2 items-center mb-2"><span style="font-size:20px;">🎯</span><span class="font-bold">Misi HIMAIF</span></div>
                <ol style="padding-left:18px;color:var(--text-muted);display:flex;flex-direction:column;gap:6px;">
                  ${misiH.map(m => `<li style="font-size:12.5px;line-height:1.6;">${escapeHtml(m.replace(/^\d+\.\s*/,''))}</li>`).join('')}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Divisi Cards -->
    <div class="section-header">
      <div><div class="section-title">Struktur <span>Divisi</span></div></div>
    </div>
    <div class="grid-auto mb-6">
      ${[
        {icon:'⚙️',  name:'Inti Himpunan',       desc:'Ketua, Wakil, Sekretaris, Bendahara — pimpinan organisasi.', color:'var(--blue-primary)'},
        {icon:'🛡️',  name:'Pendamping Pengurus', desc:'Pembina, penasihat, dan pendamping jalannya roda organisasi.', color:'var(--cyan, #06b6d4)'},
        {icon:'🎓',  name:'Akademik & Keilmuan', desc:'Peningkatan kompetensi dan kegiatan akademik mahasiswa TI.', color:'var(--blue-xlight)'},
        {icon:'🤝',  name:'PSDM',                desc:'Pengembangan SDM, rekrutmen, dan pembinaan anggota.', color:'var(--success)'},
        {icon:'📡',  name:'Kominfo',             desc:'Komunikasi, media sosial, dan branding HIMAIF.', color:'var(--teal-light)'},
        {icon:'🎭',  name:'Mikat',               desc:'Minat, bakat, dan hubungan sosial kemahasiswaan.', color:'var(--purple)'},
        {icon:'🌐',  name:'Humas (Hubungan Masyarakat)', desc:'Hubungan eksternal, kemitraan, dan pengabdian masyarakat.', color:'var(--orange)'},
        {icon:'💼',  name:'Kewirausahaan',       desc:'Wirausaha, sponsorship, dan pemasukan organisasi.', color:'var(--warning)'},
      ].map(d => `<div class="card" style="border-top:3px solid ${d.color};">
        <div class="card-body">
          <div style="font-size:28px;margin-bottom:10px;">${d.icon}</div>
          <div class="font-bold mb-1" style="color:${d.color};">${d.name}</div>
          <div class="text-sm text-muted" style="line-height:1.65;">${d.desc}</div>
        </div>
      </div>`).join('')}
    </div>

    <!-- Prodi TI Section -->
    <div class="divider"></div>
    <div class="section-header mt-4">
      <div><div class="section-title">Prodi <span>${escapeHtml(s.nama_prodi || 'Teknik Informatika')}</span></div>
      <div class="section-sub">${escapeHtml(s.nama_universitas || 'Universitas Negeri Manado')}</div></div>
    </div>
    <div class="grid-2 mb-6" style="gap:20px;align-items:start;">
      <div class="card">
        <div class="card-body">
          <div style="font-size:44px;margin-bottom:14px;">🎓</div>
          <h3 style="font-family:var(--font-display);font-size:18px;font-weight:800;margin-bottom:10px;">Prodi ${escapeHtml(s.nama_prodi || 'TI')} UNIMA</h3>
          <p class="text-muted" style="line-height:1.8;font-size:13.5px;">Program Studi Teknik Informatika UNIMA merupakan program studi yang berfokus pada ilmu komputer, pengembangan perangkat lunak, dan teknologi informasi modern.</p>
          <div class="flex gap-2 flex-wrap mt-4">
            <span class="badge badge-green">✅ Akreditasi Baik Sekali</span>
            <span class="badge badge-blue">🏛️ Sejak 2008</span>
            <span class="badge badge-orange">📍 Tondano, Sulut</span>
          </div>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="card">
          <div class="card-body p-4">
            <div class="flex gap-2 items-center mb-2"><span style="font-size:18px;">🌟</span><span class="font-bold">Visi Prodi</span></div>
            <p style="font-style:italic;color:var(--text-sec);font-size:13px;line-height:1.75;">"${escapeHtml(s.visi_prodi || '—')}"</p>
          </div>
        </div>
        <div class="card">
          <div class="card-body p-4">
            <div class="flex gap-2 items-center mb-2"><span style="font-size:18px;">🎯</span><span class="font-bold">Misi Prodi</span></div>
            <ol style="padding-left:18px;color:var(--text-muted);display:flex;flex-direction:column;gap:6px;">
              ${misiP.map(m => `<li style="font-size:12.5px;line-height:1.6;">${escapeHtml(m.replace(/^\d+\.\s*/,''))}</li>`).join('')}
            </ol>
          </div>
        </div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card blue"><div class="stat-icon">👩‍🎓</div><div class="stat-value">400+</div><div class="stat-label">Mahasiswa Aktif</div></div>
      <div class="stat-card orange"><div class="stat-icon">👨‍🏫</div><div class="stat-value">25+</div><div class="stat-label">Dosen</div></div>
      <div class="stat-card green"><div class="stat-icon">🎓</div><div class="stat-value">800+</div><div class="stat-label">Alumni</div></div>
      <div class="stat-card purple"><div class="stat-icon">🏆</div><div class="stat-value">50+</div><div class="stat-label">Prestasi Nasional</div></div>
    </div>`;
}

// ============================================================
// PENGURUS PAGE
// ============================================================
let _pengurusData = [];

async function renderPengurus() {
  setLoading('org-chart-wrap', true, 'Memuat struktur organisasi...');
  setLoading('pengurus-table-body', true, 'Memuat daftar pengurus...');
  const periode = document.getElementById('pengurus-periode')?.value || STATE.activePeriode;
  try {
    _pengurusData = await DB.getPengurus(periode);
    // Populate periode select from DB
    const periodes = await DB.getPeriodes();
    const select = document.getElementById('pengurus-periode');
    if (select && periodes.length > 0) {
      select.innerHTML = periodes.map(p =>
        `<option value="${escapeHtml(p.nama)}" ${p.nama === periode ? 'selected' : ''}>${escapeHtml(p.nama)}${p.is_active ? ' (Aktif)' : ''}</option>`
      ).join('');
    }
    renderOrgChart(_pengurusData);
    renderPengurusList(_pengurusData);
  } catch(e) {
    document.getElementById('org-chart-wrap').innerHTML = emptyState('⚠️', 'Gagal memuat', e.message);
    if (document.getElementById('pengurus-table-body')) document.getElementById('pengurus-table-body').innerHTML = '';
    showToast('Gagal memuat data pengurus: ' + e.message, 'error');
  }
}

function renderOrgChart(rawEvents) {
  const data = rawEvents.map(d => (d.jabatan === 'Pendamping Pengurus' && d.divisi === 'Inti') ? { ...d, divisi: 'Pendamping Pengurus' } : d);
  const inti    = data.filter(d => d.divisi === 'Inti').sort((a,b) => a.urutan - b.urutan);
  const divisis = [...new Set(data.filter(d => d.divisi !== 'Inti').map(d => d.divisi))]
    .sort((a, b) => {
      const idxA = DIVISI_LIST.indexOf(a);
      const idxB = DIVISI_LIST.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

  if (!data.length) {
    document.getElementById('org-chart-wrap').innerHTML = emptyState('👥', 'Belum ada data pengurus', 'Tambahkan pengurus melalui Panel Admin.', isAdmin() ? `<button class="btn btn-primary" onclick="openAddPengurusModal()">+ Tambah Pengurus</button>` : '');
    return;
  }

  document.getElementById('org-chart-wrap').innerHTML = `
    <div class="org-tree">
      <div class="org-level-label">🏛️ Inti Himpunan</div>
      <div class="org-level">${inti.map(m => orgCardHtml(m, true)).join('')}</div>
      ${divisis.map(div => {
        const members = data.filter(d => d.divisi === div).sort((a,b) => a.urutan - b.urutan);
        return `<div class="org-level-label">📁 ${escapeHtml(div)}</div>
        <div class="org-level">${members.map(m => orgCardHtml(m, false)).join('')}</div>`;
      }).join('')}
    </div>`;
}

function orgCardHtml(m, isInti) {
  const showDiv = m.divisi !== 'Inti' && m.divisi !== 'Pendamping Pengurus' && m.divisi !== m.jabatan;
  return `<div class="org-card ${isInti ? 'inti' : ''}" onclick="openMemberModal('${m.id}')">
    <div class="org-avatar">${initials(m.nama)}</div>
    <div class="org-name">${escapeHtml(m.nama.split(' ')[0])}</div>
    <div class="org-role">${escapeHtml(m.jabatan)}</div>
    ${showDiv ? `<div class="org-div">${escapeHtml(m.divisi)}</div>` : ''}
  </div>`;
}

function renderPengurusList(data) {
  const q         = (document.getElementById('pengurus-search')?.value || '').toLowerCase().trim();
  const filterDiv = document.getElementById('pengurus-filter-divisi')?.value || 'all';
  let filtered = [...data];
  if (q)            filtered = filtered.filter(m =>
    m.nama.toLowerCase().includes(q) ||
    m.nim.includes(q) ||
    m.jabatan.toLowerCase().includes(q)
  );
  if (filterDiv !== 'all') filtered = filtered.filter(m => m.divisi === filterDiv);

  const el = document.getElementById('pengurus-table-body');
  if (!el) return;

  el.innerHTML = filtered.length
    ? `<div class="table-wrap" style="border:none;border-radius:0;">
        <table>
          <thead><tr>
            <th>Anggota</th><th>NIM</th><th>Divisi</th><th>Jabatan</th><th>Semester</th><th>Tgl Lahir</th>
            ${isAdmin() ? '<th>Aksi</th>' : ''}
          </tr></thead>
          <tbody>
            ${filtered.map(m => `<tr onclick="openMemberModal('${m.id}')" style="cursor:pointer;">
              <td>
                <div class="flex items-center gap-2">
                  <div class="avatar avatar-sm">${initials(m.nama)}</div>
                  <span class="font-bold">${escapeHtml(m.nama)}</span>
                </div>
              </td>
              <td class="font-mono text-sm">${m.nim}</td>
              <td><span class="badge badge-blue">${escapeHtml(m.divisi)}</span></td>
              <td>${escapeHtml(m.jabatan)}</td>
              <td>${m.semester}</td>
              <td>${formatDate(m.tanggal_lahir)}</td>
              ${isAdmin() ? `<td onclick="event.stopPropagation()">
                <div class="td-actions">
                  <button class="btn btn-ghost btn-icon btn-sm" onclick="openEditPengurusModal('${m.id}')" title="Edit">✏️</button>
                  <button class="btn btn-danger btn-icon btn-sm" onclick="deletePengurus('${m.id}','${escapeHtml(m.nama)}')" title="Hapus">🗑️</button>
                </div>
              </td>` : ''}
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`
    : emptyState('👥', 'Tidak ada hasil', 'Tidak ada pengurus yang cocok dengan filter.',
        isAdmin() ? `<button class="btn btn-primary" onclick="openAddPengurusModal()">+ Tambah Pengurus</button>` : '');
}

function openMemberModal(id) {
  const m = _pengurusData.find(x => x.id === id);
  if (!m) return;
  document.getElementById('member-modal-body').innerHTML = `
    <div class="text-center mb-5">
      <div class="avatar avatar-xl" style="margin:0 auto 14px;">${initials(m.nama)}</div>
      <div class="font-display" style="font-size:22px;font-weight:800;">${escapeHtml(m.nama)}</div>
      <div class="flex gap-2 justify-center mt-2 flex-wrap">
        <span class="badge badge-orange">${escapeHtml(m.jabatan)}</span>
        <span class="badge badge-blue">${escapeHtml(m.divisi)}</span>
      </div>
    </div>
    <div class="grid-2" style="gap:10px;margin-bottom:16px;">
      <div class="card p-4"><div class="text-xs text-muted mb-1">NIM</div><div class="font-mono font-bold">${m.nim}</div></div>
      <div class="card p-4"><div class="text-xs text-muted mb-1">Semester</div><div class="font-bold">${m.semester}</div></div>
      <div class="card p-4"><div class="text-xs text-muted mb-1">Tanggal Lahir</div><div class="font-bold">${formatDate(m.tanggal_lahir)}</div></div>
      <div class="card p-4"><div class="text-xs text-muted mb-1">Periode</div><div class="font-bold">${m.periode}</div></div>
    </div>
    ${m.bio ? `<div class="card p-4 mb-3" style="font-style:italic;color:var(--text-sec);">"${escapeHtml(m.bio)}"</div>` : ''}
    ${m.linkedin_url ? `<a href="${m.linkedin_url}" class="btn btn-secondary btn-sm" target="_blank" rel="noopener">🔗 Lihat LinkedIn</a>` : ''}`;
  openModal('member-modal');
}

async function deletePengurus(id, nama) {
  if (!confirm(`Hapus pengurus "${nama}"?`)) return;
  try {
    await DB.deletePengurus(id);
    showToast(`${nama} dihapus.`, 'success');
    await renderPengurus();
  } catch(e) { showToast('Gagal hapus: ' + e.message, 'error'); }
}

// ============================================================
// ARSIP PAGE
// ============================================================
async function renderArsip() {
  await renderArsipPengurus();
}

async function renderArsipPengurus() {
  setLoading('arsip-pengurus-list', true);
  const periodeFilter = document.getElementById('arsip-periode-filter')?.value || 'all';
  try {
    const periodes    = await DB.getPeriodes();
    const arsipP      = periodes.filter(p => !p.is_active);
    const select      = document.getElementById('arsip-periode-filter');
    if (select) {
      const current = select.value;
      select.innerHTML = `<option value="all">Semua Periode Lalu</option>` +
        arsipP.map(p => `<option value="${escapeHtml(p.nama)}" ${p.nama === current ? 'selected':''} >${escapeHtml(p.nama)}</option>`).join('');
    }
    const toShow = periodeFilter === 'all' ? arsipP : arsipP.filter(p => p.nama === periodeFilter);
    let html = '';
    for (const p of toShow) {
      const members = await DB.getPengurus(p.nama);
      if (!members.length) continue;
      html += `<div class="card mb-4">
        <div class="card-header">
          <span class="card-title">📁 Periode ${escapeHtml(p.nama)}</span>
          <div class="flex gap-2">
            <span class="badge badge-gray">${members.length} anggota</span>
            <button class="btn btn-ghost btn-sm" onclick="exportPengurusCSV('${p.nama}')">📥 Export CSV</button>
          </div>
        </div>
        <div class="table-wrap" style="border:none;border-radius:0 0 var(--radius-lg) var(--radius-lg);">
          <table>
            <thead><tr><th>Nama</th><th>NIM</th><th>Jabatan</th><th>Divisi</th><th>Semester</th></tr></thead>
            <tbody>
              ${members.map(m => `<tr>
                <td class="font-bold">${escapeHtml(m.nama)}</td>
                <td class="font-mono text-sm">${m.nim}</td>
                <td>${escapeHtml(m.jabatan)}</td>
                <td><span class="badge badge-blue">${escapeHtml(m.divisi)}</span></td>
                <td>${m.semester}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
    }
    document.getElementById('arsip-pengurus-list').innerHTML = html ||
      emptyState('📁', 'Tidak ada arsip', 'Belum ada data pengurus dari periode yang sudah lewat.');
  } catch(e) {
    document.getElementById('arsip-pengurus-list').innerHTML = `<div class="info-box danger"><span>❌</span><span>${e.message}</span></div>`;
  }
}

async function renderArsipLPJ() {
  setLoading('arsip-lpj-list', true);
  const periodeF = document.getElementById('arsip-lpj-periode')?.value || 'all';
  const divisiF  = document.getElementById('arsip-lpj-divisi')?.value || 'all';
  try {
    let data = await DB.getLPJ(periodeF !== 'all' ? periodeF : null);
    if (divisiF !== 'all') data = data.filter(l => l.divisi === divisiF || l.divisi === 'Semua Divisi');

    document.getElementById('arsip-lpj-list').innerHTML = data.length
      ? data.map(l => `<div class="card mb-3">
          <div class="card-body flex items-center gap-4">
            <div style="font-size:40px;flex-shrink:0;">📄</div>
            <div class="flex-1 min-w-0">
              <div class="font-bold mb-1">${escapeHtml(l.judul)}</div>
              <div class="text-sm text-muted">${escapeHtml(l.deskripsi || '')}</div>
              <div class="flex gap-3 mt-2 text-xs text-muted flex-wrap">
                <span>📅 ${formatDate(l.tanggal)}</span>
                <span>📁 ${escapeHtml(l.divisi)}</span>
                <span>🗓️ ${escapeHtml(l.periode)}</span>
                ${l.ukuran ? `<span>💾 ${escapeHtml(l.ukuran)}</span>` : ''}
              </div>
            </div>
            <div class="flex gap-2" style="flex-shrink:0;">
              ${l.file_url
                ? `<a href="${l.file_url}" class="btn btn-secondary btn-sm" target="_blank">⬇️ Download</a>`
                : `<button class="btn btn-ghost btn-sm" onclick="showToast('File belum tersedia','warning')">⬇️ Download</button>`}
              ${isAdmin() ? `<button class="btn btn-danger btn-icon btn-sm" onclick="deleteLPJ('${l.id}')">🗑️</button>` : ''}
            </div>
          </div>
        </div>`).join('')
      : emptyState('📄', 'Tidak ada LPJ', 'Belum ada LPJ untuk filter ini.',
          isAdmin() ? `<button class="btn btn-primary" onclick="openModal('add-lpj-modal')">+ Tambah LPJ</button>` : '');
  } catch(e) {
    document.getElementById('arsip-lpj-list').innerHTML = `<div class="info-box danger"><span>❌</span><span>${e.message}</span></div>`;
  }
}

async function renderArsipKegiatan() {
  setLoading('arsip-kegiatan-list', true);
  const periodeF = document.getElementById('arsip-kegiatan-periode')?.value || 'all';
  try {
    const data = await DB.getKegiatan(periodeF !== 'all' ? periodeF : null);
    document.getElementById('arsip-kegiatan-list').innerHTML = data.length
      ? `<div class="ach-grid">
          ${data.map(k => `<div class="ach-card">
            <div class="ach-medal">${k.emoji || '📸'}</div>
            <div class="ach-prestasi">${escapeHtml(k.judul)}</div>
            <div class="ach-nama">📁 ${k.divisi ? escapeHtml(k.divisi) : 'Umum'}</div>
            <div class="ach-date">📅 ${formatDate(k.tanggal)} · ${escapeHtml(k.periode || '')}</div>
            <div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap;">
              ${k.ada_lpj ? `<span class="badge badge-green">📄 Ada LPJ</span>` : `<span class="badge badge-gray">Tanpa LPJ</span>`}
              ${isAdmin() ? `<button class="btn btn-danger btn-icon btn-sm" style="margin-left:auto;" onclick="deleteKegiatan('${k.id}')">🗑️</button>` : ''}
            </div>
          </div>`).join('')}
        </div>`
      : emptyState('📸', 'Tidak ada kegiatan', 'Belum ada arsip kegiatan.',
          isAdmin() ? `<button class="btn btn-primary" onclick="openAddKegiatanModal()">+ Tambah Kegiatan</button>` : '');
  } catch(e) {
    document.getElementById('arsip-kegiatan-list').innerHTML = `<div class="info-box danger"><span>❌</span><span>${e.message}</span></div>`;
  }
}

async function deleteLPJ(id) {
  if (!confirm('Hapus LPJ ini?')) return;
  try {
    await DB.deleteLPJ(id);
    showToast('LPJ dihapus.', 'success');
    await renderArsipLPJ();
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

async function deleteKegiatan(id) {
  if (!confirm('Hapus kegiatan ini?')) return;
  try {
    await DB.deleteKegiatan(id);
    showToast('Kegiatan dihapus.', 'success');
    await renderArsipKegiatan();
  } catch(e) { showToast('Gagal: ' + e.message, 'error'); }
}

function openAddKegiatanModal() { openModal('add-kegiatan-modal'); }