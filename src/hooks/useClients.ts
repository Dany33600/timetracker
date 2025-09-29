import { useState, useEffect } from 'react'
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
  serverTimestamp 
} from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, db, type Client } from '../lib/firebase'

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, authLoading, authError] = useAuthState(auth)

  useEffect(() => {
    // Attendre que l'état d'authentification soit résolu
    if (authLoading) {
      return
    }

    if (!user) {
      setClients([])
      setDataLoading(false)
      return
    }

    setDataLoading(true)

    const q = query(
      collection(db, 'clients'),
      where('userId', '==', user.uid),
      orderBy('name')
    )

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const clientsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        })) as Client[]
        
        setClients(clientsData)
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

  const addClient = async (clientData: Omit<Client, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return { data: null, error: 'User not authenticated' }
    
    try {
      const docRef = await addDoc(collection(db, 'clients'), {
        ...clientData,
        userId: user.uid,
        createdAt: serverTimestamp()
      })
      return { data: { id: docRef.id }, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erreur lors de l\'ajout'
      return { data: null, error }
    }
  }

  const updateClient = async (id: string, updates: Partial<Omit<Client, 'id' | 'userId' | 'createdAt'>>) => {
    try {
      await updateDoc(doc(db, 'clients', id), updates)
      return { data: { id }, error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erreur lors de la mise à jour'
      return { data: null, error }
    }
  }

  const deleteClient = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'clients', id))
      return { error: null }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erreur lors de la suppression'
      return { error }
    }
  }

  return {
    clients,
    loading: authLoading || dataLoading,
    error: error || authError?.message || null,
    addClient,
    updateClient,
    deleteClient,
  }
}