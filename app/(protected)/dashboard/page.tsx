import { getProfile, getAssignedTasks } from "@/app/lib/api"
import { PRIORITY_RANK } from "@/app/lib/utils"
import Alert from "@/app/components/Alert/Alert"
import DashboardTasks from "@/app/components/DashboardTasks/DashboardTasks"
import CreateProjectButton from "@/app/components/CreateProjectButton/CreateProjectButton"

export default async function Dashboard() {
    // Promise.all: both calls are sent AT THE SAME TIME instead of one after the other
    const [responseUser, responseAssignedTasks] = await Promise.all([
        getProfile(),
        getAssignedTasks(),
    ])

    // Profile not found: show a message rather than a blank page.
    // (No redirect("/connection") here: the cookie still exists, so
    //  proxy.ts would immediately send back to /dashboard → infinite loop.)
    if (!responseUser.success) {
        return (
            <div className="px-25 pt-22">
                <Alert message="Impossible de charger votre profil." />
            </div>
        )
    }

    if (!responseAssignedTasks.success) {
        return (
            <div className="px-25 pt-22">
                <Alert message="Impossible de charger vos tâches." />
            </div>
        )
    }

    const { user } = responseUser.data
    // name can be null (signed up without a name): show the email instead
    const name = user.name || user.email

    // "Par ordre de priorité" (by priority): Urgent, High, Medium, then Low.
    // [...] makes a copy (sort() mutates the original array).
    // sort() keeps the API order (by due date) between two tasks with the same priority.
    const tasks = [...responseAssignedTasks.data.tasks].sort(
        (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
    )

    return (
        // A single container with px-25: everything is aligned on the same margin
        <div className="px-25 pt-22 pb-12">
            {/* Header: title + sentence on the left, button on the right */}
            <div className="flex items-center justify-between">
                <div>
                    {/* h1: the page's main heading (only one per page).
                        The classes override the global h1 style (40px orange). */}
                    <h5>Tableau de bord</h5>
                    <p className="mt-4 text-sans">
                        Bonjour {name}, voici un aperçu de vos projets et tâches
                    </p>
                </div>

                {/* type="button": we are not inside a form.
                    Later on, this button will open project creation. */}
                                {/* The button opens the creation modal (client component) */}
                <CreateProjectButton currentUserEmail={user.email} />
            </div>

            {/* Chips, search and list: everything that reacts to clicks → client component */}
            <DashboardTasks tasks={tasks} />
        </div>
    )
}