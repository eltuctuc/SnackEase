/**
 * Neon Database Connection mit Transaction-Support
 * 
 * WICHTIG: Verwendet @neondatabase/serverless mit WebSocket-Verbindung
 * für echte DB-Transactions (atomare Operationen mit Rollback).
 * 
 * Vorher: neon-http (kein Transaction-Support)
 * Jetzt: @neondatabase/serverless (mit Transaction-Support)
 * 
 * @see BUG-FEAT7-001 - Atomare Transaktionen für One-Touch-Kauf
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

// WebSocket für Node.js-Umgebung (nicht Browser)
neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set');
}

// Pool für Connection-Management (bessere Performance bei vielen Requests)
const pool = new Pool({ connectionString: databaseUrl });

// Drizzle mit Neon Serverless Driver (unterstützt Transactions)
export const db = drizzle(pool);
