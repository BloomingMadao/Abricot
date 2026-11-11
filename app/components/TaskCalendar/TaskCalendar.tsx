"use client"

import { useState } from "react"
import Modal from "@/app/components/Modal/Modal"
import Button from "@/app/components/Button/Button"
import IconButton from "@/app/components/IconButton/IconButton"
import UpdateTaskContent from "@/app/components/UpdateTaskContent/UpdateTaskContent"
import { TASK_STATUS_LABELS, editTaskError } from "@/app/lib/utils"
import type { TaskDetail, TaskStatus, UserSummary } from "@/app/lib/types"

type TaskCalendarProps = {
    // The tasks to show (already filtered by status and search in ProjectTasks)
    tasks: TaskDetail[]
    // For the "Modifier" modal: the people who can be assigned, and the rights
    members: UserSummary[]
    currentUser: UserSummary
    isOwner: boolean
}

// Monday first, as in French calendars
const WEEKDAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]

// Tasks shown in a day before "+ N autres" (like Google Calendar)
const MAX_TASKS_PER_DAY = 3

// Light background of a task, by status (the colors of the status tags)
const STATUS_BACKGROUNDS: Record<TaskStatus, string> = {
    TODO: "bg-error-light",
    IN_PROGRESS: "bg-warning-light",
    DONE: "bg-success-light",
}

// The 3 statuses, for the legend
const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"]

// ----------------------------------------------------------------------------
// Dates. A day is written "YYYY-MM-DD": easy to compare and to use as a key.
// ----------------------------------------------------------------------------

// The day of a date in Paris time, like everywhere else in the app (formatShortDate).
// "en-CA": the format of this locale is exactly YYYY-MM-DD
const PARIS_DAY = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
})
function dayKey(date: Date | string): string {
    return PARIS_DAY.format(new Date(date))
}

// The calendar days are built in UTC: no daylight saving time surprise when adding days
const MONTH_LABEL = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" })
const DAY_LABEL = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })

type Month = { year: number; month: number } // month: 0 = January, as in JavaScript dates

/** "novembre 2026" */
function monthLabel({ year, month }: Month): string {
    return MONTH_LABEL.format(Date.UTC(year, month, 1))
}

/** The month of a "YYYY-MM-DD" (or "YYYY-MM") key */
function monthOf(key: string): Month {
    const [year, month] = key.split("-").map(Number)
    return { year, month: month - 1 }
}

/** The days shown for a month: from the Monday before the 1st to the Sunday after
 *  the last day (5 or 6 weeks, like Google Calendar), week by week */
function monthWeeks({ year, month }: Month): Date[][] {
    const first = new Date(Date.UTC(year, month, 1))
    // Days of the previous month to show before the 1st (getUTCDay: Sunday = 0, so Monday = 0 here)
    const offset = (first.getUTCDay() + 6) % 7
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
    const weekCount = Math.ceil((offset + daysInMonth) / 7)
    // Date.UTC handles the overflows: day 0 = last day of the previous month, day 32 = next month
    return Array.from({ length: weekCount }, (_, week) =>
        Array.from({ length: 7 }, (_, day) => new Date(Date.UTC(year, month, 1 - offset + week * 7 + day)))
    )
}

// ----------------------------------------------------------------------------
// Small pieces
// ----------------------------------------------------------------------------

