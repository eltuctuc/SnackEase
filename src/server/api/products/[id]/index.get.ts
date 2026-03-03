import { db } from '~/server/db'
import { products } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Produkt-ID erforderlich'
    })
  }
  
  try {
    const product = await db.select({
      id: products.id,
      name: products.name,
      description: products.description,
      category: products.category,
      price: products.price,
      imageUrl: products.imageUrl,
      calories: products.calories,
      protein: products.protein,
      sugar: products.sugar,
      fat: products.fat,
      allergens: products.allergens,
      isVegan: products.isVegan,
      isGlutenFree: products.isGlutenFree,
      stock: products.stock,
    }).from(products).where(eq(products.id, parseInt(id))).limit(1)
    
    if (product.length === 0) {
      throw createError({
        statusCode: 404,
        message: 'Produkt nicht gefunden'
      })
    }
    
    return product[0]
  } catch (error: any) {
    if (error.statusCode) {
      throw error
    }
    console.error('Error fetching product:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden des Produkts'
    })
  }
})
