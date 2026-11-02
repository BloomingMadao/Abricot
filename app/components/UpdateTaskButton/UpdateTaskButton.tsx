"use client"

import { useState } from "react"
import { getProjectMembersAction } from "@/app/lib/actions"
import type { AssignedTask, UserSummary } from "@/app/lib/types"
import Modal from "@/app/components/Modal/Modal"
import Alert from "@/app/components/Alert/Alert"
import Loader from "@/app/components/Loader/Loader"
import Button from "@/app/components/Button/Button"
import UpdateTaskForm from "@/app/components/UpdateTaskForm/UpdateTaskForm"

type UpdateTaskButtonProps = {
    task: AssignedTask
}

// Le bouton "Voir" d'une tâche + sa modale "Modifier".
// Même principe que CreateProjectButton : composant CLIENT qui retient si la modale est ouverte.
export default function UpdateTaskButton({ task }: UpdateTaskButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    // Les membres du projet (les seules personnes qu'on peut assigner).
    // null = pas encore chargés
    const [members, setMembers] = useState<UserSummary[] | null>(null)
    const [error, setError] = useState("")

    async function open() {
        setIsOpen(true)
        // Les tâches du tableau de bord ne contiennent pas les membres du projet :
        // on les demande à chaque ouverture (quelqu'un a pu rejoindre le projet entre-temps)
        setMembers(null)
        setError("")
        const result = await getProjectMembersAction(task.projectId)
        setMembers(result.members)
        setError(result.error ?? "")
    }

    return (
        <>
            {/* Le style de .button-primary, en plus étroit :
                mx-0 : pas de marge sur les côtés (aligné sur le bord de la carte)
                w-auto + px-[45px] : la largeur suit le texte (au lieu des 256px de .button-primary)
                self-auto : se range comme le reste de la colonne (au lieu d'être centré) */}
            <Button
                label={
                    <>
                        Voir
                        {/* Il y a un bouton "Voir" par tâche : le titre caché dit lequel au lecteur d'écran */}
                        <span className="sr-only"> la tâche {task.title}</span>
                    </>
                }
                type="button"
                variant="primary"
                onClick={open}
                className="mx-0 w-auto self-auto px-[45px]"
            />

            <Modal title="Modifier" isOpen={isOpen} onClose={() => setIsOpen(false)}>
                {error ? (
                    <Alert message={error} />
                ) : members === null ? (
                    <Loader />
                ) : (
                    <UpdateTaskForm task={task} members={members} onSuccess={() => setIsOpen(false)} />
                )}
            </Modal>
        </>
    )
}