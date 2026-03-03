import { db } from '~/server/db'
import { products } from '~/server/db/schema'
import { eq, and, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  try {
    let conditions: any[] = []
    
    if (query.category && query.category !== 'alle') {
      conditions.push(eq(products.category, query.category as string))
    }
    
    if (query.search) {
      conditions.push(
        sql`${products.name} ILIKE ${'%' + query.search + '%'}`
      )
    }
    
    if (conditions.length > 0) {
      return await db.select({
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
      }).from(products).where(and(...conditions))
    }
    
    return await db.select({
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
    }).from(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    throw createError({
      statusCode: 500,
      message: 'Fehler beim Laden der Produkte'
    })
  }
})
