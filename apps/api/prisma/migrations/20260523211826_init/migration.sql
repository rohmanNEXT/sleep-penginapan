/*
  Warnings:

  - A unique constraint covering the columns `[penginapanId]` on the table `Cupon` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[penginapanId]` on the table `KategoriKamar` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TransaksiPenginapan" ADD COLUMN     "jumlahKamar" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "token" TEXT,
ADD COLUMN     "verifyTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Cupon_penginapanId_key" ON "Cupon"("penginapanId");

-- CreateIndex
CREATE UNIQUE INDEX "KategoriKamar_penginapanId_key" ON "KategoriKamar"("penginapanId");
