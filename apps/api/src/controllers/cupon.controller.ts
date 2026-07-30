import { Request, Response } from 'express';
import prisma from '@/prisma';

export class CuponController {
  async createCupon(req: Request, res: Response) {
    try {
      const { penginapanId, code, discountPercent, expiredAt, link } = req.body;
      const userRole = (req as any).user?.role;
      const userId = (req as any).user?.id;

      if (!code || discountPercent === undefined) {
        return res.status(400).send({ message: 'code and discountPercent are required.' });
      }

      if (userRole === 'superadmin') {
        if (penginapanId) {
          return res.status(400).send({ message: 'Superadmin coupons cannot be bound to a specific accommodation.' });
        }
        const globalCouponCount = await prisma.cupon.count({
          where: { penginapanId: null }
        });
        if (globalCouponCount >= 3) {
          return res.status(400).send({ message: 'Maximum limit of 3 global coupons has been reached.' });
        }
      } else if (userRole === 'admin') {
        if (!penginapanId) {
          return res.status(400).send({ message: 'penginapanId is required for admin coupons.' });
        }
        const penginapanExists = await prisma.penginapan.findUnique({
          where: { id: penginapanId },
        });
        if (!penginapanExists) {
          return res.status(404).send({ message: 'Penginapan not found.' });
        }
        if (penginapanExists.userId !== userId) {
          return res.status(403).send({ message: 'You do not own this accommodation.' });
        }
      } else {
        return res.status(403).send({ message: 'Unauthorized.' });
      }

      const existingCupon = await prisma.cupon.findUnique({
        where: { code },
      });

      if (existingCupon) {
        return res.status(400).send({ message: 'Coupon code already exists.' });
      }

      const newCupon = await prisma.cupon.create({
        data: {
          penginapanId: penginapanId || null,
          code,
          discountPercent: Number(discountPercent),
          expiredAt: expiredAt ? new Date(expiredAt) : null,
          link: link || null,
        },
      });

      return res.status(201).send({
        message: 'Coupon created successfully.',
        cupon: newCupon,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async getCuponsByPenginapanId(req: Request, res: Response) {
    try {
      const { penginapanId } = req.params;

      const cupons = await prisma.cupon.findMany({
        where: { penginapanId },
      });

      return res.status(200).send(cupons);
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async validateCupon(req: Request, res: Response) {
    try {
      const { code, penginapanId, userId } = req.body;

      if (!code || !penginapanId) {
        return res.status(400).send({ message: 'code and penginapanId are required.' });
      }

      const cupon = await prisma.cupon.findUnique({
        where: { code },
      });

      if (!cupon) {
        return res.status(404).send({ valid: false, message: 'Coupon not found.' });
      }

      if (cupon.penginapanId && cupon.penginapanId !== penginapanId) {
        return res.status(400).send({ valid: false, message: 'Coupon is not valid for this accommodation.' });
      }

      if (cupon.expiredAt && new Date(cupon.expiredAt) < new Date()) {
        return res.status(400).send({ valid: false, message: 'Coupon has expired.' });
      }

      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });
        if (user) {
          if (user.role === 'admin' || user.role === 'superadmin') {
            return res.status(400).send({ valid: false, message: 'Admin and Superadmin cannot use coupons.' });
          }

          // Check if this coupon was ever used by this user (any penginapan)
          const usedTransaction = await prisma.transaksiPenginapan.findFirst({
            where: {
              userId,
              cuponId: cupon.id,
            },
            include: {
              penginapan: { select: { title: true } },
            },
          });

          if (usedTransaction) {
            const usedAt = usedTransaction.penginapan?.title || 'penginapan lain';
            // If used at a DIFFERENT penginapan, give specific cross-penginapan error
            if (usedTransaction.penginapanId !== penginapanId) {
              return res.status(400).send({
                valid: false,
                message: `Anda tidak bisa pakai kode kupon ini karena sudah pernah dipakai di ${usedAt}.`,
                usedAt,
              });
            }
            // Used at the same penginapan — still invalid (1x use total)
            return res.status(400).send({
              valid: false,
              message: 'Coupon has already been used by this user.',
            });
          }
        }
      }

      return res.status(200).send({
        valid: true,
        message: 'Coupon is valid.',
        discountPercent: cupon.discountPercent,
        cuponId: cupon.id,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async getAllCupons(req: Request, res: Response) {
    try {
      const { adminId } = req.query;
      const whereClause: any = {};
      
      if (adminId) {
        const user = await prisma.user.findUnique({
          where: { id: String(adminId) }
        });
        
        if (user) {
          if (user.role === 'admin') {
            whereClause.penginapan = {
              userId: user.id
            };
          } else if (user.role === 'superadmin') {
            whereClause.penginapanId = null;
          }
        }
      }

      const cupons = await prisma.cupon.findMany({
        where: whereClause,
        include: {
          penginapan: true
        }
      });
      return res.status(200).send(cupons);
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async getCuponById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cupon = await prisma.cupon.findUnique({
        where: { id },
        include: {
          penginapan: true
        }
      });
      if (!cupon) {
        return res.status(404).send({ message: 'Coupon not found.' });
      }
      return res.status(200).send(cupon);
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async updateCupon(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { penginapanId, code, discountPercent, expiredAt, link } = req.body;
      const userRole = (req as any).user?.role;
      const userId = (req as any).user?.id;

      const existingCupon = await prisma.cupon.findUnique({
        where: { id },
      });

      if (!existingCupon) {
        return res.status(404).send({ message: 'Coupon not found.' });
      }

      if (userRole === 'superadmin') {
        if (penginapanId) {
          return res.status(400).send({ message: 'Superadmin coupons cannot be bound to a specific accommodation.' });
        }
      } else if (userRole === 'admin') {
        if (existingCupon.penginapanId === null) {
          return res.status(403).send({ message: 'Admins cannot modify global coupons.' });
        }
        if (penginapanId && penginapanId !== existingCupon.penginapanId) {
          const penginapan = await prisma.penginapan.findUnique({
            where: { id: penginapanId },
          });
          if (!penginapan || penginapan.userId !== userId) {
            return res.status(403).send({ message: 'You do not own the target accommodation.' });
          }
        }
      } else {
        return res.status(403).send({ message: 'Unauthorized.' });
      }

      const updated = await prisma.cupon.update({
        where: { id },
        data: {
          penginapanId: penginapanId !== undefined ? (penginapanId || null) : undefined,
          code,
          discountPercent: discountPercent !== undefined ? Number(discountPercent) : undefined,
          expiredAt: expiredAt ? new Date(expiredAt) : null,
          link: link !== undefined ? (link || null) : undefined,
        },
      });
      return res.status(200).send(updated);
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async deleteCupon(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.role;
      const userId = (req as any).user?.id;

      const existingCupon = await prisma.cupon.findUnique({
        where: { id },
      });

      if (!existingCupon) {
        return res.status(404).send({ message: 'Coupon not found.' });
      }

      if (userRole === 'superadmin') {
        if (existingCupon.penginapanId !== null) {
          return res.status(403).send({ message: 'Superadmin can only delete global coupons.' });
        }
      } else if (userRole === 'admin') {
        if (existingCupon.penginapanId === null) {
          return res.status(403).send({ message: 'Admins cannot delete global coupons.' });
        }
        const penginapan = await prisma.penginapan.findUnique({
          where: { id: existingCupon.penginapanId },
        });
        if (!penginapan || penginapan.userId !== userId) {
          return res.status(403).send({ message: 'You do not own this accommodation.' });
        }
      } else {
        return res.status(403).send({ message: 'Unauthorized.' });
      }

      await prisma.cupon.delete({
        where: { id }
      });
      return res.status(200).send({ message: 'Coupon deleted successfully.' });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }}}
