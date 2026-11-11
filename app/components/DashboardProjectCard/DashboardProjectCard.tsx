import Link from "next/link"
import Tag from "@/app/components/Tag/Tag"
import {
    PRIORITY_LABELS,
    PRIORITY_VARIANTS,
    TASK_STATUS_LABELS,
    TASK_STATUS_VARIANTS,
    formatShortDate,
    type ProjectWithMyTasks,
} from "@/app/lib/utils"

// Beyond that, "+ N autres tâches" (the full list is on the project page)
const MAX_VISIBLE_TASKS = 3

// A project of the dashboard's "Projets" view (no mockup: the style of the other cards).
// Its most urgent priority, the user's tasks in it and the next due date.
// Like ProjectCard, the whole card is clickable but the link is the title.
export default function DashboardProjectCard({ project, tasks }: ProjectWithMyTasks) {
    // The tasks are sorted by projectsByUrgency (utils.ts): the 1st one is the most urgent
    const openTasks = tasks.filter((task) => task.status !== "DONE")
    const mostUrgent = openTasks[0]
    // The closest due date among the tasks still to do
    const nextDueDate = openTasks
        .map((task) => task.dueDate)
        .filter((date) => date !== null)
        .sort()[0]
    const visibleTasks = tasks.slice(0, MAX_VISIBLE_TASKS)
    const hiddenCount = tasks.length - visibleTasks.length

    return (
        // relative: for the title's stretched link (after:absolute after:inset-0)
        // has-[:focus-visible]: card outline when the link is reached with the keyboard
        <article className="relative rounded-[10px] border border-grey-200 bg-white px-5 py-6 transition-shadow duration-300 hover:shadow-md has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-dark md:px-10">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                    {/* h3: under the "Mes projets" h2 of the view. Class h5: the look of the other cards.
                        ?from=dashboard: the project page's "back" button returns here */}
                    <h3 className="h5">
                        <Link
                            href={`/projects/${project.id}?from=dashboard`}
                            className="outline-none after:absolute after:inset-0"
                        >
                            {project.name}
                        </Link>
                    </h3>
                    {project.description && (
                        <p className="mt-1 text-sm text-grey-600">{project.description}</p>
                    )}
                </div>
                {/* The priority of the most urgent task still to do (none if everything is done) */}
                {mostUrgent ? (
                    <Tag
                        label={
                            <>
                                <span className="sr-only">Priorité la plus haute : </span>
                                {PRIORITY_LABELS[mostUrgent.priority]}
                            </>
                        }
                        variant={PRIORITY_VARIANTS[mostUrgent.priority]}
                        className="shrink-0 text-sm"
                    />
                ) : (
                    <Tag label="Tout est terminé" variant="success" className="shrink-0 text-sm" />
                )}
            </div>

            <p className="mt-6 text-xs text-grey-600">
                {tasks.length} tâche{tasks.length > 1 ? "s" : ""} assignée{tasks.length > 1 ? "s" : ""}
                {nextDueDate && (
                    <>
                        {" "}· prochaine échéance : <time dateTime={nextDueDate} className="text-grey-800">{formatShortDate(nextDueDate)}</time>
                    </>
                )}
            </p>

            {/* The user's tasks in the project: title + status, the most urgent first */}
            <ul className="mt-4 flex flex-col divide-y divide-grey-100 text-sm">
                {visibleTasks.map((task) => (
                    <li key={task.id} className="flex items-center justify-between gap-3 py-2">
                        <span className="min-w-0 truncate" title={task.title}>{task.title}</span>
                        <Tag
                            label={TASK_STATUS_LABELS[task.status]}
                            variant={TASK_STATUS_VARIANTS[task.status]}
                            className="shrink-0 text-xs"
                        />
                    </li>
                ))}
            </ul>
            {hiddenCount > 0 && (
                <p className="mt-2 text-xs text-grey-600">
                    + {hiddenCount} autre{hiddenCount > 1 ? "s" : ""} tâche{hiddenCount > 1 ? "s" : ""}
                </p>
            )}
        </article>
    )
}