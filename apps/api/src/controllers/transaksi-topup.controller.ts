import { Request, Response } from 'express';
import prisma from '@/prisma';

export class TransaksiTopupController {
  async createTransaksiTopup(req: Request, res: Response) {
    try {
      const { userId, nominal, metodePembayaran } = req.body;

      const MIN = 10_000;
      const MAX = 12_000_000_000;

      if (!userId || !nominal || Number(nominal) <= 0) {
        return res.status(400).send({ message: 'userId and a positive nominal are required.' });
      }

      if (Number(nominal) < MIN) {
        return res.status(400).send({ message: `Nominal minimum adalah Rp ${MIN.toLocaleString('id-ID')}.` });
      }

      if (Number(nominal) > MAX) {
        return res.status(400).send({ message: `Nominal maksimum adalah Rp ${MAX.toLocaleString('id-ID')}.` });
      }

      // Check if user exists
      const userExists = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!userExists) {
        return res.status(404).send({ message: 'User not found.' });
      }

      // Run top-up and balance update in a single transaction
      const transaction = await prisma.$transaction(async (tx: any) => {
        const topup = await tx.transaksiTopup.create({
          data: {
            userId,
            nominal: Number(nominal),
            metodePembayaran,
            status: 'SUCCESS',
          },
        });

        await tx.balance.update({
          where: { userId },
          data: {
            saldo: {
              increment: Number(nominal),
            },
          },
        });

        return topup;
      });

      return res.status(201).send({
        message: 'Topup transaction successful',
        transaction,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async getTransaksiTopupByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const transactions = await prisma.transaksiTopup.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).send(transactions);
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }
}
