'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { toast } from 'sonner';
import Link from 'next/link';

interface CommunityData {
  title: string;
  description: string;
  yearsPresence: number;
  activeMembers: number;
  imageUrl: string;
}

export default function CommunitySection() {
  const router = useRouter();
  const [data, setData] = useState<CommunityData>({
    title: 'Rejoignez Notre Communauté',
    description: 'Nous sommes une église vivante et accueillante, où chacun peut trouver sa place et grandir dans sa foi. Venez découvrir une communauté chaleureuse et authentique.',
    yearsPresence: 10,
    activeMembers: 200,
    imageUrl: 'https://res.cloudinary.com/dzxhxv2sd/image/upload/v1/defaults/community-default'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const timestamp = new Date().getTime(); // Add cache-busting timestamp
        const response = await fetch(`/api/homepage/community?t=${timestamp}`, {
          cache: 'no-store'
        });
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const newData = await response.json();
        setData(newData);
      } catch (error) {
        console.error('Error fetching community data:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };

    fetchData();
  }, []);

  return (
    <Section className="bg-gradient-to-b from-white to-gray-50/50">
      <Container>
        <div className="grid items-center gap-16 md:grid-cols-2">
          {/* Image Side */}
          <div className="relative order-2 md:order-1">
            <div className="relative h-[500px] overflow-hidden rounded-2xl">
              <Image
                src={data?.imageUrl || 'https://res.cloudinary.com/dzxhxv2sd/image/upload/v1/defaults/community-default'}
                alt="Notre communauté"
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
              />
              {/* Decorative Elements */}
              <div className="absolute inset-0 bg-primary/10" />
              <div className="absolute -left-4 -top-4 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
              <div className="absolute -bottom-4 -right-4 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
            </div>
            {/* Stats */}
            <div className="absolute -right-8 bottom-8 flex gap-8 rounded-2xl bg-white/95 p-6 shadow-lg backdrop-blur-sm md:-right-12">
              <div className="text-center">
                <div className="font-serif text-3xl font-bold text-primary">
                  {`${data.yearsPresence}+`}
                </div>
                <div className="text-sm text-gray-600">Années de<br />présence</div>
              </div>
              <div className="text-center">
                <div className="font-serif text-3xl font-bold text-primary">
                  {`${data.activeMembers}+`}
                </div>
                <div className="text-sm text-gray-600">Membres<br />actifs</div>
              </div>
            </div>
          </div>

          {/* Content Side */}
          <div className="order-1 md:order-2">
            <h2 className="font-serif text-4xl font-bold tracking-tight text-primary sm:text-5xl">
              {data.title}
            </h2>
            
            <p className="mt-6 text-lg leading-8 text-gray-600">
              {data.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/a-propos" className="inline-block">
                <Button 
                  size="lg"
                  variant="outline"
                  className="rounded-full border-[#4C9296] text-[#4C9296] hover:bg-[#4C9296] hover:text-white transition-colors"
                >
                  En savoir plus
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => router.push('/contact')}
                className="rounded-full border-[#4C9296] text-[#4C9296] hover:bg-[#4C9296] hover:text-white transition-colors"
              >
                Nous contacter
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
} 