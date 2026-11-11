import type { ReactNode } from "react"

type PageHeaderProps = {
    // The page's title (its <h1>): "Tableau de bord", "Mes projets"
    title: string
    // The sentence below the title
    subtitle: ReactNode
    // The button on the right ("+ Créer un projet")
    action?: ReactNode
}

// The top of the "Tableau de bord" and "Mes projets" pages: title + sentence on the left, button on the right.
// Before, the same block was written in both pages.
// Responsive: on a phone the button goes below the text (flex-col), on the same line from sm (640px).
export default function PageHeader({ title, subtitle, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
                {/* h1: the page's main heading (only one per page).
                    Class h5: the mockup's look (18px), instead of the global h1 style (40px orange) */}
                <h1 className="h5">{title}</h1>
                <p className="mt-4">{subtitle}</p>
            </div>
            {action}
        </div>
    )
}