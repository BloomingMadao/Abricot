"use client"

import { useActionState, useState } from "react"
import { updateTaskAction, type TaskFormState } from "@/app/lib/actions"
import type { Task, UserSummary } from "@/app/lib/types"
import Input from "@/app/components/Input/Input"
import Button from "@/app/components/Button/Button"
import Alert from "@/app/components/Alert/Alert"
import ContributorsSelect from "@/app/components/ContributorsSelect/ContributorsSelect"
import TaskStatusPicker from "@/app/components/TaskStatusPicker/TaskStatusPicker"

// What the form needs from a task.
// Dashboard tasks (AssignedTask) AND those on a project page (TaskDetail)
// all have this info: the same form is used in both places.
export type EditableTask = Pick<Task, "id" | "projectId" | "title" | "description" | "dueDate" | "status"> & {
    assignees: { user: UserSummary }[]
}

type UpdateTaskFormProps = {
    task: EditableTask
    // The project members (owner included): the only people who can be assigned
    members: UserSummary[]
    // Called when the task has been saved, to close the modal
    onSuccess: () => void
}

export default function UpdateTaskForm({ task, members, onSuccess }: UpdateTaskFormProps) {
    // We "wrap" the Server Action:
    // on success, we notify the parent, which closes the modal
    async function submit(previousState: TaskFormState, formData: FormData) {
        const result = await updateTaskAction(previousState, formData)
        if (result?.success) onSuccess()
        return result
    }

    const [state, formAction, isPending] = useActionState(submit, undefined)

    // As in the mockup, "Enregistrer" is greyed out on open: nothing has changed yet.
    // On the 1st change, we check the form (empty title → stays greyed out).
    const [isValid, setIsValid] = useState(false)

    // Field values: what was submitted (after an error), otherwise the current task
    const values = state?.values
    const currentStatus = values?.status ?? task.status

    return (
        // onInput: on every keystroke, checked box or chosen status, we re-check the form
        <form action={formAction} onInput={(event) => setIsValid(event.currentTarget.checkValidity())}>
            {/* Error returned by the API (title too short, invalid date...) */}
            {state && !state.success && (
                <Alert message={state.message} errors={state.errors} variant="error" />
            )}

            {/* Hidden fields: the action needs to know WHICH task to edit */}
            <input type="hidden" name="projectId" value={task.projectId} />
            <input type="hidden" name="taskId" value={task.id} />

            {/* mt-0 mb-4 w-full: spacing and width from the mockup (instead of .input-default's) */}
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
            {/* type="date" and not variant="calendar": a task may already be overdue.
                With min = today, its past due date would make the form invalid.
                An <input type="date"> expects YYYY-MM-DD: these are the first 10 characters
                of the API's ISO date ("2026-03-09T00:00:00.000Z" → "2026-03-09") */}
            <Input
                label="Échéance"
                id="dueDate"
                type="date"
                defaultValue={values?.dueDate ?? task.dueDate?.slice(0, 10) ?? ""}
                className="mt-0 mb-4 w-full text-sm"
            />

            {/* options: only the project members, without search.
                valueKey="id": the API expects user ids (assigneeIds) */}
            <ContributorsSelect
                label="Assigné à :"
                name="assigneeIds"
                options={members}
                defaultSelected={task.assignees.map((assignee) => assignee.user)}
                valueKey="id"
            />

            {/* Status: the task's current status is checked */}
            <TaskStatusPicker defaultStatus={currentStatus} />

            {/* mx-0: left-aligned like the fields, w-61: 244px wide as in the mockup */}
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