import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProfile, getProject, getProjectTasks } from "@/app/lib/api";
import type { ApiError } from "@/app/lib/types";
import { PRIORITY_RANK } from "@/app/lib/utils";
import { isAIEnabled } from "@/app/lib/ai";
import Alert from "@/app/components/Alert/Alert"
import IconButton from "@/app/components/IconButton/IconButton";
import ProjectCreatedAlert from "@/app/components/ProjectCreatedAlert/ProjectCreatedAlert";
import ContributorsBar from "@/app/components/ContributorsBar/ContributorsBar";
import UpdateProjectButton from "@/app/components/UpdateProjectButton/UpdateProjectButton";
import DeleteProjectButton from "@/app/components/DeleteProjectButton/DeleteProjectButton";
import CreateTaskButton from "@/app/components/CreateTaskButton/CreateTaskButton";
import CreateTaskAIButton from "@/app/components/CreateTaskAIButton/CreateTaskAIButton";
import ProjectTasks from "@/app/components/ProjectTasks/ProjectTasks";

// params: the variable part of the URL (/projects/[id])
// searchParams: what comes after the "?" in the URL
// (?created=1 after a creation, &from=dashboard if it was created from the dashboard)
type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string; from?: string }>;
};

// The API answers FORBIDDEN (not a member) or PROJECT_NOT_FOUND (doesn't exist / deleted).
// In both cases the page "doesn't exist" for this user: Next.js shows not-found.tsx (404).
// The specifications: a person who is not in the project can't access it.
function isMissingProject(response: ApiError) {
  return response.error === "FORBIDDEN" || response.error === "PROJECT_NOT_FOUND";
}

// The browser tab shows the project's name: "Application E-commerce | Abricot".
// getProject is wrapped in React's cache() (api.ts): the page below calls it again
// with the same id, but only ONE request is sent to the API.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const response = await getProject(id);
  return { title: response.success ? response.data.project.name : "Projet" };
}

export default async function ProjectsDetails({ params, searchParams }: Props) {
  const { id} = await params;
  const { created, from } = await searchParams;
  // getProject: the project (name, owner, members...)
  // getProjectTasks: its tasks WITH their assignees and comments
  // (the tasks from getProject don't have them)
  // getProfile: the logged-in user (their avatar next to "Ajouter un commentaire")
  const [responseProject, responseTasks, responseUser] = await Promise.all([
    getProject(id),
    getProjectTasks(id),
    getProfile(),
  ])

  // Project that doesn't exist or that the user is not a member of: 404 page
  if (!responseProject.success && isMissingProject(responseProject)) {
    notFound()
  }

  // Any other problem (API unreachable...): a message instead of a blank page
  if (!responseProject.success || !responseTasks.success || !responseUser.success) {
    return(
        <div className="page-container">
          <Alert message="Impossible de charger ce projet."/>
      </div>
    )
  }

  const {project} = responseProject.data
  const {tasks} = responseTasks.data

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

  // Only the owner can delete the project (not the admins): the "Supprimer" link is only shown to them.
  // Also passed to the tasks: the owner can edit every task (see editTaskError in utils.ts)
  const isOwner = project.owner.id === currentUser.id

  // The "back" button returns to the page the project was created from:
  // the dashboard if the URL says so (?from=dashboard), otherwise the projects list.
  // We only accept these two pages: the URL can be modified by anyone,
  // its value is never used directly as an address.
  const back =
    from === "dashboard"
      ? { href: "/dashboard", label: "Retour au tableau de bord" }
      : { href: "/projects", label: "Retour à mes projets" }

  // "Par ordre de priorité" (by priority): Urgent, High, Medium, then Low (same as on the dashboard).
  // [...] makes a copy (sort() mutates the original array).
  const sortedTasks = [...tasks].sort(
    (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
  )

  return (
    // Responsive: 16px on the sides on a phone.
    // From lg (1024px), the mockup: the back button is 44px from the edge (px-11),
    // the rest of the content is 68px further in (lg:mx-[68px] below)
    <div className="px-4 pt-8 pb-12 md:px-11 md:pt-14 lg:pt-[78px] lg:pb-[98px]">
      {/* Coming from "Créer un projet": confirmation message */}
      {created && <ProjectCreatedAlert projectName={project.name} />}

      {/* Header: back + name + description on the left, buttons on the right.
          Phone / tablet: the buttons go below (flex-col).
          From lg: on the same line, aligned with the bottom of the description (as in the mockup) */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:pr-[68px]">
        <div className="flex items-start gap-4">
          {/* label: what a screen reader announces ("Retour au tableau de bord"...) */}
          <IconButton
            variant="back"
            href={back.href}
            label={back.label}
          />
          {/* min-w-0: a long name or description wraps instead of pushing the page wider */}
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              {/* h1: the page's main heading (the project's name).
                  Class h5: the same look as before (18px, bold) */}
              <h1 className="h5 break-words">{project.name}</h1>
              {/* "Modifier": opens the "Modifier un projet" modal (only for the owner / an admin) */}
              {canEdit && (
                <UpdateProjectButton
                  project={{ id: project.id, name: project.name, description: project.description }}
                  members={project.members.map((member) => member.user)}
                  ownerEmail={project.owner.email}
                />
              )}
              {/* "Supprimer": opens a confirmation modal (only for the owner) */}
              {isOwner && (
                <DeleteProjectButton project={{ id: project.id, name: project.name }} />
              )}
            </div>
            {project.description && (
              <p className="mt-2 break-words text-grey-600">{project.description}</p>
            )}
          </div>
        </div>

        {/* "Créer une tâche" and "IA": each button opens its own modal.
            Responsive: centered on a phone (justify-center), on the left from md (768px) */}
        <div className="flex shrink-0 flex-wrap justify-center gap-3 md:justify-start">
          {/* currentUser: already selected in "Assigné à" (the user can change it) */}
          <CreateTaskButton projectId={project.id} members={members} currentUser={currentUser} />
          {/* "IA": opens the AI modal (describe the tasks, then add them).
              aiEnabled: read on the server (.env.local), the modal adapts its text.
              members / currentUser: for the due date and "Assigné à" of each suggested task */}
          <CreateTaskAIButton
            projectId={project.id}
            aiEnabled={isAIEnabled()}
            members={members}
            currentUser={currentUser}
          />
        </div>
      </div>

      {/* Contributors then Tasks, 34px between them (24px on a phone) */}
      <div className="mt-8 flex flex-col gap-6 md:mt-[50px] md:gap-[34px] lg:mx-[68px]">
        <ContributorsBar
          owner={project.owner}
          members={project.members.map((member) => member.user)}
        />
        {/* isOwner: the owner can edit every task (the others: only theirs) */}
        <ProjectTasks tasks={sortedTasks} members={members} currentUser={currentUser} isOwner={isOwner} />
      </div>
    </div>
  );
}