# Interlance — Rôle de l’IA

> Interlance est l’évolution du projet Smart Match, une plateforme intelligente de stages et missions freelance.

## Pourquoi l’IA existe

L’IA réduit le temps de recherche et de présélection. Elle aide le candidat à comprendre son profil et les offres compatibles, et aide le recruteur à ordonner les candidatures liées à ses propres offres. Elle ne remplace ni la lecture du CV, ni l’échange humain, ni la décision de recrutement.

## Problèmes traités

- Repérer rapidement les compétences présentes dans un profil ou un CV.
- Comparer les compétences d’un candidat aux compétences requises par une offre.
- Produire une liste d’offres ou de candidatures ordonnée par compatibilité.
- Signaler les champs manquants du profil et proposer des pistes d’amélioration.
- Fournir un assistant conversationnel lorsque le workflow n8n associé est configuré.

## Données utilisées

Selon la fonctionnalité demandée, Interlance utilise uniquement les données métier nécessaires :

- profil candidat : titre, bio, niveau et domaine d’études, localisation, compétences, langues et préférences ;
- texte du CV lorsque le fichier est disponible et que son contenu peut être extrait ;
- offre : titre, description, type, localisation, durée et compétences requises ;
- candidature : lien candidat/offre, message et statut, pour les recommandations recruteur ;
- conversation de l’assistant, uniquement si le service d’assistance externe est configuré.

Le contenu du CV et du profil peut être transmis au fournisseur IA configuré (`OPENROUTER_API_KEY`) ou au workflow n8n configuré. En absence de configuration, le backend utilise des heuristiques locales de mots-clés et de recouvrement de compétences.

## Résultats produits

Les résultats sont conservés dans `ai_results` et peuvent inclure :

- un score de compatibilité ;
- les compétences extraites et, lorsque disponibles, leurs niveaux ;
- un type de profil, une stack principale et une estimation de séniorité ;
- une recommandation, une conclusion et des détails explicatifs ;
- des offres ou candidatures classées avec leurs raisons et lacunes éventuelles.

Les types de traitement disponibles sont `CV_ANALYSIS`, `OFFER_RECOMMENDATION`, `CANDIDATE_RECOMMENDATION` et `PROFILE_OPTIMIZATION`.

## Ce qui est automatique

- Après un upload ou un remplissage de CV, une analyse peut être déclenchée en arrière-plan ; un échec IA ne bloque pas l’upload.
- La création explicite d’un job IA produit un résultat et une notification.
- Les recommandations calculent un score et peuvent mettre à jour le score de matching affiché pour une candidature.
- L’accès aux jobs IA est réservé aux utilisateurs Premium et aux administrateurs ; les recruteurs ne consultent les recommandations que pour leurs propres offres.

## Ce qui reste une aide à la décision

- Le candidat choisit de postuler ou non.
- Le recruteur consulte le CV, le profil et la candidature avant de changer un statut.
- L’administrateur garde le contrôle de la modération.
- Aucun job IA ne crée, n’accepte, ne refuse ou ne rejette automatiquement une candidature.

## Limites connues

- Un score est indicatif : il dépend de la qualité et de l’actualité des données saisies.
- L’extraction de texte peut échouer pour un CV scanné, protégé ou dans un format non pris en charge.
- Les heuristiques hors ligne ne comprennent pas la sémantique complète d’un parcours ; elles comparent surtout des compétences connues.
- Un fournisseur externe peut être indisponible, lent ou produire une réponse imprécise. Le résultat doit être vérifié.
- L’IA ne mesure pas la motivation, les qualités relationnelles, le contexte de travail ni l’égalité des chances.

## Éthique, confidentialité et transparence

- Ne collecter et transmettre que les données nécessaires au résultat demandé.
- Informer l’utilisateur qu’un résultat est une recommandation et qu’il peut contenir des erreurs.
- Ne jamais utiliser un score comme décision finale automatique d’embauche ou de refus.
- Éviter d’inférer ou d’exploiter des données sensibles qui ne sont pas nécessaires au matching.
- Restreindre les accès par rôle et par propriété des ressources ; les résultats IA d’un candidat ne sont pas accessibles à un autre candidat.
- Configurer les clés des fournisseurs et les URL de workflows uniquement par variables d’environnement, jamais dans le code ou la documentation.
