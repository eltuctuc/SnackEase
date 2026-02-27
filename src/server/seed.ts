import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import bcrypt from 'bcryptjs';

async function seed() {
  const passwordHashDemo = await bcrypt.hash('demo123', 10);

  await db.insert(users).values([
    {
      email: 'admin@demo.de',
      name: 'Admin',
      role: 'admin',
      passwordHash: passwordHashDemo,
    },
    {
      email: 'demo@demo.de',
      name: 'Demo User',
      role: 'user',
      passwordHash: passwordHashDemo,
    },
  ]).onConflictDoNothing();

  console.log('Seed data inserted successfully');
}

seed().catch(console.error);
