'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Section } from '@/components/ui/section'
import { Container } from '@/components/ui/container'
import { Skeleton } from '@/components/ui/skeleton'
import Image from 'next/image'
import { IContactInformations } from '@/models/ContactInformations'
import { sendEmail } from '@/utils/email'

interface BannerContent {
  imageUrl: string
  title: string
  subtitle: string
  description: string
}

const formSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères')
})

type FormData = z.infer<typeof formSchema>

export default function Contact() {
  const [isLoading, setIsLoading] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  })
  const [banner, setBanner] = useState<BannerContent>({
    imageUrl: '/images/contact-banner.jpg',
    title: 'Contactez-nous',
    subtitle: 'Nous sommes à votre écoute',
    description: 'N\'hésitez pas à nous contacter pour toute question ou demande d\'information.'
  })
  const [contactInfo, setContactInfo] = useState<IContactInformations>({
    phone: '+33 1 23 45 67 89',
    email: 'contact@eglise.fr',
    address: {
      street: "123 Rue de l'Église",
      city: 'Paris',
      postalCode: '75000',
      country: 'France'
    },
    transportation: {
      metro: 'Ligne 6, station Église',
      bus: 'Lignes 30, 56, arrêt Église'
    },
    parking: 'Un parking gratuit est disponible pour nos visiteurs le dimanche.',
    socialMedia: {
      facebook: '',
      instagram: '',
      youtube: ''
    }
  })

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch banner data
        const bannerResponse = await fetch('/api/contact/banner')
        if (bannerResponse.ok) {
          const bannerData = await bannerResponse.json()
          if (bannerData && Object.keys(bannerData).length > 0) {
            setBanner(prev => ({
              ...prev,
              ...bannerData
            }))
          }
        }

        // Fetch contact information
        const contactResponse = await fetch('/api/contact/informations')
        if (contactResponse.ok) {
          const contactData = await contactResponse.json()
          if (contactData && Object.keys(contactData).length > 0) {
            setContactInfo(contactData)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const onSubmit = async (data: FormData) => {
    try {
      const result = await sendEmail({
        from_name: data.name,
        reply_to: data.email,
        subject: data.subject,
        message: data.message
      })

      if (result.success) {
        toast.success('Message envoyé avec succès!')
        reset()
      } else {
        toast.error(result.message || 'Erreur lors de l\'envoi du message')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error('Erreur lors de l\'envoi du message')
    }
  }

  const getContactInfo = () => [
    {
      icon: <FaPhone className="h-6 w-6 text-[#4C9296]" />,
      title: 'Téléphone',
      description: contactInfo.phone,
      action: 'Appeler maintenant',
      href: `tel:${contactInfo.phone.replace(/\s/g, '')}`,
    },
    {
      icon: <FaEnvelope className="h-6 w-6 text-[#4C9296]" />,
      title: 'Email',
      description: contactInfo.email,
      action: 'Envoyer un email',
      href: `mailto:${contactInfo.email}`,
    },
    {
      icon: <FaMapMarkerAlt className="h-6 w-6 text-[#4C9296]" />,
      title: 'Adresse',
      description: `${contactInfo.address.street}\n${contactInfo.address.postalCode} ${contactInfo.address.city}, ${contactInfo.address.country}`,
      action: "Obtenir l'itinéraire",
      href: `https://www.google.com/maps/search/${encodeURIComponent(
        `${contactInfo.address.street}, ${contactInfo.address.postalCode} ${contactInfo.address.city}, ${contactInfo.address.country}`
      )}`,
    },
  ]

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        {/* Banner Section Skeleton */}
        <Skeleton variant="banner" />

        {/* Contact Information Skeleton */}
        <Section>
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="mt-4 h-6 w-24" />
                <Skeleton className="mt-2 h-4 w-48" />
                <Skeleton className="mt-4 h-4 w-32" />
              </div>
            ))}
          </div>
        </Section>

        {/* Contact Form and Social Links Skeleton */}
        <Section background="gray">
          <Container>
            <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
              {/* Form Skeleton */}
              <div className="relative">
                <div className="relative rounded-2xl bg-white p-8 shadow-xl">
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-96 mb-8" />
                  
                  <div className="space-y-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-10 w-full rounded-lg" />
                      </div>
                    ))}
                    <Skeleton className="h-12 w-full rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Social Links Skeleton */}
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-96 mb-8" />
                <div className="flex gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-10 rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* Map Section Skeleton */}
        <Section>
          <Container>
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-12 lg:grid-cols-2">
                <div>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-96 mb-8" />
                  
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative aspect-square lg:aspect-auto">
                  <Skeleton className="h-full w-full rounded-2xl" />
                </div>
              </div>
            </div>
          </Container>
        </Section>
      </div>
    );
  }

  return (
    <main>
      {/* Hero Section */}
      <Section className="relative min-h-[60vh] overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0">
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#4C9296]/90 via-[#4C9296]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-12 top-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute -right-12 top-1/2 h-64 w-64 rounded-full bg-white blur-3xl" />
        </div>

        {/* Content */}
        <Container className="relative flex min-h-[60vh] items-center">
          <div className="max-w-4xl">
            <span className="inline-block rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              {banner.subtitle}
            </span>
            <h1 className="mt-6 font-serif text-5xl font-bold text-white sm:text-6xl md:text-7xl">
              {banner.title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/90 md:text-xl">
              {banner.description}
            </p>
          </div>
        </Container>
      </Section>

      {/* Contact Information */}
      <Section>
        <div className="grid gap-6 md:grid-cols-3">
          {getContactInfo().map((info, index) => (
            <a
              key={index}
              href={info.href}
              target={info.href.startsWith('http') ? '_blank' : undefined}
              rel={info.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group relative overflow-hidden rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rotate-45 bg-gradient-to-r from-[#4C9296]/20 to-[#4C9296]/0" />
              <div className="relative">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[#4C9296]/10 text-[#4C9296]">
                  {info.icon}
                </div>
                <h3 className="mt-4 font-serif text-xl font-bold text-[#4C9296]">
                  {info.title}
                </h3>
                <p className="mt-2 whitespace-pre-line text-gray-600">
                  {info.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#4C9296]">
                  {info.action}
                  <svg
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </Section>

      {/* Contact Form and Social Links */}
      <Section background="gray">
        <Container>
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
            {/* Form */}
            <div className="relative">
              <div className="relative rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-200/50">
                <h2 className="font-serif text-3xl font-bold text-[#4C9296]">
                  Envoyez-nous un message
                </h2>
                <p className="mt-2 text-gray-600">
                  Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                  <Input
                    id="name"
                    label="Nom"
                    {...register('name')}
                    error={errors.name?.message}
                    required
                    placeholder="Votre nom"
                  />

                  <Input
                    id="email"
                    type="email"
                    label="Email"
                    {...register('email')}
                    error={errors.email?.message}
                    required
                    placeholder="votre@email.com"
                  />

                  <Input
                    id="subject"
                    label="Sujet"
                    {...register('subject')}
                    error={errors.subject?.message}
                    required
                    placeholder="Sujet de votre message"
                  />

                  <Textarea
                    id="message"
                    label="Message"
                    rows={4}
                    {...register('message')}
                    error={errors.message?.message}
                    required
                    placeholder="Votre message..."
                  />

                  <Button 
                    type="submit" 
                    className="w-full text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      'Envoyer le message'
                    )}
                  </Button>
                </form>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#4C9296]">
                Suivez-nous
              </h2>
              <p className="mt-2 text-gray-600">
                Restez connectés avec nous sur les réseaux sociaux.
              </p>
              <div className="mt-8 flex gap-4">
                {contactInfo.socialMedia.facebook && (
                  <a
                    href={contactInfo.socialMedia.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#4C9296]/10 text-[#4C9296] transition-colors hover:bg-[#4C9296] hover:text-white"
                  >
                    <FaFacebookF className="h-5 w-5" />
                  </a>
                )}
                {contactInfo.socialMedia.instagram && (
                  <a
                    href={contactInfo.socialMedia.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#4C9296]/10 text-[#4C9296] transition-colors hover:bg-[#4C9296] hover:text-white"
                  >
                    <FaInstagram className="h-5 w-5" />
                  </a>
                )}
                {contactInfo.socialMedia.youtube && (
                  <a
                    href={contactInfo.socialMedia.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#4C9296]/10 text-[#4C9296] transition-colors hover:bg-[#4C9296] hover:text-white"
                  >
                    <FaYoutube className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Map Section */}
      <Section>
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="font-serif text-3xl font-bold text-[#4C9296]">
                  Notre Localisation
                </h2>
                <p className="mt-2 text-gray-600">
                  Venez nous rendre visite ! Nous sommes facilement accessibles en transport en commun ou en voiture.
                </p>
                <div className="mt-8 space-y-6">
                  <div>
                    <h3 className="font-medium text-[#4C9296]">Adresse</h3>
                    <p className="mt-2 text-gray-600">
                      {contactInfo.address.street}
                      <br />
                      {contactInfo.address.postalCode} {contactInfo.address.city}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#4C9296]">Transports</h3>
                    <p className="mt-2 text-gray-600">
                      Métro : {contactInfo.transportation.metro}
                      <br />
                      Bus : {contactInfo.transportation.bus}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium text-[#4C9296]">Parking</h3>
                    <p className="mt-2 text-gray-600">
                      {contactInfo.parking}
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl shadow-xl ring-1 ring-gray-200/50 lg:aspect-auto">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2621.9391593536584!2d1.9091595766766667!3d48.991673098533965!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e6937a1669a0c5%3A0x489fb6aa336e1c0!2s6%20Av.%20de%20la%20R%C3%A9publique%2C%2078130%20Les%20Mureaux!5e0!3m2!1sfr!2sfr!4v1708612595899!5m2!1sfr!2sfr"
                  className="absolute inset-0 h-full w-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Carte de localisation de l'église"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
} 