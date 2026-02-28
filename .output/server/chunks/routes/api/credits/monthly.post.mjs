import { d as defineEventHandler, g as getCookie, c as createError } from '../../../nitro/nitro.mjs';
import { d as db, u as users, a as userCredits, c as creditTransactions } from '../../../_/schema.mjs';
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

const MONTHLY_AMOUNT = 25;
const monthly_post = defineEventHandler(async (event) => {
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
    let currentBalance = 0;
    if (creditsResults[0]) {
      currentBalance = parseFloat(creditsResults[0].balance.toString()) || 0;
    }
    const newBalance = currentBalance + MONTHLY_AMOUNT;
    if (creditsResults[0]) {
      await db.update(userCredits).set({
        balance: newBalance.toFixed(2),
        lastRechargedAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      }).where(eq(userCredits.userId, user.id));
    } else {
      await db.insert(userCredits).values({
        userId: user.id,
        balance: newBalance.toFixed(2),
        lastRechargedAt: /* @__PURE__ */ new Date()
      });
    }
    await db.insert(creditTransactions).values({
      userId: user.id,
      amount: MONTHLY_AMOUNT.toFixed(2),
      type: "recharge",
      description: `Monatspauschale: ${MONTHLY_AMOUNT}\u20AC`
    });
    return {
      success: true,
      newBalance: newBalance.toFixed(2),
      message: `Monatspauschale von ${MONTHLY_AMOUNT}\u20AC gutgeschrieben`
    };
  } catch (error) {
    const err = error;
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || "Fehler bei der Monatspauschale"
    });
  }
});

export { monthly_post as default };
//# sourceMappingURL=monthly.post.mjs.map
