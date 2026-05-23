// ============================================================
// HIMAIF Website - Main JavaScript
// ============================================================

// ===== STATE =====
const STATE = {
  isAdmin: false,
  currentPage: 'home',
  activePeriode: '2024/2025',
  searchQuery: '',
  filters: {},
};

// ===== SAMPLE DATA =====
const DATA = {
  periodes: ['2024/2025', '2023/2024', '2022/2023', '2021/2022'],

  pengurus: {
    '2024/2025': [
      { id:1, nama:'Ahmad Rizky Pratama', nim:'210211060001', divisi:'Inti', jabatan:'Ketua Umum', tl:'2003-05-12', semester:5, linkedin:'', img:'', desc:'Bertanggung jawab atas seluruh kegiatan HIMAIF.' },
      { id:2, nama:'Siti Rahma Wulandari', nim:'210211060002', divisi:'Inti', jabatan:'Wakil Ketua', tl:'2003-08-21', semester:5, linkedin:'', img:'', desc:'Mendampingi dan mewakili Ketua Umum.' },
      { id:3, nama:'Muhammad Fauzan', nim:'210211060003', divisi:'Inti', jabatan:'Sekretaris Umum', tl:'2004-01-15', semester:5, linkedin:'', img:'', desc:'Mengelola administrasi himpunan.' },
      { id:4, nama:'Nurul Hidayah', nim:'210211060004', divisi:'Inti', jabatan:'Bendahara Umum', tl:'2003-11-30', semester:5, linkedin:'', img:'', desc:'Mengelola keuangan himpunan.' },
      { id:5, nama:'Rizky Aditya', nim:'210211060010', divisi:'Akademik & Keilmuan', jabatan:'Kepala Divisi', tl:'2003-07-05', semester:5, linkedin:'', img:'', desc:'Memimpin divisi akademik dan keilmuan.' },
      { id:6, nama:'Dewi Sartika', nim:'210211060011', divisi:'Akademik & Keilmuan', jabatan:'Anggota', tl:'2004-02-19', semester:5, linkedin:'', img:'', desc:'Anggota divisi akademik.' },
      { id:7, nama:'Budi Santoso', nim:'210211060012', divisi:'Akademik & Keilmuan', jabatan:'Anggota', tl:'2003-09-08', semester:5, linkedin:'', img:'', desc:'Anggota divisi akademik.' },
      { id:8, nama:'Annisa Fitri', nim:'210211060020', divisi:'PSDM', jabatan:'Kepala Divisi', tl:'2003-06-14', semester:5, linkedin:'', img:'', desc:'Memimpin pengembangan SDM.' },
      { id:9, nama:'Kevin Lolong', nim:'210211060021', divisi:'PSDM', jabatan:'Anggota', tl:'2004-03-22', semester:5, linkedin:'', img:'', desc:'Anggota divisi PSDM.' },
      { id:10, nama:'Mega Putri', nim:'210211060030', divisi:'Kominfo', jabatan:'Kepala Divisi', tl:'2003-12-07', semester:5, linkedin:'', img:'', desc:'Memimpin divisi komunikasi dan informasi.' },
      { id:11, nama:'Farhan Arief', nim:'210211060031', divisi:'Kominfo', jabatan:'Anggota', tl:'2004-01-28', semester:5, linkedin:'', img:'', desc:'Anggota divisi kominfo.' },
      { id:12, nama:'Yuliana Pakaya', nim:'210211060040', divisi:'Mikat', jabatan:'Kepala Divisi', tl:'2003-10-16', semester:5, linkedin:'', img:'', desc:'Memimpin minat dan bakat.' },
    ],
    '2023/2024': [
      { id:101, nama:'Dimas Pratomo', nim:'200211060001', divisi:'Inti', jabatan:'Ketua Umum', tl:'2002-04-10', semester:7, linkedin:'', img:'', desc:'Ketua periode 2023/2024.' },
      { id:102, nama:'Rini Kusuma', nim:'200211060002', divisi:'Inti', jabatan:'Wakil Ketua', tl:'2002-07-25', semester:7, linkedin:'', img:'', desc:'Wakil ketua periode 2023/2024.' },
    ],
  },

  proker: [
    { id:1, nama:'HIMTECH Week 2025', divisi:'Akademik & Keilmuan', deskripsi:'Serangkaian kegiatan seminar, workshop, dan lomba bertema teknologi untuk mahasiswa TI.', status:'sedang_berjalan', target_tanggal:'2025-08-15', progress:60, anggaran:5000000, ketua:'Rizky Aditya' },
    { id:2, nama:'Study Tour ke Perusahaan IT', divisi:'Akademik & Keilmuan', deskripsi:'Kunjungan ke perusahaan teknologi di Manado untuk memperluas wawasan industri.', status:'aktif', target_tanggal:'2025-09-30', progress:20, anggaran:3000000, ketua:'Dewi Sartika' },
    { id:3, nama:'Pelatihan UI/UX Figma', divisi:'Akademik & Keilmuan', deskripsi:'Workshop intensif desain antarmuka menggunakan tools Figma selama 3 hari.', status:'selesai', target_tanggal:'2025-04-20', progress:100, anggaran:1500000, ketua:'Budi Santoso' },
    { id:4, nama:'HIMAIF Got Talent', divisi:'Mikat', deskripsi:'Ajang unjuk bakat mahasiswa TI dalam bidang seni, musik, dan kreativitas.', status:'aktif', target_tanggal:'2025-10-10', progress:30, anggaran:2000000, ketua:'Yuliana Pakaya' },
    { id:5, nama:'Webinar Keamanan Siber', divisi:'Akademik & Keilmuan', deskripsi:'Webinar tentang cybersecurity dan etika digital bersama praktisi.', status:'dibatalkan', target_tanggal:'2025-05-01', progress:0, anggaran:500000, ketua:'Rizky Aditya' },
    { id:6, nama:'Orientasi Mahasiswa Baru', divisi:'PSDM', deskripsi:'Pengenalan dan penyambutan mahasiswa baru Teknik Informatika angkatan 2025.', status:'selesai', target_tanggal:'2025-03-10', progress:100, anggaran:4000000, ketua:'Annisa Fitri' },
  ],

  achievements: [
    { id:1, nama:'Ahmad Rizky Pratama', prestasi:'Juara 1 Hackathon Nasional GEMASTIK 2024', kategori:'Kompetisi', level:'Nasional', tanggal:'2024-11-15', medal:'🥇' },
    { id:2, nama:'Mega Putri', prestasi:'Finalis UI/UX Competition Tokopedia', kategori:'Desain', level:'Nasional', tanggal:'2024-10-22', medal:'🏆' },
    { id:3, nama:'Tim Robotika TI UNIMA', prestasi:'Juara 2 Kontes Robot Indonesia Regional', kategori:'Robotika', level:'Regional', tanggal:'2024-09-08', medal:'🥈' },
    { id:4, nama:'Kevin Lolong', prestasi:'Best Paper Award Seminar Nasional IT', kategori:'Riset', level:'Nasional', tanggal:'2024-08-30', medal:'📜' },
    { id:5, nama:'Prodi TI UNIMA', prestasi:'Akreditasi Baik Sekali BAN-PT', kategori:'Akademik', level:'Nasional', tanggal:'2024-07-01', medal:'⭐' },
  ],

  materi: [
    { id:1, judul:'Modul Praktikum Algoritma & Pemrograman', kategori:'Modul Praktikum', deskripsi:'Panduan lengkap praktikum mata kuliah algoritma.', tags:['Algoritma','Python','C++'], tipe:'pdf', ukuran:'2.4 MB', diupload:'2025-01-10', icon:'📚' },
    { id:2, judul:'E-Book Machine Learning with Python', kategori:'E-Book', deskripsi:'Buku panduan implementasi ML menggunakan Python dan library populer.', tags:['ML','AI','Python'], tipe:'pdf', ukuran:'8.1 MB', diupload:'2025-02-05', icon:'🤖' },
    { id:3, judul:'Paper: NLP untuk Bahasa Daerah', kategori:'Paper/Jurnal', deskripsi:'Penelitian tentang penerapan NLP pada bahasa-bahasa daerah Indonesia.', tags:['NLP','AI','Research'], tipe:'pdf', ukuran:'1.2 MB', diupload:'2025-01-28', icon:'📄' },
    { id:4, judul:'Modul Praktikum Basis Data', kategori:'Modul Praktikum', deskripsi:'Panduan praktikum desain dan manajemen basis data dengan MySQL.', tags:['SQL','Database','ERD'], tipe:'pdf', ukuran:'3.7 MB', diupload:'2024-12-15', icon:'🗄️' },
    { id:5, judul:'Tutorial REST API Development', kategori:'Tutorial', deskripsi:'Panduan lengkap membangun REST API dengan Node.js dan Express.', tags:['API','Node.js','Backend'], tipe:'pdf', ukuran:'5.3 MB', diupload:'2025-03-01', icon:'🔌' },
  ],

  projects: [
    { id:1, nama:'SiAkad UNIMA Mobile', pembuat:'Ahmad Rizky & Tim', angkatan:2021, kategori:'Mobile App', desc:'Aplikasi mobile untuk akses informasi akademik mahasiswa UNIMA berbasis Flutter.', tags:['Flutter','Dart','Firebase'], icon:'📱', status:'selesai' },
    { id:2, nama:'HIMAIF Portal Web', pembuat:'Mega Putri & Tim', angkatan:2021, kategori:'Web App', desc:'Website resmi HIMAIF dengan fitur manajemen anggota dan arsip kegiatan.', tags:['React','Node.js','MySQL'], icon:'🌐', status:'aktif' },
    { id:3, nama:'Deteksi Penyakit Tanaman AI', pembuat:'Farhan Arief', angkatan:2021, kategori:'AI/ML', desc:'Sistem deteksi penyakit tanaman menggunakan computer vision berbasis CNN.', tags:['Python','TensorFlow','CV'], icon:'🌿', status:'selesai' },
    { id:4, nama:'E-Commerce Lokal Manado', pembuat:'Dewi Sartika & Kevin', angkatan:2022, kategori:'Web App', desc:'Platform belanja online untuk UMKM lokal Sulawesi Utara.', tags:['Laravel','Vue.js','MySQL'], icon:'🛒', status:'selesai' },
  ],

  blog: [
    { id:1, judul:'Mengenal Large Language Model dan Cara Kerjanya', penulis:'Rizky Aditya', divisi:'Akademik & Keilmuan', tanggal:'2025-05-10', tags:['AI','LLM','Tutorial'], excerpt:'Pengenalan mendalam tentang model bahasa besar yang sedang mengubah dunia teknologi...', status:'published', emoji:'🤖', views:142 },
    { id:2, judul:'Bedah Source Code: Implementasi Algoritma Dijkstra', penulis:'Kevin Lolong', divisi:'Akademik & Keilmuan', tanggal:'2025-04-28', tags:['Algoritma','Graph','Python'], excerpt:'Mari kita bedah bersama implementasi algoritma Dijkstra untuk pencarian jalur terpendek...', status:'published', emoji:'🔍', views:98 },
    { id:3, judul:'UI/UX Design: Prinsip-Prinsip Dasar yang Perlu Diketahui', penulis:'Mega Putri', divisi:'Kominfo', tanggal:'2025-04-15', tags:['UI/UX','Design','Figma'], excerpt:'Sebelum membuka Figma dan mulai merancang, ada beberapa prinsip yang wajib dipahami...', status:'published', emoji:'🎨', views:215 },
    { id:4, judul:'Keamanan Siber: Lindungi Akun Digital Kalian', penulis:'Farhan Arief', divisi:'Kominfo', tanggal:'2025-03-20', tags:['Security','Cybersecurity'], excerpt:'Tips praktis melindungi identitas dan akun digital di era ancaman siber yang semakin canggih...', status:'pending', emoji:'🔒', views:0 },
  ],

  rapat: [
    { id:1, judul:'Rapat Evaluasi Bulanan Mei 2025', tanggal:'2025-05-20', waktu:'14:00 - 17:00', tempat:'Ruang Himpunan Lt.3', jenis:'Bulanan', hadir:18, total:22, spontan:150000, notulis:'Fauzan', docs:[], summary:'Evaluasi program kerja bulanan dan pembahasan persiapan HIMTECH Week.' },
    { id:2, judul:'Rapat Perdana Divisi Kominfo 2025', tanggal:'2025-03-10', waktu:'13:00 - 15:00', tempat:'Lab Komputer 1', jenis:'Divisi', hadir:6, total:6, spontan:0, notulis:'Mega', docs:[], summary:'Pembahasan program kerja kominfo dan pembagian tugas anggota.' },
    { id:3, judul:'Rapat Besar HIMAIF 2025', tanggal:'2025-02-01', waktu:'09:00 - 12:00', tempat:'Aula UNIMA', jenis:'Besar', hadir:40, total:42, spontan:320000, notulis:'Fauzan', docs:[], summary:'Penyusunan program kerja tahunan dan pengesahan pengurus periode 2024/2025.' },
  ],

  aspirasi: [
    { id:1, pesan:'Mohon diperhatikan kondisi AC di Lab Komputer 2 yang sudah tidak berfungsi selama 2 bulan. Sangat mengganggu kenyamanan praktikum.', kategori:'Fasilitas', tanggal:'2025-05-18', status:'ditinjau' },
    { id:2, pesan:'Usul diadakan lebih banyak workshop praktis seperti hackathon internal. Sangat bermanfaat untuk skill mahasiswa.', kategori:'Himpunan', tanggal:'2025-05-10', status:'diterima' },
    { id:3, pesan:'Ada beberapa dosen yang sering terlambat dan tidak memberikan feedback tugas. Mohon ditindaklanjuti.', kategori:'Akademik', tanggal:'2025-04-30', status:'diproses' },
  ],

  lpj: [
    { id:1, judul:'LPJ HIMAIF Periode 2023/2024', periode:'2023/2024', tanggal:'2024-07-15', divisi:'Semua Divisi', file:'lpj_2023_2024.pdf', size:'4.2 MB', desc:'Laporan pertanggungjawaban lengkap seluruh kegiatan HIMAIF periode 2023/2024.' },
    { id:2, judul:'LPJ Divisi Akademik 2023/2024', periode:'2023/2024', tanggal:'2024-07-10', divisi:'Akademik & Keilmuan', file:'lpj_akademik_2324.pdf', size:'1.8 MB', desc:'LPJ khusus divisi akademik dan keilmuan.' },
    { id:3, judul:'LPJ HIMAIF Periode 2022/2023', periode:'2022/2023', tanggal:'2023-07-20', divisi:'Semua Divisi', file:'lpj_2022_2023.pdf', size:'3.9 MB', desc:'Laporan pertanggungjawaban lengkap periode 2022/2023.' },
  ],

  news: [
    { id:1, judul:'HIMTECH Week 2025 Siap Digelar dengan 10+ Agenda Keren!', kategori:'Event', tanggal:'20 Mei 2025', excerpt:'HIMAIF akan menggelar HIMTECH Week pada Agustus 2025 dengan serangkaian seminar, hackathon, dan workshop bergengsi.', emoji:'🚀', featured:true },
    { id:2, judul:'Mahasiswa TI Raih Juara di Hackathon Nasional GEMASTIK', kategori:'Prestasi', tanggal:'15 Nov 2024', excerpt:'Ahmad Rizky dan timnya berhasil membawa pulang gelar juara 1 kategori pengembangan aplikasi.', emoji:'🏆', featured:false },
    { id:3, judul:'Prodi TI UNIMA Resmi Raih Akreditasi Baik Sekali', kategori:'Akademik', tanggal:'1 Jul 2024', excerpt:'Berdasarkan penilaian BAN-PT, Program Studi Teknik Informatika UNIMA berhasil meningkatkan akreditasi.', emoji:'⭐', featured:false },
    { id:4, judul:'Workshop UI/UX Figma: Antusias 60+ Peserta Hadir!', kategori:'Kegiatan', tanggal:'20 Apr 2025', excerpt:'Pelatihan UI/UX yang diselenggarakan divisi akademik disambut antusias oleh mahasiswa.', emoji:'🎨', featured:false },
  ],

  settings: {
    nama_prodi: 'Teknik Informatika',
    nama_universitas: 'Universitas Negeri Manado (UNIMA)',
    periode_aktif: '2024/2025',
    email_kontak: 'himaif@unima.ac.id',
    instagram: '@himaif_unima',
    visi: 'Menjadi himpunan mahasiswa yang inovatif, berdedikasi, dan berkontribusi nyata bagi pengembangan ilmu teknologi informasi di lingkungan Universitas Negeri Manado.',
    misi: '1. Meningkatkan kompetensi akademik dan non-akademik anggota.\n2. Memfasilitasi pengembangan bakat dan minat di bidang teknologi.\n3. Membangun jejaring dan kolaborasi antar sivitas akademika.\n4. Mendorong riset dan inovasi teknologi mahasiswa.\n5. Menjadi wadah aspirasi dan komunikasi antara mahasiswa dengan institusi.',
    visi_prodi: 'Menjadi program studi unggulan yang menghasilkan lulusan kompeten, inovatif, dan berdaya saing global di bidang teknologi informasi.',
    misi_prodi: '1. Menyelenggarakan pendidikan berkualitas tinggi di bidang teknik informatika.\n2. Mendorong penelitian yang relevan dengan kebutuhan industri.\n3. Membangun kemitraan dengan industri dan institusi dalam dan luar negeri.\n4. Mengembangkan karakter mahasiswa yang profesional dan berintegritas.',
  }
};

