import fs from "fs";

describe("Program testing of search functionality", function () {
 beforeAll(function () {});

  it("should create an exam from a vcf file", async function () {
    const { createVcard } = await import("../src/vcard.js");
    await createVcard("Prenom Nom", "prenom.nom@utt.fr", "UTT", "0123456789", console);

    expectAsync(() =>
      fs.promises.access("./res/vcard/penom_nom.vcf")
    ).not.toThrow();
  });
});