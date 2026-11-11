import type { Metadata } from "next"
import { getProfile, getAssignedTasks } from "@/app/lib/api"
import { PRIORITY_RANK } from "@/app/lib/utils"
import Alert from "@/app/components/Alert/Alert"
import PageHeader from "@/app/components/PageHeader/PageHeader"
import DashboardTasks from "@/app/components/DashboardTasks/DashboardTasks"
import CreateProjectButton from "@/app/components/CreateProjectButton/CreateProjectButton"

// The browser tab: "Tableau de bord | Abricot" (see the title template in app/layout.tsx)
export const metadata: Metadata = {
    title: "Tableau de bord",
}

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
            <div className="page-container">
                <Alert message="Impossible de charger votre profil." />
            </div>
        )
    }

    if (!responseAssignedTasks.success) {
        return (
            <div className="page-container">
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
        // .page-container (globals.css): the page's margins, responsive
        // (16px on a phone, the mockup's 100px from lg)
        <div className="page-container">
            {/* Header: title + sentence on the left, button on the right (shared with "Mes projets").
                The button opens the creation modal (client component) */}
            <PageHeader
                title="Tableau de bord"
                subtitle={`Bonjour ${name}, voici un aperçu de vos projets et tâches`}
                action={<CreateProjectButton currentUserEmail={user.email} />}
            />

            {/* Chips, search and list: everything that reacts to clicks → client component */}
            <DashboardTasks tasks={tasks} />
        </div>
    )
}