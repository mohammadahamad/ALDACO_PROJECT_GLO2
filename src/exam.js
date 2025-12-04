import fs from "fs";
import { searchInBank } from "./search.js";

/** 
 * Fonction pour récupérer les questions dans la banque de questions avec des critères de recherche.
 *
 * @param {string} kw Mot-clé pour la recherche
 * @param {string} id id de la question
 * @param {string} type type de la question
 * @param {boolean} showAll Indicateur pour afficher tout le contenu de la question
 */

// F3 (et F2, F4, F5) : création de la commande createExam
export function createExam(examName, idsArray, showDetails, logger) {
    // Vérification du nombre d'IDs demandés
    if (idsArray.length < 15 || idsArray.length > 20) {
        console.log("Veuillez indiquer entre 15 et 20 questions.");
        return;
    }

    // Vérification de l'unicité des IDs
    for (let i=0 ; i < idsArray.length ; i++) {
        for (let j=0 ; j < idsArray.length ; j++) {
            // Cas où il y aurait 2 fois la même question :
            if (idsArray[i] === idsArray[j]) {
                console.log("Erreur, répétition de l'identifiant ${idsArray[i]}");
                return;
            }
        }
    }

    // Une fois qu'on a vérifié que chaque ID est unique, on recherche les questions dans la base de données :
     // On créé une liste qui contiendra les questions une fois qu'elles ont été repérées dans la base de données :
    let listeExam = [] ;

    // Pour chaque ID demandé, on recherche s'il existe dans la base de données :
    for (let k=0 ; k < idsArray.length ; k++) {
        searchInBank(null, idsArray[k], null, showDetails);


        // Demande de confirmation et attente de réponse :
        const rep = readlineSync.question("Vous confirmez l'ajout de cette question ? [O/N]");
        if (rep.toUpperCase() === 'O'){
            listeExam.push(idsArray[k])
            console.log("Question ${idsArray[k]} ajoutée à l'examen.")
        }     
        else{
            console.log("Question ${idsArray[k]} ignorée.")
        }   
    }
    if (listeExam.length < 15 || listeExam.length > 20) {
        console.log("Vous avez ignoré trop de questions, l'examen doit en contenir au moins 15.");
        return;
    }

    // Maintenant qu'on a vérifié qu'on avait finalement bien entre 15 et 20 questions, on peut créer le fichier examen.

    // Créer fichier gift dans res/mes_examens :
    const filePath = path.join(dirPath, `examen_${examName}.gift`);
    fs.writeFileSync(filePath, "", "utf8");

    // On écrit dans le fichier :
    for (let k=0 ; k < idsArray.length ; k++) {
        searchInBank(null, idsArray[k], null, showDetails);



        // ECRIRE DANS LE FICHIER ICI


      
    }

}





// F7 : création de la commande testExam
export function testExam(examName, UserAnswersFile, logger) {
    const examPath = path.join('./res/SujetB_data', `examen_${examName}.gift`);

    // Vérifier que les fichiers existent
    if (!fs.existsSync(examPath)) {
        logger.error(`Le fichier d'examen n'existe pas : ${examName}`);
        return;
    }
    if (!fs.existsSync(userAnswersFile)) {
        logger.error(`Le fichier de réponses n'existe pas : ${UserAnswersFile}`);
        return;
    }

    // Lire les fichiers :
    const examContent = fs.readFileSync(examPath, 'utf8');
    const userAnswersContent = fs.readFileSync(UserAnswersFile, 'utf8');

    // Divise le contenu en questions 
    // slice(1) pour retirer le premier élément vide avant le premier ::
    const examQuestions = examContent.split("::").slice(1);
    const userAnswers = userAnswersContent.split("::").slice(1);

    let GoodAnswers = 0 ;
    let BadAnswers  = 0 ;
    let TotalQuestions = 0 ;
}  

    // Note 
    // Liste bonnes réponses / mauvaises
    // Liste réponses
    



  // F8 : création de la commande statExam

export function statExam(examName, logger) {
    // Ouvrir le fichier en argument
    const examPath = path.join('./res/SujetB_data', `examen_${examName}.gift`);

    // Vérifier que les fichiers existent
    if (!fs.existsSync(examPath)) {
        logger.error(`Le fichier d'examen n'existe pas : ${examName}`);
        return;
    }


    // Boucle pour récupérer chaque type de questions dans un array
   
    // Compter le nombre de questions par type
    // Créer l'histogramme
    // Afficher et enregistrer l'histogramme
}