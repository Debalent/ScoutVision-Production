import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';


import authRoutes from './routes/auth';

import prospectsRoutes from './routes/prospects';
import complianceRoutes from './routes/compliance';
import billingRoutes from './routes/billing';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Scout Vision API' });
});


app.use('/auth', authRoutes);
app.use('/prospects', prospectsRoutes);

app.use('/compliance', complianceRoutes);
app.use('/billing', billingRoutes);
// app.use('/programs', programsRoutes);
// ...other modules

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Scout Vision API running on port ${PORT}`);
});
