import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Adding is_active column to users table...');
  
  try {
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true`;
    console.log('✅ Column added successfully');
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  process.exit(0);
}

migrate();
