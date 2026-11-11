import { variantClasses, type TagVariant } from "@/app/components/Tag/Tag"

type AlertProps = {
  message: string
  // Optional details (e.g. password rules not met)
  errors?: string[]
  variant?: TagVariant
  // If onClose is provided, a cross is shown to close the alert
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
      className={`mb-5 flex w-70 items-start gap-3 rounded-[10px] px-4 py-3 border ${variantClasses[variant]}`}
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
        // type="button" is REQUIRED: inside a form, a button without a type
        // defaults to "submit" and clicking the cross would submit the form.
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