# API Orientation — Guide des modules

Ce document explique le role et les responsabilites de chaque module de l'API, en termes fonctionnels et metier. Il est
destine a comprendre a quoi sert chaque module et comment ils se completent, sans entrer dans les details de code.

## Vue d'ensemble

L'API supporte un parcours d'orientation base sur le modele RIASEC. Elle orchestre la creation de sessions de test, la
collecte des reponses, le calcul des profils, la restitution des resultats et la generation de recommandations, avec un
ensemble de modules de contenu et d'administration.

## Cartographie des domaines

Le projet est organise autour des domaines suivants.

- Coeur du test RIASEC: Sessions, Questions, Responses, Scoring, Results
- Identite et comptes: Auth, Users
- Orientation et catalogues: Careers, Recommendations, Resources, Institutions
- Engagement et communication: Badges, Announcements, Contact
- Pilotage et gouvernance: Admin, Audit
- Infrastructure transversale: Prisma, Common, Media, Localization, AppModule, main

## Detail des modules

### Auth

Rôle principal: securiser l'acces a l'API et gerer l'identite.

Ce que fait le module:

- Inscription et authentification des utilisateurs
- Emission et renouvellement des tokens d'acces et de rafraichissement
- Deconnexion et rotation des tokens
- Demande et reinitialisation de mot de passe
- Trace le contexte de connexion (ex. IP, agent utilisateur) pour renforcer la securite

Importance:
Il protege l'ensemble de la plateforme et garantit l'integrite des sessions utilisateur.

### Users

Rôle principal: gerer les profils et preferences utilisateur.

Ce que fait le module:

- Consultation et mise a jour du profil
- Gestion des preferences (themes, tailles, consentements)
- Listing et recherche des utilisateurs pour l'administration
- Attribution et modification de roles par les admins

Importance:
Il personnalise l'experience et assure la gouvernance des acces.

### Sessions

Rôle principal: creer et suivre les sessions de test.

Ce que fait le module:

- Creation d'une session (anonyme ou liee a un compte)
- Resolution de la version de test active
- Gestion des phases, progression et tokens de partage
- Stockage du contexte de session (appareil, IP, etc.)

Importance:
C'est le point d'entree du parcours RIASEC et l'ancrage de toutes les reponses et resultats.

### Questions

Rôle principal: fournir la banque de questions RIASEC.

Ce que fait le module:

- Expose les questions des phases 1 et 2
- Gere les sections et l'ordre d'affichage
- Supporte les traductions par langue
- Permet la gestion du catalogue de questions par les roles admin et editor

Importance:
Il garantit la qualite et la coherence du contenu du test.

### Responses

Rôle principal: enregistrer les reponses utilisateur.

Ce que fait le module:

- Valide la session et les questions repondues
- Enregistre les reponses par phase
- Met a jour la progression et les changements de phase
- Invalide les resultats existants en cas de modification de reponses
- Declenche badges associes

Importance:
Il assure la fiabilite des donnees sources du scoring.

### Scoring

Rôle principal: transformer les reponses en scores RIASEC.

Ce que fait le module:

- Calcule les scores bruts par type RIASEC
- Normalise les scores et genere les codes dominants
- Mesure la coherence et la differentiation du profil
- Produit des indicateurs de force du profil

Importance:
Il convertit les reponses en informations interpretable et comparables.

### Results

Rôle principal: consolider et restituer les resultats.

Ce que fait le module:

- Verifie la completion des phases
- Demande le calcul des scores puis persiste le resultat
- Met a jour l'etat final de la session
- Fournit l'acces aux resultats et suit les consultations
- Declenche badges finaux

Importance:
Il constitue la sortie officielle du test et centralise l'experience finale.

### Treasure Map (dans Results)

Rôle principal: generer une synthese partageable et visuelle des resultats.

Ce que fait le module:

- Construit une carte de synthese du profil
- Produit des recommandations associees au profil
- Genere un PDF optionnel via le stockage
- Gere les liens de partage et les statistiques de consultation

Importance:
Il rend les resultats actionnables et partageables.

### Recommendations

