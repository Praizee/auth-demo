import type { MouseEvent } from 'react'
import { navigate } from './router'
import type { Route } from '../types'

export function handleNav(event: MouseEvent<HTMLAnchorElement>, route: Route) {
  event.preventDefault()
  navigate(route)
}
