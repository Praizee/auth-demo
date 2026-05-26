import { type FormEvent, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { PageNav } from '../components/PageNav'

export function ProfilePage() {
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
    <main className="page">
      <form className="form-card" onSubmit={handleSubmit}>
        <PageNav />
        <h1>Edit profile</h1>

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
            rows={4}
            value={bio}
          />
        </label>

        {notice && <p className="notice">{notice}</p>}

        <button disabled={isLoading} type="submit">
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </main>
  )
}
