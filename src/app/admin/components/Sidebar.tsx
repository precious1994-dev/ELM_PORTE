import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signOut } from 'next-auth/react'
import { 
  FaHome, 
  FaChevronDown, 
  FaSignOutAlt,
  FaImages,
  FaEye,
  FaCalendarAlt,
  FaVideo,
  FaUsers,
  FaMicrophone,
  FaClock,
  FaInfoCircle,
  FaHandsHelping,
  FaShareAlt,
  FaEnvelope
} from 'react-icons/fa'
import clsx from 'clsx'

interface MenuItem {
  name: string
  icon?: any
  href?: string
  items?: MenuItem[]
  description?: string
}

const navigation: MenuItem[] = [
  {
    name: 'Dashboard',
    icon: FaHome,
    href: '/admin/dashboard',
  },
  {
    name: 'Homepage',
    icon: FaImages,
    items: [
      { name: 'Slider', href: '/admin/homepage' },
      { name: 'Vision', href: '/admin/homepage/vision' },
      { name: 'Communauté', href: '/admin/homepage/community' },
    ],
  },
  {
    name: 'Events',
    icon: FaCalendarAlt,
    items: [
      { name: 'All Events', href: '/admin/events' },
      { name: 'Banner', href: '/admin/events/banner' },
    ],
  },
  {
    name: 'Prédications',
    icon: FaMicrophone,
    items: [
      { name: 'Toutes les prédications', href: '/admin/predications' },
      { name: 'Message de la Semaine', href: '/admin/predications/weekly-message' },
      { name: 'Bannière', href: '/admin/predications/banner' },
    ],
    description: 'Gérer les prédications',
  },
  {
    name: 'Horaires',
    icon: FaClock,
    href: '/admin/horaires',
  },
  {
    name: 'À propos',
    icon: FaInfoCircle,
    items: [
      { name: 'Banner', href: '/admin/apropos/banner' },
      { name: "Histoire", href: '/admin/apropos/histoire' },
      { name: "Refléter l'Amour du Christ", href: '/admin/apropos/refleter-amour-christ' },
      { name: "Notre Vision", href: '/admin/apropos/notre-vision' },
      { name: "Équipe", href: '/admin/apropos/equipe' },
    ],
  },
  {
    name: 'Ministères',
    icon: FaHandsHelping,
    items: [
      {
        name: 'Jeunesses',
        items: [
          { name: 'Banner', href: '/admin/jeunes/banner' },
          { name: 'Notre ADN', href: '/admin/jeunes/adn' },
          { name: 'Activités', href: '/admin/jeunes/activites' },
          { name: 'Horaire', href: '/admin/jeunes/horaire' },
          { name: 'Équipe', href: '/admin/jeunes/equipe' },
          { name: 'Réseaux', href: '/admin/jeunes/reseaux' },
        ],
      },
      {
        name: 'Adultes',
        items: [
          { name: 'Banner', href: '/admin/adulte/banner' },
          { name: 'Vision', href: '/admin/adulte/vision' },
          { name: 'Activités', href: '/admin/adulte/activites' },
          { name: 'Équipe', href: '/admin/adulte/equipe' },
        ],
      },
      {
        name: 'Hommes',
        items: [
          { name: 'Banner', href: '/admin/hommes/banner' },
          { name: 'Vision', href: '/admin/hommes/vision' },
          { name: 'Activités', href: '/admin/hommes/activites' },
          { name: 'Équipe', href: '/admin/hommes/equipe' },
        ],
      },
      {
        name: 'Femmes',
        items: [
          { name: 'Banner', href: '/admin/femmes/banner' },
          { name: 'Vision', href: '/admin/femmes/vision' },
          { name: 'Activités', href: '/admin/femmes/activites' },
          { name: 'Équipe', href: '/admin/femmes/equipe' },
        ],
      },
      {
        name: 'Enfants',
        items: [
          { name: 'Banner', href: '/admin/enfants/banner' },
          { name: 'Notre Vision', href: '/admin/enfants/vision' },
          { name: 'Nos Classes', href: '/admin/enfants/nos-claasse' },
          { name: 'Équipe', href: '/admin/enfants/equipe' },
        ],
      },
      {
        name: 'Baptême',
        items: [
          { name: 'Banner', href: '/admin/bapteme/banner' },
          { name: 'À Propos', href: '/admin/bapteme/a-propos-le-bapteme' },
          { name: 'Processus', href: '/admin/bapteme/process-bapteme' },
          { name: 'FAQ', href: '/admin/bapteme/faq' },
        ],
      },
    ],
  },
  {
    name: 'Contact',
    icon: FaEnvelope,
    items: [
      { name: 'Banner', href: '/admin/contact/banner' },
      { name: 'Informations', href: '/admin/contact/informations' }
    ],
  }
].filter(item => item.href !== '/admin/members');

const SubMenu = ({ item, level = 0 }: { item: MenuItem; level?: number }) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (href: string) => pathname === href
  const isMenuActive = (menu: MenuItem): boolean => {
    if (menu.href) {
      return isActive(menu.href)
    }
    return menu.items?.some(subItem => 
      subItem.href ? isActive(subItem.href) : isMenuActive(subItem)
    ) || false
  }

  if (!item.items) {
    return (
      <Link
        href={item.href!}
        className={clsx(
          'group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
          isActive(item.href!)
            ? 'bg-primary text-white shadow-lg shadow-primary/25'
            : 'text-gray-600 hover:bg-gray-50 hover:text-primary',
          level > 0 && 'ml-4'
        )}
      >
        {item.icon && (
          <div className={clsx(
            'flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
            isActive(item.href!) ? 'text-white' : 'text-primary'
          )}>
            <item.icon className="w-5 h-5" />
          </div>
        )}
        <span>{item.name}</span>
      </Link>
    )
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-full group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
          isMenuActive(item)
            ? 'bg-primary text-white shadow-lg shadow-primary/25'
            : 'text-gray-600 hover:bg-gray-50 hover:text-primary',
          level > 0 && 'ml-4'
        )}
      >
        <div className="flex items-center space-x-3">
          {item.icon && (
            <div className={clsx(
              'flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
              isMenuActive(item) ? 'text-white' : 'text-primary'
            )}>
              <item.icon className="w-5 h-5" />
            </div>
          )}
          <span>{item.name}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={clsx(
            'flex items-center justify-center w-5 h-5',
            isMenuActive(item) ? 'text-white' : 'text-primary'
          )}
        >
          <FaChevronDown className="w-4 h-4" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: 'auto', 
              opacity: 1,
              transition: { duration: 0.2, ease: 'easeOut' }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: { duration: 0.2, ease: 'easeIn' }
            }}
            className="mt-1 space-y-1 overflow-hidden"
          >
            {item.items.map((subItem) => (
              <li key={subItem.name}>
                <SubMenu item={subItem} level={level + 1} />
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Sidebar() {
  const router = useRouter()

  const handleLogout = async () => {
    router.push('/admin/login')
    await signOut({ redirect: false })
  }

  return (
    <div className="h-screen w-72 bg-white border-r border-gray-100 flex flex-col shadow-xl shadow-gray-200/50">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100">
        <Link 
          href="/admin" 
          className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/10"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-lg font-bold text-white">A</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="px-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Navigation
          </h2>
        </div>
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <SubMenu item={item} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-gray-600 hover:bg-red-50 hover:text-red-600"
        >
          <div className="flex items-center justify-center transition-transform duration-200 group-hover:scale-110 text-red-500">
            <FaSignOutAlt className="w-5 h-5" />
          </div>
          <span>Se déconnecter</span>
        </button>
      </div>
    </div>
  )
} 