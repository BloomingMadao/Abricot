/**
 * ============================================================================
 *  DONNÉES MOCKÉES (fausses données)
 * ============================================================================
 *  Ce fichier imite le contenu de la base de données du backend.
 *  Les données viennent du script de seed du backend (npm run seed) :
 *    - 10 utilisateurs, 5 projets, 17 tâches, 34 commentaires
 *    - avec les MÊMES IDs que dans ta base (prisma/db.sqlite), donc une URL
 *      comme /projects/cmv6ndtvc000budhw9lfyrupc marche en mock ET en vrai.
 *
 *  👉 Tu peux modifier, ajouter ou supprimer des données librement ici :
 *     c'est TON terrain de jeu pour tester l'affichage de l'application.
 *
 *  ⚠️ Les modifications faites PENDANT que l'app tourne (créer une tâche,
 *     ajouter un commentaire...) sont gardées en mémoire, puis perdues quand
 *     tu redémarres "npm run dev" ou que tu modifies un fichier. C'est normal.
 * ============================================================================
 */

import type {
  User,
  Project,
  ProjectMember,
  Task,
  TaskAssignee,
  TaskComment,
} from "./types";

// ----------------------------------------------------------------------------
// Réglages du mock
// ----------------------------------------------------------------------------

/** Mot de passe de tous les utilisateurs (comme dans le seed du backend) */
export const MOCK_PASSWORD = "P@ssword123";

/** Délai simulé (en millisecondes) pour imiter le temps de réponse du réseau.
 *  Mets 0 pour des réponses instantanées, ou 2000 pour tester tes "loading". */
export const MOCK_DELAY_MS = 500;

// ----------------------------------------------------------------------------
// IDs (repris de ta base de données) — des noms lisibles pour s'y retrouver
// ----------------------------------------------------------------------------

// Utilisateurs
const ALICE = "cmv6ndtgr0000udhwcc32yw45"; // Alice Martin
const BOB = "cmv6ndtie0001udhwdwq51jir"; // Bob Dupont
const CAROLINE = "cmv6ndtk00002udhw6q1bgr54"; // Caroline Leroy
const DAVID = "cmv6ndtlm0003udhw1y5sgwzp"; // David Moreau
const EMMA = "cmv6ndtn70004udhw5tyu2uyp"; // Emma Rousseau
const FRANCOIS = "cmv6ndtot0005udhw5fd6jft2"; // François Dubois
const GABRIELLE = "cmv6ndtqe0006udhwjhmg7lj3"; // Gabrielle Simon
const HENRI = "cmv6ndts00007udhw896pesax"; // Henri Laurent
const ISABELLE = "cmv6ndttm0008udhw5odbko6c"; // Isabelle Petit
const JACQUES = "cmv6ndtv70009udhwt7lll4wg"; // Jacques Durand

// Projets
const PROJET_ECOMMERCE = "cmv6ndtvc000budhw9lfyrupc"; // Application E-commerce
const PROJET_RH = "cmv6ndtvu000judhwza444bwp"; // Système de Gestion RH
const PROJET_FITNESS = "cmv6ndtw6000pudhwtpo2l4p1"; // Application Mobile Fitness
const PROJET_FORMATION = "cmv6ndtwf000tudhwva1ysjbt"; // Plateforme de Formation
const PROJET_ANALYTICS = "cmv6ndtwo000xudhwgnzna1zr"; // Dashboard Analytics

// Tâches
const TACHE_CONCEPTION_BDD = "cmv6ndtx20013udhw53nka4t7"; // Conception de la base de données
const TACHE_API_REST = "cmv6ndtxl001budhwnx5f6hpu"; // Développement de l'API REST
const TACHE_INTERFACE_RESPONSIVE = "cmv6ndty6001ludhwjx7wziai"; // Interface utilisateur responsive
const TACHE_PAIEMENT = "cmv6ndtyp001tudhwgtzniyue"; // Intégration système de paiement
const TACHE_TESTS = "cmv6ndtz3001zudhwlzv7278f"; // Tests automatisés
const TACHE_CONGES = "cmv6ndtzu002budhwf3ncqx8u"; // Module de gestion des congés
const TACHE_EVALUATION = "cmv6ndu0d002judhw3hpn4txv"; // Interface d'évaluation des employés
const TACHE_DASHBOARD_RH = "cmv6ndu0x002tudhw8gq77yky"; // Tableau de bord RH
const TACHE_DESIGN_MOBILE = "cmv6ndu1f0031udhw2ssum66s"; // Design de l'interface mobile
const TACHE_ECRANS = "cmv6ndu1w0039udhwka2sq013"; // Développement des écrans principaux
const TACHE_API_NUTRITION = "cmv6ndu2e003hudhwklifbkoc"; // Intégration API nutrition
const TACHE_GESTION_COURS = "cmv6ndu2u003pudhwquhlcjg0"; // Système de gestion des cours
const TACHE_LECTEUR_VIDEO = "cmv6ndu42003zudhwpe566l38"; // Lecteur vidéo personnalisé
const TACHE_QUIZ = "cmv6ndu4u004budhwrnvztbm0"; // Système de quiz interactif
const TACHE_ARCHI_DONNEES = "cmv6ndu5e004ludhwxr8xtyxm"; // Architecture des données
const TACHE_GRAPHIQUES = "cmv6ndu5x004tudhwpbl5z4kr"; // Développement des graphiques
const TACHE_ALERTES = "cmv6ndu6l0053udhwi2cs7tlb"; // Système d'alertes

