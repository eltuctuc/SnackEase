import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) {
    return { success: false, error: 'Email und Passwort erforderlich' };
  }

  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user[0]) {
    return { success: false, error: 'Ungültige Anmeldedaten' };
  }

  if (user[0].role !== 'admin') {
    return { success: false, error: 'Zugriff verweigert' };
  }

  const isValid = await bcrypt.compare(password, user[0].passwordHash || '');

  if (!isValid) {
    return { success: false, error: 'Ungültige Anmeldedaten' };
  }

  return {
    success: true,
    user: {
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
      role: user[0].role,
    },
  };
});
