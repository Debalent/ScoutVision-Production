import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /prospects
router.get('/', async (_req: Request, res: Response) => {
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

// POST /prospects — allowlist fields to prevent mass-assignment (CWE-94)
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      firstName, lastName, email, phone, position, highSchool, city, state,
      classYear, height, weight, hudlUrl, bio, tags, stageId, programId,
    } = req.body as Record<string, unknown>;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'firstName and lastName are required' });
    }

    const prospect = await prisma.prospect.create({
      data: {
        firstName: String(firstName),
        lastName: String(lastName),
        email: email ? String(email) : null,
        phone: phone ? String(phone) : null,
        position: position ? String(position) : null,
        highSchool: highSchool ? String(highSchool) : null,
        city: city ? String(city) : null,
        state: state ? String(state) : null,
        classYear: classYear ? Number(classYear) : new Date().getFullYear() + 1,
        height: height ? String(height) : null,
        weight: weight ? Number(weight) : null,
        hudlUrl: hudlUrl ? String(hudlUrl) : null,
        bio: bio ? String(bio) : null,
        tags: Array.isArray(tags) ? (tags as string[]).map(String) : [],
        stageId: stageId ? String(stageId) : undefined,
        programId: programId ? String(programId) : undefined,
      },
    });
    res.status(201).json(prospect);
  } catch (e) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

// PATCH /prospects/:id — allowlist fields to prevent mass-assignment (CWE-94)
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      firstName, lastName, email, phone, position, highSchool, city, state,
      classYear, height, weight, hudlUrl, bio, tags, stageId, status,
    } = req.body as Record<string, unknown>;

    const data: Record<string, unknown> = {};
    if (firstName !== undefined) data.firstName = String(firstName);
    if (lastName !== undefined) data.lastName = String(lastName);
    if (email !== undefined) data.email = email ? String(email) : null;
    if (phone !== undefined) data.phone = phone ? String(phone) : null;
    if (position !== undefined) data.position = position ? String(position) : null;
    if (highSchool !== undefined) data.highSchool = highSchool ? String(highSchool) : null;
    if (city !== undefined) data.city = city ? String(city) : null;
    if (state !== undefined) data.state = state ? String(state) : null;
    if (classYear !== undefined) data.classYear = Number(classYear);
    if (height !== undefined) data.height = height ? String(height) : null;
    if (weight !== undefined) data.weight = weight ? Number(weight) : null;
    if (hudlUrl !== undefined) data.hudlUrl = hudlUrl ? String(hudlUrl) : null;
    if (bio !== undefined) data.bio = bio ? String(bio) : null;
    if (tags !== undefined) data.tags = Array.isArray(tags) ? (tags as string[]).map(String) : [];
    if (stageId !== undefined) data.stageId = String(stageId);
    if (status !== undefined) data.status = String(status);

    const prospect = await prisma.prospect.update({ where: { id }, data });
    res.json(prospect);
  } catch (e) {
    res.status(400).json({ error: 'Update failed' });
  }
});

// DELETE /prospects/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.prospect.delete({ where: { id } });
    res.status(204).end();
  } catch (e) {
    res.status(400).json({ error: 'Delete failed' });
  }
});

export default router;
