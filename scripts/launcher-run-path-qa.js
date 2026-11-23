'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const launcher = fs.readFileSync(path.join(__dirname, 'run.js'));
const posix = { skip: process.platform === 'win32' ? 'Owned POSIX child fixtures use shebang executables' : false };

function withSource(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'enderloom-source-runner-'));
  try {
    const app = path.join(root, 'source tree');
    const cwd = path.join(root, 'portable drive');
    const search = path.join(root, 'path fallback');
    const file = path.join(app, 'scripts', 'run.js');
    const bundled = path.join(app, 'node_modules', 'electron', 'dist', 'electron');
    [path.dirname(file), cwd, search, path.dirname(bundled)].forEach((dir) => {
      fs.mkdirSync(dir, { recursive: true });
    });
    fs.writeFileSync(file, launcher);
    const makeRuntime = (fileName, identity, status = 0, mode = 0o700) => {
      fs.mkdirSync(path.dirname(fileName), { recursive: true });
      fs.writeFileSync(fileName, [
        '#!/bin/sh',
        `printf '%s\\n' '${identity}' "$PWD" "$@"`,
        `exit ${status}`,
        '',
      ].join('\n'), { mode });
    };
    const launch = (choice, args = []) => {
      const env = { ...process.env, PATH: search };
      delete env.ELECTRON_PATH;
      delete env.NODE_PATH;
      delete env.NODE_OPTIONS;
      if (choice !== undefined) env.ELECTRON_PATH = choice;
      const result = spawnSync(process.execPath, [file, ...args], {
        cwd, env, encoding: 'utf8', timeout: 3500,
      });
      assert.ifError(result.error);
      assert.equal(result.signal, null);
      return { ...result, lines: result.stdout.trimEnd().split('\n') };
    };
    run({ app, cwd, search, bundled, makeRuntime, launch });
  } finally {
    fs.rmSync(root, { force: true, recursive: true });
  }
}

test('a chosen bare relative runtime is executed even when PATH has the same name', posix, () => {
  withSource(({ app, cwd, search, makeRuntime, launch }) => {
    makeRuntime(path.join(cwd, 'owned-electron'), 'chosen runtime');
    makeRuntime(path.join(search, 'owned-electron'), 'PATH runtime');
    const result = launch('owned-electron', ['--self-test', 'argument with spaces']);
    assert.equal(result.status, 0);
    assert.deepEqual(result.lines, ['chosen runtime', cwd, app, '--self-test', 'argument with spaces']);
  });
});

test('a path with spaces keeps argument boundaries, working directory and exit status', posix, () => {
  withSource(({ app, cwd, makeRuntime, launch }) => {
    makeRuntime(path.join(cwd, 'chosen folder', 'electron local'), 'relative runtime', 13);
    const result = launch(path.join('chosen folder', 'electron local'), ['--mode=QA only']);
    assert.equal(result.status, 13);
    assert.deepEqual(result.lines, ['relative runtime', cwd, app, '--mode=QA only']);
  });
});

test('a relative path through a linked directory retains its physical meaning', posix, () => {
  withSource(({ app, cwd, makeRuntime, launch }) => {
    const physical = path.join(cwd, 'physical folder');
    fs.mkdirSync(path.join(physical, 'child directory'), { recursive: true });
    fs.symlinkSync(path.join(physical, 'child directory'), path.join(cwd, 'linked'));
    makeRuntime(path.join(cwd, 'electron'), 'lexically normalized runtime');
    makeRuntime(path.join(physical, 'electron'), 'physically selected runtime');
    // Do not use path.join for the user-supplied spelling: it flattens "..".
    const result = launch('linked/../electron');
    assert.equal(result.status, 0);
    assert.deepEqual(result.lines, ['physically selected runtime', cwd, app]);
  });
});

test('a missing override can still use the bundled file', posix, () => {
  withSource(({ app, cwd, bundled, makeRuntime, launch }) => {
    makeRuntime(bundled, 'bundled runtime');
    const result = launch('missing-in-this-folder');
    assert.equal(result.status, 0);
    assert.deepEqual(result.lines, ['bundled runtime', cwd, app]);
  });
});

test('a runtime folder is not mistaken for an executable file', posix, () => {
  withSource(({ app, cwd, bundled, makeRuntime, launch }) => {
    fs.mkdirSync(path.join(cwd, 'not-an-executable'));
    makeRuntime(bundled, 'bundled runtime');
    const result = launch('not-an-executable');
    assert.equal(result.status, 0);
    assert.deepEqual(result.lines, ['bundled runtime', cwd, app]);
  });
});

test('a genuine spawn failure is reported without an unhandled error or fallback', posix, () => {
  withSource(({ cwd, bundled, makeRuntime, launch }) => {
    makeRuntime(path.join(cwd, 'nonexecutable'), 'must not run', 0, 0o600);
    makeRuntime(bundled, 'must not fall back');
    const result = launch('./nonexecutable');
    assert.equal(result.status, 1);
    assert.equal(result.stdout, '');
    assert.match(result.stderr, /Could not start the Enderloom Electron runtime/);
    assert.ok(result.stderr.includes(path.join(cwd, 'nonexecutable')));
    assert.match(result.stderr, /EACCES/);
    assert.doesNotMatch(result.stderr, /Unhandled 'error' event|node:internal\//);
  });
});

test('no known runtime leaves the source-runner install help and status intact', posix, () => {
  withSource(({ launch }) => {
    const result = launch();
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Electron runtime not found.*ELECTRON_PATH/);
  });
});
