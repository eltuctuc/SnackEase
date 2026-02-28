import { d as defineEventHandler, g as getCookie, c as createError, r as readBody } from '../../../nitro/nitro.mjs';
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

const ALLOWED_AMOUNTS = ["10", "25", "50"];
const recharge_post = defineEventHandler(async (event) => {
  const authCookie = getCookie(event, "auth_token");
  if (!authCookie) {
    throw createError({
      statusCode: 401,
      message: "Nicht eingeloggt"
    });
  }
  const body = await readBody(event);
  const { amount } = body;
  if (!amount || !ALLOWED_AMOUNTS.includes(amount.toString())) {
    throw createError({
      statusCode: 400,
      message: "Ung\xFCltiger Betrag. Erlaubt: 10, 25, 50"
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
    const amountNum = parseFloat(amount);
    const creditsResults = await db.select().from(userCredits).where(eq(userCredits.userId, user.id)).limit(1);
    let currentBalance = 0;
    if (creditsResults[0]) {
      currentBalance = parseFloat(creditsResults[0].balance.toString()) || 0;
    }
    const newBalance = currentBalance + amountNum;
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
      amount: amountNum.toFixed(2),
      type: "recharge",
      description: `Guthaben aufgeladen: ${amount}\u20AC`
    });
    return {
      success: true,
      newBalance: newBalance.toFixed(2),
      message: `Guthaben um ${amount}\u20AC erh\xF6ht`
    };
  } catch (error) {
    const err = error;
    throw createError({
      statusCode: err.statusCode || 500,
      message: err.message || "Fehler beim Aufladen des Guthabens"
    });
  }
});

export { recharge_post as default };
//# sourceMappingURL=recharge.post.mjs.map
