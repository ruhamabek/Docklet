"use client"

import { RunImage } from "@wailsjs/go/main/App"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Play, Layers, AlertCircle, CheckCircle2 } from "lucide-react"
import { getErrorMessage } from "@/lib/utils"
import {
  runImageSchema,
  type RunImageFormData,
  type RunImageFormErrors,
} from "@/lib/validations/docker"
import { useState } from "react"

interface RunImageModalProps {
  image: ImageItem | null
  onClose: () => void
  onSuccess: () => void
}

export function RunImageModal({ image, onClose, onSuccess }: RunImageModalProps) {
  const [formData, setFormData] = useState<RunImageFormData>({
    containerName: "",
    hostPort: "",
    containerPort: "",
  })
  const [errors, setErrors] = useState<RunImageFormErrors>({})
  const [isRunning, setIsRunning] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  if (!image) return null

  function handleChange(field: keyof RunImageFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
     if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
    if (statusMessage) setStatusMessage(null)
  }

  function validate(): boolean {
    const result = runImageSchema.safeParse(formData)
    if (!result.success) {
      const newErrors: RunImageFormErrors = {}
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof RunImageFormData
        if (key && !newErrors[key]) {
          newErrors[key] = issue.message
        }
      }
      setErrors(newErrors)
      return false
    }
    setErrors({})
    return true
  }

  async function handleLaunch(e: React.FormEvent) {
    e.preventDefault()
    if (!image) return

    if (!validate()) return

    setIsRunning(true)
    setStatusMessage(null)

    const fullTag =
      image.tag !== "<none>" ? `${image.repository}:${image.tag}` : image.id

    const payload: RunImageOptions = {
      imageName: fullTag,
      containerName: formData.containerName.trim(),
      hostPort: formData.hostPort.trim(),
      containerPort: formData.containerPort.trim(),
    }

    try {
      await RunImage(payload)
      setIsRunning(false)
      setStatusMessage({
        type: "success",
        text: `Container launched successfully!`,
      })
      setTimeout(() => {
        onSuccess()
        onClose()
        setFormData({ containerName: "", hostPort: "", containerPort: "" })
        setStatusMessage(null)
      }, 500)
    } catch (err: unknown) {
      setIsRunning(false)
      setStatusMessage({
        type: "error",
        text: `Failed to launch container: ${getErrorMessage(err)}`,
      })
    }
  }

  return (
    <Dialog open={!!image} onOpenChange={(open) => !open && !isRunning && onClose()}>
      <DialogContent className="border border-border bg-card text-foreground font-mono max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <span>Run Container</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground truncate">
            Image: <span className="text-primary font-bold">{image.repository}:{image.tag}</span>{" "}
            <span className="text-[10px] text-muted-foreground">({image.id.slice(0, 12)})</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLaunch} className="flex flex-col gap-4 py-2">
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

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Container Name (Optional)
            </label>
            <Input
              placeholder="e.g. web-app, redis-dev"
              value={formData.containerName}
              onChange={(e) => handleChange("containerName", e.target.value)}
              disabled={isRunning}
              className={errors.containerName ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.containerName && (
              <span className="text-[10px] text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.containerName}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Host Port
              </label>
              <Input
                placeholder="e.g. 8080"
                value={formData.hostPort}
                onChange={(e) => handleChange("hostPort", e.target.value)}
                disabled={isRunning}
                className={errors.hostPort ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.hostPort && (
                <span className="text-[10px] text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.hostPort}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Container Port
              </label>
              <Input
                placeholder="e.g. 80"
                value={formData.containerPort}
                onChange={(e) => handleChange("containerPort", e.target.value)}
                disabled={isRunning}
                className={errors.containerPort ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.containerPort && (
                <span className="text-[10px] text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.containerPort}
                </span>
              )}
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isRunning}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isRunning}
              className="bg-primary text-primary-foreground font-bold hover:brightness-110 flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? "Launching..." : "Launch Container"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}