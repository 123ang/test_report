import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all test runs with pagination and filters
export const getTestRuns = async (req, res) => {
  try {
    const {
      testCaseId,
      status,
      testerId,
      from,
      to,
      page = 1,
      limit = 10,
      lang = 'en'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};
    if (testCaseId) where.testCaseId = parseInt(testCaseId);
    if (status) where.status = status;
    if (testerId) where.testerId = parseInt(testerId);
    if (from || to) {
      where.executedAt = {};
      if (from) where.executedAt.gte = new Date(from);
      if (to) where.executedAt.lte = new Date(to);
    }

    // Get test runs
    const testRuns = await prisma.testRun.findMany({
      where,
      include: {
        testCase: {
          include: {
            translations: {
              where: { language: lang }
            }
          }
        },
        tester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        images: true
      },
      skip,
      take,
      orderBy: { executedAt: 'desc' }
    });

    // Get total count
    const total = await prisma.testRun.count({ where });

    res.json({
      testRuns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get test runs error:', error);
    res.status(500).json({ error: 'Failed to fetch test runs' });
  }
};

// Get single test run by ID
export const getTestRunById = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang = 'en' } = req.query;

    const testRun = await prisma.testRun.findUnique({
      where: { id: parseInt(id) },
      include: {
        testCase: {
          include: {
            translations: {
              where: { language: lang }
            }
          }
        },
        tester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        images: true
      }
    });

    if (!testRun) {
      return res.status(404).json({ error: 'Test run not found' });
    }

    res.json({ testRun });
  } catch (error) {
    console.error('Get test run error:', error);
    res.status(500).json({ error: 'Failed to fetch test run' });
  }
};

// Create new test run
export const createTestRun = async (req, res) => {
  try {
    const {
      testCaseId,
      status,
      actualResult,
      environment,
      severity,
      priority,
      notes
    } = req.body;

    // Validate input
    if (!testCaseId || !status) {
      return res.status(400).json({ error: 'Test case ID and status are required' });
    }

    // Check if test case exists
    const testCase = await prisma.testCase.findUnique({
      where: { id: parseInt(testCaseId) }
    });

    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }

    // Create test run
    const testRun = await prisma.testRun.create({
      data: {
        testCaseId: parseInt(testCaseId),
        testerId: req.user.id,
        status,
        actualResult: actualResult || null,
        environment: environment || null,
        severity: severity || null,
        priority: priority || null,
        notes: notes || null
      },
      include: {
        testCase: {
          include: {
            translations: true
          }
        },
        tester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Test run created successfully',
      testRun
    });
  } catch (error) {
    console.error('Create test run error:', error);
    res.status(500).json({ error: 'Failed to create test run' });
  }
};

// Update test run
export const updateTestRun = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      actualResult,
      environment,
      severity,
      priority,
      notes
    } = req.body;

    // Check if test run exists
    const existingTestRun = await prisma.testRun.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTestRun) {
      return res.status(404).json({ error: 'Test run not found' });
    }

    // Update test run
    const testRun = await prisma.testRun.update({
      where: { id: parseInt(id) },
      data: {
        status: status || existingTestRun.status,
        actualResult: actualResult !== undefined ? actualResult : existingTestRun.actualResult,
        environment: environment !== undefined ? environment : existingTestRun.environment,
        severity: severity !== undefined ? severity : existingTestRun.severity,
        priority: priority !== undefined ? priority : existingTestRun.priority,
        notes: notes !== undefined ? notes : existingTestRun.notes
      },
      include: {
        testCase: {
          include: {
            translations: true
          }
        },
        tester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        images: true
      }
    });

    res.json({
      message: 'Test run updated successfully',
      testRun
    });
  } catch (error) {
    console.error('Update test run error:', error);
    res.status(500).json({ error: 'Failed to update test run' });
  }
};

// Upload screenshots for test run
export const uploadScreenshots = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if test run exists
    const testRun = await prisma.testRun.findUnique({
      where: { id: parseInt(id) }
    });

    if (!testRun) {
      return res.status(404).json({ error: 'Test run not found' });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Create image records
    const images = await Promise.all(
      req.files.map(file =>
        prisma.testRunImage.create({
          data: {
            testRunId: parseInt(id),
            filePath: `/uploads/${file.filename}`,
            originalName: file.originalname
          }
        })
      )
    );

    res.status(201).json({
      message: 'Screenshots uploaded successfully',
      images
    });
  } catch (error) {
    console.error('Upload screenshots error:', error);
    res.status(500).json({ error: 'Failed to upload screenshots' });
  }
};
