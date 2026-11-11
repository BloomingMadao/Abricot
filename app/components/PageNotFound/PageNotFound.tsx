import Link from "next/link"

// The content of the "page not found" pages (see app/not-found.tsx and app/(protected)/not-found.tsx).
// A project that doesn't exist, or that the user is not a member of, also ends up here:
// the specifications say a person who is not in the project can't access it.
export default function PageNotFound() {
    return (
        <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="mb-0">Page introuvable</h1>
            <p className="text-grey-600">
                Cette page n&apos;existe pas, ou vous n&apos;y avez pas accès.
            </p>
            <Link href="/dashboard" className="link">
                Retour au tableau de bord
            </Link>
        </div>
    )
}