Rôle principal: proposer des metiers en lien avec le profil RIASEC.

Ce que fait le module:

- Recupere ou calcule le resultat si absent
- Pondere les codes dominants et calcule un score par metier
- Prend en compte des facteurs contextuels (ex. demande locale)
- Enregistre les recommandations pour l'utilisateur

Importance:
Il transforme le profil en pistes concretes d'orientation.

### Careers

Rôle principal: maintenir le catalogue des metiers.

Ce que fait le module:

- Liste et recherche de metiers
- Gestion detaillee des fiches metiers
- Administration du catalogue (creation, mise a jour, desactivation)

Importance:
Il fournit la base de donnees necessaire aux recommandations.

### Resources

Rôle principal: fournir des ressources pedagogiques.

Ce que fait le module:

- Catalogue de ressources, filtres et pagination
- Publication et planification des contenus
- Support de traductions et media associes
- Statistiques de consultation

Importance:
Il enrichit l'orientation par des contenus de reference.

### Institutions

Rôle principal: exposer les etablissements et parcours de formation.

Ce que fait le module:

- Listing par zone geographique, type ou recherche
- Gestion des fiches etablissements
- Traductions et gestion de l'activite

Importance:
Il relie les recommandations aux options de formation reelles.

### Announcements

Rôle principal: communiquer des annonces aux utilisateurs.

Ce que fait le module:

- Diffusion d'annonces actives par periode
- Ciblage par audience
- Traductions et gestion par l'administration

Importance:
Il permet la communication officielle avec les utilisateurs.

### Contact

Rôle principal: gerer les demandes de contact ou support.

Ce que fait le module:

- Creation de demandes publiques
- Suivi, affectation et reponse par l'administration
- Export des demandes pour reporting

Importance:
Il structure le support utilisateur et la relation service.

### Badges

Rôle principal: gamifier le parcours d'orientation.

Ce que fait le module:

- Catalogue de badges par defaut
- Attribution de badges aux etapes clefs
- Gestion de l'XP et des niveaux utilisateur

Importance:
Il augmente l'engagement et la motivation.

### Admin

Rôle principal: administration des catalogues et gouvernance.

Ce que fait le module:

- Gestion des types RIASEC et options d'aptitudes
- Acces aux journaux d'audit
- Catalogue des roles applicatifs

Importance:
Il permet de piloter le contenu et les regles metier.

### Audit

Rôle principal: tracer les actions sensibles.

Ce que fait le module:

- Enregistre l'utilisateur, l'action, l'entite et le contexte
- Centralise la traçabilite des operations admin

Importance:
Il renforce la conformite et la responsabilite.

### Localization

Rôle principal: gerer les langues disponibles.

Ce que fait le module:

- Listing des langues actives
- Ajout et mise a jour des langues

Importance:
Il rend l'application accessible a plusieurs publics.

### Media

Rôle principal: centraliser le stockage de fichiers.

Ce que fait le module:

- Stockage local ou cloud selon la configuration
- Generation et mise a disposition de fichiers (ex. PDF)

Importance:
Il supporte les contenus visuels et les exports.

### Prisma

Rôle principal: acces aux donnees.

Ce que fait le module:

- Fournit l'ORM et la connexion a la base
- Normalise les acces aux entites

Importance:
Il garantit la coherence des operations sur la base.

### Common

Rôle principal: fonctions transversales reutilisables.

Ce que fait le module:

- Securite: guards d'authentification, roles, limitation de requetes
- Decorateurs communs pour simplifier l'usage des roles et du contexte
- Services utilitaires: mail, logging, filtres d'erreurs, export CSV

Importance:
Il homogénéise les comportements et evite la duplication.

### AppModule

Rôle principal: orchestration globale.

Ce que fait le module:

- Declare et assemble tous les modules
- Active les gardes et interceptors globaux
- Configure les parametres transversaux

Importance:
Il est le point d'integration de l'application.

### main

Rôle principal: demarrage de l'API.

Ce que fait le module:

- Initialise l'application
- Applique la configuration de securite et de validation
- Active les integrations d'observabilite

Importance:
Il conditionne le comportement global de l'API en execution.
