import { useCallback, useEffect, useState } from 'react'
import { getTransactionErrorMessage } from '../services/firebaseErrors'

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

    let isCancelled = false
    let unsubscribeTransactions = null

    async function connectTransactions() {
      try {
        const { subscribeToUserTransactions } = await import(
          '../services/transactionService'
        )

        if (isCancelled) {
          return
        }

        unsubscribeTransactions = subscribeToUserTransactions({
          uid,
          onData: ({ transactions: nextTransactions }) => {
            if (isCancelled) {
              return
            }

            setTransactions(nextTransactions)
            setError('')
            setIsRealtime(true)
            setIsLoading(false)
            setLoadedUid(uid)
          },
          onError: (transactionsError) => {
            if (isCancelled) {
              return
            }

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
      } catch (transactionsError) {
        if (isCancelled) {
          return
        }

        console.error('Realtime transactions subscription failed:', {
          code: transactionsError?.code,
        })

        setTransactions([])
        setError(getTransactionErrorMessage(transactionsError))
        setIsRealtime(false)
        setIsLoading(false)
        setLoadedUid(uid)
      }
    }

    connectTransactions()

    return () => {
      isCancelled = true

      if (unsubscribeTransactions) {
        unsubscribeTransactions()
      }
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
