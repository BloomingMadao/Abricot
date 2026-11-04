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

    // getProjects() ne donne que le NOMBRE de tâches (_count.tasks), pas leur statut.
    // Pour "x/y tâches terminées", on demande le détail de chaque projet,
    // tous EN MÊME TEMPS (Promise.all), et on compte les tâches "DONE".
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

            {/* La grille des projets : 3 cartes par ligne, 14px entre les colonnes, 18px entre les lignes.
                doneTasks[index] : le nombre de tâches terminées du projet qui a le même rang */}
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