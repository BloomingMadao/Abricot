export default function Loader() {
    return (
        // role="status" : annonce aux lecteurs d'écran que quelque chose se charge
        <div role="status" className="flex justify-center">
            {/* aria-hidden : le dessin est décoratif, c'est le texte caché qui est lu */}
            <svg
                className="size-9 animate-spin text-brand"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
            >
                {/* Le cercle complet, pâle : le "rail" */}
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                {/* Un quart de cercle, foncé : c'est lui qu'on voit tourner */}
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
            </svg>

            {/* sr-only : invisible à l'écran, mais lu par les lecteurs d'écran */}
            <span className="sr-only">Chargement…</span>
        </div>
    )
}