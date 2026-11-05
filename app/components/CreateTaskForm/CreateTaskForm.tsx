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
    // The project in which the task is created
    projectId: string
    // The project members (owner included): the only people who can be assigned
    members: UserSummary[]
    // Called when the task has been created, to close the modal
    onSuccess: () => void
}

// The "Créer une tâche" form: the same layout as "Modifier" (UpdateTaskForm), but empty
export default function CreateTaskForm({ projectId, members, onSuccess }: CreateTaskFormProps) {
    // We "wrap" the Server Action (like UpdateTaskForm):
    // on success, we notify the parent, which closes the modal
    async function submit(previousState: TaskFormState, formData: FormData) {
        const result = await createTaskAction(previousState, formData)
        if (result?.success) onSuccess()
        return result
    }

    const [state, formAction, isPending] = useActionState(submit, undefined)

    // Button greyed out until the required fields are filled in
    // (like CreateProjectForm). At first they are empty: the form is not valid.
    const [isValid, setIsValid] = useState(false)

    // After an error, React resets the form: we keep what had been typed
    const values = state?.values

    return (
        // onInput: on every keystroke, checked box or chosen status, we re-check the form
        <form action={formAction} onInput={(event) => setIsValid(event.currentTarget.checkValidity())}>
            {/* Error returned by the API (title too short, invalid date...) */}
            {state && !state.success && (
                <Alert message={state.message} errors={state.errors} variant="error" />
            )}

            {/* Hidden field: the action needs to know in WHICH project to create the task */}
            <input type="hidden" name="projectId" value={projectId} />

            {/* mt-0 mb-4 w-full text-sm: spacing and size from the mockup (like UpdateTaskForm) */}
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
            {/* variant="calendar": a date from today onwards (a new task can't be overdue) */}
            <Input
                label="Échéance*"
                id="dueDate"
                variant="calendar"
                required
                defaultValue={values?.dueDate}
                className="mt-0 mb-4 w-full text-sm"
            />

            {/* options: only the project members, without search.
                valueKey="id": the API expects user ids (assigneeIds) */}
            <ContributorsSelect label="Assigné à :" name="assigneeIds" options={members} valueKey="id" />

            {/* No status checked at first: without a choice, the task is "À faire" (to do) */}
            <TaskStatusPicker defaultStatus={values?.status} />

            {/* mx-0: left-aligned like the fields, w-[181px]: its width in the mockup */}
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