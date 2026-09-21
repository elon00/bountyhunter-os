import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const script = resolve('scripts/start-and-finish-everything.mjs');
for (const failTests of [false, true]) {
  test(`finisher preserves missing deployment and test failure=${failTests}`, { skip: process.platform === 'win32' }, () => {
    const base = mkdtempSync(join(tmpdir(), 'finisher-evidence-'));
    try {
      const root = join(base, 'workspace', 'repo');
      const bin = join(base, 'bin');
      mkdirSync(join(root, '.github', 'workflows'), { recursive: true });
      mkdirSync(bin);
      // Include both optional modules: their presence must never imply completion.
      for (const dir of [join(base, 'workspace', 'gods-eye-view_xyz'), join(base, 'qmoosa-deep-tech-ai-quantum-platform')]) {
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'package.json'), '{}');
      }
      for (const name of ['package.json', 'QMOOSA_TRUTH_PROTOCOL.md', '.github/workflows/ci.yml']) writeFileSync(join(root, name), '{}');
      writeFileSync(join(bin, 'npm'), '#!/bin/sh\ncase "$*" in *--if-present*) exit 9;; esac\n' + (failTests ? '[ "$1" = "test" ] && exit 1\n' : '') + 'exit 0\n', { mode: 0o755 });
      writeFileSync(join(bin, 'git'), '#!/bin/sh\necho fixture-commit\n', { mode: 0o755 });
      const run = spawnSync(process.execPath, [script], { cwd: root, env: { ...process.env, PATH: `${bin}:${process.env.PATH}` }, encoding: 'utf8' });
      const report = JSON.parse(readFileSync(join(root, '.qmoosa', 'master-finisher-report.json')));
      assert.equal(run.status, failTests ? 1 : 0, run.stderr);
      assert.equal(report.status, failTests ? 'FAILED' : 'PARTIAL');
      assert.equal(report.gates.find(g => g.name === 'deployment verification').status, 'SKIP');
      assert.equal(report.gates.find(g => g.name === 'repository and application test suites').status, failTests ? 'FAIL' : 'PASS');
    } finally { rmSync(base, { recursive: true, force: true }); }
  });
}