// ===== TOAST SYSTEM =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success:'✅', error:'❌', info:'ℹ️', warning:'⚠️' };
  toast.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100%)'; toast.style.transition = 'all 0.3s'; setTimeout(() => toast.remove(), 300); }, 3500);
}

// ===== NAVIGATION =====
function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const target = document.getElementById(`page-${page}`);
  if (target) { target.classList.add('active'); STATE.currentPage = page; }
  document.querySelectorAll(`.nav-item[data-page="${page}"]`).forEach(n => n.classList.add('active'));
  document.getElementById('topbar-title').textContent = getPageTitle(page);
  // Close sidebar on mobile
  document.querySelector('.sidebar').classList.remove('open');
  // Scroll to top
  document.querySelector('.main-content').scrollTo(0,0);
  // Render page content
  renderPage(page);
}

function getPageTitle(page) {
  const titles = {
    home:'Beranda', about:'Tentang HIMAIF', pengurus:'Data Pengurus', arsip:'Arsip & LPJ',
    proker:'Program Kerja', achievement:'Pencapaian', materi:'Bank Materi', projects:'Galeri Project',
    blog:'Tech Blog', rapat:'Catatan Rapat', aspirasi:'Kotak Aspirasi', dashboard:'Dashboard',
    admin:'Panel Admin', settings:'Pengaturan',
  };
  return titles[page] || 'HIMAIF';
}

