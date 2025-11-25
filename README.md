# README - ALDACO_PROJECT_GLO2 - Sujet B

## Liste des commandes disponibles
à développer


## Description 
Le SRYEM (Sealand Republic Youth Education Ministry) a lancé un projet de transformation numérique visant à moderniser les méthodes d'évaluation dans ses établissements. Pour cela, un utilitaire en ligne de commande a été mis  à disposition, permettant aux enseignants de composer, gérer et simuler des examens au format GIFT, tout en générant un fichier VCard.


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


## Utilisation 

à développer


## Versions

A développer quand on aura une idée des différentes versions à avoir


## Liste des contributeurs 
Equipe pour le cahier des charges : JS_Force
Equipe de développement : ALDACO (Damaris Barbot, Marco Orfao, Albane Verschelde)