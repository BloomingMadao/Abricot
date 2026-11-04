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
    // La personne connectée : sa pastille s'affiche à côté du champ "Ajouter un commentaire"
    currentUser: UserSummary
}

// Le bas d'une carte de tâche : "Commentaires (n)", qu'on déplie pour voir
// les commentaires et en ajouter un.
// Composant CLIENT : il retient si c'est déplié, et gère le formulaire.
export default function TaskComments({ task, currentUser }: TaskCommentsProps) {
    const [isOpen, setIsOpen] = useState(false)
    // Identifiant unique pour relier le bouton à la zone qu'il déplie (aria-controls)
    const panelId = useId()

    // "Envoyer" grisé tant que le champ (required) est vide
    const [isValid, setIsValid] = useState(false)

    // On "enveloppe" la Server Action : après un envoi réussi, React vide le champ,
    // donc "Envoyer" doit redevenir grisé
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
                // aria-expanded : dit au lecteur d'écran si la zone est dépliée
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full cursor-pointer items-center justify-between text-sm text-grey-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-dark"
            >
                Commentaires ({task.comments.length})
                {/* Comme sur la maquette : la flèche pointe vers le HAUT quand c'est replié,
                    vers le BAS quand c'est déplié (dropdown.svg pointe vers le bas) */}
                <Image
                    src={DropdownIcon}
                    alt=""
                    width={16}
                    className={`mr-[5px] transition-transform duration-300 ${isOpen ? "" : "rotate-180"}`}
                />
            </button>

            {/* hidden : la zone reste dans la page, juste cachée quand c'est replié
                (le texte en cours de saisie n'est pas perdu si on replie) */}
            <div id={panelId} hidden={!isOpen} className="mt-6">
                {/* Les commentaires, du plus ancien au plus récent (l'ordre de l'API) */}
                {task.comments.length > 0 && (
                    <ul className="mb-4 flex flex-col gap-4">
                        {task.comments.map((comment) => (
                            // text-xs : la taille des initiales dans la pastille
                            <li key={comment.id} className="flex gap-4 text-xs">
                                {/* decorative : le nom est écrit dans la bulle */}
                                <UserAvatar user={comment.author} decorative />
                                {/* La bulle grise : nom + date en haut, texte en dessous */}
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

                {/* Ajouter un commentaire */}
                <form action={formAction} onInput={(event) => setIsValid(event.currentTarget.checkValidity())}>
                    {/* Erreur renvoyée par l'API (texte trop long...) */}
                    {state && !state.success && (
                        <Alert message={state.message} errors={state.errors} variant="error" />
                    )}

                    {/* Champs cachés : l'action doit savoir sur QUELLE tâche commenter */}
                    <input type="hidden" name="projectId" value={task.projectId} />
                    <input type="hidden" name="taskId" value={task.id} />

                    <div className="flex gap-4 text-xs">
                        {/* La personne connectée, en orange (variant "brand") comme sur la maquette */}
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
                            // Après une erreur, React remet le formulaire à zéro : on garde le texte tapé
                            defaultValue={state?.values.content}
                            // flex-1 : le champ prend toute la largeur restante
                            wrapperClassName="flex-1"
                            // Les classes Tailwind passent devant celles de .input-default
                            // (bordure, marges, largeur...) : fond gris clair, sans bordure, comme la maquette.
                            // min-h-[83px] : la hauteur de la maquette (3 lignes de texte font un peu moins)
                            className="my-0 min-h-[83px] w-full resize-none rounded-[10px] border-0 bg-grey-50 px-4 text-xs placeholder:text-grey-800"
                        />
                    </div>

                    {/* justify-end : "Envoyer" à droite.
                        mx-0 w-[206px] : sa largeur sur la maquette (au lieu des 256px de .button-primary) */}
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