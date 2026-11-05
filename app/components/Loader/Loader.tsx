export default function Loader() {
    return (
        // role="status": tells screen readers that something is loading
        <div role="status" className="flex justify-center">
            {/* aria-hidden: the drawing is decorative, the hidden text is what gets read */}
            <svg
                className="size-9 animate-spin text-brand"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                {/* The full, pale circle: the "track" */}
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                {/* A dark quarter circle: this is the part you see spinning */}
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
            </svg>

            {/* sr-only: invisible on screen, but read by screen readers */}
            <span className="sr-only">Chargement…</span>
        </div>
    )
}