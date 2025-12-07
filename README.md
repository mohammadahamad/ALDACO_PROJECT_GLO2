# README - ALDACO_PROJECT_GLO2 - Sujet B

## Description 
Le SRYEM (Sealand Republic Youth Education Ministry) a lancé un projet de transformation numérique visant à moderniser les méthodes d'évaluation dans ses établissements. Pour cela, un utilitaire en ligne de commande a été mis à disposition, permettant aux enseignants de composer, gérer, simuler et visualiser des examens au format GIFT, tout en s'identifiant via un fichier VCard.


## Liste des commandes disponibles
A partir du cahier des charges contenant 10 spécifications (notées F1 à F10), nous avons créé les fonctions suivantes :

searchInBank : Rechercher une question dans la banque de questions à partir d'un mot-clé, d'un ID ou d'un type de questions (F1).

createExam : Composer un examen à partir d'une liste d'ID représentant l'identifiant des questions souhaitées (F3)
Cette fonction répond également à des spécifications sous-jacentes : F2 (affichage détaillée d'une question), F4 (génération d'un fichier examen .gift), F5 (vérification des contraintes d'unicité et de taille) et sauvegarde du fichier (F10). 
Puisque cela sera nécessaire pour la fonction compareExam, une sous-fonction (detectQuestionType) permet, à la création d'un examen, de générer son profil au format CSV.

createVcard : Créer un fichier Vcard .vcf à partir de données utilisateurs : nom, adresse mail, école, et optionnellement son numéro de téléphone (F6, F10).

testExam : Simuler un examen qui permet de comparer un fichier regroupant les réponses d'un étudiant aux réponses de l'examen et d'obtenir une note ainsi que la liste des bonnes ou mauvaises réponses de l'utilisateur (F7).

compareExam : Cette fonction répond à 2 fonctionnalités : le cahier des charges demande d'obtenir des statistiques (selon les types de question) sur un seul fichier (F8) et de comparer deux fichiers ou plus selon les types de questions également (F9). Nous avons regroupé ces deux spécifications dans cette fonction qui prend en paramètre d'entrée un fichier (donc affiche seulement des statistiques) ou plusieurs fichiers (donc compare les statistiques entre fichiers). Ces fichiers correspondent aux profils d'examen en CSV. Cette fonction permet donc d'afficher un histogramme de statistiques de la répartition de types de questions dans un ou plusieurs fichiers. 
Une fois l'histogramme créé, l'utilisateur peut demander une différence relative entre 2 fichiers (parmi la liste fournie en paramètre d'entrée) pour un type de questions en particulier (F9). Cette différence correspond à ((percent2 - percentage1)/percent1)*100.


## Format de données

### Format GIFT (simplifié – ABNF)
gift-question = [ "::" title "::" ] text "{" answer-list "}"
title = 1*(CHAR)
text = 1*(CHAR)
answer-list = 1*(answer)
answer = ("=" / "~") text [ "#" feedback ]
feedback = *(CHAR)

### Format VCard (RFC 6350 - simplifié)
vcard = "BEGIN:VCARD" CRLF
"VERSION:4.0" CRLF
"FN:" full-name CRLF
"EMAIL:" email CRLF
"END:VCARD" CRLF

### Format Profil
type, nombre (CSV simplifié)


## Installation

npm install

Pour installer Vega, Vega-Lite et Canvas :
npm install vega vega-lite canvas


## Utilisation 

A DEVELOPPER


## Versions

Version 1.0 : 
Création des commandes createExam, searchQuestion, createVcard, testExam, statExam.

Version 1.1 : 
Découpage et gestion de la base de données pour la rendre utilisable.

Version 1.2 :
Implémentation des fonctions.

Version 1.3 :
Implémentation Vcard.

Version 1.4 :
Implémentation visualisation avec Vega-Lite.

Version 1.5 :
Création commande compareExam et implémentation.

Version 1.6 :
Unification de statExam et compareExam dans statExam et création et implémentation de detectQuestionType pour la création de profils CSV lors de la création d'un examen dans createExam.

Version 1.7 :
Ajout du rapport comparatif dans compareExam.


## Liste des contributeurs 
Equipe pour le cahier des charges : JS_Force
Equipe de développement : ALDACO (Damaris Barbot, Marco Orfao, Albane Verschelde)