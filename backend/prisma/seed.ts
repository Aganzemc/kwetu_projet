import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@kwetu.app';
  const name = process.env.ADMIN_NAME || 'Administrator';
  const plain = process.env.ADMIN_PASSWORD || 'Admin@123456';

  const password = await bcrypt.hash(plain, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: Role.ADMIN,
      isActive: true,
      deletedAt: null
    },
    create: {
      name,
      email,
      password,
      role: Role.ADMIN,
      isActive: true
    }
  });

  console.log('✅ Admin seed complete:', { id: admin.id, email: admin.email, role: admin.role });
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.log('ℹ️ Using default credentials. Set ADMIN_EMAIL and ADMIN_PASSWORD in your environment for production.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
