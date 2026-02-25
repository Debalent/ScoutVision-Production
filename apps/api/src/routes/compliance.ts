import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /compliance/events
router.get('/events', async (req, res) => {
  const events = await prisma.complianceEvent.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(events);
});

// POST /compliance/events
router.post('/events', async (req, res) => {
  try {
    const data = req.body;
    const event = await prisma.complianceEvent.create({ data });
    res.status(201).json(event);
  } catch (e) {
    res.status(400).json({ error: 'Invalid data', details: e });
  }
});

export default router;
