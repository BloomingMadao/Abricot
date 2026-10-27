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

type TaskCardProps = {
    task: AssignedTask
    // "list" : infos à gauche, statut + bouton à droite (vue Liste)
    // "kanban" : tout empilé, le bouton en bas (vue Kanban, carte plus étroite)
    layout?: "list" | "kanban"
}

export default function TaskCard({ task, layout = "list" }: TaskCardProps) {
    // Les morceaux communs aux deux mises en page, rangés dans des variables
    // pour ne pas les écrire deux fois
    const statusTag = (
        <Tag label={TASK_STATUS_LABELS[task.status]} variant={statusVariants[task.status]} />
    )

    const title = <h5 >{task.title}</h5>

    const description = task.description && (
        <p className="mt-1 text-sm text-grey-600">{task.description}</p>
    )

    // Projet | échéance | nombre de commentaires — toujours sur UNE ligne.
    // Si la carte est trop étroite (vue Kanban), le nom du projet est coupé avec "…"
    // (min-w-0 + truncate), et le nom complet s'affiche au survol (title).
    const infos = (
        <ul className="mt-8 flex items-center gap-3 text-xs whitespace-nowrap text-grey-600">
            <li className="flex min-w-0 items-center gap-2" title={task.project.name}>
                <Image src={FolderIconGrey} alt="" width={18} height={14} className="shrink-0" />
                <span className="truncate">{task.project.name}</span>
            </li>
            <li aria-hidden="true">|</li>
            <li className="flex shrink-0 items-center gap-2">
                <Image src={CalendarIconGrey} alt="" width={15} height={17} />
                {/* <time> : une date lisible par les machines (dateTime) et par les humains */}
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
                {/* Le nombre seul ne veut rien dire pour un lecteur d'écran */}
                <span className="sr-only">commentaire(s)</span>
            </li>
        </ul>
    )

    // Un Link (et pas un <button>) : "Voir" change de page.
    // Les classes reprennent le style de .button-primary, en plus étroit.
    const seeLink = (
        <Link
            href={`/projects/${task.project.id}`}
            className="rounded-[10px] bg-grey-800 px-[45px] py-[13px] text-white transition-colors duration-300 ease-out hover:bg-grey-950"
        >
            Voir
        </Link>
    )

    // Vue Kanban : titre + statut sur la même ligne, puis le reste empilé
    if (layout === "kanban") {
        return (
            <article className="rounded-[10px] border border-grey-200 bg-white px-10 py-6">
                <div className="flex items-start justify-between gap-4">
                    {title}
                    {/* shrink-0 : le statut ne se fait jamais écraser par un long titre */}
                    <div className="shrink-0">{statusTag}</div>
                </div>
                {description}
                {infos}
                {/* flex : le lien devient un vrai bloc, son padding prend de la place
                    (sans ça, un lien "en ligne" déborderait sur les infos au-dessus) */}
                <div className="mt-8 flex">{seeLink}</div>
            </article>
        )
    }

    // Vue Liste : deux colonnes
    return (
        // <article> : un bloc qui a du sens tout seul (une tâche)
        <article className="flex justify-between gap-6 rounded-[10px] border border-grey-200 bg-white px-10 py-6">
            {/* Colonne de gauche : titre, description, infos */}
            <div className="pt-2.5">
                {title}
                {description}
                {infos}
            </div>

            {/* Colonne de droite : statut en haut, bouton en bas */}
            <div className="flex shrink-0 flex-col items-end justify-between gap-6">
                {statusTag}
                {seeLink}
            </div>
        </article>
    )
}