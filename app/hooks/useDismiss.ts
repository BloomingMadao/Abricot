import { useEffect, type RefObject } from "react"

/** Closes a menu when the user clicks outside it or presses Escape.
 *  ref: the block containing the button AND the menu (a click inside doesn't close it)
 *  isOpen: the listeners only exist while the menu is open
 *  setIsOpen: the menu's state setter (React keeps it the same between renders)
 *  Used by UserMenu, TaskMenu and MobileNav: before, the same code was copied in each menu. */
export default function useDismiss(
    ref: RefObject<HTMLElement | null>,
    isOpen: boolean,
    setIsOpen: (isOpen: boolean) => void
) {
    useEffect(() => {
        if (!isOpen) return

        function handleClickOutside(event: PointerEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setIsOpen(false)
        }

        document.addEventListener("pointerdown", handleClickOutside)
        document.addEventListener("keydown", handleEscape)

        // Cleanup: remove the listeners when the menu closes
        return () => {
            document.removeEventListener("pointerdown", handleClickOutside)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [ref, isOpen, setIsOpen])
}