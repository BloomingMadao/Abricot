"use client"

import { useState } from "react"
import type { UserSummary } from "@/app/lib/types"
import Button from "@/app/components/Button/Button"
import Modal from "@/app/components/Modal/Modal"
import CreateTaskForm from "@/app/components/CreateTaskForm/CreateTaskForm"

type CreateTaskButtonProps = {
    projectId: string
    // The project members (owner included): the people who can be assigned
    members: UserSummary[]
    // The logged-in user: assigned by default to the new task
    currentUser: UserSummary
}

// The "Créer une tâche" button on a project page + its modal.
// Same idea as CreateProjectButton: CLIENT component that remembers whether the modal is open.
// Once the task is created, the modal closes and the task appears in the list.
export default function CreateTaskButton({ projectId, members, currentUser }: CreateTaskButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* className: Tailwind classes take precedence over those of .button-primary
                (mx-0: no margin, w-auto: width fits the text, self-auto: not centered) */}
            <Button
                label="Créer une tâche"
                type="button"
                variant="primary"
                onClick={() => setIsOpen(true)}
                className="mx-0 w-auto self-auto px-2.5"
            />

            <Modal title="Créer une tâche" isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CreateTaskForm
                    projectId={projectId}
                    members={members}
                    currentUser={currentUser}
                    onSuccess={() => setIsOpen(false)}
                />
            </Modal>
        </>
    )
}