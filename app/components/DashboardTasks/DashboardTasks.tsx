"use client"

import { useState } from "react"
import Chips from "@/app/components/Chips/Chips"
import Input from "@/app/components/Input/Input"
import TaskCard from "@/app/components/TaskCard/TaskCard"
import KanbanColumn from "@/app/components/KanbanColumn/KanbanColumn"
import SearchIcon from "@/public/image/searchIcon.svg"
import type { AssignedTask, TaskStatus } from "@/app/lib/types"

// The Kanban columns (one per status), in the mockup's order
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
            {/* View selection. Responsive: centered on a phone (justify-center), 40px above;
                from md (768px), on the left with the mockup's 56px above */}
            <div className="mt-10 flex justify-center gap-2.5 md:mt-14 md:justify-start">
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
                // .panel (globals.css): the white frame shared by the sections, responsive padding
                <section className="panel mt-7.5">
                    {/* Card header: title on the left, search on the right.
                        Phone / tablet: the search goes below the title (flex-col) */}
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            {/* h2: the page's subtitle (the h1 is "Tableau de bord").
                                Class h5: the same look as before */}
                            <h2 className="h5">Mes tâches assignées</h2>
                            <p className="mt-1 text-grey-600">Par ordre de priorité</p>
                        </div>
                        {/* value + onChange: React knows the text on every keystroke.
                            className: Tailwind classes take precedence over those
                            of .input-default (margins, height, width).
                            Full width on a phone, the mockup's width (357px) from sm (640px) */}
                        <Input
                            label="Rechercher une tâche"
                            hideLabel
                            id="search-task"
                            type="search"
                            placeholder="Rechercher une tâche"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            icon={SearchIcon}
                            wrapperClassName="w-full sm:w-auto"
                            className="my-0 h-[63px] w-full rounded-[10px] pl-8 text-sm placeholder:text-grey-600 sm:w-[357px]"
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
                Responsive: the columns are stacked on a phone / tablet (grid-cols-1),
                3 columns of equal width from lg (1024px), as in the mockup.
                lg:-mx-7.5: in the mockup, the columns overflow by 30px on each side. */}
            {view === "kanban" && (
                <div className="mt-8 grid grid-cols-1 items-start gap-[23px] lg:-mx-7.5 lg:mt-12.5 lg:grid-cols-3">
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