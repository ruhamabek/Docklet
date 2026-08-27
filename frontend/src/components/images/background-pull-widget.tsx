"use client"

import React from "react"
import {  CheckCircle2, AlertCircle, X, Terminal } from "lucide-react"

interface BackgroundPullWidgetProps {
  isPulling: boolean
  imageName: string
  layerProgress: Record<string, PullProgress>
  statusMessage: { type: "success" | "error"; text: string } | null
  onOpenModal: () => void
  onCancel: () => void
  onDismiss: () => void
}

export function BackgroundPullWidget({
  isPulling,
  imageName,
  layerProgress,
  statusMessage,
  onOpenModal,
  onCancel,
  onDismiss,
}: BackgroundPullWidgetProps) {
   if (!isPulling && !statusMessage) return null

  const layerCount = Object.keys(layerProgress).length
  const completedCount = Object.values(layerProgress).filter(
    (l) => l.status?.toLowerCase().includes("complete") || l.status?.toLowerCase().includes("already exists")
  ).length

  const isSuccess = !isPulling && statusMessage?.type === "success"
  const isError = !isPulling && statusMessage?.type === "error"

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200 font-mono">
      <div
        className={`flex items-center gap-3 p-3 rounded-xs border shadow-2xl backdrop-blur-md ${
          isSuccess
            ? "bg-card border-primary/50 text-foreground"
            : isError
            ? "bg-card border-destructive/50 text-foreground"
            : "bg-card border-primary/40 text-foreground"
        }`}
      >
         <div className="shrink-0">
          {isPulling ? (
            <div className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary" />
            </div>
          ) : isSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-primary" />
          ) : (
            <AlertCircle className="w-4 h-4 text-destructive" />
          )}
        </div>

         <div className="flex flex-col gap-0.5 cursor-pointer select-none" onClick={onOpenModal}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground">
              {isPulling ? "Pulling Image:" : isSuccess ? "Image Pulled:" : "Pull Status:"}
            </span>
            <span className="text-xs text-primary font-bold">{imageName}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {isPulling
              ? layerCount > 0
                ? `Syncing layers (${completedCount}/${layerCount} complete)`
                : "Connecting to registry socket..."
              : statusMessage?.text}
          </p>
        </div>

         <div className="flex items-center gap-1.5 pl-2 border-l border-border/60">
          <button
            onClick={onOpenModal}
            className="px-2 py-1 bg-secondary border border-border hover:border-primary text-muted-foreground hover:text-primary text-[10px] font-bold rounded-xs flex items-center gap-1 transition-colors"
            title="Open Live Pull Console"
          >
            <Terminal className="w-3 h-3" />
            <span>LOGS</span>
          </button>

          {isPulling ? (
            <button
              onClick={onCancel}
              className="px-2 py-1 bg-destructive/10 border border-destructive/30 hover:bg-destructive hover:text-destructive-foreground text-destructive text-[10px] font-bold rounded-xs transition-colors"
              title="Cancel Pull"
            >
              CANCEL
            </button>
          ) : (
            <button
              onClick={onDismiss}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xs transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
