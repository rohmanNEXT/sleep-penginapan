import { AuthController } from '@/controllers/auth.controller';
import { authLimiter } from '@/middleware/limiter.middleware';
import { verifyToken } from '@/middleware/auth.middleware';
import { Router } from 'express';

export class AuthRouter {
  private router: Router;
  private authController: AuthController;

  constructor() {
    this.authController = new AuthController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/register', authLimiter, (req, res) => this.authController.register(req, res));
    this.router.post('/login', authLimiter, (req, res) => this.authController.login(req, res));
    this.router.get('/keep-login', verifyToken, (req, res) => this.authController.keepLogin(req as any, res));
    this.router.get('/verify-email', (req, res) => this.authController.verifyEmail(req, res));
    this.router.post('/forgot-password', authLimiter, (req, res) => this.authController.forgotPassword(req, res));
    this.router.post('/reset-password', authLimiter, (req, res) => this.authController.resetPassword(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}
