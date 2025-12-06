import fs from "fs";
import readline from "readline";
import { unique } from "vega-lite";

/**
 * Fonction pour récupérer les questions dans la banque de questions avec des critères de recherche.
 *
 * @param {string} kw Mot-clé pour la recherche
 * @param {string[]} id id de la question
 * @param {string} type type de la question
 * @param {boolean} showAll Indicateur pour afficher tout le contenu de la question
 */
export async function searchInBank(kw, id, type) {
  // Vérification qu'au moins un critère de recherche est fourni
  if (!kw && id.length === 0 && !type) {
    logger.error(
      "Veuillez fournir au moins un critère de recherche (mot-clé, ID, type de question)."
    );
    return;
  }

  let questionsFound = [];

  // Parcourt tous les fichiers dans le répertoire spécifié²
  for (const fileName of getAllFilesFromDir("./res/SujetB_data")) {
    const data = await fs.promises.readFile(
      `./res/SujetB_data/${fileName}`,
      "utf8"
    );

    // Divise le contenu du fichier en questions individuelles et soustrait le premier élément vide
    const questions = data.toLowerCase().split("::").slice(1);
    for (let i = 0; i < questions.length; i += 2) {
      // Vérifie si les mot-clés sont présents dans l'ID ou le contenu de la question
      if (kw) {
        for (let keyword of kw.split(",")) {
          if (
            questions[i].includes(keyword) ||
            questions[i + 1].includes(keyword)
          ) {
            questionsFound.push({
              id: questions[i],
              content: questions[i + 1],
            });
            break;
          }
        }
      }

      // Check si l'ID de la question contient l'ID ou le type spécifié
      if (id || type) {
        if (id.length > 0) {
          for (let specificId of id) {
            if (questions[i].includes(specificId.toLowerCase())) {
              questionsFound.push({
                id: questions[i],
                content: questions[i + 1],
              });
            }
          }
        } else if (questions[i].includes(type)) {
          questionsFound.push({
            id: questions[i],
            content: questions[i + 1],
          });
        }
      }
    }
  }
  if (questionsFound.length === 0) {
    console.log("Aucune question trouvée");
  }
  return questionsFound;
}

/**
 * Affiche un tableau de questions dans la console.
 * @param {{id: string, content: string}[]} questionsArray Tableau des questions
 * @param {boolean} showAll Indicateur pour afficher tout le contenu de la question
 */
export function displayQuestions(questionsArray, showAll) {
  for (let question of questionsArray) {
    console.log("[ID] : \n" + question.id);
    if (showAll) {
      console.log("\n[content] :\n" + question.content);
    }
  }
}

/**
 * Récupère tous les fichiers d'un répertoire donné
 *
 * @param {string} dirPath Chemin du répertoire
 * @returns Liste des fichiers dans le répertoire
 */
export function getAllFilesFromDir(dirPath) {
  return fs.readdirSync(dirPath);
}
