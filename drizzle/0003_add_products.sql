CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"price" text NOT NULL,
	"image_url" text,
	"calories" integer,
	"protein" integer,
	"sugar" integer,
	"fat" integer,
	"allergens" text[],
	"is_vegan" boolean DEFAULT false,
	"is_gluten_free" boolean DEFAULT false,
	"stock" integer DEFAULT 10,
	"created_at" timestamp DEFAULT now()
);
