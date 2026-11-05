import { getProfile } from "@/app/lib/api"
import Alert from "@/app/components/Alert/Alert"
import ProfileForm from "@/app/components/ProfileForm/ProfileForm"

export default async function Profile() {
    // getProfile() INSIDE the function: it is called on every visit,
    // with the logged-in user's cookie
    const responseUser = await getProfile()

    // Profile not found: message instead of a blank page (same as on the dashboard)
    if (!responseUser.success) {
        return (
            <div className="px-25 pt-14">
                <Alert message="Impossible de charger votre profil." />
            </div>
        )
    }

    const { user } = responseUser.data

    // The backend stores "FirstName LastName" in a single field:
    // "Alice Martin" → first name "Alice", last name "Martin"
    const [firstname = "", ...otherWords] = (user.name ?? "")
        .split(" ")
        .filter((word) => word !== "")
    const lastname = otherWords.join(" ")

    return (
        <div className="px-25 pt-14 pb-20">
            <div className="rounded-[10px] border border-grey-200 bg-white px-[59px] py-10">
                {/* h1: the page's main heading, styled as in the mockup */}
                <h1 className="mb-0 text-lg font-semibold text-grey-800">Mon compte</h1>
                <p className="mt-1 text-grey-600">{user.name || user.email}</p>

                {/* The form is a CLIENT component (useActionState),
                    the page passes it the current info */}
                <ProfileForm firstname={firstname} lastname={lastname} email={user.email} />
            </div>
        </div>
    )
}