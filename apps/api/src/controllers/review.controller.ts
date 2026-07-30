import { Request, Response } from 'express';
import prisma from '@/prisma';

export class ReviewController {
  private async updatePenginapanAverageRating(penginapanId: string) {
    const reviews = await prisma.review.findMany({
      where: { penginapanId },
      select: { rating: true },
    });

    if (reviews.length === 0) {
      await prisma.penginapan.update({
        where: { id: penginapanId },
        data: { ratingRataRata: 0 },
      });
      return;
    }

    const totalRating = reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await prisma.penginapan.update({
      where: { id: penginapanId },
      data: { ratingRataRata: parseFloat(averageRating.toFixed(2)) },
    });
  }

  async createReview(req: Request, res: Response) {
    try {
      const { userId, penginapanId, rating, comment } = req.body;

      if (!userId || !penginapanId || rating === undefined || rating < 1 || rating > 5) {
        return res.status(400).send({ message: 'userId, penginapanId, and rating (1-5) are required.' });
      }

      // Check if user and penginapan exist
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      const penginapanExists = await prisma.penginapan.findUnique({ where: { id: penginapanId } });

      if (!userExists || !penginapanExists) {
        return res.status(404).send({ message: 'User or Penginapan not found.' });
      }

      // Check if user has a transaction (purchased/booked) for this accommodation
      const transaction = await prisma.transaksiPenginapan.findFirst({
        where: {
          userId,
          penginapanId,
        },
      });

      if (!transaction) {
        return res.status(403).send({ message: 'Anda hanya dapat memberikan review pada penginapan yang telah Anda beli atau pesan.' });
      }

      const newReview = await prisma.review.create({
        data: {
          userId,
          penginapanId,
          rating: Number(rating),
          comment,
        },
      });

      // Recalculate and update ratingRataRata
      await this.updatePenginapanAverageRating(penginapanId);

      return res.status(201).send({
        message: 'Review created successfully.',
        review: newReview,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async getReviewsByPenginapanId(req: Request, res: Response) {
    try {
      const { penginapanId } = req.params;

      const reviews = await prisma.review.findMany({
        where: { penginapanId },
        include: {
          user: {
            select: {
              id: true,
              nama: true,
              username: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).send(reviews);
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async updateReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId, rating, comment } = req.body;

      if (!userId) {
        return res.status(400).send({ message: 'userId is required to update a review.' });
      }

      const review = await prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        return res.status(404).send({ message: 'Review not found.' });
      }

      if (review.userId !== userId) {
        return res.status(403).send({ message: 'Anda tidak memiliki akses untuk mengubah review ini.' });
      }

      // Check if user has a transaction (purchased/booked) for this accommodation
      const transaction = await prisma.transaksiPenginapan.findFirst({
        where: {
          userId,
          penginapanId: review.penginapanId,
        },
      });

      if (!transaction) {
        return res.status(403).send({ message: 'Anda hanya dapat memberikan atau mengubah review pada penginapan yang telah Anda beli atau pesan.' });
      }

      const updatedData: any = {};
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          return res.status(400).send({ message: 'Rating must be between 1 and 5.' });
        }
        updatedData.rating = Number(rating);
      }
      if (comment !== undefined) {
        updatedData.comment = comment;
      }

      const updatedReview = await prisma.review.update({
        where: { id },
        data: updatedData,
      });

      // Recalculate average rating
      await this.updatePenginapanAverageRating(review.penginapanId);

      return res.status(200).send({
        message: 'Review updated successfully.',
        review: updatedReview,
      });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }

  async deleteReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Get userId from query param or request body
      const userId = req.body.userId || req.query.userId;

      if (!userId) {
        return res.status(400).send({ message: 'userId is required to delete a review.' });
      }

      const review = await prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        return res.status(404).send({ message: 'Review not found.' });
      }

      if (review.userId !== userId) {
        return res.status(403).send({ message: 'Anda tidak memiliki akses untuk menghapus review ini.' });
      }

      // Check if user has a transaction (purchased/booked) for this accommodation
      const transaction = await prisma.transaksiPenginapan.findFirst({
        where: {
          userId: String(userId),
          penginapanId: review.penginapanId,
        },
      });

      if (!transaction) {
        return res.status(403).send({ message: 'Anda hanya dapat mengelola review pada penginapan yang telah Anda beli atau pesan.' });
      }

      await prisma.review.delete({
        where: { id },
      });

      // Recalculate average rating after deletion
      await this.updatePenginapanAverageRating(review.penginapanId);

      return res.status(200).send({ message: 'Review deleted successfully.' });
    } catch (error: any) {
      return res.status(500).send({ message: 'Internal server error', error: error.message });
    }
  }
}
