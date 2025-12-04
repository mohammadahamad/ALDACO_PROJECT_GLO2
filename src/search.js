import fs from "fs";

/**
 * Fonction pour récupérer les questions dans la banque de questions avec des critères de recherche.
 * Répond à l'exigence F1.
 *
 * @param {string} kw Mot-clé pour la recherche
 * @param {string} id id de la question
 * @param {string} type type de la question
 * @returns
 */
export function searchInBank(kw, id, type, showAll) {
  if (!kw && !id && !type) {
    logger.error(
      "Veuillez fournir au moins un critère de recherche (mot-clé, ID, type de question)."
    );
    return;
  }

  let index = 0;
  for (const fileName of getAllFilesFromDir("./res/SujetB_data")) {
    fs.readFile(`./res/SujetB_data/${fileName}`, "utf8", function (err, data) {
      if (err) {
        console.error(err);
      }
      const questions = data.split("::").slice(1);
      for (let i = 0; i < questions.length; i += 2) {
        if (kw) {
          for (let keyword of kw.split(",")) {
            if (
              questions[i].includes(keyword) ||
              questions[i + 1].includes(keyword)
            ) {
              console.log("From exam file: " + fileName);
              console.log("[ID] : " + questions[i]);
              if (showAll) {
                console.log("\n[content] :\n" + questions[i + 1]);
              }
              index++;
              break;
            }
          }
        }
        if (id) {
          if (questions[i].includes(id)) {
            console.log("[ID] : " + questions[i]);
            if (showAll) {
              console.log("\n[content] :\n" + questions[i + 1]);
            }
            index++;
          }
        }
        if (type) {
          if (questions[i].includes(type)) {
            questionsFound[index] = questions[i] + "\n" + questions[i + 1];
            index++;
          }
        }
      }
    });
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
