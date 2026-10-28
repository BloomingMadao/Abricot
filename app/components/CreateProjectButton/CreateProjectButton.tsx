"use client"

import { useState } from "react"
import Button from "@/app/components/Button/Button"
import Modal from "@/app/components/Modal/Modal"
import Alert from "@/app/components/Alert/Alert"
import CreateProjectForm from "@/app/components/CreateProjectForm/CreateProjectForm"

type CreateProjectButtonProps = {
    // Email de la personne connectée (pour ne pas se proposer soi-même comme contributeur)
    currentUserEmail: string
}

// Le bouton "+ Créer un projet" + sa modale + le message de confirmation.
// Composant CLIENT : il retient si la modale est ouverte.
export default function CreateProjectButton({ currentUserEmail }: CreateProjectButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    // Nom du projet qui vient d'être créé (pour le message de confirmation)
    const [createdProject, setCreatedProject] = useState<string | null>(null)

    return (
        <>
            <Button
                label="+ Créer un projet"
                type="button"
                variant="primary"
                onClick={() => {
                    setCreatedProject(null)
                    setIsOpen(true)
                }}
            />

            <Modal title="Créer un projet" isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <CreateProjectForm
                    currentUserEmail={currentUserEmail}
                    onSuccess={(projectName) => {
                        setIsOpen(false)
                        setCreatedProject(projectName)
                    }}
                />
            </Modal>

            {/* Confirmation en bas à droite de l'écran (fixed), fermable avec la croix */}
            {createdProject && (
                <div className="fixed right-6 bottom-6 z-50">
                    <Alert
                        message={`Le projet « ${createdProject} » a été créé`}
                        variant="success"
                        onClose={() => setCreatedProject(null)}
                    />
                </div>
            )}
        </>
    )
}