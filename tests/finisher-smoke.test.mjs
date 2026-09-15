import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const path = (name) => new URL(name, root);

test('master finisher runtime assets exist', () => {
  assert.equal(existsSync(path('scripts/start-and-finish-everything.mjs')), true);
  assert.equal(existsSync(path('QMOOSA_TRUTH_PROTOCOL.md')), true);
  assert.equal(existsSync(path('.github/workflows/master-finisher.yml')), true);
});

test('package manifest declares PQC audit dependencies', () => {
  const pkg = JSON.parse(readFileSync(path('package.json'), 'utf8'));
  assert.ok(pkg.dependencies?.['@noble/hashes']);
  assert.ok(pkg.dependencies?.['@noble/post-quantum']);
});
