import TaskCard from "@/app/components/TaskCard/TaskCard"
import type { AssignedTask } from "@/app/lib/types"
import Tag from "../Tag/Tag"

type KanbanColumnProps = {
    title: string // ex : "À faire"
    tasks: AssignedTask[] // uniquement les tâches de cette colonne
}

export default function KanbanColumn({ title, tasks }: KanbanColumnProps) {
    return (
        <section className="rounded-[10px] border border-brand-light bg-white px-6 py-10">
            {/* Titre de la colonne + pastille avec le nombre de tâches */}
            <div className="flex items-center gap-2">
                <h5>{title}</h5>
                <Tag label={tasks.length.toString()} variant="grey"/>
                    {/* {tasks.length}
                    {/* Pour un lecteur d'écran : "À faire, 4 tâche(s)" plutôt que "À faire 4" */}
                    <span className="sr-only"> tâche(s)</span>
                
            </div>

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