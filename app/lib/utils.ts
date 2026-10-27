/**
 * ============================================================================
 *  PETITS OUTILS D'AFFICHAGE
 * ============================================================================
 *  Le backend renvoie des valeurs "techniques" (TODO, HIGH, ADMIN, dates ISO).
 *  Ces outils les transforment en texte lisible en français pour l'interface.
 * ============================================================================
 */

import type { Priority, Role, TaskStatus } from "./types";

/** Exemple : TASK_STATUS_LABELS["IN_PROGRESS"] → "En cours" */
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "À faire",
  IN_PROGRESS: "En cours",
  DONE: "Terminée",
  CANCELLED: "Annulée",
};

/** Exemple : PRIORITY_LABELS["HIGH"] → "Haute" */
export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Basse",
  MEDIUM: "Moyenne",
  HIGH: "Haute",
  URGENT: "Urgente",
};

/** Exemple : ROLE_LABELS["CONTRIBUTOR"] → "Contributeur" */
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrateur",
  CONTRIBUTOR: "Contributeur",
};

/** Exemple : formatDate("2024-01-15T00:00:00.000Z") → "15 janvier 2024" */
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


/** Importance des priorités : plus le chiffre est petit, plus c'est important.
 *  (L'API trie par ordre ALPHABÉTIQUE : HIGH, LOW, MEDIUM, URGENT — pas par importance.) */
export const PRIORITY_RANK: Record<Priority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

/** Exemple : formatShortDate("2025-03-09T00:00:00.000Z") → "9 mars" */
export function formatShortDate(isoDate: string | null): string {
  if (!isoDate) return "Sans échéance";
  return new Date(isoDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    timeZone: "Europe/Paris",
  });
}
