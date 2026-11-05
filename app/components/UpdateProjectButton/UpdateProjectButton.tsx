"use client"

import { useState } from "react"
import type { UserSummary } from "@/app/lib/types"
import Modal from "@/app/components/Modal/Modal"
import UpdateProjectForm from "@/app/components/UpdateProjectForm/UpdateProjectForm"

type UpdateProjectButtonProps = {
    project: { id: string; name: string; description: string | null }
    // The current contributors (without the owner)
    members: UserSummary[]
    // Owner's email (not offered in the list)
    ownerEmail: string
}

// The "Modifier" link next to the project name + its modal.
// Same idea as CreateProjectButton: CLIENT component that remembers whether the modal is open.
export default function UpdateProjectButton({ project, members, ownerEmail }: UpdateProjectButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* A <button> that looks like a link: it opens a modal, it doesn't change page */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="cursor-pointer text-sm text-brand-dark underline underline-offset-2 hover:text-grey-950"
            >
                Modifier
                {/* For a screen reader: "Modifier le projet" rather than just "Modifier" */}
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