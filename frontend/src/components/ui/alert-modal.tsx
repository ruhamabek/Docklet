"use client"

import React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string | null
  type?: "error" | "info" | "success"
}

export function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = "error",
}: AlertModalProps) {
  if (!message) return null

  const icons = {
    error: <AlertCircle className="w-5 h-5 text-destructive shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />,
    info: <Info className="w-5 h-5 text-muted-foreground shrink-0" />,
  }

  const defaultTitles = {
    error: "Operation Error",
    success: "Success",
    info: "Information",
  }

  const borderStyles = {
    error: "border-destructive/40",
    success: "border-primary/40",
    info: "border-border",
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className={`bg-card text-foreground font-mono ${borderStyles[type]}`}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-foreground">
            {icons[type]}
            <span>{title || defaultTitles[type]}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-foreground/80 pt-2 font-mono whitespace-pre-wrap leading-relaxed">
            {message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={onClose}
            className="bg-secondary text-foreground hover:bg-secondary/80 border border-border font-mono font-bold text-xs"
          >
            Dismiss
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
