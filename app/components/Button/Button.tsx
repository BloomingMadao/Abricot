import type { ReactNode } from "react"

type ButtonProps = {
    // Le texte du bouton. ReactNode (et pas seulement string) : on peut y mettre
    // du HTML, ex : un texte caché pour les lecteurs d'écran (<span className="sr-only">)
    label: ReactNode
    variant?: "primary" | "secondary" | "highlight" |"disabled"
    // "submit" envoie le formulaire, "button" ne fait rien tout seul (pour un onClick)
    type?: "submit" | "button" | "reset"
    disabled?: boolean
    // Ce qui se passe au clic (pour un bouton type="button", ex : ouvrir une modale)
    onClick?: () => void
    // Classes en plus, ex : "mx-0 w-61" pour une autre largeur que celle de .button-primary
    // (les classes Tailwind passent devant celles de .button-primary)
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
            // La variante "disabled" désactive aussi vraiment le bouton, pas seulement son style
            disabled={disabled || variant === "disabled"}
        >
            {label}
        </button>
    )
}