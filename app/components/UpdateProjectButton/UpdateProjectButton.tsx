"use client"

import { useState } from "react"
import type { UserSummary } from "@/app/lib/types"
import Modal from "@/app/components/Modal/Modal"
import UpdateProjectForm from "@/app/components/UpdateProjectForm/UpdateProjectForm"

type UpdateProjectButtonProps = {
    project: { id: string; name: string; description: string | null }
    // Les contributeurs actuels (sans le propriétaire)
    members: UserSummary[]
    // Email du propriétaire (on ne le propose pas dans la liste)
    ownerEmail: string
}

// Le lien "Modifier" à côté du nom du projet + sa modale.
// Même principe que CreateProjectButton : composant CLIENT qui retient si la modale est ouverte.
export default function UpdateProjectButton({ project, members, ownerEmail }: UpdateProjectButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Un <button> qui ressemble à un lien : il ouvre une modale, il ne change pas de page */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="cursor-pointer text-sm text-brand-dark underline underline-offset-2 hover:text-grey-950"
            >
                Modifier
                {/* Pour un lecteur d'écran : "Modifier le projet" plutôt que juste "Modifier" */}
                <span className="sr-only"> le projet</span>
            </button>

            <Modal title="Modifier un projet" isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <UpdateProjectForm
                    project={project}
                    members={members}
                    ownerEmail={ownerEmail}
                    onSuccess={() => setIsOpen(false)}
                />
            </Modal>
        </>
    )
}