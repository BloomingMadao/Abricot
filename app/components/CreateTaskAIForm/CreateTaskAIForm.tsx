"use client"

import Image from "next/image"
import { useActionState, useRef, useState, useTransition } from "react"
import {
    createTasksAction,
    suggestTasksAction,
    type AITaskFormState,
} from "@/app/lib/actions"
import type { UserSummary } from "@/app/lib/types"
import Input from "@/app/components/Input/Input"
import Button from "@/app/components/Button/Button"
import Alert from "@/app/components/Alert/Alert"
import SuggestedTaskCard, { type EditableSuggestion } from "@/app/components/SuggestedTaskCard/SuggestedTaskCard"
import { variantClasses } from "@/app/components/Tag/Tag"
import AIIcon from "@/public/image/AIIcon.svg"

type CreateTaskAIFormProps = {
    // The project in which the tasks will be created
    projectId: string
    // false = AI mode off: we ask for a NUMBER of tasks, created with default values
    aiEnabled: boolean
    // The project members (owner included): the people who can be assigned in "Modifier"
    members: UserSummary[]
    // The logged-in user: assigned by default to each suggested task (as before)
    currentUser: UserSummary
    // Tells the parent whether there are suggested tasks (title "Créer une tâche" / "Vos tâches...")
    onHasTasksChange: (hasTasks: boolean) => void
    // Called when the tasks have been created, to close the modal
    onSuccess: () => void
}

