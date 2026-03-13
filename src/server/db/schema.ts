import { pgTable, serial, text, timestamp, boolean, decimal, integer, varchar, uniqueIndex } from 'drizzle-orm/pg-core';

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
  isActive: boolean('is_active').default(true),
  stock: integer('stock').default(10),
  // FEAT-22: Konfigurierbarer Nachbestellschwellwert (default 3 — ersetzt hardkodierten Wert)
  stockThreshold: integer('stock_threshold').notNull().default(3),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// FEAT-10: Kategorien-Tabelle
export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

// FEAT-10: Many-to-Many Verknüpfung Produkt <-> Kategorie
export const productCategories = pgTable('product_categories', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
}, (table) => ({
  productCategoryUnique: uniqueIndex('product_categories_product_id_category_id_unique').on(table.productId, table.categoryId),
}));

export type ProductCategory = typeof productCategories.$inferSelect;
export type NewProductCategory = typeof productCategories.$inferInsert;

// FEAT-10: Login-Events für Statistiken und Peak-Zeiten
export const loginEvents = pgTable('login_events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  success: boolean('success').notNull(),
  ip: text('ip'),
  createdAt: timestamp('created_at').defaultNow(),
});

export type LoginEvent = typeof loginEvents.$inferSelect;
export type NewLoginEvent = typeof loginEvents.$inferInsert;

// FEAT-7/16: Purchases Tabelle für One-Touch Kauf / Warenkorb
export const purchases = pgTable('purchases', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  // FEAT-16: productId bleibt für Abwärtskompatibilität mit FEAT-7 (Single-Product-Käufe)
  // Bei Warenkorb-Bestellungen ist productId NULL und Items werden in purchase_items gespeichert
  productId: integer('product_id').references(() => products.id),
  // FEAT-16: Preis für FEAT-7 (Single-Product-Kauf)
  price: decimal('price', { precision: 10, scale: 2 }),
  // FEAT-16: Gesamtpreis aller Produkte der Bestellung
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }),
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

// FEAT-16: n:m Verknüpfung zwischen Purchases und Products (Warenkorb)
export const purchaseItems = pgTable('purchase_items', {
  id: serial('id').primaryKey(),
  purchaseId: integer('purchase_id').references(() => purchases.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id).notNull(),
  quantity: integer('quantity').notNull().default(1),
  // Preis zum Bestellzeitpunkt (inkl. aktivem Angebot falls vorhanden)
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export type PurchaseItem = typeof purchaseItems.$inferSelect;
export type NewPurchaseItem = typeof purchaseItems.$inferInsert;

// FEAT-13: Low-Stock-Benachrichtigungen
export const lowStockNotifications = pgTable('low_stock_notifications', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id).notNull(),
  stockQuantity: integer('stock_quantity').notNull(), // Bestand zum Zeitpunkt der Warnung
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  readAt: timestamp('read_at'),
}, (table) => ({
  // BUG-FEAT13-001: UNIQUE-Constraint verhindert Duplikate bei Race Conditions
  productIdUnique: uniqueIndex('low_stock_notifications_product_id_unique').on(table.productId),
}));

export type LowStockNotification = typeof lowStockNotifications.$inferSelect;
export type NewLowStockNotification = typeof lowStockNotifications.$inferInsert;

// FEAT-14: Angebote & Rabatte
export const productOffers = pgTable('product_offers', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  discountType: text('discount_type').notNull(), // 'percent' | 'absolute'
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  startsAt: timestamp('starts_at').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  productIdUnique: uniqueIndex('product_offers_product_id_unique').on(table.productId),
}));

export type ProductOffer = typeof productOffers.$inferSelect;
export type NewProductOffer = typeof productOffers.$inferInsert;

// FEAT-18: Empfehlungen (kollektiv, eine pro Nutzer pro Produkt)
export const recommendations = pgTable('recommendations', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  productUserUnique: uniqueIndex('recommendations_product_id_user_id_unique')
    .on(table.productId, table.userId),
}));

export type Recommendation = typeof recommendations.$inferSelect;
export type NewRecommendation = typeof recommendations.$inferInsert;

// FEAT-18: Favoriten (privat, max. 10 pro Nutzer)
export const favorites = pgTable('favorites', {
  id: serial('id').primaryKey(),
  productId: integer('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  productUserUnique: uniqueIndex('favorites_product_id_user_id_unique')
    .on(table.productId, table.userId),
}));

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;

// FEAT-23: Punkte-Transaktionen (Punktesystem)
export const pointTransactions = pgTable('point_transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  // NULL bei Empfehlungs-Transaktionen (kein Purchase-Bezug)
  purchaseId: integer('purchase_id')
    .references(() => purchases.id),
  type: text('type').notNull(), // 'purchase_pickup' | 'recommendation'
  basePoints: integer('base_points').notNull(),          // Summe der Basis-Punkte (10 pro Produkt)
  veganBonus: integer('vegan_bonus').notNull().default(0),   // Summe Vegan/Gesund-Boni (+3 pro Produkt)
  proteinBonus: integer('protein_bonus').notNull().default(0), // Summe Protein-Boni (+2 pro Produkt)
  offerBonus: integer('offer_bonus').notNull().default(0),   // Summe Angebots-Boni (+2 pro Produkt)
  speedBonus: integer('speed_bonus').notNull().default(0),   // Schnelligkeits-Bonus (0 oder 5)
  streakBonus: integer('streak_bonus').notNull().default(0), // Streak-Bonus in Punkten (gerundeter Integer)
  totalPoints: integer('total_points').notNull(),            // Gesamtpunkte der Transaktion
  createdAt: timestamp('created_at').defaultNow(),
});

export type PointTransaction = typeof pointTransactions.$inferSelect;
export type NewPointTransaction = typeof pointTransactions.$inferInsert;
