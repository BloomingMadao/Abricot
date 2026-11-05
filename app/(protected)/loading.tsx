import Loader from "@/app/components/Loader/Loader"

// Special Next.js file: shown automatically while a page
// in (protected) is waiting for its data (await getProfile(), etc.).
// The layout's Header and Footer stay displayed around it.
export default function Loading() {
    return (
        <div className="pt-22">
            <Loader />
        </div>
    )
}