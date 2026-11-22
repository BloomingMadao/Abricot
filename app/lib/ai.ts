/**
 * ============================================================================
 *  AI — TASK SUGGESTIONS (openai-node library, any compatible AI)
 * ============================================================================
 *  Used by suggestTasksAction (actions.ts) for the AI modal of a project page.
 *
 *  openai-node can talk to OpenAI AND to every AI that offers an
 *  "OpenAI-compatible" API (Mistral, Gemini, Ollama, Groq, DeepSeek...):
 *  we only change the address (URL_IA) and the model (MODEL_IA).
 *  We use "Chat Completions", the request that all of them understand.
 *
 *  .env.local:
 *    - USE_IA=true          false = AI mode off (we ask for a number of tasks instead)
 *    - TOKEN_IA=...         the API key of the provider (no key = AI mode off)
 *    - URL_IA=...           the provider's address (empty = OpenAI)
 *    - MODEL_IA=...         the model (required if URL_IA is set; gpt-6-luna for OpenAI)
 *
 *  ⚠️ SERVER side only: this file reads the API key.
 *     Only import it from a Server Action or a server component (page.tsx),
 *     never from a component with "use client": the key would end up in the browser.
 * ============================================================================
 */

import OpenAI from "openai";
import type { UserSummary } from "./types";

/** A task suggested by the AI: nothing is saved yet, the user can still
 *  edit or delete it before clicking "+ Ajouter les tâches".
 *  dueDate: "YYYY-MM-DD", or "" when the user didn't ask for one
 *  assigneeIds: the ids of the members the user asked for ("à Bob"), or [] */
export type SuggestedTask = { title: string; description: string; dueDate: string; assigneeIds: string[] };

/** What suggestTasks / defaultTasks return: the tasks, or a message to display.
 *  warning: the people asked for ("à Eric") who couldn't be assigned (see assigneeWarning) */
export type SuggestTasksResult =
  | { success: true; tasks: SuggestedTask[]; warning?: string }
  | { success: false; message: string };

/** Maximum number of tasks suggested at once */
export const MAX_SUGGESTED_TASKS = 10;

/** The model used with OpenAI when MODEL_IA is empty (the cheapest current one).
 *  With another provider, MODEL_IA is required: each one has its own model names. */
const OPENAI_DEFAULT_MODEL = "gpt-6-luna";

/** Is the AI mode on? Off when USE_IA=false, or when there is no key (TOKEN_IA).
 *  Also called by the project page, so the modal knows it from the start. */
export function isAIEnabled(): boolean {
  const useAI = process.env.USE_IA?.trim().toLowerCase() !== "false";
  return useAI && Boolean(process.env.TOKEN_IA?.trim());
}

/** AI mode OFF: the message gives the NUMBER of tasks ("3", "crée 5 tâches"...),
 *  created with default values that the user then edits in the modal */
export function defaultTasks(prompt: string): SuggestTasksResult {
  // The first number of the message (\d+ = one or more digits)
  const match = prompt.match(/\d+/);
  if (!match) {
    return { success: false, message: "Indiquez le nombre de tâches à créer, par exemple : 3" };
  }
  const count = Number(match[0]);
  if (count < 1 || count > MAX_SUGGESTED_TASKS) {
    return { success: false, message: `Choisissez entre 1 et ${MAX_SUGGESTED_TASKS} tâches à la fois` };
  }
  // Array.from({ length: 3 }, ...): an array of 3 elements, built by the function
  const tasks = Array.from({ length: count }, () => ({
    title: "Nom de la tâche",
    description: "Description de la tâche",
    dueDate: "",
    assigneeIds: [],
  }));
  return { success: true, tasks };
}

/** The instructions given to the AI before the user's message (its "role").
 *  This is where we decide HOW MANY tasks it creates: the number asked by the user,
 *  otherwise the number that fits the request. The answer format is described here
 *  too: not every AI can be forced to follow a JSON schema. */
