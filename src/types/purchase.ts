/**
 * Purchase-bezogene TypeScript-Definitionen
 * 
 * Dieses File enthält alle Purchase-relevanten Interfaces für FEAT-7 (One-Touch Kauf)
 */

/**
 * Status eines Kaufs
 * 
 * - 'pending_pickup': Kauf abgeschlossen, wartet auf Abholung (FEAT-11)
 * - 'picked_up': Erfolgreich abgeholt (FEAT-11)
 * - 'cancelled': Kauf storniert (z.B. abgelaufen)
 */
export type PurchaseStatus = 'pending_pickup' | 'picked_up' | 'cancelled'

/**
 * Purchase-Objekt wie es aus der Datenbank kommt
 */
export interface Purchase {
  id: number
  userId: number
  productId: number
  price: string
  bonusPoints: number
  status: PurchaseStatus
  pickupPin: string
  pickupLocation: string
  expiresAt: string
  pickedUpAt: string | null
  cancelledAt: string | null
  createdAt: string
}

/**
 * Purchase mit erweiterten Produkt-Informationen
 * 
 * Wird zurückgegeben nach erfolgreichem Kauf
 */
export interface PurchaseWithProduct extends Purchase {
  productName: string
  productCategory: string
  productImageUrl: string | null
}

/**
 * API Response für POST /api/purchases (Erfolg)
 */
export interface PurchaseSuccessResponse {
  success: true
  purchase: PurchaseWithProduct
  newBalance: string
}

/**
 * API Response für POST /api/purchases (Fehler)
 */
export interface PurchaseErrorResponse {
  success: false
  error: string
  currentBalance?: string
  requiredAmount?: string
  stockQuantity?: number
}

/**
 * API Response für POST /api/purchases
 */
export type PurchaseResponse = PurchaseSuccessResponse | PurchaseErrorResponse

/**
 * Request Body für POST /api/purchases
 */
export interface PurchaseRequest {
  productId: number
}

/**
 * Einzelnes Produkt in einer Bestellung (aus purchase_items)
 */
export interface OrderItem {
  productId: number
  productName: string
  quantity: number
  unitPrice: string
  imageUrl: string | null
}

/**
 * Bestellung mit mehreren Produkten (FEAT-16 Warenkorb)
 *
 * Wird von GET /api/orders zurückgegeben
 */
export interface Order {
  id: number
  userId: number
  totalPrice: string | null
  status: PurchaseStatus
  pickupPin: string
  pickupLocation: string
  expiresAt: string
  pickedUpAt: string | null
  cancelledAt: string | null
  createdAt: string
  items: OrderItem[]
  // Legacy single-product fields (for backward compatibility with FEAT-7)
  productName?: string
  productImageUrl?: string | null
  price?: string | number
}
