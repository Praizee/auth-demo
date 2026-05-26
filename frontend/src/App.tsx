import {
  createContext,
  type FormEvent,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react'
import './App.css'

type AuthMode = 'login' | 'signup'
type View = AuthMode | 'dashboard' | 'profile'

type User = {
  id: string
  name: string
  email: string
  role: string
  bio: string
}

type AuthPayload = {
  token: string
  user: User
}

type AuthContextValue = {
  user: User | null
  token: string | null
  isAuthed: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (profile: Pick<User, 'name' | 'bio'>) => Promise<void>
}

type DemoUserRecord = User & {
  password: string
}

const TOKEN_COOKIE = 'auth_demo_token'
const DEMO_USERS_KEY = 'auth_demo_users'
const DEMO_SESSION_KEY = 'auth_demo_session'
const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? ''

const starterUsers: DemoUserRecord[] = [
  {
    id: 'demo-user',
    name: 'Mira Stone',
    email: 'mira@example.com',
    password: 'password123',
    role: 'Product Lead',
    bio: 'Testing a lightweight auth flow before wiring the real API.',
  },
]

const AuthContext = createContext<AuthContextValue | null>(null)

function setTokenCookie(token: string) {
  const oneWeek = 60 * 60 * 24 * 7
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(
    token,
  )}; max-age=${oneWeek}; path=/; samesite=lax`
}

function getTokenCookie() {
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${TOKEN_COOKIE}=`))
    ?.split('=')[1]
}

function clearTokenCookie() {
  document.cookie = `${TOKEN_COOKIE}=; max-age=0; path=/; samesite=lax`
}

function getDemoUsers() {
  const stored = localStorage.getItem(DEMO_USERS_KEY)
  if (!stored) {
    localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(starterUsers))
    return starterUsers
  }

  return JSON.parse(stored) as DemoUserRecord[]
}

function saveDemoUsers(users: DemoUserRecord[]) {
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users))
}

function makeDemoToken(userId: string) {
  return `demo.${userId}.${crypto.randomUUID()}`
}

function saveSession(payload: AuthPayload) {
  setTokenCookie(payload.token)
  localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(payload))
}

async function apiRequest<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  if (!API_URL) {
    return runDemoRequest<T>(path, options)
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      message?: string
    } | null
    throw new Error(error?.message ?? 'Request failed')
  }

  return response.json() as Promise<T>
}

async function runDemoRequest<T>(
  path: string,
  options: RequestInit & { token?: string },
) {
  await new Promise((resolve) => setTimeout(resolve, 360))

  const body = options.body ? JSON.parse(String(options.body)) : {}
  const users = getDemoUsers()

  if (path === '/auth/signup') {
    const existingUser = users.find(
      (user) => user.email.toLowerCase() === body.email.toLowerCase(),
    )

    if (existingUser) {
      throw new Error('That email already has an account.')
    }

    const user: DemoUserRecord = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      password: body.password,
      role: 'Member',
      bio: 'New account, fresh dashboard.',
    }
    const nextUsers = [...users, user]
    saveDemoUsers(nextUsers)

    return {
      token: makeDemoToken(user.id),
      user: stripPassword(user),
    } as T
  }

  if (path === '/auth/login') {
    const user = users.find(
      (record) =>
        record.email.toLowerCase() === body.email.toLowerCase() &&
        record.password === body.password,
    )

    if (!user) {
      throw new Error('Email or password is not right.')
    }

    return {
      token: makeDemoToken(user.id),
      user: stripPassword(user),
    } as T
  }

  if (path === '/me' && options.method === 'PATCH') {
    const session = getSavedSession()
    if (!session || !options.token) {
      throw new Error('Please log in again.')
    }

    const nextUsers = users.map((record) =>
      record.id === session.user.id
        ? { ...record, name: body.name, bio: body.bio }
        : record,
    )
    saveDemoUsers(nextUsers)

    const updatedRecord = nextUsers.find(
      (record) => record.id === session.user.id,
    )

    if (!updatedRecord) {
      throw new Error('Could not find this profile.')
    }

    return stripPassword(updatedRecord) as T
  }

  throw new Error('Demo endpoint not found.')
}

function stripPassword(record: DemoUserRecord): User {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
    bio: record.bio,
  }
}

function getSavedSession() {
  const token = getTokenCookie()
  const saved = localStorage.getItem(DEMO_SESSION_KEY)
  if (!token || !saved) {
    return null
  }

  const session = JSON.parse(saved) as AuthPayload
  return session.token === decodeURIComponent(token) ? session : null
}

function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthPayload | null>(() =>
    getSavedSession(),
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isAuthed: Boolean(session),
      async login(email, password) {
        const payload = await apiRequest<AuthPayload>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })
        saveSession(payload)
        setSession(payload)
      },
      async signup(name, email, password) {
        const payload = await apiRequest<AuthPayload>('/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ name, email, password }),
        })
        saveSession(payload)
        setSession(payload)
      },
      logout() {
        clearTokenCookie()
        localStorage.removeItem(DEMO_SESSION_KEY)
        setSession(null)
      },
      async updateProfile(profile) {
        if (!session?.token) {
          throw new Error('Please log in again.')
        }

        const user = await apiRequest<User>('/me', {
          method: 'PATCH',
          token: session.token,
          body: JSON.stringify(profile),
        })
        const nextSession = { token: session.token, user }
        saveSession(nextSession)
        setSession(nextSession)
      },
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}

function App() {
  return (
    <AuthProvider>
      <AuthShell />
    </AuthProvider>
  )
}

