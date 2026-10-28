// License detection for source items. Copyright lines are copied verbatim from license files.
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

/** Licenses that allow redistribution and are accepted by this project. */
export const ALLOWED_LICENSES = Object.freeze([
  'MIT',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  'ISC',
  'CC0-1.0',
  'CC-BY-4.0',
]);

const LICENSE_FILES = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'LICENCE', 'COPYING'];

const DETECTORS = [
  ['MIT', /Permission is hereby granted, free of charge/i],
  ['Apache-2.0', /Apache License,?\s+Version 2\.0/i],
  ['BSD-3-Clause', /Neither the name of .* nor the names of its\s+contributors/is],
  ['BSD-2-Clause', /Redistribution and use in source and binary forms/i],
  ['ISC', /Permission to use, copy, modify, and\/or distribute this software for any/i],
  ['CC0-1.0', /CC0 1\.0 Universal/i],
  ['CC-BY-4.0', /Attribution 4\.0 International/i],
];

/**
 * Detect an SPDX identifier from license text.
 * @param {string} text
 * @returns {string | null}
 */
export function detectSpdx(text) {
  for (const [id, re] of DETECTORS) if (re.test(text)) return id;
  return null;
}

/**
 * Return the first copyright line of a license text, verbatim (trimmed).
 * @param {string} text
 */
export function extractCopyright(text) {
  const line = text.split(/\r?\n/).find((l) => /^\s*Copyright\s*(\(c\)|©|\d)/i.test(l));
  return line ? line.trim() : null;
}

function findLicenseFile(dir) {
  for (const name of LICENSE_FILES) {
    const p = join(dir, name);
    if (existsSync(p)) return p;
  }
  return null;
}

/**
 * Resolve the license that applies to a source item: the nearest license file
 * between the item's folder and the source root (inclusive).
 * @param {string} sourceRoot
 * @param {string} itemPath absolute path of the item's main file
 * @returns {{ spdx: string | null, copyright: string | null, file: string, allowed: boolean } | null}
 */
export function resolveLicense(sourceRoot, itemPath) {
  const root = resolve(sourceRoot);
  let dir = dirname(resolve(itemPath));
  while (dir === root || dir.startsWith(root + sep)) {
    const file = findLicenseFile(dir);
    if (file) {
      const text = readFileSync(file, 'utf8');
      const spdx = detectSpdx(text);
      return {
        spdx,
        copyright: extractCopyright(text),
        file: relative(root, file).split(sep).join('/'),
        allowed: spdx !== null && ALLOWED_LICENSES.includes(spdx),
      };
    }
    if (dir === root) break;
    dir = dirname(dir);
  }
  return null;
}
