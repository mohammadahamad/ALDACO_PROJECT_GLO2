import fs from "fs";
import { searchQuestion } from "./search.js";
import * as vega from "vega";
import * as vegaLite from "vega-lite";
import { createCanvas } from "canvas";
import readline from "readline";

/**
 * Fonction pour récupérer les questions dans la banque de questions pour creer un enouvel examen .gift et créer sa fiche profil .csv qui decrit le nombre de question par type de question.
 * @param {string} examName Nom de l'examen
 * @param {string[]} idsArray Tableau des IDs des questions
 * @param {string} author Nom de l'auteur de l'examen
 * @returns {Promise<void>}
 */
export async function createExam(examName, idsArray, author) {
  const cleanedIds = Array.isArray(idsArray)
    ? idsArray.map((id) => String(id ?? "").trim())
    : [];

  if (!examName || !String(examName).trim()) {
    console.log(
      "[ERREUR] Argument manquant : nom de l'examen. Exemple : createExam \"NomExam\" \"ID1,ID2,...\" \"Auteur\"."
    );
    return;
  }

  if (!author || !String(author).trim()) {
    console.log(
      "[ERREUR] Argument manquant : nom de l'enseignant/auteur. Exemple : createExam \"NomExam\" \"ID1,ID2,...\" \"Auteur\"."
    );
    return;
  }

  if (cleanedIds.length === 0) {
    console.log(
      "[ERREUR] Argument manquant : liste d'IDs. Fournissez entre 15 et 20 identifiants separes par des virgules."
    );
    return;
  }

  const emptyIds = cleanedIds.filter((id) => !id);
  if (emptyIds.length > 0) {
    console.log(
      `[ERREUR] ${emptyIds.length} identifiant(s) vide(s) dans la liste. Verifiez la syntaxe (IDs separes par des virgules).`
    );
    return;
  }

  const uniqueIds = [...new Set(cleanedIds)];
  if (uniqueIds.length !== cleanedIds.length) {
    const duplicates = cleanedIds.filter(
      (id, index) => cleanedIds.indexOf(id) !== index
    );
    const duplicateList = [...new Set(duplicates)].join(", ");
    console.log(
      `[ERREUR] IDs dupliques detectes : ${duplicateList}. Merci de fournir des IDs uniques.`
    );
    return;
  }

  if (cleanedIds.length < 15 || cleanedIds.length > 20) {
    console.log(
      `[ERREUR] Nombre de questions incorrect : ${cleanedIds.length} fourni(es), attendu entre 15 et 20.`
    );
    return;
  }

  idsArray = cleanedIds;

  // Confirmation des IDs
  const questionsConfirmed = [];
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  for (const id of idsArray) {
    await searchQuestion(null, [id], null).then(async (results) => {
      if (results.length === 0) {
        console.log(
          `[ERREUR] La question avec l'ID ${id} n'a pas été trouvée dans la banque de questions.`
        );
        return;
      }
      console.log("Question trouvée pour l'id " + id + " :");
      console.log(results);
      const answer = await ask("Confirmer son ajout ? [O/N]\n", rl);
      if (answer.toUpperCase() === "O") {
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
      await searchQuestion(null, [newId], null).then(async (results) => {
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
    const answer = await ask("Confirmer son ajout ? [O/N]\n", rl);

    if (answer.toUpperCase() === "O" && check(questionsConfirmed, question)) {
      questionsConfirmed.push(question);
    }
  }

  rl.close();

  // Création et enregistrement de l'examen au format GIFT
  console.log("author:", author);
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

  // detection du type de chaque question
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

  // Comptage du nombre de questions par type
  for (const question of questionsConfirmed) {
    const type = detectQuestionType(question.content);
    if (counters[type] !== undefined) counters[type]++;
  }

  if (!fs.existsSync("./res/profiles")) {
    fs.mkdirSync("./res/profiles", { recursive: true });
  }

  // Création et enregistrement du fichier CSV dans le répertoire csv
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
 * Fonction pour supprimer une question d'un examen
 * @param {string} examPath Chemin du fichier d'examen (.gift)
 * @param {string} questionId ID de la question à supprimer
 * @param {*} logger Objet logger pour afficher les messages
 * @returns {Promise<void>}
 */
export async function deleteQuestion(examPath, questionId, logger) {
  // Vérifier que le fichier existe
  if (!fs.existsSync(examPath)) {
    logger.error(`Le fichier d'examen n'existe pas : ${examPath}`);
    return;
  }

  // Lire le fichier d'examen
  const examData = fs.readFileSync(examPath, "utf8");
  const lines = examData.split("\n");

  // Récupérer l'auteur (première ligne)
  const author = lines[0];

  // Parser les questions
  const examDataSplited = examData.split("::").slice(1);
  const questionsArray = [];
  
  for (let i = 0; i < examDataSplited.length; i += 2) {
    questionsArray.push({
      id: examDataSplited[i].trim(),
      content: examDataSplited[i + 1],
    });
  }

  // Trouver et supprimer la question
  const questionIndexToDelete = questionsArray.findIndex(
    (q) => q.id.toLowerCase() === questionId.toLowerCase()
  );

  if (questionIndexToDelete === -1) {
    logger.error(`[ERREUR] La question avec l'ID ${questionId} n'a pas été trouvée dans cet examen.`);
    return;
  }

  // Empêcher la suppression si l'examen contient déjà 15 questions
  if (questionsArray.length <= 15) {
    logger.error(
      `[ERREUR] L'examen contient ${questionsArray.length} questions. Impossible de supprimer une question (minimum 15 questions requis).`
    );
    return;
  }

  const deletedQuestion = questionsArray[questionIndexToDelete];
  questionsArray.splice(questionIndexToDelete, 1);

  // Réécrire le fichier d'examen
  let newExamContent = author + "\n\n";
  questionsArray.forEach((question) => {
    newExamContent += "::" + question.id + ":: " + question.content + "\n";
  });

  fs.writeFileSync(examPath, newExamContent, "utf8");
  logger.info(`[INFO] Question avec l'ID ${questionId} supprimée avec succès.`);

  // Mettre à jour le fichier CSV de profil correspondant
  const examName = examPath.split("/").pop().replace(".gift", "");
  const csvPath = `./res/profiles/${examName}.csv`;

  if (fs.existsSync(csvPath)) {
    // Fonction pour détecter le type de question (même que dans createExam)
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

    const deletedQuestionType = detectQuestionType(deletedQuestion.content);

    const counters = {
      choix_multiples: 0,
      vrai_faux: 0,
      correspondance: 0,
      mot_manquant: 0,
      numerique: 0,
      question_ouverte: 0,
    };

    // Comptage du nombre de questions par type restantes
    for (const question of questionsArray) {
      const type = detectQuestionType(question.content);
      if (counters[type] !== undefined) counters[type]++;
    }

    // Réécrire le fichier CSV
    const newCsvContent =
      `choix multiples,${counters.choix_multiples}\n` +
      `vrai-faux,${counters.vrai_faux}\n` +
      `correspondance,${counters.correspondance}\n` +
      `mot manquant,${counters.mot_manquant}\n` +
      `numérique,${counters.numerique}\n` +
      `question ouverte,${counters.question_ouverte}\n`;

    fs.writeFileSync(csvPath, newCsvContent, "utf8");
    logger.info(`[INFO] Fichier de profil ${examName}.csv mis à jour.`);
  }
}

/**
 * Fonction pour poser une question à l'utilisateur dans le terminal et récupérer sa réponse.
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

/**
 * Fonction qui permet de simuler un examen en comparant les réponses de l'utilisateur avec les réponses correctes et en calculant une note.
 * @param {string} examPath Chemin du fichier de l'examen
 * @param {string} UserAnswersFile Nom du fichier contenant les réponses de l'utilisateur
 * @param {*} logger Objet logger pour afficher les messages
 * @returns {Promise<void> | number} Note obtenue à l'examen
 */
export async function testExam(examPath, UserAnswersFile, logger) {
  // Vérifier que les fichiers existent
  if (!fs.existsSync(examPath)) {
    logger.error(`Le fichier d'examen n'existe pas : ${examPath}`);
    return;
  }
  if (!fs.existsSync(`./res/userAnswer/${UserAnswersFile}`)) {
    logger.error(`Le fichier de réponses n'existe pas : ${UserAnswersFile}`);
    return;
  }

  // Lire les fichiers :
  const examData = await fs.promises.readFile(examPath, "utf8");
  const userData = await fs.promises.readFile(
    `./res/userAnswer/${UserAnswersFile}`,
    "utf8"
  );

  // Diviser les questions et les réponses sans transformer le texte complet en minuscule
  const examDataSplited = examData.split("::").slice(1);
  let questionFound = [];
  for (let i = 0; i < examDataSplited.length; i += 2) {
    questionFound.push({
      id: examDataSplited[i].trim().toLowerCase(),
      content: examDataSplited[i + 1],
    });
  }

  const userDataSplited = userData.split("\n");
  let userAnswers = [];
  for (let line of userDataSplited) {
    if (!line.trim()) continue;
    let userAnswer = line.split("=");
    const id = (userAnswer[0] || "").trim().toLowerCase();
    const answerPart = userAnswer[1] || "";
    userAnswers.push({
      id,
      answer: answerPart
        .split("$")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  }

  let examGoodAnswers = [];
  for (let question of questionFound) {
    examGoodAnswers.push({
      id: question.id.toLowerCase(),
      answer: extractGoodAnswer(question.content),
    });
  }

  let score = 0;
  for (let ua of userAnswers) {
    for (let ega of examGoodAnswers) {
      if (ua.id === ega.id) {
        console.log(`\n[INFO] Vérification de la question ID : ${ua.id}`);
        console.log(`[INFO] Réponse de l'utilisateur : ${ua.answer}`);
        console.log(`[INFO] Bonne(s) réponse(s) : ${ega.answer}`);
        score += checkGoodAnswer(ua.answer, ega.answer);
      }
    }
  }
  console.log(
    "[INFO] Le score attribué pour cet examen est de : " +
      score +
      " sur " +
      userAnswers.length +
      ".\n"
  );
  return score;
}

/**
 * Extrait la ou les bonnes réponses du contenu de la question (gestion multi-bloc, multi=, feedback #, retours-lignes)
 * @param {string} questionContent Contenu de la question (exact tel quel)
 * @return {string[]} Tableau des bonnes réponses
 */
function extractGoodAnswer(questionContent) {
  const blocks = [...questionContent.matchAll(/\{([\s\S]*?)\}/g)].map(
    (m) => m[1]
  );

  const goodAnswers = [];

  for (let block of blocks) {
    const normalizedBlock = block.replace(/\r\n/g, "\n").trim();

    const blockWithoutFeedback = normalizedBlock
      .replace(/#.*?(?=(=|~|$))/g, "")
      .trim();

    const partsByTilde = blockWithoutFeedback.split("~");

    for (let part of partsByTilde) {
      const eqSplit = part
        .split("=")
        .map((s) => s.trim())
        .filter(Boolean);

      for (let candidate of eqSplit) {
        const cleaned = candidate.split("#")[0].trim();
        if (cleaned.length > 0) {
          goodAnswers.push(cleaned);
        }
      }
    }
  }

  return goodAnswers;
}

/**
 * Vérifie si la réponse de l'utilisateur correspond aux bonnes réponses
 * @param {string} userAnswer Réponse de l'utilisateur
 * @param {string[]} goodAnswers Tableau des bonnes réponses
 * @return {number} 1 si la réponse est correcte, sinon 0
 */
function checkGoodAnswer(userAnswers, goodAnswers) {
  if (!userAnswers || !goodAnswers || goodAnswers.length === 0) return 0;

  const clean = (s) =>
    String(s ?? "")
      .toLowerCase()
      .trim();

  const cleanedUser = Array.isArray(userAnswers)
    ? userAnswers.map(clean)
    : [clean(userAnswers)];

  const cleanedGood = goodAnswers.map(clean);

  if (cleanedUser.some((u) => cleanedGood.includes(u))) {
    console.log("[INFO] La réponse est correcte.\n");
    return 1;
  }
  console.log("[INFO] La réponse est incorrecte.\n");
  return 0;
}

/**
 * Fonction qui renvoie un graphique comparant la répartition des types de questions entre plusieurs fichiers CSV de profils d'examen ou d'un seul examen.
 * @param {string[]} files Liste des fichiers CSV à comparer
 * @param {*} logger Objet logger pour afficher les messages
 * @returns {Promise<void>}
 */
export async function compareExam(files, logger) {
  if (!files || files.length === 0) {
    logger.error("Aucun fichier fourni pour compareExam.");
    return;
  }

  const profilesVega = []; // donnees exploitables pour Vega-Lite
  const perFileStats = new Map();

  // Ouvrir les fichiers en argument :
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.endsWith(".csv")) {
      logger.error(`Le profil d'examen n'existe pas : ${file}`);
      continue;
    }
    const filePath = `./res/profiles/${file}`;
    if (!fs.existsSync(filePath)) {
      logger.error(`Le profil d'examen n'existe pas : ${file}`);
      continue;
    }

    const dataCSV = fs.readFileSync(filePath, "utf8");
    const lines = dataCSV
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    let NumberOfQuestions = 0;
    const rows = [];

    // Calcul nombre de questions totales pour pourcentages :
    for (let line of lines) {
      const [type, number] = line.split(/[;,]/).map((s) => s.trim());
      const numberInt = parseInt(number, 10);
      if (!Number.isNaN(numberInt)) {
        NumberOfQuestions += numberInt;
      }
      rows.push({ type, numberInt });
    }

    const stats = [];
    for (let row of rows) {
      const numberInt = Number.isNaN(row.numberInt) ? 0 : row.numberInt;
      const percentage =
        NumberOfQuestions > 0
          ? ((numberInt / NumberOfQuestions) * 100).toFixed(1)
          : "0.0";
      const percentageFloat = parseFloat(percentage);
      stats.push({
        type: row.type,
        count: numberInt,
        percentage: percentageFloat,
      });
      profilesVega.push({
        fileName: file,
        type: row.type,
        percentage: percentageFloat,
      });
    }

    perFileStats.set(file, stats);
  }

  if (profilesVega.length === 0) {
    logger.error("Aucune statistique n'a pu etre calculee.");
    return;
  }

  // specifications Vega-Lite
  const isSingleExam = files.length === 1;
  const specVL = isSingleExam
    ? {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        description: "Histogramme des types de questions (1 examen)",
        width: 500,
        height: 350,
        data: {
          values: profilesVega,
        },
        mark: "bar",
        encoding: {
          x: {
            field: "type",
            type: "nominal",
            title: "Types de questions",
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
                "num?rique",
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
      }
    : {
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
                "num?rique",
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

  if (!fs.existsSync("./res/stats")) {
    fs.mkdirSync("./res/stats", { recursive: true });
  }

  // Sauvegarder la specification sans remplacer les fichiers existants :
  const filePrefix = isSingleExam ? "stat" : "comparison";
  let outputNumber = 1;
  const existingFiles = fs.readdirSync("./res/stats");
  const matchingFiles = existingFiles.filter((f) =>
    f.match(new RegExp(`^${filePrefix}_\\d+\\.png$`))
  );

  if (matchingFiles.length > 0) {
    const numbers = matchingFiles.map((f) => {
      const match = f.match(new RegExp(`^${filePrefix}_(\\d+)\\.png$`));
      return match ? parseInt(match[1], 10) : 0;
    });
    outputNumber = Math.max(...numbers) + 1;
  }

  const outputPath = `./res/stats/${filePrefix}_${outputNumber}.png`;
  fs.writeFileSync(outputPath, canvas.toBuffer("image/png"));
  if (isSingleExam) {
    console.log("[INFO] Mode statistiques (1 examen) : " + files[0]);
    const stats = perFileStats.get(files[0]) || [];
    console.log("[INFO] Repartition des types de questions :");
    stats.forEach((stat) => {
      console.log(`- ${stat.type} : ${stat.count} (${stat.percentage}%)`);
    });
  }
  console.log("Histogramme genere :", outputPath);

  if (isSingleExam) {
    return;
  }

  // Rapport comparatif :
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (query) =>
    new Promise((resolve) => rl.question(query, resolve));

  const response = await question(
    "\nVoulez-vous une difference relative entre deux fichiers pour un type de question ? [O/N] : "
  );

  if (response.toUpperCase() === "O") {
    // Afficher la liste des fichiers disponibles
    console.log("\nFichiers disponibles :");
    files.forEach((f) => console.log(`${f}`));

    const file1 = await question("\nChoisissez le premier fichier : ");
    const file2 = await question("\nChoisissez le deuxieme fichier : ");

    // Afficher les types disponibles
    console.log(
      "\nTypes de questions disponibles : choix multiples, vrai-faux, correspondance, mot manquant, num?rique, question ouverte"
    );
    const selectedType = await question(
      "\nChoisissez le type de question parmi la liste ci-dessus : "
    );

    // Recuperer les pourcentages deja calcules dans profilesVega
    const percent1 =
      profilesVega.find((p) => p.fileName === file1 && p.type === selectedType)
        ?.percentage || 0;
    const percent2 =
      profilesVega.find((p) => p.fileName === file2 && p.type === selectedType)
        ?.percentage || 0;

    // Calculer la difference relative
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
    console.log(`Difference relative : ${difference}%`);
  }
  rl.close();
}