"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/lib/actions";
import Button from "@/app/components/Button/Button";

export default function UserMenu({ initials }: { initials: string }) {
  // true = submenu open, false = closed
  const [isOpen, setIsOpen] = useState(false);

  // Reference to the block containing the button AND the submenu,
  // to know whether a click happened inside or outside
  const menuRef = useRef<HTMLDivElement>(null);

  // As in MenuItems: are we on the profile page (or a sub-page)?
  const pathname = usePathname();
  const isProfilePage = pathname === "/profile" || pathname.startsWith("/profile/");

  // When the menu is open: close it if the user clicks elsewhere or presses Escape
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    // Cleanup: remove the listeners when the menu closes
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Base colors of the icon: dark on the profile page, light elsewhere.
  // We PICK one or the other (we don't apply both at once):
  // with two bg- classes in the same className, there's no telling which one wins.
  const colorClasses = isProfilePage
    ? "bg-(--brand-color-dark) text-white"
    : "bg-(--brand-color-light) text-black";

  return (
    // "relative": the submenu (in "absolute") is positioned relative to this block
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Mon compte"
        aria-expanded={isOpen}
        aria-controls="user-menu"
        className={`flex cursor-pointer items-center justify-center size-[65px] rounded-full font-(--font-sans) transition-colors duration-300 ease-out hover:text-white hover:bg-(--brand-color-dark) aria-expanded:text-white aria-expanded:bg-(--brand-color-dark) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark ${colorClasses}`}
      >
        {initials}
      </button>

      {isOpen && (
        <div
          id="user-menu"
          className="absolute right-0 top-full z-50 mt-2 flex w-auto flex-col overflow-hidden rounded-[10px] border border-grey-200 bg-white py-2 shadow-lg"
        >
          {/* Close the menu on click: the Header stays displayed when changing page */}
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            aria-current={isProfilePage ? "page" : undefined}
            className="self-center px-4 py-3 text-brand-dark underline underline-offset-4 hover:text-black"
          >
            Mon profil
          </Link>

          {/* Logging out goes through the logout Server Action (deletes the cookie then redirects) */}
          <form action={logout}>
            <Button
                label="Déconnexion"
                variant="secondary"
                type="submit"
            />
          </form>
        </div>
      )}
    </div>
  );
}