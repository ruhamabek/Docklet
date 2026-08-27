import { z } from "zod"


export const runImageSchema = z
  .object({
    containerName: z
      .string()
      .trim()
      .refine(
        (val) => val === "" || /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(val),
        {
          message:
            "Must start with an alphanumeric character and contain only letters, digits, '.', '_', or '-'.",
        }
      ),
    hostPort: z
      .string()
      .trim()
      .refine(
        (val) => {
          if (val === "") return true
          const num = Number(val)
          return Number.isInteger(num) && num >= 1 && num <= 65535
        },
        { message: "Must be a valid port (1-65535)." }
      ),
    containerPort: z
      .string()
      .trim()
      .refine(
        (val) => {
          if (val === "") return true
          const num = Number(val)
          return Number.isInteger(num) && num >= 1 && num <= 65535
        },
        { message: "Must be a valid port (1-65535)." }
      ),
  })
  .refine(
    (data) => {
      const hasHost = data.hostPort !== ""
      const hasContainer = data.containerPort !== ""
      return (hasHost && hasContainer) || (!hasHost && !hasContainer)
    },
    {
      message: "Both Host Port and Container Port must be provided together for port mapping.",
      path: ["containerPort"],
    }
  )

export type RunImageFormData = z.infer<typeof runImageSchema>
export type RunImageFormErrors = Partial<Record<keyof RunImageFormData | "general", string>>
