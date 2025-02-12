'use client'

import { useState, useEffect } from 'react'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import Image from 'next/image'

interface TeamMember {
  _id: string
  name: string
  role: string
  imageUrl: string
}

interface TeamContent {
  title: string
  subtitle: string
  description: string
  members: TeamMember[]
}

export function TeamSection() {
  const [teamContent, setTeamContent] = useState<TeamContent>({
    title: "Notre Équipe",
    subtitle: "L'Équipe",
    description: "Une équipe passionnée par l'éducation chrétienne, créant un environnement sûr et enrichissant pour la découverte de la foi de vos enfants.",
    members: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/enfants/equipe', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          next: { revalidate: 0 }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Map team members
        const teamMembers = data.map((member: any) => ({
          _id: member._id,
          name: member.name,
          role: member.role,
          imageUrl: member.image
        }));

        setTeamContent(prev => ({
          ...prev,
          members: teamMembers
        }));
      } catch (error) {
        console.error('Error fetching team content:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, []);

  return (
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
            {teamContent.subtitle}
          </span>
          <h2 className="mt-8 font-serif text-4xl font-bold sm:text-5xl">
            <span className="bg-gradient-to-r from-[#4C9296] via-[#4C9296] to-[#6BA7AA] bg-clip-text text-transparent">
              {teamContent.title}
            </span>
          </h2>
          <p className="mt-8 text-lg leading-relaxed text-gray-600">
            {teamContent.description}
          </p>
        </div>

        {/* Team Grid */}
        <div className="relative mt-20">
          {/* Mobile Scroll Indicator */}
          {teamContent.members.length > 0 && (
            <div className="absolute -top-12 right-0 flex items-center gap-2 sm:hidden">
              <span className="text-sm text-gray-500">Faire défiler</span>
              <svg className="h-5 w-5 text-gray-400 animate-bounce-x" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          )}

          {/* Cards Container */}
          {isLoading ? (
            <div className="flex justify-center">
              <div className="h-32 w-32 animate-spin rounded-full border-4 border-[#4C9296] border-t-transparent"></div>
            </div>
          ) : teamContent.members.length > 0 ? (
            <div className="-mx-4 flex gap-6 overflow-x-auto px-4 pb-8 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-8 sm:pb-0 sm:px-0 lg:grid-cols-3 lg:gap-10 hide-scrollbar">
              {teamContent.members.map((member) => (
                <div
                  key={member._id}
                  className="group relative aspect-[4/5] overflow-hidden rounded-2xl flex-shrink-0 w-[260px] sm:w-auto sm:flex-shrink-1"
                >
                  <Image
                    src={member.imageUrl}
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
  );
} 