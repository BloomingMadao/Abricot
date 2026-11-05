import type { ReactNode } from "react"

type ButtonProps = {
    // The button's content. ReactNode (and not just string): it can contain
    // HTML, e.g. hidden text for screen readers (<span className="sr-only">)
    label: ReactNode
    variant?: "primary" | "secondary" | "highlight" |"disabled"
    // "submit" submits the form, "button" does nothing on its own (for an onClick)
    type?: "submit" | "button" | "reset"
    disabled?: boolean
    // What happens on click (for a type="button" button, e.g. opening a modal)
    onClick?: () => void
    // Extra classes, e.g. "mx-0 w-61" for a different width than .button-primary's
    // (Tailwind classes take precedence over those of .button-primary)
    className?: string
}

export default function Button({
    label,
    variant = "primary",
    type = "submit",
    disabled = false,
    onClick,
    className = "",
}: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`button-${variant} ${className}`}
            // The "disabled" variant also actually disables the button, not just its style
            disabled={disabled || variant === "disabled"}
        >
            {label}
        </button>
    )
}