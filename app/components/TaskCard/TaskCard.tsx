import Image from "next/image"
import Tag from "@/app/components/Tag/Tag"
import UpdateTaskButton from "@/app/components/UpdateTaskButton/UpdateTaskButton"
import { TASK_STATUS_LABELS, TASK_STATUS_VARIANTS, formatShortDate } from "@/app/lib/utils"
import type { AssignedTask } from "@/app/lib/types"
import FolderIconGrey from "@/public/image/folderIconGrey.svg"
import CalendarIconGrey from "@/public/image/calendarIconGrey.svg"
import CommentIcon from "@/public/image/commentIcon.svg"

type TaskCardProps = {
    task: AssignedTask
    // "list": info on the left, status + button on the right (List view)
    // "kanban": everything stacked, the button at the bottom (Kanban view, narrower card)
    layout?: "list" | "kanban"
}

export default function TaskCard({ task, layout = "list" }: TaskCardProps) {
    // The pieces shared by both layouts, stored in variables
    // so we don't write them twice
    const statusTag = (
        <Tag label={TASK_STATUS_LABELS[task.status]} variant={TASK_STATUS_VARIANTS[task.status]} />
    )

    const title = <h5 >{task.title}</h5>

    const description = task.description && (
        <p className="mt-1 text-sm text-grey-600">{task.description}</p>
    )

    // Project | due date | number of comments — always on ONE line.
    // If the card is too narrow (Kanban view), the project name is cut off with "…"
    // (min-w-0 + truncate), and the full name is shown on hover (title).
    const infos = (
        <ul className="mt-8 flex items-center gap-3 text-xs whitespace-nowrap text-grey-600">
            <li className="flex min-w-0 items-center gap-2" title={task.project.name}>
                <Image src={FolderIconGrey} alt="" width={18} height={14} className="shrink-0" />
                <span className="truncate">{task.project.name}</span>
            </li>
            <li aria-hidden="true">|</li>
            <li className="flex shrink-0 items-center gap-2">
                <Image src={CalendarIconGrey} alt="" width={15} height={17} />
                {/* <time>: a date readable by machines (dateTime) and by humans */}
                {task.dueDate ? (
                    <time dateTime={task.dueDate}>{formatShortDate(task.dueDate)}</time>
                ) : (
                    formatShortDate(null)
                )}
            </li>
            <li aria-hidden="true">|</li>
            <li className="flex shrink-0 items-center gap-2">
                <Image src={CommentIcon} alt="" width={15} height={15} />
                {task.comments.length}
                {/* The number alone means nothing to a screen reader */}
                <span className="sr-only">commentaire(s)</span>
            </li>
        </ul>
    )

    // "Voir" opens the edit modal (button + modal in UpdateTaskButton)
    const seeButton = <UpdateTaskButton task={task} />

    // Kanban view: title + status on the same line, then the rest stacked
    if (layout === "kanban") {
        return (
            <article className="rounded-[10px] border border-grey-200 bg-white px-10 py-6">
                <div className="flex items-start justify-between gap-4">
                    {title}
                    {/* shrink-0: the status never gets squashed by a long title */}
                    <div className="shrink-0">{statusTag}</div>
                </div>
                {description}
                {infos}
                <div className="mt-8 flex">{seeButton}</div>
            </article>
        )
    }

    // List view: two columns
    return (
        // <article>: a block that makes sense on its own (a task)
        <article className="flex justify-between gap-6 rounded-[10px] border border-grey-200 bg-white px-10 py-6">
            {/* Left column: title, description, info */}
            <div className="pt-2.5">
                {title}
                {description}
                {infos}
            </div>

            {/* Right column: status at the top, button at the bottom */}
            <div className="flex shrink-0 flex-col items-end justify-between gap-6">
                {statusTag}
                {seeButton}
            </div>
        </article>
    )
}