// The content of the AI modal:
// - at the bottom, the chat "Décrivez les tâches que vous souhaitez ajouter..."
// - above, the suggested tasks ("Vos tâches..."), which can be edited or deleted
// - "+ Ajouter les tâches" creates them in the project.
// AI mode on: the AI (see suggestTasksAction and lib/ai.ts) chooses the number of tasks,
// the one written in the message, otherwise the one that fits the request.
// AI mode off: the message gives the number of tasks (an info message says so).
export default function CreateTaskAIForm({
    projectId,
    aiEnabled,
    members,
    currentUser,
    onHasTasksChange,
    onSuccess,
}: CreateTaskAIFormProps) {
    // The suggested tasks. id: a key for React (the titles can all be the same)
    const [tasks, setTasks] = useState<(EditableSuggestion & { id: string })[]>([])
    // The card being edited (null = none)
    const [editingId, setEditingId] = useState<string | null>(null)
    // Error of "+ Ajouter les tâches"
    const [addError, setAddError] = useState<{ message: string; errors: string[] } | null>(null)
    // isAdding: true while the tasks are being created ("Ajout..." on the button)
    const [isAdding, startAdding] = useTransition()
    // Counter for the ids: each suggested task gets a different one (suggestion-1, suggestion-2...)
    const nextId = useRef(1)

    // We "wrap" the Server Action (like the other forms): if the AI answered,
    // its tasks are ADDED to the list (a second message adds more tasks)
    async function ask(previousState: AITaskFormState, formData: FormData) {
        const result = await suggestTasksAction(previousState, formData)
        if (result?.success) {
            // The due date and the people asked in the message ("à Bob, pour demain"), found by the AI.
            // Nobody asked for: assigned to the logged-in user, as before.
            // Both can still be changed in "Modifier"
            const newTasks = result.tasks.map((task) => {
                const asked = members.filter((member) => task.assigneeIds.includes(member.id))
                return {
                    title: task.title,
                    description: task.description,
                    dueDate: task.dueDate,
                    assignees: asked.length > 0 ? asked : [currentUser],
                    id: `suggestion-${nextId.current++}`,
                }
            })
            setTasks((current) => [...current, ...newTasks])
            setAddError(null)
            onHasTasksChange(true)
        }
        return result
    }
    const [state, askAction, isAsking] = useActionState(ask, undefined)

    function deleteTask(id: string) {
        const remaining = tasks.filter((task) => task.id !== id)
        setTasks(remaining)
        if (editingId === id) setEditingId(null)
        onHasTasksChange(remaining.length > 0)
    }

    function saveTask(id: string, changes: EditableSuggestion) {
        setTasks(tasks.map((task) => (task.id === id ? { ...task, ...changes } : task)))
        setEditingId(null)
    }

    function addTasks() {
        setAddError(null)
        startAdding(async () => {
            // We send the title, the description, the due date and the ids of the assignees
            // (the id of the card is only for React)
            const result = await createTasksAction(
                projectId,
                tasks.map(({ title, description, dueDate, assignees }) => ({
                    title,
                    description,
                    dueDate,
                    assigneeIds: assignees.map((user) => user.id),
                }))
            )
            if (!result.error) {
                // Success: the modal closes, the new tasks appear in the project
                onSuccess()
                return
            }
            setAddError({ message: result.error, errors: result.errors ?? [] })
            // Some tasks were created: we only keep the others, so they aren't created twice
            if (result.failedIndexes) {
                const failed = result.failedIndexes
                setTasks(tasks.filter((_, index) => failed.includes(index)))
            }
        })
    }

    const hasTasks = tasks.length > 0

    // The text of the chat field depends on the mode
    const promptLabel = aiEnabled
        ? "Décrivez les tâches que vous souhaitez ajouter"
        : "Nombre de tâches à créer"
    const promptPlaceholder = aiEnabled
        ? "Décrivez les tâches que vous souhaitez ajouter..."
        : "Combien de tâches voulez-vous créer ? Par exemple : 3"

    return (
        <>
            {/* The suggested tasks. Without tasks, this empty area keeps the modal
                at the mockup's height (800px), with the chat at the bottom */}
            {/* min-h: the empty modal keeps the mockup's height (smaller on a phone) */}
            <div className={hasTasks ? "mt-1.5" : "min-h-60 md:min-h-[462px]"}>
                {hasTasks && (
                    <>
                        <ul className="flex flex-col gap-[25px]">
                            {tasks.map((task, index) => (
                                <li key={task.id}>
                                    <SuggestedTaskCard
                                        task={task}
                                        members={members}
                                        position={index + 1}
                                        isEditing={editingId === task.id}
                                        onEdit={() => setEditingId(task.id)}
                                        onCancel={() => setEditingId(null)}
                                        onSave={(changes) => saveTask(task.id, changes)}
                                        onDelete={() => deleteTask(task.id)}
                                    />
                                </li>
                            ))}
                        </ul>

                        {addError && (
                            <div className="mt-[25px] flex justify-center">
                                <Alert message={addError.message} errors={addError.errors} variant="error" />
                            </div>
                        )}

                        {/* Greyed out while a card is being edited: its changes would be lost */}
                        <div className="mt-[25px] flex justify-center">
                            <Button
                                label={isAdding ? "Ajout..." : "+ Ajouter les tâches"}
                                type="button"
                                variant="primary"
                                disabled={isAdding || editingId !== null}
                                onClick={addTasks}
                                className="mx-0 w-[181px]"
                            />
                        </div>
                    </>
                )}

                {isAsking && <p className="mt-[25px] text-center text-sm text-grey-600">Génération des tâches...</p>}
            </div>

            {/* role="status": a screen reader announces "3 tâches proposées" (the list appears silently) */}
            <p role="status" className="sr-only">
                {state?.success ? state.message : ""}
            </p>

            {/* The chat, at the bottom. -mx + px (the modal's padding: 24px on a phone, 52px from md):
                the separator line (border-t) goes from one edge of the modal to the other, like on the mockup.
                It only appears when there are tasks above (transparent otherwise) */}
            <div
                className={`-mx-6 mt-[23px] border-t px-6 pt-[25px] md:-mx-[52px] md:px-[52px] ${
                    hasTasks ? "border-grey-200 pb-9" : "border-transparent pb-[82px]"
                }`}
            >
                {/* AI mode off: we say it, and what to type instead.
                    id: the field below points to this text (aria-describedby),
                    so a screen reader reads it when arriving on the field */}
                {!aiEnabled && (
                    <p id="ai-disabled-info" className={`mb-4 rounded-[10px] border px-4 py-3 text-sm ${variantClasses.info}`}>
                        Le mode IA est désactivé : indiquez le nombre de tâches à créer (de 1 à 10),
                        puis modifiez-les avant de les ajouter.
                    </p>
                )}

                {/* Error of the chat (AI unavailable, no number, no task suggested...) */}
                {state && !state.success && <Alert message={state.message} variant="error" />}

                {/* relative: the send button ("absolute") is placed inside the field, on the right */}
                <form action={askAction} className="relative">
                    {/* Hidden field: the AI needs the project (name, description, existing tasks) */}
                    <input type="hidden" name="projectId" value={projectId} />
                    {/* The field takes the mockup's "pill" look: rounded-full, light grey, no border.
                        defaultValue: after an error, React resets the form, we put the message back */}
                    <Input
                        label={promptLabel}
                        hideLabel
                        id="ai-prompt"
                        name="prompt"
                        type="text"
                        required
                        maxLength={1000}
                        autoComplete="off"
                        placeholder={promptPlaceholder}
                        aria-describedby={aiEnabled ? undefined : "ai-disabled-info"}
                        defaultValue={state?.values.prompt}
                        className="my-0 h-[60px] w-full rounded-full border-0 bg-grey-50 pr-16 pl-8 text-xs placeholder:text-grey-800"
                    />
                    {/* The orange round button with the white star: it sends the message */}
                    <button
                        type="submit"
                        disabled={isAsking}
                        aria-label="Envoyer"
                        className="absolute top-1/2 right-8 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-brand-dark transition-colors hover:bg-grey-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Image src={AIIcon} alt="" width={10} />
                    </button>
                </form>
            </div>
        </>
    )
}