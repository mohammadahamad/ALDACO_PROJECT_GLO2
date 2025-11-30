// F6

import fs from "fs/promises";
import path from "path";

// Création de la fonction createVcard appelée dans caporalCli.js

export async function createVcard(completeName, email, school, phone, logger) {
  try {
    //Vérification des données obligatoires
    if (!completeName || !email || !school) {
      logger.error("Erreur : nom complet, email et établissement sont obligatoires.");
      return;
    }

    //Construction du contenu VCard
    let vcfContent = 
`BEGIN:VCARD
VERSION:4.0
FN:${completeName}
EMAIL:${email}
ORG:${school}
`;

    if (phone) {
      vcfContent += `TEL:${phone}\n`;
    }

    vcfContent += `END:VCARD\n`;

    //Création du nom du fichier
    const vcardName = completeName.replace(/\\s+/g, "_");
    const filePath = path.join("res", "vcard", `${vcardName}.vcf`);

    //Écriture du fichier
    await fs.writeFile(filePath, vcfContent, "utf-8");

    logger.info(`Fichier VCard créé avec succès : ${filePath}`);

  } catch (err) {
    logger.error("Erreur lors de la génération de la VCard : " + err.message);
  }
}
