import Image, { type StaticImageData } from "next/image"
import Link from "next/link"
import ArrowBack from "@/public/image/arrowBack.svg"
import ArrowBackFocus from "@/public/image/arrowBackFocus.svg"
import SeeMore from "@/public/image/seeMore.svg"
import SeeMoreFocus from "@/public/image/seeMoreFocus.svg"

type IconVariant = "back" | "more" | "previous" | "next"

type IconButtonProps = {
    variant: IconVariant
    // With href → it's a LINK (e.g. back to /projects)
    // Without href → it's a BUTTON, and onClick says what it does (e.g. open a menu)
    href?: string
    onClick?: () => void
    // What a screen reader reads out (the button has no visible text).
    // If you don't provide it, the variant's default text is used.
    label?: string
    // For a button that opens a menu: true = menu open (aria-expanded)
    expanded?: boolean
}

// For each variant: the normal icon, the hover/focus icon, and the default text.
// flip: the icon is turned around (the "next" arrow is the "back" arrow, pointing right).
// Thanks to the Record, TypeScript reports an error if you add an incomplete variant.
const variants: Record<
    IconVariant,
    { icon: StaticImageData; iconFocus: StaticImageData; label: string; flip?: boolean }
> = {
    back: { icon: ArrowBack, iconFocus: ArrowBackFocus, label: "Retour" },
    more: { icon: SeeMore, iconFocus: SeeMoreFocus, label: "Plus d'options" },
    // Previous / next (e.g. the months of the calendar)
    previous: { icon: ArrowBack, iconFocus: ArrowBackFocus, label: "Précédent" },
    next: { icon: ArrowBack, iconFocus: ArrowBackFocus, label: "Suivant", flip: true },
}

export default function IconButton({ variant, href, onClick, label, expanded }: IconButtonProps) {
    const { icon, iconFocus, label: defaultLabel, flip } = variants[variant]

    // "group": the icons inside react to the button's hover / focus
    // border border-grey-200: the light grey outline from the mockup (visible on a white background too)
    // shrink-0: the button keeps its 57px even when space is tight
    const className =
        "group flex size-[57px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-grey-200 bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"

    // The two stacked icons, as in MenuItems:
    // the normal one fades out and the "focus" icon appears on hover or with the keyboard.
    // rotate-180: turns the arrow around for the "next" variant
    const icons = (
        <span className={`relative block ${flip ? "rotate-180" : ""}`}>
            {/* alt="": the image is decorative, aria-label provides the name */}
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
        <button type="button" onClick={onClick} aria-label={label ?? defaultLabel} aria-expanded={expanded} className={className}>
            {icons}
        </button>
    )
}