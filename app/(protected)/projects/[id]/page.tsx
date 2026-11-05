import { getProfile, getProject, getProjectTasks } from "@/app/lib/api";
import { PRIORITY_RANK } from "@/app/lib/utils";
import Alert from "@/app/components/Alert/Alert"
import IconButton from "@/app/components/IconButton/IconButton";
import Button from "@/app/components/Button/Button";
import ProjectCreatedAlert from "@/app/components/ProjectCreatedAlert/ProjectCreatedAlert";
import ContributorsBar from "@/app/components/ContributorsBar/ContributorsBar";
import UpdateProjectButton from "@/app/components/UpdateProjectButton/UpdateProjectButton";
import CreateTaskButton from "@/app/components/CreateTaskButton/CreateTaskButton";
import ProjectTasks from "@/app/components/ProjectTasks/ProjectTasks";

// params: the variable part of the URL (/projects/[id])
// searchParams: what comes after the "?" in the URL (e.g. ?created=1 after a creation)
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
};

export default async function ProjectsDetails({ params, searchParams }: Props) {
  const { id} = await params;
  const { created } = await searchParams;
  // getProject: the project (name, owner, members...)
  // getProjectTasks: its tasks WITH their assignees and comments
  // (the tasks from getProject don't have them)
  // getProfile: the logged-in user (their avatar next to "Ajouter un commentaire")
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
  // console.log("tasks",tasks);
  // console.log("Project: ",project);
  // console.log("Number of tasks: ",project._count.tasks);
  // console.log("members: ",project.members);

  // If the project doesn't exist, show a message
  if (!project) {
    return (
      <div>
        <h1>Projet non trouvé</h1>
        <p>Ce projet n&apos;existe pas ou a été supprimé.</p>
      </div>
    );
  }

  // The logged-in user, in the same format as other people (UserSummary):
  // the profile doesn't always have a name (name missing), UserSummary expects null in that case
  const { user } = responseUser.data
  const currentUser = { id: user.id, email: user.email, name: user.name ?? null }

  // People who can be assigned to a task: the owner + the members
  // (⚠️ the API does not include the owner in members)
  const members = [project.owner, ...project.members.map((member) => member.user)]

  // Only the owner and admins can edit the project (the API rejects everyone else):
  // the "Modifier" link is only shown to them
  const canEdit = project.userRole === "ADMIN"

  // "Par ordre de priorité" (by priority): Urgent, High, Medium, then Low (same as on the dashboard).
  // [...] makes a copy (sort() mutates the original array).
  const sortedTasks = [...tasks].sort(
    (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
  )

  return (
    // px-11: in the mockup, the back button is 44px from the edge;
    // the rest of the content is 68px further in (mx-[68px] below)
    <div className="px-11 pt-[78px] pb-[98px]">
      {/* Coming from "Créer un projet": confirmation message */}
      {created && <ProjectCreatedAlert projectName={project.name} />}

      {/* Header: back + name + description on the left, buttons on the right.
          items-end: the buttons are aligned with the bottom of the description (as in the mockup) */}
      <div className="flex items-end justify-between gap-6 pr-[68px]">
        <div className="flex items-start gap-4">
          <IconButton
            variant="back"
            href="/projects"
          />
          <div>
            <div className="flex flex-wrap items-baseline gap-x-4">
              <h5>{project.name}</h5>
              {/* "Modifier": opens the "Modifier un projet" modal (only for the owner / an admin) */}
              {canEdit && (
                <UpdateProjectButton
                  project={{ id: project.id, name: project.name, description: project.description }}
                  members={project.members.map((member) => member.user)}
                  ownerEmail={project.owner.email}
                />
              )}
            </div>
            {project.description && (
              <p className="mt-2 text-grey-600">{project.description}</p>
            )}
          </div>
        </div>

        {/* "Créer une tâche" (button + modal) and AI (displayed, to be handled later).
            className: Tailwind classes take precedence over the buttons' own classes
            (mx-0: no margin, w-auto: width fits the text, self-auto: not centered) */}
        <div className="flex shrink-0 gap-3">
          <CreateTaskButton projectId={project.id} members={members} />
          <Button
            label={
              <>
                {/* The star from the mockup, drawn in SVG.
                    currentColor: it takes the text color (and changes with it on hover) */}
                <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true">
                  <path d="M9 0C9.6 4.8 13.2 8.4 18 9C13.2 9.6 9.6 13.2 9 18C8.4 13.2 4.8 9.6 0 9C4.8 8.4 8.4 4.8 9 0Z" />
                </svg>
                IA
              </>
            }
            type="button"
            variant="highlight"
            // py-3: .button-highlight has a border (2px more), py-3 keeps it 50px tall
            className="mx-0 flex w-auto items-center gap-[13px] self-auto px-6 py-3"
          />
        </div>
      </div>

      {/* Contributors then Tasks, 34px between them */}
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