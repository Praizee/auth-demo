import { createContext } from 'react'
import type { User } from '../types'

export type AuthContextValue = {
  user: User | null
  token: string | null
  isAuthed: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (profile: Pick<User, 'name' | 'bio'>) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
