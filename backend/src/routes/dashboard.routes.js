import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Summary stats (optional projectId filter)
router.get('/summary', async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const where = {};
    if (projectId) where.version = { projectId: parseInt(projectId) };

    const [total, open, fixed, verified] = await Promise.all([
      prisma.testCase.count({ where }),
      prisma.testCase.count({ where: { ...where, status: 'Open' } }),
      prisma.testCase.count({ where: { ...where, status: 'Fixed' } }),
      prisma.testCase.count({ where: { ...where, status: 'Verified' } }),
    ]);

    const [critical, high, medium, low] = await Promise.all([
      prisma.testCase.count({ where: { ...where, severity: 'Critical' } }),
      prisma.testCase.count({ where: { ...where, severity: 'High' } }),
      prisma.testCase.count({ where: { ...where, severity: 'Medium' } }),
      prisma.testCase.count({ where: { ...where, severity: 'Low' } }),
    ]);

    const fixRate = total > 0 ? (((fixed + verified) / total) * 100).toFixed(1) : 0;

    res.json({ total, byStatus: { open, fixed, verified }, bySeverity: { critical, high, medium, low }, fixRate: parseFloat(fixRate) });
  } catch (e) { next(e); }
});

// Trends over time
router.get('/trends', async (req, res, next) => {
  try {
    const { days = 30, projectId } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const where = { createdAt: { gte: startDate } };
    if (projectId) where.version = { projectId: parseInt(projectId) };

    const testCases = await prisma.testCase.findMany({ where, select: { createdAt: true, status: true }, orderBy: { createdAt: 'asc' } });

    const map = {};
    testCases.forEach(tc => {
      const date = tc.createdAt.toISOString().split('T')[0];
      if (!map[date]) map[date] = { date, open: 0, fixed: 0, verified: 0, total: 0 };
      map[date][tc.status.toLowerCase()]++;
      map[date].total++;
    });

    res.json({ trends: Object.values(map).sort((a, b) => new Date(a.date) - new Date(b.date)) });
  } catch (e) { next(e); }
});

// Stats by project
router.get('/by-project', async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      include: { versions: { include: { testCases: { select: { status: true, severity: true } } } } },
    });

    const stats = projects.map(p => {
      const s = { projectId: p.id, projectName: p.name, open: 0, fixed: 0, verified: 0, total: 0 };
      p.versions.forEach(v => v.testCases.forEach(tc => {
        s[tc.status.toLowerCase()]++;
        s.total++;
      }));
      return s;
    }).sort((a, b) => b.total - a.total);

    res.json({ projects: stats });
  } catch (e) { next(e); }
});

// Recent test cases
router.get('/recent', async (req, res, next) => {
  try {
    const { limit = 10, projectId } = req.query;
    const where = {};
    if (projectId) where.version = { projectId: parseInt(projectId) };

    const recent = await prisma.testCase.findMany({
      where,
      take: parseInt(limit),
      orderBy: { updatedAt: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true } },
        version: { include: { project: { select: { id: true, name: true } } } },
      },
    });

    res.json({ recent });
  } catch (e) { next(e); }
});

export default router;
