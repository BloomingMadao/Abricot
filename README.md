# Abricot

English · [Français](#français)

Abricot is a collaborative project management app: projects, tasks, contributors and comments, with AI-assisted task creation.
This repository is the **front-end**, built with Next.js for an OpenClassrooms project.
The REST API is in a separate repository: **[Abricot-Backend](https://github.com/BloomingMadao/Abricot-Backend)**.

## Features

- **Account**: sign up, log in, log out; the "Mon compte" page changes the name, the email and the password.
- **Dashboard**: the tasks assigned to you, sorted by priority, with a search field; a Kanban view by status (To do, In progress, Done).
- **Projects**: the list of your projects with their progress and their team; create, edit (name, description, contributors) and delete a project.
- **Project page**: the contributors, then the tasks in a list (status filter and search) or in a monthly calendar.
- **Tasks**: title, description, due date, status, one or several assignees, comments; create, edit and delete. Your own tasks and comments are highlighted.
- **AI task creation**: describe the tasks in one sentence (for example "2 UI design tasks for Bob, due tomorrow"). The AI suggests up to 10 tasks, with their due date and assignees, that you can edit or delete before adding them. It works with any OpenAI-compatible API (Groq in development). With the AI turned off, the same window creates the number of tasks you type, with default values.
- **Roles**: the project owner can do everything, including deleting the project; administrators edit the project and its contributors; every member creates, deletes and comments on tasks; a task can be edited by the project owner or by the people assigned to it. People outside the project get a "page not found".
- **Responsive** (mobile first, from 320 px wide) and **accessible** (WCAG 2.1 AA, see below).
- **Mock mode**: the front-end can run without the backend, on test data kept in memory.

## Tech stack

| Library | Version | Why |
| --- | --- | --- |
| [Next.js](https://nextjs.org) | 16 | Framework required by the project: App Router, Server Components, Server Actions, `proxy.ts` for the protected pages |
| React | 19 | Interface |
| TypeScript | 6 | Typing of the API data and of the components |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Styles; the mockup colors are defined in `app/globals.css` (`@theme`) |
| [openai](https://github.com/openai/openai-node) | 7 | Official client for the AI task creation; it can call any OpenAI-compatible API (Groq, OpenAI…) |

## Prerequisites

- [Node.js](https://nodejs.org) 20.9 or later (required by Next.js 16) and npm
- The backend running on `http://localhost:8000` (not needed in mock mode)

## Installation

### 1. Backend

```bash
git clone https://github.com/BloomingMadao/Abricot-Backend.git
cd Abricot-Backend
cp .env.example .env        # Windows PowerShell: copy .env.example .env — then change JWT_SECRET
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed                # optional: test data (see "Test accounts")
npm run dev                 # API on http://localhost:8000
```

The API documentation (Swagger) is available at `http://localhost:8000/api-docs`.

### 2. Front-end

```bash
git clone https://github.com/BloomingMadao/Abricot.git
cd Abricot
npm install
cp .env.local.example .env.local   # Windows PowerShell: copy .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables (`.env.local`)

`.env.local.example` lists them all. Copy it to `.env.local` and fill it in; `.env.local` is ignored by Git and must stay private.

| Variable | Example | Description |
| --- | --- | --- |
| `URL_API` | `http://localhost:8000` | Address of the backend |
| `USE_MOCK` | `false` | `true` = test data in memory, no backend needed |
| `USE_IA` | `false` | `true` = AI task creation; `false` = the "IA" window only creates default tasks |
| `TOKEN_IA` | | API key of the AI provider (secret) |
| `URL_IA` | `https://api.groq.com/openai/v1` | Address of an OpenAI-compatible API; empty = OpenAI |
| `MODEL_IA` | `openai/gpt-oss-20b` | Model of this provider (required when `URL_IA` is set) |

Next.js only reads `.env.local` at startup: restart `npm run dev` after a change.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Production build (also checks the types) |
| `npm run start` | Runs the production build |
| `npm run lint` | ESLint |

## Test accounts

With the backend seed (`npm run seed`) or in mock mode, the same 10 accounts exist, all with the password `P@ssword123`, for example:

- `alice@example.com`: owner of "Application E-commerce"
- `bob@example.com`: contributor of "Application E-commerce", owner of "Dashboard Analytics"

The test tasks are due between January and March 2024: the calendar opens on the current month, so use its arrows to see them.

## Resetting the data

- **Backend**: log out of Abricot first, then run `npm run seed` in the backend folder. The script deletes all the data and recreates the test data. The users get new ids, so a session opened before the reset is no longer valid.
- **Mock mode**: restart `npm run dev`.

## Project structure

```
app/
├── (auth)/         login and sign-up pages (public)
├── (protected)/    dashboard, projects, project page, account (logged-in users only)
├── components/     interface components, one folder per component
├── hooks/          useDismiss: closes a menu on an outside click or with Escape
├── lib/
│   ├── api.ts         calls to the REST API (or to the mock)
│   ├── actions.ts     Server Actions used by the forms
│   ├── ai.ts          AI task creation
│   ├── mock-api.ts    mock mode: same answers as the API
│   ├── mock-data.ts   mock mode: test data
│   ├── types.ts       types of the API data
│   └── utils.ts       shared helpers (labels, dates, rights)
└── debug/          component showcase, development only
proxy.ts            redirects according to the login cookie
public/             images and icons
```

## Security

- The authentication token is stored in an `httpOnly` cookie: the browser's JavaScript cannot read it.
- The calls to the API and to the AI are made by the Next.js server; the token and the AI key never reach the browser.
- `proxy.ts` redirects visitors who are not logged in to the login page.

## Accessibility

The app targets WCAG 2.1 AA: one `h1` per page and a heading hierarchy, a title for each page, a "skip to content" link, full keyboard use, visible focus, named buttons and menus, no horizontal scrolling down to 320 px.
Known gap: some colors of the mockup (status tags, orange links) have a contrast below 4.5:1. They were kept to match the mockup.



---

# Français

[English](#abricot) · Français

Abricot est une application de gestion de projets collaborative : projets, tâches, contributeurs et commentaires, avec une création de tâches assistée par IA.
Ce dépôt contient le **front-end**, réalisé avec Next.js dans le cadre d'un projet OpenClassrooms.
L'API REST est dans un dépôt séparé : **[Abricot-Backend](https://github.com/BloomingMadao/Abricot-Backend)**.

## Fonctionnalités

- **Compte** : inscription, connexion, déconnexion ; la page « Mon compte » modifie le nom, l'email et le mot de passe.
- **Tableau de bord** : les tâches qui vous sont assignées, triées par priorité, avec une recherche ; une vue Kanban par statut (À faire, En cours, Terminées).
- **Projets** : la liste de vos projets avec leur avancement et leur équipe ; création, modification (nom, description, contributeurs) et suppression d'un projet.
- **Page d'un projet** : les contributeurs, puis les tâches en liste (filtre par statut et recherche) ou dans un calendrier mensuel.
- **Tâches** : titre, description, échéance, statut, une ou plusieurs personnes assignées, commentaires ; création, modification et suppression. Vos tâches et vos commentaires sont mis en évidence.
- **Création de tâches par IA** : décrivez les tâches en une phrase (par exemple « 2 tâches UI design pour Bob, échéance demain »). L'IA propose jusqu'à 10 tâches, avec leur échéance et leurs personnes assignées, que vous pouvez modifier ou supprimer avant de les ajouter. Elle fonctionne avec toute API compatible OpenAI (Groq en développement). IA désactivée, la même fenêtre crée le nombre de tâches indiqué, avec des valeurs par défaut.
- **Rôles** : le propriétaire du projet peut tout faire, y compris supprimer le projet ; les administrateurs modifient le projet et ses contributeurs ; chaque membre crée, supprime et commente des tâches ; une tâche se modifie par le propriétaire du projet ou par les personnes qui y sont assignées. Une personne extérieure au projet obtient une « page introuvable ».
- **Responsive** (mobile first, dès 320 px de large) et **accessible** (WCAG 2.1 AA, voir plus bas).
- **Mode simulé** : le front-end peut tourner sans le backend, sur des données de test gardées en mémoire.

## Technologies

| Bibliothèque | Version | Pourquoi |
| --- | --- | --- |
| [Next.js](https://nextjs.org) | 16 | Framework imposé par le projet : App Router, Server Components, Server Actions, `proxy.ts` pour les pages protégées |
| React | 19 | Interface |
| TypeScript | 6 | Typage des données de l'API et des composants |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Styles ; les couleurs de la maquette sont définies dans `app/globals.css` (`@theme`) |
| [openai](https://github.com/openai/openai-node) | 7 | Client officiel pour la création de tâches par IA ; il appelle toute API compatible OpenAI (Groq, OpenAI…) |

## Prérequis

- [Node.js](https://nodejs.org) 20.9 ou plus récent (exigé par Next.js 16) et npm
- Le backend démarré sur `http://localhost:8000` (inutile en mode simulé)

## Installation

### 1. Backend

```bash
git clone https://github.com/BloomingMadao/Abricot-Backend.git
cd Abricot-Backend
cp .env.example .env        # Windows PowerShell : copy .env.example .env — puis changez JWT_SECRET
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed                # facultatif : données de test (voir « Comptes de test »)
npm run dev                 # API sur http://localhost:8000
```

La documentation de l'API (Swagger) est disponible sur `http://localhost:8000/api-docs`.

### 2. Front-end

```bash
git clone https://github.com/BloomingMadao/Abricot.git
cd Abricot
npm install
cp .env.local.example .env.local   # Windows PowerShell : copy .env.local.example .env.local
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000).

## Variables d'environnement (`.env.local`)

`.env.local.example` les liste toutes. Copiez-le en `.env.local` et complétez-le ; `.env.local` est ignoré par Git et doit rester privé.

| Variable | Exemple | Description |
| --- | --- | --- |
| `URL_API` | `http://localhost:8000` | Adresse du backend |
| `USE_MOCK` | `false` | `true` = données de test en mémoire, sans backend |
| `USE_IA` | `false` | `true` = création de tâches par IA ; `false` = la fenêtre « IA » crée seulement des tâches par défaut |
| `TOKEN_IA` | | Clé d'API du fournisseur d'IA (secrète) |
| `URL_IA` | `https://api.groq.com/openai/v1` | Adresse d'une API compatible OpenAI ; vide = OpenAI |
| `MODEL_IA` | `openai/gpt-oss-20b` | Modèle de ce fournisseur (obligatoire si `URL_IA` est renseignée) |

Next.js ne lit `.env.local` qu'au démarrage : relancez `npm run dev` après une modification.

## Scripts

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement sur http://localhost:3000 |
| `npm run build` | Version de production (vérifie aussi les types) |
| `npm run start` | Lance la version de production |
| `npm run lint` | ESLint |

## Comptes de test

Avec le seed du backend (`npm run seed`) ou en mode simulé, les mêmes 10 comptes existent, tous avec le mot de passe `P@ssword123`, par exemple :

- `alice@example.com` : propriétaire d'« Application E-commerce »
- `bob@example.com` : contributeur d'« Application E-commerce », propriétaire de « Dashboard Analytics »

Les tâches de test ont des échéances entre janvier et mars 2024 : le calendrier s'ouvre sur le mois en cours, utilisez ses flèches pour les voir.

## Réinitialiser les données

- **Backend** : déconnectez-vous d'Abricot, puis lancez `npm run seed` dans le dossier du backend. Le script supprime toutes les données et recrée les données de test. Les utilisateurs ont de nouveaux identifiants : une session ouverte avant la réinitialisation n'est plus valable.
- **Mode simulé** : relancez `npm run dev`.

## Structure du projet

```
app/
├── (auth)/         pages de connexion et d'inscription (publiques)
├── (protected)/    tableau de bord, projets, page projet, compte (utilisateurs connectés)
├── components/     composants de l'interface, un dossier par composant
├── hooks/          useDismiss : ferme un menu au clic à l'extérieur ou avec Échap
├── lib/
│   ├── api.ts         appels à l'API REST (ou au mode simulé)
│   ├── actions.ts     Server Actions utilisées par les formulaires
│   ├── ai.ts          création de tâches par IA
│   ├── mock-api.ts    mode simulé : mêmes réponses que l'API
│   ├── mock-data.ts   mode simulé : données de test
│   ├── types.ts       types des données de l'API
│   └── utils.ts       fonctions partagées (libellés, dates, droits)
└── debug/          vitrine des composants, en développement seulement
proxy.ts            redirige selon le cookie de connexion
public/             images et icônes
```

## Sécurité

- Le jeton d'authentification est stocké dans un cookie `httpOnly` : le JavaScript du navigateur ne peut pas le lire.
- Les appels à l'API et à l'IA sont faits par le serveur Next.js ; le jeton et la clé d'IA n'arrivent jamais dans le navigateur.
- `proxy.ts` redirige les visiteurs non connectés vers la page de connexion.

## Accessibilité

L'application vise WCAG 2.1 AA : un seul `h1` par page et une hiérarchie de titres, un titre pour chaque page, un lien « Aller au contenu », une utilisation complète au clavier, un focus visible, des boutons et des menus nommés, pas de défilement horizontal jusqu'à 320 px.
Écart connu : certaines couleurs de la maquette (statuts, liens orange) ont un contraste inférieur à 4,5:1. Elles ont été gardées pour respecter la maquette.
