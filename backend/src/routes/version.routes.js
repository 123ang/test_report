import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// List versions for a project (only if project is accessible to current user)
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { createdById: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const versions = await prisma.version.findMany({
      where: { projectId },
      include: {
        project: { select: { id: true, name: true } },
        _count: { select: { testCases: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(versions);
  } catch (e) { next(e); }
});

// Get single version with test cases (only if project is accessible)
router.get('/:id', async (req, res, next) => {
  try {
    const version = await prisma.version.findFirst({
      where: {
        id: parseInt(req.params.id),
        project: {
          OR: [
            { createdById: req.user.id },
            { members: { some: { userId: req.user.id } } },
          ],
        },
      },
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

// Create version (only if project is accessible)
router.post('/', async (req, res, next) => {
  try {
    const { projectId, name, description } = req.body;
    if (!projectId || !name) return res.status(400).json({ error: 'Project ID and name are required' });
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        OR: [
          { createdById: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const version = await prisma.version.create({
      data: { projectId: parseInt(projectId), name, description },
      include: { project: { select: { id: true, name: true } } },
    });
    res.status(201).json(version);
  } catch (e) { next(e); }
});

// Update version (only if project is accessible)
router.put('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.version.findFirst({
      where: {
        id: parseInt(req.params.id),
        project: {
          OR: [
            { createdById: req.user.id },
            { members: { some: { userId: req.user.id } } },
          ],
        },
      },
    });
    if (!existing) return res.status(404).json({ error: 'Version not found' });
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

// Delete version (only if project is accessible)
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.version.findFirst({
      where: {
        id: parseInt(req.params.id),
        project: {
          OR: [
            { createdById: req.user.id },
            { members: { some: { userId: req.user.id } } },
          ],
        },
      },
    });
    if (!existing) return res.status(404).json({ error: 'Version not found' });
    await prisma.version.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Version deleted' });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    next(e);
  }
});

export default router;
