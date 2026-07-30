import { TransaksiBalanceController } from '@/controllers/transaksi-balance.controller';
import { Router } from 'express';
import { verifyToken } from '@/middleware/auth.middleware';

export class TransaksiBalanceRouter {
  private router: Router;
  private controller: TransaksiBalanceController;

  constructor() {
    this.controller = new TransaksiBalanceController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/', verifyToken, (req, res) => this.controller.createTransaksiBalance(req, res));
    this.router.post('/withdraw', verifyToken, (req, res) => this.controller.withdrawBalance(req, res));
    this.router.get('/user/:userId', verifyToken, (req, res) => this.controller.getTransaksiBalanceByUserId(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}
