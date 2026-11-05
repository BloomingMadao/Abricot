"use client"

import { useState } from "react"
import Chips from "@/app/components/Chips/Chips"
import Input from "@/app/components/Input/Input"
import TaskCard from "@/app/components/TaskCard/TaskCard"
import KanbanColumn from "@/app/components/KanbanColumn/KanbanColumn"
import SearchIcon from "@/public/image/searchIcon.svg"
import type { AssignedTask, TaskStatus } from "@/app/lib/types"

// The Kanban columns, in the mockup's order.
// (Cancelled tasks have no column: they don't appear in the Kanban.)
const KANBAN_COLUMNS: { status: TaskStatus; title: string }[] = [
    { status: "TODO", title: "À faire" },
    { status: "IN_PROGRESS", title: "En cours" },
    { status: "DONE", title: "Terminées" },
]

// CLIENT component: it handles what changes on the page (selected view, search).
// The tasks themselves are fetched by the page (server component) and come in as props.
export default function DashboardTasks({ tasks }: { tasks: AssignedTask[] }) {
    const [view, setView] = useState<"list" | "kanban">("list")
    const [search, setSearch] = useState("")

    // Filtering on every keystroke: we keep the tasks whose title or description
    // contains the search text (case-insensitive)
    const query = search.trim().toLowerCase()
    const filteredTasks = tasks.filter(
        (task) =>
            task.title.toLowerCase().includes(query) ||
            (task.description ?? "").toLowerCase().includes(query)
    )

    return (
        <>
            {/* View selection */}
            <div className="mt-14 flex gap-2.5">
                <Chips
                    label="Liste"
                    type="tasks"
                    isActive={view === "list"}
                    onClick={() => setView("list")}
                />
                <Chips
                    label="Kanban"
                    type="kanban"
                    isActive={view === "kanban"}
                    onClick={() => setView("kanban")}
                />
            </div>

            {view === "list" && (
                <section className="mt-7.5 rounded-[10px] border border-grey-200 bg-white px-[59px] py-10">
                    {/* Card header: title on the left, search on the right */}
                    <div className="flex items-center justify-between">
                        <div>
                            {/* h2: the page's subtitle (the h1 is "Tableau de bord") */}
                            <h5>Mes tâches assignées</h5>
                            <p className="mt-1 text-grey-600">Par ordre de priorité</p>
                        </div>
                        {/* value + onChange: React knows the text on every keystroke.
                            className: Tailwind classes take precedence over those
                            of .input-default (margins, height, width) */}
                        <Input
                            label="Rechercher une tâche"
                            hideLabel
                            id="search-task"
                            type="search"
                            placeholder="Rechercher une tâche"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            icon={SearchIcon}
                            className="my-0 h-[63px] w-[357px] rounded-[10px] pl-8 text-sm placeholder:text-grey-600"
                        />
                    </div>

                    {/* The task list (or a message if there are none) */}
                    {tasks.length === 0 ? (
                        <p className="mt-10 text-grey-600">Aucune tâche ne vous est assignée.</p>
                    ) : filteredTasks.length === 0 ? (
                        <p className="mt-10 text-grey-600">
                            Aucune tâche ne correspond à « {search} ».
                        </p>
                    ) : (
                        <ul className="mt-10 flex flex-col gap-[18px]">
                            {filteredTasks.map((task) => (
                                <li key={task.id}>
                                    <TaskCard task={task} />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}

            {/* Kanban view: one column per status.
                grid-cols-3: 3 columns of equal width.
                -mx-7.5: in the mockup, the columns overflow by 30px on each side. */}
            {view === "kanban" && (
                <div className="-mx-7.5 mt-12.5 grid grid-cols-3 items-start gap-[23px]">
                    {KANBAN_COLUMNS.map((column) => (
                        <KanbanColumn
                            key={column.status}
                            title={column.title}
                            // Each column only gets the tasks with its status
                            // (still in priority order, since tasks is already sorted)
                            tasks={tasks.filter((task) => task.status === column.status)}
                        />
                    ))}
                </div>
            )}
        </>
    )
}