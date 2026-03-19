import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seeder08 } from './seed-minna';
import { seeder07 } from './seed-jlpt-vocab';
import { seeder01 } from './seed-alphabet';
import { seeder06 } from './seed-hsk';
import { seeder02 } from './seed-chinese-listening';
import { seeder03 } from './seed-grammar';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@jlpt.vn' },
    update: {},
    create: { name: 'Admin', email: 'admin@jlpt.vn', password, role: 'admin' },
  });
  console.log('✅ Admin user created: admin@jlpt.vn / admin123');

  await seeder01();
  await seeder02();
  await seeder03();
  await seeder06();
  await seeder07();
  await seeder08();
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