const INSTRUCTIONS = `Tu aides à découper un projet en tâches dans Abricot, une application de gestion de projets.
À partir de la demande de l'utilisateur et du contexte du projet, propose des tâches concrètes et réalisables.

Règles :
- Si l'utilisateur indique un nombre de tâches, respecte-le exactement.
- Sinon, choisis toi-même le nombre de tâches adapté à la demande : une demande simple donne peu de tâches, une demande large en donne plus. Jamais plus de ${MAX_SUGGESTED_TASKS}.
- Le titre est court (80 caractères maximum) et commence par un verbe d'action.
- La description explique en une ou deux phrases ce qu'il faut faire (300 caractères maximum).
- Ne propose pas une tâche qui existe déjà dans le projet.
- Écris en français.
- Si la demande n'a aucun rapport avec des tâches à créer, renvoie une liste de tâches vide.
- Échéance : si l'utilisateur en donne une (une date, « demain », « vendredi », « dans une semaine »...), calcule-la à partir de la date du jour indiquée et écris-la au format AAAA-MM-JJ dans "dueDate". Sinon, "dueDate" vaut "".
- Personnes assignées : si l'utilisateur dit à qui confier les tâches, écris ces personnes dans "assignees". Pour une personne de la liste des membres du projet, écris son nom EXACT tel qu'il apparaît dans la liste. Pour une personne absente de la liste, ou si plusieurs membres peuvent correspondre, écris le nom tel que l'utilisateur l'a écrit : ne le retire pas et ne le remplace pas par un autre membre, l'application préviendra l'utilisateur. N'ajoute jamais une personne que l'utilisateur n'a pas citée. Si l'utilisateur ne cite personne, "assignees" vaut [].

Réponds UNIQUEMENT avec du JSON valide, sans aucun texte autour, exactement dans ce format :
{"tasks": [{"title": "Titre de la tâche", "description": "Description de la tâche", "dueDate": "", "assignees": []}]}`;

/** Today in Paris, "YYYY-MM-DD" ("en-CA": the format of this locale is exactly YYYY-MM-DD).
 *  Given to the AI so it can turn "demain" or "vendredi" into a date */
