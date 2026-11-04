"use client"

import { useState } from "react"
import type { UserSummary } from "@/app/lib/types"
import Button from "@/app/components/Button/Button"
import Modal from "@/app/components/Modal/Modal"
import CreateTaskForm from "@/app/components/CreateTaskForm/CreateTaskForm"

type CreateTaskButtonProps = {
    projectId: string
    // Les membres du projet (propriétaire compris) : les personnes qu'on peut assigner
    members: UserSummary[]
}

// Le bouton "Créer une tâche" de la page d'un projet + sa modale.
// Même principe que CreateProjectButton : composant CLIENT qui retient si la modale est ouverte.
// Une fois la tâche créée, la modale se ferme et la tâche apparaît dans la liste.
export default function CreateTaskButton({ projectId, members }: CreateTaskButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* className : les classes Tailwind passent devant celles de .button-primary
                (mx-0 : pas de marge, w-auto : largeur selon le texte, self-auto : pas centré) */}
            <Button
                label="Créer une tâche"
                type="button"
                variant="primary"
                onClick={() => setIsOpen(true)}
                className="mx-0 w-auto self-auto px-2.5"
            />

            <Modal title="Créer une tâche" isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CreateTaskForm projectId={projectId} members={members} onSuccess={() => setIsOpen(false)} />
            </Modal>
        </>
    )
}