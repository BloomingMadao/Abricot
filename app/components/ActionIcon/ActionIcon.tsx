type ActionIconProps = {
    // "edit": a pencil, "delete": a trash can
    variant: "edit" | "delete"
}

// The small icons of the "Modifier" and "Supprimer" actions, drawn in SVG.
// fill="currentColor": they take the color of the text next to them
// (grey, red for "Supprimer", darker on hover...).
// aria-hidden: decorative, the text next to them gives the action its name.
// Used by the "…" menu of a task (TaskMenu) and by the AI suggestions (SuggestedTaskCard):
// before, the same two SVGs were copied in both files.
export default function ActionIcon({ variant }: ActionIconProps) {
    if (variant === "edit") {
        return (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true" className="shrink-0">
                <path d="M10.3.7a1.6 1.6 0 0 1 2.3 0l.7.7a1.6 1.6 0 0 1 0 2.3L5 12 1 13l1-4L10.3.7Z" />
            </svg>
        )
    }

    return (
        <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden="true" className="shrink-0">
            <path d="M4 0h4l.5 1H12v1.5H0V1h3.5L4 0ZM1 3.5h10l-.7 9.6A1 1 0 0 1 9.3 14H2.7a1 1 0 0 1-1-.9L1 3.5Z" />
        </svg>
    )
}