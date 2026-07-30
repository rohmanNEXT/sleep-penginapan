import { PenginapanController } from '@/controllers/penginapan.controller';
import { Router } from 'express';
import { verifyToken } from '@/middleware/auth.middleware';
import { upload } from '@/utils/multer';

export class PenginapanRouter {
  private router: Router;
  private penginapanController: PenginapanController;

  constructor() {
    this.penginapanController = new PenginapanController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/', verifyToken as any, upload.array('images', 10), (req, res) => this.penginapanController.createPenginapan(req, res));
    this.router.get('/', (req, res) => this.penginapanController.getAllPenginapan(req, res));
    this.router.get('/categories', (req, res) => this.penginapanController.getCategories(req, res));
    this.router.get('/destinations', (req, res) => this.penginapanController.getDestinations(req, res));
    this.router.post('/destinations', verifyToken as any, (req, res) => this.penginapanController.createDestination(req, res));
    this.router.get('/:id', (req, res) => this.penginapanController.getPenginapanById(req, res));
    this.router.put('/:id', verifyToken as any, upload.array('images', 10), (req, res) => this.penginapanController.updatePenginapan(req, res));
    this.router.delete('/:id', verifyToken as any, (req, res) => this.penginapanController.deletePenginapan(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}
