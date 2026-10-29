<!-- Source: rules/nextjs.md -->
Apply this rule when working on files matching: `**/*.tsx`, `**/*.ts`, `**/*.jsx`, `**/*.js`, `**/*.css`.

# Next.js Best Practices for LLMs (2026)

_Last updated: January 2026 (aligned to Next.js 16.1.1)_

This document summarizes the latest, authoritative best practices for building, structuring, and maintaining Next.js applications. It is intended for use by LLMs and developers to ensure code quality, maintainability, and scalability.

---

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
- **Colocation:** Place files (components, styles, tests) near where they are used, but avoid deeply nested structures.
- **Route Groups:** Use parentheses (e.g., `(admin)`) to group routes without affecting the URL path.
- **Private Folders:** Prefix with `_` (e.g., `_internal`) to opt out of routing and signal implementation details.
- **Feature Folders:** For large apps, group by feature (e.g., `app/dashboard/`, `app/auth/`).
- **Use `src/`** (optional): Place all source code in `src/` to separate from config files.

## 2. Next.js 16+ App Router Best Practices

### 2.1. Server and Client Component Integration (App Router)

**Never use `next/dynamic` with `{ ssr: false }` inside a Server Component.** This is not supported and will cause a build/runtime error.

**Correct Approach:**

- If you need to use a Client Component (e.g., a component that uses hooks, browser APIs, or client-only libraries) inside a Server Component, you must:
  1. Move all client-only logic/UI into a dedicated Client Component (with `'use client'` at the top).
  2. Import and use that Client Component directly in the Server Component (no need for `next/dynamic`).
  3. If you need to compose multiple client-only elements (e.g., a navbar with a profile dropdown), create a single Client Component that contains all of them.

**Example:**

```tsx
// Server Component
import DashboardNavbar from "@/components/DashboardNavbar";

export default async function DashboardPage() {
  // ...server logic...
  return (
    <>
      <DashboardNavbar /> {/* This is a Client Component */}
      {/* ...rest of server-rendered page... */}
    </>
  );
}
```

**Why:**

- Server Components cannot use client-only features or dynamic imports with SSR disabled.
- Client Components can be rendered inside Server Components, but not the other way around.

**Summary:**
Always move client-only UI into a Client Component and import it directly in your Server Component. Never use `next/dynamic` with `{ ssr: false }` in a Server Component.

### 2.2. Next.js 16+ async request APIs (App Router)

- **Assume request-bound data is async in Server Components and Route Handlers.** In Next.js 16, APIs like `cookies()`, `headers()`, and `draftMode()` are async in the App Router.
- **Be careful with route props:** `params` / `searchParams` may be Promises in Server Components. Prefer `await`ing them instead of treating them as plain objects.
- **Avoid dynamic rendering by accident:** Accessing request data (cookies/headers/searchParams) opts the route into dynamic behavior. Read them intentionally and isolate dynamic parts behind `Suspense` boundaries when appropriate.

---

## 3. Component Best Practices

- **Component Types:**
  - **Server Components** (default): For data fetching, heavy logic, and non-interactive UI.
  - **Client Components:** Add `'use client'` at the top. Use for interactivity, state, or browser APIs.
- **When to Create a Component:**
  - If a UI pattern is reused more than once.
  - If a section of a page is complex or self-contained.
  - If it improves readability or testability.
- **Naming Conventions:**
  - Use `PascalCase` for component files and exports (e.g., `UserCard.tsx`).
  - Use `camelCase` for hooks (e.g., `useUser.ts`).
  - Use `snake_case` or `kebab-case` for static assets (e.g., `logo_dark.svg`).
  - Name context providers as `XyzProvider` (e.g., `ThemeProvider`).
- **File Naming:**
  - Match the component name to the file name.
  - For single-export files, default export the component.
  - For multiple related components, use an `index.ts` barrel file.
- **Component Location:**
  - Place shared components in `components/`.
  - Place route-specific components inside the relevant route folder.
- **Props:**
  - Use TypeScript interfaces for props.
  - Prefer explicit prop types and default values.
- **Testing:**
  - Co-locate tests with components (e.g., `UserCard.test.tsx`).

## 4. Naming Conventions (General)

