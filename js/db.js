// =============================================================
// HIMAIF v2 — Supabase Database Layer
// =============================================================

const SUPABASE_URL = 'https://wpizplmqhvdhwklumdsw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YNsK8JOSnKfwpzAj_nme0g_YEYgFNLc';

const MOCK_GALERI = [
  {
    id: 'g1',
    judul: 'Latihan Kepemimpinan Mahasiswa (LKM) 2025',
    foto_url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80',
    kategori: 'LKM',
    divisi: 'PSDM',
    periode: '2025/2026',
    deskripsi: 'Kegiatan pembentukan karakter dan kepemimpinan calon pengurus HIMAIF.',
    tanggal: '15 Februari 2025'
  },
  {
    id: 'g2',
    judul: 'Malam Kebersamaan HIMAIF',
    foto_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
    kategori: 'Malam Kebersamaan',
    divisi: 'Minat Bakat',
    periode: '2025/2026',
    deskripsi: 'Ajang akrab dan kebersamaan seluruh anggota dan pengurus HIMAIF.',
    tanggal: '20 Januari 2025'
  },
  {
    id: 'g3',
    judul: 'Gathering & Makrab Angkatan',
    foto_url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=800&q=80',
    kategori: 'Gathering',
    divisi: 'Hubungan Masyarakat',
    periode: '2025/2026',
    deskripsi: 'Silaturahmi dan keakraban antar angkatan mahasiswa Teknik Informatika.',
    tanggal: '10 Desember 2024'
  },
  {
    id: 'g4',
    judul: 'Pelatihan Web Development & Supabase',
    foto_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    kategori: 'Pelatihan',
    divisi: 'Akademik',
    periode: '2025/2026',
    deskripsi: 'Workshop pengenalan komputasi awan dan modern web development.',
    tanggal: '05 November 2024'
  },
  {
    id: 'g5',
    judul: 'Musyawarah Kerja (Muker) HIMAIF',
    foto_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    kategori: 'Muker',
    divisi: 'Inti',
    periode: '2025/2026',
    deskripsi: 'Pembahasan program kerja dan arah strategis HIMAIF untuk satu periode.',
    tanggal: '12 Oktober 2024'
  },
  {
    id: 'g6',
    judul: 'Kegiatan Kerohanian & Buka Bersama 2024',
    foto_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
    kategori: 'Gathering',
    divisi: 'Kerohanian',
    periode: '2024/2025',
    deskripsi: 'Kegiatan keagamaan dan silaturahmi divisi Kerohanian periode 2024/2025.',
    tanggal: '25 Maret 2024'
  },
  {
    id: 'g7',
    judul: 'Seminar Akademik & Olimpiade Koding 2024',
    foto_url: 'https://images.unsplash.com/photo-1542744094-3a31727202b3?auto=format&fit=crop&w=800&q=80',
    kategori: 'Pelatihan',
    divisi: 'Akademik & Keilmuan',
    periode: '2024/2025',
    deskripsi: 'Seminar sains dan algoritma oleh divisi Akademik & Keilmuan.',
    tanggal: '14 Mei 2024'
  }
];

