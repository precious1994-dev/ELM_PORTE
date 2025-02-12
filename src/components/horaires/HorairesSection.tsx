'use client';

import { useEffect, useState } from 'react';
import { FaMusic, FaBook, FaPray, FaUsers, FaClock, FaChevronRight } from 'react-icons/fa';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';

interface Horaire {
  id: string;
  day: string;
  time: string;
  description: string;
  order: number;
}

const getIconForDescription = (description: string) => {
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes('louange') || lowerDesc.includes('musique')) return FaMusic;
  if (lowerDesc.includes('étude') || lowerDesc.includes('biblique')) return FaBook;
  if (lowerDesc.includes('prière') || lowerDesc.includes('prier')) return FaPray;
  return FaUsers;
};

const getDayStyle = (day: string): { gradient: string; accent: string; soft: string } => {
  const styles: Record<string, { gradient: string; accent: string; soft: string }> = {
    dimanche: {
      gradient: 'from-[#4C9296]/10 to-[#3D7478]/10',
      accent: 'text-[#4C9296]',
      soft: 'bg-[#4C9296]/5',
    },
    lundi: {
      gradient: 'from-[#4C9296]/15 to-[#3D7478]/15',
      accent: 'text-[#4C9296]',
      soft: 'bg-[#4C9296]/10',
    },
    mardi: {
      gradient: 'from-[#4C9296]/20 to-[#3D7478]/20',
      accent: 'text-[#4C9296]',
      soft: 'bg-[#4C9296]/15',
    },
    mercredi: {
      gradient: 'from-[#4C9296]/25 to-[#3D7478]/25',
      accent: 'text-[#4C9296]',
      soft: 'bg-[#4C9296]/20',
    },
    jeudi: {
      gradient: 'from-[#4C9296]/30 to-[#3D7478]/30',
      accent: 'text-[#4C9296]',
      soft: 'bg-[#4C9296]/25',
    },
    vendredi: {
      gradient: 'from-[#4C9296]/35 to-[#3D7478]/35',
      accent: 'text-[#4C9296]',
      soft: 'bg-[#4C9296]/30',
    },
    samedi: {
      gradient: 'from-[#4C9296]/40 to-[#3D7478]/40',
      accent: 'text-[#4C9296]',
      soft: 'bg-[#4C9296]/35',
    },
  };
  return styles[day.toLowerCase()] || {
    gradient: 'from-[#4C9296]/20 to-[#3D7478]/20',
    accent: 'text-[#4C9296]',
    soft: 'bg-[#4C9296]/15',
  };
};

export default function HorairesSection() {
  const [horaires, setHoraires] = useState<Horaire[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHoraires = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/horaires');
        if (!response.ok) throw new Error('Failed to fetch horaires');
        const data = await response.json();
        setHoraires(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching horaires:', error);
        setError('Failed to load schedules');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHoraires();
  }, []);

  // Group horaires by day
  const horairesByDay = (horaires || []).reduce((acc, horaire) => {
    if (!acc[horaire.day]) {
      acc[horaire.day] = [];
    }
    acc[horaire.day].push(horaire);
    return acc;
  }, {} as Record<string, Horaire[]>);

  return (
    <Section className="bg-white">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-4xl font-bold tracking-tight text-[#4C9296] sm:text-5xl">
            Horaires
          </h2>
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-[#4C9296]/20"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm font-semibold uppercase tracking-wider text-[#4C9296]">
                Nos Rencontres
              </span>
            </div>
          </div>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Découvrez les différents moments de rencontre et de partage que nous proposons tout au long de la semaine
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            // Loading skeleton
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="animate-pulse bg-white rounded-3xl shadow-lg overflow-hidden">
                <div className="h-24 bg-[#4C9296]/5"></div>
                <div className="p-6">
                  <div className="space-y-6">
                    {Array(2).fill(0).map((_, i) => (
                      <div key={i} className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-[#4C9296]/5 rounded-2xl"></div>
                        <div className="flex-1">
                          <div className="h-5 w-20 bg-[#4C9296]/5 rounded mb-2"></div>
                          <div className="h-4 w-32 bg-[#4C9296]/5 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="col-span-4 text-center text-red-600 bg-white rounded-lg p-6 shadow-lg">
              {error}
            </div>
          ) : Object.entries(horairesByDay).length === 0 ? (
            <div className="col-span-4 text-center text-gray-500 bg-white rounded-lg p-6 shadow-lg">
              Aucun horaire n'a été ajouté
            </div>
          ) : (
            Object.entries(horairesByDay).map(([day, dayHoraires]) => {
              const styles = getDayStyle(day);
              return (
                <div key={day} className="group relative bg-white rounded-3xl shadow-lg overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
                  {/* Card Header */}
                  <div className={`relative h-24 bg-gradient-to-br ${styles.gradient}`}>
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-[#4C9296]/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-gradient"></div>
                    
                    {/* Day header content */}
                    <div className="absolute inset-0 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-[#4C9296] capitalize mb-1">
                            {day}
                          </h3>
                          <div className="flex items-center gap-2">
                            <FaClock className={`h-4 w-4 ${styles.accent}`} />
                            <span className="text-sm font-medium text-gray-600">
                              {dayHoraires.length} {dayHoraires.length > 1 ? 'activités' : 'activité'}
                            </span>
                          </div>
                        </div>
                        <div className={`w-10 h-10 rounded-2xl ${styles.soft} flex items-center justify-center transition-transform duration-500 group-hover:rotate-12`}>
                          <FaChevronRight className={`h-4 w-4 ${styles.accent}`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Activities List */}
                  <div className="p-6">
                    <div className="space-y-5">
                      {Array.isArray(dayHoraires) && dayHoraires.sort((a, b) => a.order - b.order).map((horaire) => {
                        const Icon = getIconForDescription(horaire.description);
                        return (
                          <div key={horaire.id} className="group/item flex items-start space-x-4">
                            <div className={`flex-shrink-0 w-12 h-12 rounded-2xl ${styles.soft} flex items-center justify-center transition-all duration-300 group-hover/item:scale-110`}>
                              <Icon className={`h-5 w-5 ${styles.accent}`} />
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold ${styles.accent} transition-colors duration-300`}>
                                {horaire.time}
                              </p>
                              <p className="text-gray-600 text-sm mt-0.5">
                                {horaire.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#4C9296]/20 to-[#3D7478]/0 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                  <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#4C9296]/20 to-[#3D7478]/0 blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100"></div>
                </div>
              );
            })
          )}
        </div>

        <p className="text-center text-gray-500 mt-8 text-sm">
          * Les horaires peuvent être modifiés lors d'événements spéciaux
        </p>
      </Container>
    </Section>
  );
} 