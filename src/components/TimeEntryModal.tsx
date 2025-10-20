import React, { useState, useEffect } from 'react'
import { useClients } from '../hooks/useClients'
import { useTimeEntries } from '../hooks/useTimeEntries'
import { ConfirmationModal } from './ConfirmationModal'
import { X, Clock, Euro, FileText } from 'lucide-react'

interface TimeEntryModalProps {
  date: string
  onClose: () => void
  onSave: () => void
}

export const TimeEntryModal: React.FC<TimeEntryModalProps> = ({ date, onClose, onSave }) => {
  const { clients } = useClients()
  const { getTimeEntriesByDate, addTimeEntry, updateTimeEntry, deleteTimeEntry } = useTimeEntries()
  const [confirmDelete, setConfirmDelete] = useState<{ show: boolean; entryId?: string; index?: number }>({ show: false })
  
  const [entries, setEntries] = useState<Array<{
    id?: string
    clientId: string
    hours: number
    description: string
    amount: number
    isNew?: boolean
  }>>([])

  useEffect(() => {
    const existingEntries = getTimeEntriesByDate(date)
    console.log('Existing entries for date', date, ':', existingEntries)
    if (existingEntries.length > 0) {
      setEntries(existingEntries.map(entry => ({
        id: entry.id,
        clientId: entry.clientId,
        hours: entry.hours,
        description: entry.description,
        amount: entry.amount,
        isNew: false
      })))
    } else {
      setEntries([{
        clientId: '',
        hours: 0,
        description: '',
        amount: 0,
        isNew: true
      }])
    }
  }, [date, getTimeEntriesByDate])

  const addNewEntry = () => {
    setEntries(prev => [...prev, {
      clientId: '',
      hours: 0,
      description: '',
      amount: 0,
      isNew: true
    }])
  }

  const updateEntry = (index: number, field: string, value: any) => {
    setEntries(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      
      // Recalculer le montant si le client ou les heures changent
      if (field === 'clientId' || field === 'hours') {
        const client = clients.find(c => c.id === (field === 'clientId' ? value : updated[index].clientId))
        const hours = field === 'hours' ? value : updated[index].hours
        if (client && hours) {
          updated[index].amount = client.hourlyRate * hours
        }
      }
      
      return updated
    })
  }

  const removeEntry = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      let hasError = false
      
      for (const entry of entries) {
        if (entry.clientId && entry.hours > 0) {
          if (entry.isNew || !entry.id) {
            const result = await addTimeEntry({
              clientId: entry.clientId,
              date,
              hours: entry.hours,
              description: entry.description,
              amount: entry.amount
            })
            if (result.error) {
              alert('Erreur lors de l\'ajout: ' + result.error)
              hasError = true
              break
            }
          } else if (entry.id) {
            const result = await updateTimeEntry(entry.id, {
              clientId: entry.clientId,
              hours: entry.hours,
              description: entry.description,
              amount: entry.amount
            })
            if (result.error) {
              alert('Erreur lors de la modification: ' + result.error)
              hasError = true
              break
            }
          }
        }
      }
      
      if (!hasError) {
        onSave()
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      alert('Erreur inattendue lors de la sauvegarde')
    }
  }

  const handleDelete = async (entryId: string, index: number) => {
    setConfirmDelete({ show: true, entryId, index })
  }

  const confirmDeleteEntry = async () => {
    if (confirmDelete.entryId && confirmDelete.index !== undefined) {
      const result = await deleteTimeEntry(confirmDelete.entryId)
      if (!result.error) {
        removeEntry(confirmDelete.index)
      } else {
        alert('Erreur lors de la suppression: ' + result.error)
      }
    }
    setConfirmDelete({ show: false })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const totalHours = entries.reduce((sum, entry) => sum + (entry.hours || 0), 0)
  const totalAmount = entries.reduce((sum, entry) => sum + (entry.amount || 0), 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Saisie des heures</h2>
              <p className="text-sm text-gray-600 capitalize">{formatDate(date)}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {entries.map((entry, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-900">
                  Entrée {index + 1}
                  {!entry.isNew && entry.id && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Existante
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => entry.id ? handleDelete(entry.id, index) : removeEntry(index)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                >
                  Supprimer
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client *
                  </label>
                  <select
                    value={entry.clientId}
                    onChange={(e) => updateEntry(index, 'clientId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Sélectionner un client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.hourlyRate}€/h)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Heures *
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="24"
                    value={entry.hours}
                    onChange={(e) => updateEntry(index, 'hours', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FileText className="inline h-4 w-4 mr-1" />
                  Description
                </label>
                <textarea
                  value={entry.description}
                  onChange={(e) => updateEntry(index, 'description', e.target.value)}
                  placeholder="Description du travail effectué..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                />
              </div>

              {entry.amount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center">
                    <Euro className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      Montant calculé: {entry.amount.toFixed(2)}€
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addNewEntry}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
          >
            + Ajouter une autre entrée
          </button>

          {entries.length === 0 && (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune entrée</h3>
              <p className="mt-1 text-gray-500">Cliquez sur "Ajouter une autre entrée" pour commencer.</p>
            </div>
          )}

          {totalHours > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{totalHours.toFixed(1)}h</div>
                  <div className="text-sm text-blue-800">Total heures</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{totalAmount.toFixed(2)}€</div>
                  <div className="text-sm text-green-800">Total montant</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={confirmDelete.show}
        title="Supprimer cette entrée ?"
        message="Cette action est irréversible. L'entrée de temps sera définitivement supprimée."
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={confirmDeleteEntry}
        onCancel={() => setConfirmDelete({ show: false })}
        type="danger"
      />
    </div>
  )
}