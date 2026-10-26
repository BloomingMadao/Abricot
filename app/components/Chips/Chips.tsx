import Image, { type StaticImageData } from "next/image"
import TasksIcon from "@/public/image/taskIcon.svg"
import KanbanIcon from "@/public/image/kanbanIcon.svg"
import FolderIcon from "@/public/image/folderIcon.svg"

type TypeVariant = "tasks" | "kanban" | "projects"

type ChipsProps = {
    label: string
    type: TypeVariant
    // true = chip sélectionnée (fond orange clair)
    isActive?: boolean
    // Ce qui se passe au clic (ex : changer de vue Liste / Kanban)
    onClick?: () => void
}

// Une icône par type. Grâce au Record, TypeScript signale une erreur
// si tu ajoutes un type sans lui donner d'icône.
const icons: Record<TypeVariant, StaticImageData> = {
    tasks: TasksIcon,
    kanban: KanbanIcon,
    projects: FolderIcon,
}

export default function Chips({ label, type, isActive = false, onClick }: ChipsProps) {
    return (
        // aria-pressed : indique aux lecteurs d'écran si la chip est sélectionnée,
        // et sert AUSSI à Tailwind pour le style actif (aria-pressed:)
        <button
            type="button"
            onClick={onClick}
            aria-pressed={isActive}
            className="flex cursor-pointer items-center gap-3 rounded-md bg-white px-4 py-3 text-sm text-brand-dark transition-colors duration-300 ease-out hover:bg-brand-light aria-pressed:bg-brand-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"
        >
            {/* alt="" : l'icône est décorative, le texte suffit */}
            <Image src={icons[type]} alt="" width={18} height={18} />
            {label}
        </button>
    )
}