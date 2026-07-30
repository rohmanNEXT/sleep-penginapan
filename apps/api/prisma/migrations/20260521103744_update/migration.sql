-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "address" TEXT,
    "tanggalLahir" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penginapan" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kategoriPenginapanId" TEXT NOT NULL,
    "kategoriDestinasiId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT,
    "umurPenginapan" INTEGER,
    "rules" TEXT,
    "faq" TEXT,
    "image" TEXT[],
    "ratingRataRata" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Penginapan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KategoriPenginapan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "KategoriPenginapan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KategoriDestinasi" (
    "id" TEXT NOT NULL,
    "negara" TEXT NOT NULL,
    "provinsi" TEXT NOT NULL,
    "daerah" TEXT NOT NULL,

    CONSTRAINT "KategoriDestinasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KategoriFasilitas" (
    "id" TEXT NOT NULL,
    "penginapanId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,

    CONSTRAINT "KategoriFasilitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KategoriKamar" (
    "id" TEXT NOT NULL,
    "penginapanId" TEXT NOT NULL,
    "maxKasur" INTEGER NOT NULL,
    "maxAdult" INTEGER NOT NULL,
    "maxChild" INTEGER NOT NULL,
    "maxKamar" INTEGER NOT NULL DEFAULT 1,
    "harga" DECIMAL(10,2) NOT NULL,
    "hargaPerChild" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "KategoriKamar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "saldo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaksiTopup" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nominal" DECIMAL(10,2) NOT NULL,
    "metodePembayaran" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransaksiTopup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "penginapanId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cupon" (
    "id" TEXT NOT NULL,
    "penginapanId" TEXT,
    "code" TEXT NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "link" TEXT,
    "expiredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransaksiPenginapan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "penginapanId" TEXT NOT NULL,
    "kamarId" TEXT NOT NULL,
    "cuponId" TEXT,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "jumlahDewasa" INTEGER NOT NULL,
    "jumlahAnak" INTEGER NOT NULL,
    "totalHarga" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransaksiPenginapan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SavedPenginapan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "KategoriPenginapan_nama_key" ON "KategoriPenginapan"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "Balance_userId_key" ON "Balance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Cupon_code_key" ON "Cupon"("code");

-- CreateIndex
CREATE UNIQUE INDEX "_SavedPenginapan_AB_unique" ON "_SavedPenginapan"("A", "B");

-- CreateIndex
CREATE INDEX "_SavedPenginapan_B_index" ON "_SavedPenginapan"("B");

-- AddForeignKey
ALTER TABLE "Penginapan" ADD CONSTRAINT "Penginapan_kategoriPenginapanId_fkey" FOREIGN KEY ("kategoriPenginapanId") REFERENCES "KategoriPenginapan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penginapan" ADD CONSTRAINT "Penginapan_kategoriDestinasiId_fkey" FOREIGN KEY ("kategoriDestinasiId") REFERENCES "KategoriDestinasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penginapan" ADD CONSTRAINT "Penginapan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KategoriFasilitas" ADD CONSTRAINT "KategoriFasilitas_penginapanId_fkey" FOREIGN KEY ("penginapanId") REFERENCES "Penginapan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KategoriKamar" ADD CONSTRAINT "KategoriKamar_penginapanId_fkey" FOREIGN KEY ("penginapanId") REFERENCES "Penginapan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiTopup" ADD CONSTRAINT "TransaksiTopup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_penginapanId_fkey" FOREIGN KEY ("penginapanId") REFERENCES "Penginapan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cupon" ADD CONSTRAINT "Cupon_penginapanId_fkey" FOREIGN KEY ("penginapanId") REFERENCES "Penginapan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenginapan" ADD CONSTRAINT "TransaksiPenginapan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenginapan" ADD CONSTRAINT "TransaksiPenginapan_penginapanId_fkey" FOREIGN KEY ("penginapanId") REFERENCES "Penginapan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenginapan" ADD CONSTRAINT "TransaksiPenginapan_kamarId_fkey" FOREIGN KEY ("kamarId") REFERENCES "KategoriKamar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransaksiPenginapan" ADD CONSTRAINT "TransaksiPenginapan_cuponId_fkey" FOREIGN KEY ("cuponId") REFERENCES "Cupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SavedPenginapan" ADD CONSTRAINT "_SavedPenginapan_A_fkey" FOREIGN KEY ("A") REFERENCES "Penginapan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SavedPenginapan" ADD CONSTRAINT "_SavedPenginapan_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
