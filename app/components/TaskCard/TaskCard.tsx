import Image from "next/image"
import Link from "next/link"
import Tag, { type TagVariant } from "@/app/components/Tag/Tag"
import { TASK_STATUS_LABELS, formatShortDate } from "@/app/lib/utils"
import type { AssignedTask, TaskStatus } from "@/app/lib/types"
import FolderIconGrey from "@/public/image/folderIconGrey.svg"
import CalendarIconGrey from "@/public/image/calendarIconGrey.svg"
import CommentIcon from "@/public/image/commentIcon.svg"

// Couleur du Tag selon le statut de la tâche
const statusVariants: Record<TaskStatus, TagVariant> = {
    TODO: "error",
    IN_PROGRESS: "warning",
    DONE: "success",
    CANCELLED: "grey",
}

export default function TaskCard({ task }: { task: AssignedTask }) {
    return (
        // <article> : un bloc qui a du sens tout seul (une tâche)
        <article className="flex justify-between gap-6 rounded-[10px] border border-grey-200 bg-white px-10 py-6">
            {/* Colonne de gauche : titre, description, infos */}
            <div className="pt-2.5">
                <h5 className="text-lg text-grey-800">{task.title}</h5>
                {task.description && (
                    <p className="mt-1 text-sm text-grey-600">{task.description}</p>
                )}

                {/* Projet | échéance | nombre de commentaires */}
                <ul className="mt-8 flex items-center gap-3 text-xs text-grey-600">
                    <li className="flex items-center gap-2">
                        <Image src={FolderIconGrey} alt="" width={18} height={14} />
                        {task.project.name}
                    </li>
                    <li aria-hidden="true">|</li>
                    <li className="flex items-center gap-2">
                        <Image src={CalendarIconGrey} alt="" width={15} height={17} />
                        {/* <time> : une date lisible par les machines (dateTime) et par les humains */}
                        {task.dueDate ? (
                            <time dateTime={task.dueDate}>{formatShortDate(task.dueDate)}</time>
                        ) : (
                            formatShortDate(null)
                        )}
                    </li>
                    <li aria-hidden="true">|</li>
                    <li className="flex items-center gap-2">
                        <Image src={CommentIcon} alt="" width={15} height={15} />
                        {task.comments.length}
                        {/* Le nombre seul ne veut rien dire pour un lecteur d'écran */}
                        <span className="sr-only">commentaire(s)</span>
                    </li>
                </ul>
            </div>

            {/* Colonne de droite : statut en haut, bouton en bas */}
            <div className="flex shrink-0 flex-col items-end justify-between gap-6">
                <Tag label={TASK_STATUS_LABELS[task.status]} variant={statusVariants[task.status]} />

                {/* Un Link (et pas un <button>) : "Voir" change de page.
                    Les classes reprennent le style de .button-primary, en plus étroit. */}
                <Link
                    href={`/projects/${task.project.id}`}
                    className="rounded-[10px] bg-grey-800 px-[45px] py-[13px] text-white transition-colors duration-300 ease-out hover:bg-grey-950"
                >
                    Voir
                </Link>
            </div>
        </article>
    )
}