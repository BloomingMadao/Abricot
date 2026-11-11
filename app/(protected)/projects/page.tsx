import type { Metadata } from "next"
import { getProfile, getProject, getProjects } from "@/app/lib/api"
import Alert from "@/app/components/Alert/Alert"
import PageHeader from "@/app/components/PageHeader/PageHeader"
import CreateProjectButton from "@/app/components/CreateProjectButton/CreateProjectButton"
import ProjectCard from "@/app/components/ProjectCard/ProjectCard"
import ProjectDeletedAlert from "@/app/components/ProjectDeletedAlert/ProjectDeletedAlert"

// The browser tab: "Mes projets | Abricot"
export const metadata: Metadata = {
    title: "Mes projets",
}

// searchParams: what comes after the "?" in the URL
// (?deleted=<name> after deleting a project, see deleteProjectAction)
type Props = {
    searchParams: Promise<{ deleted?: string }>
}

export default async function Projects({ searchParams }: Props) {
    const { deleted } = await searchParams
    const [response, responseUser] = await Promise.all([getProjects(), getProfile()])

    if (!response.success || !responseUser.success){
        return(
            <div className="page-container">
                <Alert message="Impossible de charger vos projets."/>
            </div>
        )
    }

    const {projects} =response.data

    // getProjects() only gives the NUMBER of tasks (_count.tasks), not their status.
    // For "x/y tâches terminées", we fetch the details of each project,
    // all AT THE SAME TIME (Promise.all), and count the "DONE" tasks.
    const doneTasks = await Promise.all(
        projects.map(async (project) => {
            const detail = await getProject(project.id)
            if (!detail.success) return 0
            return detail.data.project.tasks.filter((task) => task.status === "DONE").length
        })
    )

    return(
        // .page-container (globals.css): the page's margins, responsive.
        // xl:px-[137px]: on this page the mockup has wider margins (137px instead of 100px)
        <div className="page-container xl:px-[137px]">
            {/* Coming from "Supprimer le projet": confirmation message */}
            {deleted && <ProjectDeletedAlert projectName={deleted} />}

            {/* Title + sentence + button: the same header as the dashboard */}
            <PageHeader
                title="Mes projets"
                subtitle="Gérez vos projets"
                action={<CreateProjectButton currentUserEmail={responseUser.data.user.email} />}
            />

            {/* The project grid: 1 card per row on a phone, 2 on a tablet (md, 768px),
                3 from xl (1280px) as in the mockup. 16px between columns (the mockup's), 18px between rows.
                doneTasks[index]: the number of completed tasks of the project at the same index */}
            {projects.length === 0 ? (
                <p className="mt-10 text-grey-600 md:mt-15">Vous n&apos;avez encore aucun projet.</p>
            ) : (
                <ul className="mt-10 grid grid-cols-1 gap-x-4 gap-y-[18px] md:mt-15 md:grid-cols-2 xl:grid-cols-3">
                    {projects.map((project, index) => (
                        <li key={project.id}>
                            <ProjectCard project={project} doneTasks={doneTasks[index]} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}