import React from 'react'
import { useClients } from '../hooks/useClients'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { 
  Clock, Users, Euro, TrendingUp, Calendar, 
  BarChart3, Plus, ArrowRight 
} from 'lucide-react'

interface DashboardProps {
  onNavigate: (view: 'clients' | 'calendar' | 'reports') => void
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { clients, loading: clientsLoading } = useClients()
  const { timeEntries, getMonthlyStats } = useTimeEntries()

  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const currentMonth = currentDate.getMonth() + 1

  const monthlyStats = getMonthlyStats(currentYear, currentMonth)
  
  // Statistiques de la semaine actuelle
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1)
  
  const weeklyEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.date)
    const diffTime = entryDate.getTime() - startOfWeek.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays >= 0 && diffDays < 7
  })

  const weeklyHours = weeklyEntries.reduce((sum, entry) => sum + entry.hours, 0)
  const weeklyAmount = weeklyEntries.reduce((sum, entry) => sum + entry.amount, 0)

  // Activité récente
  const recentEntries = timeEntries.slice(0, 5)

  // Top clients du mois
  const topClientsThisMonth = monthlyStats.byClient?.slice(0, 3) || []

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bienvenue, voici un aperçu de votre activité
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {currentDate.toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Cette semaine</p>
              <p className="text-2xl font-bold">{weeklyHours.toFixed(1)}h</p>
              <p className="text-blue-100 text-xs mt-1">Heures travaillées</p>
            </div>
            <Clock className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Cette semaine</p>
              <p className="text-2xl font-bold">{weeklyAmount.toFixed(0)}€</p>
              <p className="text-green-100 text-xs mt-1">Chiffre d'affaires</p>
            </div>
            <Euro className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total</p>
              <p className="text-2xl font-bold">{clients.length}</p>
              <p className="text-purple-100 text-xs mt-1">Clients actifs</p>
            </div>
            <Users className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Ce mois</p>
              <p className="text-2xl font-bold">{monthlyStats.totalHours.toFixed(1)}h</p>
              <p className="text-orange-100 text-xs mt-1">Heures totales</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigate('clients')}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center text-blue-600 mb-2">
                <Users className="h-5 w-5 mr-2" />
                <span className="font-medium">Gérer les clients</span>
              </div>
              <p className="text-gray-600 text-sm">
                Ajouter, modifier ou supprimer vos clients
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('calendar')}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center text-green-600 mb-2">
                <Calendar className="h-5 w-5 mr-2" />
                <span className="font-medium">Planning mensuel</span>
              </div>
              <p className="text-gray-600 text-sm">
                Visualiser et saisir vos heures quotidiennes
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center text-purple-600 mb-2">
                <BarChart3 className="h-5 w-5 mr-2" />
                <span className="font-medium">Rapports & analyses</span>
              </div>
              <p className="text-gray-600 text-sm">
                Consulter vos statistiques et exporter vos données
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
          </div>
        </button>
      </div>

      {/* Contenu en deux colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top clients du mois */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Top clients ce mois</h2>
          </div>
          <div className="p-6">
            {topClientsThisMonth.length > 0 ? (
              <div className="space-y-4">
                {topClientsThisMonth.map((client: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-600">{client.entries.length} entrée(s)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{client.hours.toFixed(1)}h</p>
                      <p className="text-sm text-green-600">{client.amount.toFixed(2)}€</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune donnée</h3>
                <p className="mt-1 text-gray-500">Commencez par saisir vos premières heures.</p>
              </div>
            )}
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Activité récente</h2>
              <button
                onClick={() => onNavigate('reports')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Voir tout
              </button>
            </div>
          </div>
          <div className="p-6">
            {recentEntries.length > 0 ? (
              <div className="space-y-4">
                {recentEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {entry.client?.name || 'Client inconnu'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(entry.date).toLocaleDateString('fr-FR')} • {entry.hours}h
                      </p>
                      {entry.description && (
                        <p className="text-xs text-gray-500 truncate max-w-xs mt-1">
                          {entry.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{entry.amount.toFixed(2)}€</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune activité</h3>
                <p className="mt-1 text-gray-500">Vos dernières saisies apparaîtront ici.</p>
                <button
                  onClick={() => onNavigate('calendar')}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Saisir des heures
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Résumé mensuel */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Résumé - {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {monthlyStats.totalHours.toFixed(1)}h
              </div>
              <p className="text-gray-600">Heures travaillées</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {monthlyStats.totalAmount.toFixed(2)}€
              </div>
              <p className="text-gray-600">Chiffre d'affaires</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {monthlyStats.entriesCount}
              </div>
              <p className="text-gray-600">Jours travaillés</p>
            </div>
          </div>

          {monthlyStats.totalHours > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center">
                <p className="text-gray-600 mr-2">Taux horaire moyen:</p>
                <p className="text-xl font-semibold text-purple-600">
                  {(monthlyStats.totalAmount / monthlyStats.totalHours).toFixed(2)}€/h
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}