import Image, { type StaticImageData } from "next/image"
import type { ComponentProps, ReactNode } from "react"

// ============================================================================
//  The props
// ============================================================================

// What belongs to OUR component (these are not HTML attributes)
type BaseProps = {
  label: ReactNode // label text (can contain HTML, e.g. name + email)
  id: string
  hideLabel?: boolean // true = label hidden on screen but read by screen readers
  icon?: StaticImageData // icon displayed on the right inside the field (e.g. a magnifying glass)
  className?: string // extra classes on the FIELD
  wrapperClassName?: string // extra classes on the WRAPPER (label + field)
}

// "default" variant (or nothing): an <input> of ANY type
// (text, email, password, number, date, search, tel, url, file, checkbox, radio...).
// ComponentProps<"input"> = every attribute an HTML <input> accepts:
// required, placeholder, min, max, value, onChange, defaultValue, autoComplete...
// → no need to add a prop by hand for every new need.
type InputFieldProps = BaseProps &
  Omit<ComponentProps<"input">, keyof BaseProps> & {
    variant?: "default" | "calendar" // calendar = <input type="date"> from today onwards
  }

// "textarea" variant: multi-line text (+ all the attributes of a <textarea>, e.g. rows)
type TextareaFieldProps = BaseProps &
  Omit<ComponentProps<"textarea">, keyof BaseProps> & {
    variant: "textarea"
  }

// "dropdown" variant: a <select> list (+ all the attributes of a <select>, e.g. multiple)
type DropdownFieldProps = BaseProps &
  Omit<ComponentProps<"select">, keyof BaseProps> & {
    variant: "dropdown"
    // Either plain text, or { value, label } when the submitted value
    // differs from the displayed text (e.g. value "TODO", label "À faire")
    options: (string | { value: string; label: string })[]
  }

// The component accepts one OR the other of these shapes, depending on "variant".
// TypeScript checks that the attributes match the variant (e.g. no "rows" on an <input>).
export type InputProps = InputFieldProps | TextareaFieldProps | DropdownFieldProps

// Today's date in YYYY-MM-DD format:
// it's the only format min and max accept on an <input type="date">
function getToday() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

// Strips our props (label, icon...) to keep ONLY the HTML attributes
// to pass on to the tag (<input>, <textarea> or <select>)
function htmlAttributes<T extends BaseProps>({ label, hideLabel, icon, className, wrapperClassName, ...attributes }: T) {
  return attributes
}

// ============================================================================
//  The component
// ============================================================================

export default function Input(props: InputProps) {
  // We separate what is ours (label, icon...) from what goes into the HTML tag
  const { label, hideLabel = false, icon, className = "", wrapperClassName = "" } = props

  // Shared style for "box" fields (text, list, text area).
  // pr-12: leaves room for the icon so the text doesn't go underneath it.
  const boxClass = `input-default ${icon ? "pr-12" : ""} ${className}`

  // ---- "textarea" variant -------------------------------------------------
  if (props.variant === "textarea") {
    // variant isn't an HTML attribute either: we strip it,
    // and everything else ({...attributes}) goes into the tag
    const { variant, ...attributes } = htmlAttributes(props)
    return (
      <Field id={props.id} label={label} hideLabel={hideLabel} icon={icon} wrapperClassName={wrapperClassName}>
        <textarea name={props.id} {...attributes} className={`${boxClass} h-auto py-3`} />
      </Field>
    )
  }

  // ---- "dropdown" variant -------------------------------------------------
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

  // ---- "default" / "calendar" variant: an <input> --------------------------
  const { variant, ...attributes } = htmlAttributes(props)
  const isCalendar = variant === "calendar"
  const type = isCalendar ? "date" : (attributes.type ?? "text")

  // Checkbox / radio button: the box on the LEFT, the label on the RIGHT, on one line
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
        // Calendar: by default, no past dates (min/max can still be changed via the attributes)
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
//  The shared "frame": label above + field + optional icon
// ============================================================================

type FieldProps = {
  id: string
  label: ReactNode
  hideLabel: boolean
  icon?: StaticImageData
  wrapperClassName: string
  children: ReactNode // the field itself (<input>, <textarea> or <select>)
}

function Field({ id, label, hideLabel, icon, wrapperClassName, children }: FieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${wrapperClassName}`}>
      {/* sr-only: invisible on screen, but the field keeps a real label */}
      <label htmlFor={id} className={hideLabel ? "sr-only" : undefined}>
        {label}
      </label>

      {/* "relative": the icon (in "absolute") is positioned relative to this block */}
      <div className="relative">
        {children}

        {/* pointer-events-none: a click on the icon still reaches the field */}
        {icon && (
          <Image
            src={icon}
            alt=""
            // Only width: Next.js computes the height from the icon's real proportions
            // (the dropdown.svg arrow isn't square: 17x10)
            width={16}
            className="pointer-events-none absolute top-1/2 right-8 -translate-y-1/2"
          />
        )}
      </div>
    </div>
  )
}