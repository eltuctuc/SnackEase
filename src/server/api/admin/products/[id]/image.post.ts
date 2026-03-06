import { db } from '~/server/db';
import { products } from '~/server/db/schema';
import { eq } from 'drizzle-orm';
import { requireAdmin } from '~/server/utils/auth';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = parseInt(getRouterParam(event, 'id') ?? '', 10);
  if (isNaN(id)) {
    throw createError({ statusCode: 400, message: 'Ungültige Produkt-ID' });
  }

  try {
    const existing = await db
      .select({ id: products.id })
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!existing[0]) {
      throw createError({ statusCode: 404, message: 'Produkt nicht gefunden' });
    }

    // Multipart Form Data lesen
    const formData = await readMultipartFormData(event);

    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, message: 'Kein Bild hochgeladen' });
    }

    const imageField = formData.find(f => f.name === 'image');

    if (!imageField || !imageField.data) {
      throw createError({ statusCode: 400, message: 'Bildfeld "image" fehlt' });
    }

    const mimeType = imageField.type ?? 'application/octet-stream';

    if (!ALLOWED_TYPES.includes(mimeType)) {
      throw createError({ statusCode: 400, message: 'Nur JPG, PNG und WebP erlaubt' });
    }

    if (imageField.data.length > MAX_SIZE_BYTES) {
      throw createError({ statusCode: 400, message: 'Bild zu groß (max. 5MB)' });
    }

    const ext = mimeType === 'image/jpeg' ? '.jpg' : mimeType === 'image/png' ? '.png' : '.webp';
    const filename = `${randomUUID()}${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'products');
    const filePath = join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, imageField.data);

    const imageUrl = `/uploads/products/${filename}`;

    await db
      .update(products)
      .set({ imageUrl })
      .where(eq(products.id, id));

    return { success: true, imageUrl };
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode) throw error;
    throw createError({ statusCode: 500, message: 'Fehler beim Hochladen des Bildes' });
  }
});
