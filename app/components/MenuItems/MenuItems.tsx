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
  // Optional: what happens on click (e.g. closing the phone menu, see MobileNav)
  onClick?: () => void
}

export default function MenuItems({ label, icon, href, onClick }: MenuItemsProps) {
  const isDashboard = icon === "dashboard"
  const iconSrc = isDashboard ? DashboardIcon : FolderIcon
  const iconHoverSrc = isDashboard ? DashboardIconHover : FolderIconHover

  // The current URL, for example "/projects/123"
  const pathname = usePathname()

  // The link is active if we're on its page OR on one of its sub-pages
  // (on /projects/123, "Projets" stays active).
  // href !== "": prevents the test links in /debug from always being active.
  const isActive =
    href !== "" && (pathname === href || pathname.startsWith(`${href}/`))

  return (
    // "group": lets the elements inside react to the link (hover, active page)
    // aria-current="page": tells screen readers which page is the current one,
    // and is ALSO used by Tailwind to apply the active style (aria-[current=page]:)
    // Responsive (mobile first): in the phone menu (MobileNav), a compact row aligned on the left (p-3);
    // in the header from md, centered with the mockup's height (27px above and below);
    // from lg, the mockup's width (248px)
    <Link
      href={href}
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className="group flex items-center justify-start gap-4 rounded-[10px] p-3 text-brand-dark transition-colors duration-300 ease-out hover:bg-grey-950 hover:text-white aria-[current=page]:bg-grey-950 aria-[current=page]:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark md:justify-center md:px-4 md:py-[27px] lg:w-[248px]"
    >
      {/* 24x24 px frame in which the two icons are stacked */}
      <span className="relative size-6 shrink-0">
        {/* Normal icon: fades out on hover or on the active page */}
        <Image
          src={iconSrc}
          alt=""
          width={24}
          className="absolute inset-0 transition-opacity duration-300 ease-out group-hover:opacity-0 group-aria-[current=page]:opacity-0"
        />

        {/* White icon: appears on hover or on the active page */}
        <Image
          src={iconHoverSrc}
          alt=""
          width={24}
          className="absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-aria-[current=page]:opacity-100"
        />
      </span>

      <p>{label}</p>
    </Link>
  )
}