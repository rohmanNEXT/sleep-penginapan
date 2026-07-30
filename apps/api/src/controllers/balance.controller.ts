import { Request, Response } from 'express';
import prisma from '@/prisma';

export class BalanceController {
  async getBalanceByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const userRole = (req as any).user?.role;
      const requestUserId = (req as any).user?.id;

      if (userRole === 'superadmin') {
        return res.status(403).send({ message: 'SuperAdmin cannot access balance.' });
      }

      // Users can only access their own balance
      if (userRole !== 'admin' && userId !== requestUserId) {
        return res.status(403).send({ message: 'You can only access your own balance.' });
      }

      const balance = await prisma.balance.findUnique({
        where: { userId },
      });

      if (!balance) {
        return res.status(404).send({ message: 'Balance record not found for this user.' });
      }

      return res.status(200).send(balance);
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async updateBalance(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { saldo } = req.body;
      const userRole = (req as any).user?.role;
      const requestUserId = (req as any).user?.id;

      if (userRole === 'superadmin') {
        return res.status(403).send({ message: 'SuperAdmin cannot update balance.' });
      }

      // Users can only update their own balance
      if (userRole !== 'admin' && userId !== requestUserId) {
        return res.status(403).send({ message: 'You can only update your own balance.' });
      }

      if (saldo === undefined || Number(saldo) < 0) {
        return res.status(400).send({ message: 'Valid saldo amount is required.' });
      }

      const balanceExists = await prisma.balance.findUnique({
        where: { userId },
      });

      if (!balanceExists) {
        return res.status(404).send({ message: 'Balance record not found.' });
      }

      const updatedBalance = await prisma.balance.update({
        where: { userId },
        data: {
          saldo: Number(saldo),
        },
      });

      return res.status(200).send({
        message: 'Balance updated successfully',
        balance: updatedBalance,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }
}
