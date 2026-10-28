// Static text scanners. They only match patterns; nothing found here is ever executed.

const SECRET_PATTERNS = [
  ['GitHub token', /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b/],
  ['GitHub fine-grained token', /\bgithub_pat_[A-Za-z0-9_]{60,}\b/],
  ['AWS access key', /\bAKIA(?!IOSFODNN7EXAMPLE)[0-9A-Z]{16}\b/],
  ['Google API key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['OpenAI-style key', /\bsk-[A-Za-z0-9]{32,}\b/],
  ['Slack token', /\bxox[abpors]-[A-Za-z0-9-]{10,}\b/],
  ['Private key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----(?!["'`])/],
];

const DANGEROUS_PATTERNS = [
  ['rm -rf', /\brm\s+-[a-zA-Z]*r[a-zA-Z]*f|\brm\s+-[a-zA-Z]*f[a-zA-Z]*r/],
  ['pipe to shell', /\b(?:curl|wget)\b[^\n|]*\|\s*(?:sudo\s+)?(?:ba|z)?sh\b/],
  ['sudo', /\bsudo\s+\S/],
  ['write outside project', /(?:>|\btee\b|\bcp\b|\bmv\b)\s+(?:\/etc|\/usr|\/bin|~\/|\$HOME|\/root)/],
  ['chmod 777', /\bchmod\s+(?:-R\s+)?777\b/],
  ['disk format', /\bmkfs\.|\bdd\s+if=.*\bof=\/dev\//],
  ['runs without confirmation', /\bno confirmation\b|\bwithout (?:asking|confirmation|user confirmation)\b/i],
];

const INJECTION_PATTERNS = [
  ['ignore previous instructions', /\b(?:ignore|disregard|forget)\b[^\n]{0,30}\b(?:previous|prior|above|all)\b[^\n]{0,20}\binstructions?\b/i],
  ['role override', /\byou are now\b|\bnew system prompt\b/i],
  ['hidden instruction to agent', /\b(?:AI|assistant|agent|LLM)s?\b[^\n]{0,20}\b(?:must|should) (?:secretly|silently)\b/i],
  ['exfiltration request', /\b(?:send|upload|post)\b[^\n]{0,40}\b(?:\.env|credentials|secrets?|api keys?|tokens?)\b/i],
];

function scan(text, patterns) {
  const hits = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const [label, re] of patterns) if (re.test(line)) hits.push({ label, line: i + 1 });
  });
  return hits;
}

/** @param {string} text */
export const findSecrets = (text) => scan(text, SECRET_PATTERNS);
/** @param {string} text */
export const findDangerousCommands = (text) => scan(text, DANGEROUS_PATTERNS);
/** @param {string} text */
export const findInjection = (text) => scan(text, INJECTION_PATTERNS);
