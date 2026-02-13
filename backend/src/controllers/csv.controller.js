import { PrismaClient } from '@prisma/client';
import { Parser } from 'json2csv';
import csvParser from 'csv-parser';
import { Readable } from 'stream';

const prisma = new PrismaClient();

// Download CSV template
export const downloadTemplate = (req, res) => {
  try {
    const template = 'appName,language,title,description,steps,expectedResult\n' +
                    'MyApp,en,Sample Test,Test description,"1. Step one|2. Step two|3. Step three",Expected result here\n' +
                    'MyApp,ja,サンプルテスト,テストの説明,"1. ステップ1|2. ステップ2|3. ステップ3",期待される結果';

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=test-case-template.csv');
    res.send(template);
  } catch (error) {
    console.error('Download template error:', error);
    res.status(500).json({ error: 'Failed to download template' });
  }
};

// Import test cases from CSV
export const importTestCases = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const fileContent = req.file.buffer.toString('utf-8');
    
    // Parse CSV
    await new Promise((resolve, reject) => {
      Readable.from(fileContent)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    if (results.length === 0) {
      return res.status(400).json({ error: 'CSV file is empty' });
    }

    // Group rows by appName and title (English title as key)
    const testCasesMap = {};
    
    results.forEach(row => {
      const key = `${row.appName}_${row.language === 'en' ? row.title : ''}`;
      
      if (!testCasesMap[row.appName]) {
        testCasesMap[row.appName] = {};
      }
      
      // Find or create test case group
      let testCaseGroup = Object.values(testCasesMap[row.appName]).find(tc => 
        tc.translations.some(t => t.language === 'en' && t.title === row.title) ||
        tc.translations.length === 0
      );
      
      if (!testCaseGroup) {
        testCaseGroup = {
          appName: row.appName,
          translations: []
        };
        testCasesMap[row.appName][row.title] = testCaseGroup;
      }
      
      // Add translation
      testCaseGroup.translations.push({
        language: row.language,
        title: row.title,
        description: row.description || null,
        steps: row.steps.replace(/\|/g, '\n'), // Convert pipe to newline
        expectedResult: row.expectedResult
      });
    });

    // Create test cases in database
    const createdTestCases = [];
    
    for (const appName in testCasesMap) {
      for (const title in testCasesMap[appName]) {
        const tcData = testCasesMap[appName][title];
        
        const testCase = await prisma.testCase.create({
          data: {
            appName: tcData.appName,
            createdById: req.user.id,
            translations: {
              create: tcData.translations
            }
          },
          include: {
            translations: true
          }
        });
        
        createdTestCases.push(testCase);
      }
    }

    res.status(201).json({
      message: `Successfully imported ${createdTestCases.length} test case(s)`,
      testCases: createdTestCases
    });
  } catch (error) {
    console.error('Import CSV error:', error);
    res.status(500).json({ error: 'Failed to import CSV' });
  }
};

// Export test cases to CSV
export const exportTestCases = async (req, res) => {
  try {
    const testCases = await prisma.testCase.findMany({
      include: {
        translations: true
      }
    });

    // Flatten data for CSV
    const csvData = [];
    testCases.forEach(tc => {
      tc.translations.forEach(t => {
        csvData.push({
          appName: tc.appName,
          language: t.language,
          title: t.title,
          description: t.description || '',
          steps: t.steps.replace(/\n/g, '|'), // Convert newline to pipe
          expectedResult: t.expectedResult
        });
      });
    });

    // Convert to CSV
    const parser = new Parser({
      fields: ['appName', 'language', 'title', 'description', 'steps', 'expectedResult']
    });
    const csv = parser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=test-cases-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export test cases error:', error);
    res.status(500).json({ error: 'Failed to export test cases' });
  }
};

// Export test runs to CSV
export const exportTestRuns = async (req, res) => {
  try {
    const { lang = 'en' } = req.query;

    const testRuns = await prisma.testRun.findMany({
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
            name: true
          }
        }
      },
      orderBy: {
        executedAt: 'desc'
      }
    });

    // Flatten data for CSV
    const csvData = testRuns.map(run => ({
      id: run.id,
      testCaseTitle: run.testCase.translations[0]?.title || 'N/A',
      appName: run.testCase.appName,
      tester: run.tester.name,
      status: run.status,
      actualResult: run.actualResult || '',
      environment: run.environment || '',
      severity: run.severity || '',
      priority: run.priority || '',
      notes: run.notes || '',
      executedAt: run.executedAt.toISOString().split('T')[0]
    }));

    // Convert to CSV
    const parser = new Parser({
      fields: ['id', 'testCaseTitle', 'appName', 'tester', 'status', 'actualResult', 'environment', 'severity', 'priority', 'notes', 'executedAt']
    });
    const csv = parser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=test-runs-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export test runs error:', error);
    res.status(500).json({ error: 'Failed to export test runs' });
  }
};
