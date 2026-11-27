const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/password');

dotenv.config();

const prisma = new PrismaClient();

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminFullName = process.env.ADMIN_FULL_NAME?.trim() || 'System Administrator';

  if (!adminEmail || !adminPassword) {
    console.error(
      '❌ ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required to create the initial admin.'
    );
    process.exit(1);
  }

  if (adminPassword.length < 8) {
    console.error('❌ ADMIN_PASSWORD must be at least 8 characters long.');
    process.exit(1);
  }

  const passwordHash = await hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      fullName: adminFullName,
      passwordHash,
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      fullName: adminFullName,
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(`✅ Initial ADMIN user ensured: ${admin.email} (ID: ${admin.id})`);
}

seedAdmin()
  .catch((err) => {
    console.error('❌ Failed to seed initial admin:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
