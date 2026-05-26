import { useAuth } from '../auth/useAuth'
import { PageNav } from '../components/PageNav'
import { handleNav } from '../lib/navigation'

export function DashboardPage() {
  const { user, token, logout } = useAuth()

  if (!user) {
    return null
  }

  return (
    <main className="page">
      <section className="content-card">
        <PageNav />
        <h1>Dashboard</h1>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <p>Bio: {user.bio}</p>
        <p className="token">Token: {token}</p>

        <div className="actions">
          <a href="/profile" onClick={(event) => handleNav(event, '/profile')}>
            Edit profile
          </a>
          <button onClick={logout} type="button">
            Logout
          </button>
        </div>
      </section>
    </main>
  )
}
