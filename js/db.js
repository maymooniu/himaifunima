// =============================================================
// HIMAIF — Supabase Database Layer (v2 - with auth)
// =============================================================

const SUPABASE_URL = 'https://wpizplmqhvdhwklumdsw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YNsK8JOSnKfwpzAj_nme0g_YEYgFNLc';

let _supabase = null;
function getSupabase() {
  if (!_supabase) {
    // Supabase v2 UMD exposes window.supabase = { createClient }
    const _sdk = (typeof window !== 'undefined' && window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
    if (!_sdk) throw new Error('Supabase SDK belum dimuat. Periksa koneksi internet.');
    _supabase = _sdk.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _supabase;
}

// ============================================================
// GENERIC HELPERS
// ============================================================
async function dbSelect(table, opts = {}) {
  const sb = getSupabase();
  let q = sb.from(table).select(opts.select || '*');
  if (opts.eq) Object.entries(opts.eq).forEach(([k,v]) => { q = q.eq(k, v); });
  if (opts.neq) Object.entries(opts.neq).forEach(([k,v]) => { q = q.neq(k, v); });
  if (opts.in) Object.entries(opts.in).forEach(([k,v]) => { q = q.in(k, v); });
  if (opts.filters) opts.filters.forEach(f => { q = q.filter(f[0], f[1], f[2]); });
  if (opts.order) q = q.order(opts.order[0], { ascending: opts.order[1] ?? true });
  if (opts.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}
async function dbInsert(table, payload) {
  const sb = getSupabase();
  const { data, error } = await sb.from(table).insert(payload).select();
  if (error) throw error;
  return data;
}
async function dbUpdate(table, id, payload) {
  const sb = getSupabase();
  const { data, error } = await sb.from(table).update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).select();
  if (error) throw error;
  return data;
}
async function dbDelete(table, id) {
  const sb = getSupabase();
  const { error } = await sb.from(table).delete().eq('id', id);
  if (error) throw error;
  return true;
}
async function dbUpsertSetting(key, value) {
  const sb = getSupabase();
  const { error } = await sb.from('settings').upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ============================================================
// AUTH
// ============================================================
const DB_AUTH = {
  async login(username, password) {
    const rows = await dbSelect('app_users', {
      eq: { username: username.trim().toLowerCase(), password_hash: password, is_active: true },
      select: 'id,username,role,display_name',
    });
    if (!rows || rows.length === 0) return null;
    return rows[0]; // { id, username, role, display_name }
  },
  async getAll() {
    return dbSelect('app_users', { order: ['created_at', true] });
  },
  async add(data) { return dbInsert('app_users', data); },
  async update(id, data) { return dbUpdate('app_users', id, data); },
  async delete(id) { return dbDelete('app_users', id); },
  async changePassword(id, newPassword) {
    return dbUpdate('app_users', id, { password_hash: newPassword });
  },
};

// ============================================================
// DOMAIN QUERIES
// ============================================================
const DB = {
  // Settings
  async getSettings() {
    const rows = await dbSelect('settings');
    return Object.fromEntries(rows.map(r => [r.key, r.value]));
  },
  async saveSetting(key, value) { return dbUpsertSetting(key, value); },

  // Periodes
  async getPeriodes() { return dbSelect('periodes', { order: ['nama', false] }); },
  async getActivePeriode() {
    const rows = await dbSelect('periodes', { eq: { is_active: true }, limit: 1 });
    return rows[0] || null;
  },

  // Pengurus
  async getPengurus(periode) {
    return dbSelect('pengurus', { eq: { periode }, order: ['urutan', true] });
  },
  async getAllPengurus() { return dbSelect('pengurus', { order: ['periode', false] }); },
  async addPengurus(data) { return dbInsert('pengurus', data); },
  async updatePengurus(id, data) { return dbUpdate('pengurus', id, data); },
  async deletePengurus(id) { return dbDelete('pengurus', id); },

  // Program Kerja
  async getProker(periode, status) {
    const opts = { order: ['created_at', false] };
    opts.eq = {};
    if (periode) opts.eq.periode = periode;
    if (status) opts.eq.status = status;
    if (!Object.keys(opts.eq).length) delete opts.eq;
    return dbSelect('program_kerja', opts);
  },
  async addProker(data) { return dbInsert('program_kerja', data); },
  async updateProker(id, data) { return dbUpdate('program_kerja', id, data); },
  async deleteProker(id) { return dbDelete('program_kerja', id); },

  // Pencapaian
  async getPencapaian() { return dbSelect('pencapaian', { order: ['tanggal', false] }); },
  async addPencapaian(data) { return dbInsert('pencapaian', data); },
  async deletePencapaian(id) { return dbDelete('pencapaian', id); },

  // Bank Materi
  async getMateri(kategori) {
    const opts = { order: ['created_at', false] };
    if (kategori) opts.eq = { kategori };
    return dbSelect('bank_materi', opts);
  },
  async addMateri(data) { return dbInsert('bank_materi', data); },
  async deleteMateri(id) { return dbDelete('bank_materi', id); },

  // Galeri Project
  async getProjects(kategori) {
    const opts = { order: ['created_at', false] };
    if (kategori) opts.eq = { kategori };
    return dbSelect('galeri_project', opts);
  },
  async addProject(data) { return dbInsert('galeri_project', data); },
  async deleteProject(id) { return dbDelete('galeri_project', id); },

  // Tech Blog
  async getBlog(isAdmin) {
    if (isAdmin) return dbSelect('tech_blog', { order: ['created_at', false] });
    return dbSelect('tech_blog', { eq: { status: 'published' }, order: ['published_at', false] });
  },
  async addBlog(data) { return dbInsert('tech_blog', data); },
  async approveBlog(id) { return dbUpdate('tech_blog', id, { status: 'published', published_at: new Date().toISOString(), views: 0 }); },
  async rejectBlog(id) { return dbUpdate('tech_blog', id, { status: 'ditolak' }); },
  async deleteBlog(id) { return dbDelete('tech_blog', id); },

  // Catatan Rapat
  async getRapat() { return dbSelect('catatan_rapat', { order: ['tanggal', false] }); },
  async addRapat(data) { return dbInsert('catatan_rapat', data); },
  async updateRapat(id, data) { return dbUpdate('catatan_rapat', id, data); },
  async deleteRapat(id) { return dbDelete('catatan_rapat', id); },

  // Aspirasi
  async getAspirasi() { return dbSelect('aspirasi', { order: ['created_at', false] }); },
  async addAspirasi(data) { return dbInsert('aspirasi', { ...data, status: 'ditinjau' }); },
  async updateAspirasiStatus(id, status, catatan) { return dbUpdate('aspirasi', id, { status, catatan_admin: catatan }); },
  async deleteAspirasi(id) { return dbDelete('aspirasi', id); },

  // Arsip LPJ
  async getLPJ(periode) {
    const opts = { order: ['tanggal', false] };
    if (periode) opts.eq = { periode };
    return dbSelect('arsip_lpj', opts);
  },
  async addLPJ(data) { return dbInsert('arsip_lpj', data); },
  async deleteLPJ(id) { return dbDelete('arsip_lpj', id); },

  // Arsip Kegiatan
  async getKegiatan(periode) {
    const opts = { order: ['tanggal', false] };
    if (periode) opts.eq = { periode };
    return dbSelect('arsip_kegiatan', opts);
  },
  async addKegiatan(data) { return dbInsert('arsip_kegiatan', data); },

  // Berita
  async getBerita() { return dbSelect('berita', { order: ['published_at', false] }); },
  async addBerita(data) { return dbInsert('berita', data); },
  async updateBerita(id, data) { return dbUpdate('berita', id, data); },
  async deleteBerita(id) { return dbDelete('berita', id); },

  // Dashboard
  async getDashboardStats(periode) {
    const [pengurus, proker, pencapaian, projects, blog, rapat, aspirasi, materi] = await Promise.all([
      dbSelect('pengurus', { eq: { periode }, select: 'id' }),
      dbSelect('program_kerja', { eq: { periode }, select: 'id,status,progress' }),
      dbSelect('pencapaian', { select: 'id,level' }),
      dbSelect('galeri_project', { select: 'id' }),
      dbSelect('tech_blog', { eq: { status: 'published' }, select: 'id,views' }),
      dbSelect('catatan_rapat', { select: 'id,jumlah_hadir,jumlah_total,total_spontan' }),
      dbSelect('aspirasi', { select: 'id,status' }),
      dbSelect('bank_materi', { select: 'id' }),
    ]);
    return { pengurus, proker, pencapaian, projects, blog, rapat, aspirasi, materi };
  },
};