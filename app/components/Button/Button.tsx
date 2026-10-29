type ButtonProps = {
    label: string
    variant?: "primary" | "secondary" | "highlight" |"disabled"
    // "submit" envoie le formulaire, "button" ne fait rien tout seul (pour un onClick)
    type?: "submit" | "button" | "reset"
    disabled?: boolean
    // Ce qui se passe au clic (pour un bouton type="button", ex : ouvrir une modale)
    onClick?: () => void
}

export default function Button({
    label,
    variant = "primary",
    type = "submit",
    disabled = false,
    onClick,
}: ButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`button-${variant}`}
            // La variante "disabled" désactive aussi vraiment le bouton, pas seulement son style
            disabled={disabled || variant === "disabled"}
        >
            {label}
        </button>
    )
}