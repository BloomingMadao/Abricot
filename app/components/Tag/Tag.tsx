type TagVariant = "success" | "error" | "warning" | "info" | "brand" | "grey"

type TagProps = {
  label: string
  variant?: TagVariant
}

// Les noms de classes sont écrits EN ENTIER : c'est ce qui permet
// à Tailwind de les trouver et de les générer.
const variantClasses: Record<TagVariant, string> = {
    success: "bg-success-light text-success border-1",
    error: "bg-error-light text-error border-1",
    warning: "bg-warning-light text-warning border-1",
    info: "bg-info-light text-info border-1",
    brand: "bg-brand-light text-brand-dark border-1",
    grey: "bg-grey-200 text-grey-600 border-1"
}

export default function Tag({ label, variant = "success" }: TagProps) {
  return <span className={`tag ${variantClasses[variant]}`}>{label}</span>
}
