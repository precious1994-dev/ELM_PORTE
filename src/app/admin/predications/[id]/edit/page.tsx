'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { FaArrowLeft, FaYoutube, FaClock, FaBible, FaUser } from 'react-icons/fa';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/ui/image-upload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface SermonFormData {
  title: string;
  speaker: string;
  date: string;
  passage: string;
  description: string;
  duration: string;
  image: string;
  pasteurImage: string;
  youtubeUrl: string;
  series?: string;
}

interface Series {
  _id: string;
  name: string;
  description: string;
}

export default function EditSermonPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [series, setSeries] = useState<Series[]>([]);
  const [formData, setFormData] = useState<SermonFormData>({
    title: '',
    speaker: '',
    date: new Date().toISOString().split('T')[0],
    passage: '',
    description: '',
    duration: '',
    image: '',
    pasteurImage: '',
    youtubeUrl: '',
    series: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log('Input changed:', name, value);
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchSermon();
      fetchSeries();
    }
  }, [status, router, id]);

  const fetchSeries = async () => {
    try {
      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const response = await fetch('/api/series', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch series');
      }

      const data = await response.json();
      setSeries(data);
    } catch (error) {
      console.error('Error fetching series:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du chargement des séries');
      setSeries([]); // Set empty array as fallback
    }
  };

  const fetchSermon = async () => {
    try {
      if (!session?.user) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/sermons/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch sermon');
      }

      const data = await response.json();
      console.log('Fetched data:', data);

      const formattedData = {
        ...data,
        date: new Date(data.date).toISOString().split('T')[0],
        series: data.series || '',
      };
      
      console.log('Formatted data:', formattedData);
      setFormData(formattedData);
    } catch (error) {
      console.error('Error fetching sermon:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors du chargement de la prédication');
      router.push('/admin/predications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Create the data to send, ensuring series and book are included even if empty
    const dataToSend = {
      ...formData,
      series: formData.series || '',  // Ensure series is sent even if empty
    };

    console.log('Sending data:', dataToSend); // Debug log

    try {
      const response = await fetch(`/api/sermons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update sermon');
      }

      const updatedData = await response.json();
      console.log('Received data:', updatedData); // Debug log

      toast.success('Prédication modifiée avec succès');
      
      // Update local state with the response data before navigating
      setFormData({
        ...updatedData,
        date: new Date(updatedData.date).toISOString().split('T')[0],
        series: updatedData.series || '',
      });

      // Small delay to ensure state is updated before navigation
      setTimeout(() => {
        router.push('/admin/predications');
      }, 100);
    } catch (error) {
      console.error('Error updating sermon:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-gray-500">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link
            href="/admin/predications"
            className="group inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            <FaArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Retour aux prédications
          </Link>
        </div>

        <div className="mb-12">
          <h1 className="font-serif text-4xl font-bold tracking-tight text-gray-900 mb-3">
            Modifier la Prédication
          </h1>
          <p className="text-lg text-gray-500">
            Modifiez les informations de la prédication ci-dessous.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="border-primary/10 shadow-lg shadow-primary/5">
            <CardHeader className="border-b border-primary/10 bg-primary/5">
              <CardTitle className="text-primary">Informations Principales</CardTitle>
              <CardDescription>Les détails essentiels de la prédication</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-900">
                    Titre
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                    placeholder="Titre de la prédication"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="speaker" className="text-sm font-medium text-gray-900">
                    Prédicateur
                  </Label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="speaker"
                      name="speaker"
                      value={formData.speaker}
                      onChange={handleInputChange}
                      required
                      className="h-11 pl-10"
                      placeholder="Nom du prédicateur"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-gray-900">
                    Date
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="passage" className="text-sm font-medium text-gray-900">
                    Passage Biblique
                  </Label>
                  <div className="relative">
                    <FaBible className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="passage"
                      name="passage"
                      value={formData.passage}
                      onChange={handleInputChange}
                      required
                      className="h-11 pl-10"
                      placeholder="Ex: Jean 3:16"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium text-gray-900">
                    Durée
                  </Label>
                  <div className="relative">
                    <FaClock className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      className="h-11 pl-10"
                      placeholder="Ex: 45 min"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="series" className="text-sm font-medium text-gray-900">
                    Série
                  </Label>
                  <Select
                    value={formData.series || "none"}
                    onValueChange={(value) => setFormData({ ...formData, series: value === "none" ? "" : value })}
                  >
                    <SelectTrigger
                      id="series"
                      className="h-11"
                    >
                      <SelectValue placeholder="Sélectionner une série" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune série</SelectItem>
                      {series.map((s) => (
                        <SelectItem key={s._id} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 shadow-lg shadow-primary/5">
            <CardHeader className="border-b border-primary/10 bg-primary/5">
              <CardTitle className="text-primary">Média et Description</CardTitle>
              <CardDescription>Ajoutez les ressources média et la description</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-900">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="min-h-[120px] resize-y"
                  placeholder="Description de la prédication..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtubeUrl" className="text-sm font-medium text-gray-900">
                  URL YouTube
                </Label>
                <div className="relative">
                  <FaYoutube className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="youtubeUrl"
                    name="youtubeUrl"
                    value={formData.youtubeUrl}
                    onChange={handleInputChange}
                    required
                    className="h-11 pl-10"
                    placeholder="https://www.youtube.com/watch?v="
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900">
                    Image de couverture
                  </Label>
                  <ImageUpload
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    onRemove={() => setFormData({ ...formData, image: '' })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900">
                    Image du pasteur
                  </Label>
                  <ImageUpload
                    value={formData.pasteurImage}
                    onChange={(url) => setFormData({ ...formData, pasteurImage: url })}
                    onRemove={() => setFormData({ ...formData, pasteurImage: '' })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/predications')}
              className="w-full md:w-auto border-primary text-primary hover:bg-primary/10 hover:text-primary"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white"
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Enregistrement...
                </>
              ) : (
                'Enregistrer les modifications'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 