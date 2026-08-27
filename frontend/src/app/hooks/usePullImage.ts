"use client"

import { useState, useRef, useCallback } from "react"
import { PullImages, CancelPullImage } from "@wailsjs/go/main/App"
import { EventsOn } from "@wailsjs/runtime/runtime"

export interface PullTaskState {
  imageName: string
  isPulling: boolean
  layerProgress: Record<string, PullProgress>
  statusMessage: { type: "success" | "error"; text: string } | null
  lastCompletedImage: string | null
}

export function usePullImage(onSuccessCallback?: () => void) {
  const [imageName, setImageName] = useState("")
  const [isPulling, setIsPulling] = useState(false)
  const [layerProgress, setLayerProgress] = useState<Record<string, PullProgress>>({})
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)
  const [lastCompletedImage, setLastCompletedImage] = useState<string | null>(null)

  const isPullingRef = useRef(false)
  isPullingRef.current = isPulling

  const startPull = useCallback((nameToPull: string) => {
    const trimmed = nameToPull.trim()
    if (!trimmed || isPullingRef.current) return

    setImageName(trimmed)
    setIsPulling(true)
    setLayerProgress({})
    setStatusMessage(null)
    setLastCompletedImage(null)

    const unsubProgress = EventsOn("image-pull-progress", (data: PullProgress) => {
      if (data && data.id) {
        setLayerProgress((prev) => ({ ...prev, [data.id]: data }))
      }
    })

    PullImages(trimmed)
      .then(() => {
        setIsPulling(false)
        unsubProgress()
        setLastCompletedImage(trimmed)
        setStatusMessage({
          type: "success",
          text: `Successfully pulled ${trimmed}!`,
        })
        if (onSuccessCallback) {
          onSuccessCallback()
        }
      })
      .catch((err: Error) => {
        setIsPulling(false)
        unsubProgress()
        const errMsg = err?.message || String(err)
        if (errMsg.includes("canceled") || errMsg.includes("context canceled")) {
          setStatusMessage({
            type: "error",
            text: `Pull canceled for ${trimmed}`,
          })
        } else {
          setStatusMessage({
            type: "error",
            text: `Failed to pull image: ${errMsg}`,
          })
        }
      })
  }, [onSuccessCallback])

  const cancelPull = useCallback(() => {
    if (isPullingRef.current) {
      CancelPullImage().catch(() => {})
      setIsPulling(false)
      setStatusMessage({
        type: "error",
        text: "Image pull canceled.",
      })
    }
  }, [])

  const clearStatus = useCallback(() => {
    setStatusMessage(null)
    setLastCompletedImage(null)
  }, [])

  return {
    imageName,
    setImageName,
    isPulling,
    layerProgress,
    statusMessage,
    lastCompletedImage,
    startPull,
    cancelPull,
    clearStatus,
  }
}
