import { Request, Response } from 'express';
import prisma from '@/prisma';

export class TransaksiBalanceController {
  async createTransaksiBalance(req: Request, res: Response) {
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

      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        return res.status(404).send({ message: 'User not found.' });
      }

      const transaction = await prisma.$transaction(async (tx: any) => {
        const topup = await tx.transaksiTopup.create({
          data: {
            userId,
            nominal: Number(nominal),
            metodePembayaran: metodePembayaran || 'TOP UP',
            status: 'SUCCESS',
          },
        });

        await tx.balance.update({
          where: { userId },
          data: { saldo: { increment: Number(nominal) } },
        });

        return topup;
      });

      return res.status(201).send({
        message: 'Balance top-up transaction successful',
        transaction,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async withdrawBalance(req: Request, res: Response) {
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

      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (!userExists) {
        return res.status(404).send({ message: 'User not found.' });
      }

      const balance = await prisma.balance.findUnique({ where: { userId } });
      if (!balance) {
        return res.status(404).send({ message: 'Balance record not found.' });
      }

      if (Number(balance.saldo) < Number(nominal)) {
        return res.status(400).send({ message: 'Saldo tidak mencukupi untuk penarikan ini.' });
      }

      const transaction = await prisma.$transaction(async (tx: any) => {
        const withdraw = await tx.transaksiTopup.create({
          data: {
            userId,
            nominal: Number(nominal),
            metodePembayaran: metodePembayaran || 'TARIK TUNAI',
            status: 'WITHDRAW',
          },
        });

        await tx.balance.update({
          where: { userId },
          data: { saldo: { decrement: Number(nominal) } },
        });

        return withdraw;
      });

      return res.status(201).send({
        message: 'Withdrawal successful',
        transaction,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async getTransaksiBalanceByUserId(req: Request, res: Response) {
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
