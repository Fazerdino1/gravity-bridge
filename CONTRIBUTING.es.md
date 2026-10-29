# Contribuir a Gravity Bridge

**Idiomas:** [English](CONTRIBUTING.md) · [Français](CONTRIBUTING.fr.md) · **Español** · [Deutsch](CONTRIBUTING.de.md) · [🌐 Guía Web](https://fazerdino1.github.io/gravity-bridge/#contributing)

¡Gracias por ayudar! Este proyecto valora **la calidad sobre la cantidad**: cada recurso para Google Antigravity está curado, documentado y correctamente atribuido.

## Formas de contribuir

> **Nota:** Haga clic en los enlaces a continuación para abrir los **formularios interactivos de GitHub Issues** (en lugar de ver el archivo `.yml` sin procesar en el árbol del repositorio):

- **Proponer un recurso**: [Abrir una solicitud de nuevo recurso](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=new_resource.yml) o enviar un Pull Request.
- **Informar de un problema de conversión o recurso**: [Abrir un ticket de problema de conversión](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=conversion_problem.yml).
- **Informar de un error en las herramientas**: [Abrir un informe de error](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=bug_report.yml).
- **Mejorar las herramientas** (`scripts/`): las correcciones y pruebas son bienvenidas.

## Añadir o actualizar un recurso de Antigravity

### Opción A — Crear un recurso nativo de Antigravity directamente

1. Cree su skill en `skills/<nombre>/SKILL.md`, su regla en `rules/<nombre>.md`, o su persona de agente en `agents/<nombre>/SKILL.md` siguiendo la [referencia de formato de Antigravity](docs/antigravity-format.md).
2. Establezca `status: draft` (o `reviewed` una vez revisado).
3. Ejecute `npm run lint && npm test && npm run validate`.

### Opción B — Convertir un recurso externo con el convertidor

1. Ejecute una prueba en seco (`--dry-run`) sobre su carpeta de origen local y luego la conversión real:
   ```sh
   npm run convert -- --source <ruta-al-repo-origen> --out . --only <nombre> --dry-run
   npm run convert -- --source <ruta-al-repo-origen> --out . --only <nombre>
   ```
2. Lea el archivo generado y `conversion-report.md`, y adapte cualquier texto que no sea específico de Antigravity.
3. Asegúrese de que la fila de atribución esté en [NOTICE.md](NOTICE.md).
4. Ejecute `npm run lint && npm test && npm run validate`.

Consulte [docs/conversion-guide.md](docs/conversion-guide.md) para más detalles.

## Lista de verificación para Pull Requests

- URL de origen, ruta original y commit registrados (para elementos convertidos)
- Autor acreditado (cuando se conoce)
- Licencia explícita que permite la redistribución; línea de copyright copiada literalmente en `NOTICE.md`
- Probado en Google Antigravity (indicar cómo), o dejado como `status: draft`
- Sin secretos, sin exfiltración de datos, comandos sensibles justificados
- `npm run validate` pasa sin errores

## Solicitudes de eliminación

Si usted es el autor de un elemento de origen y desea que se elimine o modifique su atribución, [abra una solicitud de licencia o eliminación](https://github.com/Fazerdino1/gravity-bridge/issues/new?template=license_or_removal_request.yml) o escriba a [fazerdinotheck@outlook.fr](mailto:fazerdinotheck@outlook.fr).

## Código de Conducta

Al participar, usted acepta el [Código de Conducta](CODE_OF_CONDUCT.es.md) ([English](CODE_OF_CONDUCT.md) · [Français](CODE_OF_CONDUCT.fr.md) · [Deutsch](CODE_OF_CONDUCT.de.md)).
