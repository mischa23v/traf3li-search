const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'مسؤول النظام',
      role: 'ADMIN',
      active: true,
      accessEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }
  });

  console.log('✓ Created admin user:', admin.email);

  // Create test lawyer user
  const lawyerUser = await prisma.user.upsert({
    where: { email: 'lawyer@example.com' },
    update: {},
    create: {
      email: 'lawyer@example.com',
      name: 'أحمد المحامي',
      role: 'LAWYER',
      active: true,
      accessEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }
  });

  // Create lawyer profile
  const lawyer = await prisma.lawyer.upsert({
    where: { userId: lawyerUser.id },
    update: {},
    create: {
      userId: lawyerUser.id,
      bio: 'محامي متخصص في القضايا العمالية مع خبرة 10 سنوات في المحاكم السعودية',
      specializations: ['قضايا عمالية', 'قضايا تجارية'],
      yearsExperience: 10,
      rating: 4.5,
      totalCases: 50,
      successRate: 85.5,
      officeName: 'مكتب أحمد للمحاماة',
      officeAddress: 'الدمام، شارع الملك فهد',
      licenseNumber: 'LAW-2024-001',
      feesRange: '5000-15000 ريال',
      languages: ['العربية', 'الإنجليزية'],
      acceptingCases: true
    }
  });

  console.log('✓ Created lawyer user:', lawyerUser.email);

  // Create test client user
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      name: 'محمد العميل',
      role: 'CLIENT',
      active: true,
      accessEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }
  });

  // Create client profile
  const client = await prisma.client.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      fullName: 'محمد بن علي العميل',
      nationalId: '1234567890',
      phone: '966501234567',
      email: 'client@example.com',
      address: 'الدمام، حي الفيصلية',
      occupation: 'موظف'
    }
  });

  console.log('✓ Created client user:', clientUser.email);

  // Create test case
  const testCase = await prisma.case.create({
    data: {
      caseNumber: '2024-12345',
      clientId: client.id,
      lawyerId: lawyer.id,
      
      // Plaintiff
      plaintiffName: 'محمد بن علي العميل',
      plaintiffAddress: 'الدمام، حي الفيصلية',
      plaintiffPhone: '966501234567',
      plaintiffEmail: 'client@example.com',
      
      // Defendant
      defendantName: 'شركة التقنية المتقدمة',
      defendantAddress: 'الدمام، شارع الملك عبدالعزيز',
      defendantType: 'Company',
      defendantCR: '1234567890',
      
      // Case details
      caseType: 'SALARY',
      subCategory: 'أجور متأخرة',
      court: 'المحكمة العمالية بالدمام',
      courtType: 'LABOR',
      status: 'ACTIVE',
      stage: 'IN_PROGRESS',
      
      // Dates
      issueDate: new Date('2024-01-15'),
      nextHearing: new Date('2024-12-25'),
      nextHearingTime: '10:00 صباحاً',
      
      // Financial
      claimAmount: 50000,
      
      // Description
      description: 'مطالبة بأجور متأخرة عن مدة 6 أشهر بقيمة 50,000 ريال سعودي',
      
      // Service type
      serviceType: 'FULL_REPRESENTATION'
    }
  });

  console.log('✓ Created test case:', testCase.caseNumber);

  // Create test regular user
  const testUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'مستخدم تجريبي',
      role: 'USER',
      active: true,
      accessEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  });

  console.log('✓ Created test user:', testUser.email);

  console.log('\n========================================');
  console.log('Seed completed successfully!');
  console.log('========================================');
  console.log('\nTest Accounts Created:');
  console.log('1. Admin: admin@example.com');
  console.log('2. Lawyer: lawyer@example.com');
  console.log('3. Client: client@example.com');
  console.log('4. User: user@example.com');
  console.log('\nNote: Use Google OAuth to login with these emails');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
