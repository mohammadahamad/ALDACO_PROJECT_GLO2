import { searchQuestion, displayQuestions } from "./src/search.js";
import { createExam, testExam, compareExam } from "./src/exam.js";
import { createVcard } from "./src/vcard.js";
import fs from "fs";
import caporal from "@caporal/core";
const { program } = caporal;

program

  /**
   * Commande readme qui permet d'afficher le contenu du fichier README.md
   */
  .command("readme", "Display the README.md file")
  .action(({ args, options, logger }) => {
    fs.readFile("./README.md", "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      logger.info(data);
    });
  })

  /**
   * Commande searchQuestion qui permet de chercher une question dans la banque de questions
   * @param {string} kw Mot-clé de recherche
   * @param {string} id ID spécifique de la question
   * @param {string} type Type spécifique de la question
   * @param {boolean} showAll Indicateur pour afficher les détails de la question
   */
  .command(
    "searchQuestion",
    "Chercher une question dans la banque de questions"
  )
  .argument("[kw]", "Mot-clé de recherche")
  .argument("[id]", "ID spécifique de la question")
  .argument("[type]", "Type spécifique de la question")
  .option("--all", "Afficher les détails de la question")
  .action(async ({ args, options }) => {
    const keywords = args.kw ? args.kw : null;
    const id = args.id ? args.id : null;
    const type = args.type ? args.type : null;
    await searchQuestion(keywords, id, type).then((results) => {
      displayQuestions(results, options.all);
    });
  })

  /**
   * Commande createExam qui permet de créer un examen à partir d'une liste d'IDs
   * @param {string} examName Nom de l'examen
   * @param {string[]} ids Liste d'IDs pour l'examen
   * @param {string} author Nom de l'auteur de l'examen
   */
  .command("createExam", "Créer un examen à partir d'IDs")
  .argument("<examName>", "Nom de l'examen")
  .argument("<ids>", "Liste d'IDs séparés par des virgules")
  .argument("<author>", "Nom de l'auteur de l'examen")
  .action(async ({ args, logger }) => {
    const idsArray = args.ids.split(",").map((x) => x.trim());
    await createExam(args.examName, idsArray, args.author);
  })

  /**
   * Commande createVcard qui permet de créer une vCard à partir des informations d'un utilisateur
   * @param {string} completeName Nom complet de l'utilisateur
   * @param {string} email Adresse e-mail de l'utilisateur
   * @param {string} school École de l'utilisateur
   * @param {string} phone Numéro de téléphone de l'utilisateur - optionnel
   * @param {*} logger Objet logger pour afficher les messages
   */
  .command("createVcard", "Créer une vCard à partir d'un utilisateur")
  .argument("<completeName>", "Nom complet de l'utilisateur")
  .argument("<email>", "Adresse e-mail de l'utilisateur")
  .argument("<school>", "École de l'utilisateur")
  .argument("[phone]", "Numéro de téléphone de l'utilisateur")
  .action(async ({ args, logger }) => {
    await createVcard(
      args.completeName,
      args.email,
      args.school,
      args.phone,
      logger
    );
  })

  /**
   * Commande testExam qui permet de simuler un examen et obtenir une note
   * @param {string} FileName Nom du fichier de l'examen à tester
   * @param {string} FileUserAnswers Nom du fichier contenant les réponses de l'utilisateur
   * @param {*} logger Objet logger pour afficher les messages
   */
  .command("testExam", "Simuler un examen et obtenir une note")
  .argument("<examPath>", "Nom du fichier de l'examen à tester")
  .argument(
    "<fileUserAnswers>",
    "Nom du fichier contenant les réponses de l'utilisateur"
  )
  .action(async ({ args, logger }) => {
    const examPath = args.examPath;
    const userFile = args.fileUserAnswers;
    await testExam(examPath, userFile, logger);
  })

  /**
   * Commande compareExam qui permet de comparer la répartition de types de questions dans un fichier ou entre plusieurs fichiers
   * @param {string[]} Files Liste des fichiers à comparer
   * @param {*} logger Objet logger pour afficher les messages
   */
  .command(
    "compareExam",
    "Comparer la répartition de types de questions dans un fichier ou entre plusieurs fichiers"
  )
  .argument("<Files...>", "Liste des fichiers à comparer")

  .action(async ({ args, logger }) => {
    const files = args.files;
    await compareExam(files, logger);
  });

program.run(process.argv.slice(2));
