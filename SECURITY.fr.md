# Politique de sécurité

**Langues :** [English](SECURITY.md) · **Français** · [Español](SECURITY.es.md) · [Deutsch](SECURITY.de.md)

## Pourquoi est-ce important ?

Les skills, règles et personas sont des instructions destinées à un agent IA. **Un skill peut amener l'agent à exécuter des commandes, modifier des fichiers ou effectuer des requêtes réseau sur la machine de l'utilisateur.** Une ressource malveillante ou négligente représente donc un risque réel. C'est pourquoi chaque ressource est vérifiée par `npm run validate`, les 92 scripts embarqués sont audités dans [docs/scripts-security-audit.md](docs/scripts-security-audit.md), et toute ressource passe par une relecture humaine avant d'obtenir le statut `reviewed`.

## Signaler une vulnérabilité

Merci de **ne pas ouvrir d'issue publique**. Utilisez le signalement privé de vulnérabilité GitHub (onglet *Security* → *Report a vulnerability* sur ce dépôt) ou écrivez à [fazerdinotheck@outlook.fr](mailto:fazerdinotheck@outlook.fr).

Indiquez : le ou les fichiers concernés, ce que la ressource peut faire exécuter à un agent, et les étapes de reproduction. Nous accusons réception sous 7 jours.

## Périmètre couvert

- Ressources contenant des commandes dangereuses, de l'exfiltration de données, des instructions cachées ou de l'injection de prompt
- Secrets exposés par erreur
- Vulnérabilités dans les outils (`scripts/`)