/** L'utilisateur "connecté" par défaut dans le mock : Alice Martin.
 *  Change cette valeur (ex : BOB) pour voir l'application avec les yeux de quelqu'un d'autre.
 *  (Un appel à login() ou register() en mode mock change aussi l'utilisateur connecté.) */
export const MOCK_DEFAULT_USER_ID = ALICE;

// ----------------------------------------------------------------------------
// Table "users"
// ----------------------------------------------------------------------------

/** Dans le mock, on garde le mot de passe en clair pour pouvoir simuler la connexion.
 *  (Le vrai backend, lui, le stocke chiffré et ne le renvoie jamais.) */
export type MockUser = User & { password: string };

export const users: MockUser[] = [
  {
    id: ALICE,
    email: "alice@example.com",
    name: "Alice Martin",
    password: MOCK_PASSWORD,
    createdAt: "2026-10-13T12:18:55.467Z",
    updatedAt: "2026-10-13T12:18:55.467Z",
  },
  {
    id: BOB,
    email: "bob@example.com",
    name: "Bob Dupont",
    password: MOCK_PASSWORD,
    createdAt: "2026-10-13T12:18:55.527Z",
    updatedAt: "2026-10-13T12:18:55.527Z",
  },
  {
    id: CAROLINE,
    email: "caroline@example.com",
    name: "Caroline Leroy",
    password: MOCK_PASSWORD,
    createdAt: "2026-10-13T12:18:55.585Z",
    updatedAt: "2026-10-13T12:18:55.585Z",
  },
  {
    id: DAVID,
    email: "david@example.com",
    name: "David Moreau",
    password: MOCK_PASSWORD,
    createdAt: "2026-10-13T12:18:55.643Z",
    updatedAt: "2026-10-13T12:18:55.643Z",
  },
  {
    id: EMMA,
    email: "emma@example.com",
    name: "Emma Rousseau",
    password: MOCK_PASSWORD,
    createdAt: "2026-10-13T12:18:55.700Z",
    updatedAt: "2026-10-13T12:18:55.700Z",
  },
  {
    id: FRANCOIS,
    email: "francois@example.com",
    name: "François Dubois",
    password: MOCK_PASSWORD,
    createdAt: "2026-10-13T12:18:55.757Z",
    updatedAt: "2026-10-13T12:18:55.757Z",
  },
  {
    id: GABRIELLE,
    email: "gabrielle@example.com",
    name: "Gabrielle Simon",
    password: MOCK_PASSWORD,
    createdAt: "2026-10-13T12:18:55.815Z",
    updatedAt: "2026-10-13T12:18:55.815Z",
  },
  {
    id: HENRI,
    email: "henri@example.com",
    name: "Henri Laurent",
    password: MOCK_PASSWORD,
    createdAt: "2026-10-13T12:18:55.872Z",
    updatedAt: "2026-10-13T12:18:55.872Z",
  },
  {
    id: ISABELLE,
    email: "isabelle@example.com",
    name: "Isabelle Petit",
    password: MOCK_PASSWORD,
    createdAt: "2026-10-13T12:18:55.930Z",
    updatedAt: "2026-10-13T12:18:55.930Z",
  },
  {
    id: JACQUES,
    email: "jacques@example.com",
    name: "Jacques Durand",
    password: MOCK_PASSWORD,
    createdAt: "2026-10-13T12:18:55.988Z",
    updatedAt: "2026-10-13T12:18:55.988Z",
  },
];

