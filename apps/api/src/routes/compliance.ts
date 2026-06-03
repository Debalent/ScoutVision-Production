import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const VALID_SEVERITY = ['info', 'warning', 'violation'] as const;
const VALID_TYPES = ['contact_violation', 'dead_period_contact', 'impermissible_benefit', 'visit_issue', 'communication_issue', 'eligibility_concern', 'other'] as const;

// GET /compliance/events
router.get('/events', async (_req: Request, res: Response) => {
  const events = await prisma.complianceEvent.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(events);
});

// POST /compliance/events — allowlist fields (CWE-94)
router.post('/events', async (req: Request, res: Response) => {
  try {
    const { type, severity, title, details, prospectId, programId, userId } = req.body as Record<string, unknown>;

    if (!VALID_TYPES.includes(type as typeof VALID_TYPES[number])) {
      return res.status(400).json({ error: 'Invalid event type' });
    }
    if (!VALID_SEVERITY.includes(severity as typeof VALID_SEVERITY[number])) {
      return res.status(400).json({ error: 'Invalid severity' });
    }
    if (!details) {
      return res.status(400).json({ error: 'details is required' });
    }

    const event = await prisma.complianceEvent.create({
      data: {
        type: String(type),
        severity: String(severity),
        title: title ? String(title) : String(type),
        details: String(details),
        resolved: false,
        prospectId: prospectId ? String(prospectId) : null,
        programId: programId ? String(programId) : undefined,
        userId: userId ? String(userId) : undefined,
      },
    });
    res.status(201).json(event);
  } catch (e) {
    res.status(400).json({ error: 'Invalid data' });
  }
});

export default router;
