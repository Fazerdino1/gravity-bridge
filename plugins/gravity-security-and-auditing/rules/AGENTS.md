<!-- Source: rules/security-and-owasp.md -->
# Security Standards
- **CRITICAL** — Exploitable vulnerability. Must be fixed before merge.
- **IMPORTANT** — Significant risk. Should be fixed in the same sprint.
- **SUGGESTION** — Defense-in-depth improvement. Plan for a future iteration.
## OWASP Top 10 — 2025 Quick Reference
## Injection Anti-Patterns (I1-I8)
### I1: SQL Injection via String Concatenation
- **Severity**: CRITICAL
- **Detection**: `\$\{.*\}.*(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE)`
- **OWASP**: A05
### I2: NoSQL Injection (MongoDB Operator Injection)
- **Severity**: CRITICAL
- **Detection**: `\{\s*\$(?:gt|gte|lt|lte|ne|in|nin|regex|where|exists)`
- **OWASP**: A05
### I3: Command Injection (exec with User Input)
> Full reference inside this plugin: `references/security-and-owasp.md` (read on demand when working on matching files).

---

<!-- Source: rules/ai-prompt-engineering-safety-best-practices.md -->
# AI Prompt Engineering & Safety Best Practices
## Your Mission
## Introduction
### What is Prompt Engineering?
- **Prompt:** The input text that instructs an AI system what to do
- **Context:** Background information that helps the AI understand the task
- **Constraints:** Limitations or requirements that guide the output
- **Examples:** Sample inputs and outputs that demonstrate the desired behavior
- **Quality:** Clear prompts lead to more accurate and relevant responses
- **Safety:** Well-designed prompts can prevent harmful or biased outputs
- **Reliability:** Consistent prompts produce more predictable results
- **Efficiency:** Good prompts reduce the need for multiple iterations
> Full reference inside this plugin: `references/ai-prompt-engineering-safety-best-practices.md` (read on demand when working on matching files).
