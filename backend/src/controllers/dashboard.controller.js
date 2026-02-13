import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get summary statistics
export const getSummary = async (req, res) => {
  try {
    const { from, to } = req.query;

    // Build where clause for date range
    const where = {};
    if (from || to) {
      where.executedAt = {};
      if (from) where.executedAt.gte = new Date(from);
      if (to) where.executedAt.lte = new Date(to);
    }

    // Get total test runs
    const total = await prisma.testRun.count({ where });

    // Get counts by status
    const pass = await prisma.testRun.count({ where: { ...where, status: 'pass' } });
    const fail = await prisma.testRun.count({ where: { ...where, status: 'fail' } });
    const blocked = await prisma.testRun.count({ where: { ...where, status: 'blocked' } });
    const skipped = await prisma.testRun.count({ where: { ...where, status: 'skipped' } });

    // Calculate pass rate
    const passRate = total > 0 ? ((pass / total) * 100).toFixed(2) : 0;

    res.json({
      total,
      pass,
      fail,
      blocked,
      skipped,
      passRate: parseFloat(passRate)
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
};

// Get trends over time
export const getTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get all test runs within the date range
    const testRuns = await prisma.testRun.findMany({
      where: {
        executedAt: {
          gte: startDate
        }
      },
      select: {
        executedAt: true,
        status: true
      },
      orderBy: {
        executedAt: 'asc'
      }
    });

    // Group by date
    const trendsMap = {};
    
    testRuns.forEach(run => {
      const date = run.executedAt.toISOString().split('T')[0];
      
      if (!trendsMap[date]) {
        trendsMap[date] = { date, pass: 0, fail: 0, blocked: 0, skipped: 0, total: 0 };
      }
      
      trendsMap[date][run.status]++;
      trendsMap[date].total++;
    });

    // Convert to array and sort by date
    const trends = Object.values(trendsMap).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    res.json({ trends });
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
};

// Get results grouped by app
export const getByApp = async (req, res) => {
  try {
    // Get all test cases with their test runs
    const testCases = await prisma.testCase.findMany({
      select: {
        appName: true,
        testRuns: {
          select: {
            status: true
          }
        }
      }
    });

    // Group by app name
    const appsMap = {};
    
    testCases.forEach(tc => {
      if (!appsMap[tc.appName]) {
        appsMap[tc.appName] = { appName: tc.appName, pass: 0, fail: 0, blocked: 0, skipped: 0, total: 0 };
      }
      
      tc.testRuns.forEach(run => {
        appsMap[tc.appName][run.status]++;
        appsMap[tc.appName].total++;
      });
    });

    // Convert to array and sort by total
    const apps = Object.values(appsMap).sort((a, b) => b.total - a.total);

    res.json({ apps });
  } catch (error) {
    console.error('Get by app error:', error);
    res.status(500).json({ error: 'Failed to fetch app statistics' });
  }
};

// Get recent activity
export const getRecent = async (req, res) => {
  try {
    const { limit = 10, lang = 'en' } = req.query;

    const recentRuns = await prisma.testRun.findMany({
      take: parseInt(limit),
      orderBy: {
        executedAt: 'desc'
      },
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
        }
      }
    });

    res.json({ recentRuns });
  } catch (error) {
    console.error('Get recent error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};
