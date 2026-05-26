import { handleNav } from '../lib/navigation'

export function PageNav() {
  return (
    <nav className="nav">
      <a href="/dashboard" onClick={(event) => handleNav(event, '/dashboard')}>
        Dashboard
      </a>
      <a href="/profile" onClick={(event) => handleNav(event, '/profile')}>
        Profile
      </a>
    </nav>
  )
}
