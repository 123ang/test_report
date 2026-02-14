import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Helper: check if user can access project (creator or member)
const canAccessProject = async (projectId, userId) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { createdById: userId },
        { members: { some: { userId } } },
      ],
    },
  });
  return !!project;
};

// List all projects (created by or member of)
router.get('/', async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { createdById: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { versions: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(projects);
  } catch (e) {
    console.error('GET /projects error:', e?.message || e);
    next(e);
  }
});

// Get single project with versions (only if owned by or member of)
router.get('/:id', async (req, res, next) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(req.params.id),
        OR: [
          { createdById: req.user.id },
          { members: { some: { userId: req.user.id } } },
        ],
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
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

// Update project (only owner or member can update; only owner can add/remove members)
router.put('/:id', async (req, res, next) => {
  try {
    const { name, description, language } = req.body;
    const hasAccess = await canAccessProject(parseInt(req.params.id), req.user.id);
    if (!hasAccess) return res.status(404).json({ error: 'Project not found' });
    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id) },
      data: { name, description, language },
      include: { 
        createdBy: { select: { id: true, name: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });
    res.json(project);
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    next(e);
  }
});

// Delete project (only owner can delete)
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.project.findFirst({
      where: { id: parseInt(req.params.id), createdById: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: 'Project not found or you are not the owner' });
    await prisma.project.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Project deleted' });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    next(e);
  }
});

// Add member to project (only owner)
router.post('/:id/members', async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id);
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const project = await prisma.project.findFirst({
      where: { id: projectId, createdById: req.user.id },
    });
    if (!project) return res.status(404).json({ error: 'Project not found or you are not the owner' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not registered. Please ask them to create an account first.' });

    if (user.id === req.user.id) return res.status(400).json({ error: 'You are already the owner of this project' });

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
    });
    if (existing) return res.status(400).json({ error: 'User is already a member' });

    await prisma.projectMember.create({
      data: { projectId, userId: user.id },
    });

    const updated = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } },
    });

    res.json({ message: 'Member added', members: updated.members });
  } catch (e) { next(e); }
});

// Remove member from project (only owner)
router.delete('/:id/members/:memberId', async (req, res, next) => {
  try {
    const projectId = parseInt(req.params.id);
    const memberId = parseInt(req.params.memberId);

    const project = await prisma.project.findFirst({
      where: { id: projectId, createdById: req.user.id },
    });
    if (!project) return res.status(404).json({ error: 'Project not found or you are not the owner' });

    await prisma.projectMember.delete({
      where: { id: memberId },
    });

    res.json({ message: 'Member removed' });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Member not found' });
    next(e);
  }
});

export default router;
