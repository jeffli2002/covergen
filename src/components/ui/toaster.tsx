"use client"

import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <>
      {toasts.map(({ id, title, description, action, ...props }) => {
        return (
          <div
            key={id}
            className="fixed bottom-4 right-4 z-50 w-full max-w-sm overflow-hidden rounded-lg border bg-background p-4 shadow-lg"
          >
            <div className="grid gap-1">
              {title && <div className="text-sm font-semibold">{title}</div>}
              {description && (
                <div className="text-sm opacity-90">{description}</div>
              )}
            </div>
            {action}
          </div>
        )
      })}
    </>
  )
}