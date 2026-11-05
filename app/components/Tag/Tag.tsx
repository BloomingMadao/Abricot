import type { ReactNode } from "react"

export type TagVariant = "success" | "error" | "warning" | "info" | "brand" | "grey"

type TagProps = {
  // ReactNode (and not just string): it can contain HTML,
  // e.g. hidden text for screen readers (<span className="sr-only">)
  label: ReactNode
  variant?: TagVariant
  // Extra classes, e.g. "size-[27px] p-0" for a round avatar
  // (Tailwind classes take precedence over those of .tag)
  className?: string
}

// Class names are written IN FULL: that's what lets
// Tailwind find and generate them.
export const variantClasses: Record<TagVariant, string> = {
    success: "bg-success-light text-success border-1",
    error: "bg-error-light text-error border-1",
    warning: "bg-warning-light text-warning border-1",
    info: "bg-info-light text-info border-1",
    brand: "bg-brand-light text-brand-dark border-1",
    grey: "bg-grey-200 text-grey-600 border-1"
}

export default function Tag({ label, variant = "success", className = "" }: TagProps) {
  return <span className={`tag ${variantClasses[variant]} ${className}`}>{label}</span>
}