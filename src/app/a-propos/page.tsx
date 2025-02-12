'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import HorairesSection from '@/components/horaires/HorairesSection';
import Link from 'next/link';
import { Clock, MapPin } from 'lucide-react';

interface BannerData {
  imageUrl: string;
  welcome: string;
  title: string;
  subtitle: string;
  description: string;
  schedule: string;
  location: string;
}

interface HistoryItem {
  id: string;
  title: string;
  description: string;
  year: string;
}

interface HistorySection {
  mainTitle: string;
  subtitle: string;
  description: string;
  items: HistoryItem[];
}

interface RefleterAmourSection {
  mainTitle: string;
  subtitle: string;
  description: string;
  values: {
    id: string;
    title: string;
    description: string;
  }[];
}

interface VisionSection {
  mainTitle: string;
  subtitle: string;
  description: string;
  points: {
    id: string;
    title: string;
    description: string;
  }[];
}

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  description: string;
  image: string;
  order: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  category?: string;
}

interface Category {
  id: string;
  name: string;
}

// Add this CSS at the top of the file, after the imports
const noScrollbarStyles = `
  @layer utilities {
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  }
`;

export default function About() {
  const [isLoading, setIsLoading] = useState(true);
  const [historyData, setHistoryData] = useState<HistorySection | null>(null);
  const [refleterData, setRefleterData] = useState<RefleterAmourSection | null>(null);
  const [visionData, setVisionData] = useState<VisionSection | null>(null);
  const [teamData, setTeamData] = useState<TeamMember[]>([]);
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch banner data
        const bannerResponse = await fetch('/api/apropos/banner');
        if (bannerResponse.ok) {
          const bannerJson = await bannerResponse.json();
          console.log('Banner data:', bannerJson);
          setBannerData(bannerJson);
        }

        // Fetch history data
        const historyResponse = await fetch('/api/apropos/histoire');
        if (historyResponse.ok) {
          const historyJson = await historyResponse.json();
          console.log('History data:', historyJson);
          setHistoryData(historyJson);
        }

        // Fetch refleter data
        console.log('Fetching refleter data...');
        const refleterResponse = await fetch('/api/apropos/refleter-amour-christ');
        console.log('Refleter response status:', refleterResponse.status);
        
        if (refleterResponse.ok) {
          const refleterJson = await refleterResponse.json();
          console.log('Refleter data received:', refleterJson);
          setRefleterData(refleterJson);
        }

        // Fetch vision data
        console.log('Fetching vision data...');
        const visionResponse = await fetch('/api/apropos/notre-vision');
        console.log('Vision response status:', visionResponse.status);
        
        if (visionResponse.ok) {
          const visionJson = await visionResponse.json();
          console.log('Vision data received:', visionJson);
          setVisionData(visionJson);
        }

        // Fetch team data
        console.log('Fetching team data...');
        const teamResponse = await fetch('/api/apropos/equipe');
        console.log('Team response status:', teamResponse.status);
        
        if (teamResponse.ok) {
          const teamJson = await teamResponse.json();
          console.log('Team data received:', teamJson);
          setTeamData(teamJson);
        }

        // Fetch categories first
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }

        // Fetch upcoming events
        const eventsResponse = await fetch('/api/events');
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          // Filter and sort upcoming events
          const now = new Date();
          now.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
          
          const upcoming = eventsData
            .filter((event: Event) => {
              const eventDate = new Date(event.date);
              eventDate.setHours(0, 0, 0, 0); // Reset time to start of day
              return eventDate >= now;
            })
            .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3); // Get only the next 3 events
          
          setUpcomingEvents(upcoming);
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Inject the no-scrollbar styles
    const styleSheet = document.createElement("style");
    styleSheet.textContent = noScrollbarStyles;
    document.head.appendChild(styleSheet);
    return () => styleSheet.remove();
  }, []);

  console.log('Current refleterData state:', refleterData);
  console.log('refleterData values:', refleterData?.values);

  if (isLoading) {
    return (
      <main>
        {/* Banner Section Skeleton */}
        <Skeleton variant="banner" />

        {/* History Section Skeleton */}
        <Section className="bg-white">
          <Container>
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col">
                  <Skeleton className="h-16 w-24 mb-4" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Values Section Skeleton */}
        <Section className="bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="card" className="bg-white shadow-md" />
              ))}
            </div>
          </Container>
        </Section>

        {/* Vision Section Skeleton */}
        <Section className="bg-white">
          <Container>
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-md">
                  <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                  <Skeleton className="h-6 w-48 mb-3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-3/4 mt-2" />
                </div>
              ))}
            </div>
          </Container>
        </Section>

        {/* Team Section Skeleton */}
        <Section className="bg-gray-50">
          <Container>
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="team" className="bg-white shadow-md" />
              ))}
            </div>
          </Container>
        </Section>

        {/* Events Section Skeleton */}
        <Section className="bg-white">
          <Container>
            <div className="text-center mb-12">
              <Skeleton className="h-8 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="event" className="bg-white shadow-md" />
              ))}
            </div>
          </Container>
        </Section>
      </main>
    );
  }

  return (
    <>
      {/* Banner Section */}
      <Section className="relative min-h-[80vh] overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <Image
            src={bannerData?.imageUrl || '/images/about-banner.jpg'}
            alt="À Propos de Nous"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-12 top-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute -right-12 top-1/2 h-64 w-64 rounded-full bg-white blur-3xl" />
        </div>

        {/* Content */}
        <Container className="relative flex min-h-[80vh] items-center">
          <div className="max-w-4xl">
            <span className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              {bannerData?.welcome || 'Découvrez Notre Histoire'}
            </span>
            <h1 className="mt-6 font-serif text-5xl font-bold text-white sm:text-6xl md:text-7xl">
              {bannerData?.title || 'À Propos de Nous'}{' '}
              <span className="text-primary-200">
                {bannerData?.subtitle || 'Notre Mission et Notre Vision'}
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/90 md:text-xl">
              {bannerData?.description || 'Découvrez notre histoire, notre équipe et notre engagement envers la communauté.'}
            </p>
          </div>
        </Container>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-white/70">Découvrir Plus</span>
            <div className="h-12 w-6 rounded-full border-2 border-white/30 p-1">
              <div className="h-2 w-full animate-bounce rounded-full bg-white" />
            </div>
          </div>
        </div>
      </Section>

      {/* Histoire Section */}
      {historyData && (
        <Section>
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
                {historyData.subtitle}
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
                <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                  {historyData.mainTitle}
                </span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-gray-600">
                {historyData.description}
              </p>
            </div>

            <div className="mt-16 space-y-8">
              {historyData.items?.map((item, index) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-8 md:flex-row md:items-center"
                >
                  <div className="flex-none text-center md:w-32">
                    <span className="inline-block rounded-lg bg-[#4C9296]/10 px-4 py-2 text-lg font-bold text-[#4C9296]">
                      {item.year}
                    </span>
                  </div>
                  <div className="flex-grow space-y-2 rounded-2xl bg-white p-6 shadow-lg">
                    <h3 className="font-serif text-xl font-bold text-[#4C9296]">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Vision Section */}
      {visionData && (
        <Section>
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
                {visionData.subtitle}
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
                <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                  {visionData.mainTitle}
                </span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-gray-600">
                {visionData.description}
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {visionData.points?.map((point) => (
                <div key={point.id} className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#4C9296]/10 transition-all group-hover:scale-150" />
                  <div className="relative">
                    <h3 className="mb-4 font-serif text-2xl font-bold text-[#4C9296]">
                      {point.title}
                    </h3>
                    <p className="text-gray-600">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
              {(!visionData.points || visionData.points.length === 0) && (
                <div className="col-span-3 py-12 text-center text-gray-500">
                  Aucun point ajouté.
                </div>
              )}
            </div>
          </Container>
        </Section>
      )}

      {/* Refléter l'Amour du Christ Section */}
      {refleterData && (
        <Section>
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
                {refleterData.subtitle}
              </span>
              <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
                <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                  {refleterData.mainTitle}
                </span>
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-gray-600">
                {refleterData.description}
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {refleterData.values?.map((value) => (
                <div key={value.id} className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                  <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#4C9296]/10 transition-all group-hover:scale-150" />
                  <div className="relative">
                    <h3 className="mb-4 font-serif text-2xl font-bold text-[#4C9296]">
                      {value.title}
                    </h3>
                    <p className="text-gray-600">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
              {(!refleterData.values || refleterData.values.length === 0) && (
                <div className="col-span-3 py-12 text-center text-gray-500">
                  Aucune valeur ajoutée.
                </div>
              )}
            </div>
          </Container>
        </Section>
      )}

      {/* Team Section */}
      <Section className="relative overflow-hidden bg-gray-50 py-24 sm:py-32">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -left-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container className="relative">
          {/* Section Header */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
              Notre Équipe
            </span>
            <h2 className="mt-8 font-serif text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                L'Équipe Pastorale
              </span>
            </h2>
            <p className="mt-8 text-lg leading-relaxed text-gray-600">
              Une équipe dévouée au service de Dieu et de la communauté, guidant avec sagesse et compassion.
            </p>
          </div>

          {/* Team Grid */}
          <div className="relative mt-20">
            {/* Mobile Scroll Indicator */}
            {teamData.length > 0 && (
              <div className="absolute -top-12 right-0 flex items-center gap-2 sm:hidden">
                <span className="text-sm text-gray-500">Faire défiler</span>
                <svg className="h-5 w-5 text-gray-400 animate-bounce-x" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            )}

            {/* Cards Container */}
            {teamData.length > 0 ? (
              <div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-8 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:pb-0 sm:px-0 lg:grid-cols-3 lg:gap-10 hide-scrollbar">
                {teamData.map((member) => (
                  <div
                    key={member._id}
                    className="group relative aspect-[4/5] overflow-hidden rounded-2xl flex-shrink-0 w-[260px] sm:w-auto sm:flex-shrink-1"
                  >
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={400}
                      height={500}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Permanent Overlay with Text */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                      <div className="absolute bottom-0 left-0 right-0 p-8 text-left transform transition-transform duration-300 group-hover:translate-y-0">
                        <h3 className="font-serif text-2xl font-bold text-white">
                          {member.name}
                        </h3>
                        <p className="mt-3">
                          <span className="text-[#4C9296] bg-white/90 px-4 py-1.5 rounded-full text-sm font-medium">
                            {member.role}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-12 text-center">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#4C9296]/10 text-[#4C9296]">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun membre pour le moment</h3>
                <p className="mt-2 text-sm text-gray-500">Notre équipe sera bientôt annoncée.</p>
              </div>
            )}
          </div>

          <style jsx global>{`
            .hide-scrollbar {
              scrollbar-width: none;
              -ms-overflow-style: none;
            }
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            @media (min-width: 640px) {
              .hide-scrollbar {
                overflow: visible;
              }
            }
            @keyframes bounce-x {
              0%, 100% {
                transform: translateX(-25%);
                animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
              }
              50% {
                transform: translateX(0);
                animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
              }
            }
            .animate-bounce-x {
              animation: bounce-x 1s infinite;
            }
          `}</style>
        </Container>
      </Section>

      {/* Horaires Section */}
      <HorairesSection />

      {/* Events Section */}
      <Section className="relative overflow-hidden bg-gray-50">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
          <div className="absolute -left-1/4 bottom-0 h-[500px] w-[500px] rounded-full bg-[#4C9296] blur-3xl" />
        </div>

        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-[#4C9296]/10 px-4 py-2 text-sm font-medium text-[#4C9296]">
              Événements
            </span>
            <h2 className="mt-6 font-serif text-4xl font-bold sm:text-5xl">
              <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
                Prochains Événements
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Découvrez nos prochains événements et rejoignez-nous pour des moments enrichissants.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/evenements/${event.id}`}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4C9296] focus:ring-offset-2"
                >
                  {/* Event Image */}
                  <div className="relative h-48 w-full">
                    <Image
                      src={event.imageUrl || '/images/events-default.jpg'}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Date Badge */}
                    <div className="absolute left-4 top-4">
                      <div className="flex flex-col items-center rounded-xl bg-white/95 px-3 py-1 text-center shadow-sm backdrop-blur-sm">
                        <span className="text-xs font-medium text-gray-600">
                          {new Date(event.date).toLocaleString('fr-FR', { month: 'short' })}
                        </span>
                        <span className="text-lg font-bold text-[#4C9296]">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                    </div>
                    {/* Category Badge */}
                    {event.category && (
                      <div className="absolute right-4 top-4">
                        <div className="rounded-xl bg-[#4C9296]/90 px-3 py-1 text-sm font-medium text-white shadow-sm backdrop-blur-sm">
                          {categories.find(cat => cat.id === event.category)?.name || 'Événement'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold text-gray-900 group-hover:text-[#4C9296] transition-colors">
                      {event.title}
                    </h3>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-[#4C9296]" />
                        <span>{event.time}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-[#4C9296]" />
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <p className="mt-4 text-gray-600 line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 flex min-h-[300px] flex-col items-center justify-center rounded-3xl bg-white px-4 py-12 text-center shadow-sm">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 ring-8 ring-gray-50/50">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="mt-6 font-serif text-xl font-semibold text-gray-900">
                  Aucun événement prévu
                </h3>
                <p className="mt-2 max-w-sm text-gray-600">
                  Il n'y a pas d'événements prévus pour le moment. Revenez bientôt !
                </p>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
} 