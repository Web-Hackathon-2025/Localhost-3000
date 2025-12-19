export type UserRole = 'customer' | 'provider' | 'admin'

export type BookingStatus =
  | 'requested'
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected'

export type VerificationStatus = 'pending' | 'verified' | 'rejected'

export type PriceType = 'fixed' | 'range' | 'quote'

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
  phone?: string | null
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface SessionUser {
  id: string
  email: string
  role: UserRole
  name: string
}

