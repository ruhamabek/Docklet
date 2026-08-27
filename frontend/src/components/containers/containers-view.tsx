"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Activity, Play, RefreshCcw, StopCircle, Trash } from "lucide-react"

interface ContainersViewProps {
  containers: ContainerItem[]
  onRefresh: () => void
  onStart: (id: string) => void
  onStop: (id: string) => void
  onStats: (container: ContainerItem) => void
  onDelete: (container: ContainerItem) => void
}

export function ContainersView({
  containers,
  onRefresh,
  onStart,
  onStop,
  onStats,
  onDelete,
}: ContainersViewProps) {
  return (
    <div className="flex flex-col gap-4 font-mono">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">
          Containers ({containers.length})
        </h2>
        <Button size="sm" onClick={onRefresh}>
          <RefreshCcw className="w-3.5 h-3.5 mr-1" />
          Refresh
        </Button>
      </div>

      {containers.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border rounded-xs text-muted-foreground text-xs">
          No containers found. Go to the Images tab to launch one!
        </div>
      ) : (
        <div className="grid gap-3">
          {containers.map((c) => {
            const isRunning = c.state === "running"

            return (
              <div
                key={c.id}
                className="p-4 border border-border rounded-xs bg-card flex justify-between items-center"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        isRunning ? "bg-primary animate-pulse shadow-[0_0_6px_var(--primary)]" : "bg-destructive"
                      }`}
                    />
                    <span className="font-bold text-base text-foreground">
                      {c.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      ({c.id})
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Image: <span className="text-foreground/80">{c.image}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Status: <span className="text-foreground/80">{c.status}</span>
                  </p>
                  {c.ports && c.ports.length > 0 && (
                    <p className="text-xs text-primary">
                      Ports: {c.ports.join(", ")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isRunning ? (
                    <>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onStop(c.id)}
                      >
                        <StopCircle className="w-3.5 h-3.5 mr-1" />
                        Stop
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-secondary border border-border text-foreground hover:border-primary hover:text-primary"
                        onClick={() => onStats(c)}
                      >
                        <Activity className="w-3.5 h-3.5 mr-1" />
                        Stats
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground font-bold hover:brightness-110"
                      onClick={() => onStart(c.id)}
                    >
                      <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                      Start
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(c)}
                  >
                    <Trash className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
