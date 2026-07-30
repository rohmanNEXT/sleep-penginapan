import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

const hashPassword = (password: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return `${salt}:${hash}`;
};

async function main() {
  console.log('Clearing database tables...');

  await prisma.transaksiPenginapan.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.cupon.deleteMany({});
  await prisma.kategoriFasilitas.deleteMany({});
  await prisma.kategoriKamar.deleteMany({});
  await prisma.penginapan.deleteMany({});
  await prisma.kategoriPenginapan.deleteMany({});
  await prisma.kategoriDestinasi.deleteMany({});
  await prisma.balance.deleteMany({});
  await prisma.transaksiTopup.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Tables cleared.');

  // ─── 1. Users ────────────────────────────────────────────────────────────────
  console.log('Seeding Users...');

  const superadminUser = await prisma.user.create({
    data: {
      nama: 'Super Administrator',
      username: 'superadmin',
      email: 'superadmin@superadmin.com',
      password: hashPassword('superadmin123'),
      role: 'superadmin',
      address: 'Pusat Pemerintahan, Jakarta',
      tanggalLahir: new Date('1985-01-01'),
      balance: { create: { saldo: 4000000 } },
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      nama: 'Administrator',
      username: 'admin',
      email: 'admin@admin.com',
      password: hashPassword('admin123'),
      role: 'admin',
      address: 'Mirota Kampus, Yogyakarta',
      tanggalLahir: new Date('1990-01-01'),
      balance: { create: { saldo: 4000000 } },
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      nama: 'User',
      username: 'user',
      email: 'user@user.com',
      password: hashPassword('user123'),
      role: 'user',
      address: 'Jl. Sudirman No. 123, Jakarta',
      tanggalLahir: new Date('1995-05-15'),
      balance: { create: { saldo: 4000000 } },
    },
  });

  // ─── 2. Kategori Penginapan ───────────────────────────────────────────────────
  const kategoriList = ['hotel', 'villa', 'apartement', 'guest house', 'kost', 'resort', 'cabin', 'penginapan danau'];
  const katMap: Record<string, { id: string; nama: string }> = {};
  for (const name of kategoriList) {
    katMap[name] = await prisma.kategoriPenginapan.create({ data: { nama: name } });
  }

  // ─── 3. Destinasi (25 unik, 4 negara) ────────────────────────────────────────
  // Indonesia: 10, Jepang: 6, Korea Selatan: 5, Thailand: 4
  const destinasiData = [
    // Indonesia (10)
    { negara: 'Indonesia', provinsi: 'Bali',               daerah: 'Ubud' },
    { negara: 'Indonesia', provinsi: 'Bali',               daerah: 'Seminyak' },
    { negara: 'Indonesia', provinsi: 'Jawa Barat',         daerah: 'Bandung' },
    { negara: 'Indonesia', provinsi: 'Jawa Barat',         daerah: 'Lembang' },
    { negara: 'Indonesia', provinsi: 'DKI Jakarta',        daerah: 'Jakarta Selatan' },
    { negara: 'Indonesia', provinsi: 'Jawa Timur',         daerah: 'Malang' },
    { negara: 'Indonesia', provinsi: 'Yogyakarta',         daerah: 'Sleman' },
    { negara: 'Indonesia', provinsi: 'Sumatera Utara',     daerah: 'Danau Toba' },
    { negara: 'Indonesia', provinsi: 'Nusa Tenggara Barat',daerah: 'Lombok' },
    { negara: 'Indonesia', provinsi: 'Papua',              daerah: 'Raja Ampat' },
    // Jepang (6)
    { negara: 'Jepang',    provinsi: 'Tokyo',              daerah: 'Shinjuku' },
    { negara: 'Jepang',    provinsi: 'Tokyo',              daerah: 'Shibuya' },
    { negara: 'Jepang',    provinsi: 'Kyoto',              daerah: 'Kyoto' },
    { negara: 'Jepang',    provinsi: 'Osaka',              daerah: 'Osaka' },
    { negara: 'Jepang',    provinsi: 'Hokkaido',           daerah: 'Sapporo' },
    { negara: 'Jepang',    provinsi: 'Hokkaido',           daerah: 'Niseko' },
    // Korea Selatan (5)
    { negara: 'Korea Selatan', provinsi: 'Seoul',          daerah: 'Gangnam' },
    { negara: 'Korea Selatan', provinsi: 'Seoul',          daerah: 'Hongdae' },
    { negara: 'Korea Selatan', provinsi: 'Busan',          daerah: 'Haeundae' },
    { negara: 'Korea Selatan', provinsi: 'Jeju',           daerah: 'Jeju City' },
    { negara: 'Korea Selatan', provinsi: 'Jeju',           daerah: 'Seogwipo' },
    // Thailand (4)
    { negara: 'Thailand',  provinsi: 'Bangkok',            daerah: 'Bangkok' },
    { negara: 'Thailand',  provinsi: 'Chiang Mai',         daerah: 'Chiang Mai' },
    { negara: 'Thailand',  provinsi: 'Phuket',             daerah: 'Patong' },
    { negara: 'Thailand',  provinsi: 'Phuket',             daerah: 'Kata' },
  ];

  const destInstances: { id: string; negara: string; provinsi: string; daerah: string }[] = [];
  for (const dest of destinasiData) {
    destInstances.push(await prisma.kategoriDestinasi.create({ data: dest }));
  }

  // ─── 4. Image helper ─────────────────────────────────────────────────────────
  const imgPrefix = (negara: string) => {
    if (negara === 'Korea Selatan') return 'korea_selatan';
    if (negara === 'Jepang') return 'jepang';
    if (negara === 'Thailand') return 'thailand';
    return 'indonesia';
  };

  // ─── 5. Penginapan data (25) ──────────────────────────────────────────────────
  const penginapanData = [
    // Indonesia
    { title: 'Villa Ubud Tropis', dest: 0, kat: 'villa',           desc: 'Villa mewah di tengah hutan tropis Ubud dengan kolam renang infinity dan pemandangan sawah yang memukau.', addr: 'Jl. Raya Ubud No. 12, Ubud, Bali', imgSet: 1 },
    { title: 'Resort Seminyak Pantai', dest: 1, kat: 'resort',     desc: 'Resort tepi pantai di Seminyak dengan akses langsung ke pantai, spa eksklusif, dan restoran fine dining.', addr: 'Jl. Kayu Aya No. 88, Seminyak, Bali', imgSet: 2 },
    { title: 'Hotel Bandung Heritage', dest: 2, kat: 'hotel',      desc: 'Hotel bersejarah di pusat kota Bandung dengan arsitektur kolonial Belanda dan fasilitas modern.', addr: 'Jl. Asia Afrika No. 45, Bandung, Jawa Barat', imgSet: 4 },
    { title: 'Cabin Lembang Sejuk', dest: 3, kat: 'cabin',         desc: 'Kabin nyaman di pegunungan Lembang dengan udara segar, pemandangan kebun teh, dan perapian hangat.', addr: 'Jl. Raya Lembang No. 7, Lembang, Jawa Barat', imgSet: 4 },
    { title: 'Apartement Jakarta Selatan', dest: 4, kat: 'apartement', desc: 'Apartemen modern di jantung Jakarta Selatan, dekat pusat bisnis dan hiburan kelas dunia.', addr: 'Jl. Sudirman No. 100, Jakarta Selatan', imgSet: 5 },
    { title: 'Guest House Malang Kota', dest: 5, kat: 'guest house', desc: 'Guest house nyaman di kota Malang dengan suasana rumahan, dekat wisata alam dan kuliner khas.', addr: 'Jl. Ijen No. 23, Malang, Jawa Timur', imgSet: 6 },
    { title: 'Hotel Sleman Yogya', dest: 6, kat: 'hotel',          desc: 'Hotel bintang empat di Sleman dengan akses mudah ke Candi Prambanan dan Keraton Yogyakarta.', addr: 'Jl. Kaliurang KM 8, Sleman, Yogyakarta', imgSet: 7 },
    { title: 'Penginapan Danau Toba', dest: 7, kat: 'penginapan danau', desc: 'Penginapan tepi Danau Toba dengan pemandangan danau vulkanik terbesar di dunia yang spektakuler.', addr: 'Jl. Danau Toba No. 5, Parapat, Sumatera Utara', imgSet: 8 },
    { title: 'Villa Lombok Gili', dest: 8, kat: 'villa',           desc: 'Villa eksklusif di Lombok dengan akses ke Gili Islands, snorkeling, dan pantai pasir putih.', addr: 'Jl. Raya Senggigi No. 15, Lombok, NTB', imgSet: 9 },
    { title: 'Resort Raja Ampat', dest: 9, kat: 'resort',          desc: 'Resort mewah di Raja Ampat dengan bungalow di atas air, diving world-class, dan keindahan bawah laut.', addr: 'Jl. Waisai No. 3, Raja Ampat, Papua', imgSet: 10 },
    // Jepang
    { title: 'Hotel Shinjuku Modern', dest: 10, kat: 'hotel',      desc: 'Hotel modern di Shinjuku Tokyo dengan pemandangan kota yang menakjubkan dan akses mudah ke transportasi.', addr: '2-1 Shinjuku, Shinjuku-ku, Tokyo', imgSet: 1 },
    { title: 'Apartement Shibuya Crossing', dest: 11, kat: 'apartement', desc: 'Apartemen stylish di Shibuya, langkah kaki dari persimpangan paling terkenal di dunia.', addr: '1-1 Dogenzaka, Shibuya-ku, Tokyo', imgSet: 2 },
    { title: 'Ryokan Kyoto Tradisional', dest: 12, kat: 'guest house', desc: 'Ryokan autentik di Kyoto dengan kamar tatami, onsen pribadi, dan sarapan kaiseki tradisional.', addr: '12 Gion-machi, Higashiyama-ku, Kyoto', imgSet: 3 },
    { title: 'Hotel Osaka Dotonbori', dest: 13, kat: 'hotel',      desc: 'Hotel di jantung Osaka dekat Dotonbori, surga kuliner dan hiburan malam yang tidak pernah tidur.', addr: '1-7 Dotonbori, Chuo-ku, Osaka', imgSet: 4 },
    { title: 'Cabin Sapporo Salju', dest: 14, kat: 'cabin',        desc: 'Kabin hangat di Sapporo Hokkaido, sempurna untuk ski musim dingin dan festival salju terkenal.', addr: '5-1 Odori, Chuo-ku, Sapporo, Hokkaido', imgSet: 5 },
    { title: 'Resort Niseko Ski', dest: 15, kat: 'resort',         desc: 'Resort ski premium di Niseko dengan salju powder terbaik di dunia dan fasilitas ski-in ski-out.', addr: 'Niseko-cho, Abuta-gun, Hokkaido', imgSet: 6 },
    // Korea Selatan
    { title: 'Hotel Gangnam Luxury', dest: 16, kat: 'hotel',       desc: 'Hotel mewah di Gangnam Seoul, distrik paling glamor Korea dengan butik fashion dan restoran bintang.', addr: '123 Teheran-ro, Gangnam-gu, Seoul', imgSet: 1 },
    { title: 'Kost Hongdae Artsy', dest: 17, kat: 'kost',          desc: 'Kost modern di Hongdae, pusat seni dan budaya anak muda Seoul dengan live music dan street art.', addr: '45 Hongik-ro, Mapo-gu, Seoul', imgSet: 2 },
    { title: 'Resort Haeundae Busan', dest: 18, kat: 'resort',     desc: 'Resort tepi pantai Haeundae Busan dengan pemandangan laut Korea yang indah dan seafood segar.', addr: '264 Haeundaehaebyeon-ro, Haeundae-gu, Busan', imgSet: 3 },
    { title: 'Villa Jeju City', dest: 19, kat: 'villa',            desc: 'Villa modern di Jeju City dengan pemandangan Hallasan, pantai vulkanik, dan kebun jeruk yang luas.', addr: '12 Nohyeong-dong, Jeju-si, Jeju', imgSet: 4 },
    { title: 'Guest House Seogwipo', dest: 20, kat: 'guest house', desc: 'Guest house charming di Seogwipo Jeju dengan akses ke air terjun Cheonjiyeon dan Jusangjeolli Cliff.', addr: '88 Seogwipo-si, Jeju', imgSet: 5 },
    // Thailand
    { title: 'Hotel Bangkok Sukhumvit', dest: 21, kat: 'hotel',    desc: 'Hotel bintang lima di Sukhumvit Bangkok dengan rooftop bar, spa mewah, dan akses BTS Skytrain.', addr: '88 Sukhumvit Rd, Khlong Toei, Bangkok', imgSet: 1 },
    { title: 'Resort Chiang Mai Alam', dest: 22, kat: 'resort',    desc: 'Resort alam di Chiang Mai dikelilingi hutan tropis, dekat kuil kuno Doi Suthep dan pasar malam.', addr: '15 Nimman Rd, Suthep, Chiang Mai', imgSet: 2 },
    { title: 'Villa Patong Phuket', dest: 23, kat: 'villa',        desc: 'Villa private di Patong Phuket dengan kolam renang infinity, pemandangan Laut Andaman, dan butler service.', addr: '22 Patong Beach Rd, Kathu, Phuket', imgSet: 3 },
    { title: 'Cabin Kata Beach Phuket', dest: 24, kat: 'cabin',    desc: 'Kabin tepi pantai Kata yang tenang, jauh dari keramaian dengan snorkeling dan sunset yang memukau.', addr: '5 Kata Rd, Karon, Phuket', imgSet: 4 },
  ];

  const facilities = ['wifi', 'kolam renang', 'gym', 'restoran', 'parkir gratis', 'ac', 'breakfast', 'laundry', 'rooftop', 'coworking space'];

  console.log('Seeding Penginapan...');
  const penginapanList: { id: string; kategoriDestinasiId: string }[] = [];

  for (let i = 0; i < penginapanData.length; i++) {
    const pd = penginapanData[i];
    const dest = destInstances[pd.dest];
    const category = katMap[pd.kat];
    const prefix = imgPrefix(dest.negara);
    const setNum = pd.imgSet;

    const images = [
      `/images/${prefix}_${setNum}_1.jpg`,
      `/images/${prefix}_${setNum}_2.jpg`,
      `/images/${prefix}_${setNum}_3.jpg`,
      `/images/${prefix}_${setNum}_4.jpg`,
    ];

    const hasChild = i % 2 === 0;

    const p = await prisma.penginapan.create({
      data: {
        userId: adminUser.id,
        title: pd.title,
        kategoriPenginapanId: category.id,
        kategoriDestinasiId: dest.id,
        address: pd.addr,
        description: pd.desc,
        umurPenginapan: 3 + (i % 8),
        rules: `1. Check-in pukul 14:00, Check-out pukul 12:00\n2. Dilarang merokok di dalam ruangan\n3. Tidak diperkenankan membawa hewan peliharaan\n4. Harap menjaga ketenangan setelah pukul 22:00`,
        faq: `Q: Apakah tersedia sarapan?\nA: Ya, sarapan gratis tersedia setiap hari.\nQ: Apakah ada layanan antar-jemput bandara?\nA: Ya, tersedia dengan biaya tambahan.\nQ: Apakah Wi-Fi tersedia?\nA: Ya, Wi-Fi gratis berkecepatan tinggi.`,
        image: images,
        ratingRataRata: parseFloat((3.8 + (i % 12) * 0.1).toFixed(1)),
      },
    });

    // Kamar 1: Standard
    await prisma.kategoriKamar.create({
      data: {
        penginapanId: p.id,
        maxKasur: 1,
        maxAdult: 2,
        maxChild: hasChild ? 1 : 0,
        maxKamar: 1,
        harga: 300000 + i * 15000,
        hargaPerChild: hasChild ? 75000 + i * 5000 : 0,
      },
    });

    // Fasilitas (3 per penginapan, rotasi)
    for (let j = 0; j < 3; j++) {
      await prisma.kategoriFasilitas.create({
        data: { penginapanId: p.id, nama: facilities[(i + j) % facilities.length] },
      });
    }

    penginapanList.push(p);
  }

  // ─── 6. Kupon Global (3, dibuat oleh superadmin) ─────────────────────────────
  console.log('Seeding Kupon Global...');
  const globalCoupons = [
    { code: 'HEMAT10', discountPercent: 10 },
    { code: 'HEMAT20', discountPercent: 20 },
    { code: 'HEMAT30', discountPercent: 30 },
  ];

  for (const gc of globalCoupons) {
    await prisma.cupon.create({
      data: {
        penginapanId: null, // global — berlaku untuk semua penginapan
        code: gc.code,
        discountPercent: gc.discountPercent,
        expiredAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // ─── 6b. Kupon Admin (6, masing-masing terikat 1 penginapan unik) ─────────────
  console.log('Seeding Kupon Admin...');
  // Pilih 6 penginapan acak (index 2,5,8,11,16,21) — semua berbeda
  const adminCouponTargets = [
    { idx: 2,  code: 'BANDUNG15', discountPercent: 15 },
    { idx: 5,  code: 'MALANG20',  discountPercent: 20 },
    { idx: 8,  code: 'LOMBOK10',  discountPercent: 10 },
    { idx: 11, code: 'SHIBUYA25', discountPercent: 25 },
    { idx: 16, code: 'GANGNAM20', discountPercent: 20 },
    { idx: 21, code: 'BANGKOK15', discountPercent: 15 },
  ];

  for (const ac of adminCouponTargets) {
    await prisma.cupon.create({
      data: {
        penginapanId: penginapanList[ac.idx].id,
        code: ac.code,
        discountPercent: ac.discountPercent,
        expiredAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // ─── 7. Transaksi (trending Bali/Ubud) ───────────────────────────────────────
  console.log('Seeding Transaksi...');
  const targetPenginapan = penginapanList[0]; // Villa Ubud Tropis
  const targetKamar = await prisma.kategoriKamar.findFirst({
    where: { penginapanId: targetPenginapan.id },
  });

  for (let i = 0; i < 8; i++) {
    await prisma.transaksiPenginapan.create({
      data: {
        userId: normalUser.id,
        penginapanId: targetPenginapan.id,
        kamarId: targetKamar!.id,
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        jumlahDewasa: 2,
        jumlahAnak: 0,
        totalHarga: Number(targetKamar!.harga) * 3,
      },
    });
  }

  console.log(`✅ Seed selesai!`);
  console.log(`   - 3 users: superadmin / admin / user (saldo awal Rp 4.000.000)`);
  console.log(`   - ${penginapanList.length} penginapan di 25 daerah berbeda`);
  console.log(`   - 3 kupon global: HEMAT10, HEMAT20, HEMAT30`);
  console.log(`   - 6 kupon admin (1 per penginapan): BANDUNG15, MALANG20, LOMBOK10, SHIBUYA25, GANGNAM20, BANGKOK15`);
  console.log(`   - 8 transaksi trending di Ubud, Bali`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
