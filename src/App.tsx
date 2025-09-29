import React, { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { AuthForm } from './components/AuthForm'
import { Dashboard } from './components/Dashboard'
import { ClientManager } from './components/ClientManager'
import { Calendar } from './components/Calendar'
import { Reports } from './components/Reports'
import { 
  Clock, Users, CalendarDays, BarChart3, 
  LogOut, Home, Menu, X 
} from 'lucide-react'

type ActiveView = 'dashboard' | 'clients' | 'calendar' | 'reports'

function App() {
  const { user, loading, signOut } = useAuth()
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthForm />
  }

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'clients', name: 'Clients', icon: Users },
    { id: 'calendar', name: 'Planning', icon: CalendarDays },
    { id: 'reports', name: 'Rapports', icon: BarChart3 },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'clients':
        return <ClientManager />
      case 'calendar':
        return <Calendar />
      case 'reports':
        return <Reports />
      default:
        return <Dashboard onNavigate={setActiveView} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar pour mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600 mr-3" />
                <span className="text-xl font-bold text-gray-900">TimeTracker</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="mt-4">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as ActiveView)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                      activeView === item.id
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </button>
                )
              })}
            </nav>
            <div className="absolute bottom-0 w-full p-4 border-t">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white shadow-lg">
          <div className="flex items-center px-6 py-4 border-b">
            <Clock className="h-8 w-8 text-blue-600 mr-3" />
            <span className="text-xl font-bold text-gray-900">TimeTracker Pro</span>
          </div>

          <nav className="mt-6 flex-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as ActiveView)}
                  className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                    activeView === item.id
                      ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </button>
              )
            })}
          </nav>

          <div className="p-4 border-t">
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Connecté en tant que:</p>
              <p className="font-medium text-gray-900 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-64">
        {/* Header mobile */}
        <div className="lg:hidden flex items-center justify-between bg-white shadow-sm px-4 py-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <Clock className="h-6 w-6 text-blue-600 mr-2" />
            <span className="font-bold text-gray-900">TimeTracker</span>
          </div>
          <div className="w-6" /> {/* Spacer for balance */}
        </div>

        {/* Contenu */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {renderActiveView()}
        </main>
      </div>
    </div>
  )
}

export default App