// The status icon of a task. The SHAPE changes too, not only the color
// (readable without seeing colors). Inspired by Linear:
// empty circle = to do, half circle = in progress, check = done
function StatusIcon({ status }: { status: TaskStatus }) {
    if (status === "TODO") {
        return (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0 text-error">
                <circle cx="6" cy="6" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
        )
    }
    if (status === "IN_PROGRESS") {
        return (
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0 text-warning">
                <circle cx="6" cy="6" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 1.25a4.75 4.75 0 0 1 0 9.5Z" fill="currentColor" />
            </svg>
        )
    }
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="shrink-0 text-success">
            <circle cx="6" cy="6" r="6" fill="currentColor" />
            <path d="M3.5 6.2 5.2 7.8 8.5 4.4" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

type TaskChipProps = {
    task: TaskDetail
    // Assigned to the logged-in user: orange border, like in the List view
    isMine: boolean
    onOpen: () => void
}

// A task in the calendar: status icon + title, on the light color of its status.
// A button: a click opens the "Modifier" modal of the task.
function TaskChip({ task, isMine, onOpen }: TaskChipProps) {
    return (
        <button
            type="button"
            onClick={onOpen}
            // title: the whole title on hover (it is cut with "…" when too long)
            title={task.title}
            className={`flex w-full cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-left text-xs text-grey-800 transition-shadow hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-dark ${
                STATUS_BACKGROUNDS[task.status]
            } ${isMine ? "border-brand-dark" : "border-transparent"}`}
        >
            <StatusIcon status={task.status} />
            {/* truncate: one line, "…" at the end. Done tasks are crossed out (like Google Tasks) */}
            <span className={`truncate ${task.status === "DONE" ? "line-through" : ""}`}>{task.title}</span>
            {/* For screen readers: what the icon and the border show */}
            <span className="sr-only">
                , {TASK_STATUS_LABELS[task.status]}
                {isMine ? ", assignée à vous" : ""}
            </span>
        </button>
    )
}

// ----------------------------------------------------------------------------
// The calendar
// ----------------------------------------------------------------------------

// The "Calendrier" view of a project page: a month grid (like Google Calendar),
// each task on the day of its due date.
// CLIENT component: it remembers the month shown, the opened task...
// It only appears after a click on "Calendrier": today's date is read in the browser.
export default function TaskCalendar({ tasks, members, currentUser, isOwner }: TaskCalendarProps) {
    // Today (lazy initial value: computed once, when the calendar appears)
    const [today] = useState(() => dayKey(new Date()))
    // The month shown: today's month at first
    const [shown, setShown] = useState<Month>(() => monthOf(today))
    // The day whose "+ N autres" was clicked (all its tasks are shown)
    const [expandedDay, setExpandedDay] = useState<string | null>(null)
    // The task opened in the "Modifier" modal
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

    function showMonth(month: Month) {
        setShown(month)
        setExpandedDay(null)
    }

    // Previous (-1) or next (+1) month. Date.UTC handles the years (month 12 = January of next year)
    function moveMonth(offset: number) {
        const date = new Date(Date.UTC(shown.year, shown.month + offset, 1))
        showMonth({ year: date.getUTCFullYear(), month: date.getUTCMonth() })
    }

    // The tasks, grouped by day of due date ("YYYY-MM-DD" → tasks, still in priority order).
    // Those without a due date are listed below the calendar.
    const tasksByDay = new Map<string, TaskDetail[]>()
    const withoutDueDate: TaskDetail[] = []
    for (const task of tasks) {
        if (!task.dueDate) {
            withoutDueDate.push(task)
            continue
        }
        const key = dayKey(task.dueDate)
        tasksByDay.set(key, [...(tasksByDay.get(key) ?? []), task])
    }

    // No task in the month shown: we offer to jump to the closest month that has some
    // (the next one, otherwise the last one before), so the user doesn't search month by month
    const shownKey = `${shown.year}-${String(shown.month + 1).padStart(2, "0")}`
    const monthsWithTasks = [...new Set([...tasksByDay.keys()].map((key) => key.slice(0, 7)))].sort()
    const hasTasksThisMonth = monthsWithTasks.includes(shownKey)
    const closestMonth =
        monthsWithTasks.find((key) => key > shownKey) ?? monthsWithTasks.findLast((key) => key < shownKey)

    const shownLabel = monthLabel(shown)
    const selectedTask = tasks.find((task) => task.id === selectedTaskId)
    const isMine = (task: TaskDetail) => task.assignees.some(({ user }) => user.id === currentUser.id)

    return (
        <div className="mt-[41px]">
            {/* Toolbar, like Google Calendar: "Aujourd'hui", previous / next month, the month shown.
                Button: the "secondary" style of the app; h-[57px]: the height of the IconButtons next to it.
                IconButton: the same square buttons as the "back" arrow of the page */}
            <div className="flex flex-wrap items-center gap-3">
                <Button
                    label="Aujourd'hui"
                    type="button"
                    variant="secondary"
                    onClick={() => showMonth(monthOf(today))}
                    className="mx-0 h-[57px] w-auto px-7"
                />
                <IconButton variant="previous" label="Mois précédent" onClick={() => moveMonth(-1)} />
                <IconButton variant="next" label="Mois suivant" onClick={() => moveMonth(1)} />
                {/* aria-live: a screen reader announces the new month after a click.
                    first-letter:uppercase: "Novembre 2026" */}
                <p aria-live="polite" className="ml-2 text-lg font-semibold text-grey-800 first-letter:uppercase">
                    {shownLabel}
                </p>
            </div>

            {!hasTasksThisMonth && (
                <p className="mt-4 flex flex-wrap items-center gap-3 text-sm text-grey-600">
                    Aucune tâche avec une échéance en {shownLabel}.
                    {/* Button "secondary", smaller: w-auto px-4 py-1 text-sm */}
                    {closestMonth && (
                        <Button
                            label={`Voir ${monthLabel(monthOf(closestMonth))}`}
                            type="button"
                            variant="secondary"
                            onClick={() => showMonth(monthOf(closestMonth))}
                            className="mx-0 w-auto px-4 py-1 text-sm"
                        />
                    )}
                </p>
            )}

            {/* The month grid: a real <table> (screen readers announce the day of the week
                of each cell). table-fixed: 7 columns of the same width */}
            <table className="mt-6 w-full table-fixed border-collapse">
                <caption className="sr-only">Tâches de {shownLabel}, par date d&apos;échéance</caption>
                <thead>
                    <tr>
                        {WEEKDAYS.map((weekday) => (
                            <th key={weekday} scope="col" className="pb-3 text-xs font-normal tracking-wide text-grey-600 uppercase">
                                {/* "LUN." on screen, "Lundi" for screen readers */}
                                <span aria-hidden="true">{weekday.slice(0, 3)}.</span>
                                <span className="sr-only">{weekday}</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {monthWeeks(shown).map((week) => (
                        <tr key={week[0].toISOString()}>
                            {week.map((day) => {
                                const key = day.toISOString().slice(0, 10)
                                const isInMonth = day.getUTCMonth() === shown.month
                                const isToday = key === today
                                const dayTasks = tasksByDay.get(key) ?? []
                                const isExpanded = expandedDay === key
                                const visibleTasks = isExpanded ? dayTasks : dayTasks.slice(0, MAX_TASKS_PER_DAY)
                                const hiddenCount = dayTasks.length - MAX_TASKS_PER_DAY

                                return (
                                    // aria-current="date": today's cell, for screen readers.
                                    // The days of the previous / next month on a light grey background
                                    <td
                                        key={key}
                                        aria-current={isToday ? "date" : undefined}
                                        className={`h-[124px] border border-grey-200 p-1.5 align-top ${isInMonth ? "bg-white" : "bg-grey-50"}`}
                                    >
                                        <p className="mb-1 flex justify-center">
                                            {/* Today: the number in a light orange circle (like Google's blue circle) */}
                                            <span
                                                aria-hidden="true"
                                                className={`flex size-7 items-center justify-center rounded-full text-xs ${
                                                    isToday
                                                        ? "bg-brand-light font-semibold text-grey-800"
                                                        : isInMonth
                                                          ? "text-grey-800"
                                                          : "text-grey-600"
                                                }`}
                                            >
                                                {day.getUTCDate()}
                                            </span>
                                            {/* For screen readers: "mardi 10 novembre, aujourd'hui, 2 tâches" */}
                                            <span className="sr-only">
                                                {DAY_LABEL.format(day)}
                                                {isToday ? ", aujourd'hui" : ""}
                                                {dayTasks.length > 0
                                                    ? `, ${dayTasks.length} tâche${dayTasks.length > 1 ? "s" : ""}`
                                                    : ""}
                                            </span>
                                        </p>

                                        {visibleTasks.length > 0 && (
                                            <ul className="flex flex-col gap-1">
                                                {visibleTasks.map((task) => (
                                                    <li key={task.id}>
                                                        <TaskChip
                                                            task={task}
                                                            isMine={isMine(task)}
                                                            onOpen={() => setSelectedTaskId(task.id)}
                                                        />
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {/* Too many tasks: "+ 2 autres" shows them all in the cell, "Réduire" hides them.
                                            Button "secondary", small enough for a cell (w-full py-0.5 text-xs).
                                            expanded: tells screen readers whether the tasks are shown */}
                                        {hiddenCount > 0 && (
                                            <Button
                                                label={isExpanded ? "Réduire" : `+ ${hiddenCount} autre${hiddenCount > 1 ? "s" : ""}`}
                                                type="button"
                                                variant="secondary"
                                                expanded={isExpanded}
                                                onClick={() => setExpandedDay(isExpanded ? null : key)}
                                                className="mx-0 mt-1 block w-full rounded-md py-0.5 text-xs"
                                            />
                                        )}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* The tasks without a due date have no day: they are listed under the calendar */}
            {withoutDueDate.length > 0 && (
                <div className="mt-8">
                    <p className="text-sm text-grey-800">Sans échéance ({withoutDueDate.length})</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                        {withoutDueDate.map((task) => (
                            <li key={task.id} className="w-[220px]">
                                <TaskChip task={task} isMine={isMine(task)} onOpen={() => setSelectedTaskId(task.id)} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Legend: what the icons and the orange border mean */}
            <ul aria-label="Légende" className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-grey-600">
                {STATUSES.map((status) => (
                    <li key={status} className="flex items-center gap-1.5">
                        <StatusIcon status={status} />
                        {TASK_STATUS_LABELS[status]}
                    </li>
                ))}
                <li className="flex items-center gap-1.5">
                    <span aria-hidden="true" className="h-3 w-5 rounded-sm border border-brand-dark bg-white" />
                    Vos tâches
                </li>
            </ul>

            {/* Click on a task: its "Modifier" modal (the same form as in the "…" menu).
                Neither the project owner nor assigned to the task: the red message instead */}
            <Modal title="Modifier" isOpen={selectedTask !== undefined} onClose={() => setSelectedTaskId(null)}>
                {selectedTask && (
                    <UpdateTaskContent
                        task={selectedTask}
                        members={members}
                        forbiddenMessage={editTaskError(
                            selectedTask.assignees.map(({ user }) => user.id),
                            currentUser.id,
                            isOwner
                        )}
                        onClose={() => setSelectedTaskId(null)}
                    />
                )}
            </Modal>
        </div>
    )
}