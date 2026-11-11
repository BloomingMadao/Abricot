"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { logout } from "@/app/lib/actions";
import Button from "@/app/components/Button/Button";
import useDismiss from "@/app/hooks/useDismiss";

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
  // (shared with TaskMenu and MobileNav, see app/hooks/useDismiss.ts)
  useDismiss(menuRef, isOpen, setIsOpen);

  // Base colors of the icon: dark on the profile page, light elsewhere.
  // We PICK one or the other (we don't apply both at once):
  // with two bg- classes in the same className, there's no telling which one wins.
  const colorClasses = isProfilePage
    ? "bg-brand-dark text-white"
    : "bg-brand-light text-black";

  return (
    // "relative": the submenu (in "absolute") is positioned relative to this block
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Mon compte"
        aria-expanded={isOpen}
        aria-controls="user-menu"
        // size-11 (44px) on a phone, the mockup's 65px from md.
        // bg-brand-dark: the same color as before (var(--brand-color-dark)), with the theme's class
        className={`flex size-11 cursor-pointer items-center justify-center rounded-full font-sans transition-colors duration-300 ease-out hover:bg-brand-dark hover:text-white aria-expanded:bg-brand-dark aria-expanded:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark md:size-[65px] ${colorClasses}`}
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
            // .link: the shared link style (globals.css)
            className="link self-center px-4 py-3"
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