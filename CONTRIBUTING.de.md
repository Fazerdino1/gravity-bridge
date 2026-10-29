# Mitwirken bei Gravity Bridge

**Sprachen:** [English](CONTRIBUTING.md) · [Français](CONTRIBUTING.fr.md) · [Español](CONTRIBUTING.es.md) · **Deutsch** · [🌐 Web-Leitfaden](https://fazerdino1.github.io/gravity-bridge/#contributing)

Vielen Dank für Ihre Mithilfe! Dieses Projekt setzt auf **Qualität statt Quantität**: Jede Ressource für Google Antigravity wird kuratiert, dokumentiert und korrekt zugeordnet.

## Möglichkeiten zur Mitwirkung

> **Hinweis:** Klicken Sie auf die untenstehenden Links, um die **interaktiven GitHub-Issue-Formulare** zu öffnen (anstatt die rohen `.yml`-Vorlagendateien im Dateibaum anzuzeigen):

- **Ressource vorschlagen**: [Neues Ressourcen-Issue erstellen](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=new_resource.yml) oder einen Pull Request öffnen.
- **Konvertierungs- oder Ressourcenproblem melden**: [Konvertierungsproblem melden](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=conversion_problem.yml).
- **Fehler in den Skripten melden**: [Bug-Report erstellen](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=bug_report.yml).
- **Werkzeuge verbessern** (`scripts/`): Fehlerbehebungen und Tests sind willkommen.

## Hinzufügen oder Aktualisieren einer Antigravity-Ressource

### Option A — Eine native Antigravity-Ressource direkt erstellen

1. Erstellen Sie Ihren Skill unter `skills/<name>/SKILL.md`, Ihre Regel unter `rules/<name>.md` oder Ihre Agenten-Persona unter `agents/<name>/SKILL.md` gemäß der [Antigravity-Formatreferenz](docs/antigravity-format.md).
2. Setzen Sie `status: draft` (oder `reviewed` nach Prüfung).
3. Führen Sie `npm run lint && npm test && npm run validate` aus.

### Option B — Eine externe Ressource mit dem Konverter umwandeln

1. Führen Sie zuerst einen Testlauf (`--dry-run`) auf Ihrem lokalen Quellordner und anschließend die echte Konvertierung aus:
   ```sh
   npm run convert -- --source <pfad-zum-quell-repo> --out . --only <name> --dry-run
   npm run convert -- --source <pfad-zum-quell-repo> --out . --only <name>
   ```
2. Prüfen Sie die generierte Datei und `conversion-report.md`, und passen Sie nicht-Antigravity-spezifische Begriffe an.
3. Stellen Sie sicher, dass die Zuordnungszeile in [NOTICE.md](NOTICE.md) eingetragen ist.
4. Führen Sie `npm run lint && npm test && npm run validate` aus.

Weitere Details finden Sie in [docs/conversion-guide.md](docs/conversion-guide.md).

## Checkliste für Pull Requests

- Quell-URL, ursprünglicher Pfad und Commit sind dokumentiert (bei konvertierten Elementen)
- Autor ist genannt (falls bekannt)
- Lizenz ist explizit und erlaubt die Weiterverbreitung; Copyright-Zeile wörtlich in `NOTICE.md` übernommen
- In Google Antigravity getestet (angeben wie) oder als `status: draft` belassen
- Keine Geheimnisse, keine Datenexfiltration, kritische Befehle begründet
- `npm run validate` läuft fehlerfrei durch

## Anträge auf Entfernung

Wenn Sie Autor eines Quellelements sind und dessen Entfernung oder eine Korrektur der Namensnennung wünschen, [erstellen Sie eine Lizenz- oder Entfernungsanfrage](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=license_or_removal_request.yml) oder schreiben Sie an [fazerdinotheck@outlook.fr](mailto:fazerdinotheck@outlook.fr).

## Verhaltenskodex

Mit Ihrer Teilnahme stimmen Sie dem [Verhaltenskodex](CODE_OF_CONDUCT.de.md) ([English](CODE_OF_CONDUCT.md) · [Français](CODE_OF_CONDUCT.fr.md) · [Español](CODE_OF_CONDUCT.es.md)) zu.
