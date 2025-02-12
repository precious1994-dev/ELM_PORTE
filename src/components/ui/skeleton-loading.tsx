import { cn } from "@/lib/utils"

interface SkeletonProps {
  variant?: 'banner' | 'card' | 'event' | 'schedule' | 'team'
  className?: string
}

export function Skeleton({ variant = 'card', className }: SkeletonProps) {
  const baseClasses = "animate-pulse rounded-md bg-gray-200"
  
  if (variant === 'banner') {
    return (
      <div className="w-full min-h-[80vh] relative">
        <div className={cn("w-full h-full absolute inset-0", baseClasses)} />
        <div className="relative container py-20">
          <div className={cn("h-8 w-48 mb-6", baseClasses)} />
          <div className={cn("h-16 w-3/4 mb-4", baseClasses)} />
          <div className={cn("h-16 w-2/4 mb-8", baseClasses)} />
          <div className={cn("h-12 w-96 mb-12", baseClasses)} />
          <div className="flex gap-4">
            <div className={cn("h-10 w-32", baseClasses)} />
            <div className={cn("h-10 w-32", baseClasses)} />
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div className={cn("p-6 rounded-lg", className)}>
        <div className={cn("h-6 w-3/4 mb-4", baseClasses)} />
        <div className={cn("h-4 w-full mb-2", baseClasses)} />
        <div className={cn("h-4 w-5/6", baseClasses)} />
      </div>
    )
  }

  if (variant === 'event') {
    return (
      <div className={cn("flex flex-col md:flex-row gap-4 p-4", className)}>
        <div className={cn("w-full md:w-48 h-48", baseClasses)} />
        <div className="flex-1">
          <div className={cn("h-6 w-3/4 mb-4", baseClasses)} />
          <div className={cn("h-4 w-full mb-2", baseClasses)} />
          <div className={cn("h-4 w-5/6 mb-4", baseClasses)} />
          <div className="flex gap-4">
            <div className={cn("h-8 w-24", baseClasses)} />
            <div className={cn("h-8 w-24", baseClasses)} />
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'schedule') {
    return (
      <div className={cn("p-6 rounded-lg", className)}>
        <div className={cn("h-6 w-2/3 mb-3", baseClasses)} />
        <div className={cn("h-4 w-1/3 mb-4", baseClasses)} />
        <div className={cn("h-4 w-full", baseClasses)} />
      </div>
    )
  }

  if (variant === 'team') {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        <div className={cn("w-48 h-48 rounded-full mb-4", baseClasses)} />
        <div className={cn("h-6 w-40 mb-2", baseClasses)} />
        <div className={cn("h-4 w-32 mb-4", baseClasses)} />
        <div className={cn("h-4 w-48", baseClasses)} />
      </div>
    )
  }

  return <div className={cn("h-4 w-full", baseClasses, className)} />
} 