"use client"

import { useState } from "react"
import Button from "@/app/components/Button/Button"
import Modal from "@/app/components/Modal/Modal"
import CreateProjectForm from "@/app/components/CreateProjectForm/CreateProjectForm"

type CreateProjectButtonProps = {
    // Logged-in user's email (so they aren't suggested as their own contributor)
    currentUserEmail: string
}

// The "+ Créer un projet" button + its modal.
// CLIENT component: it remembers whether the modal is open.
// Once the project is created, we land directly on its page (see createProjectAction).
export default function CreateProjectButton({ currentUserEmail }: CreateProjectButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button
                label="+ Créer un projet"
                type="button"
                variant="primary"
                onClick={() => setIsOpen(true)}
            />

            <Modal title="Créer un projet" isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CreateProjectForm currentUserEmail={currentUserEmail} />
            </Modal>
        </>
    )
}