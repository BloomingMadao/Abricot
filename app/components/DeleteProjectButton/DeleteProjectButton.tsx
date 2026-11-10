"use client"

import { useState, useTransition } from "react"
import { deleteProjectAction } from "@/app/lib/actions"
import Modal from "@/app/components/Modal/Modal"
import Button from "@/app/components/Button/Button"
import Alert from "@/app/components/Alert/Alert"

type DeleteProjectButtonProps = {
    project: { id: string; name: string }
}

// The "Supprimer" link next to "Modifier" + its confirmation modal.
// Only displayed to the owner (the API refuses everyone else, even the admins).
// Same principle as "Supprimer" in TaskMenu: we confirm before deleting.
export default function DeleteProjectButton({ project }: DeleteProjectButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState("")
    // isDeleting: true during the deletion ("Suppression..." on the button)
    const [isDeleting, startDeleting] = useTransition()

    function open() {
        setError("")
        setIsOpen(true)
    }

    function confirmDelete() {
        startDeleting(async () => {
            // Success: the action redirects to /projects (this page no longer exists),
            // so we only get a result back when there is an error
            const result = await deleteProjectAction(project.id)
            if (result?.error) setError(result.error)
        })
    }

    return (
        <>
            {/* A <button> that looks like a link, like "Modifier" next to it.
                text-error: in red, like any action that destroys something */}
            <button
                type="button"
                onClick={open}
                className="cursor-pointer text-sm text-error underline underline-offset-2 hover:text-grey-950"
            >
                Supprimer
                {/* For a screen reader: "Supprimer le projet" rather than just "Supprimer" */}
                <span className="sr-only"> le projet</span>
            </button>

            {/* Confirmation modal (no mockup: same style as "Supprimer la tâche") */}
            <Modal title="Supprimer le projet" isOpen={isOpen} onClose={() => setIsOpen(false)}>
                {error && <Alert message={error} variant="error" />}
                <p className="text-grey-600">
                    Le projet « {project.name} », ses tâches et leurs commentaires seront supprimés
                    définitivement.
                </p>
                <div className="mt-8 flex gap-3">
                    <Button
                        label="Annuler"
                        type="button"
                        variant="secondary"
                        onClick={() => setIsOpen(false)}
                        className="mx-0 w-auto px-7"
                    />
                    <Button
                        label={isDeleting ? "Suppression..." : "Supprimer"}
                        type="button"
                        variant="primary"
                        disabled={isDeleting}
                        onClick={confirmDelete}
                        className="mx-0 w-auto px-7"
                    />
                </div>
            </Modal>
        </>
    )
}