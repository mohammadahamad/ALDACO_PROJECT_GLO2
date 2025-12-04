import fs from "fs";
import { searchInBank } from "./search.js";

/**
 * Fonction pour récupérer les questions dans la banque de questions avec des critères de recherche.
 *
 * @param {string} kw Mot-clé pour la recherche
 * @param {string} id id de la question
 * @param {string} type type de la question
 * @param {boolean} showAll Indicateur pour afficher tout le contenu de la question
 */

export function createExam(examName, idsArray, showDetails, logger) {
  // Vérification du nombre d'IDs uniques (entre 15 et 20)
  let uniqueIds = [...new Set(idsArray)];
  if (uniqueIds.length !== idsArray.length) {
    console.log(
      "[ERREUR] Veuillez indiquer des identifiants de questions uniques."
    );
    return;
  }
  if (uniqueIds.size < 15 || uniqueIds.size > 20) {
    console.log("[ERREUR] Veuillez indiquer entre 15 et 20 questions.");
    return;
  }

  // Récupération des questions correspondantes aux IDs fournis
  const questionsFound = [];
  searchInBank(null, idsArray, null).then((results) => {
    questionsFound.push(...results);

    if (questionsFound.length < idsArray.length) {
      console.log(
        "[ERREUR] Certaines questions n'ont pas été trouvées dans la banque de questions."
      );
      return;
    }

    // Création et enregistrement de l'examen au format GIFT
    let examContent = "";
    questionsFound.forEach((question) => {
      examContent += "::" + question.id + ":: " + question.content + "\n";
    });
    fs.writeFile(`./res/examCreated/${examName}.gift`, examContent, (err) => {
      if (err) {
        console.error(
          "[ERREUR] Erreur lors de l'écriture du fichier d'examen :",
          err
        );
      } else {
        console.log("[INFO] Fichier d'examen créé avec succès !");
      }
    });
  });
}

// F7 : création de la commande testExam
export function testExam(examName, UserAnswersFile, logger) {
  const examPath = path.join("./res/SujetB_data", `examen_${examName}.gift`);

  // Vérifier que les fichiers existent
  if (!fs.existsSync(examPath)) {
    logger.error(`Le fichier d'examen n'existe pas : ${examName}`);
    return;
  }
  if (!fs.existsSync(userAnswersFile)) {
    logger.error(`Le fichier de réponses n'existe pas : ${UserAnswersFile}`);
    return;
  }

  // Lire les fichiers :
  const examContent = fs.readFileSync(examPath, "utf8");
  const userAnswersContent = fs.readFileSync(UserAnswersFile, "utf8");

  // Divise le contenu en questions
  // slice(1) pour retirer le premier élément vide avant le premier ::
  const examQuestions = examContent.split("::").slice(1);
  const userAnswers = userAnswersContent.split("::").slice(1);

  let GoodAnswers = 0;
  let BadAnswers = 0;
  let TotalQuestions = 0;
}

// Note
// Liste bonnes réponses / mauvaises
// Liste réponses

// F8 : création de la commande statExam

export function statExam(examName, logger) {
  // Ouvrir le fichier en argument
  const examPath = path.join("./res/SujetB_data", `examen_${examName}.gift`);

  // Vérifier que les fichiers existent
  if (!fs.existsSync(examPath)) {
    logger.error(`Le fichier d'examen n'existe pas : ${examName}`);
    return;
  }

  // Boucle pour récupérer chaque type de questions dans un array

  // Compter le nombre de questions par type
  // Créer l'histogramme
  // Afficher et enregistrer l'histogramme
}