// ----------------------------------------------------------------------------
// Table "projects"
// ----------------------------------------------------------------------------
export const projects: Project[] = [
  {
    id: PROJET_ECOMMERCE,
    name: "Application E-commerce",
    description: "Développement d'une plateforme de vente en ligne moderne avec paiement sécurisé et gestion des stocks.",
    createdAt: "2026-10-13T12:18:55.993Z",
    updatedAt: "2026-10-13T12:18:55.993Z",
    ownerId: ALICE,
  },
  {
    id: PROJET_RH,
    name: "Système de Gestion RH",
    description: "Application web pour la gestion des ressources humaines : congés, évaluations, planning.",
    createdAt: "2026-10-13T12:18:56.010Z",
    updatedAt: "2026-10-13T12:18:56.010Z",
    ownerId: EMMA,
  },
  {
    id: PROJET_FITNESS,
    name: "Application Mobile Fitness",
    description: "App mobile pour le suivi d'entraînement, nutrition et objectifs fitness personnalisés.",
    createdAt: "2026-10-13T12:18:56.023Z",
    updatedAt: "2026-10-13T12:18:56.023Z",
    ownerId: HENRI,
  },
  {
    id: PROJET_FORMATION,
    name: "Plateforme de Formation",
    description: "Système de gestion de cours en ligne avec vidéos, quiz et suivi des progrès.",
    createdAt: "2026-10-13T12:18:56.032Z",
    updatedAt: "2026-10-13T12:18:56.032Z",
    ownerId: JACQUES,
  },
  {
    id: PROJET_ANALYTICS,
    name: "Dashboard Analytics",
    description: "Interface de visualisation de données avec graphiques interactifs et rapports automatisés.",
    createdAt: "2026-10-13T12:18:56.041Z",
    updatedAt: "2026-10-13T12:18:56.041Z",
    ownerId: BOB,
  },
];

// ----------------------------------------------------------------------------
// Table "project_members" (les contributeurs ; le propriétaire n'y est PAS)
// ----------------------------------------------------------------------------
export const projectMembers: ProjectMember[] = [
  {
    id: "cmv6ndtvg000dudhway6pev0s",
    role: "CONTRIBUTOR",
    joinedAt: "2026-10-13T12:18:55.997Z",
    userId: BOB,
    projectId: PROJET_ECOMMERCE,
  },
  {
    id: "cmv6ndtvk000fudhw8aupco9q",
    role: "CONTRIBUTOR",
    joinedAt: "2026-10-13T12:18:56.001Z",
    userId: CAROLINE,
    projectId: PROJET_ECOMMERCE,
  },
  {
    id: "cmv6ndtvp000hudhwt1vycpu6",
    role: "CONTRIBUTOR",
    joinedAt: "2026-10-13T12:18:56.006Z",
    userId: DAVID,
    projectId: PROJET_ECOMMERCE,
  },
  {
    id: "cmv6ndtvy000ludhw95obyz5m",
    role: "CONTRIBUTOR",
    joinedAt: "2026-10-13T12:18:56.014Z",
    userId: FRANCOIS,
    projectId: PROJET_RH,
  },
  {
    id: "cmv6ndtw2000nudhw4bbcac8r",
    role: "CONTRIBUTOR",
    joinedAt: "2026-10-13T12:18:56.019Z",
    userId: GABRIELLE,
    projectId: PROJET_RH,
  },
  {
    id: "cmv6ndtwb000rudhw6my9b0wi",
    role: "CONTRIBUTOR",
    joinedAt: "2026-10-13T12:18:56.027Z",
    userId: ISABELLE,
    projectId: PROJET_FITNESS,
  },
  {
    id: "cmv6ndtwk000vudhw3wsv9pxg",
    role: "CONTRIBUTOR",
    joinedAt: "2026-10-13T12:18:56.036Z",
    userId: ALICE,
    projectId: PROJET_FORMATION,
  },
  {
    id: "cmv6ndtws000zudhwzrond7w1",
    role: "CONTRIBUTOR",
    joinedAt: "2026-10-13T12:18:56.045Z",
    userId: EMMA,
    projectId: PROJET_ANALYTICS,
  },
  {
    id: "cmv6ndtwx0011udhwkgwlt8e0",
    role: "CONTRIBUTOR",
    joinedAt: "2026-10-13T12:18:56.049Z",
    userId: HENRI,
    projectId: PROJET_ANALYTICS,
  },
];