- **Folders:** `kebab-case` (e.g., `user-profile/`)
- **Files:** `PascalCase` for components, `camelCase` for utilities/hooks, `kebab-case` for static assets
- **Variables/Functions:** `camelCase`
- **Types/Interfaces:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE`

## 5. API Routes (Route Handlers)

- **Prefer API Routes over Edge Functions** unless you need ultra-low latency or geographic distribution.
- **Location:** Place API routes in `app/api/` (e.g., `app/api/users/route.ts`).
- **HTTP Methods:** Export async functions named after HTTP verbs (`GET`, `POST`, etc.).
- **Request/Response:** Use the Web `Request` and `Response` APIs. Use `NextRequest`/`NextResponse` for advanced features.
- **Dynamic Segments:** Use `[param]` for dynamic API routes (e.g., `app/api/users/[id]/route.ts`).
- **Validation:** Always validate and sanitize input. Use libraries like `zod` or `yup`.
- **Error Handling:** Return appropriate HTTP status codes and error messages.
- **Authentication:** Protect sensitive routes using middleware or server-side session checks.

### Route Handler usage note (performance)

- **Do not call your own Route Handlers from Server Components** (e.g., `fetch('/api/...')`) just to reuse logic. Prefer extracting shared logic into modules (e.g., `lib/`) and calling it directly to avoid extra server hops.

## 6. General Best Practices

- **TypeScript:** Use TypeScript for all code. Enable `strict` mode in `tsconfig.json`.
- **ESLint & Prettier:** Enforce code style and linting. Use the official Next.js ESLint config. In Next.js 16, prefer running ESLint via the ESLint CLI (not `next lint`).
- **Environment Variables:** Store secrets in `.env.local`. Never commit secrets to version control.
  - In Next.js 16, `serverRuntimeConfig` / `publicRuntimeConfig` are removed. Use environment variables instead.
  - `NEXT_PUBLIC_` variables are **inlined at build time** (changing them after build won’t affect a deployed build).
  - If you truly need runtime evaluation of env in a dynamic context, follow Next.js guidance (e.g., call `connection()` before reading `process.env`).
- **Testing:** Use Jest, React Testing Library, or Playwright. Write tests for all critical logic and components.
- **Accessibility:** Use semantic HTML and ARIA attributes. Test with screen readers.
- **Performance:**
  - Use built-in Image and Font optimization.
  - Prefer **Cache Components** (`cacheComponents` + `use cache`) over legacy caching patterns.
  - Use Suspense and loading states for async data.
  - Avoid large client bundles; keep most logic in Server Components.
- **Security:**
  - Sanitize all user input.
  - Use HTTPS in production.
  - Set secure HTTP headers.
  - Prefer server-side authorization for Server Actions and Route Handlers; never trust client input.
- **Documentation:**
  - Write clear README and code comments.
  - Document public APIs and components.

## 7. Caching & Revalidation (Next.js 16 Cache Components)

- **Prefer Cache Components for memoization/caching** in the App Router.
  - Enable in `next.config.*` via `cacheComponents: true`.
  - Use the **`use cache` directive** to opt a component/function into caching.
- **Use cache tagging and lifetimes intentionally:**
  - Use `cacheTag(...)` to associate cached results with tags.
  - Use `cacheLife(...)` to control cache lifetime (presets or configured profiles).
- **Revalidation guidance:**
  - Prefer `revalidateTag(tag, 'max')` (stale-while-revalidate) for most cases.
  - The single-argument form `revalidateTag(tag)` is legacy/deprecated.
  - Use `updateTag(...)` inside **Server Actions** when you need “read-your-writes” / immediate consistency.
- **Avoid `unstable_cache`** for new code; treat it as legacy and migrate toward Cache Components.

## 8. Tooling updates (Next.js 16)

- **Turbopack is the default dev bundler.** Configure via the top-level `turbopack` field in `next.config.*` (do not use the removed `experimental.turbo`).
- **Typed routes are stable** via `typedRoutes` (TypeScript required).

## 9. Avoid Unnecessary Example Files

Do not create example/demo files (like ModalExample.tsx) in the main codebase unless the user specifically requests a live example, Storybook story, or explicit documentation component. Keep the repository clean and production-focused by default.

## 10. Always Use the Latest Documentation and Guides

- For every Next.js related request, begin by searching for the most up-to-date Next.js documentation, guides, and examples.
- Use the following tools to fetch and search documentation if they are available:
  - `resolve_library_id` to resolve the package/library name in the docs.
  - `get_library_docs` for up-to-date documentation.

---

<!-- Source: rules/nextjs-tailwind.md -->
Apply this rule when working on files matching: `**/*.tsx`, `**/*.ts`, `**/*.jsx`, `**/*.js`, `**/*.css`.

# Next.js + Tailwind Development Instructions

Instructions for high-quality Next.js applications with Tailwind CSS styling and TypeScript.

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
- Responsive design patterns
- Dark mode support
- Follow container queries best practices
- Maintain semantic HTML structure

### State Management
- React Server Components for server state
- React hooks for client state
- Proper loading and error states
- Optimistic updates where appropriate

### Data Fetching
- Server Components for direct database queries
- React Suspense for loading states
- Proper error handling and retry logic
- Cache invalidation strategies

### Security
- Input validation and sanitization
- Proper authentication checks
- CSRF protection
- Rate limiting implementation
- Secure API route handling

### Performance
- Image optimization with next/image
- Font optimization with next/font
- Route prefetching
- Proper code splitting
- Bundle size optimization

## Implementation Process
1. Plan component hierarchy
2. Define types and interfaces
3. Implement server-side logic
4. Build client components
5. Add proper error handling
6. Implement responsive styling
7. Add loading states
8. Write tests

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
- Prefer functions over classes

## Testing
- Use Vitest for testing
- Write tests for all new features and bug fixes
- Ensure tests cover edge cases and error handling
- NEVER change the original code to make it easier to test, instead, write tests that cover the original code as it is

## Documentation
- When adding new features or making significant changes, update the README.md file where necessary

## User interactions
- Ask questions if you are unsure about the implementation details, design choices, or need clarification on the requirements
- Always answer in the same language as the question, but use english for the generated content like code, comments or docs

---

<!-- Source: rules/playwright-typescript.md -->
## Test Writing Guidelines

### Code Quality Standards
- **Locators**: Prioritize user-facing, role-based locators (`getByRole`, `getByLabel`, `getByText`, etc.) for resilience and accessibility. Use `test.step()` to group interactions and improve test readability and reporting.
- **Assertions**: Use auto-retrying web-first assertions. These assertions start with the `await` keyword (e.g., `await expect(locator).toHaveText()`). Avoid `expect(locator).toBeVisible()` unless specifically testing for visibility changes.
- **Timeouts**: Rely on Playwright's built-in auto-waiting mechanisms. Avoid hard-coded waits or increased default timeouts.
- **Clarity**: Use descriptive test and step titles that clearly state the intent. Add comments only to explain complex logic or non-obvious interactions.


### Test Structure
- **Imports**: Start with `import { test, expect } from '@playwright/test';`.
- **Organization**: Group related tests for a feature under a `test.describe()` block.
- **Hooks**: Use `beforeEach` for setup actions common to all tests in a `describe` block (e.g., navigating to a page).
- **Titles**: Follow a clear naming convention, such as `Feature - Specific action or scenario`.


### File Organization
- **Location**: Store all test files in the `tests/` directory.
- **Naming**: Use the convention `<feature-or-page>.spec.ts` (e.g., `login.spec.ts`, `search.spec.ts`).
- **Scope**: Aim for one test file per major application feature or page.

### Assertion Best Practices
- **UI Structure**: Use `toMatchAriaSnapshot` to verify the accessibility tree structure of a component. This provides a comprehensive and accessible snapshot.
- **Element Counts**: Use `toHaveCount` to assert the number of elements found by a locator.
- **Text Content**: Use `toHaveText` for exact text matches and `toContainText` for partial matches.
- **Navigation**: Use `toHaveURL` to verify the page URL after an action.


## Example Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Movie Search Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application before each test
    await page.goto('https://debs-obrien.github.io/playwright-movies-app');
  });

  test('Search for a movie by title', async ({ page }) => {
    await test.step('Activate and perform search', async () => {
      await page.getByRole('search').click();
      const searchInput = page.getByRole('textbox', { name: 'Search Input' });
      await searchInput.fill('Garfield');
      await searchInput.press('Enter');
    });

    await test.step('Verify search results', async () => {
      // Verify the accessibility tree of the search results
      await expect(page.getByRole('main')).toMatchAriaSnapshot(`
        - main:
          - heading "Garfield" [level=1]
          - heading "search results" [level=2]
          - list "movies":
            - listitem "movie":
              - link "poster of The Garfield Movie The Garfield Movie rating":
                - /url: /playwright-movies-app/movie?id=tt5779228&page=1
                - img "poster of The Garfield Movie"
                - heading "The Garfield Movie" [level=2]
      `);
    });
  });
});
```

## Test Execution Strategy

1. **Initial Run**: Execute tests with `npx playwright test --project=chromium`
2. **Debug Failures**: Analyze test failures and identify root causes
3. **Iterate**: Refine locators, assertions, or test logic as needed
4. **Validate**: Ensure tests pass consistently and cover the intended functionality
5. **Report**: Provide feedback on test results and any issues discovered

## Quality Checklist

Before finalizing tests, ensure:
- [ ] All locators are accessible and specific and avoid strict mode violations
- [ ] Tests are grouped logically and follow a clear structure
- [ ] Assertions are meaningful and reflect user expectations
- [ ] Tests follow consistent naming conventions
- [ ] Code is properly formatted and commented

---

<!-- Source: rules/a11y.md -->
# Accessibility Standards

Comprehensive accessibility rules for web application development. Every anti-pattern includes a severity classification, detection method, WCAG 2.2 reference, and corrective code examples.

**Severity levels:**

- **CRITICAL** — Users cannot access content at all. Must be fixed before merge.
- **IMPORTANT** — Significant barrier for assistive technology users. Fix in same sprint.
- **SUGGESTION** — Improves usability for assistive technology. Plan for a future iteration.

---

## WCAG 2.2 Quick Reference (AA Level)

### Perceivable

| Criterion | Level | Summary |
|-----------|-------|---------|
| 1.1.1 Non-text Content | A | All non-text content has a text alternative. Decorative images use `alt=""`. |
| 1.2.1 Audio/Video-only | A | Provide transcript (audio) or text alternative (video). |
| 1.2.2 Captions (Prerecorded) | A | All prerecorded video has synchronized captions. |
| 1.3.1 Info and Relationships | A | Structure (headings, lists, tables, labels, landmarks) programmatically conveyed. |
| 1.3.2 Meaningful Sequence | A | When the sequence that content is presented affects its meaning, the visual and programmatic ordering of content should align. |
| 1.3.3 Sensory Characteristics | A | Instructions don't rely solely on shape, size, position, or sound. |
| 1.3.4 Orientation | AA | Content is not restricted to single orientation unless essential. |
| 1.3.5 Identify Input Purpose | AA | Input fields have `autocomplete` attributes when collecting information about the user. |
| 1.4.1 Use of Color | A | Color is not the only means of conveying info. |
| 1.4.3 Contrast (Minimum) | AA | Text: 4.5:1 normal, 3:1 large (18pt / 14pt bold). |
| 1.4.4 Resize Text | AA | Text resizable to 200% without loss of content or functionality. |
| 1.4.10 Reflow | AA | Sections of content can fit within 320px CSS width viewports without needing to scroll in two dimensions to read. |
| 1.4.11 Non-text Contrast | AA | UI components and graphics: 3:1 against adjacent colors. |
| 1.4.12 Text Spacing | AA | No loss of content or functionality with user-overridden line-height (1.5x), or specified paragraph spacing, letter spacing, and word spacing adjustments. |
| 1.4.13 Content on Hover/Focus | AA | Popup content that appears on hover or focus is: dismissible, hoverable, persistent. |

### Operable

| Criterion | Level | Summary |
|-----------|-------|---------|
| 2.1.1 Keyboard | A | All functionality operable via keyboard. |
| 2.1.2 No Keyboard Trap | A | User can navigate away from any component using keyboard. |
| 2.2.1 Timing Adjustable | A | Time limits can be extended or disabled. |
| 2.2.2 Pause, Stop, Hide | A | Auto-updating content can be paused. |
| 2.3.1 Three Flashes | A | No content flashes more than 3 times per second. |
| 2.4.1 Bypass Blocks | A | Skip link to bypass repeated navigation. |
| 2.4.2 Page Titled | A | Pages have descriptive `<title>`. |
| 2.4.3 Focus Order | A | Focus order preserves meaning and operability. |
| 2.4.4 Link Purpose | A | Link purpose determinable from text or context. |
| 2.4.6 Headings and Labels | AA | Headings and labels describe topic or purpose. |
| 2.4.7 Focus Visible | AA | Keyboard focus indicator is visible. |
| 2.4.11 Focus Not Obscured | AA | Focused element not entirely hidden by other overlaying elements (such as sticky headers or footers). *(New in 2.2)* |
| 2.5.1 Pointer Gestures | A | Multi-point gestures have single-pointer alternative. |
| 2.5.2 Pointer Cancellation | A | Activation on up-event, unless activation can be aborted, reversed, or down-event activation is essential. |
| 2.5.3 Label in Name | A | Accessible name contains the label text as it is visually presented. |
| 2.5.4 Motion Actuation | A | Device motion has UI alternative and can be disabled. |
| 2.5.7 Dragging Movements | AA | Drag-and-drop has click/tap alternative. *(New in 2.2)* |
| 2.5.8 Target Size (Minimum) | AA | Interactive controls have a target size, or spacing of at least 24x24 CSS px. *(New in 2.2)* |

### Understandable

| Criterion | Level | Summary |
|-----------|-------|---------|
| 3.1.1 Language of Page | A | `<html lang="...">` set correctly. |
| 3.1.2 Language of Parts | AA | Content in different language marked with `lang` attribute. |
| 3.2.1 On Focus | A | Focus doesn't trigger unexpected context change. |
| 3.2.2 On Input | A | Changing input doesn't auto-trigger unexpected context change. |
| 3.2.6 Consistent Help | A | Help mechanisms in same relative order across pages. *(New in 2.2)* |
| 3.3.1 Error Identification | A | Errors described to user in text. |
| 3.3.2 Labels or Instructions | A | Labels or instructions provided for user input. |
| 3.3.3 Error Suggestion | AA | Suggest corrections for detected errors. |
| 3.3.4 Error Prevention | AA | Submissions are reversible, checked, or confirmed. |
| 3.3.7 Redundant Entry | A | Don't re-ask for info already provided in same process. *(New in 2.2)* |
| 3.3.8 Accessible Authentication (Minimum) | AA | No cognitive function test (puzzle CAPTCHA). Allow paste and autofill. *(New in 2.2)* |

### Robust

| Criterion | Level | Summary |
|-----------|-------|---------|
| 4.1.2 Name, Role, Value | A | All UI components have accessible name, role, and state. |
| 4.1.3 Status Messages | AA | Status messages announced by screen readers without receiving focus. |

> **Note:** 4.1.1 Parsing is obsolete in WCAG 2.2 (always satisfied). Issues it covered are now addressed by 1.3.1 and 4.1.2.

> **New AAA criteria in 2.2** (not required for AA, but recommended): 2.4.12 Focus Not Obscured (Enhanced), 2.4.13 Focus Appearance, 3.3.9 Accessible Authentication (Enhanced).

> **Looking ahead:** WCAG 3.0 (W3C Accessibility Guidelines) is in Working Draft (March 2026). It replaces pass/fail with Bronze/Silver/Gold conformance and "Outcomes" instead of "Success Criteria." It is NOT yet a standard — continue targeting WCAG 2.2 AA.

## Legal Enforcement Context (2026)

- **European Accessibility Act (EAA)**: Enforced since June 2025 across all 27 EU member states. Applies to digital products and services. Fines up to EUR 3 million. References EN 301 549 (maps to WCAG 2.1 AA).
- **ADA Title II (US)**: Digital accessibility rule effective April 2026 for state/local governments serving 50,000+ people (April 2027 for smaller entities). Requires WCAG 2.1 AA.
- **Section 508 (US Federal)**: References WCAG 2.0 AA (refresh to 2.1/2.2 expected).

**Target**: WCAG 2.2 AA covers all current legal requirements (superset of 2.1 AA and 2.0 AA).

---

## Five Rules of ARIA

1. **Prefer native HTML** — Use `<button>` not `<div role="button">`. Native elements have built-in keyboard, focus, and semantics.
2. **Don't change native semantics where prohibited** — Don't add `role="heading"` to a `<button>`. Use the correct element.
3. **All ARIA controls must be keyboard operable** — If `role="button"`, handle Enter and Space key events.
4. **Don't use `aria-hidden="true"` on focusable elements** — Hidden from assistive tech but still focusable creates a "ghost" element.
5. **All interactive elements need an accessible name** — Via label, `aria-label`, `aria-labelledby`, or visible text content.

---

## Semantic HTML Anti-Patterns (S1-S8)

### S1: Missing `lang` Attribute on `<html>`

- **Severity**: CRITICAL
- **Detection**: `<html` without `lang=`
- **WCAG**: 3.1.1 (A)

```html
<!-- BAD -->
<html>

<!-- GOOD -->
<html lang="en">
```

Next.js: Set in `app/layout.tsx`. Angular: Set in `src/index.html`. Vue/Nuxt: Set in `app.vue` or `nuxt.config`.

### S2: Multiple `<h1>` Per Page

- **Severity**: SUGGESTION
- **Detection**: Multiple `<h1>` elements that make the page heading structure unclear
- **WCAG**: Best practice (supports 1.3.1)

Prefer one `<h1>` per page representing the main topic. Use `<h2>` for sections. Multiple `<h1>` elements are not a strict WCAG violation but can confuse screen reader navigation.

### S3: Heading Level Gaps

- **Severity**: IMPORTANT
- **Detection**: `<h1>` followed by `<h3>` (skipping `<h2>`)
- **WCAG**: 1.3.1 (A)

Maintain logical nesting: `h1 > h2 > h3 > h4`. Style headings with CSS, not by choosing a different heading level.

### S4: Div Soup — No Landmark Elements

- **Severity**: IMPORTANT
- **Detection**: Pages using only `<div>` without `<nav>`, `<main>`, `<header>`, `<footer>`
- **WCAG**: Best practice (supports 1.3.1, 2.4.1)

```html
<!-- GOOD -->
<header>...</header>
<nav aria-label="Main">...</nav>
<main>...</main>
<footer>...</footer>
```

### S5: Layout Tables Without `role="presentation"`

- **Severity**: IMPORTANT
- **Detection**: `<table>` without `<th>`, `<caption>`, or `role="presentation"`
- **WCAG**: 1.3.1 (A)

Use CSS Grid/Flexbox for layout. If table must be used for layout, add `role="presentation"`.

### S6: Data Tables Without Headers

- **Severity**: CRITICAL
- **Detection**: `<table>` with data rows but no `<th>` elements
- **WCAG**: 1.3.1 (A)

```html
<!-- GOOD -->
<table>
  <caption>User list</caption>
  <thead>
    <tr><th scope="col">Name</th><th scope="col">Email</th></tr>
  </thead>
  <tbody>
    <tr><td>Alice</td><td>alice@example.com</td></tr>
  </tbody>
</table>
```

### S7: Non-Descriptive Link Text

- **Severity**: IMPORTANT
- **Detection**: `>click here<|>read more<|>learn more<|>here<|>more<|>link<`
- **WCAG**: 2.4.4 (A)

```html
<!-- BAD -->
<a href="/pricing">Click here</a>

<!-- GOOD -->
<a href="/pricing">View pricing plans</a>
```

### S8: Interactive Elements Without Semantic HTML

- **Severity**: CRITICAL
- **Detection**: `<div.*(?:onClick|@click|\(click\))`
- **WCAG**: 4.1.2 (A)

```tsx
// BAD — not focusable, no role, no keyboard support
<div onClick={handleClick}>Submit</div>

// GOOD
<button onClick={handleClick}>Submit</button>
```

---

## ARIA Anti-Patterns (A1-A8)

### A1: Redundant ARIA on Native Elements

- **Severity**: SUGGESTION
- **Detection**: `<button.*role="button"|<nav.*role="navigation"|<a.*role="link"`
- **WCAG**: ARIA Rule 2

Remove redundant ARIA. `<button>` already has `role="button"`.

### A2: `aria-hidden="true"` on Focusable Element

- **Severity**: CRITICAL
- **Detection**: `aria-hidden="true"` on focusable elements (button, input, a, [tabindex])
- **WCAG**: ARIA Rule 4

Do not leave focusable elements inside `aria-hidden="true"` content or use `aria-hidden="true"` on focusable elements. Rather, for native controls that support it, such as `<button>` or `<input>`, use `disabled` if disabling the control is the intended behavior. For `<a>` elements or arbitrary elements made focusable with `[tabindex]`, remove focusability instead (for example, remove `href` or `tabindex`). If the content should be completely non-interactive and hidden from assistive technology, use `inert`, `hidden`, or remove it from the DOM.

### A3: Missing Required ARIA Properties

- **Severity**: CRITICAL
- **Detection**: `role="tab"` without `aria-selected`, `role="checkbox"` without `aria-checked`
- **WCAG**: 4.1.2 (A)

Required per role: `tab` needs `aria-selected`; `combobox` needs `aria-expanded`/`aria-controls`; `slider` needs `aria-valuemin`/`aria-valuemax`/`aria-valuenow`; `checkbox` needs `aria-checked`.

### A4: Invalid ARIA Role Values

- **Severity**: CRITICAL
- **Detection**: `role="[^"]*"` with non-existent values
- **WCAG**: 4.1.2 (A)

Invalid roles are ignored by assistive technology. Common mistakes: `role="input"`, `role="text"`, misspellings.

### A5: ARIA Where Native HTML Works

- **Severity**: IMPORTANT
- **Detection**: `role="button"` on `<div>`, `role="checkbox"` on `<div>`
- **WCAG**: ARIA Rule 1

```html
<!-- BAD — requires manual keyboard, focus, and state management -->
<div role="checkbox" aria-checked="false" tabindex="0">Accept terms</div>

<!-- GOOD — all behavior built-in -->
<label><input type="checkbox" /> Accept terms</label>
```

### A6: Missing `aria-label` on Icon-Only Buttons

- **Severity**: CRITICAL
- **Detection**: `<button` with SVG/icon child and no text or `aria-label`
- **WCAG**: 4.1.2 (A)

```html
<!-- GOOD -->
<button aria-label="Close dialog"><svg aria-hidden="true">...</svg></button>
```

### A7: `role="presentation"` on Focusable Elements

- **Severity**: IMPORTANT
- **Detection**: `role="presentation"` on interactive elements
- **WCAG**: ARIA Rule 4

Browsers will ignore the presentation role on focusable elements.

### A8: Missing Live Region for Dynamic Content

- **Severity**: IMPORTANT
- **Detection**: Toast/notification components without `role="alert"`, `role="status"`, or `aria-live`
- **WCAG**: 4.1.3 (AA)

```html
<!-- GOOD — content announced when content is injected into a preexisting live region element in the DOM -->
<div role="status" aria-live="polite">Item saved successfully</div>
<!-- Use role="alert" (assertive) for errors -->
<div role="alert">Failed to save. Please try again.</div>
```

---

## Keyboard and Focus Anti-Patterns (K1-K7)

### K1: `onClick` Without `onKeyDown` on Non-Native Elements

- **Severity**: CRITICAL
- **Detection**: `(?:onClick|@click|\(click\))` on `<div>` or `<span>` without keyboard handler
- **WCAG**: 2.1.1 (A)

Use `<button>` instead. If a div is required: add `role="button"`, `tabIndex={0}`, handle Enter and Space key activation.

### K2: Positive `tabindex` Values

- **Severity**: CRITICAL
- **Detection**: `(?:tabindex="[1-9]\d*"|tabIndex=\{[1-9]\d*\})`
- **WCAG**: 2.4.3 (A)

Only use `tabindex="0"` (add to tab order) and `tabindex="-1"` (programmatic focus only).

### K3: Focus Trap Without Escape

- **Severity**: CRITICAL
- **Detection**: Modal/overlay without Escape key handler or focus trapping
- **WCAG**: 2.1.2 (A)

Use native `<dialog>` with `showModal()` — it prevents keyboard focus from moving to the inert non-dialog content. Additionally, it has built in Escape key to dismiss, and focus will automatically return to the invoking element (if available). If a custom modal dialog implementation is needed: trap Tab within the dialog or use the `inert` attribute for non-dialog content (do not use `inert` on an element that contains the dialog), dismiss on Escape (unless user confirmation of an action is essential), return focus to the trigger element on close, or to best logical location if triggering element is no longer present upon dismissal.

### K4: Missing Skip Link

- **Severity**: IMPORTANT
- **Detection**: No skip link as first focusable element
- **WCAG**: 2.4.1 (A)

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
<nav>...</nav>
<main id="main-content" tabindex="-1">...</main>
```

```css
.skip-link { position: absolute; top: -40px; left: 0; padding: 8px 16px; background: #000; color: #fff; z-index: 100; }
.skip-link:focus { top: 0; }
```

### K5: `outline: none` Without Replacement

- **Severity**: CRITICAL
- **Detection**: `outline:\s*none|outline:\s*0\b` without `:focus-visible` replacement
- **WCAG**: 2.4.7 (AA)

```css
/* GOOD */
button:focus-visible { outline: 2px solid #005fcc; outline-offset: 2px; }
```

### K6: Mouse-Only Interactions

- **Severity**: IMPORTANT
- **Detection**: `onMouseOver|onMouseEnter|@mouseenter` without keyboard equivalent
- **WCAG**: 2.1.1 (A)

Pair hover with focus events. Use `onFocus`/`onBlur` alongside `onMouseEnter`/`onMouseLeave`.

### K7: Focus Not Returned After Custom Modal Close

- **Severity**: IMPORTANT
- **Detection**: Custom modal dialog close without restoring focus to trigger
- **WCAG**: 2.4.3 (A)

Store reference to trigger element or to best logical location if triggering element is no longer present upon close. On modal close, call `triggerElement.focus()`.

---

## Form Anti-Patterns (F1-F6)

### F1: Input Without Associated Label

- **Severity**: CRITICAL
- **Detection**: `<input|<select|<textarea` without `<label>`, `aria-label`, or `aria-labelledby`
- **WCAG**: 1.3.1 (A), 3.3.2 (A)

```html
<!-- GOOD -->
<label for="email">Email address</label>
<input id="email" type="email" placeholder="you@example.com" />
```

### F2: Error Messages Not Linked to Input

- **Severity**: CRITICAL
- **Detection**: Error elements near inputs without `aria-describedby`
- **WCAG**: 3.3.1 (A)

```html
<input id="email" type="email" aria-describedby="email-error" aria-invalid="true" />
<span id="email-error" class="error">Invalid email format</span>
```

### F3: Required Field Indicated Only by Color or `*`

- **Severity**: IMPORTANT
- **Detection**: `required` or `*` without `aria-required="true"` or HTML `required`
- **WCAG**: 3.3.2 (A), 1.4.1 (A)

```html
<label for="name">Name <span aria-hidden="true">*</span></label>
<input id="name" type="text" required />
<p class="form-note">Fields marked * are required</p>
```

### F4: No Error Summary or Focus on First Error

- **Severity**: IMPORTANT
- **Detection**: Form submit handler without focus management on validation failure
- **WCAG**: 3.3.1 (A)

On submit failure, focus the first invalid field or show and focus an error summary.

### F5: CAPTCHA Without Accessible Alternative

- **Severity**: IMPORTANT
- **Detection**: Puzzle/image CAPTCHAs without fallback; password fields with `autocomplete='off'` or paste-blocking JavaScript
- **WCAG**: 3.3.8 (AA)

Use reCAPTCHA v3 (invisible), hCaptcha accessibility mode, or alternative authentication. Never block paste or autofill on password fields — this violates WCAG 3.3.8.

### F6: Placeholder as Label

- **Severity**: IMPORTANT
- **Detection**: `placeholder=` without accompanying `<label>`, `aria-label`, or `aria-labelledby`
- **WCAG**: 3.3.2 (A)

Always pair placeholder with a visible `<label>`. Placeholder is a hint, not a label.

---

## Visual and Color Anti-Patterns (V1-V5)

### V1: Insufficient Text Contrast

- **Severity**: CRITICAL
- **Detection**: Text color combinations below 4.5:1 (normal) or 3:1 (large)
- **WCAG**: 1.4.3 (AA)

```css
/* BAD — #999 on #fff is ~2.5:1 */
.text { color: #999; background: #fff; }

/* GOOD — #595959 on #fff is 7.0:1 */
.text { color: #595959; background: #fff; }
```

### V2: Information Conveyed by Color Alone

- **Severity**: CRITICAL
- **Detection**: Error/success states distinguished only by color
- **WCAG**: 1.4.1 (A)

Add a secondary indicator: icon, text, pattern, underline, or border.

### V3: Fixed Font Sizes Preventing Resize

- **Severity**: IMPORTANT
- **Detection**: `font-size:\s*[0-9]*px` (excluding root/base)
- **WCAG**: 1.4.4 (AA)

Use `rem` or `em` for font sizes. Base font can be `px`, but content fonts should be relative.


---

> **Full Reference**: To keep this rule under Antigravity's 24,000-byte per-rule context limit, the complete unabridged reference is preserved in [docs/rule-references/a11y-full.md](../docs/rule-references/a11y-full.md). Read that file on demand when deeper details are needed.
