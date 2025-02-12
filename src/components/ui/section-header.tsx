interface SectionHeaderProps {
  title: string
  description?: string
  centered?: boolean
  className?: string
}

export function SectionHeader({
  title,
  description,
  centered = false,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`${centered ? 'text-center' : ''} ${className}`}>
      <h2 className="font-serif text-3xl font-bold text-gray-900">{title}</h2>
      {description && (
        <p className="mt-4 max-w-3xl text-lg text-gray-600">
          {description}
        </p>
      )}
    </div>
  )
} 