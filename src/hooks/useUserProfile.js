import { useCallback, useEffect, useState } from 'react'
import { getFirebaseErrorMessage } from '../services/firebaseErrors'
import { getUserProfile } from '../services/userService'

function useUserProfile(uid) {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  const reloadProfile = useCallback(() => {
    setReloadToken((currentToken) => currentToken + 1)
  }, [])

  useEffect(() => {
    if (!uid) {
      setProfile(null)
      setIsLoading(false)
      setError('')
      return undefined
    }

    let isMounted = true

    async function loadProfile() {
      setIsLoading(true)
      setError('')

      try {
        const profileData = await getUserProfile(uid)

        if (!isMounted) {
          return
        }

        setProfile(profileData)
      } catch (profileError) {
        console.error('Error loading user profile:', {
          code: profileError?.code,
        })

        if (!isMounted) {
          return
        }

        setProfile(null)
        setError(getFirebaseErrorMessage(profileError))
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [reloadToken, uid])

  return {
    profile,
    isLoading,
    error,
    reloadProfile,
  }
}

export default useUserProfile
