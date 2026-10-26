type ButtonProps = {
    label: string
    variant?: "primary" | "secondary" | "disabled"
    // "submit" envoie le formulaire, "button" ne fait rien tout seul (pour un onClick)
    type?: "submit" | "button" | "reset"
    disabled?: boolean
}

export default function Button({
    label,
    variant = "primary",
    type = "submit",
    disabled = false,
}: ButtonProps) {
    return (
        <button
            type={type}
            className={`button-${variant}`}
            // La variante "disabled" désactive aussi vraiment le bouton, pas seulement son style
            disabled={disabled || variant === "disabled"}
        >
            {label}
        </button>
    )
}