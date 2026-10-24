import Image from "next/image"
import Link from "next/link"
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

  return (
    // "group" : permet aux éléments à l'intérieur de réagir au survol du lien
    <Link
      href={href}
      className="group flex w-[248px] items-center justify-center gap-4 rounded-[10px] px-4 py-[27px] text-brand-dark transition-colors duration-300 ease-out hover:bg-grey-950 hover:text-white"
    >
      {/* Cadre de 24x24 px dans lequel les deux icônes sont empilées */}
      <span className="relative size-6 shrink-0">
        {/* Icône normale : s'efface au survol du lien */}
        <Image
          src={iconSrc}
          alt=""
          width={24}
          height={24}
          className="absolute inset-0 transition-opacity duration-300 ease-out group-hover:opacity-0"
        />

        {/* Icône de survol : invisible par défaut, apparaît au survol du lien */}
        <Image
          src={iconHoverSrc}
          alt=""
          width={24}
          height={24}
          className="absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
        />
      </span>

      <p>{label}</p>
    </Link>
  )
}
