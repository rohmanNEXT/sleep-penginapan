import { Request, Response } from 'express';
import prisma from '@/prisma';

export class PenginapanController {
  async createPenginapan(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      if (userRole === 'superadmin') {
        return res.status(403).send({ message: 'SuperAdmin cannot create penginapan.' });
      }

      const {
        title,
        kategoriPenginapanId,
        kategoriDestinasiId,
        address,
        description,
        umurPenginapan,
        rules,
        faq,
        image,
        fasilitas, // Expected array of strings: ["WiFi", "Pool"]
        kamar,      // Expected array of room objects
      } = req.body;

      if (!title || !kategoriPenginapanId || !kategoriDestinasiId || !address) {
        return res.status(400).send({ message: 'Title, kategoriPenginapanId, kategoriDestinasiId, and address are required.' });
      }

      // Validasi field wajib lainnya
      if (!description || !String(description).trim()) {
        return res.status(400).send({ message: 'Deskripsi wajib diisi.' });
      }
      if (!rules || !String(rules).trim()) {
        return res.status(400).send({ message: 'Aturan wajib diisi.' });
      }
      if (!faq || !String(faq).trim()) {
        return res.status(400).send({ message: 'FAQ wajib diisi.' });
      }

      // Handle uploaded images
      let imageUrls: string[] = [];
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        imageUrls = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
      } else if (image && Array.isArray(image) && image.length > 0) {
        imageUrls = image;
      } else {
        return res.status(400).send({ message: 'Minimal 1 gambar wajib diupload.' });
      }

      if (!umurPenginapan || Number(umurPenginapan) < 1) {
        return res.status(400).send({ message: 'Umur/durasi penginapan wajib diisi minimal 1.' });
      }
      if (!fasilitas || !Array.isArray(fasilitas) || fasilitas.length === 0) {
        return res.status(400).send({ message: 'Minimal 1 fasilitas wajib dipilih.' });
      }

      // Enforce max 1 kamar per penginapan
      if (kamar && Array.isArray(kamar) && kamar.length > 1) {
        return res.status(400).send({ message: 'Setiap penginapan hanya boleh memiliki maksimum 1 kamar.' });
      }
      if (!kamar || !Array.isArray(kamar) || kamar.length === 0) {
        return res.status(400).send({ message: 'Data kamar wajib diisi.' });
      }

      // Validasi field kamar (maxChild boleh 0)
      for (const k of kamar) {
        if (!k.maxKasur || Number(k.maxKasur) < 1) {
          return res.status(400).send({ message: 'Max Kasur wajib minimal 1.' });
        }
        if (!k.maxAdult || Number(k.maxAdult) < 1) {
          return res.status(400).send({ message: 'Max Adult wajib minimal 1.' });
        }
        if (!k.maxKamar || Number(k.maxKamar) < 1) {
          return res.status(400).send({ message: 'Max Kamar wajib minimal 1.' });
        }
        if (!k.harga || Number(k.harga) < 1) {
          return res.status(400).send({ message: 'Harga wajib diisi dan tidak boleh 0.' });
        }
        // maxChild boleh 0 — tidak divalidasi
      }

      const newPenginapan = await prisma.penginapan.create({
        data: {
          userId,
          title,
          kategoriPenginapanId,
          kategoriDestinasiId,
          address,
          description,
          umurPenginapan: umurPenginapan ? Number(umurPenginapan) : null,
          rules,
          faq,
          image: imageUrls,
          kategoriFasilitas: fasilitas ? {
            create: fasilitas.map((f: string) => ({ nama: f })),
          } : undefined,
          kategoriKamar: kamar ? {
            create: kamar.map((k: { maxKasur: number; maxAdult: number; maxChild: number; harga: number; hargaPerChild?: number }) => ({
              maxKasur: Number(k.maxKasur),
              maxAdult: Number(k.maxAdult),
              maxChild: Number(k.maxChild),
              maxKamar: (k as any).maxKamar ? Number((k as any).maxKamar) : 1,
              harga: Number(k.harga),
              hargaPerChild: Number(k.hargaPerChild || 0),
            })),
          } : undefined,
        },
        include: {
          kategoriPenginapan: true,
          kategoriDestinasi: true,
          kategoriFasilitas: true,
          kategoriKamar: true,
        },
      });

