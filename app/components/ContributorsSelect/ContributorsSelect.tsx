"use client"

import Image from "next/image"
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { searchUsersAction } from "@/app/lib/actions"
import type { UserSummary } from "@/app/lib/types"
import Input from "@/app/components/Input/Input"
import DropdownIcon from "@/public/image/dropdown.svg"

type ContributorsSelectProps = {
    label: string
    // Name sent with the form: each CHECKED box sends name = email (or id, see valueKey)
    name: string
    // Email that is never suggested (the logged-in user: they are already the owner)
    excludeEmail?: string
    // FIXED list of people to suggest (e.g. a project's members).
    // Provided: no search field, all the people are displayed.
    // Missing: we search among all users (as when creating a project).
    options?: UserSummary[]
    // People already checked at the start (e.g. a task's current assignees)
    defaultSelected?: UserSummary[]
    // What a checked box sends: the email (project creation) or the id (task assignees)
    valueKey?: "email" | "id"
}

// "Multiple choice" dropdown list.
// Without options: with a search, because the API can't list ALL users,
// it can only search (searchUsers, 2 characters minimum).
export default function ContributorsSelect({
    label,
    name,
    excludeEmail,
    options,
    defaultSelected = [],
    valueKey = "email",
}: ContributorsSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState("")
    // The rows displayed in the list. They only change on each SEARCH:
    // so checking / unchecking never makes a row disappear under the mouse
    const [rows, setRows] = useState<UserSummary[]>(defaultSelected)
    const [message, setMessage] = useState("Tapez au moins 2 caractères")
    const [selected, setSelected] = useState<UserSummary[]>(defaultSelected)

    const wrapperRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const latestQueryRef = useRef("")
    const id = useId()

    // Same idea as UserMenu: a click outside closes the list
    useEffect(() => {
        if (!isOpen) return
        searchRef.current?.focus() // so you can type right away
        function handleClickOutside(event: PointerEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("pointerdown", handleClickOutside)
        return () => document.removeEventListener("pointerdown", handleClickOutside)
    }, [isOpen])

    // Escape closes the LIST only (without closing the surrounding modal)
    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape" && isOpen) {
            event.preventDefault() // prevents the <dialog> modal from closing too
            event.stopPropagation()
            setIsOpen(false)
            buttonRef.current?.focus()
        }
    }

    // Search on every keystroke, but only 300 ms after the last key
    // (otherwise we would call the API on every letter)
    function handleSearch(value: string) {
        setQuery(value)
        latestQueryRef.current = value
        if (timerRef.current) clearTimeout(timerRef.current)

        if (value.trim().length < 2) {
            setRows(selected) // show at least the people already selected
            setMessage("Tapez au moins 2 caractères")
            return
        }

        setMessage("Recherche…")
        timerRef.current = setTimeout(async () => {
            const { users, error } = await searchUsersAction(value)
            // An older response must not overwrite a more recent search
            if (value !== latestQueryRef.current) return
            const found = users.filter((user) => user.email !== excludeEmail)
            // The people already selected first, then the new results
            setRows([...selected, ...found.filter((user) => !selected.some((s) => s.id === user.id))])
            setMessage(error ?? (found.length === 0 ? "Aucun utilisateur trouvé" : ""))
        }, 300)
    }

    function toggle(user: UserSummary) {
        setSelected((current) =>
            current.some((u) => u.id === user.id)
                ? current.filter((u) => u.id !== user.id)
                : [...current, user]
        )
    }

    const displayName = (user: UserSummary) => user.name || user.email

    // With a fixed list: always show all the options (no search)
    const visibleRows = options ?? rows
    const visibleMessage = options
        ? options.length === 0 ? "Personne à proposer" : ""
        : message

    // The "field" text: 1 person → their name, several → "2 collaborateurs" (as in the mockup)
    const summary =
        selected.length === 0
            ? "Choisir un ou plusieurs collaborateurs"
            : selected.length === 1
              ? displayName(selected[0])
              : `${selected.length} collaborateurs`

    return (
        // mb-6: same spacing below the field as the other fields of the modal
        <div ref={wrapperRef} className="mb-6 flex flex-col gap-2" onKeyDown={handleKeyDown}>
            <label htmlFor={`${id}-button`}>{label}</label>

            {/* "relative": the list (in "absolute") opens right below the field */}
            <div className="relative">
                {/* The "field": a BUTTON that opens / closes the list (it's not a real input
                    field, so not an Input). input-default gives it the same look, my-0 removes its margins */}
                <button
                    ref={buttonRef}
                    id={`${id}-button`}
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-controls={`${id}-panel`}
                    className="input-default my-0 flex w-full cursor-pointer items-center justify-between gap-4 text-left text-sm"
                >
                    <span className={`truncate ${selected.length === 0 ? "text-grey-600" : ""}`}>
                        {summary}
                    </span>
                    {/* The arrow flips when the list is open */}
                    <Image
                        src={DropdownIcon}
                        alt=""
                        className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                </button>

                {/* The list stays in the page even when closed (hidden = just hidden):
                    its CHECKED boxes are what gets sent with the form */}
                <div
                    id={`${id}-panel`}
                    hidden={!isOpen}
                    className="absolute top-full right-0 left-0 z-10 mt-1 rounded-sm border border-grey-200 bg-white p-4 shadow-lg"
                >
                    {/* The search field only exists without a fixed list */}
                    {!options && (
                        <Input
                            ref={searchRef}
                            id={`${id}-search`}
                            label="Rechercher un collaborateur"
                            hideLabel
                            type="search"
                            // name="": the search itself is NOT sent with the form
                            name=""
                            value={query}
                            onChange={(event) => handleSearch(event.target.value)}
                            // Enter in the search must NOT submit the form
                            onKeyDown={(event) => {
                                if (event.key === "Enter") event.preventDefault()
                            }}
                            placeholder="Rechercher par nom ou email"
                            autoComplete="off"
                            className="my-0 h-10 w-full px-3 text-sm"
                        />
                    )}

                    {visibleMessage && <p className="mt-3 text-sm text-grey-600">{visibleMessage}</p>}

                    {visibleRows.length > 0 && (
                        // fieldset + legend: the checkboxes form a group
                        // first:mt-0: no top margin when nothing is displayed above (no search)
                        <fieldset className="mt-3 max-h-56 overflow-y-auto first:mt-0">
                            <legend className="sr-only">Collaborateurs</legend>
                            {visibleRows.map((user) => (
                                // A checked box sends name = email or id (e.g. contributors = bob@example.com).
                                // The Server Action gets them all with formData.getAll(name).
                                //
                                // defaultChecked (and not checked): after each submission, React resets the
                                // form. With checked, the box got unchecked in the page while
                                // React thought it was checked (and it was no longer sent). With
                                // defaultChecked, the reset goes back to the current selection.
                                <Input
                                    key={user.id}
                                    id={`${id}-${user.id}`}
                                    type="checkbox"
                                    name={name}
                                    value={user[valueKey]}
                                    defaultChecked={selected.some((s) => s.id === user.id)}
                                    onChange={() => toggle(user)}
                                    label={
                                        <>
                                            {displayName(user)}
                                            {user.name && <span className="ml-2 text-grey-600">{user.email}</span>}
                                        </>
                                    }
                                    wrapperClassName="rounded-sm px-2 py-2 text-sm hover:bg-brand-light"
                                />
                            ))}
                        </fieldset>
                    )}
                </div>
            </div>
        </div>
    )
}