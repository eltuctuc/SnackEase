import { pgTable, serial, text, timestamp, boolean, decimal, integer, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').default('user'), // 'admin' | 'mitarbeiter'
  passwordHash: text('password_hash'),
  location: varchar('location', { length: 50 }), // 'Nürnberg' | 'Berlin'
  isActive: boolean('is_active').default(true), // Für Admin: Nutzer deaktivieren
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export const userCredits = pgTable('user_credits', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  balance: decimal('balance', { precision: 10, scale: 2 }).notNull().default('0'),
  lastRechargedAt: timestamp('last_recharged_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type UserCredits = typeof userCredits.$inferSelect;
export type NewUserCredits = typeof userCredits.$inferInsert;

export const creditTransactions = pgTable('credit_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  type: text('type').notNull(), // 'recharge' | 'purchase'
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type NewCreditTransaction = typeof creditTransactions.$inferInsert;

export const snacks = pgTable('snacks', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: text('price').notNull(),
  available: boolean('available').default(true),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  price: text('price').notNull(),
  imageUrl: text('image_url'),
  calories: integer('calories'),
  protein: integer('protein'),
  sugar: integer('sugar'),
  fat: integer('fat'),
  allergens: text('allergens').array(),
  isVegan: boolean('is_vegan').default(false),
  isGlutenFree: boolean('is_gluten_free').default(false),
  stock: integer('stock').default(10),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// FEAT-7: Purchases Tabelle für One-Touch Kauf
export const purchases = pgTable('purchases', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  bonusPoints: integer('bonus_points').default(0),
  
  // Für FEAT-11 (Bestellabholung):
  status: varchar('status', { length: 20 }).default('pending_pickup').notNull(),
  // Status: 'pending_pickup', 'picked_up', 'cancelled'
  
  pickupPin: varchar('pickup_pin', { length: 4 }).notNull(),
  // 4-stellige PIN (z.B. "1234")
  
  pickupLocation: varchar('pickup_location', { length: 50 }).default('Nürnberg').notNull(),
  // Standort des Automaten
  
  expiresAt: timestamp('expires_at').notNull(),
  // createdAt + 2 Stunden
  
  pickedUpAt: timestamp('picked_up_at'),
  // NULL wenn noch nicht abgeholt
  
  cancelledAt: timestamp('cancelled_at'),
  // NULL wenn nicht storniert
  
  createdAt: timestamp('created_at').defaultNow(),
});

export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
