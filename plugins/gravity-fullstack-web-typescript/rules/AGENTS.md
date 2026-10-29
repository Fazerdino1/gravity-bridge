<!-- Source: rules/nextjs.md -->
Apply this rule when working on files matching: `**/*.tsx`, `**/*.ts`, `**/*.jsx`, `**/*.js`, `**/*.css`.
# Next.js Best Practices for LLMs (2026)
## 1. Project Structure & Organization
- **Use the `app/` directory** (App Router) for all new projects. Prefer it over the legacy `pages/` directory.
- **Top-level folders:**
- `app/` — Routing, layouts, pages, and route handlers
- `public/` — Static assets (images, fonts, etc.)
- `lib/` — Shared utilities, API clients, and logic
- `components/` — Reusable UI components
- `contexts/` — React context providers
- `styles/` — Global and modular stylesheets
- `hooks/` — Custom React hooks
- `types/` — TypeScript type definitions
> Full reference inside this plugin: `references/nextjs.md` (read on demand when working on matching files).

---

<!-- Source: rules/nextjs-tailwind.md -->
Apply this rule when working on files matching: `**/*.tsx`, `**/*.ts`, `**/*.jsx`, `**/*.js`, `**/*.css`.
# Next.js + Tailwind Development Instructions
## Project Context
- Latest Next.js (App Router)
- TypeScript for type safety
- Tailwind CSS for styling
## Development Standards
### Architecture
- App Router with server and client components
- Group routes by feature/domain
- Implement proper error boundaries
- Use React Server Components by default
- Leverage static optimization where possible
### TypeScript
- Strict mode enabled
- Clear type definitions
- Proper error handling with type guards
- Zod for runtime type validation
### Styling
- Tailwind CSS with consistent color palette
> Full reference inside this plugin: `references/nextjs-tailwind.md` (read on demand when working on matching files).

---

<!-- Source: rules/nodejs-javascript-vitest.md -->
Apply this rule when working on files matching: `**/*.js`, `**/*.mjs`, `**/*.cjs`.
# Code Generation Guidelines
## Coding standards
- Use JavaScript with ES2022 features and Node.js (20+) ESM modules
- Use Node.js built-in modules and avoid external dependencies where possible
- Ask the user if you require any additional dependencies before adding them
- Always use async/await for asynchronous code, and use 'node:util' promisify function to avoid callbacks
- Keep the code simple and maintainable
- Use descriptive variable and function names
- Do not add comments unless absolutely necessary, the code should be self-explanatory
- Never use `null`, always use `undefined` for optional values
> Full reference inside this plugin: `references/nodejs-javascript-vitest.md` (read on demand when working on matching files).

---

<!-- Source: rules/playwright-typescript.md -->
## Test Writing Guidelines
### Code Quality Standards
- **Locators**: Prioritize user-facing, role-based locators (`getByRole`, `getByLabel`, `getByText`, etc.) for resilience and accessibility. Use `test.step()` to group interactions and improve test readability and reporting.
- **Assertions**: Use auto-retrying web-first assertions. These assertions start with the `await` keyword (e.g., `await expect(locator).toHaveText()`). Avoid `expect(locator).toBeVisible()` unless specifically testing for visibility changes.
- **Timeouts**: Rely on Playwright's built-in auto-waiting mechanisms. Avoid hard-coded waits or increased default timeouts.
> Full reference inside this plugin: `references/playwright-typescript.md` (read on demand when working on matching files).

---

<!-- Source: rules/a11y.md -->
# Accessibility Standards
- **CRITICAL** — Users cannot access content at all. Must be fixed before merge.
- **IMPORTANT** — Significant barrier for assistive technology users. Fix in same sprint.
- **SUGGESTION** — Improves usability for assistive technology. Plan for a future iteration.
## WCAG 2.2 Quick Reference (AA Level)
### Perceivable
### Operable
### Understandable
### Robust
## Legal Enforcement Context (2026)
- **European Accessibility Act (EAA)**: Enforced since June 2025 across all 27 EU member states. Applies to digital products and services. Fines up to EUR 3 million. References EN 301 549 (maps to WCAG 2.1 AA).
> Full reference inside this plugin: `references/a11y.md` (read on demand when working on matching files).
