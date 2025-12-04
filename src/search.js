import fs from "fs";

/**
 * Fonction pour récupérer les questions dans la banque de questions avec des critères de recherche.
 *
 * @param {string} kw Mot-clé pour la recherche
 * @param {string} id id de la question
 * @param {string} type type de la question
 * @param {boolean} showAll Indicateur pour afficher tout le contenu de la question
 */
export function searchInBank(kw, id, type, showAll) {
  if (!kw && !id && !type) {
    logger.error(
      "Veuillez fournir au moins un critère de recherche (mot-clé, ID, type de question)."
    );
    return;
  }

  // Parcourt tous les fichiers dans le répertoire spécifié
  for (const fileName of getAllFilesFromDir("./res/SujetB_data")) {
    fs.readFile(`./res/SujetB_data/${fileName}`, "utf8", function (err, data) {
      if (err) {
        console.error(err);
      }

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
              console.log("From exam file: " + fileName);
              console.log("\t[ID] : " + questions[i]);
              if (showAll) {
                console.log("\n\t[content] :\n" + questions[i + 1]);
              }
              break;
            }
          }
        }

        // Check si l'ID de la question contient l'ID ou le type spécifié
        if (id || type) {
          if (questions[i].includes(id) || questions[i].includes(type)) {
            console.log("From exam file: " + fileName);
            console.log("\t[ID] : " + questions[i]);
            if (showAll) {
              console.log("\n\t[content] :\n" + questions[i + 1]);
            }
          }
        }
      }
    });
  }
}

// Pour utiliser dans exam.js :
module.exports = { searchInBank } ;

/**
 * Récupère tous les fichiers d'un répertoire donné
 *
 * @param {string} dirPath Chemin du répertoire
 * @returns Liste des fichiers dans le répertoire
 */
export function getAllFilesFromDir(dirPath) {
  return fs.readdirSync(dirPath);
}
