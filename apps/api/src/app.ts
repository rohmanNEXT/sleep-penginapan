import express, {
  json,
  urlencoded,
  Express,
  Request,
  Response,
  NextFunction, 
} from 'express';
import cors from 'cors';
import { PORT } from './config';
import { AuthRouter } from './routers/auth.router';
import { UserRouter } from './routers/user.router';
import { PenginapanRouter } from './routers/penginapan.router';
import { BalanceRouter } from './routers/balance.router';
import { TransaksiBalanceRouter } from './routers/transaksi-balance.router';
import { TransaksiPenginapanRouter } from './routers/transaksi-penginapan.router';
import { ReviewRouter } from './routers/review.router';
import { CuponRouter } from './routers/cupon.router';
import { ReportRouter } from './routers/report.router';
import { apiLimiter, authLimiter } from './middleware/limiter.middleware';

export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
    this.handleError();
  }

  private configure(): void {
    this.app.use(cors());
    this.app.use(json({ limit: '10mb' }));
    this.app.use(urlencoded({ extended: true, limit: '10mb' }));
  }

  private handleError(): void {
    // not found
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.path.includes('/api/')) {
        res.status(404).send('Not found !');
      } else {
        next();
      }
    });

    // error
    this.app.use(
      (err: Error, req: Request, res: Response, next: NextFunction) => {
        if (req.path.includes('/api/')) {
          console.error('Error : ', err.stack);
          res.status(500).send('Error !');
        } else {
          next();
        }
      },
    );
  }

  private routes(): void {
    const authRouter = new AuthRouter();
    const userRouter = new UserRouter();
    const penginapanRouter = new PenginapanRouter();
    const balanceRouter = new BalanceRouter();
    const transaksiBalanceRouter = new TransaksiBalanceRouter();
    const transaksiPenginapanRouter = new TransaksiPenginapanRouter();
    const reviewRouter = new ReviewRouter();
    const cuponRouter = new CuponRouter();
    const reportRouter = new ReportRouter();

    // Rate Limiting
    this.app.use('/api', apiLimiter);
    this.app.use('/api/auth', authLimiter);

    this.app.get('/api', (req: Request, res: Response) => {
      res.send(`Hello, Purwadhika Student API!`);
    });

    this.app.use('/api/auth', authRouter.getRouter());
    this.app.use('/api/users', userRouter.getRouter());
    this.app.use('/api/penginapan', penginapanRouter.getRouter());
    this.app.use('/api/balances', balanceRouter.getRouter());
    this.app.use('/api/transaksi-balance', transaksiBalanceRouter.getRouter());
    this.app.use('/api/transaksi-penginapan', transaksiPenginapanRouter.getRouter());
    this.app.use('/api/reviews', reviewRouter.getRouter());
    this.app.use('/api/cupons', cuponRouter.getRouter());
    this.app.use('/api/report', reportRouter.getRouter());
  }

   public start(): void {
    this.app.listen(PORT, () => {
      console.log(`  ➜  [API] Local:   http://localhost:${PORT}/`);
    });
  }
}

