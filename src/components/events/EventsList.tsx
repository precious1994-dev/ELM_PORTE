'use client'

import { useState, Fragment } from 'react'
import { format, parseISO, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { FaMapMarkerAlt, FaClock, FaCalendar, FaSearch, FaChevronDown, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Image from 'next/image'
import { Listbox, Transition } from '@headlessui/react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { EventModal } from './EventModal'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  imageUrl: string
  category: string
}

interface EventsListProps {
  events: Event[]
}

interface Filters {
  search: string
  category: string | null
  selectedDate: Date | null | undefined
  location: string | null
}

export function EventsList({ events }: EventsListProps) {
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: null,
    selectedDate: null,
    location: null,
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const eventsPerPage = 6

  const handleRegister = (eventId: string) => {
    // TODO: Implement registration logic
    console.log('Registering for event:', eventId)
  }

  // Get unique values for filters
  const categories = Array.from(new Set(events.map((event) => event.category)))
  const locations = Array.from(new Set(events.map((event) => event.location)))

  // Create array of dates for the calendar
  const calendarEvents = events.map(event => ({
    date: parseISO(event.date),
    title: event.title
  }))

  // Filter events based on all criteria
  const filteredEvents = events.filter((event) => {
    const matchesSearch = filters.search
      ? event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.description.toLowerCase().includes(filters.search.toLowerCase())
      : true

    const matchesCategory = !filters.category || event.category === filters.category
    const matchesLocation = !filters.location || event.location === filters.location
    const matchesDate = !filters.selectedDate || isSameDay(parseISO(event.date), filters.selectedDate)

    return matchesSearch && matchesCategory && matchesLocation && matchesDate
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage)
  const startIndex = (currentPage - 1) * eventsPerPage
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + eventsPerPage)

  // Generate page numbers array
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    return pageNumbers
  }

  // Reset to first page when filters change
  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  // Update the upcoming events logic to be more precise
  const upcomingEvents = events
    .filter(event => {
      const eventDate = parseISO(event.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Reset time to start of day
      return eventDate >= today
    })
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(0, 3)

  console.log('Upcoming events:', upcomingEvents) // Debug log

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-16">
      {/* Main Events Section */}
      <div className="space-y-8">
        {/* Filters */}
        <div className="flex flex-col gap-6">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
                placeholder="Rechercher un événement..."
                className="w-full rounded-xl border-0 bg-white py-3 pl-11 pr-4 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Filter Section */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Category Dropdown */}
              <Listbox value={filters.category} onChange={(value) => handleFiltersChange({ ...filters, category: value })}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white py-3 pl-4 pr-10 text-left text-sm shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary">
                    <span className="block truncate">
                      {filters.category || 'Toutes les catégories'}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <FaChevronDown className="h-3 w-3 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Listbox.Option
                        className={({ active }) =>
                          `relative cursor-pointer select-none px-4 py-2 ${
                            active ? 'bg-primary/5 text-primary' : 'text-gray-900'
                          }`
                        }
                        value={null}
                      >
                        Toutes les catégories
                      </Listbox.Option>
                      {categories.map((category) => (
                        <Listbox.Option
                          key={category}
                          className={({ active }) =>
                            `relative cursor-pointer select-none px-4 py-2 ${
                              active ? 'bg-primary/5 text-primary' : 'text-gray-900'
                            }`
                          }
                          value={category}
                        >
                          {category}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>

              {/* Date Dropdown with Calendar */}
              <Listbox value={filters.selectedDate} onChange={(date) => handleFiltersChange({ ...filters, selectedDate: date })}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white py-3 pl-4 pr-10 text-left text-sm shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary">
                    <span className="flex items-center gap-2">
                      <FaCalendar className="h-4 w-4 text-gray-400" />
                      <span className="block truncate">
                        {filters.selectedDate 
                          ? format(filters.selectedDate, 'dd MMMM yyyy', { locale: fr })
                          : 'Toutes les dates'}
                      </span>
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <FaChevronDown className="h-3 w-3 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 w-[320px] -translate-x-1/2 left-1/2 overflow-visible rounded-xl bg-white py-3 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-3">
                        <DayPicker
                          mode="single"
                          selected={filters.selectedDate || undefined}
                          onSelect={(date: Date | undefined) => handleFiltersChange({ ...filters, selectedDate: date || null })}
                          locale={fr}
                          modifiers={{
                            hasEvent: calendarEvents.map(event => event.date)
                          }}
                          modifiersStyles={{
                            hasEvent: {
                              fontWeight: 'bold',
                              color: 'var(--primary-color)'
                            }
                          }}
                          styles={{
                            caption: { color: '#111827' },
                            head: { color: '#6B7280' },
                            day: { margin: '2px' },
                            nav: { color: '#111827' }
                          }}
                        />
                        {filters.selectedDate && (
                          <button
                            onClick={() => handleFiltersChange({ ...filters, selectedDate: null })}
                            className="mt-2 w-full rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200"
                          >
                            Effacer la date
                          </button>
                        )}
                      </div>
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>

              {/* Location Dropdown */}
              <Listbox value={filters.location} onChange={(value) => handleFiltersChange({ ...filters, location: value })}>
                <div className="relative">
                  <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white py-3 pl-4 pr-10 text-left text-sm shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-primary">
                    <span className="block truncate">
                      {filters.location || 'Tous les lieux'}
                    </span>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                      <FaChevronDown className="h-3 w-3 text-gray-400" aria-hidden="true" />
                    </span>
                  </Listbox.Button>
                  <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Listbox.Option
                        className={({ active }) =>
                          `relative cursor-pointer select-none px-4 py-2 ${
                            active ? 'bg-primary/5 text-primary' : 'text-gray-900'
                          }`
                        }
                        value={null}
                      >
                        Tous les lieux
                      </Listbox.Option>
                      {locations.map((location) => (
                        <Listbox.Option
                          key={location}
                          className={({ active }) =>
                            `relative cursor-pointer select-none px-4 py-2 ${
                              active ? 'bg-primary/5 text-primary' : 'text-gray-900'
                            }`
                          }
                          value={location}
                        >
                          {location}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </Transition>
                </div>
              </Listbox>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {filteredEvents.length} {filteredEvents.length > 1 ? 'Événements' : 'Événement'}
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
                {filters.category && <span>Catégorie : {filters.category}</span>}
                {filters.selectedDate && (
                  <span>• {format(filters.selectedDate, 'dd MMMM yyyy', { locale: fr })}</span>
                )}
                {filters.location && <span>• {filters.location}</span>}
              </div>
            </div>
            {(filters.search || filters.category || filters.selectedDate || filters.location) && (
              <button
                onClick={() => handleFiltersChange({ search: '', category: null, selectedDate: null, location: null })}
                className="text-sm font-medium text-primary hover:text-primary/80"
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {paginatedEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventClick(event)}
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl bg-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-4px_rgba(0,0,0,0.15)] hover:shadow-primary/5"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                    
                    {/* Category Badge */}
                    <div className="absolute left-4 top-4">
                      <span className="inline-flex items-center rounded-full bg-[#4C9296]/10 px-3 py-1 text-xs font-medium text-[#4C9296] shadow-sm backdrop-blur-sm ring-1 ring-[#4C9296]/20">
                        {event.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="relative flex flex-1 flex-col p-6">
                    {/* Date and Location */}
                    <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <FaCalendar className="h-3.5 w-3.5 text-primary/80" />
                        <time dateTime={event.date}>
                          {format(parseISO(event.date), 'dd MMMM yyyy', { locale: fr })}
                        </time>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FaClock className="h-3.5 w-3.5 text-primary/80" />
                        <time>{event.time}</time>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-xl font-bold text-gray-900 group-hover:text-primary">
                      {event.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
                      {event.description}
                    </p>

                    {/* Location */}
                    <div className="mt-6 flex items-center gap-1.5 text-sm text-gray-600">
                      <FaMapMarkerAlt className="h-3.5 w-3.5 text-primary/80" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {/* Previous Page Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                >
                  <FaChevronLeft className="h-4 w-4" />
                </button>

                {/* Page Numbers */}
                <div className="flex gap-2">
                  {currentPage > 3 && (
                    <>
                      <button
                        onClick={() => setCurrentPage(1)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        1
                      </button>
                      {currentPage > 4 && (
                        <span className="inline-flex h-10 items-center justify-center px-1 text-gray-500">...</span>
                      )}
                    </>
                  )}

                  {getPageNumbers().map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm shadow-sm ring-1 ring-inset transition-colors ${
                        pageNum === currentPage
                          ? 'bg-[#4C9296] text-white ring-[#4C9296]'
                          : 'bg-white text-gray-500 ring-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="inline-flex h-10 items-center justify-center px-1 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                {/* Next Page Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
                >
                  <FaChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl bg-white px-4 py-12 text-center shadow-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 ring-8 ring-gray-50/50">
              <FaCalendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-6 font-serif text-xl font-semibold text-gray-900">
              Aucun événement trouvé
            </h3>
            <p className="mt-2 max-w-sm text-gray-600">
              Aucun événement ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres.
            </p>
          </div>
        )}
      </div>

      {/* Upcoming Events Section */}
      <div className="rounded-3xl bg-gray-50/50 px-6 py-12 md:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold text-gray-900">
                Événements à venir
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Les prochains événements à ne pas manquer
              </p>
            </div>
          </div>

          {/* Upcoming Events Grid */}
          {upcomingEvents.length > 0 ? (
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Date Badge */}
                  <div className="absolute left-4 top-4 z-10">
                    <div className="flex flex-col items-center rounded-xl bg-white/95 px-3 py-1 text-center shadow-sm backdrop-blur-sm">
                      <span className="text-xs font-medium text-gray-600">
                        {format(parseISO(event.date), 'MMM', { locale: fr })}
                      </span>
                      <span className="text-lg font-bold text-[#4C9296]">
                        {format(parseISO(event.date), 'dd')}
                      </span>
                    </div>
                  </div>

                  {/* Image */}
                  <div className="relative aspect-[2/1] overflow-hidden">
                    <Image
                      src={event.imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Category */}
                    <div className="inline-flex items-center rounded-full bg-[#4C9296]/10 px-2.5 py-0.5 text-xs font-medium text-[#4C9296]">
                      {event.category}
                    </div>

                    {/* Title */}
                    <h3 className="mt-3 font-serif text-lg font-bold text-gray-900 group-hover:text-[#4C9296]">
                      {event.title}
                    </h3>

                    {/* Time and Location */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <FaClock className="h-3.5 w-3.5 text-[#4C9296]/70" />
                        <time>{event.time}</time>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FaMapMarkerAlt className="h-3.5 w-3.5 text-[#4C9296]/70" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-center text-gray-600">
              Aucun événement à venir pour le moment.
            </p>
          )}
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEvent(null)
        }}
      />
    </div>
  )
} 