'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa'

const navigation = [
  { name: 'Accueil', href: '/' },
  {
    name: 'Ministères',
    href: '#',
    children: [
      { name: 'Jeunes', href: '/ministeres/jeunes' },
      { name: 'Enfants', href: '/ministeres/enfants' },
      { name: 'Adultes', href: '/ministeres/adultes' },
      { name: 'Baptêmes', href: '/ministeres/baptemes' },
      { name: 'Hommes', href: '/ministeres/hommes' },
      { name: 'Femmes', href: '/ministeres/femmes' },
    ],
  },
  { name: 'À Propos', href: '/a-propos' },
  { name: 'Prédications', href: '/predications' },
  { name: 'Événements', href: '/evenements' },
  { name: 'Contact', href: '/contact' },
]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleMouseEnter = (name: string) => {
    setActiveDropdown(name)
  }

  const handleMouseLeave = () => {
    setActiveDropdown(null)
  }

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-[100] transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
      }`}
    >
      <Container>
        <nav className="relative flex h-20 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className={`relative z-10 font-serif text-2xl font-bold ${
              isScrolled ? 'text-primary' : 'text-white'
            }`}
          >
            ELM
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-6 md:flex">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => handleMouseEnter(item.name)}
                onMouseLeave={handleMouseLeave}
              >
                {item.children ? (
                  <>
                    <button
                      className={`flex min-w-[120px] items-center justify-between gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                        isScrolled
                          ? activeDropdown === item.name
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-600 hover:bg-gray-50'
                          : activeDropdown === item.name
                          ? 'bg-white/10 text-white'
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      <span className="relative z-10">{item.name}</span>
                      <FaChevronDown className={`h-3 w-3 flex-shrink-0 transition-transform duration-200 ${
                        activeDropdown === item.name ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {activeDropdown === item.name && (
                      <div className="absolute left-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-lg bg-white py-2 shadow-lg ring-1 ring-gray-200/50">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className="block px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-primary"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`relative z-10 block rounded-lg px-4 py-2 text-sm font-medium transition-all ${
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
                )}
              </div>
            ))}
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
              <div key={item.name}>
                {item.children ? (
                  <div className="space-y-1">
                    <div
                      className={`flex items-center justify-between px-4 py-3 text-sm font-medium ${
                        activeDropdown === item.name
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-600'
                      }`}
                      onClick={() => setActiveDropdown(
                        activeDropdown === item.name ? null : item.name
                      )}
                    >
                      {item.name}
                      <FaChevronDown className={`h-3 w-3 transition-transform ${
                        activeDropdown === item.name ? 'rotate-180' : ''
                      }`} />
                    </div>
                    {activeDropdown === item.name && (
                      <div className="bg-gray-50 py-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            href={child.href}
                            className={`block px-8 py-2 text-sm font-medium ${
                              pathname === child.href
                                ? 'text-primary'
                                : 'text-gray-600'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
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
                )}
              </div>
            ))}
          </div>
        )}
      </Container>
    </header>
  )
} 