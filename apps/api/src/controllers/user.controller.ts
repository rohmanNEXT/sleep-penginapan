import { Request, Response } from 'express';
import prisma from '@/prisma';

export class UserController {
  async getUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          nama: true,
          username: true,
          email: true,
          address: true,
          tanggalLahir: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return res.status(200).send(users);
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          balance: true,
          reviews: true,
          savedPenginapan: true,
        },
      });

      if (!user) {
        return res.status(404).send({ message: 'User not found.' });
      }

      const { password: _, ...userWithoutPassword } = user;
      return res.status(200).send(userWithoutPassword);
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nama, address, tanggalLahir } = req.body;

      const userExists = await prisma.user.findUnique({
        where: { id },
      });

      if (!userExists) {
        return res.status(404).send({ message: 'User not found.' });
      }

      // Handle profile image upload
      let profileImageUrl: string | undefined;
      if (req.file) {
        profileImageUrl = `/uploads/${req.file.filename}`;
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          nama,
          address,
          tanggalLahir: tanggalLahir ? new Date(tanggalLahir) : undefined,
          ...(profileImageUrl && { profileImage: profileImageUrl }),
        },
      });

      const { password: _, ...userWithoutPassword } = updatedUser;
      return res.status(200).send({
        message: 'Profile updated successfully',
        user: userWithoutPassword,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async savePenginapan(req: Request, res: Response) {
    try {
      const { id } = req.params; // userId
      const { penginapanId } = req.body;

      if (!penginapanId) {
        return res.status(400).send({ message: 'penginapanId is required.' });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          savedPenginapan: {
            connect: { id: penginapanId },
          },
        },
        include: {
          savedPenginapan: true,
        },
      });

      const { password: _, ...userWithoutPassword } = updatedUser;
      return res.status(200).send({
        message: 'Penginapan saved successfully.',
        user: userWithoutPassword,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async unsavePenginapan(req: Request, res: Response) {
    try {
      const { id } = req.params; // userId
      const { penginapanId } = req.body;

      if (!penginapanId) {
        return res.status(400).send({ message: 'penginapanId is required.' });
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          savedPenginapan: {
            disconnect: { id: penginapanId },
          },
        },
        include: {
          savedPenginapan: true,
        },
      });

      const { password: _, ...userWithoutPassword } = updatedUser;
      return res.status(200).send({
        message: 'Penginapan unsaved successfully.',
        user: userWithoutPassword,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }
}
