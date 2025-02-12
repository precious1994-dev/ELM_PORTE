import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Container } from './container'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  background?: 'white' | 'gray' | 'primary'
}

const backgroundClasses = {
  white: 'bg-white',
  gray: 'bg-gray-50',
  primary: 'bg-primary text-white',
}

export function Section({
  className,
  containerSize = 'lg',
  background = 'white',
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn('py-16', backgroundClasses[background], className)}
      {...props}
    >
      <Container size={containerSize}>{children}</Container>
    </section>
  )
} 