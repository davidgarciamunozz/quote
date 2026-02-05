import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Trash2 } from 'lucide-react'

interface DeleteQuoteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  patientName: string
}

export function DeleteQuoteDialog({
  isOpen,
  onClose,
  onConfirm,
  patientName,
}: DeleteQuoteDialogProps) {
  const [confirmation, setConfirmation] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const REQUIRED_TEXT = 'ELIMINAR'

  const handleConfirm = async () => {
    if (confirmation !== REQUIRED_TEXT) return

    try {
      setIsDeleting(true)
      setError(null)
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la cotización')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setConfirmation('')
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-5 w-5" />
            <DialogTitle>Confirmar Eliminación</DialogTitle>
          </div>
          <DialogDescription>
            ¿Estás seguro de que deseas eliminar la cotización de{' '}
            <span className="font-bold text-foreground">{patientName}</span>?
            Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation" className="text-sm font-medium">
              Por favor escribe <span className="font-bold">{REQUIRED_TEXT}</span> para confirmar
            </Label>
            <Input
              id="confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={REQUIRED_TEXT}
              className="border-destructive/30 focus-visible:ring-destructive"
              autoFocus
            />
          </div>
          {error && (
            <p className="text-sm text-destructive font-medium">{error}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={confirmation !== REQUIRED_TEXT || isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                Eliminando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Eliminar Cotización
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
