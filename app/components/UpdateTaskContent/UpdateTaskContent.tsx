"use client"

import type { UserSummary } from "@/app/lib/types"
import Alert from "@/app/components/Alert/Alert"
import Button from "@/app/components/Button/Button"
import UpdateTaskForm, { type EditableTask } from "@/app/components/UpdateTaskForm/UpdateTaskForm"

type UpdateTaskContentProps = {
    task: EditableTask
    // The project members (owner included): the people who can be assigned
    members: UserSummary[]
    // Why the user can't edit the task (see editTaskError in utils.ts), null = allowed
    forbiddenMessage: string | null
    // Closes the modal: after saving, or with "Fermer"
    onClose: () => void
}

// What a task's "Modifier" modal shows: the edit form, or, when the user is neither
// the project owner nor assigned to the task, the red message and "Fermer".
// Used by the "…" menu (TaskMenu) and by the calendar (TaskCalendar).
export default function UpdateTaskContent({ task, members, forbiddenMessage, onClose }: UpdateTaskContentProps) {
    if (forbiddenMessage) {
        return (
            <>
                <Alert message={forbiddenMessage} variant="error" />
                <div className="mt-8 flex gap-3">
                    <Button
                        label="Fermer"
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="mx-0 w-auto px-7"
                    />
                </div>
            </>
        )
    }

    return <UpdateTaskForm task={task} members={members} onSuccess={onClose} />
}