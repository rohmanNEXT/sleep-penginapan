import { ReviewController } from '@/controllers/review.controller';
import { Router } from 'express';

export class ReviewRouter {
  private router: Router;
  private reviewController: ReviewController;

  constructor() {
    this.reviewController = new ReviewController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/', (req, res) => this.reviewController.createReview(req, res));
    this.router.get('/penginapan/:penginapanId', (req, res) => this.reviewController.getReviewsByPenginapanId(req, res));
    this.router.put('/:id', (req, res) => this.reviewController.updateReview(req, res));
    this.router.delete('/:id', (req, res) => this.reviewController.deleteReview(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}
