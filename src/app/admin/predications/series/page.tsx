'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { FaPlus, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Series {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  sermonCount?: number;
}

export default function AdminSeriesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newSeries, setNewSeries] = useState({ name: '', description: '', imageUrl: '' });
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchSeries();
    }
  }, [status, router]);

  const fetchSeries = async () => {
    try {
      const response = await fetch('/api/series');
      if (!response.ok) throw new Error('Failed to fetch series');
      const data = await response.json();
      setSeries(data);
    } catch (error) {
      console.error('Error fetching series:', error);
      toast.error('Erreur lors du chargement des séries');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSeries),
      });

      if (!response.ok) throw new Error('Failed to create series');
      
      toast.success('Série créée avec succès');
      setNewSeries({ name: '', description: '', imageUrl: '' });
      setIsAddingNew(false);
      fetchSeries();
    } catch (error) {
      console.error('Error creating series:', error);
      toast.error('Erreur lors de la création de la série');
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
    } catch (error) {
      console.error('Error deleting series:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              href="/admin/predications"
              className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <FaArrowLeft className="h-4 w-4" />
              Retour aux prédications
            </Link>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Gérer les Séries
            </h1>
          </div>
          <Button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="inline-flex items-center gap-2"
          >
            <FaPlus className="h-4 w-4" />
            Nouvelle Série
          </Button>
        </div>

        {isAddingNew && (
          <Card className="mb-6 p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom de la série
                </label>
                <input
                  type="text"
                  id="name"
                  value={newSeries.name}
                  onChange={(e) => setNewSeries({ ...newSeries, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={newSeries.description}
                  onChange={(e) => setNewSeries({ ...newSeries, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={3}
                />
              </div>
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                  URL de l'image
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  value={newSeries.imageUrl}
                  onChange={(e) => setNewSeries({ ...newSeries, imageUrl: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingNew(false)}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  Créer la série
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {series.map((serie) => (
            <Card key={serie._id} className="overflow-hidden">
              {serie.imageUrl && (
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={serie.imageUrl}
                    alt={serie.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{serie.name}</h3>
                {serie.description && (
                  <p className="mt-1 text-sm text-gray-600">{serie.description}</p>
                )}
                {serie.sermonCount !== undefined && (
                  <p className="mt-2 text-sm text-gray-500">
                    {serie.sermonCount} prédication{serie.sermonCount !== 1 ? 's' : ''}
                  </p>
                )}
                <div className="mt-4 flex justify-end gap-2">
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
                    onClick={() => router.push(`/admin/predications/series/${serie._id}/edit`)}
                  >
                    <FaEdit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 