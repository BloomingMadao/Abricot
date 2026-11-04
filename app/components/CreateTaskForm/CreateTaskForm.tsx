"use client"

import { useActionState, useState } from "react"
import { createTaskAction, type TaskFormState } from "@/app/lib/actions"
import type { UserSummary } from "@/app/lib/types"
import Input from "@/app/components/Input/Input"
import Button from "@/app/components/Button/Button"
import Alert from "@/app/components/Alert/Alert"
import ContributorsSelect from "@/app/components/ContributorsSelect/ContributorsSelect"
import TaskStatusPicker from "@/app/components/TaskStatusPicker/TaskStatusPicker"

type CreateTaskFormProps = {
    // Le projet dans lequel on crée la tâche
    projectId: string
    // Les membres du projet (propriétaire compris) : les seules personnes assignables
    members: UserSummary[]
    // Appelée quand la tâche est bien créée, pour fermer la modale
    onSuccess: () => void
}

// Le formulaire "Créer une tâche" : la même mise en page que "Modifier" (UpdateTaskForm), mais vide
export default function CreateTaskForm({ projectId, members, onSuccess }: CreateTaskFormProps) {
    // On "enveloppe" la Server Action (comme UpdateTaskForm) :
    // si c'est un succès, on prévient le parent, qui ferme la modale
    async function submit(previousState: TaskFormState, formData: FormData) {
        const result = await createTaskAction(previousState, formData)
        if (result?.success) onSuccess()
        return result
    }

    const [state, formAction, isPending] = useActionState(submit, undefined)

    // Bouton grisé tant que les champs obligatoires (required) ne sont pas remplis
    // (comme CreateProjectForm). Au départ ils sont vides : le formulaire n'est pas valide.
    const [isValid, setIsValid] = useState(false)

    // Après une erreur, React remet le formulaire à zéro : on garde ce qui avait été tapé
    const values = state?.values

    return (
        // onInput : à chaque frappe, case cochée ou statut choisi, on revérifie le formulaire
        <form action={formAction} onInput={(event) => setIsValid(event.currentTarget.checkValidity())}>
            {/* Erreur renvoyée par l'API (titre trop court, date invalide...) */}
            {state && !state.success && (
                <Alert message={state.message} errors={state.errors} variant="error" />
            )}

            {/* Champ caché : l'action doit savoir dans QUEL projet créer la tâche */}
            <input type="hidden" name="projectId" value={projectId} />

            {/* mt-0 mb-4 w-full text-sm : espacements et taille de la maquette (comme UpdateTaskForm) */}
            <Input
                label="Titre*"
                id="title"
                type="text"
                required
                minLength={2}
                autoComplete="off"
                defaultValue={values?.title}
                className="mt-0 mb-4 w-full text-sm"
            />
            <Input
                label="Description*"
                id="description"
                type="text"
                required
                autoComplete="off"
                defaultValue={values?.description}
                className="mt-0 mb-4 w-full text-sm"
            />
            {/* variant="calendar" : une date à partir d'aujourd'hui (une nouvelle tâche n'est pas en retard) */}
            <Input
                label="Échéance*"
                id="dueDate"
                variant="calendar"
                required
                defaultValue={values?.dueDate}
                className="mt-0 mb-4 w-full text-sm"
            />

            {/* options : seulement les membres du projet, sans recherche.
                valueKey="id" : l'API attend des ids d'utilisateurs (assigneeIds) */}
            <ContributorsSelect label="Assigné à :" name="assigneeIds" options={members} valueKey="id" />

            {/* Aucun statut coché au départ : sans choix, la tâche est "À faire" */}
            <TaskStatusPicker defaultStatus={values?.status} />

            {/* mx-0 : aligné à gauche comme les champs, w-[181px] : sa largeur sur la maquette */}
            <Button
                label={isPending ? "Création..." : "+ Ajouter une tâche"}
                variant="primary"
                type="submit"
                disabled={!isValid || isPending}
                className="mx-0 mt-14 w-[181px]"
            />
        </form>
    )
}