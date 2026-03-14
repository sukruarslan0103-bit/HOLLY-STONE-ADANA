// ============================================
// supabase.js — TAM TEMİZ SÜRÜM
// GitHub Pages + Supabase uyumlu
// localStorage yok
// Auth var
// subscribe var
// ============================================

// ============================================
// ADIM 1: BU 2 SATIRI GERÇEK DEĞERLE DOLDUR
// Supabase Dashboard > Settings > API
// ============================================
const SUPABASE_URL = 'https://ualbywwyqhqvurhhojae.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_76bkRuaLc5NxzZNSuoSbQw_IjthPho4'; // eyJ... ile başlar

if (!window.supabase) {
  throw new Error('Supabase CDN yüklenmemiş. index.html script sırasını kontrol et.');
}

const { createClient } = window.supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global erişim
window.sb = sb;

// ============================================
// ORTAK YARDIMCILAR
// ============================================
function handleError(error, context = 'Supabase işlemi') {
  if (error) {
    console.error(`${context} hatası:`, error);
    throw error;
  }
}

function cleanRow(row) {
  if (!row || typeof row !== 'object') return row;
  const cleaned = { ...row };
  delete cleaned.id;
  delete cleaned.created_at;
  delete cleaned.updated_at;
  return cleaned;
}

