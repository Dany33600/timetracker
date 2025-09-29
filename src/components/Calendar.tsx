import React, { useState, useEffect } from 'react'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from 'lucide-react'
import { TimeEntryModal } from './TimeEntryModal'

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
]

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const { timeEntries, fetchTimeEntries, getTimeEntriesByDate, getMonthlyStats } = useTimeEntries()

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  useEffect(() => {
    fetchTimeEntries(year, month)
  }, [year, month])

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7 // Lundi = 0

    const days = []
    
    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, -i)
      days.push({
        date: prevDate.getDate(),
        fullDate: prevDate.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false
      })
    }

    // Jours du mois actuel
    const today = new Date().toISOString().split('T')[0]
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      days.push({
        date: day,
        fullDate,
        isCurrentMonth: true,
        isToday: fullDate === today
      })
    }

    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length // 6 semaines × 7 jours
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month, day)
      days.push({
        date: day,
        fullDate: nextDate.toISOString().split('T')[0],
        isCurrentMonth: false,
        isToday: false
      })
    }

    return days
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const handleDayClick = (fullDate: string) => {
    setSelectedDate(fullDate)
    setIsModalOpen(true)
  }

  const getDayWorkload = (fullDate: string) => {
    const entries = getTimeEntriesByDate(fullDate)
    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0)
    return {
      entries,
      totalHours,
      hasWork: entries.length > 0
    }
  }

  const monthlyStats = getMonthlyStats(year, month)
  const days = getDaysInMonth()

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CalendarDays className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Planning Mensuel</h1>
        </div>
      </div>

      {/* Statistiques mensuelles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Heures totales</p>
              <p className="text-2xl font-bold text-blue-600">{monthlyStats.totalHours.toFixed(1)}h</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CalendarDays className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Montant total</p>
              <p className="text-2xl font-bold text-green-600">{monthlyStats.totalAmount.toFixed(2)}€</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">€</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Jours travaillés</p>
              <p className="text-2xl font-bold text-orange-600">{monthlyStats.entriesCount}</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-bold">#</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-lg shadow-md">
        {/* Navigation du mois */}
        <div className="flex items-center justify-between p-6 border-b">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {MONTHS[month - 1]} {year}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {DAYS.map(day => (
            <div key={day} className="bg-white p-3 text-center">
              <span className="text-sm font-medium text-gray-700">{day}</span>
            </div>
          ))}
        </div>

        {/* Grille du calendrier */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day, index) => {
            const workload = getDayWorkload(day.fullDate)
            return (
              <div
                key={index}
                onClick={() => day.isCurrentMonth && handleDayClick(day.fullDate)}
                className={`
                  bg-white p-3 min-h-[100px] cursor-pointer hover:bg-gray-50 transition-colors relative
                  ${!day.isCurrentMonth ? 'text-gray-400' : ''}
                  ${day.isToday ? 'bg-blue-50 border-2 border-blue-200' : ''}
                `}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-medium ${day.isToday ? 'text-blue-600' : ''}`}>
                    {day.date}
                  </span>
                  {workload.hasWork && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                </div>

                {workload.hasWork && day.isCurrentMonth && (
                  <div className="mt-1 space-y-1">
                    <div className="text-xs text-gray-600">
                      {workload.totalHours.toFixed(1)}h
                    </div>
                    <div className="text-xs text-green-600 font-medium">
                      {workload.entries.reduce((sum, entry) => sum + entry.amount, 0).toFixed(0)}€
                    </div>
                    {workload.entries.length > 0 && (
                      <div className="text-xs text-gray-500 truncate">
                        {workload.entries.map(entry => entry.client?.name).join(', ')}
                      </div>
                    )}
                  </div>
                )}

                {day.isCurrentMonth && !workload.hasWork && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal de saisie */}
      {isModalOpen && selectedDate && (
        <TimeEntryModal
          date={selectedDate}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedDate(null)
          }}
          onSave={() => {
            fetchTimeEntries(year, month)
            setIsModalOpen(false)
            setSelectedDate(null)
          }}
        />
      )}
    </div>
  )
}