function renderPage(page) {
  switch(page) {
    case 'home': renderHome(); break;
    case 'pengurus': renderPengurus(); break;
    case 'dashboard': renderDashboard(); break;
    case 'proker': renderProker(); break;
    case 'achievement': renderAchievement(); break;
    case 'materi': renderMateri(); break;
    case 'projects': renderProjects(); break;
    case 'blog': renderBlog(); break;
    case 'rapat': renderRapat(); break;
    case 'aspirasi': renderAspirasi(); break;
    case 'arsip': renderArsip(); break;
    case 'admin': renderAdmin(); break;
  }
}

// ===== HOME PAGE =====
function renderHome() {
  const news = DATA.news;
  const featured = news.find(n => n.featured);
  const rest = news.filter(n => !n.featured);

  document.getElementById('home-news').innerHTML = `
    <div class="news-grid">
      ${featured ? `
        <div class="news-card featured" onclick="showToast('Fitur baca selengkapnya akan segera hadir!','info')">
          <div class="news-img">${featured.emoji}</div>
          <div class="news-body">
            <div class="news-cat">${featured.kategori}</div>
            <div class="news-title">${featured.judul}</div>
            <div class="news-excerpt">${featured.excerpt}</div>
            <div class="news-meta"><span>📅 ${featured.tanggal}</span><span>→ Baca Selengkapnya</span></div>
          </div>
        </div>` : ''}
      ${rest.map(n => `
        <div class="news-card" onclick="showToast('Fitur baca selengkapnya akan segera hadir!','info')">
          <div class="news-img" style="height:140px;font-size:40px;">${n.emoji}</div>
          <div class="news-body">
            <div class="news-cat">${n.kategori}</div>
            <div class="news-title" style="font-size:15px;">${n.judul}</div>
            <div class="news-meta"><span>📅 ${n.tanggal}</span></div>
          </div>
        </div>`).join('')}
    </div>`;

  // Quick stats
  document.getElementById('home-stats').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card blue"><div class="stat-icon">👥</div><div class="stat-value">${DATA.pengurus['2024/2025'].length}</div><div class="stat-label">Pengurus Aktif</div></div>
      <div class="stat-card amber"><div class="stat-icon">📋</div><div class="stat-value">${DATA.proker.length}</div><div class="stat-label">Program Kerja</div></div>
      <div class="stat-card green"><div class="stat-icon">🏆</div><div class="stat-value">${DATA.achievements.length}</div><div class="stat-label">Pencapaian</div></div>
      <div class="stat-card purple"><div class="stat-icon">💡</div><div class="stat-value">${DATA.projects.length}</div><div class="stat-label">Project Mahasiswa</div></div>
    </div>`;
}

// ===== PENGURUS PAGE =====
function renderPengurus() {
  const periode = STATE.activePeriode;
  const data = DATA.pengurus[periode] || [];
  renderOrg(data, periode);
  renderPengurusList(data);
}

function renderOrg(data, periode) {
  const inti = data.filter(d => d.divisi === 'Inti');
  const divs = [...new Set(data.filter(d => d.divisi !== 'Inti').map(d => d.divisi))];

  document.getElementById('org-chart-wrap').innerHTML = `
    <div style="text-align:center;margin-bottom:8px;">
      <span class="badge badge-amber">Periode ${periode}</span>
    </div>
    <!-- Inti -->
    <div style="text-align:center;margin-bottom:8px;font-size:11px;font-weight:700;letter-spacing:0.1em;color:var(--text-dim);text-transform:uppercase;">Inti Himpunan</div>
    <div class="org-level">
      ${inti.map(m => orgCard(m)).join('')}
    </div>
    <!-- Divisi -->
    <div style="text-align:center;margin-bottom:8px;font-size:11px;font-weight:700;letter-spacing:0.1em;color:var(--text-dim);text-transform:uppercase;">Divisi-Divisi</div>
    ${divs.map(div => {
      const members = data.filter(d => d.divisi === div);
      return `
        <div style="margin-bottom:28px;">
          <div style="text-align:center;margin-bottom:12px;">
            <span class="badge badge-blue">${div}</span>
          </div>
          <div class="org-level">
            ${members.map(m => orgCard(m)).join('')}
          </div>
        </div>`;
    }).join('')}`;
}

function orgCard(m) {
  const initials = m.nama.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
  return `
    <div class="org-card" onclick="openMemberDetail(${m.id})">
      <div class="org-avatar">${initials}</div>
      <div class="org-name">${m.nama.split(' ')[0]}</div>
      <div class="org-role">${m.jabatan}</div>
      <div class="org-div">${m.divisi !== 'Inti' ? m.divisi : ''}</div>
      <div class="org-tooltip">
        <h4>${m.nama}</h4>
        <p>📋 ${m.jabatan} — ${m.divisi}</p>
        <p>🎓 NIM: ${m.nim}</p>
        <p>📚 Semester ${m.semester}</p>
        ${m.desc ? `<p style="margin-top:6px;font-style:italic;">"${m.desc}"</p>` : ''}
        ${m.linkedin ? `<p>🔗 LinkedIn</p>` : ''}
        <p style="margin-top:8px;color:var(--accent);font-size:11px;">Klik untuk detail lengkap →</p>
      </div>
    </div>`;
}

function renderPengurusList(data) {
  document.getElementById('pengurus-table').innerHTML = `
    <table>
      <thead><tr>
        <th>Nama</th><th>NIM</th><th>Divisi</th><th>Jabatan</th>
        <th>Semester</th><th>Tgl Lahir</th>${STATE.isAdmin ? '<th>Aksi</th>' : ''}
      </tr></thead>
      <tbody>
        ${data.map(m => `
          <tr onclick="openMemberDetail(${m.id})" style="cursor:pointer;">
            <td>
              <div class="flex items-center gap-2">
                <div class="avatar">${m.nama.split(' ').map(n=>n[0]).join('').substring(0,2)}</div>
                <span class="font-bold">${m.nama}</span>
              </div>
            </td>
            <td class="font-mono text-sm">${m.nim}</td>
            <td><span class="badge badge-blue">${m.divisi}</span></td>
            <td>${m.jabatan}</td>
            <td>${m.semester}</td>
            <td>${formatDate(m.tl)}</td>
            ${STATE.isAdmin ? `<td onclick="event.stopPropagation()">
              <button class="btn btn-ghost btn-sm" onclick="editMember(${m.id})">✏️ Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deleteMember(${m.id})">🗑️</button>
            </td>` : ''}
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function openMemberDetail(id) {
  const periode = STATE.activePeriode;
  const data = DATA.pengurus[periode] || [];
  const m = data.find(x => x.id === id);
  if (!m) return;
  const initials = m.nama.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase();
  document.getElementById('member-modal-content').innerHTML = `
    <div style="text-align:center;margin-bottom:24px;">
      <div class="avatar avatar-xl" style="margin:0 auto 16px;">${initials}</div>
      <h2 style="font-family:var(--font-display);font-size:22px;font-weight:800;">${m.nama}</h2>
      <span class="badge badge-amber">${m.jabatan}</span>
      <span class="badge badge-blue" style="margin-left:6px;">${m.divisi}</span>
    </div>
    <div class="grid-2" style="gap:12px;">
      <div class="card" style="padding:16px;"><div class="text-xs text-muted mb-1">NIM</div><div class="font-mono font-bold">${m.nim}</div></div>
      <div class="card" style="padding:16px;"><div class="text-xs text-muted mb-1">Semester</div><div class="font-bold">${m.semester}</div></div>
      <div class="card" style="padding:16px;"><div class="text-xs text-muted mb-1">Tanggal Lahir</div><div class="font-bold">${formatDate(m.tl)}</div></div>
      <div class="card" style="padding:16px;"><div class="text-xs text-muted mb-1">Periode</div><div class="font-bold">${periode}</div></div>
    </div>
    ${m.desc ? `<div style="margin-top:16px;padding:16px;background:var(--bg-3);border-radius:var(--radius);font-style:italic;color:var(--text-muted);">"${m.desc}"</div>` : ''}
    ${m.linkedin ? `<div style="margin-top:12px;"><a href="${m.linkedin}" class="btn btn-ghost btn-sm" target="_blank">🔗 LinkedIn</a></div>` : ''}`;
  openModal('member-modal');
}

// ===== PROKER =====
function renderProker() {
  const statusLabels = { aktif:'Belum Dimulai', sedang_berjalan:'Sedang Berjalan', selesai:'Selesai', dibatalkan:'Dibatalkan' };
  const statusColors = { aktif:'badge-blue', sedang_berjalan:'badge-amber', selesai:'badge-green', dibatalkan:'badge-red' };
  const progColors = { aktif:'var(--primary-light)', sedang_berjalan:'var(--accent)', selesai:'var(--secondary)', dibatalkan:'var(--danger)' };

  const filter = document.getElementById('proker-filter')?.value || 'all';
  const data = filter === 'all' ? DATA.proker : DATA.proker.filter(p => p.status === filter);

  document.getElementById('proker-list').innerHTML = data.map(p => `
    <div class="proker-card">
      <div style="flex:1;min-width:0;">
        <div class="flex items-center gap-3 mb-2">
          <span class="font-bold" style="font-size:15px;">${p.nama}</span>
          <span class="badge ${statusColors[p.status]}">${statusLabels[p.status]}</span>
        </div>
        <div class="text-sm text-muted mb-2">${p.deskripsi}</div>
        <div class="flex gap-4 text-xs text-muted mb-2">
          <span>📁 ${p.divisi}</span>
          <span>👤 ${p.ketua}</span>
          <span>📅 ${formatDate(p.target_tanggal)}</span>
          <span>💰 Rp ${p.anggaran.toLocaleString('id')}</span>
        </div>
        <div class="proker-progress">
          <div class="proker-progress-bar" style="width:${p.progress}%;background:${progColors[p.status]};"></div>
        </div>
        <div class="text-xs text-muted mt-1">${p.progress}% selesai</div>
      </div>
      ${STATE.isAdmin ? `
        <div style="flex-shrink:0;display:flex;flex-direction:column;gap:6px;">
          <button class="btn btn-ghost btn-sm" onclick="editProker(${p.id})">✏️ Edit</button>
          <button class="btn btn-danger btn-sm">🗑️</button>
        </div>` : ''}
    </div>`).join('') || '<div style="text-align:center;padding:40px;color:var(--text-muted);">Tidak ada data.</div>';

  // Stats
  const counts = { total: DATA.proker.length, aktif: DATA.proker.filter(p=>p.status==='aktif').length, sedang: DATA.proker.filter(p=>p.status==='sedang_berjalan').length, selesai: DATA.proker.filter(p=>p.status==='selesai').length, batal: DATA.proker.filter(p=>p.status==='dibatalkan').length };
  document.getElementById('proker-stats').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card blue"><div class="stat-icon">📋</div><div class="stat-value">${counts.total}</div><div class="stat-label">Total Proker</div></div>
      <div class="stat-card amber"><div class="stat-icon">⚡</div><div class="stat-value">${counts.sedang}</div><div class="stat-label">Sedang Berjalan</div></div>
      <div class="stat-card green"><div class="stat-icon">✅</div><div class="stat-value">${counts.selesai}</div><div class="stat-label">Selesai</div></div>
      <div class="stat-card red"><div class="stat-icon">❌</div><div class="stat-value">${counts.batal}</div><div class="stat-label">Dibatalkan</div></div>
    </div>`;
}

// ===== ACHIEVEMENT =====
function renderAchievement() {
  const cats = ['Semua', ...new Set(DATA.achievements.map(a=>a.kategori))];
  document.getElementById('ach-filters').innerHTML = cats.map((c,i) => `
    <button class="filter-chip ${i===0?'active':''}" onclick="filterAch('${c}',this)">${c}</button>`).join('');
  renderAchList('Semua');
}

function filterAch(cat, btn) {
  document.querySelectorAll('#ach-filters .filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAchList(cat);
}

function renderAchList(cat) {
  const data = cat === 'Semua' ? DATA.achievements : DATA.achievements.filter(a => a.kategori === cat);
  document.getElementById('ach-list').innerHTML = `
    <div class="achievement-grid">
      ${data.map(a => `
        <div class="achievement-card">
          <div class="achievement-medal">${a.medal}</div>
          <div class="achievement-title">${a.prestasi}</div>
          <div class="achievement-name">👤 ${a.nama}</div>
          <div class="achievement-desc">📌 ${a.kategori} &bull; 🌐 ${a.level}</div>
          <div class="achievement-date">📅 ${formatDate(a.tanggal)}</div>
        </div>`).join('')}
    </div>`;
}

// ===== MATERI =====
function renderMateri() {
  const cats = ['Semua', ...new Set(DATA.materi.map(m=>m.kategori))];
  document.getElementById('materi-filters').innerHTML = cats.map((c,i) => `
    <button class="filter-chip ${i===0?'active':''}" onclick="filterMateri('${c}',this)">${c}</button>`).join('');
  renderMateriList('Semua');
}

function filterMateri(cat, btn) {
  document.querySelectorAll('#materi-filters .filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMateriList(cat);
}

function renderMateriList(cat) {
  const data = cat === 'Semua' ? DATA.materi : DATA.materi.filter(m => m.kategori === cat);
  document.getElementById('materi-list').innerHTML = `
    <div class="materi-grid">
      ${data.map(m => `
        <div class="materi-card" onclick="showToast('Mengunduh: ${m.judul}','success')">
          <div class="materi-icon">${m.icon}</div>
          <div class="materi-title">${m.judul}</div>
          <div class="materi-desc">${m.deskripsi}</div>
          <div class="materi-tags">${m.tags.map(t=>`<span class="badge badge-blue">${t}</span>`).join('')}</div>
          <div class="flex justify-between mt-3 text-xs text-muted">
            <span>📦 ${m.ukuran}</span>
            <span>📅 ${formatDate(m.diupload)}</span>
          </div>
          <button class="btn btn-primary btn-sm mt-3" style="width:100%;">⬇️ Download</button>
        </div>`).join('')}
    </div>`;
}

// ===== PROJECTS =====
function renderProjects() {
  document.getElementById('project-list').innerHTML = `
    <div class="project-grid">
      ${DATA.projects.map(p => `
        <div class="project-card">
          <div class="project-preview">${p.icon}</div>
          <div class="project-card-body">
            <div class="flex items-center gap-2 mb-1">
              <span class="project-title">${p.nama}</span>
            </div>
            <div class="project-author">👤 ${p.pembuat} &bull; Angkatan ${p.angkatan}</div>
            <div class="text-sm text-muted mb-3">${p.desc}</div>
            <div class="project-tags">${p.tags.map(t=>`<span class="badge badge-purple">${t}</span>`).join('')}</div>
            <div class="flex gap-2 mt-3">
              <button class="btn btn-ghost btn-sm" onclick="showToast('Demo tidak tersedia','info')">👁️ Demo</button>
              <button class="btn btn-ghost btn-sm" onclick="showToast('Repo tidak tersedia','info')">💻 Repo</button>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
}

// ===== BLOG =====
function renderBlog() {
  const isAdmin = STATE.isAdmin;
  const data = isAdmin ? DATA.blog : DATA.blog.filter(b => b.status === 'published');
  document.getElementById('blog-list').innerHTML = `
    <div class="blog-grid">
      ${data.map(b => `
        <div class="blog-card">
          <div class="blog-card-img">${b.emoji}</div>
          <div class="blog-card-body">
            ${isAdmin && b.status === 'pending' ? '<span class="badge badge-amber mb-2">⏳ Menunggu Review</span><br>' : ''}
            <div class="blog-card-title">${b.judul}</div>
            <div class="blog-card-excerpt">${b.excerpt}</div>
            <div class="blog-card-meta">
              <span>✍️ ${b.penulis}</span>
              <span>📅 ${formatDate(b.tanggal)}</span>
              ${b.status === 'published' ? `<span>👁️ ${b.views}</span>` : ''}
            </div>
            <div class="flex gap-2 mt-3">
              ${b.tags.map(t=>`<span class="badge badge-gray">${t}</span>`).join('')}
            </div>
            ${isAdmin && b.status === 'pending' ? `
              <div class="flex gap-2 mt-3">
                <button class="btn btn-success btn-sm" onclick="approveBlog(${b.id})">✅ Approve</button>
                <button class="btn btn-danger btn-sm" onclick="rejectBlog(${b.id})">❌ Tolak</button>
              </div>` : ''}
          </div>
        </div>`).join('')}
    </div>`;
}

function approveBlog(id) {
  const b = DATA.blog.find(b => b.id === id);
  if (b) { b.status = 'published'; b.views = 0; renderBlog(); showToast(`Artikel "${b.judul}" disetujui!`, 'success'); }
}
function rejectBlog(id) {
  DATA.blog = DATA.blog.filter(b => b.id !== id);
  renderBlog();
  showToast('Artikel ditolak dan dihapus.', 'error');
}

// ===== RAPAT =====
function renderRapat() {
  document.getElementById('rapat-list').innerHTML = DATA.rapat.map(r => `
    <div class="rapat-item" onclick="openRapatDetail(${r.id})">
      <div class="rapat-item-header">
        <div>
          <div class="rapat-title">${r.judul}</div>
          <div class="rapat-meta mt-1">
            <span>📅 ${formatDate(r.tanggal)}</span>
            <span>🕐 ${r.waktu}</span>
            <span>📍 ${r.tempat}</span>
            <span class="badge badge-blue">${r.jenis}</span>
          </div>
        </div>
        <div style="text-align:right;">
          <div class="font-bold text-success">${r.hadir}/${r.total}</div>
          <div class="text-xs text-muted">Kehadiran</div>
          ${r.spontan > 0 ? `<div class="text-xs text-accent mt-1">💰 Rp ${r.spontan.toLocaleString('id')}</div>` : ''}
        </div>
      </div>
      <div class="text-sm text-muted">${r.summary}</div>
    </div>`).join('');
}

function openRapatDetail(id) {
  const r = DATA.rapat.find(x => x.id === id);
  if (!r) return;
  document.getElementById('rapat-modal-content').innerHTML = `
    <div class="stats-grid mb-4">
      <div class="stat-card green" style="padding:16px;"><div class="stat-value" style="font-size:28px;">${r.hadir}/${r.total}</div><div class="stat-label">Kehadiran</div></div>
      <div class="stat-card amber" style="padding:16px;"><div class="stat-value" style="font-size:24px;">Rp ${r.spontan.toLocaleString('id')}</div><div class="stat-label">Total Spontan</div></div>
    </div>
    <div class="grid-2 mb-4">
      <div><div class="form-label">Tanggal</div><div>📅 ${formatDate(r.tanggal)}</div></div>
      <div><div class="form-label">Waktu</div><div>🕐 ${r.waktu}</div></div>
      <div><div class="form-label">Tempat</div><div>📍 ${r.tempat}</div></div>
      <div><div class="form-label">Notulis</div><div>✍️ ${r.notulis}</div></div>
    </div>
    <div class="form-label">Ringkasan Rapat</div>
    <div style="background:var(--bg-3);padding:16px;border-radius:var(--radius);line-height:1.8;color:var(--text-muted);">${r.summary}</div>
    <div class="flex gap-2 mt-4">
      <button class="btn btn-ghost btn-sm" onclick="exportRapat(${r.id})">📥 Export PDF</button>
    </div>`;
  openModal('rapat-modal');
}

function exportRapat(id) { showToast('Mengekspor catatan rapat ke PDF...', 'info'); }

// ===== ASPIRASI =====
function renderAspirasi() {
  const cats = ['Semua', ...new Set(DATA.aspirasi.map(a=>a.kategori))];
  document.getElementById('asp-filters').innerHTML = cats.map((c,i) => `
    <button class="filter-chip ${i===0?'active':''}" onclick="filterAsp('${c}',this)">${c}</button>`).join('');
  renderAspList('Semua');
}

function filterAsp(cat, btn) {
  document.querySelectorAll('#asp-filters .filter-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAspList(cat);
}

function renderAspList(cat) {
  const isAdmin = STATE.isAdmin;
  const statusColor = { ditinjau:'badge-amber', diterima:'badge-green', diproses:'badge-blue' };
  const data = cat === 'Semua' ? DATA.aspirasi : DATA.aspirasi.filter(a => a.kategori === cat);
  document.getElementById('asp-list').innerHTML = data.map(a => `
    <div class="aspirasi-card">
      <div class="flex items-center gap-2 mb-2">
        <span class="badge badge-gray">${a.kategori}</span>
        <span class="badge ${statusColor[a.status]||'badge-gray'}">${a.status}</span>
      </div>
      <div class="aspirasi-text">${a.pesan}</div>
      <div class="aspirasi-meta">
        <span>🕐 ${formatDate(a.tanggal)}</span>
        ${isAdmin ? `<span style="color:var(--text-dim);">Anonim</span>` : ''}
      </div>
      ${isAdmin ? `<div class="flex gap-2 mt-3">
        <select class="form-control" style="width:auto;padding:6px 12px;font-size:12px;" onchange="updateAsp(${a.id},this.value)">
          <option value="ditinjau" ${a.status==='ditinjau'?'selected':''}>Ditinjau</option>
          <option value="diproses" ${a.status==='diproses'?'selected':''}>Diproses</option>
          <option value="diterima" ${a.status==='diterima'?'selected':''}>Diterima</option>
        </select>
      </div>` : ''}
    </div>`).join('');
}

function updateAsp(id, status) {
  const a = DATA.aspirasi.find(x => x.id === id);
  if (a) { a.status = status; showToast('Status aspirasi diperbarui.', 'success'); renderAspirasi(); }
}

// ===== ARSIP =====
function renderArsip() {
  const periodeFilter = document.getElementById('arsip-periode-filter')?.value || 'all';

  // Pengurus arsip
  const periodes = DATA.periodes.filter(p => p !== STATE.activePeriode);
  document.getElementById('arsip-pengurus-list').innerHTML = `
    <div class="filter-bar">
      <select class="form-control" style="width:auto;" id="arsip-periode-filter" onchange="renderArsip()">
        <option value="all">Semua Periode</option>
        ${periodes.map(p => `<option value="${p}">${p}</option>`).join('')}
      </select>
    </div>
    ${periodes.filter(p => periodeFilter === 'all' || p === periodeFilter).map(p => {
      const members = DATA.pengurus[p] || [];
      return members.length ? `
        <div class="card mb-4">
          <div class="card-header"><span class="font-display font-bold">📁 Periode ${p}</span> <span class="badge badge-gray">${members.length} anggota</span></div>
          <div class="card-body" style="padding:0;">
            <table style="width:100%;">
              <thead><tr><th>Nama</th><th>NIM</th><th>Jabatan</th><th>Divisi</th></tr></thead>
              <tbody>${members.map(m => `
                <tr><td><b>${m.nama}</b></td><td class="font-mono text-sm">${m.nim}</td><td>${m.jabatan}</td><td>${m.divisi}</td></tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>` : '';
    }).join('')}`;

  // LPJ
  document.getElementById('arsip-lpj-list').innerHTML = DATA.lpj.map(l => `
    <div class="card mb-3">
      <div class="card-body" style="display:flex;align-items:center;gap:16px;">
        <div style="font-size:36px;">📄</div>
        <div style="flex:1;">
          <div class="font-bold mb-1">${l.judul}</div>
          <div class="text-sm text-muted">${l.desc}</div>
          <div class="flex gap-3 mt-2 text-xs text-muted">
            <span>📅 ${formatDate(l.tanggal)}</span>
            <span>📁 ${l.divisi}</span>
            <span>💾 ${l.size}</span>
          </div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="showToast('Mengunduh ${l.file}...','info')">⬇️ Download</button>
      </div>
    </div>`).join('');
}

// ===== DASHBOARD =====
function renderDashboard() {
  const totalPengurus = Object.values(DATA.pengurus).reduce((s,a) => s + a.length, 0);
  document.getElementById('dashboard-stats').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card blue"><div class="stat-icon">👥</div><div class="stat-value">${DATA.pengurus[STATE.activePeriode]?.length || 0}</div><div class="stat-label">Pengurus Aktif</div><div class="stat-trend up">▲ Periode ${STATE.activePeriode}</div></div>
      <div class="stat-card amber"><div class="stat-icon">📋</div><div class="stat-value">${DATA.proker.length}</div><div class="stat-label">Total Proker</div><div class="stat-trend up">${DATA.proker.filter(p=>p.status==='selesai').length} selesai</div></div>
      <div class="stat-card green"><div class="stat-icon">🏆</div><div class="stat-value">${DATA.achievements.length}</div><div class="stat-label">Pencapaian</div><div class="stat-trend up">▲ +2 bulan ini</div></div>
      <div class="stat-card purple"><div class="stat-icon">💡</div><div class="stat-value">${DATA.projects.length}</div><div class="stat-label">Project</div><div class="stat-trend up">▲ Aktif terus</div></div>
      <div class="stat-card red"><div class="stat-icon">📢</div><div class="stat-value">${DATA.aspirasi.length}</div><div class="stat-label">Aspirasi Masuk</div><div class="stat-trend">${DATA.aspirasi.filter(a=>a.status==='ditinjau').length} menunggu</div></div>
      <div class="stat-card blue"><div class="stat-icon">📝</div><div class="stat-value">${DATA.rapat.length}</div><div class="stat-label">Rapat Tercatat</div></div>
      <div class="stat-card amber"><div class="stat-icon">📚</div><div class="stat-value">${DATA.materi.length}</div><div class="stat-label">Bank Materi</div></div>
      <div class="stat-card green"><div class="stat-icon">✍️</div><div class="stat-value">${DATA.blog.filter(b=>b.status==='published').length}</div><div class="stat-label">Artikel Blog</div></div>
    </div>
    <div class="grid-2 mt-4">
      <div class="card">
        <div class="card-header"><span class="font-bold">Status Program Kerja</span></div>
        <div class="card-body">
          ${['aktif','sedang_berjalan','selesai','dibatalkan'].map(s => {
            const n = DATA.proker.filter(p=>p.status===s).length;
            const pct = Math.round(n/DATA.proker.length*100);
            const colors = {aktif:'var(--primary-light)',sedang_berjalan:'var(--accent)',selesai:'var(--secondary)',dibatalkan:'var(--danger)'};
            const labels = {aktif:'Belum Mulai',sedang_berjalan:'Berjalan',selesai:'Selesai',dibatalkan:'Dibatalkan'};
            return `<div class="mb-3">
              <div class="flex justify-between text-sm mb-1"><span>${labels[s]}</span><span>${n} (${pct}%)</span></div>
              <div style="height:6px;background:var(--bg-3);border-radius:3px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:${colors[s]};border-radius:3px;transition:width 0.5s;"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><span class="font-bold">Aspirasi Overview</span></div>
        <div class="card-body">
          ${DATA.aspirasi.map(a => `
            <div class="flex items-center gap-3 mb-3">
              <div style="width:8px;height:8px;border-radius:50%;background:${a.status==='diterima'?'var(--secondary)':a.status==='diproses'?'var(--accent)':'var(--primary-light)'};flex-shrink:0;"></div>
              <div style="flex:1;min-width:0;">
                <div class="text-sm" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${a.pesan.substring(0,60)}...</div>
                <div class="text-xs text-muted">${a.kategori} &bull; ${a.status}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

// ===== ADMIN =====
function renderAdmin() {
  if (!STATE.isAdmin) {
    document.getElementById('admin-content').innerHTML = `
      <div style="text-align:center;padding:80px 40px;">
        <div style="font-size:64px;margin-bottom:20px;">🔐</div>
        <h2 style="font-family:var(--font-display);font-size:24px;margin-bottom:8px;">Akses Admin Diperlukan</h2>
        <p style="color:var(--text-muted);margin-bottom:24px;">Anda harus login sebagai admin untuk mengakses halaman ini.</p>
        <button class="btn btn-primary" onclick="openModal('login-modal')">🔑 Login Admin</button>
      </div>`;
    return;
  }
  document.getElementById('admin-content').innerHTML = `
    <div class="admin-indicator">
      <div class="admin-dot"></div>
      <span>Mode Admin Aktif — Semua konten dapat diedit.</span>
      <button class="btn btn-danger btn-sm" style="margin-left:auto;" onclick="adminLogout()">Logout</button>
    </div>
    <div class="tabs" id="admin-tabs">
      <button class="tab-btn active" onclick="switchAdminTab('pengurus',this)">👥 Pengurus</button>
      <button class="tab-btn" onclick="switchAdminTab('proker',this)">📋 Proker</button>
      <button class="tab-btn" onclick="switchAdminTab('content',this)">📝 Konten</button>
      <button class="tab-btn" onclick="switchAdminTab('settings',this)">⚙️ Pengaturan</button>
      <button class="tab-btn" onclick="switchAdminTab('export',this)">📥 Export</button>
    </div>
    <div id="admin-tab-content"></div>`;
  switchAdminTab('pengurus', document.querySelector('#admin-tabs .tab-btn'));
}

function switchAdminTab(tab, btn) {
  document.querySelectorAll('#admin-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const ct = document.getElementById('admin-tab-content');

  if (tab === 'pengurus') {
    ct.innerHTML = `
      <div class="section-header">
        <div><div class="section-title">Kelola Pengurus</div></div>
        <div class="flex gap-2">
          <select class="form-control" style="width:auto;" id="admin-periode" onchange="renderAdminPengurus()">
            ${DATA.periodes.map(p=>`<option value="${p}" ${p===STATE.activePeriode?'selected':''}>${p}</option>`).join('')}
          </select>
          <button class="btn btn-primary" onclick="openAddPengurusModal()">+ Tambah Pengurus</button>
        </div>
      </div>
      <div id="admin-pengurus-table" class="table-wrap"></div>`;
    renderAdminPengurus();
  } else if (tab === 'proker') {
    ct.innerHTML = `
      <div class="section-header">
        <div class="section-title">Kelola Program Kerja</div>
        <button class="btn btn-primary" onclick="openAddProkerModal()">+ Tambah Proker</button>
      </div>
      <div id="admin-proker-table" class="table-wrap"></div>`;
    renderAdminProker();
  } else if (tab === 'content') {
    ct.innerHTML = `
      <div class="section-title mb-4">Kelola Konten</div>
      <div class="grid-2">
        <div class="card"><div class="card-body">
          <div class="font-bold mb-3">📰 Berita/News</div>
          ${DATA.news.map(n=>`<div class="flex justify-between items-center mb-3 p-3" style="background:var(--bg-3);border-radius:8px;">
            <div><div class="font-bold text-sm">${n.judul}</div><span class="badge badge-gray">${n.kategori}</span></div>
            <button class="btn btn-ghost btn-sm" onclick="showToast('Edit fitur segera hadir','info')">✏️</button>
          </div>`).join('')}
          <button class="btn btn-primary btn-sm mt-2">+ Tambah Berita</button>
        </div></div>
        <div class="card"><div class="card-body">
          <div class="font-bold mb-3">✍️ Blog Pending Review</div>
          ${DATA.blog.filter(b=>b.status==='pending').map(b=>`
            <div class="mb-3 p-3" style="background:var(--bg-3);border-radius:8px;">
              <div class="font-bold text-sm mb-2">${b.judul}</div>
              <div class="text-xs text-muted mb-2">oleh ${b.penulis}</div>
              <div class="flex gap-2">
                <button class="btn btn-success btn-sm" onclick="approveBlog(${b.id});renderAdmin()">✅ Approve</button>
                <button class="btn btn-danger btn-sm" onclick="rejectBlog(${b.id});renderAdmin()">❌ Tolak</button>
              </div>
            </div>`).join('') || '<div class="text-muted text-sm">Tidak ada artikel pending.</div>'}
        </div></div>
      </div>`;
  } else if (tab === 'settings') {
    ct.innerHTML = `
      <div class="section-title mb-4">Pengaturan Website</div>
      <div class="grid-2">
        <div class="card"><div class="card-body">
          <div class="font-bold mb-4">Informasi Umum</div>
          ${Object.entries({
            nama_prodi:'Nama Prodi', nama_universitas:'Universitas', email_kontak:'Email Kontak', instagram:'Instagram', periode_aktif:'Periode Aktif'
          }).map(([k,l])=>`
            <div class="form-group">
              <label class="form-label">${l}</label>
              <input type="text" class="form-control" value="${DATA.settings[k]}" onchange="DATA.settings['${k}']=this.value">
            </div>`).join('')}
          <button class="btn btn-primary" onclick="showToast('Pengaturan disimpan!','success')">💾 Simpan</button>
        </div></div>
        <div class="card"><div class="card-body">
          <div class="font-bold mb-4">Visi & Misi HIMAIF</div>
          <div class="form-group">
            <label class="form-label">Visi</label>
            <textarea class="form-control" rows="3" onchange="DATA.settings.visi=this.value">${DATA.settings.visi}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Misi</label>
            <textarea class="form-control" rows="5" onchange="DATA.settings.misi=this.value">${DATA.settings.misi}</textarea>
          </div>
          <button class="btn btn-primary" onclick="showToast('Visi misi disimpan!','success')">💾 Simpan</button>
        </div></div>
      </div>`;
  } else if (tab === 'export') {
    ct.innerHTML = `
      <div class="section-title mb-4">Export Data</div>
      <div class="grid-3">
        ${[
          { label:'Data Pengurus Aktif', icon:'👥', formats:['PDF','Excel'] },
          { label:'Semua Arsip Pengurus', icon:'📁', formats:['PDF','Excel'] },
          { label:'Laporan LPJ', icon:'📄', formats:['PDF'] },
          { label:'Program Kerja', icon:'📋', formats:['PDF','Excel'] },
          { label:'Pencapaian Prodi', icon:'🏆', formats:['PDF','Excel'] },
          { label:'Catatan Rapat', icon:'📝', formats:['PDF'] },
          { label:'Statistik Dashboard', icon:'📊', formats:['PDF'] },
          { label:'Data Aspirasi', icon:'📢', formats:['PDF','Excel'] },
          { label:'Bank Materi', icon:'📚', formats:['Excel'] },
        ].map(e => `
          <div class="card"><div class="card-body" style="text-align:center;">
            <div style="font-size:40px;margin-bottom:12px;">${e.icon}</div>
            <div class="font-bold mb-3">${e.label}</div>
            <div class="flex gap-2 justify-between">
              ${e.formats.includes('PDF')?`<button class="btn btn-primary btn-sm" style="flex:1;" onclick="showToast('Mengekspor ke PDF...','info')">📄 PDF</button>`:''}
              ${e.formats.includes('Excel')?`<button class="btn btn-ghost btn-sm" style="flex:1;" onclick="showToast('Mengekspor ke Excel...','info')">📊 Excel</button>`:''}
            </div>
          </div></div>`).join('')}
      </div>`;
  }
}

function renderAdminPengurus() {
  const p = document.getElementById('admin-periode')?.value || STATE.activePeriode;
  const data = DATA.pengurus[p] || [];
  document.getElementById('admin-pengurus-table').innerHTML = `
    <table>
      <thead><tr><th>Nama</th><th>NIM</th><th>Divisi</th><th>Jabatan</th><th>Semester</th><th>Aksi</th></tr></thead>
      <tbody>
        ${data.map(m => `
          <tr>
            <td class="font-bold">${m.nama}</td>
            <td class="font-mono text-sm">${m.nim}</td>
            <td><span class="badge badge-blue">${m.divisi}</span></td>
            <td>${m.jabatan}</td>
            <td>${m.semester}</td>
            <td>
              <button class="btn btn-ghost btn-sm" onclick="editMemberAdmin(${m.id})">✏️</button>
              <button class="btn btn-danger btn-sm" onclick="deleteMember(${m.id})">🗑️</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function renderAdminProker() {
  const statusColors = { aktif:'badge-blue', sedang_berjalan:'badge-amber', selesai:'badge-green', dibatalkan:'badge-red' };
  document.getElementById('admin-proker-table').innerHTML = `
    <table>
      <thead><tr><th>Nama</th><th>Divisi</th><th>Ketua</th><th>Target</th><th>Progress</th><th>Status</th><th>Aksi</th></tr></thead>
      <tbody>
        ${DATA.proker.map(p => `
          <tr>
            <td class="font-bold">${p.nama}</td>
            <td>${p.divisi}</td>
            <td>${p.ketua}</td>
            <td>${formatDate(p.target_tanggal)}</td>
            <td>${p.progress}%</td>
            <td><span class="badge ${statusColors[p.status]}">${p.status.replace('_',' ')}</span></td>
            <td>
              <button class="btn btn-ghost btn-sm" onclick="showToast('Edit proker segera hadir','info')">✏️</button>
              <button class="btn btn-danger btn-sm" onclick="showToast('Proker dihapus','error')">🗑️</button>
            </td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}

function openAddPengurusModal() {
  document.getElementById('add-pengurus-modal-content').innerHTML = `
    <div class="grid-2">
      <div class="form-group"><label class="form-label">Nama Lengkap *</label><input type="text" class="form-control" id="new-nama" placeholder="Nama lengkap..."></div>
      <div class="form-group"><label class="form-label">NIM *</label><input type="text" class="form-control" id="new-nim" placeholder="NIM..."></div>
      <div class="form-group"><label class="form-label">Divisi *</label>
        <select class="form-control" id="new-divisi">
          <option>Inti</option><option>Akademik & Keilmuan</option><option>PSDM</option>
          <option>Kominfo</option><option>Mikat</option><option>Kewirausahaan</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Jabatan *</label>
        <select class="form-control" id="new-jabatan">
          <option>Ketua Umum</option><option>Wakil Ketua</option><option>Sekretaris Umum</option>
          <option>Bendahara Umum</option><option>Kepala Divisi</option><option>Sekretaris</option>
          <option>Bendahara</option><option>Anggota</option>
        </select>
      </div>
      <div class="form-group"><label class="form-label">Tanggal Lahir</label><input type="date" class="form-control" id="new-tl"></div>
      <div class="form-group"><label class="form-label">Semester</label><input type="number" class="form-control" id="new-sem" min="1" max="14" placeholder="Semester..."></div>
    </div>
    <div class="form-group"><label class="form-label">Deskripsi / Bio Singkat</label><textarea class="form-control" id="new-desc" placeholder="Bio singkat..." rows="3"></textarea></div>
    <div class="form-group"><label class="form-label">LinkedIn URL</label><input type="text" class="form-control" id="new-linkedin" placeholder="https://linkedin.com/in/..."></div>`;
  openModal('add-pengurus-modal');
}

function saveNewPengurus() {
  const nama = document.getElementById('new-nama').value.trim();
  const nim = document.getElementById('new-nim').value.trim();
  if (!nama || !nim) { showToast('Nama dan NIM wajib diisi!', 'error'); return; }
  const periode = STATE.activePeriode;
  if (!DATA.pengurus[periode]) DATA.pengurus[periode] = [];
  const newId = Math.max(...Object.values(DATA.pengurus).flat().map(m=>m.id), 0) + 1;
  DATA.pengurus[periode].push({
    id: newId, nama, nim,
    divisi: document.getElementById('new-divisi').value,
    jabatan: document.getElementById('new-jabatan').value,
    tl: document.getElementById('new-tl').value,
    semester: parseInt(document.getElementById('new-sem').value) || 1,
    desc: document.getElementById('new-desc').value,
    linkedin: document.getElementById('new-linkedin').value,
    img: '',
  });
  closeModal('add-pengurus-modal');
  showToast(`Pengurus ${nama} berhasil ditambahkan!`, 'success');
  renderAdmin();
}

function deleteMember(id) {
  if (!confirm('Hapus pengurus ini?')) return;
  for (const p of Object.keys(DATA.pengurus)) {
    DATA.pengurus[p] = DATA.pengurus[p].filter(m => m.id !== id);
  }
  showToast('Pengurus dihapus.', 'error');
  renderAdmin();
  renderPengurus();
}

function editMemberAdmin(id) { showToast('Fitur edit akan segera hadir!', 'info'); }
function editMember(id) { showToast('Fitur edit akan segera hadir!', 'info'); }
function editProker(id) { showToast('Fitur edit proker akan segera hadir!', 'info'); }
function openAddProkerModal() { showToast('Fitur tambah proker akan segera hadir!', 'info'); }

// ===== AUTH =====
function adminLogin() {
  const pwd = document.getElementById('admin-pwd').value;
  if (pwd === 'h1m41fun1m42017') {
    STATE.isAdmin = true;
    closeModal('login-modal');
    showToast('Login berhasil! Selamat datang, Admin.', 'success');
    document.getElementById('admin-login-btn').textContent = '🔓 Admin';
    document.getElementById('admin-login-btn').style.color = 'var(--accent)';
    renderPage(STATE.currentPage);
  } else {
    showToast('Password salah!', 'error');
    document.getElementById('admin-pwd').style.borderColor = 'var(--danger)';
  }
}

function adminLogout() {
  STATE.isAdmin = false;
  showToast('Berhasil logout.', 'info');
  document.getElementById('admin-login-btn').textContent = '🔑 Admin';
  document.getElementById('admin-login-btn').style.color = '';
  navigate('home');
}

// ===== MODALS =====
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') document.querySelectorAll('.modal-overlay.open').forEach(m => { m.classList.remove('open'); document.body.style.overflow = ''; }); });

// ===== UTILS =====
function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', { day:'2-digit', month:'long', year:'numeric' });
  } catch { return dateStr; }
}

// ===== SUBMIT ASPIRASI =====
function submitAspirasi() {
  const pesan = document.getElementById('asp-pesan').value.trim();
  const kat = document.getElementById('asp-kategori').value;
  if (!pesan) { showToast('Pesan tidak boleh kosong!', 'error'); return; }
  DATA.aspirasi.unshift({
    id: DATA.aspirasi.length + 1,
    pesan, kategori: kat,
    tanggal: new Date().toISOString().split('T')[0],
    status: 'ditinjau'
  });
  document.getElementById('asp-pesan').value = '';
  showToast('Aspirasi berhasil dikirim! Identitas Anda terlindungi.', 'success');
  renderAspirasi();
}

// ===== SUBMIT BLOG =====
function submitBlog() {
  const judul = document.getElementById('blog-judul').value.trim();
  const isi = document.getElementById('blog-isi').value.trim();
  const penulis = document.getElementById('blog-penulis').value.trim();
  if (!judul || !isi || !penulis) { showToast('Semua field wajib diisi!', 'error'); return; }
  DATA.blog.unshift({
    id: DATA.blog.length + 1, judul, penulis,
    divisi: document.getElementById('blog-divisi').value,
    tanggal: new Date().toISOString().split('T')[0],
    tags: [], excerpt: isi.substring(0, 150) + '...',
    status: 'pending', emoji: '📝', views: 0
  });
  closeModal('submit-blog-modal');
  document.getElementById('blog-judul').value = '';
  document.getElementById('blog-isi').value = '';
  document.getElementById('blog-penulis').value = '';
  showToast('Artikel terkirim! Menunggu review admin.', 'success');
}

// ===== SUBMIT RAPAT =====
function submitRapat() {
  const judul = document.getElementById('rapat-judul').value.trim();
  if (!judul) { showToast('Judul rapat wajib diisi!', 'error'); return; }
  DATA.rapat.unshift({
    id: DATA.rapat.length + 1,
    judul,
    tanggal: document.getElementById('rapat-tanggal').value,
    waktu: document.getElementById('rapat-waktu').value,
    tempat: document.getElementById('rapat-tempat').value,
    jenis: document.getElementById('rapat-jenis').value,
    hadir: parseInt(document.getElementById('rapat-hadir').value) || 0,
    total: parseInt(document.getElementById('rapat-total').value) || 0,
    spontan: parseInt(document.getElementById('rapat-spontan').value) || 0,
    notulis: document.getElementById('rapat-notulis').value,
    docs: [],
    summary: document.getElementById('rapat-summary').value,
  });
  closeModal('add-rapat-modal');
  showToast('Catatan rapat berhasil disimpan!', 'success');
  renderRapat();
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  // Mobile sidebar toggle
  const menuBtn = document.getElementById('menu-toggle');
  if (menuBtn) menuBtn.addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));

  // Login form
  const pwdInput = document.getElementById('admin-pwd');
  if (pwdInput) pwdInput.addEventListener('keydown', e => { if (e.key === 'Enter') adminLogin(); });

  // Start on home
  navigate('home');
});