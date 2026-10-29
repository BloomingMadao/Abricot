import { getProfile,getProjects } from "@/app/lib/api"
import Alert from "@/app/components/Alert/Alert"
import CreateProjectButton from "@/app/components/CreateProjectButton/CreateProjectButton"


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
    console.log("Projets : ",projects);
    


    return(
        <div className="px-25 pt-22 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h5>Mes projets</h5>
                    <p className="mt-4 text-sans"> Gérer vos projets</p>
                </div>
                <CreateProjectButton currentUserEmail={responseUser.data.user.email} />
            </div>

            {/* TODO : faire le composant qui affichera tout les projets de l'utilisateurs connecté */}
            {/* <ProjectsMainPage projects = {projetcts} /> */}


            
        </div>
    )
}