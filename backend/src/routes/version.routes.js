import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// List versions for a project
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const versions = await prisma.version.findMany({
      where: { projectId: parseInt(req.params.projectId) },
      include: {
        project: { select: { id: true, name: true } },
        _count: { select: { testCases: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(versions);
  } catch (e) { next(e); }
});

// Get single version with test cases
router.get('/:id', async (req, res, next) => {
  try {
    const version = await prisma.version.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        project: { select: { id: true, name: true, language: true } },
        testCases: {
          include: {
            createdBy: { select: { id: true, name: true } },
            images: { orderBy: { uploadedAt: 'desc' } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!version) return res.status(404).json({ error: 'Version not found' });
    res.json(version);
  } catch (e) { next(e); }
});

// Create version
router.post('/', async (req, res, next) => {
  try {
    const { projectId, name, description } = req.body;
    if (!projectId || !name) return res.status(400).json({ error: 'Project ID and name are required' });
    const version = await prisma.version.create({
      data: { projectId: parseInt(projectId), name, description },
      include: { project: { select: { id: true, name: true } } },
    });
    res.status(201).json(version);
  } catch (e) { next(e); }
});

// Update version
router.put('/:id', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const version = await prisma.version.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description },
      include: { project: { select: { id: true, name: true } } },
    });
    res.json(version);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    next(e);
  }
});

// Delete version
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.version.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Version deleted' });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    next(e);
  }
});

export default router;
