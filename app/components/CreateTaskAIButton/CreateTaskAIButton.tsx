"use client"

import Image from "next/image"
import { useState } from "react"
import type { UserSummary } from "@/app/lib/types"
import Button from "@/app/components/Button/Button"
import Modal from "@/app/components/Modal/Modal"
import CreateTaskAIForm from "@/app/components/CreateTaskAIForm/CreateTaskAIForm"
import AIIcon from "@/public/image/AIIcon.svg"
import AIIconHover from "@/public/image/AIIconHover.svg"

type CreateTaskAIButtonProps = {
    // The project in which the tasks will be created
    projectId: string
    // false = AI mode off (USE_IA=false or no TOKEN_IA): the modal asks for a number of tasks
    aiEnabled: boolean
    // The project members and the logged-in user: for "Assigné à" in "Modifier"
    members: UserSummary[]
    currentUser: UserSummary
}

// The "IA" button of a project page + the AI modal ("Créer une tâche" then "Vos tâches...").
// Same principle as CreateTaskButton: CLIENT component that remembers whether the modal is open.
export default function CreateTaskAIButton({ projectId, aiEnabled, members, currentUser }: CreateTaskAIButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    // Are there suggested tasks in the modal? It changes the modal's title
    const [hasTasks, setHasTasks] = useState(false)

    // Closing empties the modal (its content is removed): the next opening starts fresh
    function close() {
        setIsOpen(false)
        setHasTasks(false)
    }

    return (
        <>
            {/* className: Tailwind classes take precedence over the button's own classes
                (mx-0: no margin, w-auto: width fits the text, self-auto: not centered).
                py-3: .button-highlight has a border (2px more), py-3 keeps it 50px tall.
                group: lets the icons inside react to the hover of the button */}
            <Button
                label={
                    <>
                        {/* The mockup's star: two stacked icons, like in MenuItems.
                            The white one on the orange button; on hover the button turns light orange,
                            so the white one fades out and the orange one appears (group-hover).
                            alt="": decorative, the "IA" text gives the button its name */}
                        <span className="relative block size-[13px] shrink-0">
                            <Image
                                src={AIIcon}
                                alt=""
                                width={13}
                                className="absolute inset-0 transition-opacity duration-300 ease-out group-hover:opacity-0"
                            />
                            <Image
                                src={AIIconHover}
                                alt=""
                                width={13}
                                className="absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                            />
                        </span>
                        IA
                        {/* For a screen reader: "IA, créer des tâches" rather than just "IA" */}
                        <span className="sr-only">, créer des tâches</span>
                    </>
                }
                type="button"
                variant="highlight"
                onClick={() => setIsOpen(true)}
                className="group mx-0 flex w-auto items-center gap-[13px] self-auto px-6 py-3"
            />

            {/* icon: the orange star before the title.
                className: the AI modal's own spacing (52px on the sides from md, 24px on a phone,
                no bottom padding: the chat at the bottom handles it) */}
            <Modal
                title={hasTasks ? "Vos tâches..." : "Créer une tâche"}
                icon={<Image src={AIIconHover} alt="" width={20} />}
                isOpen={isOpen}
                onClose={close}
                className="px-6 pt-14 md:px-[52px] md:pt-20"
            >
                <CreateTaskAIForm
                    projectId={projectId}
                    aiEnabled={aiEnabled}
                    members={members}
                    currentUser={currentUser}
                    onHasTasksChange={setHasTasks}
                    onSuccess={close}
                />
            </Modal>
        </>
    )
}