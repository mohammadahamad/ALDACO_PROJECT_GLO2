const fs = require("fs");
const colors = require("colors");

const vg = require("vega");
const vegalite = require("vega-lite");

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
  .command("search <keyword>", "Search for a keyword in data files")
  .option("-id <id>", "Specify an ID to narrow down the search")
  .option("-type <type>", "Specify a type to narrow down the search")
  .option(
    "-kw <kw>",
    "Specify an additional keyword to narrow down the search"
  );

cli.run(process.argv.slice(2));
