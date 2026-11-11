"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { deleteTaskAction } from "@/app/lib/actions"
import type { UserSummary } from "@/app/lib/types"
import IconButton from "@/app/components/IconButton/IconButton"
import Modal from "@/app/components/Modal/Modal"
import Button from "@/app/components/Button/Button"
import Alert from "@/app/components/Alert/Alert"
import UpdateTaskContent from "@/app/components/UpdateTaskContent/UpdateTaskContent"
import type { EditableTask } from "@/app/components/UpdateTaskForm/UpdateTaskForm"

type TaskMenuProps = {
    task: EditableTask
    // The project members (owner included): the people who can be assigned
    members: UserSummary[]
    // Why the user can't edit / delete the task (see utils.ts), null = allowed.
    // "Modifier" / "Supprimer" then show this message in a red alert
    // instead of the form / the confirmation
    editForbiddenMessage?: string | null
    deleteForbiddenMessage?: string | null
}

// A task's "…" button, its submenu (Modifier / Supprimer) and the two modals.
// Same open / close logic as UserMenu.
export default function TaskMenu({
    task,
    members,
    editForbiddenMessage = null,
    deleteForbiddenMessage = null,
}: TaskMenuProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [deleteError, setDeleteError] = useState("")
    // isDeleting: true during deletion ("Suppression..." on the button)
    const [isDeleting, startDeleting] = useTransition()

    // The block containing the button AND the menu: to know whether a click happens inside or outside
    const menuRef = useRef<HTMLDivElement>(null)

    // As in UserMenu: a click outside or the Escape key closes the menu
    useEffect(() => {
        if (!isMenuOpen) return
        function handleClickOutside(event: PointerEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false)
            }
        }
        function handleEscape(event: KeyboardEvent) {
            if (event.key === "Escape") setIsMenuOpen(false)
        }
        document.addEventListener("pointerdown", handleClickOutside)
        document.addEventListener("keydown", handleEscape)
        return () => {
            document.removeEventListener("pointerdown", handleClickOutside)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [isMenuOpen])

    function openEdit() {
        setIsMenuOpen(false)
        setIsEditOpen(true)
    }

    function openDelete() {
        setIsMenuOpen(false)
        // Not allowed: the modal opens directly on the red message (nothing to confirm)
        setDeleteError(deleteForbiddenMessage ?? "")
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
                            {/* Pencil, drawn in SVG (currentColor: the text color) */}
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                                <path d="M10.3.7a1.6 1.6 0 0 1 2.3 0l.7.7a1.6 1.6 0 0 1 0 2.3L5 12 1 13l1-4L10.3.7Z" />
                            </svg>
                            Modifier
                        </button>
                    </li>
                    <li>
                        {/* text-error: in red, like any action that destroys something */}
                        <button type="button" onClick={openDelete} className={`${itemClass} text-error`}>
                            {/* Trash can, drawn in SVG */}
                            <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
                                <path d="M4 0h4l.5 1H12v1.5H0V1h3.5L4 0ZM1 3.5h10l-.7 9.6A1 1 0 0 1 9.3 14H2.7a1 1 0 0 1-1-.9L1 3.5Z" />
                            </svg>
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
                Not allowed (deleteForbiddenMessage): only the red alert and "Fermer" */}
            <Modal title="Supprimer la tâche" isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                {deleteError && <Alert message={deleteError} variant="error" />}
                {!deleteForbiddenMessage && (
                    <p className="text-grey-600">
                        La tâche « {task.title} » et ses commentaires seront supprimés définitivement.
                    </p>
                )}
                <div className="mt-8 flex gap-3">
                    <Button
                        label={deleteForbiddenMessage ? "Fermer" : "Annuler"}
                        type="button"
                        variant="secondary"
                        onClick={() => setIsDeleteOpen(false)}
                        className="mx-0 w-auto px-7"
                    />
                    {!deleteForbiddenMessage && (
                        <Button
                            label={isDeleting ? "Suppression..." : "Supprimer"}
                            type="button"
                            variant="primary"
                            disabled={isDeleting}
                            onClick={confirmDelete}
                            className="mx-0 w-auto px-7"
                        />
                    )}
                </div>
            </Modal>
        </div>
    )
}