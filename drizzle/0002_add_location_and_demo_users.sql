-- Add location field and demo users
ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(50);

-- Insert demo users (mitarbeiter)
INSERT INTO users (email, name, role, password_hash, location) VALUES
  ('nina@demo.de', 'Nina Neuanfang', 'mitarbeiter', '$2b$10$Vwp2yecSSOb8ZGMoBgS/5.I/d/0E5VCP/v52sizLV/yqjloDbxqfO', 'Nürnberg'),
  ('maxine@demo.de', 'Maxine Snackliebhaber', 'mitarbeiter', '$2b$10$Vwp2yecSSOb8ZGMoBgS/5.I/d/0E5VCP/v52sizLV/yqjloDbxqfO', 'Berlin'),
  ('lucas@demo.de', 'Lucas Gesundheitsfan', 'mitarbeiter', '$2b$10$Vwp2yecSSOb8ZGMoBgS/5.I/d/0E5VCP/v52sizLV/yqjloDbxqfO', 'Nürnberg'),
  ('alex@demo.de', 'Alex Gelegenheitskäufer', 'mitarbeiter', '$2b$10$Vwp2yecSSOb8ZGMoBgS/5.I/d/0E5VCP/v52sizLV/yqjloDbxqfO', 'Berlin'),
  ('tom@demo.de', 'Tom Schnellkäufer', 'mitarbeiter', '$2b$10$Vwp2yecSSOb8ZGMoBgS/5.I/d/0E5VCP/v52sizLV/yqjloDbxqfO', 'Nürnberg')
ON CONFLICT (email) DO NOTHING;
