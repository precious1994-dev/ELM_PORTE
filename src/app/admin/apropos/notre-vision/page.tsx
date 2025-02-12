'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { FaArrowLeft, FaSave, FaPrayingHands, FaUsers, FaHandsHelping } from 'react-icons/fa';
import { FiSave, FiArrowLeft, FiEdit3, FiLayout, FiPlus, FiTrash2, FiEye } from 'react-icons/fi';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Point {
  id: string;
  title: string;
  description: string;
}

interface VisionContent {
  mainTitle: string;
  subtitle: string;
  description: string;
  points: Point[];
}

const defaultVisionData: VisionContent = {
  mainTitle: 'Notre Vision',
  subtitle: 'Foi · Communauté · Service',
  description: 'Ancrés dans la Parole de Dieu, nous aspirons à être une communauté vibrante qui inspire, équipe et mobilise chaque personne à vivre pleinement sa foi et à avoir un impact transformateur dans notre société.',
  points: [
    {
      id: '1',
      title: 'Foi',
      description: 'Grandir ensemble dans la connaissance de Dieu et dans notre relation avec Lui.',
    },
    {
      id: '2',
      title: 'Communauté',
      description: 'Créer des liens authentiques et soutenir chacun dans son parcours de vie.',
    },
    {
      id: '3',
      title: 'Service',
      description: "S'engager à servir notre prochain et à faire une différence dans notre société.",
    },
  ],
};

export default function VisionManager() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<VisionContent>(defaultVisionData);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/apropos/notre-vision');
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error);
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        setContent(data);
      } catch (error) {
        console.error('Error fetching content:', error);
        toast.error('Erreur lors du chargement du contenu');
      }
    };

    fetchContent();
  }, []);

  const handleAddPoint = () => {
    const newId = (content.points.length + 1).toString();
    setContent(prev => ({
      ...prev,
      points: [...prev.points, { id: newId, title: '', description: '' }],
    }));
  };

  const handleRemovePoint = (id: string) => {
    setContent(prev => ({
      ...prev,
      points: prev.points.filter(point => point.id !== id),
    }));
  };

  const handlePointChange = (id: string, field: keyof Point, value: string) => {
    setContent(prev => ({
      ...prev,
      points: prev.points.map(point => 
        point.id === id ? { ...point, [field]: value } : point
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Submitting content:', content);
      const response = await fetch('/api/apropos/notre-vision', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Server error response:', error);
        throw new Error(error);
      }

      const data = await response.json();
      console.log('Server response:', data);
      
      toast.success('Contenu mis à jour avec succès');
      
      // Force a hard refresh of the page
      window.location.reload();
    } catch (error) {
      console.error('Error updating content:', error);
      toast.error("Erreur lors de la mise à jour du contenu");
    } finally {
      setIsLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'FaPrayingHands':
        return <FaPrayingHands className="w-5 h-5" />;
      case 'FaUsers':
        return <FaUsers className="w-5 h-5" />;
      case 'FaHandsHelping':
        return <FaHandsHelping className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-5xl space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/apropos"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft className="h-5 w-5" />
              <span>Retour</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Notre Vision
            </h1>
          </div>
          <Button
            type="submit"
            form="vision-form"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <FiSave className="h-4 w-4" />
            <span>Enregistrer</span>
          </Button>
        </div>

        <form id="vision-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="grid gap-6">
              <div>
                <label htmlFor="mainTitle" className="block text-sm font-medium text-gray-700">
                  Titre Principal
                </label>
                <Input
                  id="mainTitle"
                  value={content.mainTitle}
                  onChange={e => setContent(prev => ({ ...prev, mainTitle: e.target.value }))}
                  required
                  className="text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">
                  Sous-titre
                </label>
                <Input
                  id="subtitle"
                  value={content.subtitle}
                  onChange={e => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
                  required
                  className="text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={content.description}
                  onChange={e => setContent(prev => ({ ...prev, description: e.target.value }))}
                  required
                  rows={4}
                  className="text-gray-900"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Points de Vision</h2>
              <Button
                type="button"
                onClick={handleAddPoint}
                className="flex items-center gap-2"
              >
                <FiPlus className="h-4 w-4" />
                <span>Ajouter un point</span>
              </Button>
            </div>

            <div className="space-y-6">
              {content.points?.map((point) => (
                <div key={point.id} className="relative rounded-lg border border-gray-200 p-4">
                  <button
                    type="button"
                    onClick={() => handleRemovePoint(point.id)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-red-500"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>

                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Titre du point
                      </label>
                      <Input
                        value={point.title}
                        onChange={e => handlePointChange(point.id, 'title', e.target.value)}
                        required
                        className="text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description du point
                      </label>
                      <Textarea
                        value={point.description}
                        onChange={e => handlePointChange(point.id, 'description', e.target.value)}
                        required
                        rows={3}
                        className="text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 