'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { ImageUpload } from '@/components/ui/image-upload'
import { Plus, Calendar, Clock, MapPin, Pencil, Trash, ChevronLeft, ChevronRight, Tags, Loader2 } from 'lucide-react'

type Event = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
  category?: string;
};

type Category = {
  id: string;
  name: string;
};

type FormData = {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
  category?: string;
};

export function EventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "list");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>();

  const imageUrl = watch('imageUrl');

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des événements");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des catégories");
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const url = editingEvent ? "/api/events" : "/api/events";
      const method = editingEvent ? "PUT" : "POST";
      const body = editingEvent ? { ...data, id: editingEvent.id } : data;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error();

      toast.success(
        editingEvent
          ? "Événement mis à jour avec succès"
          : "Événement créé avec succès"
      );
      reset();
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    reset({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      imageUrl: event.imageUrl || '',
      category: event.category || ''
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;

    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      toast.success("Événement supprimé avec succès");
      fetchEvents();
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    setIsAddingCategory(true);

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory }),
      });

      if (!response.ok) throw new Error();

      toast.success("Catégorie ajoutée avec succès");
      setNewCategory("");
      fetchCategories();
    } catch (error) {
      toast.error("Erreur lors de l'ajout de la catégorie");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) return;

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();

      toast.success("Catégorie supprimée avec succès");
      fetchCategories();
    } catch (error) {
      toast.error("Erreur lors de la suppression de la catégorie");
    }
  };

  const handleEditCategory = async (id: string) => {
    if (!editedCategoryName.trim()) return;
    setIsAddingCategory(true);

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editedCategoryName }),
      });

      if (!response.ok) throw new Error();

      toast.success("Catégorie mise à jour avec succès");
      setEditingCategory(null);
      setEditedCategoryName("");
      fetchCategories();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour de la catégorie");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const startEditingCategory = (category: Category) => {
    setEditingCategory(category);
    setEditedCategoryName(category.name);
  };

  const handleCreateNew = () => {
    setEditingEvent(null);
    reset({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      imageUrl: '',
      category: ''
    });
    setActiveTab("create");
  };

  // Calculate pagination
  const totalPages = Math.ceil(events.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = events.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gestion des Événements</h1>
          <p className="text-sm text-gray-600 mt-1">Gérez tous vos événements à partir d'un seul endroit</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={handleCreateNew}
            className="bg-primary hover:bg-primary/90 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Créer un Événement
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 text-black hover:text-black border-gray-200">
                <Tags className="h-4 w-4" />
                Gérer les Catégories
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-black tracking-tight">Gestion des Catégories</DialogTitle>
                <DialogDescription className="text-gray-700">
                  Ajoutez, modifiez ou supprimez des catégories pour vos événements.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Nouvelle catégorie"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 border-gray-200 focus:ring-primary bg-white text-black placeholder:text-gray-500"
                  />
                  <Button 
                    onClick={handleAddCategory}
                    disabled={isAddingCategory || !newCategory.trim()}
                    className="gap-2 bg-primary hover:bg-primary/90 text-white"
                  >
                    {isAddingCategory ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Ajouter
                  </Button>
                </div>
                <Separator className="bg-gray-100" />
                <ScrollArea className="h-[300px] pr-4 -mr-4">
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-gray-50/80 transition-all border border-gray-200"
                      >
                        {editingCategory?.id === category.id ? (
                          <div className="flex-1 flex gap-2">
                            <Input
                              value={editedCategoryName}
                              onChange={(e) => setEditedCategoryName(e.target.value)}
                              className="flex-1 border-gray-200 focus:ring-primary bg-white text-black placeholder:text-gray-500"
                              placeholder="Nom de la catégorie"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleEditCategory(category.id)}
                              disabled={isAddingCategory || !editedCategoryName.trim()}
                              className="bg-primary hover:bg-primary/90 text-white"
                            >
                              {isAddingCategory ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Sauvegarder"
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingCategory(null);
                                setEditedCategoryName("");
                              }}
                              className="border-gray-200 hover:bg-gray-50 text-black"
                            >
                              Annuler
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-black font-medium">{category.name}</span>
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditingCategory(category)}
                                className="hover:bg-gray-100 text-gray-700 hover:text-black"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteCategory(category.id)}
                                className="hover:bg-red-50 text-red-600 hover:text-red-700"
                              >
                                <Trash className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    {categories.length === 0 && (
                      <div className="text-center py-8 text-gray-700">
                        Aucune catégorie n'a été créée
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
          <Badge variant="default" className="bg-primary text-white px-4 py-2">
            {events.length} Événements
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-100/80">
          <TabsTrigger 
            value="list" 
            className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-600 hover:text-primary"
          >
            Liste des Événements
          </TabsTrigger>
          <TabsTrigger 
            value="create" 
            className="data-[state=active]:bg-primary data-[state=active]:text-white text-gray-600 hover:text-primary"
          >
            {editingEvent ? 'Modifier un Événement' : 'Détails de l\'Événement'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle className="text-black">
                {editingEvent ? 'Modifier un Événement' : 'Créer un Événement'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Input
                        {...register("title", { required: "Le titre est requis" })}
                        placeholder="Titre de l'événement"
                        className="w-full text-black placeholder:text-gray-500"
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                      )}
                    </div>

                    <div>
                      <Textarea
                        {...register("description", { required: "La description est requise" })}
                        placeholder="Description"
                        className="w-full min-h-[120px] text-black placeholder:text-gray-500"
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Input
                          {...register("date", { required: "La date est requise" })}
                          type="date"
                          className="w-full text-black"
                        />
                        {errors.date && (
                          <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                        )}
                      </div>

                      <div>
                        <Input
                          {...register("time", { required: "L'heure est requise" })}
                          type="time"
                          className="w-full text-black"
                        />
                        {errors.time && (
                          <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Input
                        {...register("location", { required: "Le lieu est requis" })}
                        placeholder="Lieu"
                        className="w-full text-black placeholder:text-gray-500"
                      />
                      {errors.location && (
                        <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
                      )}
                    </div>

                    <div>
                      <Select
                        value={watch("category") || ""}
                        onValueChange={(value) => {
                          setValue("category", value);
                        }}
                      >
                        <SelectTrigger className="w-full text-black">
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id}
                              className="text-black"
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <input type="hidden" {...register("imageUrl")} />
                    <ImageUpload
                      value={imageUrl || ''}
                      onChange={(url) => setValue("imageUrl", url || '')}
                      onRemove={() => setValue("imageUrl", '')}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  {editingEvent && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingEvent(null);
                        reset();
                      }}
                      className="text-black hover:text-black"
                    >
                      Annuler
                    </Button>
                  )}
                  <Button type="submit" disabled={loading} className="text-white">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingEvent ? "Mettre à jour" : "Créer"} l'événement
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <div className="h-[750px] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentEvents.map((event) => (
                <Card key={event.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-200 bg-white">
                  <div className="relative h-48 w-full">
                    {event.imageUrl && event.imageUrl.trim() ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                        <Calendar className="h-12 w-12 text-primary/30" />
                      </div>
                    )}
                    {event.category && (
                      <div className="absolute top-2 right-2">
                        <Badge 
                          variant="default" 
                          className="bg-primary/90 text-white backdrop-blur-sm"
                        >
                          {categories.find(cat => cat.id === event.category)?.name}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="flex-1 p-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold line-clamp-1 text-primary">
                          {event.title}
                        </h3>
                        <p className="text-gray-600 mt-1 text-sm line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{format(new Date(event.date), "d MMMM yyyy", { locale: fr })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(event)}
                        className="w-full sm:w-auto hover:bg-primary hover:text-white border-primary text-primary"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Modifier
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(event.id)}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white border-red-600"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Supprimer
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="h-10 w-10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="icon"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-10 w-10 ${
                        currentPage === pageNum
                          ? 'bg-primary text-white'
                          : 'text-gray-600'
                      }`}
                    >
                      {pageNum}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-10 w-10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Events count badge */}
            <div className="mt-6 text-center">
              <Badge variant="secondary" className="px-4 py-2">
                {events.length} événement{events.length !== 1 ? 's' : ''} au total
              </Badge>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 