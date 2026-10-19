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
