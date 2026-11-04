import { getProfile, getProject, getProjectTasks } from "@/app/lib/api";
import { PRIORITY_RANK } from "@/app/lib/utils";
import Alert from "@/app/components/Alert/Alert"
import IconButton from "@/app/components/IconButton/IconButton";
import Button from "@/app/components/Button/Button";
import ProjectCreatedAlert from "@/app/components/ProjectCreatedAlert/ProjectCreatedAlert";
import ContributorsBar from "@/app/components/ContributorsBar/ContributorsBars";
import UpdateProjectButton from "@/app/components/UpdateProjectButton/UpdateProjectButton";
import ProjectTasks from "@/app/components/ProjectTasks/ProjectTasks";

// params : la partie variable de l'adresse (/projects/[id])
// searchParams : ce qui suit le "?" dans l'adresse (ex : ?created=1 après une création)
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

export default async function ProjectsDetails({ params, searchParams }: Props) {
  const { id} = await params;
  const { created } = await searchParams;
  // getProject : le projet (nom, propriétaire, membres...)
  // getProjectTasks : ses tâches AVEC les personnes assignées et les commentaires
  // (les tâches de getProject n'en ont pas)
  // getProfile : la personne connectée (sa pastille à côté de "Ajouter un commentaire")
  const [responseProject, responseTasks, responseUser] = await Promise.all([
    getProject(id),
    getProjectTasks(id),
    getProfile(),
  ])
  if (!responseProject.success || !responseTasks.success || !responseUser.success) {
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

  // La personne connectée, au format des autres personnes (UserSummary) :
  // le profil n'a pas toujours de nom (name absent), UserSummary attend null dans ce cas
  const { user } = responseUser.data
  const currentUser = { id: user.id, email: user.email, name: user.name ?? null }

  // Les personnes qu'on peut assigner à une tâche : le propriétaire + les membres
  // (⚠️ l'API ne met pas le propriétaire dans members)
  const members = [project.owner, ...project.members.map((member) => member.user)]

  // Seuls le propriétaire et les admins peuvent modifier le projet (l'API refuse les autres) :
  // le lien "Modifier" n'est affiché que pour eux
  const canEdit = project.userRole === "ADMIN"

  // "Par ordre de priorité" : Urgente, Haute, Moyenne, puis Basse (comme sur le tableau de bord).
  // [...] fait une copie (sort() modifie le tableau d'origine).
  const sortedTasks = [...tasks].sort(
    (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
  )

  return (
    // px-11 : sur la maquette, le bouton retour est à 44px du bord ;
    // le reste du contenu est 68px plus loin (mx-[68px] plus bas)
    <div className="px-11 pt-[78px] pb-[98px]">
      {/* On arrive de "Créer un projet" : message de confirmation */}
      {created && <ProjectCreatedAlert projectName={project.name} />}

      {/* En-tête : retour + nom + description à gauche, boutons à droite.
          items-end : les boutons sont alignés sur le bas de la description (comme sur la maquette) */}
      <div className="flex items-end justify-between gap-6 pr-[68px]">
        <div className="flex items-start gap-4">
          <IconButton
            variant="back"
            href="/projects"
          />
          <div>
            <div className="flex flex-wrap items-baseline gap-x-4">
              <h5>{project.name}</h5>
              {/* "Modifier" : ouvre la modale "Modifier un projet" (seulement pour le propriétaire / un admin) */}
              {canEdit && (
                <UpdateProjectButton
                  project={{ id: project.id, name: project.name, description: project.description }}
                  members={project.members.map((member) => member.user)}
                  ownerEmail={project.owner.email}
                />
              )}
            </div>
            {project.description && (
              <p className="text-grey-600">{project.description}</p>
            )}
          </div>
        </div>

        {/* Créer une tâche et IA : affichés, on s'en occupera plus tard.
            className : les classes Tailwind passent devant celles des boutons
            (mx-0 : pas de marge, w-auto : largeur selon le texte, self-auto : pas centré) */}
        <div className="flex shrink-0 gap-3">
          <Button
            label="Créer une tâche"
            type="button"
            variant="primary"
            className="mx-0 w-auto self-auto px-2.5"
          />
          <Button
            label={
              <>
                {/* L'étoile de la maquette, dessinée en SVG.
                    currentColor : elle prend la couleur du texte (et change avec lui au survol) */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                  <path d="M9 0C9.6 4.8 13.2 8.4 18 9C13.2 9.6 9.6 13.2 9 18C8.4 13.2 4.8 9.6 0 9C4.8 8.4 8.4 4.8 9 0Z" />
                </svg>
                IA
              </>
            }
            type="button"
            variant="highlight"
            // py-3 : .button-highlight a une bordure (2px de plus), py-3 garde 50px de haut
            className="mx-0 flex w-auto items-center gap-[13px] self-auto px-6 py-3"
          />
        </div>
      </div>

      {/* Contributeurs puis Tâches, 34px entre les deux */}
      <div className="mx-[68px] mt-[50px] flex flex-col gap-[34px]">
        <ContributorsBar
          owner={project.owner}
          members={project.members.map((member) => member.user)}
        />
        <ProjectTasks tasks={sortedTasks} members={members} currentUser={currentUser} />
      </div>
    </div>
  );
}