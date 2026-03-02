import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@jlpt.vn' },
    update: {},
    create: { name: 'Admin', email: 'admin@jlpt.vn', password, role: 'admin' },
  });
  console.log('✅ Admin user created: admin@jlpt.vn / admin123');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
