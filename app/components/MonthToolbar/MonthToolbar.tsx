import Button from "@/app/components/Button/Button"
import IconButton from "@/app/components/IconButton/IconButton"
import { addMonths, closestMonthKey, formatMonth, monthKey, monthOf, type Month } from "@/app/lib/utils"

type MonthToolbarProps = {
    // The month shown
    month: Month
    // Today, "YYYY-MM-DD": the month the "Aujourd'hui" button goes back to
    today: string
    // The months that have tasks ("YYYY-MM"): when the month shown has none,
    // a button offers to jump to the closest one
    monthsWithTasks: string[]
    // Called with the new month (previous, next, today, closest month with tasks)
    onChange: (month: Month) => void
}

// The month navigation, like Google Calendar: "Aujourd'hui", previous / next month, the month shown.
// Shared by the "Calendrier" view of a project page (TaskCalendar)
// and the "Kanban" view of the dashboard (DashboardTasks: the tasks of the month, as in the specifications).
// No "use client": it has no state of its own, the parent (a client component) keeps the month.
export default function MonthToolbar({ month, today, monthsWithTasks, onChange }: MonthToolbarProps) {
    const label = formatMonth(month)
    const shownKey = monthKey(month)
    const hasTasks = monthsWithTasks.includes(shownKey)
    // No task in the month shown: the closest month that has some (the next one, otherwise the last one before),
    // so the user doesn't search month by month
    const closestKey = hasTasks ? undefined : closestMonthKey(monthsWithTasks, shownKey)

    return (
        <>
            {/* Button: the "secondary" style of the app; h-[57px]: the height of the IconButtons next to it.
                IconButton: the same square buttons as the "back" arrow of the project page.
                flex-wrap: on a narrow phone, the month goes below the buttons */}
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    label="Aujourd'hui"
                    type="button"
                    variant="secondary"
                    onClick={() => onChange(monthOf(today))}
                    className="mx-0 h-[57px] w-auto px-7"
                />
                <IconButton variant="previous" label="Mois précédent" onClick={() => onChange(addMonths(month, -1))} />
                <IconButton variant="next" label="Mois suivant" onClick={() => onChange(addMonths(month, 1))} />
                {/* aria-live: a screen reader announces the new month after a click.
                    first-letter:uppercase: "Novembre 2026" */}
                <p aria-live="polite" className="ml-2 text-lg font-semibold text-grey-800 first-letter:uppercase">
                    {label}
                </p>
            </div>

            {!hasTasks && (
                <p className="mt-4 flex flex-wrap items-center gap-3 text-sm text-grey-600">
                    Aucune tâche avec une échéance en {label}.
                    {/* Button "secondary", smaller: w-auto px-4 py-1 text-sm */}
                    {closestKey && (
                        <Button
                            label={`Voir ${formatMonth(monthOf(closestKey))}`}
                            type="button"
                            variant="secondary"
                            onClick={() => onChange(monthOf(closestKey))}
                            className="mx-0 w-auto px-4 py-1 text-sm"
                        />
                    )}
                </p>
            )}
        </>
    )
}