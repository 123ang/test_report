import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@testreport.com' },
    update: {},
    create: {
      name: 'Demo Tester',
      email: 'demo@testreport.com',
      password: hashedPassword,
      preferredLang: 'en',
    },
  });
  console.log('Created user:', user.email);

  // Project 1: English
  const p1 = await prisma.project.create({
    data: {
      name: 'E-commerce Website',
      description: 'Online shopping platform',
      language: 'en',
      createdById: user.id,
    },
  });

  // Project 2: Japanese
  const p2 = await prisma.project.create({
    data: {
      name: 'Mobile Banking App',
      description: 'iOS and Android banking application',
      language: 'ja',
      createdById: user.id,
    },
  });
  console.log('Created projects');

  // Versions
  const v1 = await prisma.version.create({ data: { projectId: p1.id, name: 'v1.0', description: 'Initial release' } });
  const v2 = await prisma.version.create({ data: { projectId: p1.id, name: 'v1.1', description: 'Bug fixes' } });
  const v3 = await prisma.version.create({ data: { projectId: p2.id, name: 'v2.0', description: 'Major update' } });
  console.log('Created versions');

  // Test cases for E-commerce v1.0
  await prisma.testCase.createMany({
    data: [
      {
        versionId: v1.id,
        bug: 'Login',
        test: 'Enter valid credentials and click login',
        result: null,
        status: 'Open',
        severity: 'High',
        priority: 'High',
        createdById: user.id,
      },
      {
        versionId: v1.id,
        bug: 'Cart Total',
        test: 'Add two items and check total',
        result: 'Total shows $30 correctly',
        status: 'Fixed',
        isFixed: true,
        severity: 'Medium',
        priority: 'Medium',
        createdById: user.id,
        testedAt: new Date(),
      },
      {
        versionId: v1.id,
        bug: 'Currency',
        test: 'When I press this, this happens',
        result: '2 came out',
        status: 'Open',
        severity: 'Low',
        priority: 'Low',
        createdById: user.id,
      },
      {
        versionId: v1.id,
        bug: 'Checkout',
        test: 'Complete purchase with credit card',
        result: 'Payment processed and confirmed',
        status: 'Verified',
        isFixed: true,
        isVerified: true,
        severity: 'High',
        priority: 'High',
        createdById: user.id,
        testedAt: new Date(),
      },
    ],
  });

  // Test cases for E-commerce v1.1
  await prisma.testCase.createMany({
    data: [
      {
        versionId: v2.id,
        bug: 'Search',
        test: 'Search for shoes and verify results',
        result: null,
        status: 'Open',
        severity: 'Low',
        priority: 'Low',
        createdById: user.id,
      },
    ],
  });

  // Test cases for Mobile Banking v2.0 (Japanese project)
  await prisma.testCase.createMany({
    data: [
      {
        versionId: v3.id,
        bug: '送金エラー',
        test: '100ドルを当座預金から普通預金に送金',
        result: '送金完了、残高正しく更新',
        status: 'Verified',
        isFixed: true,
        isVerified: true,
        severity: 'Critical',
        priority: 'High',
        createdById: user.id,
        testedAt: new Date(),
      },
      {
        versionId: v3.id,
        bug: 'ログイン画面',
        test: '無効なパスワードでログイン試行',
        result: null,
        status: 'Open',
        severity: 'Medium',
        priority: 'Medium',
        createdById: user.id,
      },
    ],
  });

  console.log('Created test cases');
  console.log('\nSummary: 1 user, 2 projects, 3 versions, 7 test cases');
  console.log('Login: demo@testreport.com / password123');
}

main()
  .catch((e) => { console.error('Seed error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
