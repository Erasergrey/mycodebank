import { useCallback, useEffect, useState } from 'react'
import { getFirebaseErrorMessage } from '../services/firebaseErrors'

function useUserProfile(uid) {
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [profileExists, setProfileExists] = useState(false)
  const [isRealtime, setIsRealtime] = useState(false)
  const [loadedUid, setLoadedUid] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  const reloadProfile = useCallback(() => {
    setReloadToken((currentToken) => currentToken + 1)
  }, [])

  useEffect(() => {
    if (!uid) {
      setProfile(null)
      setIsLoading(false)
      setError('')
      setProfileExists(false)
      setIsRealtime(false)
      setLoadedUid('')
      return undefined
    }

    setProfile(null)
    setIsLoading(true)
    setError('')
    setProfileExists(false)
    setIsRealtime(false)
    setLoadedUid('')

    let isCancelled = false
    let unsubscribeProfile = null

    async function connectProfile() {
      try {
        const { subscribeToUserProfile } = await import('../services/userService')

        if (isCancelled) {
          return
        }

        unsubscribeProfile = subscribeToUserProfile(
          uid,
          ({ profile: profileData, profileExists: nextProfileExists }) => {
            if (isCancelled) {
              return
            }

            setProfile(profileData)
            setProfileExists(nextProfileExists)
            setError('')
            setIsRealtime(Boolean(profileData && nextProfileExists))
            setIsLoading(false)
            setLoadedUid(uid)
          },
          (profileError) => {
            if (isCancelled) {
              return
            }

            console.error('Realtime profile subscription failed:', {
              code: profileError?.code,
            })

            setError(getFirebaseErrorMessage(profileError))
            setIsRealtime(false)
            setIsLoading(false)
            setLoadedUid(uid)
          },
        )
      } catch (profileError) {
        if (isCancelled) {
          return
        }

        console.error('Realtime profile subscription failed:', {
          code: profileError?.code,
        })

        setProfile(null)
        setError(getFirebaseErrorMessage(profileError))
        setProfileExists(false)
        setIsRealtime(false)
        setIsLoading(false)
        setLoadedUid(uid)
      }
    }

    connectProfile()

    return () => {
      isCancelled = true

      if (unsubscribeProfile) {
        unsubscribeProfile()
      }
    }
  }, [reloadToken, uid])

  return {
    profile,
    isLoading: isLoading || Boolean(uid && loadedUid !== uid),
    error,
    profileExists,
    isRealtime,
    reloadProfile,
  }
}

export default useUserProfile
