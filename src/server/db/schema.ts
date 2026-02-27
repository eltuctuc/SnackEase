import { pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').default('user'), // 'admin' | 'mitarbeiter'
  passwordHash: text('password_hash'),
  location: text('location'), // 'Nürnberg' | 'Berlin'
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const snacks = pgTable('snacks', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: text('price').notNull(),
  available: boolean('available').default(true),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
});
