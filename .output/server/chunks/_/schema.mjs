import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, timestamp, text, serial, decimal, integer, boolean } from 'drizzle-orm/pg-core';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set");
}
const sql = neon(databaseUrl);
const db = drizzle(sql);

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").default("user"),
  // 'admin' | 'mitarbeiter'
  passwordHash: text("password_hash"),
  location: text("location"),
  // 'Nürnberg' | 'Berlin'
  createdAt: timestamp("created_at").defaultNow()
});
const userCredits = pgTable("user_credits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  lastRechargedAt: timestamp("last_recharged_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  type: text("type").notNull(),
  // 'recharge' | 'purchase'
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});
pgTable("snacks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: text("price").notNull(),
  available: boolean("available").default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow()
});

export { userCredits as a, creditTransactions as c, db as d, users as u };
//# sourceMappingURL=schema.mjs.map
