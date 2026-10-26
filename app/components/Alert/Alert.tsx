import { variantClasses, type TagVariant } from "@/app/components/Tag/Tag"

type AlertProps = {
  message: string
  // Détails éventuels (ex : règles du mot de passe non respectées)
  errors?: string[]
  variant?: TagVariant
  // Si onClose est fourni, une croix s'affiche pour fermer l'alerte
  onClose?: () => void
}

export default function Alert({
  message,
  errors = [],
  variant = "error",
  onClose,
}: AlertProps) {
  return (
    <div
      role="alert"
      className={`mb-5 flex w-70 items-start gap-3 rounded-[10px] px-4 py-3 ${variantClasses[variant]}`}
    >
      <div className="flex-1">
        <p className="font-semibold">{message}</p>
        {errors.length > 0 && (
          <ul className="mt-1 list-disc pl-5 text-sm">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </div>

      {onClose && (
        // type="button" est OBLIGATOIRE : dans un formulaire, un bouton sans type
        // vaut "submit" et cliquer sur la croix renverrait le formulaire.
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer l'alerte"
          className="cursor-pointer text-xl leading-none hover:opacity-70"
        >
          &times;
        </button>
      )}
    </div>
  )
}