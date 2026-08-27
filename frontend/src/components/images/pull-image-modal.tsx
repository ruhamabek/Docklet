"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Download, AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react"

interface PullImageModalProps {
  isOpen: boolean
  onClose: () => void
  isPulling: boolean
  imageName: string
  setImageName: (name: string) => void
  layerProgress: Record<string, PullProgress>
  statusMessage: { type: "success" | "error"; text: string } | null
  onStartPull: (name: string) => void
  onCancelPull: () => void
}

export function PullImageModal({
  isOpen,
  onClose,
  isPulling,
  imageName,
  setImageName,
  layerProgress,
  statusMessage,
  onStartPull,
  onCancelPull,
}: PullImageModalProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!imageName.trim() || isPulling) return
    onStartPull(imageName)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border border-border bg-card text-foreground font-mono max-w-xl p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-4 h-4 text-primary" />
            <span>Pull Docker Image</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Fetch an image from Docker Hub or a registry. You can close this modal while downloading to continue in the background.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-2">
          {statusMessage && (
            <div
              className={`p-3 rounded-xs border text-xs flex items-start gap-2 ${
                statusMessage.type === "success"
                  ? "bg-primary/10 border-primary/30 text-primary"
                  : "bg-destructive/10 border-destructive/30 text-destructive"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span className="leading-tight">{statusMessage.text}</span>
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="e.g. redis:alpine, nginx:latest, postgres:16"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              disabled={isPulling}
            />
            {isPulling ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onCancelPull}
                className="shrink-0 font-bold flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Cancel Pull</span>
              </Button>
            ) : (
              <Button
                type="submit"
                size="sm"
                disabled={!imageName.trim()}
                className="bg-primary text-primary-foreground font-bold hover:brightness-110 shrink-0 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Pull</span>
              </Button>
            )}
          </div>

          {isPulling && (
            <div className="flex items-center justify-between text-[11px] text-muted-foreground py-0.5 border-b border-dashed border-border">
              <div className="flex items-center gap-1.5 text-primary">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Pulling image layers...</span>
              </div>
              <span className="text-[10px] text-muted-foreground">
                (Closing modal keeps pull active in background)
              </span>
            </div>
          )}

           {Object.keys(layerProgress).length > 0 && (
            <div className="flex flex-col gap-1.5 bg-background p-3 rounded-xs border border-border max-h-64 overflow-y-auto font-mono text-[11px] scrollbar-thin">
              {Object.values(layerProgress).map((layer) => (
                <div
                  key={layer.id}
                  className="flex justify-between items-center py-1 border-b border-dashed border-border/40 last:border-0"
                >
                  <span className="text-foreground font-bold">{layer.id}</span>
                  <span className="text-primary font-bold">{layer.status}</span>
                  <span className="text-muted-foreground text-[10px] truncate max-w-[150px]">
                    {layer.progress}
                  </span>
                </div>
              ))}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}