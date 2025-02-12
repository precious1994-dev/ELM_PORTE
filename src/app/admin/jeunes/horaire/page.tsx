"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";

interface Schedule {
  _id: string;
  title: string;
  day: string;
  time: string;
  description: string;
}

export default function HorairePage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    day: "",
    time: "",
    description: "",
  });

  // Fetch schedules
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/jeunes/horaires");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch schedules');
      }
      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch schedules';
      toast.error(errorMessage);
      console.error('Error details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingId
        ? `/api/jeunes/horaire/${editingId}`
        : "/api/jeunes/horaires";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save schedule');
      }

      // Update local state based on the operation
      if (editingId) {
        setSchedules(prevSchedules => 
          prevSchedules.map(schedule => 
            schedule._id === editingId ? data.schedule : schedule
          )
        );
      } else {
        setSchedules(prevSchedules => [...prevSchedules, data.schedule]);
      }

      toast.success(editingId ? "Horaire modifié avec succès" : "Horaire ajouté avec succès");
      resetForm();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save schedule';
      toast.error(errorMessage);
      console.error('Error details:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet horaire ?")) return;

    try {
      const response = await fetch(`/api/jeunes/horaire/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete schedule');
      }

      // Update local state
      setSchedules(prevSchedules => 
        prevSchedules.filter(schedule => schedule._id !== id)
      );

      toast.success("Horaire supprimé avec succès");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete schedule';
      toast.error(errorMessage);
      console.error('Error details:', error);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule._id);
    setFormData({
      title: schedule.title,
      day: schedule.day,
      time: schedule.time,
      description: schedule.description,
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: "",
      day: "",
      time: "",
      description: "",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4C9296]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-[#4C9296] mb-2">Gestion des Horaires</h1>
          <p className="text-gray-600">Gérez les horaires des activités des jeunes.</p>
        </div>

        {/* Form */}
        <div className="mb-12 rounded-xl bg-white p-6 shadow-lg border-2 border-[#4C9296]/10">
          <div className="border-b border-[#4C9296]/10 pb-6 mb-6">
            <h2 className="font-serif text-2xl font-bold text-[#4C9296]">
              {editingId ? "Modifier l'horaire" : "Ajouter un horaire"}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <label htmlFor="title" className="mb-2 block text-base font-medium text-gray-900">
                  Titre
                </label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="ex: Réunion des Jeunes"
                  className="rounded-xl border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 text-black"
                />
              </div>
              <div>
                <label htmlFor="day" className="mb-2 block text-base font-medium text-gray-900">
                  Jour
                </label>
                <Input
                  id="day"
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  required
                  placeholder="ex: Samedi"
                  className="rounded-xl border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 text-black"
                />
              </div>
              <div>
                <label htmlFor="time" className="mb-2 block text-base font-medium text-gray-900">
                  Horaire
                </label>
                <Input
                  id="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                  placeholder="ex: 18h00 - 20h30"
                  className="rounded-xl border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 text-black"
                />
              </div>
            </div>
            <div>
              <label htmlFor="description" className="mb-2 block text-base font-medium text-gray-900">
                Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Description de l'activité..."
                rows={3}
                className="rounded-xl border-[#4C9296]/20 focus:border-[#4C9296] focus:ring-[#4C9296] placeholder:text-gray-400 resize-none text-black"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#4C9296] hover:bg-[#3A7276] text-white shadow-md hover:shadow-lg transition-all rounded-xl px-8 py-6 text-base font-medium min-w-[200px]"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Enregistrement...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    <span>{editingId ? "Mettre à jour" : "Ajouter"}</span>
                  </div>
                )}
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={submitting}
                  className="border-[#4C9296]/20 hover:bg-[#4C9296]/5 text-[#4C9296] rounded-xl px-8"
                >
                  Annuler
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="rounded-xl bg-white p-6 shadow-lg border-2 border-[#4C9296]/10">
          <div className="border-b border-[#4C9296]/10 pb-6 mb-6">
            <h2 className="font-serif text-2xl font-bold text-[#4C9296]">Horaires existants</h2>
          </div>
          <div className="space-y-4">
            {schedules.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun horaire n'a été ajouté.</p>
              </div>
            ) : (
              schedules.map((schedule) => (
                <div
                  key={schedule._id}
                  className="flex items-center justify-between rounded-xl border-2 border-[#4C9296]/10 p-5 hover:border-[#4C9296]/30 transition-colors shadow-sm hover:shadow-md"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-black">{schedule.title}</h3>
                    <p className="text-base text-black mt-1">
                      {schedule.day} • {schedule.time}
                    </p>
                    <p className="mt-2 text-black">{schedule.description}</p>
                  </div>
                  <div className="ml-6 flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(schedule)}
                      className="rounded-lg hover:bg-[#4C9296]/10 text-[#4C9296]"
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(schedule._id)}
                      className="rounded-lg hover:bg-red-50 text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 