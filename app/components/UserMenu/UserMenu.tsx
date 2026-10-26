"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/lib/actions";
import Button from "@/app/components/Button/Button";

export default function UserMenu({ initials }: { initials: string }) {
  // true = sous-menu ouvert, false = fermé
  const [isOpen, setIsOpen] = useState(false);

  // Référence vers le bloc qui contient le bouton ET le sous-menu,
  // pour savoir si un clic a eu lieu dedans ou en dehors
  const menuRef = useRef<HTMLDivElement>(null);

  // Comme dans MenuItems : est-ce qu'on est sur la page profil (ou une sous-page) ?
  const pathname = usePathname();
  const isProfilePage = pathname === "/profile" || pathname.startsWith("/profile/");

  // Quand le menu est ouvert : on le ferme si on clique ailleurs ou si on appuie sur Échap
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

    // Nettoyage : on retire les écouteurs quand le menu se ferme
    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Couleurs de base de l'icône : foncée sur la page profil, claire ailleurs.
  // On CHOISIT l'une ou l'autre (on ne met pas les deux à la fois) :
  // avec deux classes bg- dans le même className, on ne sait pas laquelle gagne.
  const colorClasses = isProfilePage
    ? "bg-(--brand-color-dark) text-white"
    : "bg-(--brand-color-light) text-black";

  return (
    // "relative" : le sous-menu (en "absolute") se place par rapport à ce bloc
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
          {/* On ferme le menu au clic : le Header reste affiché quand on change de page */}
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            aria-current={isProfilePage ? "page" : undefined}
            className="self-center px-4 py-3 text-brand-dark underline underline-offset-4 hover:text-black"
          >
            Mon profil
          </Link>

          {/* La déconnexion passe par la Server Action logout (supprime le cookie puis redirige) */}
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