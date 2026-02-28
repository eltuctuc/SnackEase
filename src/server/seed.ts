import { db } from '~/server/db';
import { users, userCredits } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const INITIAL_CREDITS: Record<string, number> = {
  'nina@demo.de': 25,
  'maxine@demo.de': 15,
  'lucas@demo.de': 30,
  'alex@demo.de': 20,
  'tom@demo.de': 10,
}

async function seed() {
  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashDemo = await bcrypt.hash('demo123', 10);

  await db.insert(users).values([
    {
      email: 'admin@demo.de',
      name: 'Admin',
      role: 'admin',
      passwordHash: passwordHashAdmin,
      location: 'Nürnberg',
    },
    {
      email: 'nina@demo.de',
      name: 'Nina Neuanfang',
      role: 'mitarbeiter',
      passwordHash: passwordHashDemo,
      location: 'Nürnberg',
    },
    {
      email: 'maxine@demo.de',
      name: 'Maxine Snackliebhaber',
      role: 'mitarbeiter',
      passwordHash: passwordHashDemo,
      location: 'Berlin',
    },
    {
      email: 'lucas@demo.de',
      name: 'Lucas Gesundheitsfan',
      role: 'mitarbeiter',
      passwordHash: passwordHashDemo,
      location: 'Nürnberg',
    },
    {
      email: 'alex@demo.de',
      name: 'Alex Gelegenheitskäufer',
      role: 'mitarbeiter',
      passwordHash: passwordHashDemo,
      location: 'Berlin',
    },
    {
      email: 'tom@demo.de',
      name: 'Tom Schnellkäufer',
      role: 'mitarbeiter',
      passwordHash: passwordHashDemo,
      location: 'Nürnberg',
    },
  ]).onConflictDoNothing();

  const allUsers = await db.select().from(users)
  
  for (const user of allUsers) {
    const creditAmount = INITIAL_CREDITS[user.email]
    
    if (creditAmount !== undefined) {
      const existing = await db.select().from(userCredits).where(
        eq(userCredits.userId, user.id)
      ).limit(1)
      
      if (!existing[0]) {
        await db.insert(userCredits).values({
          userId: user.id,
          balance: creditAmount.toFixed(2),
          lastRechargedAt: new Date(),
        })
        console.log(`Added ${creditAmount}€ credits for ${user.email}`)
      }
    }
  }

  console.log('Seed data inserted successfully');
}

seed().catch(console.error);
