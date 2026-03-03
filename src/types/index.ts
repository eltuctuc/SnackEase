/**
 * Zentrale Type-Export-Datei für SnackEase
 * 
 * Alle TypeScript-Interfaces und Types werden hier gesammelt exportiert,
 * sodass sie überall im Projekt einfach importiert werden können.
 * 
 * @example
 * ```typescript
 * // Statt:
 * import type { User } from '~/types/user'
 * import type { Product } from '~/types/product'
 * 
 * // Einfach:
 * import type { User, Product } from '~/types'
 * ```
 */

// User-Types
export type {
  User,
  UserWithMetadata,
  LoginCredentials,
  ApiResponse,
  LoginResponse,
  MeResponse
} from './user'

// Product-Types
export type {
  Product,
  ProductCategory,
  ProductCategoryOption
} from './product'

// Credits-Types
export type {
  BalanceStatus,
  AllowedRechargeAmount,
  RechargeOption,
  TransactionType
} from './credits'

// API-Types
export type {
  CreditsBalanceResponse,
  CreditsRechargeResponse,
  CreditsMonthlyResponse,
  AdminUsersResponse,
  AdminCreateUserResponse,
  AdminCreateUserRequest,
  AdminStatsResponse
} from './api'
