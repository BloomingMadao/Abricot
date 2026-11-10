/**
 * ============================================================================
 *  SMALL DISPLAY HELPERS
 * ============================================================================
 *  The backend returns "technical" values (TODO, HIGH, ADMIN, ISO dates).
 *  These helpers turn them into readable French text for the interface.
 * ============================================================================
 */

import type { Priority, Role, TaskStatus } from "./types";
import type { TagVariant } from "@/app/components/Tag/Tag";

/** Example: TASK_STATUS_LABELS["IN_PROGRESS"] → "En cours" */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
};

/** Color of a status label (TaskCard, "Modifier" modal).
 *  Example: TASK_STATUS_VARIANTS["TODO"] → "error" (red) */
export const TASK_STATUS_VARIANTS: Record<TaskStatus, TagVariant> = {
  TODO: "error",
  IN_PROGRESS: "warning",
  DONE: "success",
};

/** Example: PRIORITY_LABELS["HIGH"] → "Haute" */
export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  URGENT: "Urgente",
};

/** Example: ROLE_LABELS["CONTRIBUTOR"] → "Contributeur" */
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrateur",
  CONTRIBUTOR: "Contributeur",
};

/** Example: formatDate("2024-01-15T00:00:00.000Z") → "15 janvier 2024" */
export function formatDate(isoDate: string | null): string {
  if (!isoDate) return "Aucune échéance";
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Paris",
  });
}


export function getInitials(name: string | null | undefined): string {
    if (!name) return "";
    
    const intials = name
    .split(" ")
    .filter((word) => word !== "")
    .slice(0,2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")

    return intials
    
}

// export function getFirstname (name: string | null | undefined) : string {
//   if(!name) return "";
//   const firstname = name
//   .split(" ")
//   .filter((word) => word !== "")
//   .slice(0,2)
//   .map((word) => word.charAt(0).toUpperCase())
//   .at(0)
//   ?.toString()

//   return firstname
// }


/** Priority importance: the smaller the number, the more important it is.
 *  (The API sorts in ALPHABETICAL order: HIGH, LOW, MEDIUM, URGENT — not by importance.) */
export const PRIORITY_RANK: Record<Priority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

/** Example: formatShortDate("2025-03-09T00:00:00.000Z") → "9 mars" */
export function formatShortDate(isoDate: string | null): string {
  if (!isoDate) return "Sans échéance";
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  });
}

/** Example: formatDateTime("2026-03-23T10:20:00.000Z") → "23 mars, 11:20" (Paris time) */
export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  });
  const time = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
  return `${day}, ${time}`;
}

// ----------------------------------------------------------------------------
// Abricot's rules on tasks (the API doesn't know them: any project member could do it).
// Each function returns null when the action is allowed, otherwise the error message.
// Used by the "…" menu (the red alert of "Modifier" / "Supprimer")
// AND by updateTaskAction / deleteTaskAction (the real check, on the server).
// assigneeIds: the ids of the people assigned to the task
// ----------------------------------------------------------------------------

/** Can the logged-in user edit a task? The project owner, or a person assigned to it */
export function editTaskError(assigneeIds: string[], userId: string, isProjectOwner: boolean): string | null {
  if (isProjectOwner || assigneeIds.includes(userId)) return null;
  return "Seuls le propriétaire du projet et les personnes assignées peuvent modifier cette tâche";
}

/** Can the logged-in user delete a task? The project owner, or THE person assigned to it.
 *  When SEVERAL people are assigned, only the project owner can. */
export function deleteTaskError(assigneeIds: string[], userId: string, isProjectOwner: boolean): string | null {
  if (isProjectOwner) return null;
  if (assigneeIds.length > 1) {
    return "Seul le propriétaire du projet peut supprimer une tâche assignée à plusieurs personnes";
  }
  if (assigneeIds[0] !== userId) {
    return "Seuls le propriétaire du projet et la personne assignée peuvent supprimer cette tâche";
  }
  return null;
}