import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../auth/useAuth'
import { PageNav } from '../components/PageNav'
import { validateBio, validateName } from '../lib/validation'

export function ProfilePage() {
  const { user, updateProfile } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [notice, setNotice] = useState('')
  const [noticeType, setNoticeType] = useState<'error' | 'success'>('success')
  const [isLoading, setIsLoading] = useState(false)

  if (!user) {
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNotice('')

    const validationError = validateName(name) || validateBio(bio)
    if (validationError) {
      setNotice(validationError)
      setNoticeType('error')
      toast.error(validationError)
      return
    }

    setIsLoading(true)

    try {
      await updateProfile({ name: name.trim(), bio: bio.trim() })
      setNotice('Profile updated.')
      setNoticeType('success')
      toast.success('Profile updated.')
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : 'Could not update profile.'
      setNotice(message)
      setNoticeType('error')
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="page">
      <form className="form-card" onSubmit={handleSubmit}>
        <PageNav />
        <h1>Edit profile</h1>

        <label htmlFor="profile-name">
          Name
          <input
            id="profile-name"
            minLength={2}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </label>

        <label htmlFor="profile-bio">
          Bio
          <textarea
            id="profile-bio"
            maxLength={160}
            onChange={(event) => setBio(event.target.value)}
            required
            rows={4}
            value={bio}
          />
        </label>

        {notice && <p className={noticeType === 'error' ? 'error' : 'notice'}>{notice}</p>}

        <button disabled={isLoading} type="submit">
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </form>
    </main>
  )
}
