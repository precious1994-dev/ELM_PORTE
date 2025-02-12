'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/ui/image-upload';

interface CommunityData {
  title: string;
  description: string;
  yearsPresence: number;
  activeMembers: number;
  imageUrl: string;
}

export default function AdminCommunityPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<CommunityData>({
    title: '',
    description: '',
    yearsPresence: 0,
    activeMembers: 0,
    imageUrl: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/homepage/community');
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      console.error('Error fetching community data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/homepage/community', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          yearsPresence: formData.yearsPresence,
          activeMembers: formData.activeMembers,
          imageUrl: formData.imageUrl || ''
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update');
      }

      const updatedData = await response.json();
      setFormData(updatedData);
      
      // Force revalidation of the homepage
      await fetch('/api/revalidate?path=/');
      
      toast.success('Modifications enregistrées avec succès');
    } catch (error) {
      console.error('Error updating community data:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearsPresence' || name === 'activeMembers' 
        ? parseInt(value) || 0
        : value
    }));
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <h1 className="mb-8 text-center font-serif text-3xl font-bold text-primary">
            Modifier la Section Communauté
          </h1>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                Titre
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="text-gray-900"
              />
            </div>

            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={5}
                className="text-gray-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="yearsPresence" className="mb-2 block text-sm font-medium text-gray-700">
                  Années de présence
                </label>
                <Input
                  id="yearsPresence"
                  name="yearsPresence"
                  type="number"
                  value={formData.yearsPresence}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="activeMembers" className="mb-2 block text-sm font-medium text-gray-700">
                  Membres actifs
                </label>
                <Input
                  id="activeMembers"
                  name="activeMembers"
                  type="number"
                  value={formData.activeMembers}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="text-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Image de la communauté
              </label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                onUploadError={(error) => toast.error(error)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin')}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
            >
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 