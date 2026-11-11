import Image from "next/image"
import Tag from "@/app/components/Tag/Tag"
import UserAvatar from "@/app/components/UserAvatar/UserAvatar"
import TaskMenu from "@/app/components/TaskMenu/TaskMenu"
import TaskComments from "@/app/components/TaskComments/TaskComments"
import { TASK_STATUS_LABELS, TASK_STATUS_VARIANTS, editTaskError, formatShortDate } from "@/app/lib/utils"
import type { TaskDetail, UserSummary } from "@/app/lib/types"
import CalendarIconGrey from "@/public/image/calendarIconGrey.svg"

type ProjectTaskCardProps = {
    task: TaskDetail
    // The project members (owner included): for the "Modifier" modal in the "…" menu
    members: UserSummary[]
    // The logged-in user: for the "Ajouter un commentaire" form
    currentUser: UserSummary
    // Is the logged-in user the project owner? (they can edit every task)
    isOwner: boolean
}

// A task on a project page: title + status, description, due date,
// assignees, "…" menu and comments.
// No need for "use client" anymore: what changes lives in TaskMenu and TaskComments (client components).
export default function ProjectTaskCard({ task, members, currentUser, isOwner }: ProjectTaskCardProps) {
    // The ids of the people assigned to the task: for the "Modifier" right
    const assigneeIds = task.assignees.map(({ user }) => user.id)

    // A task assigned to the logged-in user is highlighted with a brand-dark (orange) border
    const isMine = assigneeIds.includes(currentUser.id)

    return (
        // Responsive: 20px on the sides on a phone, the mockup's padding from md (768px)
        <article
            className={`rounded-[10px] border bg-white px-5 pt-6 pb-[23px] md:pr-[34px] md:pl-10 ${
                isMine ? "border-brand-dark" : "border-grey-200"
            }`}
        >
            <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                    {/* Title + status on the same line */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* h3: under the "Tâches" h2 of the section. Class h5: the same look as before */}
                        <h3 className="h5">{task.title}</h3>
                        <Tag
                            label={TASK_STATUS_LABELS[task.status]}
                            variant={TASK_STATUS_VARIANTS[task.status]}
                            className="text-sm"
                        />
                    </div>

                    {task.description && (
                        <p className="mt-1 text-sm text-grey-600">{task.description}</p>
                    )}

                    {/* Due date: grey label, dark date.
                        whitespace-nowrap: "Échéance :" and the date stay on one line on a narrow phone */}
                    <p className="mt-[27px] flex items-center gap-2 text-xs whitespace-nowrap text-grey-600">
                        Échéance :
                        <Image src={CalendarIconGrey} alt="" width={15} />
                        {task.dueDate ? (
                            // <time>: a date readable by machines (dateTime) and by humans
                            <time dateTime={task.dueDate} className="text-grey-800">
                                {formatShortDate(task.dueDate)}
                            </time>
                        ) : (
                            <span className="text-grey-800">{formatShortDate(null)}</span>
                        )}
                    </p>

                    {/* Assigned to: avatar + name for each person.
                        flex-wrap: on a phone, the names go below "Assigné à :" when there's no room */}
                    <div className="mt-6 flex flex-wrap items-center gap-2.5 text-xs text-grey-600">
                        Assigné à :
                        {task.assignees.length === 0 ? (
                            <span className="text-grey-800">personne</span>
                        ) : (
                            // text-sm: the same font size for the initials and the names
                            <ul className="flex flex-wrap items-center gap-[9px] text-sm">
                                {task.assignees.map(({ user }) => (
                                    <li key={user.id} className="flex items-center gap-[5px]">
                                        {/* decorative: the name is already written in the label.
                                            "brand" (orange) for the logged-in user, as in the comments */}
                                        <UserAvatar
                                            user={user}
                                            variant={user.id === currentUser.id ? "brand" : "grey"}
                                            decorative
                                        />
                                        <Tag label={user.name || user.email} variant="grey" />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* "…": the Modifier | Supprimer menu, for everyone.
                    "Modifier": only the project owner and the people assigned to the task
                    (see editTaskError in utils.ts), the others get this message in a red alert
                    (null = allowed). "Supprimer": any project member (specifications) */}
                <TaskMenu
                    task={task}
                    members={members}
                    editForbiddenMessage={editTaskError(assigneeIds, currentUser.id, isOwner)}
                />
            </div>

            {/* Separator, then the comments (collapsed at first) */}
            <div className="mt-[18px] border-t border-grey-100 pt-[22px]">
                <TaskComments task={task} currentUser={currentUser} />
            </div>
        </article>
    )
}