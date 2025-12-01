// F1 : création de la commande searchQuestion
export function searchQuestion(kw, id, type, showAll, logger) {
    if (kw) {
        // Recherche dans la base de données et message d'erreur si pas trouvé
        let ListQuestions = []; // stocker dedans les questions qui matchent
        // Boucle pour afficher une à une les questions qui matchent (ListQuestions) 
        if (ListQuestions.length === 0) {
            logger.info("Aucune question trouvée.")
        }
        for (i=0 ; i < ListQuestions.length(); i++) {
            //Affichage
        }

    }
    if (id) {

    }
    if (type) {

    }
    if (!kw && !id && !type) {
        logger.error("Veuillez fournir au moins un critère de recherche (mot-clé, ID, type de question).");
        return;
    }
    

}