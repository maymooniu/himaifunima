// =============================================================
<<<<<<< HEAD
// HIMAIF v2 — Supabase Database Layer
=======
// HIMAIF — Supabase Database Layer (v2 - with auth)
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
// =============================================================

const SUPABASE_URL = 'https://wpizplmqhvdhwklumdsw.supabase.co';
const SUPABASE_KEY = 'sb_publishable_YNsK8JOSnKfwpzAj_nme0g_YEYgFNLc';

<<<<<<< HEAD
let _sb = null;
function getSB() {
  if (!_sb) {
    const sdk = (window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
    if (!sdk) throw new Error('Supabase SDK belum dimuat. Periksa koneksi internet.');
    _sb = sdk.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _sb;
=======
let _supabase = null;
function getSupabase() {
  if (!_supabase) {
    // Supabase v2 UMD exposes window.supabase = { createClient }
    const _sdk = (typeof window !== 'undefined' && window.supabase) ? window.supabase : (typeof supabase !== 'undefined' ? supabase : null);
    if (!_sdk) throw new Error('Supabase SDK belum dimuat. Periksa koneksi internet.');
    _supabase = _sdk.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _supabase;
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
}

// ============================================================
// GENERIC HELPERS
// ============================================================
<<<<<<< HEAD
async function dbQuery(table, opts = {}) {
  const sb = getSB();
  let q = sb.from(table).select(opts.select || '*');
  if (opts.eq)      Object.entries(opts.eq).forEach(([k,v])  => { q = q.eq(k, v); });
  if (opts.neq)     Object.entries(opts.neq).forEach(([k,v]) => { q = q.neq(k, v); });
  if (opts.in)      Object.entries(opts.in).forEach(([k,v])  => { q = q.in(k, v); });
  if (opts.or)      q = q.or(opts.or);
  if (opts.order)   q = q.order(opts.order[0], { ascending: opts.order[1] ?? true });
  if (opts.limit)   q = q.limit(opts.limit);
=======
async function dbSelect(table, opts = {}) {
  const sb = getSupabase();
  let q = sb.from(table).select(opts.select || '*');
  if (opts.eq) Object.entries(opts.eq).forEach(([k,v]) => { q = q.eq(k, v); });
  if (opts.neq) Object.entries(opts.neq).forEach(([k,v]) => { q = q.neq(k, v); });
  if (opts.in) Object.entries(opts.in).forEach(([k,v]) => { q = q.in(k, v); });
  if (opts.filters) opts.filters.forEach(f => { q = q.filter(f[0], f[1], f[2]); });
  if (opts.order) q = q.order(opts.order[0], { ascending: opts.order[1] ?? true });
  if (opts.limit) q = q.limit(opts.limit);
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}
<<<<<<< HEAD

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
=======
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
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
  if (error) throw error;
}

// ============================================================
// AUTH
// ============================================================
const DB_AUTH = {
  async login(username, password) {
<<<<<<< HEAD
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
=======
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
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
  },
};

// ============================================================
<<<<<<< HEAD
// DOMAIN LAYER
=======
// DOMAIN QUERIES
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
// ============================================================
const DB = {
  // Settings
  async getSettings() {
<<<<<<< HEAD
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
=======
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
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4

  // Arsip LPJ
  async getLPJ(periode) {
    const opts = { order: ['tanggal', false] };
    if (periode) opts.eq = { periode };
<<<<<<< HEAD
    return dbQuery('arsip_lpj', opts);
  },
  async addLPJ(data)    { return dbInsert('arsip_lpj', data); },
  async deleteLPJ(id)   { return dbDelete('arsip_lpj', id); },
=======
    return dbSelect('arsip_lpj', opts);
  },
  async addLPJ(data) { return dbInsert('arsip_lpj', data); },
  async deleteLPJ(id) { return dbDelete('arsip_lpj', id); },
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4

  // Arsip Kegiatan
  async getKegiatan(periode) {
    const opts = { order: ['tanggal', false] };
    if (periode) opts.eq = { periode };
<<<<<<< HEAD
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
=======
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
>>>>>>> b1ee9714edc73cdd6e489cc26cf42ea1305a56a4
  },
};