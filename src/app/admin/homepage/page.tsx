'use client';

import { useState, useEffect, useRef } from 'react';
import { FiArrowLeft, FiSave, FiPlus, FiTrash2, FiMove, FiImage, FiType, FiAlignLeft, FiLink, FiEye, FiChevronUp, FiChevronDown, FiUpload, FiAlertCircle, FiLayout, FiEdit3 } from 'react-icons/fi';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Slide {
  title: string;
  description: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  imageUrl?: string;
}

function SortableSlide({ slide, index, isSelected, onClick }: { 
  slide: Slide; 
  index: number;
  isSelected: boolean;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `slide-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const slideTitle = slide?.title || `Slide ${index + 1}`;
  const slideDescription = slide?.description || 'No description';
  const slideImageUrl = slide?.imageUrl || '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'bg-primary/5' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        onClick={onClick}
        className={`w-full text-left p-4 hover:bg-gray-50 transition-all duration-200 rounded-xl flex items-center justify-between group cursor-move ${
          isSelected ? 'bg-primary/10 ring-1 ring-primary/20' : ''
        }`}
      >
        <div className="flex items-center min-w-0 gap-4">
          <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {slideImageUrl ? (
              <img src={slideImageUrl} alt="" className="h-12 w-12 object-cover" />
            ) : (
              <FiImage className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div className="truncate">
            <span className={`block text-sm font-medium ${
              isSelected ? 'text-primary' : 'text-gray-900'
            }`}>
              {slideTitle}
            </span>
            <span className="block text-xs text-gray-500 truncate mt-0.5">
              {slideDescription}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-1.5 rounded-lg bg-gray-50 text-gray-400 group-hover:text-gray-500">
            <FiMove className="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

const fetchHomepageData = async () => {
  try {
    const response = await fetch('/api/homepage', {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch homepage data');
    }
    
    const data = await response.json();
    if (!data || !data.sliderSection) {
      throw new Error('Invalid data received from server');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    throw error;
  }
};

const setupSSE = (onUpdate: (data: any) => void) => {
  const eventSource = new EventSource('/api/homepage/sse');
  
  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onUpdate(data);
    } catch (error) {
      console.error('Error parsing SSE data:', error);
    }
  };

  eventSource.onerror = (error) => {
    console.error('SSE error:', error);
    eventSource.close();
    // Try to reconnect after 5 seconds
    setTimeout(() => setupSSE(onUpdate), 5000);
  };

  return eventSource;
};

export default function HomepageManager() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSlide, setSelectedSlide] = useState<number | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Initialize sliderSection with a default empty state
  const [sliderSection, setSliderSection] = useState<{ slides: Slide[] }>({
    slides: []
  });

  // Setup DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load current content
  useEffect(() => {
    let mounted = true;

    const loadContent = async () => {
      try {
        const data = await fetchHomepageData();
        if (!mounted) return;

        if (data?.sliderSection?.slides) {
          setSliderSection({
            slides: data.sliderSection.slides.map((slide: Slide): Slide => ({
              title: slide.title || '',
              description: slide.description || '',
              imageUrl: slide.imageUrl || '',
              buttonText: slide.buttonText || '',
              buttonLink: slide.buttonLink || '',
            }))
          });
          
          if (data.sliderSection.slides.length > 0) {
            setSelectedSlide(0);
          }
        }
      } catch (error) {
        if (!mounted) return;
        console.error('Error loading content:', error);
        setError('Failed to load content');
      }
    };

    loadContent();
    return () => {
      mounted = false;
    };
  }, []);

  // Protect the page
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin');
    }
  }, [status, router]);

  // Add SSE setup
  useEffect(() => {
    const eventSource = setupSSE((data) => {
      if (data?.sliderSection) {
        setSliderSection(data.sliderSection);
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const validateSlide = (slide: Slide): ValidationErrors => {
    const errors: ValidationErrors = {};
    
    // Check if slide exists and has required properties
    if (!slide) return errors;

    if (!slide.title || !slide.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!slide.description || !slide.description.trim()) {
      errors.description = 'Description is required';
    }
    if (!slide.imageUrl || !slide.imageUrl.trim()) {
      errors.imageUrl = 'Image is required';
    }
    return errors;
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    setValidationErrors({});

    try {
      // Validate all slides
      const errors = sliderSection.slides.map(validateSlide);
      const hasErrors = errors.some(error => Object.keys(error).length > 0);
      
      if (hasErrors) {
        setError('Please fix all validation errors before saving.');
        return;
      }

      const response = await fetch('/api/homepage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sliderSection
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      toast.success('Changes saved successfully');
      router.refresh();
    } catch (error) {
      console.error('Save error:', error);
      setError(error instanceof Error ? error.message : 'Error saving changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      if (selectedSlide !== null) {
        updateSlide(selectedSlide, 'imageUrl', data.url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().split('-')[1]);
      const newIndex = parseInt(over.id.toString().split('-')[1]);

      setSliderSection((prev) => ({
        slides: arrayMove(prev.slides, oldIndex, newIndex),
      }));
      setSelectedSlide(newIndex);
    }
  };

  const addSlide = () => {
    const newSlide: Slide = {
      title: '',
      description: '',
      imageUrl: '',
      buttonText: '',
      buttonLink: '',
    };
    
    setSliderSection(currentState => ({
      slides: [...(currentState?.slides || []), newSlide]
    }));
    setSelectedSlide(sliderSection.slides.length);
  };

  const updateSlide = (index: number, field: keyof Slide, value: string) => {
    if (index < 0 || !sliderSection?.slides || index >= sliderSection.slides.length) return;
    
    setSliderSection(prev => {
      const newSlides = [...(prev?.slides || [])];
      newSlides[index] = {
        ...newSlides[index],
        [field]: value
      };
      return { slides: newSlides };
    });
  };

  const removeSlide = (index: number) => {
    const newSlides = sliderSection.slides.filter((_, i) => i !== index);
    setSliderSection({ slides: newSlides });
    if (selectedSlide === index) {
      setSelectedSlide(newSlides.length > 0 ? 0 : null);
    } else if (selectedSlide && selectedSlide > index) {
      setSelectedSlide(selectedSlide - 1);
    }
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sliderSection.slides.length - 1)
    ) {
      return;
    }

    const newSlides = [...sliderSection.slides];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];
    setSliderSection({ slides: newSlides });
    setSelectedSlide(newIndex);
  };

  const getSelectedSlide = (): Slide => {
    if (selectedSlide === null || !sliderSection.slides[selectedSlide]) {
      return {
        title: '',
        description: '',
        imageUrl: '',
        buttonText: '',
        buttonLink: '',
      };
    }
    return sliderSection.slides[selectedSlide];
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur-sm bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <FiArrowLeft className="w-5 h-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Gérer la page d'accueil</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <FiEye className="w-4 h-4" />
                {previewMode === 'desktop' ? 'Vue Mobile' : 'Vue Desktop'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Slides List */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Slides</h2>
                <button
                  onClick={addSlide}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>
              <div className="p-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sliderSection.slides.map((_, i) => `slide-${i}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {sliderSection.slides.map((slide, index) => (
                        <SortableSlide
                          key={`slide-${index}`}
                          slide={slide}
                          index={index}
                          isSelected={selectedSlide === index}
                          onClick={() => setSelectedSlide(index)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          </div>

          {/* Slide Editor */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {selectedSlide !== null && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Modifier le slide</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveSlide(selectedSlide, 'up')}
                      disabled={selectedSlide === 0}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveSlide(selectedSlide, 'down')}
                      disabled={selectedSlide === sliderSection.slides.length - 1}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeSlide(selectedSlide)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Image Upload */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Image
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden group">
                        {sliderSection.slides[selectedSlide].imageUrl ? (
                          <>
                            <img
                              src={sliderSection.slides[selectedSlide].imageUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors"
                              >
                                <FiEdit3 className="w-5 h-5" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-600"
                          >
                            <FiUpload className="w-6 h-6" />
                            <span className="text-xs">Upload Image</span>
                          </button>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      {validationErrors.imageUrl && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <FiAlertCircle className="w-4 h-4" />
                          {validationErrors.imageUrl}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={sliderSection.slides[selectedSlide].title}
                      onChange={(e) => updateSlide(selectedSlide, 'title', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Entrez le titre du slide"
                    />
                    {validationErrors.title && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <FiAlertCircle className="w-4 h-4" />
                        {validationErrors.title}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={sliderSection.slides[selectedSlide].description}
                      onChange={(e) => updateSlide(selectedSlide, 'description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Entrez la description du slide"
                    />
                    {validationErrors.description && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <FiAlertCircle className="w-4 h-4" />
                        {validationErrors.description}
                      </p>
                    )}
                  </div>

                  {/* Button Settings */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Bouton (optionnel)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={sliderSection.slides[selectedSlide].buttonText || ''}
                        onChange={(e) => updateSlide(selectedSlide, 'buttonText', e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Texte du bouton"
                      />
                      <input
                        type="text"
                        value={sliderSection.slides[selectedSlide].buttonLink || ''}
                        onChange={(e) => updateSlide(selectedSlide, 'buttonLink', e.target.value)}
                        className="px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Lien du bouton"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Aperçu</h2>
              </div>
              <div className={`p-6 ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                {selectedSlide !== null && (
                  <div className="aspect-[16/9] rounded-xl overflow-hidden bg-gray-100 relative group">
                    {sliderSection.slides[selectedSlide].imageUrl && (
                      <img
                        src={sliderSection.slides[selectedSlide].imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                      <div className="text-white">
                        <h3 className="text-2xl font-bold">
                          {sliderSection.slides[selectedSlide].title}
                        </h3>
                        <p className="mt-2 text-white/80">
                          {sliderSection.slides[selectedSlide].description}
                        </p>
                        {sliderSection.slides[selectedSlide].buttonText && (
                          <button className="mt-4 px-6 py-2 bg-white text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                            {sliderSection.slides[selectedSlide].buttonText}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 