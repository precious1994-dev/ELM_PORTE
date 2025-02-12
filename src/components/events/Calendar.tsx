'use client'

import { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { cn } from '@/lib/utils'

interface Event {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  imageUrl: string
}

interface CalendarProps {
  events: Event[]
  onSelectDate?: (date: Date) => void
}

export function Calendar({ events = [], onSelectDate }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const firstDayOfMonth = startOfMonth(currentMonth)
  const lastDayOfMonth = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  })

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <div className="rounded-lg bg-white p-4 shadow-lg">
      {/* Calendar Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={handlePreviousMonth}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
        >
          <FaChevronLeft className="h-4 w-4" />
        </button>
        <h2 className="font-serif text-xl font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button
          onClick={handleNextMonth}
          className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
        >
          <FaChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week Days */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="pb-2 text-center text-sm font-semibold text-gray-600"
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {daysInMonth.map((day) => {
          const hasEvent = events.some((event) =>
            isSameDay(parseISO(event.date), day)
          )
          const dayEvents = events.filter((event) =>
            isSameDay(parseISO(event.date), day)
          )

          return (
            <button
              key={day.toString()}
              onClick={() => onSelectDate?.(day)}
              className={cn(
                'aspect-square rounded-lg p-2 text-center hover:bg-gray-100',
                !isSameMonth(day, currentMonth) && 'text-gray-400',
                hasEvent && 'font-semibold text-primary'
              )}
            >
              <span className="block">{format(day, 'd')}</span>
              {hasEvent && (
                <div className="mt-1">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                </div>
              )}
              {hasEvent && (
                <div className="mt-1">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="text-xs text-gray-600 truncate"
                      title={event.title}
                    >
                      {event.time}
                    </div>
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
} 