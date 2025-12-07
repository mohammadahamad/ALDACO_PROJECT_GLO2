import fs from "fs";
import { searchInBank } from "./search.js";
import * as vega from "vega";
import * as vegaLite from "vega-lite";
import { createCanvas } from "canvas";
import readline from "readline";

/**
 * Fonction pour récupérer les questions dans la banque de questions pour creer un enouvel examen .gift et créer sa fiche profil .csv qui decrit le nombre de question par type de question.
 *
 * @param {string} examName Nom de l'examen
 * @param {string[]} idsArray Tableau des IDs des questions
 * @param {string} author Nom de l'auteur de l'examen
 */
// F3 : création de la commande createExam :
export async function createExam(examName, idsArray, author) {
  for (let id of idsArray) {
    console.log(id);
  }
  // Vérification du nombre d'IDs uniques (entre 15 et 20)
  if (!check(idsArray)) {
    console.log(
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

  // Création du CSV pour le profil de l'examen
  function detectQuestionType(text) {
    text = text.toLowerCase();

    const hasEqual = text.includes("=");
    const hasTilde = text.includes("~");
    const hasArrow = text.includes("->");
    const hasTrueFalse = /(t|f|true|false|TRUE|FALSE)/.test(text);

    if (hasEqual && hasTilde) return "choix_multiples";
    if (hasTrueFalse) return "vrai_faux";
    if (hasArrow) return "correspondance";
    if (hasEqual && !hasTilde && !hasArrow) return "mot_manquant";
    if (text.includes("{#")) return "numerique";
    if (!hasEqual && !hasTilde && !hasArrow) return "question_ouverte";

    return "autre";
  }

  const counters = {
    choix_multiples: 0,
    vrai_faux: 0,
    correspondance: 0,
    mot_manquant: 0,
    numerique: 0,
    question_ouverte: 0,
  };

  for (const question of questionsConfirmed) {
    const type = detectQuestionType(question.content);
    if (counters[type] !== undefined) counters[type]++;
  }

  if (!fs.existsSync("./res/profiles")) {
    fs.mkdirSync("./res/profiles", { recursive: true });
  }

  const csvContent =
    `choix multiples,${counters.choix_multiples}\n` +
    `vrai-faux,${counters.vrai_faux}\n` +
    `correspondance,${counters.correspondance}\n` +
    `mot manquant,${counters.mot_manquant}\n` +
    `numérique,${counters.numerique}\n` +
    `question ouverte,${counters.question_ouverte}\n`;

  fs.writeFileSync(`./res/profiles/${examName}.csv`, csvContent, "utf8");
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
    uniqueIds.length === idsArray.length &&
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
        const [type, number] = line.split(/[;,]/).map((s) => s.trim());
        const numberInt = parseInt(number, 10); // convertir le string en entier
        NumberOfQuestions += numberInt;
      }

      for (let line of lines) {
        const [type, number] = line.split(/[;,]/).map((s) => s.trim());
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
          domain: [
            "choix multiples",
            "vrai-faux",
            "correspondance",
            "mot manquant",
            "numérique",
            "question ouverte",
          ],
          range: [
            "#9467bd",
            "#b2e69eff",
            "#aec7e8",
            "#e8aeddff",
            "#f5d77dff",
            "#55e0d4ff",
          ],
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
  const canvas = await view.toCanvas();

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

  // Rapport comparatif :
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) =>
    new Promise((resolve) => rl.question(query, resolve));

  const response = await question(
    "\nVoulez-vous une différence relative entre deux fichiers pour un type de question ? [O/N] : "
  );

  if (response.toUpperCase() === "O") {
    // Afficher la liste des fichiers disponibles
    console.log("\nFichiers disponibles :");
    files.forEach((f) => console.log(`${f}`));

    const file1 = await question("\nChoisissez le premier fichier : ");
    const file2 = await question("\nChoisissez le deuxième fichier : ");

    // Afficher les types disponibles
    console.log(
      "\nTypes de questions disponibles : choix multiples, vrai-faux, correspondance, mot manquant, numérique, question ouverte"
    );
    const selectedType = await question(
      "\nChoisissez le type de question parmi la liste ci-dessus : "
    );

    // Récupérer les pourcentages déjà calculés dans profilesVega
    const percent1 =
      profilesVega.find((p) => p.fileName === file1 && p.type === selectedType)
        ?.percentage || 0;
    const percent2 =
      profilesVega.find((p) => p.fileName === file2 && p.type === selectedType)
        ?.percentage || 0;

    // Calculer la différence relative
    let difference;
    if (percent1 !== 0) {
      difference = ((percent2 - percent1) / percent1) * 100;
    } else {
      difference = percent2;
    }
    difference = parseFloat(difference.toFixed(1));

    console.log(`Type de question : ${selectedType}`);
    console.log(`${file1} : ${percent1}%`);
    console.log(`${file2} : ${percent2}%`);
    console.log(`Différence relative : ${difference}%`);
  }
  rl.close();
}
