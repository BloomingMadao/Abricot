/**
 * TODO : Voir commment les données sont retournées par l'API
 */
import { getProject,getProjectTasks } from "@/app/lib/api";
import Alert from "@/app/components/Alert/Alert"
import IconButton from "@/app/components/IconButton/IconButton";
import Button from "@/app/components/Button/Button";
import ProjectCreatedAlert from "@/app/components/ProjectCreatedAlert/ProjectCreatedAlert";

// params : la partie variable de l'adresse (/projects/[id])
// searchParams : ce qui suit le "?" dans l'adresse (ex : ?created=1 après une création)
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

export default async function ProjectsDetails({ params, searchParams }: Props) {
  const { id} = await params;
  const { created } = await searchParams;
  const [responseProject,responseTasks] = await Promise.all([getProject(id),getProjectTasks(id)])
  if (!responseProject.success || !responseTasks.success) {
    return(

        <div className="px-25 pt-22">
          <Alert message="Impossible de charger vos projets...."/>
      </div>
    )
  }

  const {project} = responseProject.data
  const {tasks} = responseTasks.data
  // console.log("tâches",tasks);
  // console.log("Projet : ",project);
  // console.log("Nombre de tâches : ",project._count.tasks);
  // console.log("membres : ",project.members);
  
  
  



  // Si le projet n'existe pas, afficher un message
  if (!project) {
    return (
      <div>
        <h1>Projet non trouvé</h1>
        <p>Ce projet n&apos;existe pas ou a été supprimé.</p>
      </div>
    );
  }

  return (
    <div className="px-25 pt-22 pb-12">
      {/* On arrive de "Créer un projet" : message de confirmation */}
      {created && <ProjectCreatedAlert projectName={project.name} />}

      <div className="flex items-center justify-between">
        <div className="flex gap-6">
          <IconButton 
            variant="back"
            href="/projects"
          />
          <div className="flex flex-col">
            <h5>{project.name}</h5>
            <p>{project.description}</p>
          </div>
        </div>
        <div>
          <Button 
            label="Créer une tâche"
            type="button"
            variant="primary"
          />
          <Button
            label="faire le boutton IA"
            type="button"
            variant="highlight"
            />
        </div>


      </div>
      {/* TODO : faire le composant qui affichera toutes les tâches du projet */}
      {/* <ProjectTasks tasks = {tasks} /> */}

    </div>
  );
}