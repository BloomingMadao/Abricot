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

// A task's "Voir" button + its "Modifier" modal.
// Same idea as CreateProjectButton: CLIENT component that remembers whether the modal is open.
export default function UpdateTaskButton({ task }: UpdateTaskButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    // The project members (the only people who can be assigned).
    // null = not loaded yet
    const [members, setMembers] = useState<UserSummary[] | null>(null)
    const [error, setError] = useState("")

    async function open() {
        setIsOpen(true)
        // Dashboard tasks don't include the project members:
        // we fetch them each time it opens (someone may have joined the project in the meantime)
        setMembers(null)
        setError("")
        const result = await getProjectMembersAction(task.projectId)
        setMembers(result.members)
        setError(result.error ?? "")
    }

    return (
        <>
            {/* The .button-primary style, but narrower:
                mx-0: no side margins (aligned with the card's edge)
                w-auto + px-[45px]: the width follows the text (instead of .button-primary's 256px)
                self-auto: lines up like the rest of the column (instead of being centered) */}
            <Button
                label={
                    <>
                        Voir
                        {/* There's one "Voir" button per task: the hidden title tells the screen reader which one */}
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