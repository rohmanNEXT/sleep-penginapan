import { TransaksiPenginapanController } from '@/controllers/transaksi-penginapan.controller';
import { Router } from 'express';
import { verifyToken } from '@/middleware/auth.middleware';

export class TransaksiPenginapanRouter {
  private router: Router;
  private transaksiPenginapanController: TransaksiPenginapanController;

  constructor() {
    this.transaksiPenginapanController = new TransaksiPenginapanController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/trending-provinsi', (req, res) => this.transaksiPenginapanController.getTrendingProvinsi(req, res));
    this.router.post('/', verifyToken, (req, res) => this.transaksiPenginapanController.createTransaksiPenginapan(req, res));
    this.router.get('/user/:userId', verifyToken, (req, res) => this.transaksiPenginapanController.getTransaksiPenginapanByUserId(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}
