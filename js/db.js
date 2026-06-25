// =============================================================
// HIMAIF v2 — Supabase Database Layer
// =============================================================

const SUPABASE_URL = 'https://wpizplmqhvdhwklumdsw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YNsK8JOSnKfwpzAj_nme0g_YEYgFNLc';

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

  // Bank Materi
  async getMateri() { return dbQuery('bank_materi', { order: ['created_at', false] }); },
  async addMateri(data)       { return dbInsert('bank_materi', data); },
  async deleteMateri(id)      { return dbDelete('bank_materi', id); },

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
  async addAspirasi(data)     { return dbInsert('aspirasi', { ...data, status: 'ditinjau' }); },
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
    const [pengurus, proker, pencapaian, projects, blog, rapat, aspirasi, materi, berita] =
      await Promise.all([
        dbQuery('pengurus',      { eq: { periode }, select: 'id' }),
        dbQuery('program_kerja', { eq: { periode }, select: 'id,status,progress' }),
        dbQuery('pencapaian',    { select: 'id,level' }),
        dbQuery('galeri_project',{ select: 'id' }),
        dbQuery('tech_blog',     { eq: { status: 'published' }, select: 'id,views' }),
        dbQuery('catatan_rapat', { select: 'id,jumlah_hadir,jumlah_total,total_spontan,jenis' }),
        dbQuery('aspirasi',      { select: 'id,status' }),
        dbQuery('bank_materi',   { select: 'id' }),
        dbQuery('berita',        { select: 'id' }),
      ]);
    return { pengurus, proker, pencapaian, projects, blog, rapat, aspirasi, materi, berita };
  },
};