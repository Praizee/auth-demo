import type { Route } from '../types'

export function getRoute(): Route {
  const route = window.location.pathname

  if (
    route === '/login' ||
    route === '/signup' ||
    route === '/dashboard' ||
    route === '/profile'
  ) {
    return route
  }

  return '/login'
}

export function navigate(route: Route) {
  window.history.pushState(null, '', route)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
