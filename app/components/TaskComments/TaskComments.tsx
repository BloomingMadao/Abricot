"use client"

import Image from "next/image"
import { useActionState, useId, useState } from "react"
import { createCommentAction, type CommentFormState } from "@/app/lib/actions"
import { formatDateTime } from "@/app/lib/utils"
import type { TaskDetail, UserSummary } from "@/app/lib/types"
import Input from "@/app/components/Input/Input"
import Button from "@/app/components/Button/Button"
import Alert from "@/app/components/Alert/Alert"
import UserAvatar from "@/app/components/UserAvatar/UserAvatar"
import DropdownIcon from "@/public/image/dropdown.svg"

type TaskCommentsProps = {
    task: TaskDetail
    // The logged-in user: their avatar is shown next to the "Ajouter un commentaire" field
    currentUser: UserSummary
}

// The bottom of a task card: "Commentaires (n)", which expands to show
// the comments and add one.
// CLIENT component: it remembers whether it's expanded, and handles the form.
export default function TaskComments({ task, currentUser }: TaskCommentsProps) {
    const [isOpen, setIsOpen] = useState(false)
    // Unique id to link the button to the area it expands (aria-controls)
    const panelId = useId()

    // "Envoyer" greyed out while the (required) field is empty
    const [isValid, setIsValid] = useState(false)

    // We "wrap" the Server Action: after a successful submission, React clears the field,
    // so "Envoyer" must go back to greyed out
    async function submit(previousState: CommentFormState, formData: FormData) {
        const result = await createCommentAction(previousState, formData)
        if (result?.success) setIsValid(false)
        return result
    }
    const [state, formAction, isPending] = useActionState(submit, undefined)

    return (
        <div>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                // aria-expanded: tells the screen reader whether the area is expanded
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full cursor-pointer items-center justify-between text-sm text-grey-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-dark"
            >
                Commentaires ({task.comments.length})
                {/* As in the mockup: the arrow points UP when collapsed,
                    DOWN when expanded (dropdown.svg points down) */}
                <Image
                    src={DropdownIcon}
                    alt=""
                    width={16}
                    className={`mr-[5px] transition-transform duration-300 ${isOpen ? "" : "rotate-180"}`}
                />
            </button>

            {/* hidden: the area stays in the page, just hidden when collapsed
                (text being typed isn't lost when collapsing) */}
            <div id={panelId} hidden={!isOpen} className="mt-6">
                {/* The comments, from oldest to newest (the API's order) */}
                {task.comments.length > 0 && (
                    <ul className="mb-4 flex flex-col gap-4">
                        {task.comments.map((comment) => (
                            // text-xs: the size of the initials in the avatar
                            <li key={comment.id} className="flex gap-4 text-xs">
                                {/* decorative: the name is written in the bubble */}
                                <UserAvatar user={comment.author} decorative />
                                {/* The grey bubble: name + date at the top, text below */}
                                <div className="flex-1 rounded-[10px] bg-grey-100 p-4">
                                    <div className="flex items-baseline justify-between gap-4">
                                        <p className="text-sm text-grey-800">
                                            {comment.author.name || comment.author.email}
                                        </p>
                                        <time dateTime={comment.createdAt} className="shrink-0 text-grey-600">
                                            {formatDateTime(comment.createdAt)}
                                        </time>
                                    </div>
                                    <p className="mt-4 text-grey-800">{comment.content}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {/* Add a comment */}
                <form action={formAction} onInput={(event) => setIsValid(event.currentTarget.checkValidity())}>
                    {/* Error returned by the API (text too long...) */}
                    {state && !state.success && (
                        <Alert message={state.message} errors={state.errors} variant="error" />
                    )}

                    {/* Hidden fields: the action needs to know on WHICH task to comment */}
                    <input type="hidden" name="projectId" value={task.projectId} />
                    <input type="hidden" name="taskId" value={task.id} />

                    <div className="flex gap-4 text-xs">
                        {/* The logged-in user, in orange ("brand" variant) as in the mockup */}
                        <UserAvatar user={currentUser} variant="brand" decorative />
                        <Input
                            variant="textarea"
                            label="Ajouter un commentaire"
                            hideLabel
                            id={`comment-${task.id}`}
                            name="content"
                            required
                            rows={3}
                            placeholder="Ajouter un commentaire..."
                            // After an error, React resets the form: we keep the typed text
                            defaultValue={state?.values.content}
                            // flex-1: the field takes all the remaining width
                            wrapperClassName="flex-1"
                            // Tailwind classes take precedence over those of .input-default
                            // (border, margins, width...): light grey background, no border, as in the mockup.
                            // min-h-[83px]: the height from the mockup (3 lines of text are slightly less)
                            className="my-0 min-h-[83px] w-full resize-none rounded-[10px] border-0 bg-grey-50 px-4 text-xs placeholder:text-grey-800"
                        />
                    </div>

                    {/* justify-end: "Envoyer" on the right.
                        mx-0 w-[206px]: its width in the mockup (instead of .button-primary's 256px) */}
                    <div className="mt-4 flex justify-end">
                        <Button
                            label={isPending ? "Envoi..." : "Envoyer"}
                            variant="primary"
                            type="submit"
                            disabled={!isValid || isPending}
                            className="mx-0 w-[206px]"
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}