import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /prospects
router.get('/', async (req, res) => {
  const prospects = await prisma.prospect.findMany({
    include: {
      stats: true,
      academics: true,
      stage: true,
      notes: true,
      evaluations: true,
      videos: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(prospects);
});

// POST /prospects
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const prospect = await prisma.prospect.create({ data });
    res.status(201).json(prospect);
  } catch (e) {
    res.status(400).json({ error: 'Invalid data', details: e });
  }
});

// PATCH /prospects/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const prospect = await prisma.prospect.update({ where: { id }, data });
    res.json(prospect);
  } catch (e) {
    res.status(400).json({ error: 'Update failed', details: e });
  }
});

// DELETE /prospects/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.prospect.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    res.status(400).json({ error: 'Delete failed', details: e });
  }
});

export default router;
