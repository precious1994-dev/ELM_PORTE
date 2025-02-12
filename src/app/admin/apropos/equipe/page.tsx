'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { FaArrowUp, FaArrowDown, FaTrash, FaEdit, FaImage } from 'react-icons/fa';

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  image: string;
  order: number;
}

export default function AdminTeamPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    image: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && mounted.current) {
      fetchTeam();
    }
  }, [status]);

  const fetchTeam = async () => {
    if (!mounted.current) return;
    
    try {
      const response = await fetch('/api/apropos/equipe');
      const data = await response.json();
      if (mounted.current) {
        setTeam(data);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      if (mounted.current) {
        toast.error('Erreur lors du chargement des données');
      }
    } finally {
      if (mounted.current) {
        setIsLoading(false);
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setFormData(prev => ({ ...prev, image: data.url }));
      toast.success('Image téléchargée avec succès');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingMember
        ? '/api/apropos/equipe'
        : '/api/apropos/equipe';
      
      const method = editingMember ? 'PUT' : 'POST';
      const body = editingMember
        ? { ...formData, id: editingMember._id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      toast.success(
        editingMember
          ? 'Membre modifié avec succès'
          : 'Membre ajouté avec succès'
      );
      
      setFormData({
        name: '',
        role: '',
        image: ''
      });
      setEditingMember(null);
      fetchTeam();
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/apropos/equipe?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }

      toast.success('Membre supprimé avec succès');
      fetchTeam();
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      image: member.image
    });
  };

  const handleMove = async (memberId: string, direction: 'up' | 'down') => {
    const currentIndex = team.findIndex(m => m._id === memberId);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === team.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newTeam = [...team];
    const [movedMember] = newTeam.splice(currentIndex, 1);
    newTeam.splice(newIndex, 0, movedMember);

    // Update order property
    const updatedTeam = newTeam.map((member, index) => ({
      ...member,
      order: index,
    }));

    setTeam(updatedTeam);

    // Update order in database
    try {
      for (const member of updatedTeam) {
        await fetch('/api/apropos/equipe', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: member._id,
            name: member.name,
            role: member.role,
            image: member.image,
            order: member.order,
          }),
        });
      }
      toast.success("Ordre mis à jour avec succès");
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error("Erreur lors de la mise à jour de l'ordre");
      fetchTeam();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#4C9296] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#4C9296] mb-2">Gestion de l'Équipe</h1>
          <p className="text-gray-600">Gérez les membres de l'équipe qui apparaissent sur la page À Propos</p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Form Section */}
          <Card className="border-2 border-[#4C9296]/10 shadow-lg">
            <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 p-6">
              <h2 className="text-2xl font-serif font-bold text-[#4C9296]">
                {editingMember ? 'Modifier un membre' : 'Ajouter un membre'}
              </h2>
              <p className="mt-1.5 text-gray-600">
                {editingMember 
                  ? 'Modifiez les informations du membre de l\'équipe' 
                  : 'Ajoutez un nouveau membre à l\'équipe'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-base font-medium text-gray-900">
                    Nom
                  </label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-base font-medium text-gray-900">
                    Rôle
                  </label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                    className="mt-1.5 text-gray-900 border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-base font-medium text-gray-900">
                    Image
                  </label>
                  <div className="mt-1.5 flex items-center gap-4">
                    {formData.image && (
                      <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-[#4C9296]/20">
                        <Image
                          src={formData.image}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="bg-white text-[#4C9296] border-[#4C9296] hover:bg-[#4C9296]/10 transition-colors"
                    >
                      {isUploading ? 'Téléchargement...' : 'Choisir une image'}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                {editingMember && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingMember(null);
                      setFormData({ name: '', role: '', image: '' });
                    }}
                    className="border-[#4C9296]/20 hover:bg-[#4C9296]/5 text-[#4C9296]"
                  >
                    Annuler
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-[#4C9296] hover:bg-[#3A7276] text-white shadow-md hover:shadow-lg transition-all"
                >
                  {isSaving
                    ? 'Enregistrement...'
                    : editingMember
                    ? 'Mettre à jour'
                    : 'Ajouter'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Team List Section */}
          <Card className="border-2 border-[#4C9296]/10 shadow-lg overflow-hidden">
            <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 p-6">
              <h2 className="text-2xl font-serif font-bold text-[#4C9296]">
                Membres de l'équipe
              </h2>
              <p className="mt-1.5 text-gray-600">
                {team.length} membre{team.length > 1 ? 's' : ''} au total
              </p>
            </div>
            <div className="divide-y divide-[#4C9296]/10">
              {team.map((member, index) => (
                <div
                  key={member._id}
                  className="flex items-center justify-between bg-white p-6 transition-colors hover:bg-[#4C9296]/5"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full ring-2 ring-[#4C9296]/20">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{member.name}</h3>
                      <p className="text-gray-600">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMove(member._id, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8 p-0 text-[#4C9296] hover:bg-[#4C9296]/10 disabled:text-[#4C9296]/30"
                    >
                      <FaArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMove(member._id, 'down')}
                      disabled={index === team.length - 1}
                      className="h-8 w-8 p-0 text-[#4C9296] hover:bg-[#4C9296]/10 disabled:text-[#4C9296]/30"
                    >
                      <FaArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(member)}
                      className="h-8 w-8 p-0 text-[#4C9296] hover:bg-[#4C9296]/10"
                    >
                      <FaEdit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(member._id)}
                      className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <FaTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {team.length === 0 && (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  Aucun membre dans l'équipe
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
} 