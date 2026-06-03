import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import prospectsRoutes from './routes/prospects';
import complianceRoutes from './routes/compliance';
import billingRoutes from './routes/billing';

dotenv.config();

const app = express();

// ─── CORS — only allow trusted origins ──────────────────────────────
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin / server-to-server (no origin header)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ─── Require JSON Content-Type on mutating requests (CSRF mitigation) ─
app.use((req: Request, res: Response, next: NextFunction) => {
  const mutating = ['POST', 'PATCH', 'PUT', 'DELETE'];
  if (mutating.includes(req.method)) {
    const ct = req.headers['content-type'] ?? '';
    if (!ct.includes('application/json')) {
      return res.status(415).json({ error: 'Content-Type must be application/json' });
    }
  }
  next();
});

app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Scout Vision API' });
});

app.use('/auth', authRoutes);
app.use('/prospects', prospectsRoutes);
app.use('/compliance', complianceRoutes);
app.use('/billing', billingRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Scout Vision API running on port ${PORT}`);
});
