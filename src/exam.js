import fs from "fs";
import { searchInBank } from "./search.js";
import * as vega from "vega";
import * as vegaLite from "vega-lite";
import { createCanvas } from "canvas";
import readline from "readline";

/**
 * Fonction pour récupérer les questions dans la banque de questions avec des critères de recherche.
 *
 * @param {string} kw Mot-clé pour la recherche
 * @param {string} id id de la question
 * @param {string} type type de la question
 * @param {boolean} showAll Indicateur pour afficher tout le contenu de la question
 */

// F3 : création de la commande createExam :
export async function createExam(examName, idsArray, author) {
  // Vérification du nombre d'IDs uniques (entre 15 et 20)
  if (!check(idsArray)) {
    console$.log(
      "[ERREUR] Veuillez indiquer entre 15 et 20 identifiants de questions uniques."
    );
    return;
  }

  // Confirmation des IDs
  const questionsConfirmed = [];
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  for (const id of idsArray) {
    await searchInBank(null, [id], null).then(async (results) => {
      if (results.length === 0) {
        console.log(
          `[ERREUR] La question avec l'ID ${id} n'a pas été trouvée dans la banque de questions.`
        );
        return;
      }
      console.log("Question trouvée pour l'id " + id + " :");
      console.log(results);
      const answer = await ask("Confirmer son ajout ? [y/n]\n", rl);
      if (answer.toLowerCase() === "y") {
        questionsConfirmed.push(...results);
      }
    });
  }

  // Vérification que toutes les questions ont été confirmées sinon proposer un remplacement
  while (questionsConfirmed.length < idsArray.length) {
    console.log(
      "[INFO] Nombre de questions confirmées : " + questionsConfirmed.length
    );
    const missingCount = idsArray.length - questionsConfirmed.length;
    console.log(
      `[INFO] Il manque ${missingCount} questions. Veuillez fournir un ID de remplacement.`
    );
    let newId = await ask("Entrez l'ID de la question de remplacement :\n", rl);
    let question = null;

    // Recherche de la nouvelle question jusqu'à ce qu'une valide soit trouvée
    while (!question) {
      await searchInBank(null, [newId], null).then(async (results) => {
        if (results.length === 0) {
          console.log(
            `[ERREUR] La question avec l'ID ${newId} n'a pas été trouvée dans la banque de questions. Veuillez en fournir un autre.`
          );
          newId = await ask(
            "Entrez l'ID de la question de remplacement :\n",
            rl
          );
        } else {
          question = results[0];
        }
      });
    }

    //vérification de la question et confirmation de son ajout
    console.log("Question trouvée pour l'id " + newId + " :");
    console.log(question);
    const answer = await ask("Confirmer son ajout ? [y/n]\n", rl);

    if (answer.toLowerCase() === "y" && check(questionsConfirmed, question)) {
      questionsConfirmed.push(question);
    }
  }

  rl.close();

  // Création et enregistrement de l'examen au format GIFT
  let examContent = "" + author + "\n\n";
  questionsConfirmed.forEach((question) => {
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
}

/**
 * Fonction pour poser une question à l'utilisateur dans le terminal et récupérer sa réponse.
 *
 * @param {*} question  La question à poser
 * @param {*} rl Interface readline pour l'entrée/sortie
 * @returns {Promise<string>} La réponse de l'utilisateur
 */
function ask(question, rl) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 *  Vérifie si les IDs sont uniques et dans le bon nombre
 *
 * @param {*} idsArray Tableau des IDs
 * @param {*} newQuestion Nouvelle question à vérifier
 * @returns {boolean} Indique si les IDs sont valides
 */
function check(idsArray, newQuestion) {
  if (newQuestion) {
    for (let id of idsArray) {
      if (newQuestion.id === id) {
        return false;
      }
    }
    return true;
  }
  let uniqueIds = [...new Set(idsArray)];
  return (
    uniqueIds.length !== idsArray.length &&
    idsArray.length >= 15 &&
    idsArray.length <= 20
  );
}

// F7 : création de la commande testExam :
export function testExam(examName, UserAnswersFile, logger) {
  // Vérifier que les fichiers existent
  if (!fs.existsSync(examen)) {
    logger.error(`Le fichier d'examen n'existe pas : ${examName}`);
    return;
  }
  if (!fs.existsSync(UserAnswersFile)) {
    logger.error(`Le fichier de réponses n'existe pas : ${UserAnswersFile}`);
    return;
  }

  // Lire les fichiers :
  const examContent = fs.readFileSync(
    "./res/examCreated/${examName}.gift",
    "utf8"
  );
  const userAnswersContent = fs.readFileSync(
    "./res/UsersAnswers/${UserAnswersFile}.gift",
    "utf8"
  );

  // Divise le contenu en questions
  // slice(1) pour retirer le premier élément vide avant le premier ::
  const examQuestions = examContent.split("::").slice(1);
  const userAnswers = userAnswersContent.split("::").slice(1);

  let GoodAnswers = 0;
  let BadAnswers = 0;
  let TotalQuestions = 0;
  // Note
  // Liste bonnes réponses / mauvaises
  // Liste réponses
}

// F8 : création de la commande statExam :
export async function statExam(examName, logger) {
  // fonction qui decoupe le fichier en questions
  function extractQuestions(content) {
    return content
      .split("}")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .map((q) => q + "}");
  }

  // fonction qui detecte le type de question
  function detectType(block) {
    const lower = block.toLowerCase();

    if (block.includes("=") && block.includes("~")) {
      return "qcm";
    }

    if (
      lower.includes("{t}") ||
      lower.includes("{f}") ||
      lower.includes("{true}") ||
      lower.includes("{false}")
    ) {
      return "vrai/faux";
    }

    return "ouverte";
  }

  // fonction qui compte le type de question
  function countTypes(arr) {
    const obj = {};

    arr.forEach((t) => {
      obj[t] = (obj[t] || 0) + 1;
    });

    return Object.entries(obj).map(([type, n]) => ({
      type,
      n,
    }));
  }

  // on recupere la position de l'examen a analyser
  const examPath = path.join("./res/SujetB_data", `${examName}.gift`);

  // on verifie que le fichier de l'examen existe
  if (!fs.existsSync(examPath)) {
    logger.error(`Le fichier d'examen n'existe pas : ${examName}`);
    return;
  }

  // lecture du contenu de l'examen
  const content = fs.readFileSync(examPath, "utf8");

  // traitement des données
  const questions = extractQuestions(content);
  const types = questions.map((q) => detectType(q));
  const dataset = countTypes(types);
}

// F9: création de la commande compareExam :
export async function compareExam(files, logger) {
  const profilesVega = []; // données exploitables pour Vega-Lite

  // Ouvrir les fichiers en argument :
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.endsWith(".csv")) {
      const dataCSV = fs.readFileSync(`./res/profiles/${file}`, "utf8");

      const lines = dataCSV.trim().split("\n");

      let NumberOfQuestions = 0;

      // Calcul nombre de questions totales pour pourcentages :
      for (let line of lines) {
        const [type, number] = line.split(",").map((s) => s.trim());
        const numberInt = parseInt(number, 10); // convertir le string en entier
        NumberOfQuestions += numberInt;
      }

      for (let line of lines) {
        const [type, number] = line.split(",").map((s) => s.trim());
        const numberInt = parseInt(number, 10);
        // Calcul des pourcentages pour chaque type avec 1 chiffre après la virgule :
        const percentage = ((numberInt / NumberOfQuestions) * 100).toFixed(1);
        // On ajoute à la liste contenant les données sur tous les fichiers :
        profilesVega.push({
          fileName: file,
          type,
          percentage: parseFloat(percentage),
        });
      }
    } else {
      logger.error(`Le profil d'examen n'existe pas : ${file}`);
    }
  }

  // specifications Vega-Lite
  const specVL = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Histogramme des types de questions selon les examens",
    width: 500,
    height: 350,
    data: {
      values: profilesVega,
    },
    mark: "bar",
    encoding: {
      x: {
        field: "fileName",
        type: "nominal",
        title: "Fichiers",
      },
      y: {
        field: "percentage",
        type: "quantitative",
        title: "Pourcentage (%)",
        scale: {
          domain: [0, 100],
        },
      },
      color: {
        field: "type",
        type: "nominal",
        scale: {
          domain: ["qcm", "vrai/faux", "ouverte"], // A MODIFIER
          range: ["#9467bd", "#b2e69eff", "#aec7e8"],
        },
        title: "Types de questions",
      },
    },
  };

  // Compilation Vega-Lite en Vega
  const vegaSpec = vegaLite.compile(specVL).spec;

  // Initialisation du moteur Vega
  const view = new vega.View(vega.parse(vegaSpec), {
    renderer: "none",
    logLevel: vega.Warn,
    loader: vega.loader(),
  });

  // Rendu PNG
  const canvas = createCanvas(500, 350);
  view.initialize(canvas);
  await view.toCanvas();

  // Sauvegarder la spécification sans remplacer les éventuels comparaisons déjà existantes dans le répertoire :
  let comparisonNumber = 1;
  const existingFiles = fs.readdirSync("./res/stats");

  // Trouver tous les fichiers comparison_X.png
  const comparisonFiles = existingFiles.filter((f) =>
    f.match(/^comparison_\d+\.png$/)
  );

  if (comparisonFiles.length > 0) {
    // Extraire les numéros et trouver le max
    const numbers = comparisonFiles.map((f) => {
      const match = f.match(/^comparison_(\d+)\.png$/);
      return match ? parseInt(match[1], 10) : 0;
    });
    comparisonNumber = Math.max(...numbers) + 1;
  }

  const outputPath = `./res/stats/comparison_${comparisonNumber}.png`;
  fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));
  console.log("Histogramme généré :", outputPath);
}
