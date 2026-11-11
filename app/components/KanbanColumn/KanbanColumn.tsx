import TaskCard from "@/app/components/TaskCard/TaskCard"
import Tag from "@/app/components/Tag/Tag"
import type { AssignedTask } from "@/app/lib/types"

type KanbanColumnProps = {
    title: string // e.g. "À faire"
    tasks: AssignedTask[] // only the tasks for this column
}

export default function KanbanColumn({ title, tasks }: KanbanColumnProps) {
    return (
        // Responsive: 16px of padding on a phone, the mockup's padding (24px) from md
        <section className="rounded-[10px] border border-brand-light bg-white px-4 py-8 md:px-6 md:py-10">
            {/* Column title + badge with the number of tasks.
                h2: a section of the dashboard. Class h5: the same look as before */}
            <h2 className="h5 flex items-center gap-2">
                {title}
                <Tag
                    label={
                        <>
                            {tasks.length}
                            {/* For a screen reader: "À faire, 4 tâche(s)" rather than "À faire 4" */}
                            <span className="sr-only"> tâche(s)</span>
                        </>
                    }
                    variant="grey"
                    // The Tag is now inside the h2: font-sans text-base font-normal
                    // give it back the look it had next to the title (not the heading's font)
                    className="font-sans text-base font-normal"
                />
            </h2>

            {tasks.length === 0 ? (
                <p className="mt-10 text-sm text-grey-600">Aucune tâche</p>
            ) : (
                <ul className="mt-10 flex flex-col gap-4">
                    {tasks.map((task) => (
                        <li key={task.id}>
                            <TaskCard task={task} layout="kanban" />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}