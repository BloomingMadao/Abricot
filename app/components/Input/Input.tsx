import Image, { type StaticImageData } from "next/image"
import type { ComponentProps, ReactNode } from "react"

// ============================================================================
//  Les props
// ============================================================================

// Ce qui est propre à NOTRE composant (ce ne sont pas des attributs HTML)
type BaseProps = {
  label: ReactNode // texte du libellé (peut contenir du HTML, ex : nom + email)
  id: string
  hideLabel?: boolean // true = libellé caché à l'écran mais lu par les lecteurs d'écran
  icon?: StaticImageData // icône affichée à droite dans le champ (ex : une loupe)
  className?: string // classes en plus sur le CHAMP
  wrapperClassName?: string // classes en plus sur le BLOC autour (libellé + champ)
}

// Variante "default" (ou rien) : un <input> de N'IMPORTE QUEL type
// (text, email, password, number, date, search, tel, url, file, checkbox, radio...).
// ComponentProps<"input"> = tous les attributs qu'accepte un <input> HTML :
// required, placeholder, min, max, value, onChange, defaultValue, autoComplete...
// → plus besoin d'ajouter une prop à la main à chaque nouveau besoin.
type InputFieldProps = BaseProps &
  Omit<ComponentProps<"input">, keyof BaseProps> & {
    variant?: "default" | "calendar" // calendar = <input type="date"> à partir d'aujourd'hui
  }

// Variante "textarea" : un texte sur plusieurs lignes (+ tous les attributs d'un <textarea>, ex : rows)
type TextareaFieldProps = BaseProps &
  Omit<ComponentProps<"textarea">, keyof BaseProps> & {
    variant: "textarea"
  }

// Variante "dropdown" : une liste <select> (+ tous les attributs d'un <select>, ex : multiple)
type DropdownFieldProps = BaseProps &
  Omit<ComponentProps<"select">, keyof BaseProps> & {
    variant: "dropdown"
    // Soit du texte simple, soit { value, label } quand la valeur envoyée
    // diffère du texte affiché (ex : value "TODO", label "À faire")
    options: (string | { value: string; label: string })[]
  }

// Le composant accepte l'une OU l'autre de ces formes, selon "variant".
// TypeScript vérifie que les attributs vont avec la variante (ex : pas de "rows" sur un <input>).
export type InputProps = InputFieldProps | TextareaFieldProps | DropdownFieldProps

// Date du jour au format AAAA-MM-JJ :
// c'est le seul format que min et max acceptent sur un <input type="date">
function getToday() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Retire nos props (label, icon...) pour ne garder QUE les attributs HTML
// à transmettre à la balise (<input>, <textarea> ou <select>)
function htmlAttributes<T extends BaseProps>({ label, hideLabel, icon, className, wrapperClassName, ...attributes }: T) {
  return attributes
}

// ============================================================================
//  Le composant
// ============================================================================

export default function Input(props: InputProps) {
  // On sépare ce qui est à nous (label, icon...) de ce qui part dans la balise HTML
  const { label, hideLabel = false, icon, className = "", wrapperClassName = "" } = props

  // Style commun aux champs "boîte" (texte, liste, zone de texte).
  // pr-12 : laisse la place à l'icône pour que le texte ne passe pas dessous.
  const boxClass = `input-default ${icon ? "pr-12" : ""} ${className}`

  // ---- Variante "textarea" ------------------------------------------------
  if (props.variant === "textarea") {
    // variant n'est pas un attribut HTML non plus : on le retire,
    // et tout le reste ({...attributes}) part dans la balise
    const { variant, ...attributes } = htmlAttributes(props)
    return (
      <Field id={props.id} label={label} hideLabel={hideLabel} icon={icon} wrapperClassName={wrapperClassName}>
        <textarea name={props.id} {...attributes} className={`${boxClass} h-auto py-3`} />
      </Field>
    )
  }

  // ---- Variante "dropdown" ------------------------------------------------
  if (props.variant === "dropdown") {
    const { variant, options, ...attributes } = htmlAttributes(props)
    return (
      <Field id={props.id} label={label} hideLabel={hideLabel} icon={icon} wrapperClassName={wrapperClassName}>
        <select name={props.id} {...attributes} className={boxClass}>
          {options.map((option) => {
            const value = typeof option === "string" ? option : option.value
            const text = typeof option === "string" ? option : option.label
            return (
              <option key={value} value={value}>
                {text}
              </option>
            )
          })}
        </select>
      </Field>
    )
  }

  // ---- Variante "default" / "calendar" : un <input> ------------------------
  const { variant, ...attributes } = htmlAttributes(props)
  const isCalendar = variant === "calendar"
  const type = isCalendar ? "date" : (attributes.type ?? "text")

  // Case à cocher / bouton radio : la case à GAUCHE, le libellé à DROITE, sur une ligne
  if (type === "checkbox" || type === "radio") {
    return (
      <label htmlFor={props.id} className={`flex cursor-pointer items-center gap-3 ${wrapperClassName}`}>
        <input name={props.id} {...attributes} type={type} className={`size-4 shrink-0 accent-brand-dark ${className}`} />
        <span className={hideLabel ? "sr-only" : undefined}>{label}</span>
      </label>
    )
  }

  return (
    <Field id={props.id} label={label} hideLabel={hideLabel} icon={icon} wrapperClassName={wrapperClassName}>
      <input
        name={props.id}
        // Calendrier : par défaut, pas de date passée (min/max restent modifiables via les attributs)
        min={isCalendar ? getToday() : undefined}
        max={isCalendar ? "2050-12-31" : undefined}
        {...attributes}
        type={type}
        className={boxClass}
      />
    </Field>
  )
}

// ============================================================================
//  Le "cadre" commun : libellé au-dessus + champ + icône éventuelle
// ============================================================================

type FieldProps = {
  id: string
  label: ReactNode
  hideLabel: boolean
  icon?: StaticImageData
  wrapperClassName: string
  children: ReactNode // le champ lui-même (<input>, <textarea> ou <select>)
}

function Field({ id, label, hideLabel, icon, wrapperClassName, children }: FieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${wrapperClassName}`}>
      {/* sr-only : invisible à l'écran, mais le champ garde un vrai label */}
      <label htmlFor={id} className={hideLabel ? "sr-only" : undefined}>
        {label}
      </label>

      {/* "relative" : l'icône (en "absolute") se place par rapport à ce bloc */}
      <div className="relative">
        {children}

        {/* pointer-events-none : un clic sur l'icône arrive quand même dans le champ */}
        {icon && (
          <Image
            src={icon}
            alt=""
            width={16}
            height={16}
            className="pointer-events-none absolute top-1/2 right-8 -translate-y-1/2"
          />
        )}
      </div>
    </div>
  )
}