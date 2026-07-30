import { BalanceController } from '@/controllers/balance.controller';
import { Router } from 'express';
import { verifyToken } from '@/middleware/auth.middleware';

export class BalanceRouter {
  private router: Router;
  private balanceController: BalanceController;

  constructor() {
    this.balanceController = new BalanceController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/:userId', verifyToken, (req, res) => this.balanceController.getBalanceByUserId(req, res));
    this.router.put('/:userId', verifyToken, (req, res) => this.balanceController.updateBalance(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}
