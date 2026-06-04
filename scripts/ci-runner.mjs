#!/usr/bin/env node
import { mkdirSync, createWriteStream } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { spawn } from 'node:child_process';

const [, , logFileArg, ...commandParts] = process.argv;

if (!logFileArg || commandParts.length === 0) {
  console.error('Usage: node scripts/ci-runner.mjs <log-file> <command...>');
  process.exit(2);
}

const logFile = resolve(process.cwd(), logFileArg);
const command = commandParts.join(' ');
mkdirSync(dirname(logFile), { recursive: true });

const stream = createWriteStream(logFile, { flags: 'a' });
const startedAt = new Date().toISOString();

function write(line) {
  stream.write(line);
}

write(`\n=== CI RUNNER START ${startedAt} ===\n`);
write(`cwd: ${process.cwd()}\n`);
write(`command: ${command}\n\n`);

const child = spawn(command, {
  cwd: process.cwd(),
  env: process.env,
  shell: true,
});

child.stdout.on('data', (chunk) => {
  process.stdout.write(chunk);
  write(chunk);
});

child.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
  write(chunk);
});

child.on('error', (error) => {
  const message = `\nCI runner spawn error: ${error instanceof Error ? error.message : String(error)}\n`;
  process.stderr.write(message);
  write(message);
  stream.end(() => process.exit(1));
});

child.on('close', (code, signal) => {
  const finishedAt = new Date().toISOString();
  write(`\n=== CI RUNNER END ${finishedAt} code=${code ?? 'null'} signal=${signal ?? 'null'} ===\n`);
  stream.end(() => process.exit(code ?? 1));
});
