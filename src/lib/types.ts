export interface User {
  id: string
  name: string
  location: 'Nürnberg' | 'Berlin'
  credit: number
  role: 'admin' | 'mitarbeiter'
  avatar: string
}

export interface Product {
  id: string
  name: string
  description: string
  category: 'obst' | 'proteinriegel' | 'shakes' | 'schokoriegel' | 'nüsse' | 'getränke'
  price: number
  image_url: string
  calories: number
  protein: number
  sugar: number
  fat: number
  allergens: string[]
  is_vegan: boolean
  is_gluten_free: boolean
  stock: number
}

export interface Purchase {
  id: string
  user_id: string
  product_id: string
  product_name: string
  price: number
  health_points: number
  created_at: string
}

export interface LeaderboardEntry {
  user_id: string
  user_name: string
  location: string
  avatar: string
  total_purchases: number
  health_points: number
  rank: number
}
