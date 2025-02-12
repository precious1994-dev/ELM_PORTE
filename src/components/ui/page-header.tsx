interface PageHeaderProps {
  title: string
  description?: string
  className?: string
}

export default function PageHeader({
  title,
  description,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`bg-primary py-16 text-white ${className}`}>
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl font-bold sm:text-5xl">{title}</h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-lg">{description}</p>
        )}
      </div>
    </div>
  )
} 