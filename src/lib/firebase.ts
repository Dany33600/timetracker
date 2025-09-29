import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Check if all required environment variables are present
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN', 
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
]

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName])

// Check for placeholder values that haven't been replaced
const placeholderValues = [
  'your_api_key_here',
  'your_project_id.firebaseapp.com', 
  'your_project_id',
  'your_project_id.appspot.com',
  'your_sender_id',
  'your_app_id',
  'REMPLACEZ_PAR_VOTRE_CLE_API',
  'REMPLACEZ_PAR_VOTRE_AUTH_DOMAIN',
  'REMPLACEZ_PAR_VOTRE_PROJECT_ID',
  'REMPLACEZ_PAR_VOTRE_STORAGE_BUCKET',
  'REMPLACEZ_PAR_VOTRE_SENDER_ID',
  'REMPLACEZ_PAR_VOTRE_APP_ID'
]

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app

// TypeScript interfaces for our data models
export interface Client {
  id: string
  userId: string
  name: string
  email?: string
  phone?: string
  hourlyRate: number
  createdAt: Date
}

export interface TimeEntry {
  id: string
  clientId: string
  userId: string
  date: string
  hours: number
  description: string
  amount: number
  createdAt: Date
  client?: Client
}