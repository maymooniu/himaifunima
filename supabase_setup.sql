-- =============================================================================
-- HIMAIF Website v2 — Supabase Database Setup
-- Jalankan file ini di Supabase SQL Editor (https://supabase.com/dashboard)
-- =============================================================================

-- ============================================================================
-- ENABLE UUID EXTENSION
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================================
-- TABLE: app_users  (3 roles: admin | pengurus | user)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app_users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username      TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin','pengurus','user')),
  display_name  TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default users
INSERT INTO app_users (username, password_hash, role, display_name, is_active)
VALUES
  ('admin',    'h1m41fun1m42017', 'admin',    'Administrator HIMAIF', TRUE),
  ('pengurus', 'j4y4l4hh1m41f',   'pengurus', 'Pengurus HIMAIF',      TRUE)
ON CONFLICT (username) DO NOTHING;


-- ============================================================================
-- TABLE: settings
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key        TEXT NOT NULL UNIQUE,
  value      TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO settings (key, value) VALUES
  ('nama_prodi',        'Teknik Informatika'),
  ('nama_universitas',  'Universitas Negeri Manado (UNIMA)'),
  ('email_kontak',      'himaif@unima.ac.id'),
  ('instagram',         '@himaif_unima'),
  ('logo_url',          ''),
  ('periode_aktif',     '2024/2025'),
  ('tentang_himaif',    'HIMAIF (Himpunan Mahasiswa Teknik Informatika) adalah organisasi kemahasiswaan resmi yang mewadahi seluruh mahasiswa Program Studi Teknik Informatika Universitas Negeri Manado.'),
  ('visi_himaif',       'Menjadi himpunan mahasiswa yang inovatif, berdedikasi, dan berkontribusi nyata bagi pengembangan ilmu teknologi informasi di lingkungan Universitas Negeri Manado.'),
  ('misi_himaif',       '1. Meningkatkan kompetensi akademik dan non-akademik anggota.\n2. Memfasilitasi pengembangan bakat dan minat di bidang teknologi.\n3. Membangun jejaring dan kolaborasi antar sivitas akademika.\n4. Mendorong riset dan inovasi teknologi mahasiswa.\n5. Menjadi wadah aspirasi dan komunikasi antara mahasiswa dengan institusi.'),
  ('visi_prodi',        'Menjadi program studi unggulan yang menghasilkan lulusan kompeten, inovatif, dan berdaya saing global di bidang teknologi informasi.'),
  ('misi_prodi',        '1. Menyelenggarakan pendidikan berkualitas tinggi di bidang teknik informatika.\n2. Mendorong penelitian yang relevan dengan kebutuhan industri.\n3. Membangun kemitraan dengan industri dan institusi dalam dan luar negeri.\n4. Mengembangkan karakter mahasiswa yang profesional dan berintegritas.')
ON CONFLICT (key) DO NOTHING;


-- ============================================================================
-- TABLE: periodes
-- ============================================================================
CREATE TABLE IF NOT EXISTS periodes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama       TEXT NOT NULL UNIQUE,
  is_active  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO periodes (nama, is_active) VALUES
  ('2024/2025', TRUE),
  ('2023/2024', FALSE),
  ('2022/2023', FALSE),
  ('2021/2022', FALSE)
ON CONFLICT (nama) DO NOTHING;


-- ============================================================================
-- TABLE: pengurus
-- ============================================================================
CREATE TABLE IF NOT EXISTS pengurus (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama          TEXT NOT NULL,
  nim           TEXT NOT NULL,
  divisi        TEXT NOT NULL DEFAULT 'Inti',
  jabatan       TEXT NOT NULL DEFAULT 'Anggota',
  tanggal_lahir DATE,
  semester      INT DEFAULT 1,
  periode       TEXT NOT NULL,
  urutan        INT DEFAULT 99,
  bio           TEXT,
  linkedin_url  TEXT,
  foto_url      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pengurus_periode ON pengurus(periode);
CREATE INDEX IF NOT EXISTS idx_pengurus_urutan  ON pengurus(urutan);


-- ============================================================================
-- TABLE: program_kerja
-- ============================================================================
CREATE TABLE IF NOT EXISTS program_kerja (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama           TEXT NOT NULL,
  divisi         TEXT NOT NULL,
  ketua          TEXT,
  deskripsi      TEXT,
  status         TEXT NOT NULL DEFAULT 'aktif'
                   CHECK (status IN ('aktif','sedang_berjalan','selesai','dibatalkan')),
  progress       INT NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  target_tanggal DATE,
  anggaran       BIGINT DEFAULT 0,
  periode        TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_proker_periode ON program_kerja(periode);
CREATE INDEX IF NOT EXISTS idx_proker_status  ON program_kerja(status);


-- ============================================================================
-- TABLE: pencapaian
-- ============================================================================
CREATE TABLE IF NOT EXISTS pencapaian (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama       TEXT NOT NULL,
  prestasi   TEXT NOT NULL,
  kategori   TEXT,
  level      TEXT NOT NULL DEFAULT 'Nasional'
               CHECK (level IN ('Prodi','Regional','Nasional','Internasional')),
  tanggal    DATE,
  medal      TEXT DEFAULT '🏆',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- TABLE: bank_materi
-- ============================================================================
CREATE TABLE IF NOT EXISTS bank_materi (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul      TEXT NOT NULL,
  kategori   TEXT NOT NULL DEFAULT 'Referensi',
  deskripsi  TEXT,
  tags       TEXT,
  icon       TEXT DEFAULT '📄',
  ukuran     TEXT,
  file_url   TEXT,
  uploader   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- TABLE: galeri_project
-- ============================================================================
CREATE TABLE IF NOT EXISTS galeri_project (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama       TEXT NOT NULL,
  pembuat    TEXT NOT NULL,
  angkatan   INT,
  kategori   TEXT NOT NULL DEFAULT 'Web App',
  deskripsi  TEXT,
  tags       TEXT,
  icon       TEXT DEFAULT '💻',
  demo_url   TEXT,
  repo_url   TEXT,
  status     TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_project_status ON galeri_project(status);


-- ============================================================================
-- TABLE: tech_blog
-- ============================================================================
CREATE TABLE IF NOT EXISTS tech_blog (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul        TEXT NOT NULL,
  penulis      TEXT NOT NULL,
  divisi       TEXT,
  isi          TEXT NOT NULL,
  emoji        TEXT DEFAULT '📝',
  tags         TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','published','ditolak')),
  views        INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_blog_status ON tech_blog(status);


-- ============================================================================
-- TABLE: catatan_rapat
-- ============================================================================
CREATE TABLE IF NOT EXISTS catatan_rapat (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul          TEXT NOT NULL,
  tanggal        DATE NOT NULL,
  waktu_mulai    TIME,
  waktu_selesai  TIME,
  tempat         TEXT,
  jenis          TEXT NOT NULL DEFAULT 'Bulanan'
                   CHECK (jenis IN ('Bulanan','Mingguan','Divisi','Besar','Darurat','Evaluasi')),
  jumlah_hadir   INT DEFAULT 0,
  jumlah_total   INT DEFAULT 0,
  total_spontan  BIGINT DEFAULT 0,
  notulis        TEXT,
  pimpinan_rapat TEXT,
  agenda         TEXT,
  notulen        TEXT,
  kesimpulan     TEXT,
  tindak_lanjut  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rapat_tanggal ON catatan_rapat(tanggal DESC);


-- ============================================================================
-- TABLE: aspirasi  (anonymous — no user_id by design)
-- ============================================================================
CREATE TABLE IF NOT EXISTS aspirasi (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kategori      TEXT NOT NULL DEFAULT 'Umum',
  urgensi       TEXT DEFAULT 'sedang',
  pesan         TEXT NOT NULL,
  media_url     TEXT,
  status        TEXT NOT NULL DEFAULT 'ditinjau'
                  CHECK (status IN ('ditinjau','diproses','diterima','ditolak')),
  catatan_admin TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================================
-- TABLE: arsip_lpj
-- ============================================================================
CREATE TABLE IF NOT EXISTS arsip_lpj (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul      TEXT NOT NULL,
  periode    TEXT NOT NULL,
  divisi     TEXT NOT NULL DEFAULT 'Semua Divisi',
  deskripsi  TEXT,
  tanggal    DATE,
  ukuran     TEXT,
  file_url   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lpj_periode ON arsip_lpj(periode);


-- ============================================================================
-- TABLE: arsip_kegiatan
-- ============================================================================
CREATE TABLE IF NOT EXISTS arsip_kegiatan (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul      TEXT NOT NULL,
  divisi     TEXT,
  deskripsi  TEXT,
  tanggal    DATE,
  periode    TEXT,
  emoji      TEXT DEFAULT '📸',
  ada_lpj    BOOLEAN DEFAULT FALSE,
  foto_urls  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_kegiatan_periode ON arsip_kegiatan(periode);


-- ============================================================================
-- TABLE: berita
-- ============================================================================
CREATE TABLE IF NOT EXISTS berita (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul        TEXT NOT NULL,
  kategori     TEXT NOT NULL DEFAULT 'Umum',
  excerpt      TEXT,
  konten       TEXT,
  emoji        TEXT DEFAULT '📰',
  penulis      TEXT DEFAULT 'Admin HIMAIF',
  is_featured  BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_berita_published ON berita(published_at DESC);


-- TABLE: galeri_himaif
CREATE TABLE IF NOT EXISTS galeri_himaif (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul       TEXT NOT NULL,
  foto_url    TEXT NOT NULL,
  kategori    TEXT NOT NULL,
  divisi      TEXT DEFAULT 'Inti',
  periode     TEXT DEFAULT '2025/2026',
  deskripsi   TEXT,
  tanggal     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_galeri_created ON galeri_himaif(created_at DESC);

-- ============================================================================
-- DISABLE RLS & GRANT ACCESS
-- ============================================================================
ALTER TABLE app_users        DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings         DISABLE ROW LEVEL SECURITY;
ALTER TABLE periodes         DISABLE ROW LEVEL SECURITY;
ALTER TABLE pengurus         DISABLE ROW LEVEL SECURITY;
ALTER TABLE program_kerja    DISABLE ROW LEVEL SECURITY;
ALTER TABLE pencapaian       DISABLE ROW LEVEL SECURITY;
ALTER TABLE bank_materi      DISABLE ROW LEVEL SECURITY;
ALTER TABLE galeri_project   DISABLE ROW LEVEL SECURITY;
ALTER TABLE galeri_himaif    DISABLE ROW LEVEL SECURITY;
ALTER TABLE tech_blog        DISABLE ROW LEVEL SECURITY;
ALTER TABLE catatan_rapat    DISABLE ROW LEVEL SECURITY;
ALTER TABLE aspirasi         DISABLE ROW LEVEL SECURITY;
ALTER TABLE arsip_lpj        DISABLE ROW LEVEL SECURITY;
ALTER TABLE arsip_kegiatan   DISABLE ROW LEVEL SECURITY;
ALTER TABLE berita           DISABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ============================================================================
-- SELESAI!
-- Admin: username=admin  | password=h1m41fun1m42017
-- Pengurus: username=pengurus | password=j4y4l4hh1m41f
-- ============================================================================