function createRealtimeSubscriber(tableName) {
  return function subscribe(callback) {
    const channel = sb
      .channel(`realtime:${tableName}:${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        async () => {
          try {
            const rows = await this.getAll();
            callback(rows);
          } catch (err) {
            console.error(`${tableName} subscribe refresh hatası:`, err);
          }
        }
      )
      .subscribe();

    return () => {
      sb.removeChannel(channel);
    };
  };
}

// ============================================
// AUTH
// ============================================
const Auth = {
  async signIn(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    handleError(error, 'Giriş');
    return data;
  },

  async signOut() {
    const { error } = await sb.auth.signOut();
    handleError(error, 'Çıkış');
  },

  async getUser() {
    const { data, error } = await sb.auth.getUser();
    handleError(error, 'Kullanıcı bilgisi');
    return data?.user || null;
  },

  onAuthChange(callback) {
    const { data } = sb.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }
};

window.Auth = Auth;

// ============================================
// GÜNLÜK SATIŞ
// ============================================
const GunlukSatis = {
  async getAll() {
    const { data, error } = await sb
      .from('gunluk_satis')
      .select('*')
      .order('tarih', { ascending: false })
      .order('created_at', { ascending: false });

    handleError(error, 'GunlukSatis.getAll');
    return data || [];
  },

  async add(row) {
    const { data, error } = await sb
      .from('gunluk_satis')
      .insert([cleanRow(row)])
      .select()
      .single();

    handleError(error, 'GunlukSatis.add');
    return data;
  },

  async update(id, row) {
    const { data, error } = await sb
      .from('gunluk_satis')
      .update(cleanRow(row))
      .eq('id', id)
      .select()
      .single();

    handleError(error, 'GunlukSatis.update');
    return data;
  },

  async delete(id) {
    const { error } = await sb.from('gunluk_satis').delete().eq('id', id);
    handleError(error, 'GunlukSatis.delete');
  },

  subscribe: createRealtimeSubscriber('gunluk_satis')
};

window.GunlukSatis = GunlukSatis;

// ============================================
// KONSERLER
// ============================================
const Konserler = {
  async getAll() {
    const { data, error } = await sb
      .from('konserler')
      .select('*')
      .order('tarih', { ascending: false })
      .order('created_at', { ascending: false });

    handleError(error, 'Konserler.getAll');
    return data || [];
  },

  async add(row) {
    const { data, error } = await sb
      .from('konserler')
      .insert([cleanRow(row)])
      .select()
      .single();

    handleError(error, 'Konserler.add');
    return data;
  },

  async update(id, row) {
    const { data, error } = await sb
      .from('konserler')
      .update(cleanRow(row))
      .eq('id', id)
      .select()
      .single();

    handleError(error, 'Konserler.update');
    return data;
  },

  async delete(id) {
    const { error } = await sb.from('konserler').delete().eq('id', id);
    handleError(error, 'Konserler.delete');
  },

  subscribe: createRealtimeSubscriber('konserler')
};

window.Konserler = Konserler;

// ============================================
// ÜRÜNLER
// ============================================
const Urunler = {
  async getAll() {
    const { data, error } = await sb
      .from('urunler')
      .select('*')
      .order('created_at', { ascending: true });

    handleError(error, 'Urunler.getAll');
    return data || [];
  },

  async add(row) {
    const { data, error } = await sb
      .from('urunler')
      .insert([cleanRow(row)])
      .select()
      .single();

    handleError(error, 'Urunler.add');
    return data;
  },

  async update(id, row) {
    const { data, error } = await sb
      .from('urunler')
      .update(cleanRow(row))
      .eq('id', id)
      .select()
      .single();

    handleError(error, 'Urunler.update');
    return data;
  },

  async delete(id) {
    const { error } = await sb.from('urunler').delete().eq('id', id);
    handleError(error, 'Urunler.delete');
  },

  subscribe: createRealtimeSubscriber('urunler')
};

window.Urunler = Urunler;

// ============================================
// AYLIK ÖZET
// ============================================
const AylikOzet = {
  async getAll() {
    const { data, error } = await sb
      .from('aylik_ozet')
      .select('*')
      .order('yil', { ascending: false })
      .order('ay', { ascending: false });

    handleError(error, 'AylikOzet.getAll');
    return data || [];
  },

  async upsert(row) {
    const { data, error } = await sb
      .from('aylik_ozet')
      .upsert([cleanRow(row)], { onConflict: 'ay,yil' })
      .select()
      .single();

    handleError(error, 'AylikOzet.upsert');
    return data;
  },

  async delete(id) {
    const { error } = await sb.from('aylik_ozet').delete().eq('id', id);
    handleError(error, 'AylikOzet.delete');
  },

  subscribe: createRealtimeSubscriber('aylik_ozet')
};

window.AylikOzet = AylikOzet;

// ============================================
// GİDERLER
// ============================================
const Giderler = {
  async getAll() {
    const { data, error } = await sb
      .from('giderler')
      .select('*')
      .order('tarih', { ascending: false })
      .order('created_at', { ascending: false });

    handleError(error, 'Giderler.getAll');
    return data || [];
  },

  async add(row) {
    const { data, error } = await sb
      .from('giderler')
      .insert([cleanRow(row)])
      .select()
      .single();

    handleError(error, 'Giderler.add');
    return data;
  },

  async update(id, row) {
    const { data, error } = await sb
      .from('giderler')
      .update(cleanRow(row))
      .eq('id', id)
      .select()
      .single();

    handleError(error, 'Giderler.update');
    return data;
  },

  async delete(id) {
    const { error } = await sb.from('giderler').delete().eq('id', id);
    handleError(error, 'Giderler.delete');
  },

  subscribe: createRealtimeSubscriber('giderler')
};

window.Giderler = Giderler;

// ============================================
// PERSONEL
// ============================================
const Personel = {
  async getAll() {
    const { data, error } = await sb
      .from('personel')
      .select('*')
      .order('created_at', { ascending: true });

    handleError(error, 'Personel.getAll');
    return data || [];
  },

  async add(row) {
    const { data, error } = await sb
      .from('personel')
      .insert([cleanRow(row)])
      .select()
      .single();

    handleError(error, 'Personel.add');
    return data;
  },

  async update(id, row) {
    const { data, error } = await sb
      .from('personel')
      .update(cleanRow(row))
      .eq('id', id)
      .select()
      .single();

    handleError(error, 'Personel.update');
    return data;
  },

  async delete(id) {
    const { error } = await sb.from('personel').delete().eq('id', id);
    handleError(error, 'Personel.delete');
  },

  subscribe: createRealtimeSubscriber('personel')
};

window.Personel = Personel;

// ============================================
// AYARLAR
// ============================================
const Ayarlar = {
  async get(key) {
    const { data, error } = await sb
      .from('ayarlar')
      .select('deger')
      .eq('anahtar', key)
      .maybeSingle();

    handleError(error, 'Ayarlar.get');
    return data?.deger ?? null;
  },

  async set(key, value) {
    const { data, error } = await sb
      .from('ayarlar')
      .upsert([{ anahtar: key, deger: value }], { onConflict: 'anahtar' })
      .select()
      .single();

    handleError(error, 'Ayarlar.set');
    return data;
  }
};

window.Ayarlar = Ayarlar;

// ============================================
// KONSER KALEMLERİ
// ============================================
const KonserKalemler = {
  async getAll() {
    const { data, error } = await sb
      .from('konser_kalemler')
      .select('*')
      .order('sira', { ascending: true })
      .order('created_at', { ascending: true });

    handleError(error, 'KonserKalemler.getAll');
    return data || [];
  },

  async add(etiket) {
    const { data, error } = await sb
      .from('konser_kalemler')
      .insert([{ etiket, sira: 999 }])
      .select()
      .single();

    handleError(error, 'KonserKalemler.add');
    return data;
  },

  async delete(id) {
    const { error } = await sb.from('konser_kalemler').delete().eq('id', id);
    handleError(error, 'KonserKalemler.delete');
  },

  subscribe: createRealtimeSubscriber('konser_kalemler')
};

window.KonserKalemler = KonserKalemler;

// ============================================
// YEDEK
// ============================================
const Yedek = {
  async tumunuAl() {
    const [
      gunluk_satis,
      konserler,
      urunler,
      aylik_ozet,
      giderler,
      personel,
      konser_kalemler
    ] = await Promise.all([
      GunlukSatis.getAll(),
      Konserler.getAll(),
      Urunler.getAll(),
      AylikOzet.getAll(),
      Giderler.getAll(),
      Personel.getAll(),
      KonserKalemler.getAll()
    ]);

    return {
      version: 9,
      timestamp: new Date().toISOString(),
      gunluk_satis,
      konserler,
      urunler,
      aylik_ozet,
      giderler,
      personel,
      konser_kalemler
    };
  },

  async indir() {
    const data = await this.tumunuAl();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panel_yedek_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  async yukle(jsonText) {
    const d = JSON.parse(jsonText);

    const tableMap = [
      'gunluk_satis',
      'konserler',
      'urunler',
      'aylik_ozet',
      'giderler',
      'personel'
    ];

    for (const t of tableMap) {
      const { error } = await sb
        .from(t)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      handleError(error, `Yedek temizleme: ${t}`);
    }

    const normalize = rows => (rows || []).map(cleanRow);

    if (d.gunluk_satis?.length) {
      const { error } = await sb.from('gunluk_satis').insert(normalize(d.gunluk_satis));
      handleError(error, 'Yedek yükleme: gunluk_satis');
    }

    if (d.konserler?.length) {
      const { error } = await sb.from('konserler').insert(normalize(d.konserler));
      handleError(error, 'Yedek yükleme: konserler');
    }

    if (d.urunler?.length) {
      const { error } = await sb.from('urunler').insert(normalize(d.urunler));
      handleError(error, 'Yedek yükleme: urunler');
    }

    if (d.aylik_ozet?.length) {
      const { error } = await sb.from('aylik_ozet').insert(normalize(d.aylik_ozet));
      handleError(error, 'Yedek yükleme: aylik_ozet');
    }

    if (d.giderler?.length) {
      const { error } = await sb.from('giderler').insert(normalize(d.giderler));
      handleError(error, 'Yedek yükleme: giderler');
    }

    if (d.personel?.length) {
      const { error } = await sb.from('personel').insert(normalize(d.personel));
      handleError(error, 'Yedek yükleme: personel');
    }
  }
};

window.Yedek = Yedek;

// ============================================
// CSV EXPORT
// ============================================
const Export = {
  _csv(rows, cols) {
    const header = cols.map(c => c.l).join(',');

    const body = rows
      .map(r =>
        cols
          .map(c => {
            const value = r[c.k] ?? '';
            const str = String(value);
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(',')
      )
      .join('\n');

    return '\uFEFF' + header + '\n' + body;
  },

  _download(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },

  async gunlukCSV() {
    const rows = await GunlukSatis.getAll();
    this._download(this._csv(rows, [
      { k: 'tarih', l: 'Tarih' },
      { k: 'ciro', l: 'Ciro' },
      { k: 'nakit', l: 'Nakit' },
      { k: 'pos', l: 'POS' },
      { k: 'bira', l: 'Bira' },
      { k: 'alkol', l: 'Alkol' },
      { k: 'alkolsuz', l: 'Alkolsüz' },
      { k: 'yiyecek', l: 'Yiyecek' },
      { k: 'cerez', l: 'Çerez' },
      { k: 'bilet', l: 'Bilet' },
      { k: 'urun_maliyet', l: 'Ürün Maliyeti' },
      { k: 'ikram_maliyet', l: 'İkram Maliyeti' },
      { k: 'not_alani', l: 'Not' }
    ]), 'gunluk_satis.csv');
  },

  async konserlerCSV() {
    const rows = await Konserler.getAll();
    this._download(this._csv(rows, [
      { k: 'sanatci', l: 'Sanatçı' },
      { k: 'tarih', l: 'Tarih' },
      { k: 'durum', l: 'Durum' },
      { k: 'toplam_gelir', l: 'Toplam Gelir' },
      { k: 'toplam_gider', l: 'Toplam Gider' },
      { k: 'net_kar', l: 'Net Kar' }
    ]), 'konserler.csv');
  },

  async aylikCSV() {
    const rows = await AylikOzet.getAll();
    const AYLAR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

    const mapped = rows.map(r => ({
      ...r,
      donem: `${AYLAR[r.ay]} ${r.yil}`
    }));

    this._download(this._csv(mapped, [
      { k: 'donem', l: 'Dönem' },
      { k: 'ciro', l: 'Ciro' },
      { k: 'toplam_gider', l: 'Toplam Gider' },
      { k: 'net_kar', l: 'Net Kar' }
    ]), 'aylik_ozet.csv');
  },

  async giderlerCSV() {
    const rows = await Giderler.getAll();
    this._download(this._csv(rows, [
      { k: 'tarih', l: 'Tarih' },
      { k: 'kategori', l: 'Kategori' },
      { k: 'aciklama', l: 'Açıklama' },
      { k: 'tutar', l: 'Tutar' },
      { k: 'odeme_yontemi', l: 'Ödeme Yöntemi' }
    ]), 'giderler.csv');
  },

  async personelCSV() {
    const rows = await Personel.getAll();
    this._download(this._csv(rows, [
      { k: 'ad_soyad', l: 'Ad Soyad' },
      { k: 'pozisyon', l: 'Pozisyon' },
      { k: 'tur', l: 'Tür' },
      { k: 'aylik_maas', l: 'Maaş' },
      { k: 'sgk', l: 'SGK' },
      { k: 'telefon', l: 'Telefon' }
    ]), 'personel.csv');
  }
};

window.Export = Export;

// ============================================
// OTOMATİK YEDEK
// localStorage YOK
// sadece manuel indir()
// ============================================
const OtomatikYedek = {
  check() {
    return false;
  },
  async run() {
    return await Yedek.indir();
  }
};

window.OtomatikYedek = OtomatikYedek;