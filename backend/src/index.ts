import './config/env';
import './config/passport';
import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Global Error Handler:', err); // Log full object
  console.error('Stack:', err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message }); // Send message back for now to help debug
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
