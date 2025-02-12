'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { FiSave, FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Value {
  id: string;
  title: string;
  description: string;
}

interface RefleterAmourContent {
  mainTitle: string;
  subtitle: string;
  description: string;
  values: Value[];
}

export default function RefleterAmourPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const mounted = useRef(false);
  const [content, setContent] = useState<RefleterAmourContent>({
    mainTitle: '',
    subtitle: '',
    description: '',
    values: [],
  });

  useEffect(() => {
    mounted.current = true;
    
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/apropos/refleter-amour-christ');
        if (!response.ok) {
          const error = await response.text();
          throw new Error(error);
        }
        const data = await response.json();
        console.log('Fetched data:', data);
        if (mounted.current) {
          setContent(data);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
        if (mounted.current) {
          toast.error('Erreur lors du chargement du contenu');
        }
      }
    };

    fetchContent();
    
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleAddValue = () => {
    const newId = (content.values.length + 1).toString();
    setContent(prev => ({
      ...prev,
      values: [...prev.values, { id: newId, title: '', description: '' }],
    }));
  };

  const handleRemoveValue = (id: string) => {
    setContent(prev => ({
      ...prev,
      values: prev.values.filter(value => value.id !== id),
    }));
  };

  const handleValueChange = (id: string, field: keyof Value, value: string) => {
    setContent(prev => ({
      ...prev,
      values: prev.values.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mounted.current) return;
    setIsLoading(true);

    try {
      console.log('Submitting content:', content);
      const response = await fetch('/api/apropos/refleter-amour-christ', {
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
      
      if (mounted.current) {
        toast.success('Contenu mis à jour avec succès');
        // Force a hard refresh of the page
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating content:', error);
      if (mounted.current) {
        toast.error("Erreur lors de la mise à jour du contenu");
      }
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
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
              Refléter l'Amour du Christ
            </h1>
          </div>
          <Button
            type="submit"
            form="refleter-amour-form"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <FiSave className="h-4 w-4" />
            <span>Enregistrer</span>
          </Button>
        </div>

        <form id="refleter-amour-form" onSubmit={handleSubmit} className="space-y-8">
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
              <h2 className="text-lg font-medium text-gray-900">Nos Valeurs</h2>
              <Button
                type="button"
                onClick={handleAddValue}
                className="flex items-center gap-2"
              >
                <FiPlus className="h-4 w-4" />
                <span>Ajouter une valeur</span>
              </Button>
            </div>

            <div className="space-y-6">
              {content.values.map((value) => (
                <div key={value.id} className="relative rounded-lg border border-gray-200 p-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveValue(value.id)}
                    className="absolute right-4 top-4 text-gray-400 hover:text-red-500"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>

                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Titre de la valeur
                      </label>
                      <Input
                        value={value.title}
                        onChange={e => handleValueChange(value.id, 'title', e.target.value)}
                        required
                        className="text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description de la valeur
                      </label>
                      <Textarea
                        value={value.description}
                        onChange={e => handleValueChange(value.id, 'description', e.target.value)}
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