// ----------------------------------------------------------------------------
// Table "tasks"
// ----------------------------------------------------------------------------
export const tasks: Task[] = [
  // --- Application E-commerce ---
  {
    id: TACHE_CONCEPTION_BDD,
    title: "Conception de la base de données",
    description: "Créer le schéma de base de données pour les produits, utilisateurs, commandes et paiements.",
    status: "DONE",
    priority: "HIGH",
    dueDate: "2024-01-15T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.055Z",
    updatedAt: "2026-10-13T12:18:56.055Z",
    projectId: PROJET_ECOMMERCE,
    creatorId: ALICE,
  },
  {
    id: TACHE_API_REST,
    title: "Développement de l'API REST",
    description: "Implémenter les endpoints pour la gestion des produits, panier et commandes.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: "2024-02-01T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.073Z",
    updatedAt: "2026-10-13T12:18:56.073Z",
    projectId: PROJET_ECOMMERCE,
    creatorId: ALICE,
  },
  {
    id: TACHE_INTERFACE_RESPONSIVE,
    title: "Interface utilisateur responsive",
    description: "Créer les composants React pour la liste des produits, panier et checkout.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "2024-02-15T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.094Z",
    updatedAt: "2026-10-13T12:18:56.094Z",
    projectId: PROJET_ECOMMERCE,
    creatorId: ALICE,
  },
  {
    id: TACHE_PAIEMENT,
    title: "Intégration système de paiement",
    description: "Intégrer Stripe pour le traitement des paiements sécurisés.",
    status: "TODO",
    priority: "HIGH",
    dueDate: "2024-02-28T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.114Z",
    updatedAt: "2026-10-13T12:18:56.114Z",
    projectId: PROJET_ECOMMERCE,
    creatorId: ALICE,
  },
  {
    id: TACHE_TESTS,
    title: "Tests automatisés",
    description: "Écrire les tests unitaires et d'intégration pour l'API et l'interface.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "2024-03-10T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.127Z",
    updatedAt: "2026-10-13T12:18:56.127Z",
    projectId: PROJET_ECOMMERCE,
    creatorId: ALICE,
  },
  // --- Système de Gestion RH ---
  {
    id: TACHE_CONGES,
    title: "Module de gestion des congés",
    description: "Développer le système de demande et validation des congés avec workflow d'approbation.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: "2024-01-20T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.155Z",
    updatedAt: "2026-10-13T12:18:56.155Z",
    projectId: PROJET_RH,
    creatorId: EMMA,
  },
  {
    id: TACHE_EVALUATION,
    title: "Interface d'évaluation des employés",
    description: "Créer les formulaires d'évaluation et le système de notation.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "2024-02-05T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.173Z",
    updatedAt: "2026-10-13T12:18:56.173Z",
    projectId: PROJET_RH,
    creatorId: EMMA,
  },
  {
    id: TACHE_DASHBOARD_RH,
    title: "Tableau de bord RH",
    description: "Dashboard avec statistiques sur les effectifs, congés et performances.",
    status: "TODO",
    priority: "LOW",
    dueDate: "2024-02-20T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.194Z",
    updatedAt: "2026-10-13T12:18:56.194Z",
    projectId: PROJET_RH,
    creatorId: EMMA,
  },
  // --- Application Mobile Fitness ---
  {
    id: TACHE_DESIGN_MOBILE,
    title: "Design de l'interface mobile",
    description: "Créer les maquettes et prototypes pour l'application mobile.",
    status: "DONE",
    priority: "HIGH",
    dueDate: "2024-01-10T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.212Z",
    updatedAt: "2026-10-13T12:18:56.212Z",
    projectId: PROJET_FITNESS,
    creatorId: HENRI,
  },
  {
    id: TACHE_ECRANS,
    title: "Développement des écrans principaux",
    description: "Implémenter les écrans d'accueil, profil utilisateur et suivi d'entraînement.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: "2024-01-25T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.228Z",
    updatedAt: "2026-10-13T12:18:56.228Z",
    projectId: PROJET_FITNESS,
    creatorId: HENRI,
  },
  {
    id: TACHE_API_NUTRITION,
    title: "Intégration API nutrition",
    description: "Connecter l'app à une API de données nutritionnelles pour les calories et nutriments.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "2024-02-10T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.246Z",
    updatedAt: "2026-10-13T12:18:56.246Z",
    projectId: PROJET_FITNESS,
    creatorId: HENRI,
  },
  // --- Plateforme de Formation ---
  {
    id: TACHE_GESTION_COURS,
    title: "Système de gestion des cours",
    description: "Créer l'interface d'administration pour ajouter et organiser les cours.",
    status: "DONE",
    priority: "HIGH",
    dueDate: "2024-01-05T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.262Z",
    updatedAt: "2026-10-13T12:18:56.262Z",
    projectId: PROJET_FORMATION,
    creatorId: JACQUES,
  },
  {
    id: TACHE_LECTEUR_VIDEO,
    title: "Lecteur vidéo personnalisé",
    description: "Développer un lecteur vidéo avec contrôles de progression et notes.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: "2024-01-30T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.306Z",
    updatedAt: "2026-10-13T12:18:56.306Z",
    projectId: PROJET_FORMATION,
    creatorId: JACQUES,
  },
  {
    id: TACHE_QUIZ,
    title: "Système de quiz interactif",
    description: "Créer les quiz avec questions à choix multiples et évaluation automatique.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "2024-02-15T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.334Z",
    updatedAt: "2026-10-13T12:18:56.334Z",
    projectId: PROJET_FORMATION,
    creatorId: JACQUES,
  },
  // --- Dashboard Analytics ---
  {
    id: TACHE_ARCHI_DONNEES,
    title: "Architecture des données",
    description: "Concevoir l'architecture pour la collecte et le stockage des données analytiques.",
    status: "DONE",
    priority: "HIGH",
    dueDate: "2024-01-08T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.355Z",
    updatedAt: "2026-10-13T12:18:56.355Z",
    projectId: PROJET_ANALYTICS,
    creatorId: BOB,
  },
  {
    id: TACHE_GRAPHIQUES,
    title: "Développement des graphiques",
    description: "Implémenter les composants de visualisation avec Chart.js ou D3.js.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: "2024-01-22T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.373Z",
    updatedAt: "2026-10-13T12:18:56.373Z",
    projectId: PROJET_ANALYTICS,
    creatorId: BOB,
  },
  {
    id: TACHE_ALERTES,
    title: "Système d'alertes",
    description: "Créer le système de notifications pour les seuils et anomalies détectées.",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "2024-02-08T00:00:00.000Z",
    createdAt: "2026-10-13T12:18:56.398Z",
    updatedAt: "2026-10-13T12:18:56.398Z",
    projectId: PROJET_ANALYTICS,
    creatorId: BOB,
  },
];

