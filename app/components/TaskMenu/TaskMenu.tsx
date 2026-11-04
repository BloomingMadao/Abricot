"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { deleteTaskAction } from "@/app/lib/actions"
import type { UserSummary } from "@/app/lib/types"
import IconButton from "@/app/components/IconButton/IconButton"
import Modal from "@/app/components/Modal/Modal"
import Button from "@/app/components/Button/Button"
import Alert from "@/app/components/Alert/Alert"
import UpdateTaskForm, { type EditableTask } from "@/app/components/UpdateTaskForm/UpdateTaskForm"

type TaskMenuProps = {
    task: EditableTask
    // Les membres du projet (propriétaire compris) : les personnes qu'on peut assigner
    members: UserSummary[]
}

// Le bouton "…" d'une tâche, son sous-menu (Modifier / Supprimer) et les deux modales.
// Même principe d'ouverture / fermeture que UserMenu.
export default function TaskMenu({ task, members }: TaskMenuProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [deleteError, setDeleteError] = useState("")
    // isDeleting : vrai pendant la suppression ("Suppression..." sur le bouton)
    const [isDeleting, startDeleting] = useTransition()

    // Le bloc qui contient le bouton ET le menu : pour savoir si un clic a lieu dedans ou dehors
    const menuRef = useRef<HTMLDivElement>(null)

    // Comme dans UserMenu : un clic en dehors ou la touche Échap ferment le menu
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
        setDeleteError("")
        setIsDeleteOpen(true)
    }

    function confirmDelete() {
        // startDeleting : React sait que quelque chose est en cours (isDeleting = true)
        startDeleting(async () => {
            const result = await deleteTaskAction(task.projectId, task.id)
            if (result.error) {
                setDeleteError(result.error)
                return
            }
            // Succès : la page se recalcule sans la tâche (cette carte et la modale disparaissent)
            setIsDeleteOpen(false)
        })
    }

    // Style commun aux deux lignes du sous-menu
    // (focus-visible:bg-grey-100 : la ligne se colore aussi quand on y arrive au clavier)
    const itemClass =
        "flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-grey-100 focus-visible:bg-grey-100 focus-visible:outline-none"

    return (
        // relative : le menu (en "absolute") s'ouvre juste sous le bouton "…"
        <div ref={menuRef} className="relative shrink-0">
            <IconButton
                variant="more"
                label={`Options de la tâche ${task.title}`}
                expanded={isMenuOpen}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            />

            {/* Le sous-menu : Modifier et Supprimer (même style que le menu de UserMenu) */}
            {isMenuOpen && (
                <ul className="absolute top-full right-0 z-20 mt-2 flex w-max flex-col overflow-hidden rounded-[10px] border border-grey-200 bg-white py-2 shadow-lg">
                    <li>
                        <button type="button" onClick={openEdit} className={`${itemClass} text-grey-800`}>
                            {/* Crayon, dessiné en SVG (currentColor : la couleur du texte) */}
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                                <path d="M10.3.7a1.6 1.6 0 0 1 2.3 0l.7.7a1.6 1.6 0 0 1 0 2.3L5 12 1 13l1-4L10.3.7Z" />
                            </svg>
                            Modifier
                        </button>
                    </li>
                    <li>
                        {/* text-error : en rouge, comme toute action qui détruit quelque chose */}
                        <button type="button" onClick={openDelete} className={`${itemClass} text-error`}>
                            {/* Poubelle, dessinée en SVG */}
                            <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true">
                                <path d="M4 0h4l.5 1H12v1.5H0V1h3.5L4 0ZM1 3.5h10l-.7 9.6A1 1 0 0 1 9.3 14H2.7a1 1 0 0 1-1-.9L1 3.5Z" />
                            </svg>
                            Supprimer
                        </button>
                    </li>
                </ul>
            )}

            {/* Modale "Modifier" : le même formulaire que sur le tableau de bord */}
            <Modal title="Modifier" isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
                <UpdateTaskForm task={task} members={members} onSuccess={() => setIsEditOpen(false)} />
            </Modal>

            {/* Modale de confirmation avant de supprimer (pas de maquette : même style que les autres) */}
            <Modal title="Supprimer la tâche" isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)}>
                {deleteError && <Alert message={deleteError} variant="error" />}
                <p className="text-grey-600">
                    La tâche « {task.title} » et ses commentaires seront supprimés définitivement.
                </p>
                <div className="mt-8 flex gap-3">
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