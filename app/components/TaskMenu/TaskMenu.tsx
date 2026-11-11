"use client"

import { useRef, useState, useTransition } from "react"
import { deleteTaskAction } from "@/app/lib/actions"
import type { UserSummary } from "@/app/lib/types"
import IconButton from "@/app/components/IconButton/IconButton"
import Modal from "@/app/components/Modal/Modal"
import Button from "@/app/components/Button/Button"
import Alert from "@/app/components/Alert/Alert"
import ActionIcon from "@/app/components/ActionIcon/ActionIcon"
import useDismiss from "@/app/hooks/useDismiss"
import UpdateTaskContent from "@/app/components/UpdateTaskContent/UpdateTaskContent"
import type { EditableTask } from "@/app/components/UpdateTaskForm/UpdateTaskForm"

type TaskMenuProps = {
    task: EditableTask
    // The project members (owner included): the people who can be assigned
    members: UserSummary[]
    // Why the user can't edit the task (see editTaskError in utils.ts), null = allowed.
    // "Modifier" then shows this message in a red alert instead of the form.
    // (No such message for "Supprimer": as in the specifications,
    // any project member can delete a task)
    editForbiddenMessage?: string | null
}

// A task's "…" button, its submenu (Modifier / Supprimer) and the two modals.
// Same open / close logic as UserMenu.
export default function TaskMenu({
    task,
    members,
    editForbiddenMessage = null,
}: TaskMenuProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [deleteError, setDeleteError] = useState("")
    // isDeleting: true during deletion ("Suppression..." on the button)
    const [isDeleting, startDeleting] = useTransition()

    // The block containing the button AND the menu: to know whether a click happens inside or outside
    const menuRef = useRef<HTMLDivElement>(null)

    // As in UserMenu: a click outside or the Escape key closes the menu (app/hooks/useDismiss.ts)
    useDismiss(menuRef, isMenuOpen, setIsMenuOpen)

    function openEdit() {
        setIsMenuOpen(false)
        setIsEditOpen(true)
    }

    function openDelete() {
        setIsMenuOpen(false)
        // Each opening starts without the error of a previous attempt
        setDeleteError("")
        setIsDeleteOpen(true)
    }

    function confirmDelete() {
        // startDeleting: React knows something is in progress (isDeleting = true)
        startDeleting(async () => {
            const result = await deleteTaskAction(task.projectId, task.id)
            if (result.error) {
                setDeleteError(result.error)
                return
            }
            // Success: the page re-renders without the task (this card and the modal disappear)
            setIsDeleteOpen(false)
        })
    }

    // Shared style for the two submenu rows
    // (focus-visible:bg-grey-100: the row is also highlighted when reached with the keyboard)
    const itemClass =
        "flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-grey-100 focus-visible:bg-grey-100 focus-visible:outline-none"

    return (
        // relative: the menu (in "absolute") opens right below the "…" button
        <div ref={menuRef} className="relative shrink-0">
            <IconButton
                variant="more"
                label={`Options de la tâche ${task.title}`}
                expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            />

            {/* The submenu: Modifier and Supprimer (same style as the UserMenu menu) */}
            {isMenuOpen && (
                <ul className="absolute top-full right-0 z-20 mt-2 flex w-max flex-col overflow-hidden rounded-[10px] border border-grey-200 bg-white py-2 shadow-lg">
                    <li>
                        <button type="button" onClick={openEdit} className={`${itemClass} text-grey-800`}>
                            {/* Pencil (shared with SuggestedTaskCard, see ActionIcon) */}
                            <ActionIcon variant="edit" />
                            Modifier
                        </button>
                    </li>
                    <li>
                        {/* text-error: in red, like any action that destroys something */}
                        <button type="button" onClick={openDelete} className={`${itemClass} text-error`}>
                            {/* Trash can (see ActionIcon) */}
                            <ActionIcon variant="delete" />
                            Supprimer
                        </button>
                    </li>
                </ul>
            )}

            {/* "Modifier" modal: the same form as on the dashboard.
                Not allowed (editForbiddenMessage): only the red alert and "Fermer" (see UpdateTaskContent) */}
            <Modal title="Modifier" isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
                <UpdateTaskContent
                    task={task}
                    members={members}
                    forbiddenMessage={editForbiddenMessage}
                    onClose={() => setIsEditOpen(false)}
                />
            </Modal>

            {/* Confirmation modal before deleting (no mockup: same style as the others).
                Any project member can delete a task (specifications): no red message here,
                deleteError only shows an error returned by the API */}
            <Modal title="Supprimer la tâche" isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                {deleteError && <Alert message={deleteError} variant="error" />}
                <p className="text-grey-600">
                    La tâche « {task.title} » et ses commentaires seront supprimés définitivement.
                </p>
                {/* flex-wrap: on a narrow phone, the 2nd button goes below the 1st */}
                <div className="mt-8 flex flex-wrap gap-3">
                    <Button
                        label="Annuler"
                        type="button"
                        variant="secondary"
                        onClick={() => setIsDeleteOpen(false)}
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
        </div>
    )
}