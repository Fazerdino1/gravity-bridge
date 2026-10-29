<!-- Source: rules/langchain-python.md -->
Apply this rule when working on files matching: `**/*.py`.
# LangChain Python Instructions
## Runnable Interface (LangChain-specific)
- All major LangChain components (chat models, output parsers, retrievers, graphs) implement the Runnable interface.
- Supports synchronous (`invoke`, `batch`, `stream`) and asynchronous (`ainvoke`, `abatch`, `astream`) execution.
- Batching (`batch`, `batch_as_completed`) is optimized for parallel API calls; set `max_concurrency` in `RunnableConfig` to control parallelism.
- Streaming APIs (`stream`, `astream`, `astream_events`) yield outputs as they are produced, critical for responsive LLM apps.
> Full reference inside this plugin: `references/langchain-python.md` (read on demand when working on matching files).

---

<!-- Source: rules/playwright-python.md -->
# Playwright Python Test Generation Instructions
## Test Writing Guidelines
### Code Quality Standards
- **Locators**: Prioritize user-facing, role-based locators (get_by_role, get_by_label, get_by_text) for resilience and accessibility.
- **Assertions**: Use auto-retrying web-first assertions via the expect API (e.g., expect(page).to_have_title(...)). Avoid expect(locator).to_be_visible() unless specifically testing for a change in an element's visibility, as more specific assertions are generally more reliable.
- **Timeouts**: Rely on Playwright's built-in auto-waiting mechanisms. Avoid hard-coded waits or increased default timeouts.
> Full reference inside this plugin: `references/playwright-python.md` (read on demand when working on matching files).
