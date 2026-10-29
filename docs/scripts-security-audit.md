# Bundled Scripts Security Audit

All scripts shipped inside `skills/*/scripts/` are copied as inert data by the converter and are **never executed automatically** during conversion or validation. Review a skill's bundled scripts before invoking them in Google Antigravity.

- **Total bundled script files audited**: 91
- **Hardcoded secrets detected**: 0

| Script Path | Parent Skill | Detected Capabilities | Dangerous Patterns |
|---|---|---|---|
| `skills/acquire-codebase-knowledge/scripts/scan.py` | `skills/acquire-codebase-knowledge` | child process / shell execution | none |
| `skills/adobe-illustrator-scripting/scripts/batch-export-png.jsx` | `skills/adobe-illustrator-scripting` | none | none |
| `skills/adobe-illustrator-scripting/scripts/create-color-grid.jsx` | `skills/adobe-illustrator-scripting` | none | none |
| `skills/adobe-illustrator-scripting/scripts/find-replace-text.jsx` | `skills/adobe-illustrator-scripting` | none | none |
| `skills/agent-skill-stack/scripts/inventory_skills.py` | `skills/agent-skill-stack` | outbound network call, child process / shell execution | none |
| `skills/agent-skill-stack/scripts/project_profile.py` | `skills/agent-skill-stack` | none | none |
| `skills/agent-skill-stack/scripts/render_stack_card.py` | `skills/agent-skill-stack` | none | none |
| `skills/agent-skill-stack/scripts/skill_index.py` | `skills/agent-skill-stack` | none | none |
| `skills/agent-skill-stack/scripts/stage_install.py` | `skills/agent-skill-stack` | none | none |
| `skills/appinsights-instrumentation/scripts/appinsights.ps1` | `skills/appinsights-instrumentation` | none | none |
| `skills/azure-architecture-autopilot/scripts/cli.py` | `skills/azure-architecture-autopilot` | child process / shell execution | none |
| `skills/azure-architecture-autopilot/scripts/generator.py` | `skills/azure-architecture-autopilot` | none | none |
| `skills/azure-architecture-autopilot/scripts/icons.py` | `skills/azure-architecture-autopilot` | none | none |
| `skills/bug-receipt/scripts/validate-receipt.mjs` | `skills/bug-receipt` | none | none |
| `skills/build-evidence-map/scripts/contract.mjs` | `skills/build-evidence-map` | none | none |
| `skills/build-evidence-map/scripts/validate.mjs` | `skills/build-evidence-map` | none | none |
| `skills/code-tour/scripts/generate_from_docs.py` | `skills/code-tour` | none | none |
| `skills/code-tour/scripts/validate_tour.py` | `skills/code-tour` | none | none |
| `skills/convert-excel-to-md/scripts/convert_excel_to_md.py` | `skills/convert-excel-to-md` | none | none |
| `skills/convert-excel-to-md/scripts/requirements.txt` | `skills/convert-excel-to-md` | none | none |
| `skills/convert-pdf-to-md/scripts/convert_pdf_to_md.py` | `skills/convert-pdf-to-md` | none | none |
| `skills/convert-pdf-to-md/scripts/requirements.txt` | `skills/convert-pdf-to-md` | none | none |
| `skills/convert-word-to-md/scripts/convert_word_to_md.py` | `skills/convert-word-to-md` | none | none |
| `skills/convert-word-to-md/scripts/requirements.txt` | `skills/convert-word-to-md` | none | none |
| `skills/copilot-pr-autopilot/scripts/01-request-review.ps1` | `skills/copilot-pr-autopilot` | none | none |
| `skills/copilot-pr-autopilot/scripts/02-check-review-status.ps1` | `skills/copilot-pr-autopilot` | outbound network call | none |
| `skills/copilot-pr-autopilot/scripts/03-list-open-threads.ps1` | `skills/copilot-pr-autopilot` | none | none |
| `skills/copilot-pr-autopilot/scripts/08-reply-and-resolve.ps1` | `skills/copilot-pr-autopilot` | none | none |
| `skills/copilot-pr-autopilot/scripts/09-review-round.ps1` | `skills/copilot-pr-autopilot` | none | none |
| `skills/copilot-pr-autopilot/scripts/10-cleanup-outdated.ps1` | `skills/copilot-pr-autopilot` | outbound network call | none |
| `skills/copilot-pr-autopilot/scripts/_lib.ps1` | `skills/copilot-pr-autopilot` | none | sudo |
| `skills/cypress-flake-fixer/scripts/scan-cypress.mjs` | `skills/cypress-flake-fixer` | dynamic code evaluation | none |
| `skills/daily-focus-board/scripts/serve-board.ps1` | `skills/daily-focus-board` | none | none |
| `skills/datanalysis-credit-risk/scripts/example.py` | `skills/datanalysis-credit-risk` | none | none |
| `skills/docs-sync-audit/scripts/docs_drift.py` | `skills/docs-sync-audit` | child process / shell execution | none |
| `skills/draw-io-diagram-generator/scripts/.gitignore` | `skills/draw-io-diagram-generator` | none | none |
| `skills/draw-io-diagram-generator/scripts/README.md` | `skills/draw-io-diagram-generator` | none | none |
| `skills/draw-io-diagram-generator/scripts/add-shape.py` | `skills/draw-io-diagram-generator` | none | none |
| `skills/draw-io-diagram-generator/scripts/validate-drawio.py` | `skills/draw-io-diagram-generator` | none | none |
| `skills/drawio/scripts/drawio-to-png.mjs` | `skills/drawio` | child process / shell execution | none |
| `skills/drawio/scripts/package.json` | `skills/drawio` | none | none |
| `skills/excalidraw-diagram-generator/scripts/.gitignore` | `skills/excalidraw-diagram-generator` | none | none |
| `skills/excalidraw-diagram-generator/scripts/README.md` | `skills/excalidraw-diagram-generator` | none | none |
| `skills/excalidraw-diagram-generator/scripts/add-arrow.py` | `skills/excalidraw-diagram-generator` | none | none |
| `skills/excalidraw-diagram-generator/scripts/add-icon-to-diagram.py` | `skills/excalidraw-diagram-generator` | none | none |
| `skills/excalidraw-diagram-generator/scripts/split-excalidraw-library.py` | `skills/excalidraw-diagram-generator` | none | none |
| `skills/foundry-agentic-loop/scripts/evals.mjs` | `skills/foundry-agentic-loop` | child process / shell execution, dynamic code evaluation | none |
| `skills/latchshot-page-capture/scripts/latchshot.mjs` | `skills/latchshot-page-capture` | outbound network call | none |
| `skills/markdown-to-word-mermaid/scripts/markdown_to_word.py` | `skills/markdown-to-word-mermaid` | child process / shell execution | none |
| `skills/markdown-to-word-mermaid/scripts/requirements.txt` | `skills/markdown-to-word-mermaid` | none | none |
| `skills/md-to-docx/scripts/md-to-docx.mjs` | `skills/md-to-docx` | none | none |
| `skills/md-to-docx/scripts/package.json` | `skills/md-to-docx` | none | none |
| `skills/microsoft-store-publisher/scripts/inspect-msix.ps1` | `skills/microsoft-store-publisher` | none | none |
| `skills/microsoft-store-publisher/scripts/invoke-wack.ps1` | `skills/microsoft-store-publisher` | none | none |
| `skills/microsoft-store-publisher/scripts/package.json` | `skills/microsoft-store-publisher` | none | none |
| `skills/microsoft-store-publisher/scripts/partner-center-control.mjs` | `skills/microsoft-store-publisher` | none | none |
| `skills/mini-context-graph/scripts/config.py` | `skills/mini-context-graph` | none | none |
| `skills/mini-context-graph/scripts/contextgraph.py` | `skills/mini-context-graph` | none | none |
| `skills/mini-context-graph/scripts/template_agent_workflow.py` | `skills/mini-context-graph` | none | none |
| `skills/mini-context-graph/scripts/tools/__init__.py` | `skills/mini-context-graph` | none | none |
| `skills/mini-context-graph/scripts/tools/documents_store.py` | `skills/mini-context-graph` | none | none |
| `skills/mini-context-graph/scripts/tools/graph_store.py` | `skills/mini-context-graph` | none | none |
| `skills/mini-context-graph/scripts/tools/index_store.py` | `skills/mini-context-graph` | none | none |
| `skills/mini-context-graph/scripts/tools/ontology_store.py` | `skills/mini-context-graph` | none | none |
| `skills/mini-context-graph/scripts/tools/retrieval_engine.py` | `skills/mini-context-graph` | none | none |
| `skills/mini-context-graph/scripts/tools/wiki_store.py` | `skills/mini-context-graph` | none | none |
| `skills/nano-banana-pro-openrouter/scripts/generate_image.py` | `skills/nano-banana-pro-openrouter` | none | none |
| `skills/optimize-simplicite-logs/scripts/SimpliciteLog2Json.ps1` | `skills/optimize-simplicite-logs` | none | none |
| `skills/optimize-simplicite-logs/scripts/simplicite-log2json.py` | `skills/optimize-simplicite-logs` | none | none |
| `skills/poka-yoke/scripts/detect_hazards.py` | `skills/poka-yoke` | child process / shell execution | none |
| `skills/pr-dashboard/scripts/lib/utils.mjs` | `skills/pr-dashboard` | none | none |
| `skills/pr-dashboard/scripts/pr-dashboard-cli.mjs` | `skills/pr-dashboard` | child process / shell execution, dynamic code evaluation | none |
| `skills/publish-to-pages/scripts/convert-pdf.py` | `skills/publish-to-pages` | child process / shell execution | none |
| `skills/publish-to-pages/scripts/convert-pptx.py` | `skills/publish-to-pages` | none | none |
| `skills/publish-to-pages/scripts/publish.sh` | `skills/publish-to-pages` | none | rm -rf |
| `skills/python-pypi-package-builder/scripts/scaffold.py` | `skills/python-pypi-package-builder` | outbound network call | none |
| `skills/sandbox-npm-install/scripts/install.sh` | `skills/sandbox-npm-install` | none | rm -rf, sudo |
| `skills/speak-summary/scripts/tts.sh` | `skills/speak-summary` | none | rm -rf |
| `skills/sql-server-table-reconciliation/scripts/reconcile.py` | `skills/sql-server-table-reconciliation` | none | none |
| `skills/terraform-azurerm-set-diff-analyzer/scripts/.gitignore` | `skills/terraform-azurerm-set-diff-analyzer` | none | none |
| `skills/terraform-azurerm-set-diff-analyzer/scripts/README.md` | `skills/terraform-azurerm-set-diff-analyzer` | none | none |
| `skills/terraform-azurerm-set-diff-analyzer/scripts/analyze_plan.py` | `skills/terraform-azurerm-set-diff-analyzer` | none | none |
| `skills/test-gap-audit/scripts/coverage_map.py` | `skills/test-gap-audit` | child process / shell execution | none |
| `skills/webmcpify/scripts/workbench.mjs` | `skills/webmcpify` | child process / shell execution | none |
| `skills/winmd-api-search/scripts/Invoke-WinMdQuery.ps1` | `skills/winmd-api-search` | none | none |
| `skills/winmd-api-search/scripts/Update-WinMdCache.ps1` | `skills/winmd-api-search` | none | none |
| `skills/winmd-api-search/scripts/cache-generator/CacheGenerator.csproj` | `skills/winmd-api-search` | none | none |
| `skills/winmd-api-search/scripts/cache-generator/Directory.Build.props` | `skills/winmd-api-search` | none | none |
| `skills/winmd-api-search/scripts/cache-generator/Directory.Build.targets` | `skills/winmd-api-search` | none | none |
| `skills/winmd-api-search/scripts/cache-generator/Directory.Packages.props` | `skills/winmd-api-search` | none | none |
| `skills/winmd-api-search/scripts/cache-generator/Program.cs` | `skills/winmd-api-search` | none | none |
