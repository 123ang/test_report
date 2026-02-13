import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// List all projects
router.get('/', async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { versions: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(projects);
  } catch (e) { next(e); }
});

// Get single project with versions
router.get('/:id', async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        createdBy: { select: { id: true, name: true } },
        versions: {
          include: { _count: { select: { testCases: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (e) { next(e); }
});

// Create project
router.post('/', async (req, res, next) => {
  try {
    const { name, description, language } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const project = await prisma.project.create({
      data: { name, description, language: language || 'en', createdById: req.user.id },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    res.status(201).json(project);
  } catch (e) { next(e); }
});

// Update project
router.put('/:id', async (req, res, next) => {
  try {
    const { name, description, language } = req.body;
    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description, language },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    res.json(project);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    next(e);
  }
});

// Delete project
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Project deleted' });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    next(e);
  }
});

export default router;
