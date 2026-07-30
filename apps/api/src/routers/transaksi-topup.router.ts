import { TransaksiTopupController } from '@/controllers/transaksi-topup.controller';
import { Router } from 'express';

export class TransaksiTopupRouter {
  private router: Router;
  private transaksiTopupController: TransaksiTopupController;

  constructor() {
    this.transaksiTopupController = new TransaksiTopupController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/', (req, res) => this.transaksiTopupController.createTransaksiTopup(req, res));
    this.router.get('/user/:userId', (req, res) => this.transaksiTopupController.getTransaksiTopupByUserId(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}
