import { createExam, testExam, statExam } from "./src/exam.js";
import { searchInBank, displayQuestions } from "./src/search.js";
import { createVcard } from "./src/vcard.js";

/*
const colors = require("colors");

const vg = require("vega");
const vegalite = require("vega-lite");*/

const cli = require("@caporal/core").default;

cli
  .version("projetB")
  .version("1.0.0")

  .command("readme", "Display the README.md file")
  .action(({ args, options, logger }) => {
    fs.readFile("./README.md", "utf8", function (err, data) {
      if (err) {
        return logger.warn(err);
      }

      logger.info(data);
    });
  })

  // Les fonctions F2, F4, F5, F9 et F10 n’ont pas été développées indépendamment car elles sont prises en charge par les autres fonctionnalités existantes.

  // F1 : création de la commande searchQuestion

  .command(
    "searchQuestion",
    "Chercher une question dans la banque de questions"
  )
  .argument("[kw]", "Mot-clé de recherche")
  .argument("[id]", "ID spécifique de la question")
  .argument("[type]", "Type spécifique de la question")
  .option("--all", "Afficher les détails de la question")
  .action(({ args, options }) => {
    searchInBank(args.kw, [args.id], args.type).then((results) => {
      displayQuestions(results, options.all);
    });
  })

  // F3 : création de la commande createExam (spécifications sous-jacentes : F2, F4, F5)
  .command("createExam", "Créer un examen à partir d'IDs")
  .argument("<examName>", "Nom de l'examen")
  .argument("<ids>", "Liste d'IDs séparés par des virgules")
  .option("--showDetails", "Afficher les détails des questions")
  .action(({ args, options, logger }) => {
    // Appel de la fonction createExam qui se trouve dans exam.js
    const idsArray = args.ids.split(",").map((x) => x.trim());
    createExam(args.examName, idsArray, options.showDetails, logger);
  })

  // F6 : création de la commande createVcard

  .command("createVcard", "Créer une vCard à partir d'un utilisateur")
  .argument("<completeName>", "Nom complet de l'utilisateur")
  .argument("<email>", "Adresse e-mail de l'utilisateur")
  .argument("<school>", "École de l'utilisateur")
  .argument("[phone]", "Numéro de téléphone de l'utilisateur")
  .action(async ({ args, logger }) => {
    // Appel de la fonction searchQuestion qui se trouve dans search.js
    await createVcard(
      args.completeName,
      args.email,
      args.school,
      args.phone,
      logger
    );
  })

  // F7 : création de la commande testExam

  .command("testExam", "Simuler un examen et obtenir une note")
  .argument("<FileName>", "Nom du fichier de l'examen à tester")
  .argument(
    "<FileUserAnswers>",
    "Nom du fichier contenant les réponses de l'utilisateur"
  )
  .action(({ args, logger }) => {
    // Appel de la fonction testExam qui se trouve dans exam.js
    testExam(args.FileName, args.FileUserAnswers, logger);
  })

  // F8 : création de la commande statExam

  .command("statExam", "Générer des statistiques à partir d'un examen")
  .argument("<FileName>", "Nom du fichier de l'examen à analyser")
  .action(({ args, logger }) => {
    // Appel de la fonction statExam qui se trouve dans exam.js
    statExam(args.FileName, logger);
  });

// Lancement du programme
cli.run(process.argv.slice(2));
