'use client';

import { useState, useEffect, useRef } from 'react';
import { FaPrayingHands, FaUsers, FaHandsHelping } from 'react-icons/fa';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { setupSSE } from '@/utils/sse';

interface VisionItem {
  icon: string;
  title: string;
  description: string;
}

interface VisionSection {
  mainTitle: string;
  subtitle: string;
  description: string;
  items: VisionItem[];
}

const defaultVisionData: VisionSection = {
  mainTitle: 'Notre Vision',
  subtitle: 'Foi · Communauté · Service',
  description: 'Ancrés dans la Parole de Dieu, nous aspirons à être une communauté vibrante qui inspire, équipe et mobilise chaque personne à vivre pleinement sa foi et à avoir un impact transformateur dans notre société.',
  items: [
    {
      icon: 'FaPrayingHands',
      title: 'Foi',
      description: 'Grandir ensemble dans la connaissance de Dieu et dans notre relation avec Lui.',
    },
    {
      icon: 'FaUsers',
      title: 'Communauté',
      description: 'Créer des liens authentiques et soutenir chacun dans son parcours de vie.',
    },
    {
      icon: 'FaHandsHelping',
      title: 'Service',
      description: "S'engager à servir notre prochain et à faire une différence dans notre société.",
    },
  ],
};

function VisionSectionSkeleton() {
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-3xl text-center animate-pulse">
          <div className="h-12 w-48 bg-gray-200 rounded-lg mx-auto mb-4" />
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-primary/20"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="h-6 w-32 bg-gray-200 rounded-lg" />
            </div>
          </div>
          <div className="h-24 w-full bg-gray-200 rounded-lg mt-6" />
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-md"
            >
              <div className="mb-6 h-12 w-12 rounded-2xl bg-gray-200" />
              <div className="h-8 w-32 bg-gray-200 rounded-lg mb-3" />
              <div className="h-20 w-full bg-gray-200 rounded-lg" />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

export default function VisionSection() {
  const [visionData, setVisionData] = useState<VisionSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    let cleanup: (() => void) | undefined;

    const fetchVisionData = async () => {
      try {
        const response = await fetch('/api/homepage');
        if (!response.ok) throw new Error('Failed to fetch vision data');
        const data = await response.json();
        if (mounted.current) {
          setTimeout(() => {
            setVisionData(data?.visionSection || null);
            setIsLoading(false);
          }, 0);
        }
      } catch (error) {
        console.error('Error fetching vision data:', error);
        if (mounted.current) {
          setTimeout(() => {
            setIsLoading(false);
          }, 0);
        }
      }
    };

    const initializeSSE = () => {
      cleanup = setupSSE({
        endpoint: '/api/homepage/sse',
        enableLogging: process.env.NODE_ENV === 'development',
        onMessage: ({ data }) => {
          if (mounted.current && data?.visionSection) {
            setTimeout(() => {
              setVisionData(data.visionSection);
            }, 0);
          }
        },
        onError: (error) => {
          console.error('SSE Error:', error);
          // Fallback to regular polling on error
          if (mounted.current) {
            fetchVisionData();
          }
        },
        onConnected: () => {
          if (mounted.current) {
            setTimeout(() => {
              setIsLoading(false);
            }, 0);
          }
        },
        maxRetries: 3,
        retryDelay: 5000,
      });
    };

    // Initial fetch and SSE setup
    fetchVisionData();
    initializeSSE();

    return () => {
      mounted.current = false;
      if (cleanup) {
        cleanup();
      }
    };
  }, []);

  if (isLoading) {
    return <VisionSectionSkeleton />;
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'FaPrayingHands': return <FaPrayingHands className="h-8 w-8" />;
      case 'FaUsers': return <FaUsers className="h-8 w-8" />;
      case 'FaHandsHelping': return <FaHandsHelping className="h-8 w-8" />;
      default: return null;
    }
  };

  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-4xl font-bold tracking-tight text-primary sm:text-5xl">
            {visionData?.mainTitle}
          </h2>
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-primary/20"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm font-semibold uppercase tracking-wider text-primary">
                {visionData?.subtitle}
              </span>
            </div>
          </div>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            {visionData?.description}
          </p>
        </div>
        
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {visionData?.items.map((item, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Background Gradient */}
              <div
                className="absolute inset-0 bg-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
              
              {/* Icon */}
              <div className="mb-6 inline-flex rounded-2xl bg-primary/10 p-4 text-primary">
                {getIconComponent(item.icon)}
              </div>

              {/* Content */}
              <h3 className="mb-3 font-serif text-2xl font-bold tracking-tight text-primary">
                {item.title}
              </h3>
              <p className="text-base leading-relaxed text-gray-600">
                {item.description}
              </p>

              {/* Decorative Element */}
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-3xl transition-all duration-300 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
} 