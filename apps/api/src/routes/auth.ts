import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return secret;
}

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id, role: user.roleId }, getJwtSecret(), { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, email: user.email, role: user.roleId } });
});

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { email, password, name, roleId } = req.body as { email?: string; password?: string; name?: string; roleId?: string };
  if (!email || !password || !name || !roleId) {
    return res.status(400).json({ error: 'email, password, name, and roleId are required' });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already in use' });
  const hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hash, name, roleId },
  });
  res.status(201).json({ id: user.id, email: user.email, role: user.roleId });
});

export default router;
