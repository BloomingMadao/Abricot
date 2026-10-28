"use client"

import { useEffect, useId, useRef, type ReactNode } from "react"

type ModalProps = {
    title: string
    isOpen: boolean
    // Appelée pour fermer : croix, touche Échap ou clic sur le fond gris
    onClose: () => void
    children: ReactNode
}

// Modale "générique" : elle ne sait rien du formulaire qu'elle contient.
// Elle repose sur la balise HTML <dialog>, qui gère déjà pour nous :
// - la touche Échap,
// - le focus qui reste DANS la modale quand on navigue avec Tab,
// - le reste de la page qui devient inutilisable tant qu'elle est ouverte,
// - le retour du focus sur le bouton d'ouverture quand on la ferme.
export default function Modal({ title, isOpen, onClose, children }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    // Identifiant unique pour relier la modale à son titre (aria-labelledby)
    const titleId = useId()

    // React dit "ouverte / fermée" (isOpen), le navigateur exécute :
    // showModal() affiche la modale par-dessus la page, close() la ferme
    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (isOpen && !dialog.open) dialog.showModal()
        if (!isOpen && dialog.open) dialog.close()
    }, [isOpen])

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            // onClose : le navigateur a fermé la modale (touche Échap) → on prévient React
            onClose={onClose}
            // Clic sur le fond gris : la cible est le <dialog> lui-même, pas son contenu
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose()
            }}
            // m-auto : centre la modale (le reset de Tailwind enlève le centrage du navigateur)
            // backdrop: : style du fond gris derrière la modale
            className="m-auto w-[600px] max-w-[calc(100%-2rem)] rounded-[10px] bg-white p-0 backdrop:bg-black/50"
        >
            {/* Marges intérieures et tailles reprises de la maquette Figma */}
            <div className="relative px-[73px] pt-[76px] pb-[74px]">
                <h2 id={titleId} className="text-2xl font-semibold text-grey-800">
                    {title}
                </h2>

                {/* Croix fine de la maquette, dessinée en SVG :
                    currentColor = elle prend la couleur du texte (et change au survol) */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer"
                    className="absolute top-9 right-10 cursor-pointer text-grey-600 transition-colors hover:text-grey-950"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>

                {/* Le contenu n'existe que quand la modale est ouverte :
                    à chaque ouverture, le formulaire repart de zéro (champs vides, pas d'ancienne erreur) */}
                {isOpen && <div className="mt-9">{children}</div>}
            </div>
        </dialog>
    )
}