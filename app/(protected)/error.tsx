"use client"

import { useEffect } from "react"
import Button from "@/app/components/Button/Button"

type ProtectedErrorProps = {
    error: Error & { digest?: string }
    // Displays the page again (new attempt)
    reset: () => void
}

// Special Next.js file: shown when a page of (protected) crashes (unexpected error),
// instead of a blank page. The header and the footer stay displayed.
// "use client": Next.js requires it for error.tsx (the "Réessayer" button reacts to clicks).
export default function ProtectedError({ error, reset }: ProtectedErrorProps) {
    // The detail stays in the browser console (never shown to the user)
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="page-container">
            <div className="panel">
                <h1 className="h5">Une erreur est survenue</h1>
                <p className="mt-2 text-grey-600">La page n&apos;a pas pu s&apos;afficher. Réessayez dans un instant.</p>
                <Button label="Réessayer" type="button" variant="primary" onClick={reset} className="mx-0 mt-6" />
            </div>
        </div>
    )
}