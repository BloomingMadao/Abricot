import Image, { type StaticImageData } from "next/image"
import TasksIcon from "@/public/image/taskIcon.svg"
import KanbanIcon from "@/public/image/kanbanIcon.svg"
import FolderIcon from "@/public/image/folderIcon.svg"
import CalendarIconOrange from "@/public/image/calendarIconOrange.svg"

type TypeVariant = "tasks" | "kanban" | "projects" | "calendar"

type ChipsProps = {
    label: string
    type: TypeVariant
    // true = selected chip (light orange background)
    isActive?: boolean
    // What happens on click (e.g. switching between List / Kanban view)
    onClick?: () => void
}

// One icon per type. Thanks to the Record, TypeScript reports an error
// if you add a type without giving it an icon.
const icons: Record<TypeVariant, StaticImageData> = {
    tasks: TasksIcon,
    kanban: KanbanIcon,
    projects: FolderIcon,
    calendar: CalendarIconOrange,
}

export default function Chips({ label, type, isActive = false, onClick }: ChipsProps) {
    return (
        // aria-pressed: tells screen readers whether the chip is selected,
        // and is ALSO used by Tailwind for the active style (aria-pressed:)
        <button
            type="button"
            onClick={onClick}
            aria-pressed={isActive}
            className="flex cursor-pointer items-center gap-3 rounded-md bg-white px-4 py-3 text-sm text-brand-dark transition-colors duration-300 ease-out hover:bg-brand-light aria-pressed:bg-brand-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark"
        >
            {/* alt="": the icon is decorative, the text is enough */}
            <Image src={icons[type]} alt="" width={18} />
            {label}
        </button>
    )
}