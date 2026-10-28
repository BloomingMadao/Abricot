"use client"

import Image from "next/image"
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react"
import { searchUsersAction } from "@/app/lib/actions"
import type { UserSummary } from "@/app/lib/types"
import Input from "@/app/components/Input/Input"
import DropdownIcon from "@/public/image/dropdown.svg"

type ContributorsSelectProps = {
    label: string
    // Nom envoyé avec le formulaire : chaque case COCHÉE envoie name = email
    name: string
    // Email à ne jamais proposer (la personne connectée : elle est déjà propriétaire)
    excludeEmail?: string
}

// Liste déroulante "à choix multiple" avec recherche.
// L'API ne sait pas lister TOUS les utilisateurs : elle ne fait qu'une recherche
// (searchUsers, 2 caractères minimum). D'où le champ de recherche dans la liste.
export default function ContributorsSelect({ label, name, excludeEmail }: ContributorsSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState("")
    // Les lignes affichées dans la liste. Elles ne changent qu'à chaque RECHERCHE :
    // cocher / décocher ne fait donc jamais disparaître une ligne sous la souris
    const [rows, setRows] = useState<UserSummary[]>([])
    const [message, setMessage] = useState("Tapez au moins 2 caractères")
    const [selected, setSelected] = useState<UserSummary[]>([])

    const wrapperRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const searchRef = useRef<HTMLInputElement>(null)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const latestQueryRef = useRef("")
    const id = useId()

    // Même principe que UserMenu : un clic en dehors ferme la liste
    useEffect(() => {
        if (!isOpen) return
        searchRef.current?.focus() // on peut taper tout de suite
        function handleClickOutside(event: PointerEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("pointerdown", handleClickOutside)
        return () => document.removeEventListener("pointerdown", handleClickOutside)
    }, [isOpen])

    // Échap ferme la LISTE seulement (sans fermer la modale autour)
    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape" && isOpen) {
            event.preventDefault() // empêche la modale <dialog> de se fermer aussi
            event.stopPropagation()
            setIsOpen(false)
            buttonRef.current?.focus()
        }
    }

    // Recherche à chaque frappe, mais seulement 300 ms après la dernière touche
    // (sinon on appellerait l'API à chaque lettre)
    function handleSearch(value: string) {
        setQuery(value)
        latestQueryRef.current = value
        if (timerRef.current) clearTimeout(timerRef.current)

        if (value.trim().length < 2) {
            setRows(selected) // on montre au moins les personnes déjà choisies
            setMessage("Tapez au moins 2 caractères")
            return
        }

        setMessage("Recherche…")
        timerRef.current = setTimeout(async () => {
            const { users, error } = await searchUsersAction(value)
            // Une réponse plus ancienne ne doit pas écraser une recherche plus récente
            if (value !== latestQueryRef.current) return
            const found = users.filter((user) => user.email !== excludeEmail)
            // Les personnes déjà choisies d'abord, puis les nouveaux résultats
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

    return (
        // mb-6 : même espace sous le champ que les autres champs de la modale
        <div ref={wrapperRef} className="mb-6 flex flex-col gap-2" onKeyDown={handleKeyDown}>
            <label htmlFor={`${id}-button`}>{label}</label>

            {/* "relative" : la liste (en "absolute") s'ouvre juste sous le champ */}
            <div className="relative">
                {/* Le "champ" : un BOUTON qui ouvre / ferme la liste (ce n'est pas un vrai champ
                    de saisie, donc pas un Input). input-default lui donne le même look, my-0 retire ses marges */}
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
                        {selected.length === 0
                            ? "Choisir un ou plusieurs collaborateurs"
                            : selected.map(displayName).join(", ")}
                    </span>
                    {/* La flèche se retourne quand la liste est ouverte */}
                    <Image
                        src={DropdownIcon}
                        alt=""
                        className={`shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                </button>

                {/* La liste reste dans la page même fermée (hidden = juste cachée) :
                    ce sont ses cases COCHÉES qui partent avec le formulaire */}
                <div
                    id={`${id}-panel`}
                    hidden={!isOpen}
                    className="absolute top-full right-0 left-0 z-10 mt-1 rounded-sm border border-grey-200 bg-white p-4 shadow-lg"
                >
                    <Input
                        ref={searchRef}
                        id={`${id}-search`}
                        label="Rechercher un collaborateur"
                        hideLabel
                        type="search"
                        // name="" : la recherche elle-même n'est PAS envoyée avec le formulaire
                        name=""
                        value={query}
                        onChange={(event) => handleSearch(event.target.value)}
                        // Entrée dans la recherche ne doit PAS envoyer le formulaire
                        onKeyDown={(event) => {
                            if (event.key === "Enter") event.preventDefault()
                        }}
                        placeholder="Rechercher par nom ou email"
                        autoComplete="off"
                        className="my-0 h-10 w-full px-3 text-sm"
                    />

                    {message && <p className="mt-3 text-sm text-grey-600">{message}</p>}

                    {rows.length > 0 && (
                        // fieldset + legend : les cases à cocher forment un groupe
                        <fieldset className="mt-3 max-h-56 overflow-y-auto">
                            <legend className="sr-only">Collaborateurs</legend>
                            {rows.map((user) => (
                                // Une case cochée envoie name = email (ex : contributors = bob@example.com).
                                // La Server Action les récupère toutes avec formData.getAll(name).
                                //
                                // defaultChecked (et pas checked) : après chaque envoi, React remet le
                                // formulaire à zéro. Avec checked, la case se décochait dans la page alors
                                // que React la croyait cochée (et elle n'était plus envoyée). Avec
                                // defaultChecked, la remise à zéro revient à la sélection actuelle.
                                <Input
                                    key={user.id}
                                    id={`${id}-${user.id}`}
                                    type="checkbox"
                                    name={name}
                                    value={user.email}
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