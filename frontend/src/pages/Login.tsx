import { type FormEvent, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { handleNav } from '../lib/navigation'
import { navigate } from '../lib/router'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email.trim(), password)
      navigate('/dashboard')
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
    <main className="page">
      <form className="form-card" onSubmit={handleSubmit}>
        <h1>Login</h1>

        <label>
          Email
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label>
          Password
          <input
            autoComplete="current-password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button disabled={isLoading} type="submit">
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        <p>
          No account?{' '}
          <a href="/signup" onClick={(event) => handleNav(event, '/signup')}>
            Signup
          </a>
        </p>
      </form>
    </main>
  )
}
