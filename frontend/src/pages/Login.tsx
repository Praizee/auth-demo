import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../auth/useAuth'
import { PasswordField } from '../components/PasswordField'
import { handleNav } from '../lib/navigation'
import { navigate } from '../lib/router'
import { validateEmail, validatePassword } from '../lib/validation'

export function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    const validationError = validateEmail(email) || validatePassword(password)
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    setIsLoading(true)

    try {
      await login(email.trim(), password)
      toast.success('Logged in successfully.')
      navigate('/dashboard')
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Something went wrong.'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="page">
      <form className="form-card" onSubmit={handleSubmit}>
        <h1>Login</h1>

        <label htmlFor="login-email">
          Email
          <input
            autoComplete="email"
            id="login-email"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <PasswordField
          autoComplete="current-password"
          id="login-password"
          label="Password"
          onChange={setPassword}
          value={password}
        />

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