let _sb = null;
function getSB() {
  if (!_sb) {
    const sdk = (window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
    if (!sdk) throw new Error('Supabase SDK belum dimuat. Periksa koneksi internet.');
    _sb = sdk.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _sb;
}

// ============================================================
// GENERIC HELPERS
// ============================================================
async function dbQuery(table, opts = {}) {
  const sb = getSB();
  let q = sb.from(table).select(opts.select || '*');
  if (opts.eq)      Object.entries(opts.eq).forEach(([k,v])  => { q = q.eq(k, v); });
  if (opts.neq)     Object.entries(opts.neq).forEach(([k,v]) => { q = q.neq(k, v); });
  if (opts.in)      Object.entries(opts.in).forEach(([k,v])  => { q = q.in(k, v); });
  if (opts.or)      q = q.or(opts.or);
  if (opts.order)   q = q.order(opts.order[0], { ascending: opts.order[1] ?? true });
  if (opts.limit)   q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

async function dbInsert(table, payload) {
  const { data, error } = await getSB().from(table).insert(payload).select();
  if (error) throw error;
  return data;
}

async function dbUpdate(table, id, payload) {
  const { data, error } = await getSB().from(table)
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id).select();
  if (error) throw error;
  return data;
}

async function dbDelete(table, id) {
  const { error } = await getSB().from(table).delete().eq('id', id);
  if (error) throw error;
  return true;
}

async function dbUpsert(table, data, onConflict) {
  const { error } = await getSB().from(table).upsert(data, { onConflict });
  if (error) throw error;
}

// ============================================================
// AUTH
// ============================================================
const DB_AUTH = {
  async login(username, password) {
    const rows = await dbQuery('app_users', {
      eq: { username: username.trim().toLowerCase(), password_hash: password, is_active: true },
      select: 'id,username,role,display_name',
      limit: 1,
    });
    return rows[0] || null;
  },
  async getAll() { return dbQuery('app_users', { order: ['created_at', true] }); },
  async add(data)        { return dbInsert('app_users', data); },
  async update(id, data) { return dbUpdate('app_users', id, data); },
  async delete(id)       { return dbDelete('app_users', id); },
  async changePassword(id, newPwd) {
    return dbUpdate('app_users', id, { password_hash: newPwd });
  },
};

// ============================================================
// DOMAIN LAYER
// ============================================================
const DB = {
  // Settings
  async getSettings() {
    const rows = await dbQuery('settings');
    return Object.fromEntries(rows.map(r => [r.key, r.value]));
  },
  async saveSetting(key, value) {
    await dbUpsert('settings', { key, value, updated_at: new Date().toISOString() }, 'key');
  },

  // Periodes
  async getPeriodes()     { return dbQuery('periodes', { order: ['nama', false] }); },
  async getActivePeriode() {
    const rows = await dbQuery('periodes', { eq: { is_active: true }, limit: 1 });
    return rows[0] || null;
  },
  async addPeriode(data)  { return dbInsert('periodes', data); },
  async deletePeriode(id) { return dbDelete('periodes', id); },

  // Pengurus
  async getPengurus(periode) {
    return dbQuery('pengurus', { eq: { periode }, order: ['urutan', true] });
  },
  async getAllPengurus() { return dbQuery('pengurus', { order: ['periode', false] }); },
  async addPengurus(data)       { return dbInsert('pengurus', data); },
  async updatePengurus(id, data){ return dbUpdate('pengurus', id, data); },
  async deletePengurus(id)      { return dbDelete('pengurus', id); },

  // Program Kerja
  async getProker(periode) {
    return dbQuery('program_kerja', { eq: { periode }, order: ['created_at', false] });
  },
  async addProker(data)        { return dbInsert('program_kerja', data); },
  async updateProker(id, data) { return dbUpdate('program_kerja', id, data); },
  async deleteProker(id)       { return dbDelete('program_kerja', id); },

  // Pencapaian
  async getPencapaian()       { return dbQuery('pencapaian', { order: ['tanggal', false] }); },
  async addPencapaian(data)   { return dbInsert('pencapaian', data); },
  async updatePencapaian(id, data) { return dbUpdate('pencapaian', id, data); },
  async deletePencapaian(id)  { return dbDelete('pencapaian', id); },

  // Galeri Project
  async getProjects(showAll = false) {
    const opts = { order: ['created_at', false] };
    if (!showAll) opts.eq = { status: 'approved' };
    return dbQuery('galeri_project', opts);
  },
  async addProject(data)        { return dbInsert('galeri_project', data); },
  async approveProject(id)      { return dbUpdate('galeri_project', id, { status: 'approved' }); },
  async rejectProject(id)       { return dbUpdate('galeri_project', id, { status: 'rejected' }); },
  async deleteProject(id)       { return dbDelete('galeri_project', id); },

  // Galeri HIMAIF
  async getGaleri() {
    try {
      const data = await dbQuery('galeri_himaif', { order: ['created_at', false] });
      return (data && data.length > 0) ? data : MOCK_GALERI;
    } catch(e) {
      console.warn('[DB] Using fallback MOCK_GALERI:', e.message);
      return MOCK_GALERI;
    }
  },
  async addGaleri(data)   { return dbInsert('galeri_himaif', data); },
  async deleteGaleri(id)  { return dbDelete('galeri_himaif', id); },

  // Tech Blog
  async getBlog(showAll = false) {
    if (showAll) return dbQuery('tech_blog', { order: ['created_at', false] });
    return dbQuery('tech_blog', { eq: { status: 'published' }, order: ['published_at', false] });
  },
  async addBlog(data)       { return dbInsert('tech_blog', data); },
  async approveBlog(id)     { return dbUpdate('tech_blog', id, { status: 'published', published_at: new Date().toISOString() }); },
  async rejectBlog(id)      { return dbUpdate('tech_blog', id, { status: 'ditolak' }); },
  async deleteBlog(id)      { return dbDelete('tech_blog', id); },
  async incrementViews(id, currentViews) { return dbUpdate('tech_blog', id, { views: (currentViews || 0) + 1 }); },

  // Catatan Rapat
  async getRapat()           { return dbQuery('catatan_rapat', { order: ['tanggal', false] }); },
  async addRapat(data)       { return dbInsert('catatan_rapat', data); },
  async updateRapat(id, data){ return dbUpdate('catatan_rapat', id, data); },
  async deleteRapat(id)      { return dbDelete('catatan_rapat', id); },

  // Aspirasi
  async getAspirasi()         { return dbQuery('aspirasi', { order: ['created_at', false] }); },
  async addAspirasi(data)     {
    try {
      return await dbInsert('aspirasi', { ...data, status: 'ditinjau' });
    } catch(e) {
      if (e.message && (e.message.includes('media_url') || e.message.includes('urgensi') || e.message.includes('schema cache'))) {
        const { media_url, urgensi, ...rest } = data;
        return await dbInsert('aspirasi', { ...rest, status: 'ditinjau' });
      }
      throw e;
    }
  },
  async updateAspStatus(id, status, catatan) {
    return dbUpdate('aspirasi', id, { status, catatan_admin: catatan });
  },
  async deleteAspirasi(id)    { return dbDelete('aspirasi', id); },

  // Arsip LPJ
  async getLPJ(periode) {
    const opts = { order: ['tanggal', false] };
    if (periode) opts.eq = { periode };
    return dbQuery('arsip_lpj', opts);
  },
  async addLPJ(data)    { return dbInsert('arsip_lpj', data); },
  async deleteLPJ(id)   { return dbDelete('arsip_lpj', id); },

  // Arsip Kegiatan
  async getKegiatan(periode) {
    const opts = { order: ['tanggal', false] };
    if (periode) opts.eq = { periode };
    return dbQuery('arsip_kegiatan', opts);
  },
  async addKegiatan(data) { return dbInsert('arsip_kegiatan', data); },
  async deleteKegiatan(id){ return dbDelete('arsip_kegiatan', id); },

  // Berita
  async getBerita()         { return dbQuery('berita', { order: ['published_at', false] }); },
  async addBerita(data)     { return dbInsert('berita', { ...data, published_at: new Date().toISOString() }); },
  async updateBerita(id, data) { return dbUpdate('berita', id, data); },
  async deleteBerita(id)    { return dbDelete('berita', id); },

  // Dashboard Stats
  async getDashboardStats(periode) {
    const [pengurus, proker, pencapaian, projects, blog, rapat, aspirasi, berita] =
      await Promise.all([
        dbQuery('pengurus',      { eq: { periode }, select: 'id' }),
        dbQuery('program_kerja', { eq: { periode }, select: 'id,status,progress' }),
        dbQuery('pencapaian',    { select: 'id,level' }),
        dbQuery('galeri_project',{ select: 'id' }),
        dbQuery('tech_blog',     { eq: { status: 'published' }, select: 'id,views' }),
        dbQuery('catatan_rapat', { select: 'id,jumlah_hadir,jumlah_total,total_spontan,jenis' }),
        dbQuery('aspirasi',      { select: 'id,status' }),
        dbQuery('berita',        { select: 'id' }),
      ]);
    return { pengurus, proker, pencapaian, projects, blog, rapat, aspirasi, berita };
  },
};