'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaFacebook, FaYoutube, FaInstagram } from 'react-icons/fa'
import { IContactInformations } from '@/models/ContactInformations'

interface Horaire {
  id: string
  day: string
  time: string
  description: string
  order: number
}

const Footer = () => {
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

  const [horaires, setHoraires] = useState<Horaire[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch contact info
        const contactResponse = await fetch('/api/contact/informations')
        if (contactResponse.ok) {
          const contactData = await contactResponse.json()
          setContactInfo(contactData)
        }

        // Fetch horaires
        const horairesResponse = await fetch('/api/horaires')
        if (horairesResponse.ok) {
          const horairesData = await horairesResponse.json()
          setHoraires(Array.isArray(horairesData) ? horairesData : [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <footer className="bg-primary text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold tracking-wide">Contact</h3>
            <ul className="space-y-4 text-gray-100">
              <li className="flex items-start">
                <span className="block">{contactInfo.address.street}</span>
              </li>
              <li className="flex items-start">
                <span className="block">{contactInfo.address.postalCode} {contactInfo.address.city}, {contactInfo.address.country}</span>
              </li>
              <li className="flex items-start">
                <span className="block">Tél: {contactInfo.phone}</span>
              </li>
              <li className="flex items-start">
                <span className="block">Email: {contactInfo.email}</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold tracking-wide">Liens Rapides</h3>
            <ul className="space-y-4 text-gray-100">
              <li>
                <Link 
                  href="/a-propos" 
                  className="transition-colors duration-200 hover:text-gray-300"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  href="/evenements" 
                  className="transition-colors duration-200 hover:text-gray-300"
                >
                  Événements
                </Link>
              </li>
              <li>
                <Link 
                  href="/predications" 
                  className="transition-colors duration-200 hover:text-gray-300"
                >
                  Prédications
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="transition-colors duration-200 hover:text-gray-300"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Times */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold tracking-wide">Horaires des Services</h3>
            <ul className="space-y-4 text-gray-100">
              {horaires.map((horaire) => (
                <li key={horaire.id} className="flex items-start">
                  <span className="block">
                    {horaire.day}: {horaire.time}
                    {horaire.description && (
                      <span className="block text-sm text-gray-300 mt-1">
                        {horaire.description}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold tracking-wide">Liens utiles</h3>
            <ul className="space-y-4 text-gray-100">
              <li>
                <a 
                  href="https://www.lecnef.org/page/170867-le-cnef"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-gray-300"
                >
                  CNEF
                </a>
              </li>
              <li>
                <a 
                  href="https://assemblees-de-dieu.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-gray-300"
                >
                  Assemblées de Dieu de France – ADD France
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold tracking-wide">Suivez-nous</h3>
            <div className="flex space-x-6">
              {contactInfo.socialMedia.facebook && (
                <a
                  href={contactInfo.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-100 transition-colors duration-200 hover:text-gray-300"
                  aria-label="Facebook"
                >
                  <FaFacebook className="h-7 w-7" />
                </a>
              )}
              {contactInfo.socialMedia.youtube && (
                <a
                  href={contactInfo.socialMedia.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-100 transition-colors duration-200 hover:text-gray-300"
                  aria-label="YouTube"
                >
                  <FaYoutube className="h-7 w-7" />
                </a>
              )}
              {contactInfo.socialMedia.instagram && (
                <a
                  href={contactInfo.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-100 transition-colors duration-200 hover:text-gray-300"
                  aria-label="Instagram"
                >
                  <FaInstagram className="h-7 w-7" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <p className="text-center text-sm text-gray-300">
            © {new Date().getFullYear()} Église. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 