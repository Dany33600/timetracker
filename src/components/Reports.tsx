import React, { useState } from 'react'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { useClients } from '../hooks/useClients'
import { BarChart3, Calendar, Euro, FileText, Download, TrendingUp } from 'lucide-react'

export const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const { timeEntries, getMonthlyStats } = useTimeEntries()
  const { clients } = useClients()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const monthlyStats = getMonthlyStats(year, month)

  const getWeeklyData = () => {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1) // Lundi
    
    const weeklyEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      const diffTime = entryDate.getTime() - startOfWeek.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays >= 0 && diffDays < 7
    })

    return {
      totalHours: weeklyEntries.reduce((sum, entry) => sum + entry.hours, 0),
      totalAmount: weeklyEntries.reduce((sum, entry) => sum + entry.amount, 0),
      entries: weeklyEntries
    }
  }

  const getYearlyData = () => {
    const yearlyEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate.getFullYear() === year
    })

    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const monthEntries = yearlyEntries.filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate.getMonth() === i
      })
      
      return {
        month: new Date(year, i).toLocaleString('fr-FR', { month: 'long' }),
        hours: monthEntries.reduce((sum, entry) => sum + entry.hours, 0),
        amount: monthEntries.reduce((sum, entry) => sum + entry.amount, 0)
      }
    })

    return {
      totalHours: yearlyEntries.reduce((sum, entry) => sum + entry.hours, 0),
      totalAmount: yearlyEntries.reduce((sum, entry) => sum + entry.amount, 0),
      monthlyBreakdown
    }
  }

  const exportToCSV = () => {
    const data = selectedPeriod === 'month' ? timeEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate.getFullYear() === year && entryDate.getMonth() === month - 1
    }) : timeEntries

    const csvContent = [
      ['Date', 'Client', 'Heures', 'Description', 'Montant'],
      ...data.map(entry => [
        entry.date,
        entry.client?.name || 'Client inconnu',
        entry.hours.toString(),
        entry.description,
        entry.amount.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapport_${selectedPeriod}_${year}-${month.toString().padStart(2, '0')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const weeklyData = getWeeklyData()
  const yearlyData = getYearlyData()

  const getCurrentData = () => {
    switch (selectedPeriod) {
      case 'week':
        return weeklyData
      case 'year':
        return yearlyData
      default:
        return monthlyStats
    }
  }

  const currentData = getCurrentData()

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Rapports & Analyses</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
          
          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total heures</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentData.totalHours?.toFixed(1) || '0'}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Euro className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentData.totalAmount?.toFixed(2) || '0'}€
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taux horaire moyen</p>
              <p className="text-2xl font-bold text-gray-900">
                {currentData.totalHours && currentData.totalAmount 
                  ? (currentData.totalAmount / currentData.totalHours).toFixed(2)
                  : '0'
                }€
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Nb clients actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {selectedPeriod === 'month' ? monthlyStats.byClient?.length || 0 : clients.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Répartition par client */}
      {selectedPeriod === 'month' && monthlyStats.byClient && monthlyStats.byClient.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Répartition par client</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {monthlyStats.byClient.map((client: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-600">{client.entries.length} entrée(s)</p>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">{client.hours.toFixed(1)}h</p>
                      <p className="text-sm text-gray-600">Heures</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{client.amount.toFixed(2)}€</p>
                      <p className="text-sm text-gray-600">Montant</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Évolution annuelle */}
      {selectedPeriod === 'year' && (
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Évolution mensuelle {year}</h2>
          </div>
          <div className="p-6">
            <div className="grid gap-4">
              {yearlyData.monthlyBreakdown.map((month, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900 capitalize w-24">
                    {month.month}
                  </div>
                  <div className="flex-1 flex items-center space-x-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((month.hours / Math.max(...yearlyData.monthlyBreakdown.map(m => m.hours))) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                    <div className="text-right w-20">
                      <p className="font-semibold text-blue-600">{month.hours.toFixed(1)}h</p>
                    </div>
                    <div className="text-right w-24">
                      <p className="font-semibold text-green-600">{month.amount.toFixed(2)}€</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dernières entrées */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Dernières entrées</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Heures
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {timeEntries.slice(0, 10).map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(entry.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {entry.client?.name || 'Client inconnu'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                    {entry.hours.toFixed(1)}h
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {entry.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    {entry.amount.toFixed(2)}€
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {timeEntries.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune donnée</h3>
              <p className="mt-1 text-gray-500">Commencez par enregistrer vos premières heures de travail.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}