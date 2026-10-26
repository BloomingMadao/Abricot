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
}: InputProps) {
  const isCalendar = variant === "calendar"
  const isDropdown = variant === "dropdown"

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id}>{label}</label>

      {/* "relative" servira si tu ajoutes une icône positionnée sur le champ */}
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
            className={`input-default ${className}`}
            min={isCalendar ? getToday() : undefined}
            max={isCalendar ? "2050-12-31" : undefined}
            required={required}
            autoComplete={autoComplete}
            defaultValue={defaultValue}
            placeholder={placeholder}
          />
        )}
      </div>
    </div>
  )
}