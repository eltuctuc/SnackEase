import { db } from '~/server/db';
import { users, userCredits } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

function checkAdminAuth(event: any): { isAdmin: boolean; userId: number | null } {
  const authCookie = getCookie(event, 'auth_token');
  
  if (!authCookie) {
    return { isAdmin: false, userId: null };
  }
  
  const userId = parseInt(authCookie.replace('user_', ''), 10);
  
  if (isNaN(userId)) {
    return { isAdmin: false, userId: null };
  }
  
  return { isAdmin: authCookie.startsWith('user_'), userId };
}

export default defineEventHandler(async (event) => {
  const auth = checkAdminAuth(event);
  
  if (!auth.isAdmin || !auth.userId) {
    throw createError({
      statusCode: 401,
      message: 'Nicht autorisiert',
    });
  }
  
  const user = await db.select().from(users).where(eq(users.id, auth.userId)).limit(1);
  
  if (!user[0] || user[0].role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Admin-Zugriff erforderlich',
    });
  }
  
  const body = await readBody(event);
  const { name, location, startCredits } = body;
  
  if (!name) {
    throw createError({
      statusCode: 400,
      message: 'Name ist erforderlich',
    });
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
    balance: String(startCredits || 25),
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
