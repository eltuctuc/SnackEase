import { db } from '~/server/db';
import { users, userCredits } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  
  const body = await readBody(event);
  const { name, location, startCredits } = body;

  if (!name) {
    throw createError({
      statusCode: 400,
      message: 'Name ist erforderlich',
    });
  }

  const credits = typeof startCredits === 'number' ? startCredits : 25;
  if (credits < 0) {
    throw createError({ statusCode: 400, message: 'Startguthaben kann nicht negativ sein' });
  }
  
  const email = `${name.toLowerCase().replace(/\s+/g, '.')}@demo.de`;
  
  const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (existingUser[0]) {
    throw createError({
      statusCode: 400,
      message: 'Ein Nutzer mit ähnlichem Namen existiert bereits',
    });
  }
  
  const passwordHash = await bcrypt.hash('demo123', 10);
  
  const newUser = await db.insert(users).values({
    email,
    name,
    role: 'mitarbeiter',
    location: location || 'Nürnberg',
    passwordHash,
  }).returning();
  
  await db.insert(userCredits).values({
    userId: newUser[0].id,
    balance: String(credits),
  });
  
  return { 
    success: true, 
    user: {
      id: newUser[0].id,
      email: newUser[0].email,
      name: newUser[0].name,
      role: newUser[0].role,
      location: newUser[0].location,
    }
  };
});
