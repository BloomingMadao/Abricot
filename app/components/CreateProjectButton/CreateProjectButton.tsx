"use client"

import { useState } from "react"
import Button from "@/app/components/Button/Button"
import Modal from "@/app/components/Modal/Modal"
import CreateProjectForm from "@/app/components/CreateProjectForm/CreateProjectForm"

type CreateProjectButtonProps = {
    // Email de la personne connectée (pour ne pas se proposer soi-même comme contributeur)
    currentUserEmail: string
}

// Le bouton "+ Créer un projet" + sa modale.
// Composant CLIENT : il retient si la modale est ouverte.
// Une fois le projet créé, on arrive directement sur sa page (voir createProjectAction).
export default function CreateProjectButton({ currentUserEmail }: CreateProjectButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <Button
                label="+ Créer un projet"
                type="button"
                variant="primary"
                onClick={() => setIsOpen(true)}
            />

            <Modal title="Créer un projet" isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CreateProjectForm currentUserEmail={currentUserEmail} />
            </Modal>
        </>
    )
}