import { d as defineEventHandler, r as readBody, s as setCookie } from '../../../nitro/nitro.mjs';
import { d as db, u as users } from '../../../_/schema.mjs';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '@neondatabase/serverless';
import 'drizzle-orm/neon-http';
import 'drizzle-orm/pg-core';

const rateLimitMap = /* @__PURE__ */ new Map();
const RATE_LIMIT = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1e3;
function getClientIp(event) {
  return event.node.req.headers["x-forwarded-for"] || event.node.req.socket.remoteAddress || "unknown";
}
function checkRateLimit(clientIp) {
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
const login_post = defineEventHandler(async (event) => {
  const clientIp = getClientIp(event);
  if (!checkRateLimit(clientIp)) {
    return { success: false, error: "Zu viele Versuche. Bitte sp\xE4ter erneut versuchen." };
  }
  const body = await readBody(event);
  const { email, password } = body;
  if (!email || !password) {
    return { success: false, error: "Email und Passwort erforderlich" };
  }
  if (!email.toLowerCase().endsWith("@demo.de")) {
    return { success: false, error: "Nur demo.de Emails erlaubt" };
  }
  const user = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (!user[0]) {
    return { success: false, error: "Ung\xFCltige Anmeldedaten" };
  }
  if (user[0].role !== "admin" && user[0].role !== "mitarbeiter") {
    return { success: false, error: "Zugriff verweigert" };
  }
  const isValid = await bcrypt.compare(password, user[0].passwordHash || "");
  if (!isValid) {
    return { success: false, error: "Ung\xFCltige Anmeldedaten" };
  }
  setCookie(event, "auth_token", `user_${user[0].id}`, {
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/"
  });
  return {
    success: true,
    user: {
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
      role: user[0].role,
      location: user[0].location
    }
  };
});

export { login_post as default };
//# sourceMappingURL=login.post.mjs.map
