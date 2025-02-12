'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, Pencil } from 'lucide-react';

interface Horaire {
  id: string;
  day: string;
  time: string;
  description: string;
  order: number;
}

export default function HorairesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [horaires, setHoraires] = useState<Horaire[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingHoraire, setEditingHoraire] = useState<Horaire | null>(null);
  const [formData, setFormData] = useState({
    day: '',
    time: '',
    description: '',
    order: 0,
  });
  const mounted = useRef(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const setupSSE = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/horaires/sse');
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('connected', (event) => {
      if (!mounted.current) return;
      const data = JSON.parse(event.data);
      console.log('SSE Connected:', data);
    });

    eventSource.addEventListener('initial', (event) => {
      if (!mounted.current) return;
      try {
        const data = JSON.parse(event.data);
        console.log('Received initial data:', data);
        setHoraires(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error processing initial data:', error);
      }
    });

    eventSource.addEventListener('update', (event) => {
      if (!mounted.current) return;
      try {
        const data = JSON.parse(event.data);
        console.log('Received update event:', data);
        if (Array.isArray(data)) {
          console.log('Setting horaires with update:', data);
          setHoraires(data);
        } else {
          console.error('Update data is not an array:', data);
        }
      } catch (error) {
        console.error('Error processing update:', error);
      }
    });

    eventSource.addEventListener('error', (event) => {
      if (!mounted.current) return;
      console.error('SSE Error:', event);
      if (eventSource) {
        eventSource.close();
        console.log('Closed eventSource due to error, attempting reconnect');
        // Attempt to reconnect after 5 seconds
        setTimeout(setupSSE, 5000);
      }
    });

    return eventSource;
  };

  useEffect(() => {
    mounted.current = true;

    const initializeData = async () => {
      if (status === 'unauthenticated') {
        router.push('/admin/login');
        return;
      }

      try {
        // Initial fetch
        const response = await fetch('/api/horaires');
        if (!response.ok) throw new Error('Failed to fetch horaires');
        const data = await response.json();
        if (mounted.current) {
          setHoraires(Array.isArray(data) ? data : []);
        }

        // Setup SSE
        setupSSE();
      } catch (error) {
        console.error('Error setting up SSE:', error);
        if (mounted.current) {
          toast.error('Error connecting to server');
        }
      }
    };

    initializeData();

    // Cleanup function
    return () => {
      mounted.current = false;
      if (eventSourceRef.current) {
        console.log('Cleaning up SSE connection');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mounted.current) return;
    setIsLoading(true);

    try {
      // Validate form data
      if (!formData.day.trim()) {
        throw new Error('Le jour est requis');
      }
      if (!formData.time.trim()) {
        throw new Error('L\'heure est requise');
      }
      if (!formData.description.trim()) {
        throw new Error('La description est requise');
      }

      // Normalize the day name (first letter uppercase, rest lowercase)
      const normalizedFormData = {
        ...formData,
        day: formData.day.charAt(0).toUpperCase() + formData.day.slice(1).toLowerCase(),
        order: formData.order || 0
      };

      const url = editingHoraire
        ? `/api/horaires/${editingHoraire.id}`
        : '/api/horaires';
      const method = editingHoraire ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(normalizedFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      if (mounted.current) {
        toast.success(
          editingHoraire ? 'Horaire modifié avec succès' : 'Horaire ajouté avec succès'
        );
        setIsModalOpen(false);
        resetForm();
        fetchHoraires();
      }
    } catch (error) {
      console.error('Error saving horaire:', error);
      if (mounted.current) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
      }
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet horaire ?')) return;
    if (!mounted.current) return;

    try {
      const response = await fetch(`/api/horaires/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      if (mounted.current) {
        toast.success('Horaire supprimé avec succès');
        fetchHoraires();
      }
    } catch (error) {
      console.error('Error deleting horaire:', error);
      if (mounted.current) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la suppression');
      }
    }
  };

  const handleEdit = (horaire: Horaire) => {
    if (!mounted.current) return;
    setEditingHoraire(horaire);
    setFormData({
      day: horaire.day,
      time: horaire.time,
      description: horaire.description,
      order: horaire.order,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    if (!mounted.current) return;
    setFormData({ day: '', time: '', description: '', order: 0 });
    setEditingHoraire(null);
  };

  const handleModalClose = () => {
    if (!mounted.current) return;
    setIsModalOpen(false);
    resetForm();
  };

  const fetchHoraires = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/horaires');
      if (!response.ok) {
        throw new Error('Failed to fetch horaires');
      }
      const data = await response.json();
      if (mounted.current) {
        setHoraires(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching horaires:', error);
      if (mounted.current) {
        toast.error('Failed to fetch horaires');
      }
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4C9296]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#4C9296] mb-2">Gestion des Horaires</h1>
          <p className="text-gray-600">Gérez les horaires des activités de l'église.</p>
        </div>

        {/* Form Section */}
        <Card className="border-2 border-[#4C9296]/10 shadow-lg mb-8">
          <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
            <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">
              {editingHoraire ? "Modifier l'horaire" : "Ajouter un horaire"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <Label htmlFor="day" className="text-base font-medium text-gray-900">
                    Jour
                  </Label>
                  <Input
                    id="day"
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    required
                    placeholder="ex: Lundi"
                    className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="time" className="text-base font-medium text-gray-900">
                    Horaire
                  </Label>
                  <Input
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    placeholder="ex: 19h00 - 20h30"
                    className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-medium text-gray-900">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  placeholder="Description de l'activité..."
                  rows={3}
                  className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#4C9296] hover:bg-[#3A7276] text-white shadow-md hover:shadow-lg transition-all min-w-[200px]"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Enregistrement...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>{editingHoraire ? "Mettre à jour" : "Ajouter"}</span>
                    </div>
                  )}
                </Button>
                {editingHoraire && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isLoading}
                    className="border-[#4C9296]/20 hover:bg-[#4C9296]/5 text-[#4C9296]"
                  >
                    Annuler
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Schedules List */}
        <Card className="border-2 border-[#4C9296]/10 shadow-lg">
          <CardHeader className="border-b border-[#4C9296]/10 bg-[#4C9296]/5">
            <CardTitle className="text-2xl font-serif font-bold text-[#4C9296]">
              Horaires existants
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {horaires.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun horaire n'a été ajouté.</p>
                </div>
              ) : (
                horaires.map((horaire) => (
                  <div
                    key={horaire.id}
                    className="flex items-center justify-between rounded-lg border-2 border-[#4C9296]/10 p-5 hover:border-[#4C9296]/30 transition-colors shadow-sm hover:shadow-md"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{horaire.day} • {horaire.time}</h3>
                      <p className="mt-2 text-gray-600">{horaire.description}</p>
                    </div>
                    <div className="ml-6 flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(horaire)}
                        className="h-8 w-8 p-0 text-[#4C9296] hover:bg-[#4C9296]/10"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(horaire.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 