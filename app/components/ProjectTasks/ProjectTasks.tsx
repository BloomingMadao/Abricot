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
    // Is the logged-in user the project owner? (they can edit every task)
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
        // .panel (globals.css): the white frame shared by the sections, responsive padding
        <section className="panel">
            {/* Header: title on the left, views + filter + search on the right.
                Below xl (1280px) there isn't enough room: the controls go below the title */}
            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                <div>
                    {/* h2: a section of the project page. Class h5: the same look as before */}
                    <h2 className="h5">Tâches</h2>
                    <p className="mt-1 text-grey-600">
                        {view === "list" ? "Par ordre de priorité" : "Par date d'échéance"}
                    </p>
                </div>

                {/* flex-wrap: on a phone, the filter and the search go below the views */}
                <div className="flex flex-wrap items-center gap-4">
                    {/* Views: "Liste" (by default) or "Calendrier".
                        Responsive: on a phone, a full-width row with the chips centered;
                        from md (768px), on the left, next to the filter and the search */}
                    <div className="flex w-full justify-center gap-2.5 md:w-auto md:justify-start">
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
                        // Full width on a phone, the mockup's width (152px) from md (768px)
                        wrapperClassName="w-full md:w-auto"
                        className="my-0 h-[63px] w-full cursor-pointer appearance-none rounded-[10px] bg-white pl-8 text-sm md:w-[152px]"
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
                        // Full width on a phone, the mockup's width (283px) from md
                        wrapperClassName="w-full md:w-auto"
                        className="my-0 h-[63px] w-full rounded-[10px] pl-8 text-sm placeholder:text-grey-600 md:w-[283px]"
                    />
                </div>
            </div>

            {/* "Calendrier" view: the tasks on a month grid (see TaskCalendar).
                Otherwise the task list (or a message if there are none).
                md:mx-10: in the mockup, the tasks are indented 40px relative to the title
                (not on a phone: the room is needed for the cards) */}
            {view === "calendar" ? (
                <TaskCalendar tasks={filteredTasks} members={members} currentUser={currentUser} isOwner={isOwner} />
            ) : tasks.length === 0 ? (
                <p className="mt-10 text-grey-600 md:mx-10">Aucune tâche dans ce projet pour l&apos;instant.</p>
            ) : filteredTasks.length === 0 ? (
                <p className="mt-10 text-grey-600 md:mx-10">Aucune tâche ne correspond à votre recherche.</p>
            ) : (
                <ul className="mt-8 flex flex-col gap-[18px] md:mx-10 md:mt-[41px]">
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