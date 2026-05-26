export type Route = '/login' | '/signup' | '/dashboard' | '/profile'

export type User = {
  id: string
  name: string
  email: string
  role: string
  bio: string
}

export type AuthPayload = {
  token: string
  refresh: string
  user: User
}
