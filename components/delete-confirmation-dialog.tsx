"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useLanguage } from "@/lib/language-context"

interface DeleteConfirmationDialogProps {
  onConfirm: () => void
  children: React.ReactNode
  title?: string
  description?: string
}

export function DeleteConfirmationDialog({
  onConfirm,
  children,
  title,
  description
}: DeleteConfirmationDialogProps) {
  const { t } = useLanguage()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || t("Opravdu smazat?")}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || t("Tato akce je nevratná. Dojde k trvalému smazání této položky z vašeho seznamu.")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("Zrušit")}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t("Smazat")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
