import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// List test cases (only accessible projects; optional filters: versionId, projectId, status, etc.)
router.get('/', async (req, res, next) => {
  try {
    const { versionId, projectId, status, severity, priority, search, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {
      version: {
        project: {
          OR: [
            { createdById: req.user.id },
            { members: { some: { userId: req.user.id } } },
          ],
        },
      },
    };
    if (versionId) where.versionId = parseInt(versionId);
    if (projectId) where.version.projectId = parseInt(projectId);
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (priority) where.priority = priority;
    if (search) {
      where.OR = [
        { bug: { contains: search, mode: 'insensitive' } },
        { test: { contains: search, mode: 'insensitive' } },
        { result: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [testCases, total] = await Promise.all([
      prisma.testCase.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true } },
          version: { include: { project: { select: { id: true, name: true } } } },
          images: { orderBy: { uploadedAt: 'desc' } },
        },
        skip, take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.testCase.count({ where }),
    ]);

    res.json({
      testCases,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / take) },
    });
  } catch (e) { next(e); }
});

// Get single test case (only if in an accessible project)
router.get('/:id', async (req, res, next) => {
  try {
    const tc = await prisma.testCase.findFirst({
      where: {
        id: parseInt(req.params.id),
        version: {
          project: {
            OR: [
              { createdById: req.user.id },
              { members: { some: { userId: req.user.id } } },
            ],
          },
        },
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        version: { include: { project: { select: { id: true, name: true, language: true } } } },
        images: { orderBy: { uploadedAt: 'desc' } },
      },
    });
    if (!tc) return res.status(404).json({ error: 'Not found' });
    res.json(tc);
  } catch (e) { next(e); }
});

