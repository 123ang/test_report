import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create a demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@testreport.com' },
    update: {},
    create: {
      name: 'Demo Tester',
      email: 'demo@testreport.com',
      password: hashedPassword,
      preferredLang: 'en'
    }
  });

  console.log('✅ Created demo user:', user.email);

  // Create a sample test case with translations
  const testCase = await prisma.testCase.create({
    data: {
      appName: 'Sample App',
      templateKey: 'login_flow',
      createdById: user.id,
      translations: {
        create: [
          {
            language: 'en',
            title: 'Login Flow Test',
            description: 'Verify the login functionality works correctly',
            steps: '1. Navigate to the login page\n2. Enter a valid email address\n3. Enter the correct password\n4. Click the Login button\n5. Verify the user is redirected to the dashboard',
            expectedResult: 'User is successfully logged in and redirected to the dashboard'
          },
          {
            language: 'ja',
            title: 'ログインフローテスト',
            description: 'ログイン機能が正しく動作することを確認する',
            steps: '1. ログインページに移動する\n2. 有効なメールアドレスを入力する\n3. 正しいパスワードを入力する\n4. ログインボタンをクリックする\n5. ダッシュボードにリダイレクトされることを確認する',
            expectedResult: 'ユーザーが正常にログインし、ダッシュボードにリダイレクトされる'
          }
        ]
      }
    }
  });

  console.log('✅ Created sample test case:', testCase.id);

  // Create a sample test run
  const testRun = await prisma.testRun.create({
    data: {
      testCaseId: testCase.id,
      testerId: user.id,
      status: 'pass',
      actualResult: 'Login worked as expected',
      environment: 'Chrome 120 / Windows 11',
      severity: 'major',
      priority: 'high',
      notes: 'All steps completed successfully'
    }
  });

  console.log('✅ Created sample test run:', testRun.id);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
