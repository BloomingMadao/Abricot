"use client"

import { useEffect, useId, useRef, type ReactNode } from "react"

type ModalProps = {
    title: string
    // Optional icon displayed before the title (e.g. the star of the AI modal)
    icon?: ReactNode
    isOpen: boolean
    // Called to close: cross, Escape key or click on the grey backdrop
    onClose: () => void
    children: ReactNode
    // Replaces the default padding of the content (the one of the form modals),
    // e.g. "px-6 pt-14 md:px-[52px] md:pt-20" for the AI modal, which has its own spacing
    className?: string
}

// "Generic" modal: it knows nothing about the form it contains.
// It relies on the HTML <dialog> tag, which already handles for us:
// - the Escape key,
// - focus staying INSIDE the modal when navigating with Tab,
// - the rest of the page becoming unusable while it's open,
// - focus returning to the opening button when it closes.
export default function Modal({ title, icon, isOpen, onClose, children, className }: ModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    // Unique id to link the modal to its title (aria-labelledby)
    const titleId = useId()

    // React says "open / closed" (isOpen), the browser carries it out:
    // showModal() shows the modal on top of the page, close() closes it
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
            // onClose: the browser closed the modal (Escape key) → we notify React
            onClose={onClose}
            // Click on the grey backdrop: the target is the <dialog> itself, not its content
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose()
            }}
            // m-auto: centers the modal (Tailwind's reset removes the browser's centering)
            // backdrop:: style of the grey backdrop behind the modal
            className="m-auto w-[600px] max-w-[calc(100%-2rem)] rounded-[10px] bg-white p-0 backdrop:bg-black/50"
        >
            {/* Padding and sizes taken from the Figma mockup from md (768px), unless className gives others.
                On a phone: 24px on the sides (73px would leave about 200px for the form) */}
            <div className={`relative ${className ?? "px-6 pt-14 pb-10 md:px-[73px] md:pt-[76px] md:pb-[74px]"}`}>
                {/* flex items-center: the icon (if any) and the title on the same line */}
                <h2 id={titleId} className="flex items-center gap-2.5 text-2xl font-semibold text-grey-800">
                    {icon}
                    {title}
                </h2>

                {/* Thin cross from the mockup, drawn in SVG:
                    currentColor = it takes the text color (and changes on hover) */}
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fermer"
                    // focus-visible: the outline of the app's other buttons, when reached with the keyboard.
                    // Closer to the corner on a phone
                    className="absolute top-5 right-5 cursor-pointer text-grey-600 transition-colors hover:text-grey-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark md:top-9 md:right-10"
                >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>

                {/* The content only exists while the modal is open:
                    each time it opens, the form starts fresh (empty fields, no old error) */}
                {isOpen && <div className="mt-9">{children}</div>}
            </div>
        </dialog>
    )
}