// Create test case (only if version's project is accessible)
router.post('/', async (req, res, next) => {
  try {
    const { versionId, bug, test, result, severity, priority, notes } = req.body;
    if (!versionId || !bug || !test) return res.status(400).json({ error: 'versionId, bug, and test are required' });

    const version = await prisma.version.findFirst({
      where: {
        id: parseInt(versionId),
        project: {
          OR: [
            { createdById: req.user.id },
            { members: { some: { userId: req.user.id } } },
          ],
        },
      },
    });
    if (!version) return res.status(404).json({ error: 'Version not found' });

    const tc = await prisma.testCase.create({
      data: {
        versionId: parseInt(versionId),
        bug, test,
        result: result || null,
        severity: severity || 'Low',
        priority: priority || 'Low',
        notes: notes || null,
        createdById: req.user.id,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    res.status(201).json(tc);
  } catch (e) { next(e); }
});

// Update test case (only if in an accessible project)
router.put('/:id', async (req, res, next) => {
  try {
    const { bug, test, result, severity, priority, notes, isFixed, isVerified } = req.body;

    const existing = await prisma.testCase.findFirst({
      where: {
        id: parseInt(req.params.id),
        version: {
          project: {
            OR: [
              { createdById: req.user.id },
              { members: { some: { userId: req.user.id } } },
            ],
          },
        },
      },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    // Determine status from checkboxes
    let status = 'Open';
    let fixed = isFixed !== undefined ? isFixed : existing.isFixed;
    let verified = isVerified !== undefined ? isVerified : existing.isVerified;

    // Cannot verify if not fixed
    if (verified && !fixed) {
      verified = false;
    }

    if (verified) status = 'Verified';
    else if (fixed) status = 'Fixed';

    const data = {
      status,
      isFixed: fixed,
      isVerified: verified,
    };

    if (bug !== undefined) data.bug = bug;
    if (test !== undefined) data.test = test;
    if (result !== undefined) data.result = result;
    if (severity !== undefined) data.severity = severity;
    if (priority !== undefined) data.priority = priority;
    if (notes !== undefined) data.notes = notes;

    // Set testedAt when first fixed
    if (fixed && !existing.isFixed) {
      data.testedAt = new Date();
    }

    const tc = await prisma.testCase.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: {
        createdBy: { select: { id: true, name: true } },
        version: { include: { project: { select: { id: true, name: true } } } },
      },
    });
    res.json(tc);
  } catch (e) { next(e); }
});

// Bulk update (for checkbox toggling from table; only if in accessible project)
router.patch('/:id/toggle', async (req, res, next) => {
  try {
    const { field } = req.body; // 'isFixed' or 'isVerified'
    const existing = await prisma.testCase.findFirst({
      where: {
        id: parseInt(req.params.id),
        version: {
          project: {
            OR: [
              { createdById: req.user.id },
              { members: { some: { userId: req.user.id } } },
            ],
          },
        },
      },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    let fixed = existing.isFixed;
    let verified = existing.isVerified;

    if (field === 'isFixed') {
      fixed = !fixed;
      if (!fixed) verified = false; // un-fixing also un-verifies
    } else if (field === 'isVerified') {
      if (!fixed) return res.status(400).json({ error: 'Cannot verify before fixing' });
      verified = !verified;
    }

    let status = 'Open';
    if (verified) status = 'Verified';
    else if (fixed) status = 'Fixed';

    const data = { isFixed: fixed, isVerified: verified, status };
    if (fixed && !existing.isFixed) data.testedAt = new Date();

    const tc = await prisma.testCase.update({
      where: { id: parseInt(req.params.id) },
      data,
      include: { createdBy: { select: { id: true, name: true } } },
    });
    res.json(tc);
  } catch (e) { next(e); }
});

// Upload images to a test case (only if in accessible project; up to 5 at once)
router.post('/:id/images', upload.array('images', 5), async (req, res, next) => {
  try {
    const testCaseId = parseInt(req.params.id);
    const tc = await prisma.testCase.findFirst({
      where: {
        id: testCaseId,
        version: {
          project: {
            OR: [
              { createdById: req.user.id },
              { members: { some: { userId: req.user.id } } },
            ],
          },
        },
      },
    });
    if (!tc) return res.status(404).json({ error: 'Test case not found' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const records = req.files.map(f => ({
      testCaseId,
      filePath: f.filename,
      originalName: f.originalname,
    }));

    await prisma.testCaseImage.createMany({ data: records });

    const images = await prisma.testCaseImage.findMany({
      where: { testCaseId },
      orderBy: { uploadedAt: 'desc' },
    });

    res.json({ message: `${req.files.length} image(s) uploaded`, images });
  } catch (e) { next(e); }
});

// Delete a single image (only if test case is in accessible project)
router.delete('/images/:imageId', async (req, res, next) => {
  try {
    const image = await prisma.testCaseImage.findFirst({
      where: {
        id: parseInt(req.params.imageId),
        testCase: {
          version: {
            project: {
              OR: [
                { createdById: req.user.id },
                { members: { some: { userId: req.user.id } } },
              ],
            },
          },
        },
      },
    });
    if (!image) return res.status(404).json({ error: 'Image not found' });

    // Delete file from disk
    const fullPath = path.join(__dirname, '../../uploads', image.filePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    await prisma.testCaseImage.delete({ where: { id: image.id } });
    res.json({ message: 'Image deleted' });
  } catch (e) { next(e); }
});

// Delete test case (only if in accessible project)
router.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.testCase.findFirst({
      where: {
        id: parseInt(req.params.id),
        version: {
          project: {
            OR: [
              { createdById: req.user.id },
              { members: { some: { userId: req.user.id } } },
            ],
          },
        },
      },
    });
    if (!existing) return res.status(404).json({ error: 'Not found' });

    // Delete associated image files from disk
    const images = await prisma.testCaseImage.findMany({ where: { testCaseId: parseInt(req.params.id) } });
    images.forEach(img => {
      const fullPath = path.join(__dirname, '../../uploads', img.filePath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });
    await prisma.testCase.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Deleted' });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    next(e);
  }
});

export default router;
