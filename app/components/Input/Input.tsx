import Image, { type StaticImageData } from "next/image"

type InputProps = {
  label: string
  id: string
  name?: string
  variant?: "default" | "calendar" | "dropdown"
  type?: string
  options?: string[]
  required?: boolean
  autoComplete?: string
  defaultValue?: string
  // Texte gris affiché quand le champ est vide
  placeholder?: string
  // Classes en plus sur le champ, ex : "w-full" pour prendre toute la largeur
  className?: string
  // true = label caché à l'écran mais toujours lu par les lecteurs d'écran
  hideLabel?: boolean
  // Icône affichée à droite dans le champ (ex : une loupe)
  icon?: StaticImageData
  // Pour un champ "contrôlé" par React (ex : une recherche filtrée à chaque frappe).
  // À utiliser À LA PLACE de defaultValue, pas en plus.
  value?: string
  onChange?: (value: string) => void
}

// Date du jour au format AAAA-MM-JJ :
// c'est le seul format que min et max acceptent sur un <input type="date">
function getToday() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default function Input({
  label,
  id,
  name = id,
  variant = "default",
  type = "text",
  options = [],
  required,
  autoComplete,
  defaultValue,
  placeholder,
  className = "",
  hideLabel = false,
  icon,
  value,
  onChange,
}: InputProps) {
  const isCalendar = variant === "calendar"
  const isDropdown = variant === "dropdown"

  return (
    <div className="flex flex-col gap-2">
      {/* sr-only : invisible à l'écran, mais le champ garde un vrai label */}
      <label htmlFor={id} className={hideLabel ? "sr-only" : undefined}>
        {label}
      </label>

      {/* "relative" : l'icône (en "absolute") se place par rapport à ce bloc */}
      <div className="relative">
        {isDropdown ? (
          // Variante liste : uniquement un <select>
          <select
            id={id}
            name={name}
            className={`input-default ${className}`}
            required={required}
            autoComplete={autoComplete}
            defaultValue={defaultValue}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          // Variantes texte et calendrier : uniquement un <input>
          <input
            id={id}
            name={name}
            type={isCalendar ? "date" : type}
            // pr-12 : laisse la place à l'icône pour que le texte ne passe pas dessous
            className={`input-default ${icon ? "pr-12" : ""} ${className}`}
            min={isCalendar ? getToday() : undefined}
            max={isCalendar ? "2050-12-31" : undefined}
            required={required}
            autoComplete={autoComplete}
            defaultValue={defaultValue}
            placeholder={placeholder}
            value={value}
            onChange={onChange ? (event) => onChange(event.target.value) : undefined}
          />
        )}

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