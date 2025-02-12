'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Series {
  _id: string;
  name: string;
  sermonCount?: number;
}

interface SeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSeriesUpdate: () => void;
}

export default function SeriesModal({ isOpen, onClose, onSeriesUpdate }: SeriesModalProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSeriesName, setNewSeriesName] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingSeries, setEditingSeries] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (isOpen && status === 'authenticated') {
      fetchSeries();
    }
  }, [isOpen, status, router]);

  const fetchSeries = async () => {
    try {
      const response = await fetch('/api/series', {
        headers: {
          'Accept': 'application/json'
        }
      });

      let data;
      try {
        const textResponse = await response.text();
        try {
          data = JSON.parse(textResponse);
        } catch (e) {
          console.error('Invalid JSON response:', textResponse);
          throw new Error('Réponse invalide du serveur');
        }
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error('Erreur lors de la lecture de la réponse');
      }

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expirée, veuillez vous reconnecter');
          router.push('/admin/login');
          return;
        }
        throw new Error(data.error || 'Erreur lors du chargement des séries');
      }

      setSeries(data);
    } catch (error) {
      console.error('Error fetching series:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du chargement des séries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newSeriesName.trim();
    
    if (!trimmedName) {
      toast.error('Le nom de la série ne peut pas être vide');
      return;
    }

    try {
      const response = await fetch('/api/series', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      let data;
      try {
        const textResponse = await response.text();
        try {
          data = JSON.parse(textResponse);
        } catch (e) {
          console.error('Invalid JSON response:', textResponse);
          throw new Error('Réponse invalide du serveur');
        }
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error('Erreur lors de la lecture de la réponse');
      }

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expirée, veuillez vous reconnecter');
          router.push('/admin/login');
          return;
        }
        
        // If it's a duplicate series error and we have the existing name
        if (response.status === 400 && data.error === 'Une série avec ce nom existe déjà') {
          const message = data.existingName 
            ? `Une série "${data.existingName}" existe déjà`
            : 'Une série avec ce nom existe déjà';
          toast.error(message);
          return;
        }

        throw new Error(data.error || 'Erreur lors de la création de la série');
      }
      
      toast.success('Série créée avec succès');
      setNewSeriesName('');
      setIsAddingNew(false);
      await fetchSeries();
      onSeriesUpdate();
    } catch (error) {
      console.error('Error creating series:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création de la série');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette série ?')) return;

    try {
      const response = await fetch(`/api/series/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete series');
      
      toast.success('Série supprimée avec succès');
      fetchSeries();
      onSeriesUpdate();
    } catch (error) {
      console.error('Error deleting series:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = async (id: string, currentName: string) => {
    setEditingSeries(id);
    setEditedName(currentName);
  };

  const handleCancelEdit = () => {
    setEditingSeries(null);
    setEditedName('');
  };

  const handleSaveEdit = async (id: string) => {
    const trimmedName = editedName.trim();
    
    if (!trimmedName) {
      toast.error('Le nom de la série ne peut pas être vide');
      return;
    }

    try {
      // First, get the current series name before updating
      const currentSeries = series.find(s => s._id === id);
      if (!currentSeries) {
        throw new Error('Série non trouvée');
      }
      const oldSeriesName = currentSeries.name;

      // Update the series name
      const response = await fetch(`/api/series/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      let data;
      try {
        const textResponse = await response.text();
        try {
          data = JSON.parse(textResponse);
        } catch (e) {
          console.error('Invalid JSON response:', textResponse);
          throw new Error('Réponse invalide du serveur');
        }
      } catch (e) {
        console.error('Error parsing response:', e);
        throw new Error('Erreur lors de la lecture de la réponse');
      }

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expirée, veuillez vous reconnecter');
          router.push('/admin/login');
          return;
        }
        
        if (response.status === 400 && data.error === 'Une série avec ce nom existe déjà') {
          const message = data.existingName 
            ? `Une série "${data.existingName}" existe déjà`
            : 'Une série avec ce nom existe déjà';
          toast.error(message);
          return;
        }

        throw new Error(data.error || 'Erreur lors de la modification de la série');
      }

      // Update all sermons that belong to this series
      const updateSermonsResponse = await fetch('/api/sermons/update-series', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          oldSeriesName,
          newSeriesName: trimmedName
        }),
      });

      if (!updateSermonsResponse.ok) {
        console.error('Error updating sermons:', await updateSermonsResponse.text());
        toast.error('La série a été mise à jour mais certains sermons n\'ont pas pu être mis à jour');
      }
      
      toast.success('Série et sermons modifiés avec succès');
      setEditingSeries(null);
      setEditedName('');
      await fetchSeries();
      onSeriesUpdate();
    } catch (error) {
      console.error('Error updating series:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la modification de la série');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto bg-white">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-2xl font-bold text-primary">Gérer les Séries</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="mb-6 flex items-center justify-between">
            <Button
              onClick={() => setIsAddingNew(!isAddingNew)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90"
            >
              <FaPlus className="h-4 w-4" />
              Nouvelle Série
            </Button>
          </div>

          {isAddingNew && (
            <form onSubmit={handleSubmit} className="mb-6 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom de la série
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    id="name"
                    value={newSeriesName}
                    onChange={(e) => setNewSeriesName(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                  <Button type="submit" className="bg-primary hover:bg-primary/90">
                    Ajouter
                  </Button>
                </div>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="space-y-2">
              {series.map((serie) => (
                <div
                  key={serie._id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:border-primary/20 hover:bg-primary/5 transition-colors"
                >
                  <div className="flex-grow">
                    {editingSeries === serie._id ? (
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        autoFocus
                      />
                    ) : (
                      <div>
                        <h3 className="font-medium text-gray-900">{serie.name}</h3>
                        {serie.sermonCount !== undefined && (
                          <p className="text-sm text-gray-500">
                            {serie.sermonCount} prédication{serie.sermonCount !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editingSeries === serie._id ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelEdit}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <FaTimes className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSaveEdit(serie._id)}
                          className="text-green-600 hover:bg-green-50"
                        >
                          <FaCheck className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(serie._id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <FaTrash className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(serie._id, serie.name)}
                          className="text-blue-600 hover:bg-blue-50"
                        >
                          <FaEdit className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {series.length === 0 && (
                <p className="text-center text-sm text-gray-500">
                  Aucune série n'a été créée
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 