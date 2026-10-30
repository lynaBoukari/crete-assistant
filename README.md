# Crête · Assistant ski de randonnée

Démonstrateur MeLya : un assistant de conseil produit qui qualifie le client,
filtre le catalogue par des règles métier, recommande des produits avec leurs
sources, et oriente vers un expert humain quand la demande le justifie.

Boutique, skis, prix, avis et créneaux fictifs.

## Structure

| Fichier | Rôle |
| --- | --- |
| `index.html` | Structure de la page : bandeau, boutique, chat, vue coulisses |
| `style.css` | Design, thème clair et sombre, responsive |
| `app.js` | Logique : catalogue, questions, règles, filtres, recommandations, renvoi expert |

## Lancer en local

Ouvrir `index.html` dans un navigateur, ou depuis VS Code avec l'extension
Live Server (clic droit > Open with Live Server).

## Où modifier quoi (app.js)

- `CATALOGUE` : les produits (nom, catégorie, prix, longueurs, poids, argument, avis).
- `STEPS` : les questions du parcours et leurs réponses.
- `SCENARIOS` : les réponses pré-sélectionnées des deux démos guidées.
- `decide()` : les règles métier et les filtres (niveau, longueur, budget).
- `expertFlow()` : le renvoi vers le guide et le résumé du profil.

## Évolution vers un vrai produit

1. Catalogue chargé depuis l'API Shopify au lieu de `CATALOGUE`.
2. Avis indexés dans une base vectorielle (Postgres + pgvector).
3. Réponses rédigées par un LLM (API FastAPI + LangChain), toujours après le filtre de règles.
4. Lien de réservation réel (Calendly ou équivalent).
5. Journal des conversations et des avis pour analyser les tests.
