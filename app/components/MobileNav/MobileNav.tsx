"use client"

import Image from "next/image"
import { useId, useRef, useState } from "react"
import MenuItems from "@/app/components/MenuItems/MenuItems"
import useDismiss from "@/app/hooks/useDismiss"
import Logo from "@/public/image/logo.svg"
import DropdownIcon from "@/public/image/dropdown.svg"

// The header's navigation on a PHONE (below md, 768px; see Header):
// the logo is a button that opens a dropdown menu with "Tableau de bord" and "Projets".
// From md, Header shows the logo (a link) and the two links directly, as in the mockup.
// Same open / close logic as UserMenu (useDismiss: click outside or Escape).
export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false)
    // The block containing the button AND the menu: a click inside doesn't close it
    const menuRef = useRef<HTMLDivElement>(null)
    // Unique id: links the button to the menu it opens (aria-controls)
    const menuId = useId()

    useDismiss(menuRef, isOpen, setIsOpen)

    return (
        // relative: the menu (in "absolute") opens right below the logo
        <div ref={menuRef} className="relative">
            {/* aria-expanded: a screen reader announces "menu open / closed".
                The images are decorative (alt=""): the hidden text gives the button its name */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-controls={menuId}
                className="flex cursor-pointer items-center gap-2 rounded-[10px] py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"
            >
                <Image src={Logo} alt="" width={96} loading="eager" className="h-auto w-24" />
                {/* The arrow turns over when the menu is open (rotate-180) */}
                <Image
                    src={DropdownIcon}
                    alt=""
                    width={12}
                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
                <span className="sr-only">Abricot, menu de navigation</span>
            </button>

            {/* The two links: the same MenuItems as in the header from md
                (orange icon and text, black background on the current page).
                onClick: the menu closes when a link is chosen */}
            {isOpen && (
                <nav
                    id={menuId}
                    aria-label="Navigation principale"
                    className="absolute top-full left-0 z-50 mt-2 flex w-60 flex-col gap-1 rounded-[10px] border border-grey-200 bg-white p-2 shadow-lg"
                >
                    <MenuItems label="Tableau de bord" icon="dashboard" href="/dashboard" onClick={() => setIsOpen(false)} />
                    <MenuItems label="Projets" icon="folder" href="/projects" onClick={() => setIsOpen(false)} />
                </nav>
            )}
        </div>
    )
}