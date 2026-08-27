import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function humanizeDockerError(msg: string): string {
  const lower = msg.toLowerCase()
  if (
    lower.includes("npipe") ||
    lower.includes("docker_engine") ||
    lower.includes("cannot find the file") ||
    lower.includes("no such file or directory")
  ) {
    return "Docker is not running. Start Docker Desktop and try again."
  }
  if (
    lower.includes("connection refused") ||
    lower.includes("cannot connect") ||
    lower.includes("connectex")
  ) {
    return "Cannot connect to Docker daemon. Is it running?"
  }
  if (lower.includes("context canceled")) {
    return "Operation was canceled."
  }
  return msg
}

export function getErrorMessage(error: unknown): string {
  let raw: string
  if (error instanceof Error) {
    raw = error.message
  } else if (typeof error === "string") {
    raw = error
  } else if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    raw = (error as { message: string }).message
  } else {
    raw = String(error)
  }
  return humanizeDockerError(raw)
}
