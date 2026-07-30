import { CuponController } from '@/controllers/cupon.controller';
import { Router } from 'express';
import { verifyToken } from '@/middleware/auth.middleware';

export class CuponRouter {
  private router: Router;
  private cuponController: CuponController;

  constructor() {
    this.cuponController = new CuponController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/', verifyToken, (req, res) => this.cuponController.createCupon(req, res));
    this.router.get('/', (req, res) => this.cuponController.getAllCupons(req, res));
    this.router.get('/penginapan/:penginapanId', (req, res) => this.cuponController.getCuponsByPenginapanId(req, res));
    this.router.post('/validate', (req, res) => this.cuponController.validateCupon(req, res));
    this.router.get('/:id', (req, res) => this.cuponController.getCuponById(req, res));
    this.router.put('/:id', verifyToken, (req, res) => this.cuponController.updateCupon(req, res));
    this.router.delete('/:id', verifyToken, (req, res) => this.cuponController.deleteCupon(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}
