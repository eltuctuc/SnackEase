import { d as defineEventHandler, g as getCookie, c as createError } from '../../../nitro/nitro.mjs';
import { d as db, u as users, a as userCredits } from '../../../_/schema.mjs';
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

const balance_get = defineEventHandler(async (event) => {
  var _a;
  const authCookie = getCookie(event, "auth_token");
  if (!authCookie) {
    throw createError({
      statusCode: 401,
      message: "Nicht eingeloggt"
    });
  }
  try {
    const userId = authCookie.replace("user_", "");
    const userIdNum = parseInt(userId, 10);
    if (isNaN(userIdNum)) {
      throw createError({
        statusCode: 401,
        message: "Ung\xFCltiges Token"
      });
    }
    const userResults = await db.select().from(users).where(eq(users.id, userIdNum)).limit(1);
    if (!userResults[0]) {
      throw createError({
        statusCode: 401,
        message: "User nicht gefunden"
      });
    }
    const user = userResults[0];
    const creditsResults = await db.select().from(userCredits).where(eq(userCredits.userId, user.id)).limit(1);
    if (!creditsResults[0]) {
      return {
        userId: user.id,
        balance: "0",
        lastRechargedAt: null
      };
    }
    const credits = creditsResults[0];
    return {
      userId: user.id,
      balance: credits.balance,
      lastRechargedAt: ((_a = credits.lastRechargedAt) == null ? void 0 : _a.toISOString()) || null
    };
  } catch (error) {
    const err = error;
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || "Fehler beim Laden des Guthabens"
    });
  }
});

export { balance_get as default };
//# sourceMappingURL=balance.get.mjs.map
