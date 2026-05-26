const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string) {
  if (!email.trim()) {
    return 'Email is required.'
  }

  if (!emailPattern.test(email.trim())) {
    return 'Enter a valid email address.'
  }

  return ''
}

export function validatePassword(password: string) {
  if (!password) {
    return 'Password is required.'
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters.'
  }

  return ''
}

export function validateName(name: string) {
  if (!name.trim()) {
    return 'Name is required.'
  }

  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters.'
  }

  return ''
}

export function validateBio(bio: string) {
  if (!bio.trim()) {
    return 'Bio is required.'
  }

  if (bio.trim().length > 160) {
    return 'Bio must be 160 characters or less.'
  }

  return ''
}
