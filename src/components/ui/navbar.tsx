'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { FaBars, FaTimes } from 'react-icons/fa'

const navigation = [
  { name: 'Accueil', href: '/' },
  { name: 'À Propos', href: '/a-propos' },
  { name: 'Prédications', href: '/predications' },
  { name: 'Événements', href: '/evenements' },
  { name: 'Contact', href: '/contact' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <Container>
        <nav className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className={`font-serif text-2xl font-bold ${
              isScrolled ? 'text-primary' : 'text-white'
            }`}
          >
            Église
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-2 md:flex">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isScrolled
                    ? pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-50'
                    : pathname === item.href
                    ? 'bg-white/10 text-white'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Button 
              className="ml-4"
              onClick={() => window.location.href = '/contact'}
            >
              Nous Rejoindre
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`rounded-lg p-2 md:hidden ${
              isScrolled ? 'text-gray-600' : 'text-white'
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white py-4 md:hidden">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-4 py-3 text-sm font-medium ${
                  pathname === item.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="px-4 pt-4">
              <Button 
                className="w-full justify-center"
                onClick={() => {
                  window.location.href = '/contact'
                  setIsMobileMenuOpen(false)
                }}
              >
                Nous Rejoindre
              </Button>
            </div>
          </div>
        )}
      </Container>
    </header>
  )
} 