import { cn } from '@/lib/utils'

interface ContainerProps {
  children: React.ReactNode
  as?: keyof JSX.IntrinsicElements
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

const sizeClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-[96rem]',
  full: 'max-w-none',
}

export function Container({
  children,
  className,
  as: Component = 'div',
  size = 'lg',
}: ContainerProps) {
  return (
    <Component
      className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}
    >
      {children}
    </Component>
  )
} 