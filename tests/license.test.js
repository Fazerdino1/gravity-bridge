import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { detectSpdx, extractCopyright } from '../scripts/lib/license.js';

describe('license', () => {
  it('extracts copyright lines verbatim, with or without (c)', () => {
    const mit = 'MIT License\n\nCopyright GitHub, Inc.\n\nPermission is hereby granted, free of charge, to any person\nThe above copyright notice and this permission notice shall be included';
    assert.equal(extractCopyright(mit), 'Copyright GitHub, Inc.');
    assert.equal(extractCopyright('Copyright (c) 2024 Jane Doe'), 'Copyright (c) 2024 Jane Doe');
    assert.equal(extractCopyright('no notice here'), null);
    assert.equal(detectSpdx(mit), 'MIT');
  });
});
