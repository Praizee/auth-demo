import { type FormEvent, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { handleNav } from '../lib/navigation'
import { navigate } from '../lib/router'

export function SignupPage() {
  const { signup } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await signup(name.trim(), email.trim(), password)
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
        <h1>Signup</h1>

        <label>
          Name
          <input
            autoComplete="name"
            minLength={2}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </label>

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
            autoComplete="new-password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button disabled={isLoading} type="submit">
          {isLoading ? 'Creating...' : 'Signup'}
        </button>

        <p>
          Have an account?{' '}
          <a href="/login" onClick={(event) => handleNav(event, '/login')}>
            Login
          </a>
        </p>
      </form>
    </main>
  )
}
