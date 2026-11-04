import Image from "next/image"
import Tag from "@/app/components/Tag/Tag"
import UserAvatar from "@/app/components/UserAvatar/UserAvatar"
import TaskMenu from "@/app/components/TaskMenu/TaskMenu"
import TaskComments from "@/app/components/TaskComments/TaskComments"
import { TASK_STATUS_LABELS, TASK_STATUS_VARIANTS, formatShortDate } from "@/app/lib/utils"
import type { TaskDetail, UserSummary } from "@/app/lib/types"
import CalendarIconGrey from "@/public/image/calendarIconGrey.svg"

type ProjectTaskCardProps = {
    task: TaskDetail
    // Les membres du projet (propriétaire compris) : pour la modale "Modifier" du menu "…"
    members: UserSummary[]
    // La personne connectée : pour le formulaire "Ajouter un commentaire"
    currentUser: UserSummary
}

// Une tâche dans la page d'un projet : titre + statut, description, échéance,
// personnes assignées, menu "…" et commentaires.
// Plus besoin de "use client" : ce qui bouge est dans TaskMenu et TaskComments (composants clients).
export default function ProjectTaskCard({ task, members, currentUser }: ProjectTaskCardProps) {
    return (
        <article className="rounded-[10px] border border-grey-200 bg-white pt-6 pr-[34px] pb-[23px] pl-10">
            <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                    {/* Titre + statut sur la même ligne */}
                    <div className="flex flex-wrap items-center gap-2">
                        <h5>{task.title}</h5>
                        <Tag
                            label={TASK_STATUS_LABELS[task.status]}
                            variant={TASK_STATUS_VARIANTS[task.status]}
                            className="text-sm"
                        />
                    </div>

                    {task.description && (
                        <p className="mt-1 text-sm text-grey-600">{task.description}</p>
                    )}

                    {/* Échéance : libellé gris, date foncée */}
                    <p className="mt-[27px] flex items-center gap-2 text-xs text-grey-600">
                        Échéance :
                        <Image src={CalendarIconGrey} alt="" width={15} />
                        {task.dueDate ? (
                            // <time> : une date lisible par les machines (dateTime) et par les humains
                            <time dateTime={task.dueDate} className="text-grey-800">
                                {formatShortDate(task.dueDate)}
                            </time>
                        ) : (
                            <span className="text-grey-800">{formatShortDate(null)}</span>
                        )}
                    </p>

                    {/* Assigné à : pastille + nom pour chaque personne */}
                    <div className="mt-6 flex items-center gap-2.5 text-xs text-grey-600">
                        Assigné à :
                        {task.assignees.length === 0 ? (
                            <span className="text-grey-800">personne</span>
                        ) : (
                            // text-sm : la même taille de police pour les initiales et les noms
                            <ul className="flex flex-wrap items-center gap-[9px] text-sm">
                                {task.assignees.map(({ user }) => (
                                    <li key={user.id} className="flex items-center gap-[5px]">
                                        {/* decorative : le nom est déjà écrit dans l'étiquette */}
                                        <UserAvatar user={user} decorative />
                                        <Tag label={user.name || user.email} variant="grey" />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* "…" : le menu Supprimer | Modifier */}
                <TaskMenu task={task} members={members} />
            </div>

            {/* Séparateur, puis les commentaires (repliés au départ) */}
            <div className="mt-[18px] border-t border-grey-100 pt-[22px]">
                <TaskComments task={task} currentUser={currentUser} />
            </div>
        </article>
    )
}