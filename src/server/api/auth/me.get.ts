import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const authCookie = getCookie(event, 'auth_token');
  
  if (!authCookie) {
    return { user: null };
  }

  const userIdFromCookie = authCookie.replace('user_', '');
  const userId = parseInt(userIdFromCookie) || 1;
  
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user[0]) {
    return { user: null };
  }

  return {
    user: {
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
      role: user[0].role,
      location: user[0].location,
    },
  };
});
