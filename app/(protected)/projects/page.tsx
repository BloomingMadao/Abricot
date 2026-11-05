import { getProfile, getProject, getProjects } from "@/app/lib/api"
import Alert from "@/app/components/Alert/Alert"
import CreateProjectButton from "@/app/components/CreateProjectButton/CreateProjectButton"
import ProjectCard from "@/app/components/ProjectCard/ProjectCard"


export default async function Projects() {
    const [response, responseUser] = await Promise.all([getProjects(), getProfile()])

    if (!response.success || !responseUser.success){
        return(
            <div className="px-25 pt-22">
                <Alert message="Impossible de charger vos projets...."/>
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
        <div className="px-25 pt-22 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h5>Mes projets</h5>
                    <p className="mt-4 text-sans"> Gérer vos projets</p>
                </div>
                <CreateProjectButton currentUserEmail={responseUser.data.user.email} />
            </div>

            {/* The project grid: 3 cards per row, 14px between columns, 18px between rows.
                doneTasks[index]: the number of completed tasks of the project at the same index */}
            {projects.length === 0 ? (
                <p className="mt-15 text-grey-600">Vous n&apos;avez encore aucun projet.</p>
            ) : (
                <ul className="mt-15 grid grid-cols-3 gap-x-[14px] gap-y-[18px]">
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