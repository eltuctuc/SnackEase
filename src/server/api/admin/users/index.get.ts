import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';

export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  
  const allUsers = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      location: users.location,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.role, 'mitarbeiter'));
  
  return { users: allUsers };
});
