"use client"

import { useState } from "react"
import Chips from "@/app/components/Chips/Chips"
import Input from "@/app/components/Input/Input"
import TaskCard from "@/app/components/TaskCard/TaskCard"
import SearchIcon from "@/public/image/searchIcon.svg"
import type { AssignedTask } from "@/app/lib/types"

// Composant CLIENT : il gère ce qui bouge sur la page (vue choisie, recherche).
// Les tâches, elles, sont récupérées par la page (composant serveur) et arrivent en props.
export default function DashboardTasks({ tasks }: { tasks: AssignedTask[] }) {
    const [view, setView] = useState<"list" | "kanban">("list")
    const [search, setSearch] = useState("")

    // Filtrage à chaque frappe : on garde les tâches dont le titre ou la description
    // contient le texte cherché (sans tenir compte des majuscules)
    const query = search.trim().toLowerCase()
    const filteredTasks = tasks.filter(
        (task) =>
            task.title.toLowerCase().includes(query) ||
            (task.description ?? "").toLowerCase().includes(query)
    )

    return (
        <>
            {/* Choix de la vue */}
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
                    {/* En-tête de la carte : titre à gauche, recherche à droite */}
                    <div className="flex items-center justify-between">
                        <div>
                            {/* h2 : sous-titre de la page (le h1 est "Tableau de bord") */}
                            <h5 className="text-lg text-grey-800">Mes tâches assignées</h5>
                            <p className="mt-1 text-grey-600">Par ordre de priorité</p>
                        </div>
                        {/* value + onChange : React connaît le texte à chaque frappe.
                            className : les classes Tailwind passent devant celles
                            de .input-default (marges, hauteur, largeur) */}
                        <Input
                            label="Rechercher une tâche"
                            hideLabel
                            id="search-task"
                            type="search"
                            placeholder="Rechercher une tâche"
                            value={search}
                            onChange={setSearch}
                            icon={SearchIcon}
                            className="my-0 h-[63px] w-[357px] rounded-[10px] pl-8 text-sm placeholder:text-grey-600"
                        />
                    </div>

                    {/* La liste des tâches (ou un message s'il n'y en a pas) */}
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

            {/* À FAIRE : la vue Kanban (quand tu auras sa maquette) */}
            {view === "kanban" && (
                <section className="mt-7.5 rounded-[10px] border border-grey-200 bg-white px-[59px] py-10">
                    <p className="text-grey-600">La vue Kanban arrive bientôt.</p>
                </section>
            )}
        </>
    )
}