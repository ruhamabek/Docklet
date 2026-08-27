"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Inbox, Play, RefreshCcw, Trash } from "lucide-react"

interface ImagesViewProps {
  images: ImageItem[]
  onRefresh: () => void
  onOpenPullModal: () => void
  onRun: (image: ImageItem) => void
  onDelete: (image: ImageItem) => void
}

export function ImagesView({
  images,
  onRefresh,
  onOpenPullModal,
  onRun,
  onDelete,
}: ImagesViewProps) {
  return (
    <div className="flex flex-col gap-4 font-mono">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">
          Downloaded Images ({images.length})
        </h2>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-primary text-primary-foreground font-bold hover:brightness-110"
            onClick={onOpenPullModal}
          >
            <Inbox className="w-3.5 h-3.5 mr-1" />
            Pull Image
          </Button>
          <Button size="sm" onClick={onRefresh}>
            <RefreshCcw className="w-3.5 h-3.5 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-border rounded-xs text-muted-foreground text-xs">
          No images downloaded yet. Click &quot;Pull Image&quot; to download one!
        </div>
      ) : (
        <div className="border border-border rounded-xs overflow-hidden bg-card">
          <table className="w-full text-left text-xs text-foreground">
            <thead className="bg-background text-muted-foreground font-mono text-[10px] uppercase border-b border-border">
              <tr>
                <th className="p-3.5">REPOSITORY</th>
                <th className="p-3.5">TAG</th>
                <th className="p-3.5">IMAGE ID</th>
                <th className="p-3.5">SIZE</th>
                <th className="p-3.5 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {images.map((img) => (
                <tr
                  key={img.id}
                  className="hover:bg-muted/40 transition-colors"
                >
                  <td className="p-3.5 font-bold text-foreground">
                    {img.repository}
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 bg-muted text-primary border border-border rounded-xs font-mono text-xs">
                      {img.tag}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-xs text-muted-foreground">
                    {img.id}
                  </td>
                  <td className="p-3.5 font-mono text-xs text-primary">
                    {img.size}
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground font-bold hover:brightness-110"
                        onClick={() => onRun(img)}
                      >
                        <Play className="w-3.5 h-3.5 mr-1 fill-current" />
                        Run
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onDelete(img)}
                      >
                        <Trash className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
