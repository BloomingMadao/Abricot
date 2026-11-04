"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Alert from "@/app/components/Alert/Alert"

type ProjectCreatedAlertProps = {
    projectName: string
}

// Le message "Le projet ... a été créé", en bas à droite de l'écran.
// La page du projet l'affiche quand l'adresse se termine par ?created=1
// (c'est createProjectAction qui ajoute ce ?created=1 en redirigeant).
// Composant CLIENT : il retient si le message est fermé (croix).
export default function ProjectCreatedAlert({ projectName }: ProjectCreatedAlertProps) {
    const [isVisible, setIsVisible] = useState(true)
    const pathname = usePathname()

    if (!isVisible) return null

    function close() {
        setIsVisible(false)
        // On enlève ?created=1 de l'adresse (sans recharger la page) : si on actualise
        // la page ou qu'on copie le lien, le message ne revient pas.
        // On le fait à la fermeture, et PAS dès l'arrivée sur la page : juste après la
        // redirection, Next.js finit encore d'afficher la page, et changer l'adresse à ce
        // moment-là peut perturber son routeur (erreur "called use() to suspend...").
        window.history.replaceState(null, "", pathname)
    }

    return (
        // fixed : posé par-dessus la page, en bas à droite (comme avant dans CreateProjectButton)
        <div className="fixed right-6 bottom-6 z-50">
            <Alert
                message={`Le projet « ${projectName} » a été créé`}
                variant="success"
                onClose={close}
            />
        </div>
    )
}