// ----------------------------------------------------------------------------
// Table "task_assignees" (qui est assigné à quelle tâche)
// ----------------------------------------------------------------------------
export const taskAssignees: TaskAssignee[] = [
  { id: "cmv6ndtx60015udhwk38pnjrl", assignedAt: "2026-10-13T12:18:56.059Z", taskId: TACHE_CONCEPTION_BDD, userId: BOB },
  { id: "cmv6ndtxb0017udhwufdf0p14", assignedAt: "2026-10-13T12:18:56.064Z", taskId: TACHE_CONCEPTION_BDD, userId: CAROLINE },
  { id: "cmv6ndtxp001dudhw6u981565", assignedAt: "2026-10-13T12:18:56.078Z", taskId: TACHE_API_REST, userId: DAVID },
  { id: "cmv6ndtyc001nudhw6qwvwdvb", assignedAt: "2026-10-13T12:18:56.100Z", taskId: TACHE_INTERFACE_RESPONSIVE, userId: ALICE },
  { id: "cmv6ndtyg001pudhwegwab0lu", assignedAt: "2026-10-13T12:18:56.104Z", taskId: TACHE_INTERFACE_RESPONSIVE, userId: CAROLINE },
  { id: "cmv6ndtyu001vudhw5mmx7dm0", assignedAt: "2026-10-13T12:18:56.118Z", taskId: TACHE_PAIEMENT, userId: BOB },
  { id: "cmv6ndtz80021udhwf66h6ual", assignedAt: "2026-10-13T12:18:56.132Z", taskId: TACHE_TESTS, userId: DAVID },
  { id: "cmv6ndtzc0023udhwooxfffkc", assignedAt: "2026-10-13T12:18:56.136Z", taskId: TACHE_TESTS, userId: CAROLINE },
  { id: "cmv6ndtzz002dudhw24d74v2v", assignedAt: "2026-10-13T12:18:56.159Z", taskId: TACHE_CONGES, userId: EMMA },
  { id: "cmv6ndu04002fudhwob115rsp", assignedAt: "2026-10-13T12:18:56.165Z", taskId: TACHE_CONGES, userId: FRANCOIS },
  { id: "cmv6ndu0h002ludhwywdxpv0s", assignedAt: "2026-10-13T12:18:56.177Z", taskId: TACHE_EVALUATION, userId: GABRIELLE },
  { id: "cmv6ndu11002vudhw6hdmutai", assignedAt: "2026-10-13T12:18:56.198Z", taskId: TACHE_DASHBOARD_RH, userId: EMMA },
  { id: "cmv6ndu1j0033udhwhrlm3o6y", assignedAt: "2026-10-13T12:18:56.216Z", taskId: TACHE_DESIGN_MOBILE, userId: HENRI },
  { id: "cmv6ndu21003budhwcrq0dwc7", assignedAt: "2026-10-13T12:18:56.233Z", taskId: TACHE_ECRANS, userId: ISABELLE },
  { id: "cmv6ndu25003dudhwd2u9g5fq", assignedAt: "2026-10-13T12:18:56.237Z", taskId: TACHE_ECRANS, userId: HENRI },
  { id: "cmv6ndu2i003judhwre8u3wam", assignedAt: "2026-10-13T12:18:56.250Z", taskId: TACHE_API_NUTRITION, userId: HENRI },
  { id: "cmv6ndu2y003rudhweq6loce7", assignedAt: "2026-10-13T12:18:56.266Z", taskId: TACHE_GESTION_COURS, userId: JACQUES },
  { id: "cmv6ndu490041udhwmev3y5ej", assignedAt: "2026-10-13T12:18:56.313Z", taskId: TACHE_LECTEUR_VIDEO, userId: ALICE },
  { id: "cmv6ndu4d0043udhw7q84nbpm", assignedAt: "2026-10-13T12:18:56.317Z", taskId: TACHE_LECTEUR_VIDEO, userId: JACQUES },
  { id: "cmv6ndu4y004dudhw7ozqwtlu", assignedAt: "2026-10-13T12:18:56.338Z", taskId: TACHE_QUIZ, userId: ALICE },
  { id: "cmv6ndu5i004nudhwbvw56crg", assignedAt: "2026-10-13T12:18:56.359Z", taskId: TACHE_ARCHI_DONNEES, userId: BOB },
  { id: "cmv6ndu64004vudhwaq4vgi87", assignedAt: "2026-10-13T12:18:56.381Z", taskId: TACHE_GRAPHIQUES, userId: EMMA },
  { id: "cmv6ndu69004xudhwbwhdw5zk", assignedAt: "2026-10-13T12:18:56.385Z", taskId: TACHE_GRAPHIQUES, userId: HENRI },
  { id: "cmv6ndu6p0055udhwztaizlxe", assignedAt: "2026-10-13T12:18:56.402Z", taskId: TACHE_ALERTES, userId: BOB },
];

