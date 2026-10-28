// Front matter parsing and serialization. Source text is only ever treated as data.
import YAML from 'yaml';

const FM_RE = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

/**
 * Split a Markdown document into YAML front matter and body.
 * @param {string} text
 * @returns {{ data: Record<string, unknown>, body: string, hasFrontmatter: boolean, error?: string }}
 */
export function parseFrontmatter(text) {
  const clean = text.replace(/^\uFEFF/, '');
  const match = clean.match(FM_RE);
  if (!match) return { data: {}, body: clean, hasFrontmatter: false };
  const body = clean.slice(match[0].length);
  try {
    const data = YAML.parse(match[1]) ?? {};
    if (typeof data !== 'object' || Array.isArray(data)) {
      return { data: {}, body, hasFrontmatter: true, error: 'front matter is not a mapping' };
    }
    return { data, body, hasFrontmatter: true };
  } catch (err) {
    return { data: {}, body, hasFrontmatter: true, error: `invalid YAML: ${err.message}` };
  }
}

/**
 * Build a Markdown document from front matter data and a body.
 * Keys with `undefined` values are omitted.
 * @param {Record<string, unknown>} data
 * @param {string} body
 */
export function stringifyFrontmatter(data, body) {
  const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
  const yaml = YAML.stringify(clean, { lineWidth: 0 }).trimEnd();
  return `---\n${yaml}\n---\n${normalizeBody(body)}`;
}

/**
 * Body as written by `stringifyFrontmatter`: one leading blank line, trailing newline.
 * @param {string} body
 */
export function normalizeBody(body) {
  const text = body.startsWith('\n') ? body : `\n${body}`;
  return text.endsWith('\n') ? text : `${text}\n`;
}
