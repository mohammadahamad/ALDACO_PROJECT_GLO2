import { searchQuestion, displayQuestions } from "./src/search.js";
import { createExam, testExam, compareExam} from "./src/exam.js";
import { createVcard } from "./src/vcard.js";
import fs from "fs";
import caporal from "@caporal/core";
const { program } = caporal;

program
  .command("readme", "Display the README.md file")
  .action(({ args, options, logger }) => {
    fs.readFile("./README.md", "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      logger.info(data);
    });
  })

  // F1 : création de la commande searchQuestion :
  .command(
    "searchQuestion",
    "Chercher une question dans la banque de questions"
  )
  .argument("[kw]", "Mot-clé de recherche")
  .argument("[id]", "ID spécifique de la question")
  .argument("[type]", "Type spécifique de la question")
  .option("--all", "Afficher les détails de la question")
  .action(({ args, options }) => {
    searchQuestion(args.kw, [args.id], args.type).then((results) => {
      displayQuestions(results, options.all);
    });
  })

  // F3 : création de la commande createExam :
  .command("createExam", "Créer un examen à partir d'IDs")
  .argument("<examName>", "Nom de l'examen")
  .argument("<ids>", "Liste d'IDs séparés par des virgules")
  .argument("<author>", "Nom de l'auteur de l'examen")
  .action(async ({ args, logger }) => {
    const idsArray = args.ids.split(",").map((x) => x.trim());
    await createExam(args.examName, idsArray, args.author);
  })

  // F6 : création de la commande createVcard :
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

  // F7 : création de la commande testExam :
  .command("testExam", "Simuler un examen et obtenir une note")
  .argument("<FileName>", "Nom du fichier de l'examen à tester")
  .argument(
    "<FileUserAnswers>",
    "Nom du fichier contenant les réponses de l'utilisateur"
  )
  .action(({ args, logger }) => {
    testExam(args.FileName, args.FileUserAnswers, logger);
  })

  // F9 : création de la commande compareExam :
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
