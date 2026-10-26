"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import DashboardIcon from "@/public/image/dashboardIcon.svg"
import DashboardIconHover from "@/public/image/dashboardIconHover.svg"
import FolderIcon from "@/public/image/folderIcon.svg"
import FolderIconHover from "@/public/image/folderIconHover.svg"

type IconVariant = "dashboard" | "folder"

type MenuItemsProps = {
  label: string
  icon?: IconVariant
  href: string
}

export default function MenuItems({ label, icon, href }: MenuItemsProps) {
  const isDashboard = icon === "dashboard"
  const iconSrc = isDashboard ? DashboardIcon : FolderIcon
  const iconHoverSrc = isDashboard ? DashboardIconHover : FolderIconHover

  // L'URL actuelle, par exemple "/projects/123"
  const pathname = usePathname()

  // Le lien est actif si on est sur sa page OU sur une de ses sous-pages
  // (sur /projects/123, "Projets" reste actif).
  // href !== "" : évite que les liens de test de /debug soient toujours actifs.
  const isActive =
    href !== "" && (pathname === href || pathname.startsWith(`${href}/`))

  return (
    // "group" : permet aux éléments à l'intérieur de réagir au lien (survol, page active)
    // aria-current="page" : indique la page actuelle aux lecteurs d'écran,
    // et sert AUSSI à Tailwind pour appliquer le style actif (aria-[current=page]:)
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className="group flex w-[248px] items-center justify-center gap-4 rounded-[10px] px-4 py-[27px] text-brand-dark transition-colors duration-300 ease-out hover:bg-grey-950 hover:text-white aria-[current=page]:bg-grey-950 aria-[current=page]:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"
    >
      {/* Cadre de 24x24 px dans lequel les deux icônes sont empilées */}
      <span className="relative size-6 shrink-0">
        {/* Icône normale : s'efface au survol ou sur la page active */}
        <Image
          src={iconSrc}
          alt=""
          width={24}
          height={24}
          className="absolute inset-0 transition-opacity duration-300 ease-out group-hover:opacity-0 group-aria-[current=page]:opacity-0"
        />

        {/* Icône blanche : apparaît au survol ou sur la page active */}
        <Image
          src={iconHoverSrc}
          alt=""
          width={24}
          height={24}
          className="absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-aria-[current=page]:opacity-100"
        />
      </span>

      <p>{label}</p>
    </Link>
  )
}