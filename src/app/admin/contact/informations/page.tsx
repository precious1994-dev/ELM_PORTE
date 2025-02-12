'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Loader2, Phone, Mail, MapPin, Bus, Train, ParkingSquare, Facebook, Instagram, Youtube } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { IContactInformations } from '@/models/ContactInformations'
import { useRouter } from 'next/navigation'

export default function ContactInformationsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<IContactInformations>({
    phone: '',
    email: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: ''
    },
    transportation: {
      metro: '',
      bus: ''
    },
    parking: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      youtube: ''
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/contact/informations')
        if (response.ok) {
          const data = await response.json()
          setFormData(data)
        }
      } catch (error) {
        console.error('Error fetching contact information:', error)
        toast.error('Erreur lors du chargement des informations de contact')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    section?: keyof IContactInformations,
    field?: string
  ) => {
    const { name, value } = e.target
    
    if (section && field) {
      setFormData(prev => {
        const sectionData = prev[section]
        if (typeof sectionData === 'object' && sectionData !== null) {
          return {
            ...prev,
            [section]: {
              ...sectionData,
              [field]: value
            }
          }
        }
        return prev
      })
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('/api/contact/informations', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success('Informations de contact mises à jour avec succès')
      } else {
        throw new Error('Failed to update')
      }
    } catch (error) {
      console.error('Error updating contact information:', error)
      toast.error('Erreur lors de la mise à jour des informations de contact')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#4C9296]" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 py-8">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-[#4C9296]">Informations de Contact</h1>
          <p className="mt-2 text-black">
            Gérez les informations de contact affichées sur le site.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Contact de Base */}
          <Card className="overflow-hidden border-2 border-[#4C9296]/10">
            <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 px-6 py-4">
              <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-[#4C9296]">
                <Phone className="h-5 w-5" />
                Contact de Base
              </h2>
            </div>
            <CardContent className="grid gap-6 p-6">
              <div>
                <Label htmlFor="phone" className="text-[#4C9296]">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+33 1 23 45 67 89"
                  className="mt-1.5 text-black placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-[#4C9296]">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@eglise.fr"
                  className="mt-1.5 text-black placeholder:text-gray-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Adresse */}
          <Card className="overflow-hidden border-2 border-[#4C9296]/10">
            <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 px-6 py-4">
              <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-[#4C9296]">
                <MapPin className="h-5 w-5" />
                Adresse
              </h2>
            </div>
            <CardContent className="grid gap-6 p-6">
              <div>
                <Label htmlFor="street" className="text-[#4C9296]">Rue</Label>
                <Input
                  id="street"
                  name="street"
                  value={formData.address.street}
                  onChange={(e) => handleChange(e, 'address', 'street')}
                  placeholder="123 Rue de l'Église"
                  className="mt-1.5 text-black placeholder:text-gray-400"
                />
              </div>
              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <Label htmlFor="city" className="text-[#4C9296]">Ville</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.address.city}
                    onChange={(e) => handleChange(e, 'address', 'city')}
                    placeholder="Paris"
                    className="mt-1.5 text-black placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode" className="text-[#4C9296]">Code Postal</Label>
                  <Input
                    id="postalCode"
                    name="postalCode"
                    value={formData.address.postalCode}
                    onChange={(e) => handleChange(e, 'address', 'postalCode')}
                    placeholder="75000"
                    className="mt-1.5 text-black placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-[#4C9296]">Pays</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.address.country}
                    onChange={(e) => handleChange(e, 'address', 'country')}
                    placeholder="France"
                    className="mt-1.5 text-black placeholder:text-gray-400"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transport */}
          <Card className="overflow-hidden border-2 border-[#4C9296]/10">
            <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 px-6 py-4">
              <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-[#4C9296]">
                <Train className="h-5 w-5" />
                Transport
              </h2>
            </div>
            <CardContent className="grid gap-6 p-6">
              <div>
                <Label htmlFor="metro" className="text-[#4C9296]">Métro</Label>
                <Input
                  id="metro"
                  name="metro"
                  value={formData.transportation.metro}
                  onChange={(e) => handleChange(e, 'transportation', 'metro')}
                  placeholder="Ligne 6, station Église"
                  className="mt-1.5 text-black placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="bus" className="text-[#4C9296]">Bus</Label>
                <Input
                  id="bus"
                  name="bus"
                  value={formData.transportation.bus}
                  onChange={(e) => handleChange(e, 'transportation', 'bus')}
                  placeholder="Lignes 30, 56, arrêt Église"
                  className="mt-1.5 text-black placeholder:text-gray-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Parking */}
          <Card className="overflow-hidden border-2 border-[#4C9296]/10">
            <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 px-6 py-4">
              <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-[#4C9296]">
                <ParkingSquare className="h-5 w-5" />
                Parking
              </h2>
            </div>
            <CardContent className="p-6">
              <div>
                <Label htmlFor="parking" className="text-[#4C9296]">Information Parking</Label>
                <Input
                  id="parking"
                  name="parking"
                  value={formData.parking}
                  onChange={handleChange}
                  placeholder="Un parking gratuit est disponible pour nos visiteurs le dimanche."
                  className="mt-1.5 text-black placeholder:text-gray-400"
                />
              </div>
            </CardContent>
          </Card>

          {/* Réseaux Sociaux */}
          <Card className="overflow-hidden border-2 border-[#4C9296]/10">
            <div className="border-b border-[#4C9296]/10 bg-[#4C9296]/5 px-6 py-4">
              <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-[#4C9296]">
                <Facebook className="h-5 w-5" />
                Réseaux Sociaux
              </h2>
            </div>
            <CardContent className="grid gap-6 p-6">
              <div>
                <Label htmlFor="facebook" className="text-[#4C9296]">Facebook</Label>
                <Input
                  id="facebook"
                  name="facebook"
                  value={formData.socialMedia.facebook}
                  onChange={(e) => handleChange(e, 'socialMedia', 'facebook')}
                  placeholder="URL de votre page Facebook"
                  className="mt-1.5 text-black placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="instagram" className="text-[#4C9296]">Instagram</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.socialMedia.instagram}
                  onChange={(e) => handleChange(e, 'socialMedia', 'instagram')}
                  placeholder="URL de votre compte Instagram"
                  className="mt-1.5 text-black placeholder:text-gray-400"
                />
              </div>
              <div>
                <Label htmlFor="youtube" className="text-[#4C9296]">YouTube</Label>
                <Input
                  id="youtube"
                  name="youtube"
                  value={formData.socialMedia.youtube}
                  onChange={(e) => handleChange(e, 'socialMedia', 'youtube')}
                  placeholder="URL de votre chaîne YouTube"
                  className="mt-1.5 text-black placeholder:text-gray-400"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#4C9296] hover:bg-[#3A7276] text-white"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 