import { d as defineEventHandler, g as getCookie } from '../../../nitro/nitro.mjs';
import { d as db, u as users } from '../../../_/schema.mjs';
import { eq } from 'drizzle-orm';
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

const me_get = defineEventHandler(async (event) => {
  const authCookie = getCookie(event, "auth_token");
  if (!authCookie) {
    return { user: null };
  }
  const userIdFromCookie = authCookie.replace("user_", "");
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
      location: user[0].location
    }
  };
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
