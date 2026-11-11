import PageNotFound from "@/app/components/PageNotFound/PageNotFound"

// Special Next.js file: shown when a page of (protected) calls notFound()
// (e.g. the page of a project that doesn't exist or that the user is not a member of).
// It is displayed INSIDE the (protected) layout: the header and the footer stay.
export default function ProtectedNotFound() {
    return (
        <div className="page-container">
            <PageNotFound />
        </div>
    )
}