function AuthShell() {
  const { isAuthed } = useAuth()
  const [view, setView] = useState<View>('login')

  const activeView = isAuthed && (view === 'login' || view === 'signup')
    ? 'dashboard'
    : view

  return (
    <main className="app-shell">
      <aside className="brand-panel" aria-label="Demo overview">
        <div className="brand-mark">AD</div>
        <div>
          <p className="eyebrow">Auth Demo</p>
          <h1>Signup, login, dashboard, profile. Small and ready to wire.</h1>
        </div>
        <div className="demo-card">
          <span>Try the seeded account</span>
          <strong>mira@example.com</strong>
          <small>password123</small>
        </div>
      </aside>

      <section className="workspace">
        <nav className="topbar" aria-label="Auth views">
          <button
            className={activeView === 'login' ? 'active' : ''}
            disabled={isAuthed}
            onClick={() => setView('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={activeView === 'signup' ? 'active' : ''}
            disabled={isAuthed}
            onClick={() => setView('signup')}
            type="button"
          >
            Signup
          </button>
          <button
            className={activeView === 'dashboard' ? 'active' : ''}
            disabled={!isAuthed}
            onClick={() => setView('dashboard')}
            type="button"
          >
            Dashboard
          </button>
          <button
            className={activeView === 'profile' ? 'active' : ''}
            disabled={!isAuthed}
            onClick={() => setView('profile')}
            type="button"
          >
            Edit Profile
          </button>
        </nav>

        {activeView === 'login' && (
          <AuthForm mode="login" onModeChange={setView} />
        )}
        {activeView === 'signup' && (
          <AuthForm mode="signup" onModeChange={setView} />
        )}
        {activeView === 'dashboard' && <Dashboard onEdit={() => setView('profile')} />}
        {activeView === 'profile' && (
          <ProfileEditor onDone={() => setView('dashboard')} />
        )}
      </section>
    </main>
  )
}

function AuthForm({
  mode,
  onModeChange,
}: {
  mode: AuthMode
  onModeChange: (view: View) => void
}) {
  const { login, signup } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState(mode === 'login' ? 'mira@example.com' : '')
  const [password, setPassword] = useState(
    mode === 'login' ? 'password123' : '',
  )
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (mode === 'signup') {
        await signup(name.trim(), email.trim(), password)
      } else {
        await login(email.trim(), password)
      }
      onModeChange('dashboard')
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Something went wrong.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="auth-panel" onSubmit={handleSubmit}>
      <p className="section-label">{mode === 'signup' ? 'Create account' : 'Welcome back'}</p>
      <h2>{mode === 'signup' ? 'Start a fresh session' : 'Log into the demo'}</h2>

      {mode === 'signup' && (
        <label>
          Name
          <input
            autoComplete="name"
            minLength={2}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ava Johnson"
            required
            value={name}
          />
        </label>
      )}

      <label>
        Email
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          type="email"
          value={email}
        />
      </label>

      <label>
        Password
        <input
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          minLength={8}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
          required
          type="password"
          value={password}
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <button className="primary-action" disabled={isLoading} type="submit">
        {isLoading ? 'Working...' : mode === 'signup' ? 'Create account' : 'Log in'}
      </button>

      <button
        className="text-action"
        onClick={() => onModeChange(mode === 'signup' ? 'login' : 'signup')}
        type="button"
      >
        {mode === 'signup'
          ? 'Already have an account? Log in'
          : 'Need an account? Sign up'}
      </button>
    </form>
  )
}

function Dashboard({ onEdit }: { onEdit: () => void }) {
  const { user, token, logout } = useAuth()

  if (!user) {
    return null
  }

  return (
    <div className="dashboard-grid">
      <section className="summary-panel">
        <p className="section-label">Dashboard</p>
        <h2>Hey, {user.name}</h2>
        <p>{user.bio}</p>
        <div className="action-row">
          <button className="primary-action" onClick={onEdit} type="button">
            Edit profile
          </button>
          <button className="secondary-action" onClick={logout} type="button">
            Log out
          </button>
        </div>
      </section>

      <section className="stat-panel">
        <span>Role</span>
        <strong>{user.role}</strong>
      </section>
      <section className="stat-panel">
        <span>Email</span>
        <strong>{user.email}</strong>
      </section>
      <section className="stat-panel token-panel">
        <span>Cookie token</span>
        <code>{token}</code>
      </section>
    </div>
  )
}

function ProfileEditor({ onDone }: { onDone: () => void }) {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!user) {
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('')
    setIsLoading(true)

    try {
      await updateProfile({ name: name.trim(), bio: bio.trim() })
      setNotice('Profile updated.')
    } catch (caughtError) {
      setNotice(
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not update profile.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="auth-panel profile-panel" onSubmit={handleSubmit}>
      <p className="section-label">Edit profile</p>
      <h2>Keep the dashboard details current</h2>

      <label>
        Name
        <input
          minLength={2}
          onChange={(event) => setName(event.target.value)}
          required
          value={name}
        />
      </label>

      <label>
        Bio
        <textarea
          maxLength={160}
          onChange={(event) => setBio(event.target.value)}
          required
          rows={5}
          value={bio}
        />
      </label>

      {notice && <p className="form-note">{notice}</p>}

      <div className="action-row">
        <button className="primary-action" disabled={isLoading} type="submit">
          {isLoading ? 'Saving...' : 'Save profile'}
        </button>
        <button className="secondary-action" onClick={onDone} type="button">
          Back
        </button>
      </div>
    </form>
  )
}

export default App