      return res.status(201).send({
        message: 'Penginapan created successfully',
        penginapan: newPenginapan,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async getAllPenginapan(req: Request, res: Response) {
    try {
      const { kategoriPenginapanId, kategoriDestinasiId, search, adminId } = req.query;

      const whereClause: any = {};

      if (adminId) {
        const requestingUser = await prisma.user.findUnique({
          where: { id: String(adminId) }
        });
        if (requestingUser && requestingUser.role !== 'superadmin') {
          whereClause.userId = String(adminId);
        }
      }

      if (kategoriPenginapanId) {
        whereClause.kategoriPenginapanId = String(kategoriPenginapanId);
      }
      if (kategoriDestinasiId) {
        whereClause.kategoriDestinasiId = String(kategoriDestinasiId);
      }
      if (search) {
        whereClause.OR = [
          { title: { contains: String(search), mode: 'insensitive' } },
          { address: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      const listPenginapan = await prisma.penginapan.findMany({
        where: whereClause,
        include: {
          kategoriPenginapan: true,
          kategoriDestinasi: true,
          kategoriFasilitas: true,
          kategoriKamar: true,
          reviews: true,
        },
      });

      return res.status(200).send(listPenginapan);
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async getPenginapanById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const penginapan = await prisma.penginapan.findUnique({
        where: { id },
        include: {
          kategoriPenginapan: true,
          kategoriDestinasi: true,
          kategoriFasilitas: true,
          kategoriKamar: true,
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  nama: true,
                  username: true,
                },
              },
            },
          },
          cupons: true,
        },
      });

      if (!penginapan) {
        return res.status(404).send({ message: 'Penginapan not found.' });
      }

      return res.status(200).send(penginapan);
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async updatePenginapan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.role;
      const userId = (req as any).user?.id;

      if (userRole === 'superadmin') {
        return res.status(403).send({ message: 'SuperAdmin cannot update penginapan.' });
      }

      const {
        title,
        kategoriPenginapanId,
        kategoriDestinasiId,
        address,
        description,
        umurPenginapan,
        rules,
        faq,
        image,
        fasilitas,
        kamar,
      } = req.body;

      const penginapanExists = await prisma.penginapan.findUnique({
        where: { id },
      });

      if (!penginapanExists) {
        return res.status(404).send({ message: 'Penginapan not found.' });
      }

      if (penginapanExists.userId !== userId) {
        return res.status(403).send({ message: 'You do not own this penginapan.' });
      }

      // Validasi field wajib (maxChild boleh 0)
      if (!title || !String(title).trim()) {
        return res.status(400).send({ message: 'Nama penginapan wajib diisi.' });
      }
      if (!address || !String(address).trim()) {
        return res.status(400).send({ message: 'Alamat wajib diisi.' });
      }
      if (!description || !String(description).trim()) {
        return res.status(400).send({ message: 'Deskripsi wajib diisi.' });
      }
      if (!rules || !String(rules).trim()) {
        return res.status(400).send({ message: 'Aturan wajib diisi.' });
      }
      if (!faq || !String(faq).trim()) {
        return res.status(400).send({ message: 'FAQ wajib diisi.' });
      }

      // Handle uploaded images
      let imageUrls: string[] = [];
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        imageUrls = (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`);
      } else if (image && Array.isArray(image) && image.length > 0) {
        imageUrls = image;
      } else {
        return res.status(400).send({ message: 'Minimal 1 gambar wajib diupload.' });
      }

      if (!umurPenginapan || Number(umurPenginapan) < 1) {
        return res.status(400).send({ message: 'Umur/durasi penginapan wajib diisi minimal 1.' });
      }
      if (!fasilitas || !Array.isArray(fasilitas) || fasilitas.length === 0) {
        return res.status(400).send({ message: 'Minimal 1 fasilitas wajib dipilih.' });
      }

      // Enforce max 1 kamar per penginapan
      if (kamar && Array.isArray(kamar) && kamar.length > 1) {
        return res.status(400).send({ message: 'Setiap penginapan hanya boleh memiliki maksimum 1 kamar.' });
      }
      if (!kamar || !Array.isArray(kamar) || kamar.length === 0) {
        return res.status(400).send({ message: 'Data kamar wajib diisi.' });
      }

      // Validasi field kamar (maxChild boleh 0)
      for (const k of kamar) {
        if (!k.maxKasur || Number(k.maxKasur) < 1) {
          return res.status(400).send({ message: 'Max Kasur wajib minimal 1.' });
        }
        if (!k.maxAdult || Number(k.maxAdult) < 1) {
          return res.status(400).send({ message: 'Max Adult wajib minimal 1.' });
        }
        if (!k.maxKamar || Number(k.maxKamar) < 1) {
          return res.status(400).send({ message: 'Max Kamar wajib minimal 1.' });
        }
        if (!k.harga || Number(k.harga) < 1) {
          return res.status(400).send({ message: 'Harga wajib diisi dan tidak boleh 0.' });
        }
        // maxChild boleh 0 — tidak divalidasi
      }

      // Delete existing facilities and rooms first
      // Must delete transaksi referencing kamar before deleting kamar (FK constraint)
      const existingKamar = await prisma.kategoriKamar.findMany({
        where: { penginapanId: id },
        select: { id: true },
      });
      const kamarIds = existingKamar.map((k: { id: string }) => k.id);

      await prisma.$transaction([
        prisma.kategoriFasilitas.deleteMany({ where: { penginapanId: id } }),
        prisma.transaksiPenginapan.deleteMany({ where: { kamarId: { in: kamarIds } } }),
        prisma.kategoriKamar.deleteMany({ where: { penginapanId: id } }),
      ]);

      const updatedPenginapan = await prisma.penginapan.update({
        where: { id },
        data: {
          title,
          kategoriPenginapanId,
          kategoriDestinasiId,
          address,
          description,
          umurPenginapan: umurPenginapan !== undefined ? Number(umurPenginapan) : undefined,
          rules,
          faq,
          image: imageUrls,
          kategoriFasilitas: fasilitas ? {
            create: fasilitas.map((f: string) => ({ nama: f })),
          } : undefined,
          kategoriKamar: kamar ? {
            create: kamar.map((k: { maxKasur: number; maxAdult: number; maxChild: number; harga: number; hargaPerChild?: number }) => ({
              maxKasur: Number(k.maxKasur),
              maxAdult: Number(k.maxAdult),
              maxChild: Number(k.maxChild),
              maxKamar: (k as any).maxKamar ? Number((k as any).maxKamar) : 1,
              harga: Number(k.harga),
              hargaPerChild: Number(k.hargaPerChild || 0),
            })),
          } : undefined,
        },
        include: {
          kategoriPenginapan: true,
          kategoriDestinasi: true,
          kategoriFasilitas: true,
          kategoriKamar: true,
        },
      });

      return res.status(200).send({
        message: 'Penginapan updated successfully',
        penginapan: updatedPenginapan,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async deletePenginapan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.role;
      const userId = (req as any).user?.id;

      if (userRole === 'superadmin') {
        return res.status(403).send({ message: 'SuperAdmin cannot delete penginapan.' });
      }

      const penginapanExists = await prisma.penginapan.findUnique({
        where: { id },
      });

      if (!penginapanExists) {
        return res.status(404).send({ message: 'Penginapan not found.' });
      }

      if (penginapanExists.userId !== userId) {
        return res.status(403).send({ message: 'You do not own this penginapan.' });
      }

      await prisma.$transaction([
        prisma.kategoriFasilitas.deleteMany({ where: { penginapanId: id } }),
        prisma.review.deleteMany({ where: { penginapanId: id } }),
        prisma.cupon.deleteMany({ where: { penginapanId: id } }),
        prisma.transaksiPenginapan.deleteMany({ where: { penginapanId: id } }),
        prisma.kategoriKamar.deleteMany({ where: { penginapanId: id } }),
        prisma.penginapan.delete({ where: { id } }),
      ]);

      return res.status(200).send({ message: 'Penginapan deleted successfully.' });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.kategoriPenginapan.findMany();
      return res.status(200).send(categories);
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async getDestinations(req: Request, res: Response) {
    try {
      const destinations = await prisma.kategoriDestinasi.findMany();
      return res.status(200).send(destinations);
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async createDestination(req: Request, res: Response) {
    try {
      const { negara, provinsi, daerah } = req.body;

      if (!negara || !provinsi || !daerah) {
        return res.status(400).send({ message: 'negara, provinsi, dan daerah wajib diisi' });
      }

      // Check if destination already exists
      const existing = await prisma.kategoriDestinasi.findFirst({
        where: { negara, provinsi, daerah }
      });

      if (existing) {
        return res.status(200).send(existing);
      }

      // Create new destination
      const newDestination = await prisma.kategoriDestinasi.create({
        data: { negara, provinsi, daerah }
      });

      return res.status(201).send(newDestination);
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }
}
