import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware.js';
import csv from 'csv-parser';
import { Transform } from 'stream';
import { Readable } from 'stream';

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Export test cases as CSV (only accessible projects; optional versionId or projectId filter)
router.get('/export', async (req, res, next) => {
  try {
    const { versionId, projectId } = req.query;
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

    const testCases = await prisma.testCase.findMany({
      where,
      include: {
        version: { include: { project: { select: { name: true } } } },
        createdBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const header = 'id,project,version,bug,test,result,status,is_fixed,is_verified,severity,priority,notes,created_by,created_at\n';
    const rows = testCases.map(tc => {
      const esc = (s) => s ? `"${String(s).replace(/"/g, '""')}"` : '';
      return [
        tc.id,
        esc(tc.version.project.name),
        esc(tc.version.name),
        esc(tc.bug),
        esc(tc.test),
        esc(tc.result),
        tc.status,
        tc.isFixed,
        tc.isVerified,
        tc.severity,
        tc.priority,
        esc(tc.notes),
        esc(tc.createdBy.name),
        tc.createdAt.toISOString().split('T')[0],
      ].join(',');
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=test-cases.csv');
    res.send(header + rows);
  } catch (e) { next(e); }
});

// Import test cases from CSV (only into a version in accessible project)
router.post('/import', express.text({ type: 'text/csv', limit: '10mb' }), async (req, res, next) => {
  try {
    const { versionId } = req.query;
    if (!versionId) return res.status(400).json({ error: 'versionId query param is required' });

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

    const lines = req.body.split('\n').filter(l => l.trim());
    if (lines.length < 2) return res.status(400).json({ error: 'CSV must have a header row and at least one data row' });

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const bugIdx = headers.indexOf('bug');
    const testIdx = headers.indexOf('test');
    const resultIdx = headers.indexOf('result');
    const severityIdx = headers.indexOf('severity');
    const priorityIdx = headers.indexOf('priority');
    const notesIdx = headers.indexOf('notes');

    if (bugIdx === -1 || testIdx === -1) {
      return res.status(400).json({ error: 'CSV must have "bug" and "test" columns' });
    }

    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      records.push({
        versionId: parseInt(versionId),
        bug: cols[bugIdx] || '',
        test: cols[testIdx] || '',
        result: resultIdx >= 0 ? cols[resultIdx] || null : null,
        severity: severityIdx >= 0 ? cols[severityIdx] || 'Low' : 'Low',
        priority: priorityIdx >= 0 ? cols[priorityIdx] || 'Low' : 'Low',
        notes: notesIdx >= 0 ? cols[notesIdx] || null : null,
        createdById: req.user.id,
      });
    }

    const created = await prisma.testCase.createMany({ data: records });
    res.json({ message: `Imported ${created.count} test cases`, count: created.count });
  } catch (e) { next(e); }
});

// Download CSV template
router.get('/template', (req, res) => {
  const template = 'bug,test,result,severity,priority,notes\n"Login Bug","Enter invalid password and check error message","Error message displays correctly","High","High","Test on both mobile and desktop"\n"Cart Total","Add 2 items ($10 each) and verify total","$20 displayed","Medium","Medium","Check tax calculation"\n"Search Function","Search for product name and verify results","10 results shown","Low","Low",""\n';
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=test-case-template.csv');
  res.send(template);
});

export default router;
