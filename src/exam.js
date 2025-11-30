// F3, F2, F5, F4, 


export function createExam(examName, idsArray, showDetails, logger) {
    // Implémentation de la fonction createExam
    if (idsArray.length >= 15 && idsArray.length <= 20) {
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
        const pathdatabase = path.join(__dirname, "../SujetB_data")
        const questions = JSON.parse(FileSystem.readFileSync(pathdatabase, "utf8"));

        // La liste des questions après demande de validation :
        let listeExam = [] ;
        for (let k = 0; k < idsArray.length ; k++) {


            //CHERCHER DANS LA BASE DE DONNEES


            // Si l'option est activée :
            if (showDetails) {
                console.log("ID : ${idsArray[k]}");
                // faut définir type, texte, options, réponses
                console.log("Type : ${idsArray[k].type}");
                console.log("Type : ${idsArray[k].texte}");
                console.log("Type : ${idsArray[k].options}");
                console.log("Type : ${idsArray[k].reponses}");
            }

            // Demande de confirmation et attente de réponse :
            const rep = readlineSync.question("Vous confirmez l'ajout de cette question ? [O/N]");
            if (rep.toUpperCase() === 'O'){
                listeExam.push(idsArray[k])
                console.log("Question ${idsArray[k]} ajoutée à l'examen.")
            }
            // Créer fichier gift dans res/mes_examens :
            const filePath = path.join(dirPath, `examen_${examName}.gift`);
        }
    }
    else{
        console.log("Veuillez indiquer entre 15 et 20 questions.");
        return;
    }

}

export function testExam(examName, logger) {
    // Implémentation de la fonction testExam
    // est ce que du coup il manque pas le fichier de réponses de l'utilisateur ?
    

}

export function statExam(examName, logger) {
    // Implémentation de la fonction statExam
}