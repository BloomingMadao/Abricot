"use client"

import { useState } from "react"
import Chips from "@/app/components/Chips/Chips"
import Input from "@/app/components/Input/Input"
import ProjectTaskCard from "@/app/components/ProjectTaskCard/ProjectTaskCard"
import TaskCalendar from "@/app/components/TaskCalendar/TaskCalendar"
import { TASK_STATUS_LABELS } from "@/app/lib/utils"
import type { TaskDetail, TaskStatus, UserSummary } from "@/app/lib/types"
import SearchIcon from "@/public/image/searchIcon.svg"
import DropdownIcon from "@/public/image/dropdown.svg"

// The "Statut" filter options. value "" = no filter (all tasks)
const STATUS_OPTIONS = [
    { value: "", label: "Statut" },
    ...(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map((status) => ({
        value: status,
        label: TASK_STATUS_LABELS[status],
    })),
]

type ProjectTasksProps = {
    // The project's tasks, already sorted by priority
    tasks: TaskDetail[]
    // The project members (owner included): to edit a task
    members: UserSummary[]
    // The logged-in user: to add a comment
    currentUser: UserSummary
    // Is the logged-in user the project owner? (they can edit and delete every task)
    isOwner: boolean
}

// The "Tâches" section of a project page: "Liste" view (by default) or "Calendrier" view.
// CLIENT component: it handles what changes (view, Status filter, search).
// The tasks themselves are fetched by the page (server component) and arrive already sorted.
export default function ProjectTasks({ tasks, members, currentUser, isOwner }: ProjectTasksProps) {
    const [view, setView] = useState<"list" | "calendar">("list")
    const [status, setStatus] = useState("")
    const [search, setSearch] = useState("")

    // We keep the tasks with the chosen status (if a status is chosen),
    // whose title or description contains the search text (case-insensitive).
    // The filters apply to both views (List and Calendar)
    const query = search.trim().toLowerCase()
    const filteredTasks = tasks.filter(
        (task) =>
            (status === "" || task.status === status) &&
            (task.title.toLowerCase().includes(query) ||
                (task.description ?? "").toLowerCase().includes(query))
    )

    return (
        <section className="rounded-[10px] border border-grey-200 bg-white px-[59px] py-10">
            {/* Header: title on the left, views + filter + search on the right */}
            <div className="flex items-center justify-between gap-6">
                <div>
                    <h5>Tâches</h5>
                    <p className="mt-1 text-grey-600">
                        {view === "list" ? "Par ordre de priorité" : "Par date d'échéance"}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Views: "Liste" (by default) or "Calendrier" */}
                    <div className="flex gap-2.5">
                        <Chips label="Liste" type="tasks" isActive={view === "list"} onClick={() => setView("list")} />
                        <Chips
                            label="Calendrier"
                            type="calendar"
                            isActive={view === "calendar"}
                            onClick={() => setView("calendar")}
                        />
                    </div>

                    {/* Status filter: a real <select> list.
                        appearance-none: hides the browser's arrow, we show our own (icon) */}
                    <Input
                        variant="dropdown"
                        label="Filtrer par statut"
                        hideLabel
                        id="status-filter"
                        options={STATUS_OPTIONS}
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        icon={DropdownIcon}
                        className="my-0 h-[63px] w-[152px] cursor-pointer appearance-none rounded-[10px] bg-white pl-8 text-sm"
                    />

                    <Input
                        label="Rechercher une tâche"
                        hideLabel
                        id="search-project-task"
                        type="search"
                        placeholder="Rechercher une tâche"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        icon={SearchIcon}
                        className="my-0 h-[63px] w-[283px] rounded-[10px] pl-8 text-sm placeholder:text-grey-600"
                    />
                </div>
            </div>

            {/* "Calendrier" view: the tasks on a month grid (see TaskCalendar).
                Otherwise the task list (or a message if there are none).
                mx-10: in the mockup, the tasks are indented 40px relative to the title */}
            {view === "calendar" ? (
                <TaskCalendar tasks={filteredTasks} members={members} currentUser={currentUser} isOwner={isOwner} />
            ) : tasks.length === 0 ? (
                <p className="mx-10 mt-10 text-grey-600">Aucune tâche dans ce projet pour l&apos;instant.</p>
            ) : filteredTasks.length === 0 ? (
                <p className="mx-10 mt-10 text-grey-600">Aucune tâche ne correspond à votre recherche.</p>
            ) : (
                <ul className="mx-10 mt-[41px] flex flex-col gap-[18px]">
                    {filteredTasks.map((task) => (
                        <li key={task.id}>
                            <ProjectTaskCard task={task} members={members} currentUser={currentUser} isOwner={isOwner} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}