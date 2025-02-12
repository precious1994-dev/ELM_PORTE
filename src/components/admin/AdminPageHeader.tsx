import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { FaSave } from 'react-icons/fa'

interface AdminPageHeaderProps {
  title: string
  description: string
  onSave?: () => void
  isSaving?: boolean
}

export function AdminPageHeader({
  title,
  description,
  onSave,
  isSaving = false,
}: AdminPageHeaderProps) {
  return (
    <div className="border-b border-[#4C9296]/10 bg-white shadow-sm">
      <Container>
        <div className="flex h-24 items-center justify-between py-6">
          {/* Title and Description */}
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#4C9296]">
              {title}
            </h1>
            <p className="mt-1.5 text-gray-600">
              {description}
            </p>
          </div>

          {/* Actions */}
          {onSave && (
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="bg-[#4C9296] hover:bg-[#3A7276] text-white shadow-md hover:shadow-lg transition-all rounded-xl px-6 py-2.5 text-base font-medium disabled:bg-[#4C9296]/50 disabled:text-white/80 gap-2"
            >
              <FaSave className="h-4 w-4" />
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          )}
        </div>
      </Container>
    </div>
  )
} 