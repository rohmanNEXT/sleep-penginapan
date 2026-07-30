import { Request, Response } from 'express';
import prisma from '@/prisma';

export class TransaksiPenginapanController {
  async createTransaksiPenginapan(req: Request, res: Response) {
    try {
      const {
        userId,
        penginapanId,
        kamarId,
        cuponId,
        checkIn,
        checkOut,
        jumlahDewasa,
        jumlahAnak,
        jumlahKamar,
      } = req.body;

      if (!userId || !penginapanId || !kamarId || !checkIn || !checkOut || jumlahDewasa === undefined) {
        return res.status(400).send({ message: 'userId, penginapanId, kamarId, checkIn, checkOut, and jumlahDewasa are required.' });
      }

      const roomsCount = jumlahKamar ? Number(jumlahKamar) : 1;

      // Check User and Balance
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { balance: true },
      });

      if (!user || !user.balance) {
        return res.status(404).send({ message: 'User or user balance record not found.' });
      }

      // Check Room (KategoriKamar)
      const kamar = await prisma.kategoriKamar.findUnique({
        where: { id: kamarId },
      });

      if (!kamar) {
        return res.status(404).send({ message: 'Kamar not found.' });
      }

      if (kamar.penginapanId !== penginapanId) {
        return res.status(400).send({ message: 'Kamar does not belong to the selected Penginapan.' });
      }

      if (kamar.maxKamar <= 0) {
        return res.status(400).send({ message: 'Selected Kamar is sold out.' });
      }

      if (roomsCount > kamar.maxKamar) {
        return res.status(400).send({ message: `Jumlah kamar yang dipilih (${roomsCount}) melebihi kapasitas kamar yang tersedia (${kamar.maxKamar}).` });
      }

      // Validate capacity based on selected rooms count
      const totalKapasitas = (kamar.maxAdult + kamar.maxChild) * roomsCount;
      const totalTamu = Number(jumlahDewasa) + Number(jumlahAnak || 0);

      if (totalTamu > totalKapasitas) {
        return res.status(400).send({ message: 'Jumlah tamu melebihi kapasitas kamar yang dipesan.' });
      }

      // Calculate stay duration (days)
      const inDate = new Date(checkIn);
      const outDate = new Date(checkOut);
      const timeDiff = outDate.getTime() - inDate.getTime();
      const stayDays = Math.max(1, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));

      // Calculate raw price — base price per room multiplied by roomsCount, extra child price added
      const pricePerNight = (Number(kamar.harga) * roomsCount) + (Number(kamar.hargaPerChild) * Number(jumlahAnak || 0));
      const rawTotal = pricePerNight * stayDays;

      // Handle Coupon Discount
      let discount = 0;
      if (cuponId) {
        const cupon = await prisma.cupon.findUnique({
          where: { id: cuponId },
        });

        if (!cupon) {
          return res.status(404).send({ message: 'Coupon not found.' });
        }

        if (user.role === 'admin' || user.role === 'superadmin') {
          return res.status(400).send({ message: 'Admin and Superadmin cannot use coupons.' });
        }

        const usedCount = await prisma.transaksiPenginapan.count({
          where: {
            userId,
            cuponId: cupon.id
          }
        });

        if (usedCount > 0) {
          return res.status(400).send({ message: 'Coupon has already been used by this user.' });
        }

        if (cupon.penginapanId && cupon.penginapanId !== penginapanId) {
          return res.status(400).send({ message: 'Coupon is not valid for this Penginapan.' });
        }

        if (cupon.expiredAt && new Date(cupon.expiredAt) < new Date()) {
          return res.status(400).send({ message: 'Coupon has expired.' });
        }

        discount = (rawTotal * cupon.discountPercent) / 100;
      }

      const taxAndFee = rawTotal * 0.1;
      const totalHarga = rawTotal + taxAndFee - discount;

      // Verify User has enough balance
      if (Number(user.balance.saldo) < totalHarga) {
        return res.status(400).send({ message: 'Insufficient balance.' });
      }

      // Execute transaction: create booking, deduct balance
      const result = await prisma.$transaction(async (tx: any) => {
        const booking = await tx.transaksiPenginapan.create({
          data: {
            userId,
            penginapanId,
            kamarId,
            cuponId: cuponId || null,
            checkIn: inDate,
            checkOut: outDate,
            jumlahDewasa: Number(jumlahDewasa),
            jumlahAnak: Number(jumlahAnak || 0),
            jumlahKamar: roomsCount,
            totalHarga,
          } as any,
        });

        // Deduct from User balance
        await tx.balance.update({
          where: { userId },
          data: {
            saldo: {
              decrement: totalHarga,
            },
          },
        });

        return booking;
      });

      return res.status(201).send({
        message: 'Booking completed successfully.',
        booking: result,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async getTransaksiPenginapanByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const transactions = await prisma.transaksiPenginapan.findMany({
        where: { userId },
        include: {
          penginapan: true,
          kamar: true,
          cupon: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).send(transactions);
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }
  async getTrendingProvinsi(req: Request, res: Response) {
    try {
      const transactions = await prisma.transaksiPenginapan.findMany({
        include: {
          penginapan: {
            include: {
              kategoriDestinasi: true
            }
          }
        }
      });
      
      const provinceCount: Record<string, { count: number, negara: string }> = {};
      
      for (const t of transactions) {
        if (t.penginapan?.kategoriDestinasi) {
          const prov = t.penginapan.kategoriDestinasi.provinsi;
          const neg = t.penginapan.kategoriDestinasi.negara;
          if (!provinceCount[prov]) {
            provinceCount[prov] = { count: 0, negara: neg };
          }
          provinceCount[prov].count++;
        }
      }
      
      const trending = Object.entries(provinceCount)
        .map(([provinsi, data]) => ({
          provinsi,
          negara: data.negara,
          count: data.count
        }))
        .sort((a, b) => b.count - a.count);
        
      return res.status(200).send(trending);
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }
}
