import { useCallback, useEffect, useState } from 'react'
import { getTransactionErrorMessage } from '../services/firebaseErrors'
import { subscribeToUserTransactions } from '../services/transactionService'

function useRealtimeTransactions(uid) {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isRealtime, setIsRealtime] = useState(false)
  const [loadedUid, setLoadedUid] = useState('')
  const [retryToken, setRetryToken] = useState(0)

  const retryTransactions = useCallback(() => {
    setRetryToken((currentToken) => currentToken + 1)
  }, [])

  useEffect(() => {
    if (!uid) {
      setTransactions([])
      setIsLoading(false)
      setError('')
      setIsRealtime(false)
      setLoadedUid('')
      return undefined
    }

    setTransactions([])
    setIsLoading(true)
    setError('')
    setIsRealtime(false)
    setLoadedUid('')

    try {
      const unsubscribe = subscribeToUserTransactions({
        uid,
        onData: ({ transactions: nextTransactions }) => {
          setTransactions(nextTransactions)
          setError('')
          setIsRealtime(true)
          setIsLoading(false)
          setLoadedUid(uid)
        },
        onError: (transactionsError) => {
          console.error('Realtime transactions subscription failed:', {
            code: transactionsError?.code,
          })

          setTransactions([])
          setError(getTransactionErrorMessage(transactionsError))
          setIsRealtime(false)
          setIsLoading(false)
          setLoadedUid(uid)
        },
      })

      return unsubscribe
    } catch (transactionsError) {
      console.error('Realtime transactions subscription failed:', {
        code: transactionsError?.code,
      })

      setTransactions([])
      setError(getTransactionErrorMessage(transactionsError))
      setIsRealtime(false)
      setIsLoading(false)
      setLoadedUid(uid)
      return undefined
    }
  }, [retryToken, uid])

  const isWaitingForCurrentUser = Boolean(uid && loadedUid !== uid)
  const isInitialLoading = isLoading || isWaitingForCurrentUser

  return {
    transactions,
    isLoading: isInitialLoading,
    error,
    isEmpty: !isInitialLoading && !error && transactions.length === 0,
    isRealtime,
    retryTransactions,
  }
}

export default useRealtimeTransactions
