import { db } from '~/server/db';
import { users } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;

function getClientIp(event: any): string {
  return event.node.req.headers['x-forwarded-for'] || 
         event.node.req.socket.remoteAddress || 
         'unknown';
}

function checkRateLimit(clientIp: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIp);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

export default defineEventHandler(async (event) => {
  const clientIp = getClientIp(event);
  
  if (!checkRateLimit(clientIp)) {
    return { success: false, error: 'Zu viele Versuche. Bitte später erneut versuchen.' };
  }
  
  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) {
    return { success: false, error: 'Email und Passwort erforderlich' };
  }

  if (!email.toLowerCase().endsWith('@demo.de')) {
    return { success: false, error: 'Nur demo.de Emails erlaubt' };
  }

  const user = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);

  if (!user[0]) {
    return { success: false, error: 'Ungültige Anmeldedaten' };
  }

  if (user[0].role !== 'admin' && user[0].role !== 'mitarbeiter') {
    return { success: false, error: 'Zugriff verweigert' };
  }

  const isValid = await bcrypt.compare(password, user[0].passwordHash || '');

  if (!isValid) {
    return { success: false, error: 'Ungültige Anmeldedaten' };
  }

  setCookie(event, 'auth_token', `user_${user[0].id}`, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return {
    success: true,
    user: {
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
      role: user[0].role,
      location: user[0].location,
    },
  };
});
