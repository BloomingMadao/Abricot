/**
 * TODO : Voir commment les données sont retournées par l'API
 */

const projects = {
  "projet-1": {
    title: "Nom du projet 1",
    description:
      "Développement de la nouvelle version de l'API REST avec authentification JWT",
    tasks: [
      {
        title: "une tâche",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur soluta non mollitia doloremque! Praesentium eveniet, laudantium, facere nesciunt culpa exercitationem quasi assumenda optio error adipisci aut odio! Deserunt, quae ipsum?",
        deadline: "13-10-2026",
        users_assigned: ["user1", "user2"],
        status : "À faire"
      },
      {
        title: "une autre tâche",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur soluta non mollitia doloremque! Praesentium eveniet, laudantium, facere nesciunt culpa exercitationem quasi assumenda optio error adipisci aut odio! Deserunt, quae ipsum?",
        deadline: "13-10-2026",
        users_assigned: ["user1", "user3"],
        status : "Terminée"
      },
    ],
    
  },

  "projet-2": {
    title: "Nom du projet 2",
    description:
      "Développement de la nouvelle version de l'API REST avec authentification JWT",
    tasks: [
      {
        title: "une tâche",
        description:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur soluta non mollitia doloremque! Praesentium eveniet, laudantium, facere nesciunt culpa exercitationem quasi assumenda optio error adipisci aut odio! Deserunt, quae ipsum?",
        deadline: "13-10-2026",
        users_assigned: ["user1", "user2"],
      },
    ],
  },
};

export default async function ProjectsDetails({ params }) {
  const { id} = await params;
  const project = projects[id];

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
    <div>
      <div>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
      </div>

      <div>
        <h2>Tâches</h2>
        <div>
          {project.tasks.map((task, index) => (
            <div key={index}>
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <p>Échéance : {task.deadline}</p>

              <p>Assignée à :</p>
              <ul>
                {task.users_assigned.map((user) => (
                  <li key={user}>{user}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
