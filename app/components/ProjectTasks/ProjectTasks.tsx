"use client"

import { useState } from "react"
import Chips from "@/app/components/Chips/Chips"
import Input from "@/app/components/Input/Input"
import ProjectTaskCard from "@/app/components/ProjectTaskCard/ProjectTaskCard"
import { TASK_STATUS_LABELS } from "@/app/lib/utils"
import type { TaskDetail, TaskStatus, UserSummary } from "@/app/lib/types"
import SearchIcon from "@/public/image/searchIcon.svg"
import DropdownIcon from "@/public/image/dropdown.svg"

// Les choix du filtre "Statut". value "" = pas de filtre (toutes les tâches)
const STATUS_OPTIONS = [
    { value: "", label: "Statut" },
    ...(["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] as TaskStatus[]).map((status) => ({
        value: status,
        label: TASK_STATUS_LABELS[status],
    })),
]

type ProjectTasksProps = {
    // Les tâches du projet, déjà triées par priorité
    tasks: TaskDetail[]
    // Les membres du projet (propriétaire compris) : pour modifier une tâche
    members: UserSummary[]
    // La personne connectée : pour ajouter un commentaire
    currentUser: UserSummary
}

// La section "Tâches" de la page d'un projet.
// Composant CLIENT : il gère ce qui bouge (filtre Statut, recherche).
// Les tâches, elles, sont récupérées par la page (composant serveur) et arrivent déjà triées.
export default function ProjectTasks({ tasks, members, currentUser }: ProjectTasksProps) {
    const [status, setStatus] = useState("")
    const [search, setSearch] = useState("")

    // On garde les tâches du statut choisi (si un statut est choisi),
    // dont le titre ou la description contient le texte cherché (sans tenir compte des majuscules)
    const query = search.trim().toLowerCase()
    const filteredTasks = tasks.filter(
        (task) =>
            (status === "" || task.status === status) &&
            (task.title.toLowerCase().includes(query) ||
                (task.description ?? "").toLowerCase().includes(query))
    )

    return (
        <section className="rounded-[10px] border border-grey-200 bg-white px-[59px] py-10">
            {/* En-tête : titre à gauche, vues + filtre + recherche à droite */}
            <div className="flex items-center justify-between gap-6">
                <div>
                    <h5>Tâches</h5>
                    <p className="mt-1 text-grey-600">Par ordre de priorité</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Vues : "Liste" est la seule pour l'instant.
                        "Calendrier" est affiché comme sur la maquette, mais ne fait rien (pas de onClick) */}
                    <div className="flex gap-2.5">
                        <Chips label="Liste" type="tasks" isActive />
                        <Chips label="Calendrier" type="calendar" />
                    </div>

                    {/* Filtre Statut : une vraie liste <select>.
                        appearance-none : cache la flèche du navigateur, on affiche la nôtre (icon) */}
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

            {/* La liste des tâches (ou un message s'il n'y en a pas).
                mx-10 : sur la maquette, les tâches sont en retrait de 40px par rapport au titre */}
            {tasks.length === 0 ? (
                <p className="mx-10 mt-10 text-grey-600">Aucune tâche dans ce projet pour l&apos;instant.</p>
            ) : filteredTasks.length === 0 ? (
                <p className="mx-10 mt-10 text-grey-600">Aucune tâche ne correspond à votre recherche.</p>
            ) : (
                <ul className="mx-10 mt-[41px] flex flex-col gap-[18px]">
                    {filteredTasks.map((task) => (
                        <li key={task.id}>
                            <ProjectTaskCard task={task} members={members} currentUser={currentUser} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}