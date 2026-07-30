import { UserController } from '@/controllers/user.controller';
import { Router } from 'express';
import { upload } from '@/utils/multer';

export class UserRouter {
  private router: Router;
  private userController: UserController;

  constructor() {
    this.userController = new UserController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', (req, res) => this.userController.getUsers(req, res));
    this.router.get('/:id', (req, res) => this.userController.getUserById(req, res));
    this.router.put('/:id', upload.single('profileImage'), (req, res) => this.userController.updateProfile(req, res));
    this.router.post('/:id/save', (req, res) => this.userController.savePenginapan(req, res));
    this.router.post('/:id/unsave', (req, res) => this.userController.unsavePenginapan(req, res));
  }

  getRouter(): Router {
    return this.router;
  }
}
