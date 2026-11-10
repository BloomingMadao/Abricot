"use client"

import { useState } from "react"
import Alert from "@/app/components/Alert/Alert"

type ProjectDeletedAlertProps = {
    projectName: string
}

// The "Le projet ... a été supprimé" message, at the bottom right of the screen
// (the twin of ProjectCreatedAlert).
// The projects page shows it when the URL ends with ?deleted=<name>
// (deleteProjectAction is what adds it when redirecting).
// CLIENT component: it remembers whether the message has been dismissed (cross).
export default function ProjectDeletedAlert({ projectName }: ProjectDeletedAlertProps) {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    function close() {
        setIsVisible(false)
        // We remove deleted=... from the URL (without reloading the page): if the page is
        // refreshed or the link is copied, the message doesn't come back.
        // Same reason as in ProjectCreatedAlert to do it on close only.
        const url = new URL(window.location.href)
        url.searchParams.delete("deleted")
        window.history.replaceState(null, "", url.pathname + url.search)
    }

    return (
        // fixed: placed on top of the page, at the bottom right (like ProjectCreatedAlert)
        <div className="fixed right-6 bottom-6 z-50">
            <Alert
                message={`Le projet « ${projectName} » a été supprimé`}
                variant="success"
                onClose={close}
            />
        </div>
    )
}