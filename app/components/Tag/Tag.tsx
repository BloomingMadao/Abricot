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
// Only the COLORS here: they are also used by Alert, the AI modal's info box
// and TaskStatusPicker, which each choose their own border.
export const variantClasses: Record<TagVariant, string> = {
    success: "bg-success-light text-success",
    error: "bg-error-light text-error",
    warning: "bg-warning-light text-warning",
    info: "bg-info-light text-info",
    brand: "bg-brand-light text-brand-dark",
    grey: "bg-grey-200 text-grey-600"
}

export default function Tag({ label, variant = "success", className = "" }: TagProps) {
  // border border-transparent: the tags have no visible outline in the mockup
  // (before, border-1 drew a line in the text color). The 1px stays, invisible: same size as before
  return <span className={`tag border border-transparent ${variantClasses[variant]} ${className}`}>{label}</span>
}