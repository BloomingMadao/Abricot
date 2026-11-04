"use client"

import { useActionState, useState } from "react"
import { updateTaskAction, type TaskFormState } from "@/app/lib/actions"
import type { Task, UserSummary } from "@/app/lib/types"
import Input from "@/app/components/Input/Input"
import Button from "@/app/components/Button/Button"
import Alert from "@/app/components/Alert/Alert"
import ContributorsSelect from "@/app/components/ContributorsSelect/ContributorsSelect"
import TaskStatusPicker from "@/app/components/TaskStatusPicker/TaskStatusPicker"

// Ce dont le formulaire a besoin d'une tâche.
// Les tâches du tableau de bord (AssignedTask) ET celles de la page d'un projet (TaskDetail)
// ont toutes ces infos : le même formulaire sert aux deux endroits.
export type EditableTask = Pick<Task, "id" | "projectId" | "title" | "description" | "dueDate" | "status"> & {
    assignees: { user: UserSummary }[]
}

type UpdateTaskFormProps = {
    task: EditableTask
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

            {/* Statut : le statut actuel de la tâche est coché */}
            <TaskStatusPicker defaultStatus={currentStatus} />

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