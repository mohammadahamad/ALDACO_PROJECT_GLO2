
const { createExam, testExam, statExam } = require("./src/exam.js");
const { searchQuestions } = require("./src/search.js");
const { createVcard } = require("./src/vcard.js");


/*const fs = require("fs");
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



  // F3 : création de la commande createExam 

  .command("createExam", "Créer un examen à partir d'IDs")
  .argument("<examName>", "Nom de l'examen")
  .argument("<ids>", "Liste d'IDs séparés par des virgules")
  .option("--showDetails", "Afficher les détails des questions")
  .action(({ args, options, logger }) => {
    // Appel de la fonction createExam qui se trouve dams exam.js
    const idsArray = args.ids.split(",").map((x) => x.trim());
    createExam(args.examName, idsArray, options.showDetails, logger);
  })



  // F1 : création de la commande searchQuestion 

  .command("searchQuestions", "Chercher une question dans la banque de questions")
  .argument("[kw]", "Mot-clé de recherche")
  .argument("[id]", "ID spécifique de la question")
  .argument("[type]", "Type spécifique de la question")
  .option("--all", "Afficher les détails de la question")
  .action(({ args, options, logger }) => {
    // Appel de la fonction searchQuestion qui se trouve dans search.js
    searchQuestions(args.kw, args.id, args.type, options.all, logger);
  })
  /*.command("search <keyword>", "Search for a keyword in data files")
  .option("-id <id>", "Specify an ID to narrow down the search")
  .option("-type <type>", "Specify a type to narrow down the search")
  .option(
    "-kw <kw>",
    "Specify an additional keyword to narrow down the search"
  );*/

  // F6 : création de la commande createVcard 

  .command("createVcard", "Créer une vCard à partir d'un utilisateur")
  .argument("<completeName>", "Nom complet de l'utilisateur")
  .argument("<email>", "Adresse e-mail de l'utilisateur")
  .argument("<school>", "École de l'utilisateur")
  .argument("[phone]", "Numéro de téléphone de l'utilisateur")
  .action(async ({ args, logger }) => {
    // Appel de la fonction searchQuestion qui se trouve dans search.js
    await createVcard(args.completeName, args.email, args.school, args.phone, logger);
  })


  // F7 : création de la commande testExam

  .command("testExam", "Simuler un examen et obtenir une note")
  .argument("<FileName>", "Nom du fichier de l'examen à tester")
  .action(({ args, logger }) => {
    // Appel de la fonction testExam qui se trouve dans exam.js
    testExam(args.FileName, logger);
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