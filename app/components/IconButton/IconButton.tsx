import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import ArrowBack from "@/public/image/arrowBack.svg"
import ArrowBackFocus from "@/public/image/arrowBackFocus.svg"
import SeeMore from "@/public/image/seeMore.svg"
import SeeMoreFocus from "@/public/image/seeMoreFocus.svg"

type IconVariant = "back" | "more"

type IconButtonProps = {
    variant: IconVariant
    // Avec href → c'est un LIEN (ex : retour vers /projects)
    // Sans href → c'est un BOUTON, et onClick dit ce qu'il fait (ex : ouvrir un menu)
    href?: string
    onClick?: () => void
    // Ce que lit un lecteur d'écran (le bouton n'a pas de texte visible).
    // Si tu ne le donnes pas, on prend le texte par défaut de la variante.
    label?: string
}

// Pour chaque variante : l'icône normale, l'icône au survol/focus, et le texte par défaut.
// Grâce au Record, TypeScript signale une erreur si tu ajoutes une variante incomplète.
const variants: Record<IconVariant, { icon: StaticImageData; iconFocus: StaticImageData; label: string }> = {
    back: { icon: ArrowBack, iconFocus: ArrowBackFocus, label: "Retour" },
    more: { icon: SeeMore, iconFocus: SeeMoreFocus, label: "Plus d'options" },
}

export default function IconButton({ variant, href, onClick, label }: IconButtonProps) {
    const { icon, iconFocus, label: defaultLabel } = variants[variant]

    // "group" : les icônes à l'intérieur réagissent au survol / focus du bouton
    const className =
        "group flex size-[57px] cursor-pointer items-center justify-center rounded-[10px] bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"

    // Les deux icônes empilées, comme dans MenuItems :
    // la normale s'efface et l'icône "focus" apparaît au survol ou au clavier
    const icons = (
        <span className="relative block">
            {/* alt="" : l'image est décorative, c'est aria-label qui donne le nom */}
            <Image
                src={icon}
                alt=""
                className="block transition-opacity duration-300 ease-out group-hover:opacity-0 group-focus-visible:opacity-0"
            />
            <Image
                src={iconFocus}
                alt=""
                className="absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
            />
        </span>
    )

    if (href) {
        return (
            <Link href={href} aria-label={label ?? defaultLabel} className={className}>
                {icons}
            </Link>
        )
    }

    return (
        <button type="button" onClick={onClick} aria-label={label ?? defaultLabel} className={className}>
            {icons}
        </button>
    )
}