function todayInParis(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** The due date given by the AI, if it is a real date ("YYYY-MM-DD") from today onwards
 *  (like the date field of the modal); otherwise "" (no due date) */
function checkDueDate(value: unknown, today: string): string {
  const text = String(value ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return "";
  // "2026-02-30" is not a real date: once read, it becomes March 2nd → refused
  const date = new Date(`${text}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) return "";
  return text >= today ? text : "";
}

/** A name or an email without accents or capitals: "Éric" and "eric" are the same person.
 *  normalize("NFD") splits "é" into "e" + its accent, then the accents (\u0300-\u036f) are removed */
function simplify(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
}

/** What matchMembers finds in the names written by the AI */
type MatchedMembers = {
  ids: string[]; // the members found: they are assigned
  notFound: string[]; // the names of nobody in the project ("Eric")
  ambiguous: string[]; // the names of several members (a first name shared by two people)
};

/** The members named by the AI → their ids. Only people of the project can come out of it:
 *  the exact name or email first, otherwise a first name that only one member has ("Bob" → Bob Dupont).
 *  Accents and capitals don't count ("eric" finds "Éric Leroy").
 *  A name that matches nobody, or several people, is NOT assigned: it is returned,
 *  so that the user is told (before, it was ignored without a word). */
function matchMembers(names: unknown, members: UserSummary[]): MatchedMembers {
  const result: MatchedMembers = { ids: [], notFound: [], ambiguous: [] };
  if (!Array.isArray(names)) return result;
  for (const name of names) {
    const written = String(name ?? "").trim();
    const wanted = simplify(written);
    if (!wanted) continue;
    const exact = members.filter(
      (member) => simplify(member.email) === wanted || simplify(member.name ?? "") === wanted
    );
    const candidates =
      exact.length > 0
        ? exact
        : members.filter((member) => simplify(member.name ?? "").split(" ")[0] === wanted);
    if (candidates.length === 1) {
      // The same person only once
      if (!result.ids.includes(candidates[0].id)) result.ids.push(candidates[0].id);
    } else if (candidates.length === 0) {
      result.notFound.push(written);
    } else {
      result.ambiguous.push(written);
    }
  }
  return result;
}

/** « Eric », « Eric » et « Zoé », « Eric », « Zoé » et « Léo »: the names between French quotes */
function quoteNames(names: string[]): string {
  const quoted = names.map((name) => `« ${name} »`);
  if (quoted.length === 1) return quoted[0];
  return `${quoted.slice(0, -1).join(", ")} et ${quoted[quoted.length - 1]}`;
}

/** The message shown above the suggested tasks when some people couldn't be assigned
 *  (undefined when everyone was found). Each name only once ("Eric" in 2 tasks, or "eric" and "Eric") */
function assigneeWarning(notFound: string[], ambiguous: string[]): string | undefined {
  const once = (names: string[]) =>
    names.filter((name, index) => names.findIndex((other) => simplify(other) === simplify(name)) === index);
  const missing = once(notFound);
  const several = once(ambiguous);
  const parts: string[] = [];
  if (missing.length > 0) {
    parts.push(`${quoteNames(missing)} ${missing.length === 1 ? "ne fait" : "ne font"} pas partie de ce projet`);
  }
  if (several.length > 0) {
    parts.push(`${quoteNames(several)} ${several.length === 1 ? "correspond" : "correspondent"} à plusieurs membres`);
  }
  if (parts.length === 0) return undefined;
  return `${parts.join(", ")} : vérifiez « Assigné à » sur chaque tâche avant de les ajouter.`;
}

/** The JSON of the AI's answer. Some AIs add text or wrap the JSON
 *  in ```json ... ```: we then keep what is between the first "{" and the last "}".
 *  JSON.parse throws a SyntaxError if it's still not valid JSON. */
function extractJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // Not pure JSON: we look for it inside the text
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new SyntaxError("No JSON object in the AI answer");
  return JSON.parse(text.slice(start, end + 1));
}

/** A task as the AI writes it (before our checks) */
type AITask = { title?: unknown; description?: unknown; dueDate?: unknown; assignees?: unknown };

/** Reads the tasks in the AI's answer: { "tasks": [...] }, or directly [...] for some AIs.
 *  warning: the people asked for who couldn't be assigned (see assigneeWarning) */
function parseTasks(
  text: string,
  members: UserSummary[],
  today: string
): { tasks: SuggestedTask[]; warning?: string } {
  const data = extractJSON(text);
  const list = Array.isArray(data) ? data : (data as { tasks?: unknown } | null)?.tasks;
  if (!Array.isArray(list)) return { tasks: [] };

  // The names that couldn't be assigned, all tasks together
  const notFound: string[] = [];
  const ambiguous: string[] = [];

  // We check each task: the same limits as the API (title 2 to 200 characters, description up to 1000),
  // a real due date, and only members of the project as assignees
  const tasks = (list as (AITask | null)[])
    .filter((task) => String(task?.title ?? "").trim().length >= 2)
    .slice(0, MAX_SUGGESTED_TASKS)
    .map((task) => {
      const matched = matchMembers(task?.assignees, members);
      notFound.push(...matched.notFound);
      ambiguous.push(...matched.ambiguous);
      return {
        title: String(task?.title ?? "").trim().slice(0, 200),
        description: String(task?.description ?? "").trim().slice(0, 1000),
        dueDate: checkDueDate(task?.dueDate, today),
        assigneeIds: matched.ids,
      };
    });
  return { tasks, warning: assigneeWarning(notFound, ambiguous) };
}

/** AI mode ON: asks the AI for tasks matching the user's message, in the context of the project */
export async function suggestTasks(
  prompt: string,
  // members: the people who can be assigned (owner included), given to the AI by name
  project: { name: string; description: string | null; taskTitles: string[]; members: UserSummary[] }
): Promise<SuggestTasksResult> {
  // 1. The settings (.env.local). baseURL undefined = OpenAI's address
  const apiKey = process.env.TOKEN_IA?.trim();
  const baseURL = process.env.URL_IA?.trim() || undefined;
  const model = process.env.MODEL_IA?.trim() || (baseURL ? "" : OPENAI_DEFAULT_MODEL);
  if (!apiKey) {
    return { success: false, message: "L'IA n'est pas configurée : ajoutez la clé (TOKEN_IA) dans .env.local" };
  }
  if (!model) {
    return { success: false, message: "Indiquez le modèle de votre fournisseur d'IA (MODEL_IA) dans .env.local" };
  }

  // 2. The client. timeout: we don't make the user wait more than 30 seconds
  //    (10 minutes by default); maxRetries: 1 new attempt if the network fails (2 by default)
  const client = new OpenAI({ apiKey, baseURL, timeout: 30 * 1000, maxRetries: 1 });

  // 3. The messages: the instructions ("system"), then the project and the request ("user").
  //    The existing tasks avoid duplicates (at most 50 titles, to keep the request small).
  //    Today's date (with the day of the week) lets the AI compute "demain" or "vendredi";
  //    the members are the only people it may assign (by name, never by id)
  const existingTasks = project.taskTitles.slice(0, 50).map((title) => `- ${title}`).join("\n");
  const memberList = project.members
    .map((member) => `- ${member.name || member.email} (${member.email})`)
    .join("\n");
  const today = todayInParis();
  const todayLabel = new Date(`${today}T12:00:00Z`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: INSTRUCTIONS },
    {
      role: "user",
      content: [
        `Date du jour : ${today} (${todayLabel})`,
        `Projet : ${project.name}`,
        `Description du projet : ${project.description || "aucune"}`,
        `Membres du projet (les seules personnes assignables) :\n${memberList}`,
        `Tâches existantes :\n${existingTasks || "aucune"}`,
        "",
        `Demande de l'utilisateur : ${prompt}`,
      ].join("\n"),
    },
  ];

  try {
    // 4. The call. response_format "json_object" ("JSON mode") asks for valid JSON.
    //    Some AIs don't know this option and answer 400 (BadRequestError):
    //    we then ask again without it (the instructions already ask for JSON).
    let completion: OpenAI.ChatCompletion;
    try {
      completion = await client.chat.completions.create({
        model,
        messages,
        response_format: { type: "json_object" },
      });
    } catch (error) {
      if (!(error instanceof OpenAI.BadRequestError)) throw error;
      completion = await client.chat.completions.create({ model, messages });
    }

    // 5. Cases where there is no usable answer
    const choice = completion.choices[0];
    if (!choice) {
      return { success: false, message: "L'IA n'a pas répondu : réessayez" };
    }
    if (choice.finish_reason === "length") {
      return { success: false, message: "La réponse de l'IA a été coupée : essayez une demande plus courte" };
    }
    // A refusal (forbidden request...) comes in "refusal" (OpenAI) or as a filter (content_filter)
    if (choice.message.refusal || choice.finish_reason === "content_filter") {
      return { success: false, message: "L'IA n'a pas pu répondre à cette demande : reformulez-la" };
    }

    // 6. The tasks, and the warning if someone asked for couldn't be assigned
    const { tasks, warning } = parseTasks(choice.message.content ?? "", project.members, today);
    if (tasks.length === 0) {
      return { success: false, message: "L'IA n'a proposé aucune tâche : précisez votre demande" };
    }
    return { success: true, tasks, warning };
  } catch (error) {
    // The detail stays in the terminal of "npm run dev" (never shown to the user)
    console.error("[AI] suggestTasks:", error);

    // Each problem gets a clear message (error classes of openai-node,
    // the same whatever the provider)
    if (error instanceof OpenAI.AuthenticationError || error instanceof OpenAI.PermissionDeniedError) {
      return { success: false, message: "La clé de l'IA (TOKEN_IA) est invalide ou n'a pas accès à ce modèle" };
    }
    if (error instanceof OpenAI.NotFoundError) {
      return { success: false, message: "Modèle ou adresse de l'IA introuvable : vérifiez MODEL_IA et URL_IA" };
    }
    if (error instanceof OpenAI.RateLimitError) {
      return { success: false, message: "Trop de demandes ou crédit épuisé chez le fournisseur d'IA : réessayez plus tard" };
    }
    // Checked BEFORE APIConnectionError: a timeout is a kind of connection error in openai-node,
    // it would otherwise show "Impossible de joindre..." although the service was reached
    if (error instanceof OpenAI.APIConnectionTimeoutError) {
      return { success: false, message: "L'IA a mis trop de temps à répondre : réessayez" };
    }
    if (error instanceof OpenAI.APIConnectionError) {
      return { success: false, message: "Impossible de joindre le service d'IA : vérifiez URL_IA et votre connexion" };
    }
    if (error instanceof OpenAI.APIError) {
      return { success: false, message: `Le service d'IA a renvoyé une erreur (${error.status ?? "inconnue"})` };
    }
    if (error instanceof SyntaxError) {
      return { success: false, message: "La réponse de l'IA est illisible : réessayez" };
    }
    return { success: false, message: "Une erreur inattendue est survenue avec l'IA" };
  }
}