// ----------------------------------------------------------------------------
// Table "comments"
// ----------------------------------------------------------------------------
export const comments: TaskComment[] = [
  {
    id: "cmv6ndtxg0019udhw6ngemf37",
    content: "Base de données créée avec succès. Toutes les tables sont en place et les relations sont correctes.",
    createdAt: "2026-10-13T12:18:56.068Z",
    updatedAt: "2026-10-13T12:18:56.068Z",
    taskId: TACHE_CONCEPTION_BDD,
    authorId: CAROLINE,
  },
  {
    id: "cmv6ndtxu001fudhw65qropb9",
    content: "Intégration Stripe prévue pour la semaine prochaine. Documentation consultée.",
    createdAt: "2026-10-13T12:18:56.082Z",
    updatedAt: "2026-10-13T12:18:56.082Z",
    taskId: TACHE_API_REST,
    authorId: ALICE,
  },
  {
    id: "cmv6ndtxy001hudhwg6hacy4m",
    content: "Tests unitaires écrits pour 80% des fonctions. Tests d'intégration à venir.",
    createdAt: "2026-10-13T12:18:56.086Z",
    updatedAt: "2026-10-13T12:18:56.086Z",
    taskId: TACHE_API_REST,
    authorId: ALICE,
  },
  {
    id: "cmv6ndty2001judhwlxmjtnxo",
    content: "Module congés bien avancé. Workflow d'approbation fonctionnel.",
    createdAt: "2026-10-13T12:18:56.090Z",
    updatedAt: "2026-10-13T12:18:56.090Z",
    taskId: TACHE_API_REST,
    authorId: DAVID,
  },
  {
    id: "cmv6ndtyk001rudhws6jimvap",
    content: "Interface responsive en cours. Les composants de base sont créés, reste à implémenter le panier.",
    createdAt: "2026-10-13T12:18:56.109Z",
    updatedAt: "2026-10-13T12:18:56.109Z",
    taskId: TACHE_INTERFACE_RESPONSIVE,
    authorId: ALICE,
  },
  {
    id: "cmv6ndtyx001xudhw2hksggew",
    content: "Intégration Stripe prévue pour la semaine prochaine. Documentation consultée.",
    createdAt: "2026-10-13T12:18:56.122Z",
    updatedAt: "2026-10-13T12:18:56.122Z",
    taskId: TACHE_PAIEMENT,
    authorId: ALICE,
  },
  {
    id: "cmv6ndtzg0025udhwrsabh15s",
    content: "Lecteur vidéo en cours. Contrôles de base implémentés.",
    createdAt: "2026-10-13T12:18:56.141Z",
    updatedAt: "2026-10-13T12:18:56.141Z",
    taskId: TACHE_TESTS,
    authorId: CAROLINE,
  },
  {
    id: "cmv6ndtzl0027udhw5mujveau",
    content: "Quiz interactif en développement. Système de notation en place.",
    createdAt: "2026-10-13T12:18:56.145Z",
    updatedAt: "2026-10-13T12:18:56.145Z",
    taskId: TACHE_TESTS,
    authorId: ALICE,
  },
  {
    id: "cmv6ndtzq0029udhwj7y8wgme",
    content: "Architecture données validée. Performance optimisée pour les gros volumes.",
    createdAt: "2026-10-13T12:18:56.150Z",
    updatedAt: "2026-10-13T12:18:56.150Z",
    taskId: TACHE_TESTS,
    authorId: CAROLINE,
  },
  {
    id: "cmv6ndu08002hudhwudr2wih4",
    content: "Module congés bien avancé. Workflow d'approbation fonctionnel.",
    createdAt: "2026-10-13T12:18:56.169Z",
    updatedAt: "2026-10-13T12:18:56.169Z",
    taskId: TACHE_CONGES,
    authorId: FRANCOIS,
  },
  {
    id: "cmv6ndu0l002nudhw14mcr3dy",
    content: "Attention à la sécurité des données. Vérifier les permissions utilisateur.",
    createdAt: "2026-10-13T12:18:56.182Z",
    updatedAt: "2026-10-13T12:18:56.182Z",
    taskId: TACHE_EVALUATION,
    authorId: GABRIELLE,
  },
  {
    id: "cmv6ndu0p002pudhwht0h0vm6",
    content: "Deadline respectée, bravo à toute l'équipe !",
    createdAt: "2026-10-13T12:18:56.186Z",
    updatedAt: "2026-10-13T12:18:56.186Z",
    taskId: TACHE_EVALUATION,
    authorId: GABRIELLE,
  },
  {
    id: "cmv6ndu0t002rudhwr97y4bg0",
    content: "Petit bug détecté sur mobile. À corriger avant la livraison.",
    createdAt: "2026-10-13T12:18:56.190Z",
    updatedAt: "2026-10-13T12:18:56.190Z",
    taskId: TACHE_EVALUATION,
    authorId: EMMA,
  },
  {
    id: "cmv6ndu16002xudhw7ahpwilj",
    content: "Architecture données validée. Performance optimisée pour les gros volumes.",
    createdAt: "2026-10-13T12:18:56.202Z",
    updatedAt: "2026-10-13T12:18:56.202Z",
    taskId: TACHE_DASHBOARD_RH,
    authorId: EMMA,
  },
  {
    id: "cmv6ndu1b002zudhwrm6gf475",
    content: "Graphiques en cours. Chart.js intégré, premiers graphiques affichés.",
    createdAt: "2026-10-13T12:18:56.207Z",
    updatedAt: "2026-10-13T12:18:56.207Z",
    taskId: TACHE_DASHBOARD_RH,
    authorId: EMMA,
  },
  {
    id: "cmv6ndu1n0035udhwed82j8gc",
    content: "Système d'alertes planifié. Notifications par email et push prévues.",
    createdAt: "2026-10-13T12:18:56.220Z",
    updatedAt: "2026-10-13T12:18:56.220Z",
    taskId: TACHE_DESIGN_MOBILE,
    authorId: HENRI,
  },
  {
    id: "cmv6ndu1s0037udhwgznocmji",
    content: "Excellent travail sur cette tâche ! Le code est propre et bien documenté.",
    createdAt: "2026-10-13T12:18:56.224Z",
    updatedAt: "2026-10-13T12:18:56.224Z",
    taskId: TACHE_DESIGN_MOBILE,
    authorId: HENRI,
  },
  {
    id: "cmv6ndu29003fudhwr7ncfbvc",
    content: "Écrans principaux en développement. Navigation fluide entre les sections.",
    createdAt: "2026-10-13T12:18:56.242Z",
    updatedAt: "2026-10-13T12:18:56.242Z",
    taskId: TACHE_ECRANS,
    authorId: ISABELLE,
  },
  {
    id: "cmv6ndu2m003ludhwkj1eg2l4",
    content: "Petit bug détecté sur mobile. À corriger avant la livraison.",
    createdAt: "2026-10-13T12:18:56.254Z",
    updatedAt: "2026-10-13T12:18:56.254Z",
    taskId: TACHE_API_NUTRITION,
    authorId: HENRI,
  },
  {
    id: "cmv6ndu2q003nudhwl0uemgx6",
    content: "Documentation mise à jour. Tutoriel d'utilisation créé.",
    createdAt: "2026-10-13T12:18:56.258Z",
    updatedAt: "2026-10-13T12:18:56.258Z",
    taskId: TACHE_API_NUTRITION,
    authorId: HENRI,
  },
  {
    id: "cmv6ndu32003tudhw89doc3j5",
    content: "Design mobile terminé et validé par le client. Interface moderne et intuitive.",
    createdAt: "2026-10-13T12:18:56.271Z",
    updatedAt: "2026-10-13T12:18:56.271Z",
    taskId: TACHE_GESTION_COURS,
    authorId: JACQUES,
  },
  {
    id: "cmv6ndu3g003vudhwf6a7nty1",
    content: "Écrans principaux en développement. Navigation fluide entre les sections.",
    createdAt: "2026-10-13T12:18:56.284Z",
    updatedAt: "2026-10-13T12:18:56.284Z",
    taskId: TACHE_GESTION_COURS,
    authorId: JACQUES,
  },
  {
    id: "cmv6ndu3r003xudhw5680p0ik",
    content: "API nutrition identifiée. Documentation reçue, intégration prévue.",
    createdAt: "2026-10-13T12:18:56.296Z",
    updatedAt: "2026-10-13T12:18:56.296Z",
    taskId: TACHE_GESTION_COURS,
    authorId: JACQUES,
  },
  {
    id: "cmv6ndu4h0045udhwluuk5af0",
    content: "Système de cours opérationnel. Interface d'administration complète.",
    createdAt: "2026-10-13T12:18:56.321Z",
    updatedAt: "2026-10-13T12:18:56.321Z",
    taskId: TACHE_LECTEUR_VIDEO,
    authorId: JACQUES,
  },
  {
    id: "cmv6ndu4l0047udhwxy8ni14d",
    content: "Lecteur vidéo en cours. Contrôles de base implémentés.",
    createdAt: "2026-10-13T12:18:56.326Z",
    updatedAt: "2026-10-13T12:18:56.326Z",
    taskId: TACHE_LECTEUR_VIDEO,
    authorId: JACQUES,
  },
  {
    id: "cmv6ndu4q0049udhwiiyyzesh",
    content: "Quiz interactif en développement. Système de notation en place.",
    createdAt: "2026-10-13T12:18:56.330Z",
    updatedAt: "2026-10-13T12:18:56.330Z",
    taskId: TACHE_LECTEUR_VIDEO,
    authorId: ALICE,
  },
  {
    id: "cmv6ndu52004fudhwtykqeoyq",
    content: "Architecture données validée. Performance optimisée pour les gros volumes.",
    createdAt: "2026-10-13T12:18:56.343Z",
    updatedAt: "2026-10-13T12:18:56.343Z",
    taskId: TACHE_QUIZ,
    authorId: JACQUES,
  },
  {
    id: "cmv6ndu56004hudhw8do7xkn8",
    content: "Graphiques en cours. Chart.js intégré, premiers graphiques affichés.",
    createdAt: "2026-10-13T12:18:56.347Z",
    updatedAt: "2026-10-13T12:18:56.347Z",
    taskId: TACHE_QUIZ,
    authorId: ALICE,
  },
  {
    id: "cmv6ndu5a004judhwx1nbhybt",
    content: "Système d'alertes planifié. Notifications par email et push prévues.",
    createdAt: "2026-10-13T12:18:56.351Z",
    updatedAt: "2026-10-13T12:18:56.351Z",
    taskId: TACHE_QUIZ,
    authorId: ALICE,
  },
  {
    id: "cmv6ndu5n004pudhw7784chri",
    content: "Intégration Stripe prévue pour la semaine prochaine. Documentation consultée.",
    createdAt: "2026-10-13T12:18:56.363Z",
    updatedAt: "2026-10-13T12:18:56.363Z",
    taskId: TACHE_ARCHI_DONNEES,
    authorId: BOB,
  },
  {
    id: "cmv6ndu5t004rudhw37bw1zfh",
    content: "Tests unitaires écrits pour 80% des fonctions. Tests d'intégration à venir.",
    createdAt: "2026-10-13T12:18:56.369Z",
    updatedAt: "2026-10-13T12:18:56.369Z",
    taskId: TACHE_ARCHI_DONNEES,
    authorId: BOB,
  },
  {
    id: "cmv6ndu6d004zudhwq3zmmtle",
    content: "Module congés bien avancé. Workflow d'approbation fonctionnel.",
    createdAt: "2026-10-13T12:18:56.389Z",
    updatedAt: "2026-10-13T12:18:56.389Z",
    taskId: TACHE_GRAPHIQUES,
    authorId: EMMA,
  },
  {
    id: "cmv6ndu6h0051udhwe95s9uex",
    content: "Formulaires d'évaluation créés. Interface intuitive et responsive.",
    createdAt: "2026-10-13T12:18:56.393Z",
    updatedAt: "2026-10-13T12:18:56.393Z",
    taskId: TACHE_GRAPHIQUES,
    authorId: EMMA,
  },
  {
    id: "cmv6ndu6u0057udhwh84fkpke",
    content: "Système d'alertes planifié. Notifications par email et push prévues.",
    createdAt: "2026-10-13T12:18:56.406Z",
    updatedAt: "2026-10-13T12:18:56.406Z",
    taskId: TACHE_ALERTES,
    authorId: BOB,
  },
];
