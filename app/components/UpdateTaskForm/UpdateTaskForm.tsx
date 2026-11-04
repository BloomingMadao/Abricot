"use client"

import { useActionState, useState } from "react"
import { updateTaskAction, type TaskFormState } from "@/app/lib/actions"
import { TASK_STATUS_LABELS, TASK_STATUS_VARIANTS } from "@/app/lib/utils"
import type { AssignedTask, TaskStatus, UserSummary } from "@/app/lib/types"
import Input from "@/app/components/Input/Input"
import Button from "@/app/components/Button/Button"
import Alert from "@/app/components/Alert/Alert"
import { variantClasses } from "@/app/components/Tag/Tag"
import ContributorsSelect from "@/app/components/ContributorsSelect/ContributorsSelect"

// Les 3 statuts de la maquette ("Annulée" n'est pas proposé)
const STATUS_CHOICES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"]

type UpdateTaskFormProps = {
    task: AssignedTask
    // Les membres du projet (propriétaire compris) : les seules personnes assignables
    members: UserSummary[]
    // Appelée quand la tâche est bien enregistrée, pour fermer la modale
    onSuccess: () => void
}

export default function UpdateTaskForm({ task, members, onSuccess }: UpdateTaskFormProps) {
    // On "enveloppe" la Server Action :
    // si c'est un succès, on prévient le parent, qui ferme la modale
    async function submit(previousState: TaskFormState, formData: FormData) {
        const result = await updateTaskAction(previousState, formData)
        if (result?.success) onSuccess()
        return result
    }

    const [state, formAction, isPending] = useActionState(submit, undefined)

    // Comme sur la maquette, "Enregistrer" est grisé à l'ouverture : rien n'a encore changé.
    // À la 1re modification, on vérifie le formulaire (titre vide → reste grisé).
    const [isValid, setIsValid] = useState(false)

    // Valeurs des champs : ce qui a été envoyé (après une erreur), sinon la tâche actuelle
    const values = state?.values
    const currentStatus = values?.status ?? task.status

    return (
        // onInput : à chaque frappe, case cochée ou statut choisi, on revérifie le formulaire
        <form action={formAction} onInput={(event) => setIsValid(event.currentTarget.checkValidity())}>
            {/* Erreur renvoyée par l'API (titre trop court, date invalide...) */}
            {state && !state.success && (
                <Alert message={state.message} errors={state.errors} variant="error" />
            )}

            {/* Champs cachés : l'action doit savoir QUELLE tâche modifier */}
            <input type="hidden" name="projectId" value={task.projectId} />
            <input type="hidden" name="taskId" value={task.id} />

            {/* mt-0 mb-4 w-full : espacements et largeur de la maquette (au lieu de ceux de .input-default) */}
            <Input
                label="Titre"
                id="title"
                type="text"
                required
                minLength={2}
                autoComplete="off"
                defaultValue={values?.title ?? task.title}
                className="mt-0 mb-4 w-full text-sm"
            />
            <Input
                label="Description"
                id="description"
                type="text"
                autoComplete="off"
                defaultValue={values?.description ?? task.description ?? ""}
                className="mt-0 mb-4 w-full text-sm"
            />
            {/* type="date" et pas variant="calendar" : une tâche peut déjà être en retard.
                Avec min = aujourd'hui, son échéance passée rendrait le formulaire invalide.
                Un <input type="date"> attend AAAA-MM-JJ : ce sont les 10 premiers caractères
                de la date ISO de l'API ("2026-03-09T00:00:00.000Z" → "2026-03-09") */}
            <Input
                label="Échéance"
                id="dueDate"
                type="date"
                defaultValue={values?.dueDate ?? task.dueDate?.slice(0, 10) ?? ""}
                className="mt-0 mb-4 w-full text-sm"
            />

            {/* options : seulement les membres du projet, sans recherche.
                valueKey="id" : l'API attend des ids d'utilisateurs (assigneeIds) */}
            <ContributorsSelect
                label="Assigné à :"
                name="assigneeIds"
                options={members}
                defaultSelected={task.assignees.map((assignee) => assignee.user)}
                valueKey="id"
            />

            {/* Statut : un seul choix possible → des boutons radio.
                Un Tag n'est qu'un affichage (un <span>) : on ne peut pas le "choisir".
                Ici, chaque radio est caché (sr-only) et son libellé prend l'apparence d'un Tag. */}
            <fieldset>
                <legend>Statut :</legend>
                <div className="mt-2 flex gap-2">
                    {STATUS_CHOICES.map((status) => (
                        <Input
                            key={status}
                            id={`status-${status}`}
                            type="radio"
                            name="status"
                            value={status}
                            label={TASK_STATUS_LABELS[status]}
                            defaultChecked={currentStatus === status}
                            // sr-only : le rond du radio est invisible, mais reste utilisable au clavier
                            className="sr-only"
                            // tag + variantClasses : l'apparence et les couleurs du Tag
                            // (py-0.5 text-sm : 26px de haut comme sur la maquette).
                            // border-transparent, puis has-[:checked]:border-current : une bordure
                            // de la couleur du texte apparaît sur le statut choisi.
                            // has-[:focus-visible] : contour quand on arrive dessus au clavier
                            wrapperClassName={`tag py-0.5 text-sm ${variantClasses[TASK_STATUS_VARIANTS[status]]} border-transparent has-[:checked]:border-current has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-grey-800`}
                        />
                    ))}
                </div>
            </fieldset>

            {/* mx-0 : aligné à gauche comme les champs, w-61 : 244px de large comme sur la maquette */}
            <Button
                label={isPending ? "Enregistrement..." : "Enregistrer"}
                variant="primary"
                type="submit"
                disabled={!isValid || isPending}
                className="mx-0 mt-14 w-61"
            />
        </form>
    )
}