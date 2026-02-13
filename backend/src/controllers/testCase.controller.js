import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all test cases with pagination and filters
export const getTestCases = async (req, res) => {
  try {
    const {
      appName,
      search,
      page = 1,
      limit = 10,
      lang = 'en'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};
    if (appName) {
      where.appName = { contains: appName, mode: 'insensitive' };
    }

    // Get test cases
    const testCases = await prisma.testCase.findMany({
      where,
      include: {
        translations: {
          where: { language: lang }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { testRuns: true }
        }
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' }
    });

    // Filter by search term if provided
    let filteredTestCases = testCases;
    if (search) {
      filteredTestCases = testCases.filter(tc => 
        tc.translations.some(t => 
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
        )
      );
    }

    // Get total count
    const total = await prisma.testCase.count({ where });

    res.json({
      testCases: filteredTestCases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get test cases error:', error);
    res.status(500).json({ error: 'Failed to fetch test cases' });
  }
};

// Get single test case by ID
export const getTestCaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const { lang } = req.query;

    const testCase = await prisma.testCase.findUnique({
      where: { id: parseInt(id) },
      include: {
        translations: lang ? { where: { language: lang } } : true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { testRuns: true }
        }
      }
    });

    if (!testCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }

    res.json({ testCase });
  } catch (error) {
    console.error('Get test case error:', error);
    res.status(500).json({ error: 'Failed to fetch test case' });
  }
};

// Create new test case
export const createTestCase = async (req, res) => {
  try {
    const { appName, templateKey, translations } = req.body;

    // Validate input
    if (!appName || !translations || translations.length === 0) {
      return res.status(400).json({ error: 'App name and at least one translation are required' });
    }

    // Create test case with translations
    const testCase = await prisma.testCase.create({
      data: {
        appName,
        templateKey,
        createdById: req.user.id,
        translations: {
          create: translations.map(t => ({
            language: t.language,
            title: t.title,
            description: t.description || null,
            steps: t.steps,
            expectedResult: t.expectedResult
          }))
        }
      },
      include: {
        translations: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Test case created successfully',
      testCase
    });
  } catch (error) {
    console.error('Create test case error:', error);
    res.status(500).json({ error: 'Failed to create test case' });
  }
};

// Update test case
export const updateTestCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { appName, templateKey, translations } = req.body;

    // Check if test case exists
    const existingTestCase = await prisma.testCase.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTestCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }

    // Delete existing translations
    await prisma.testCaseTranslation.deleteMany({
      where: { testCaseId: parseInt(id) }
    });

    // Update test case with new translations
    const testCase = await prisma.testCase.update({
      where: { id: parseInt(id) },
      data: {
        appName,
        templateKey,
        translations: {
          create: translations.map(t => ({
            language: t.language,
            title: t.title,
            description: t.description || null,
            steps: t.steps,
            expectedResult: t.expectedResult
          }))
        }
      },
      include: {
        translations: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json({
      message: 'Test case updated successfully',
      testCase
    });
  } catch (error) {
    console.error('Update test case error:', error);
    res.status(500).json({ error: 'Failed to update test case' });
  }
};

// Delete test case
export const deleteTestCase = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if test case exists
    const existingTestCase = await prisma.testCase.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTestCase) {
      return res.status(404).json({ error: 'Test case not found' });
    }

    // Delete test case (cascade will delete translations and test runs)
    await prisma.testCase.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Test case deleted successfully' });
  } catch (error) {
    console.error('Delete test case error:', error);
    res.status(500).json({ error: 'Failed to delete test case' });
  }
};
