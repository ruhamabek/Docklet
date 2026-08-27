"use client"

import React, { useState, useEffect, useRef } from "react"
import { StreamContainerLogs, StopContainerLogs } from "@wailsjs/go/main/App"
import { EventsOn } from "@wailsjs/runtime/runtime"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Terminal, Trash2, X } from "lucide-react"

interface LogViewerModalProps {
  containerId: string | null
  containerName?: string
  onClose: () => void
}

export function LogViewerModal({
  containerId,
  containerName,
  onClose,
}: LogViewerModalProps) {
  const [logs, setLogs] = useState<string[]>([])
  const logContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerId) return

    setLogs([])
    StreamContainerLogs(containerId).catch((err) =>
      setLogs((prev) => [...prev, `❌ [STREAM ATTACH ERROR]: ${err?.message || err}`])
    )

    const unsubLogs = EventsOn("container-log-line", (line: string) => {
      setLogs((prev) => [...prev, line])
    })

    const unsubErrors = EventsOn("container-log-error", (errMsg: string) => {
      setLogs((prev) => [...prev, `❌ [ERROR]: ${errMsg}`])
    })

    return () => {
      StopContainerLogs()
      unsubLogs()
      unsubErrors()
    }
  }, [containerId])

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  if (!containerId) return null

  return (
    <Dialog open={!!containerId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border border-border bg-card text-foreground font-mono max-w-4xl p-6">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span>Live Container Logs</span>
            <span className="text-xs text-primary font-bold">
              {containerName ? containerName : containerId.slice(0, 12)}
            </span>
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLogs([])}
              disabled={logs.length === 0}
              className="text-xs"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          </div>
        </DialogHeader>

        <div
          ref={logContainerRef}
          className="bg-background text-primary font-mono text-[11px] p-4 rounded-xs h-96 overflow-y-auto whitespace-pre-wrap flex flex-col gap-1 border border-border scrollbar-thin"
        >
          {logs.length === 0 ? (
            <span className="text-muted-foreground italic text-xs">
              Waiting for container stdout/stderr stream...
            </span>
          ) : (
            logs.map((line, index) => (
              <div
                key={index}
                className="leading-relaxed hover:bg-muted/20 px-1 rounded-xs"
              >
                {line}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}