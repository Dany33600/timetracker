import { useState, useEffect, useCallback } from 'react'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  getDoc,
  Timestamp
} from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db, type TimeEntry, type Client } from '../lib/firebase'

export const useTimeEntries = () => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, authLoading, authError] = useAuthState(auth)

  useEffect(() => {
    // Attendre que l'état d'authentification soit résolu
    if (authLoading) {
      return
    }

    if (!user) {
      setTimeEntries([])
      setDataLoading(false)
      return
    }

    setDataLoading(true)

    const q = query(
      collection(db, 'timeEntries'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    )

    const unsubscribe = onSnapshot(q, 
      async (snapshot) => {
        const entriesData = await Promise.all(
          snapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data()
            let client: Client | undefined
            
            // Fetch client data
            if (data.clientId) {
              try {
                const clientDoc = await getDoc(doc(db, 'clients', data.clientId))
                if (clientDoc.exists()) {
                  client = {
                    id: clientDoc.id,
                    ...clientDoc.data(),
                    createdAt: clientDoc.data().createdAt?.toDate()
                  } as Client
                }
              } catch (err) {
                console.error('Error fetching client:', err)
              }
            }
            
            return {
              id: docSnapshot.id,
              ...data,
              createdAt: data.createdAt?.toDate(),
              client
            } as TimeEntry
          })
        )
        
        setTimeEntries(entriesData)
        setDataLoading(false)
        setError(null)
      },
      (err) => {
        setError(err.message)
        setDataLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user, authLoading])

  const addTimeEntry = async (entryData: Omit<TimeEntry, 'id' | 'userId' | 'createdAt' | 'client'>) => {
    if (!user) return { data: null, error: 'User not authenticated' }
    
    try {
      const docRef = await addDoc(collection(db, 'timeEntries'), {
        ...entryData,
        userId: user.uid,
        createdAt: serverTimestamp()
      })
      return { data: { id: docRef.id }, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erreur lors de l\'ajout'
      return { data: null, error }
    }
  }

  const updateTimeEntry = async (id: string, updates: Partial<Omit<TimeEntry, 'id' | 'userId' | 'createdAt' | 'client'>>) => {
    try {
      await updateDoc(doc(db, 'timeEntries', id), updates)
      return { data: { id }, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      return { data: null, error }
    }
  }

  const deleteTimeEntry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'timeEntries', id))
      return { error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      return { error }
    }
  }

  const fetchTimeEntries = async (year?: number, month?: number) => {
    // This method is now handled by the real-time listener
    // but kept for compatibility
  }

  const getTimeEntriesByDate = useCallback((date: string) => {
    return timeEntries.filter(entry => entry.date === date)
  }, [timeEntries])

  const getMonthlyStats = (year: number, month: number) => {
    const monthEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate.getFullYear() === year && entryDate.getMonth() === month - 1
    })

    const totalHours = monthEntries.reduce((sum, entry) => sum + entry.hours, 0)
    const totalAmount = monthEntries.reduce((sum, entry) => sum + entry.amount, 0)

    const byClient = monthEntries.reduce((acc, entry) => {
      const clientId = entry.clientId
      const clientName = entry.client?.name || 'Client inconnu'
      
      if (!acc[clientId]) {
        acc[clientId] = {
          name: clientName,
          hours: 0,
          amount: 0,
          entries: []
        }
      }
      
      acc[clientId].hours += entry.hours
      acc[clientId].amount += entry.amount
      acc[clientId].entries.push(entry)
      
      return acc
    }, {} as Record<string, any>)

    return {
      totalHours,
      totalAmount,
      byClient: Object.values(byClient),
      entriesCount: monthEntries.length
    }
  }

  return {
    timeEntries,
    loading: authLoading || dataLoading,
    error: error || authError?.message || null,
    fetchTimeEntries,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    getTimeEntriesByDate,
    getMonthlyStats,
  }
}