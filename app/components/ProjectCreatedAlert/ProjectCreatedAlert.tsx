"use client"

import { useState } from "react"
import Alert from "@/app/components/Alert/Alert"

type ProjectCreatedAlertProps = {
    projectName: string
}

// The "Le projet ... a été créé" message, at the bottom right of the screen.
// The project page shows it when the URL ends with ?created=1
// (createProjectAction is what adds this ?created=1 when redirecting).
// CLIENT component: it remembers whether the message has been dismissed (cross).
export default function ProjectCreatedAlert({ projectName }: ProjectCreatedAlertProps) {
    const [isVisible, setIsVisible] = useState(true)

    if (!isVisible) return null

    function close() {
        setIsVisible(false)
        // We remove created=1 from the URL (without reloading the page): if the page is
        // refreshed or the link is copied, the message doesn't come back.
        // The other parameters stay (from=dashboard: where the "back" button goes).
        // We do it on close, and NOT as soon as we land on the page: right after the
        // redirect, Next.js is still finishing rendering the page, and changing the URL at that
        // moment can disrupt its router ("called use() to suspend..." error).
        const url = new URL(window.location.href)
        url.searchParams.delete("created")
        window.history.replaceState(null, "", url.pathname + url.search)
    }

    return (
        // fixed: placed on top of the page, at the bottom right (as before in CreateProjectButton)
        <div className="fixed right-6 bottom-6 z-50">
            <Alert
                message={`Le projet « ${projectName} » a été créé`}
                variant="success"
                onClose={close}
            />
        </div>
    )
}