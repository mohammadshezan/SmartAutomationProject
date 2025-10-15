#!/usr/bin/env node
/**
 * Cross-platform Next.js dev launcher for Windows/PowerShell.
 * Usage:
 *   node scripts/dev.js            # uses process.env.NEXT_PUBLIC_WEB_PORT || 3000
 *   node scripts/dev.js 3005       # override port
 */
const { fork } = require('child_process');
const path = require('path');
const net = require('net');

const cliPortArg = process.argv[2];
const requestedPort = Number(cliPortArg || process.env.NEXT_PUBLIC_WEB_PORT || 3000);

function isValidPort(p) {
  return Number.isInteger(p) && p > 0 && p < 65536;
}

if (!isValidPort(requestedPort)) {
  console.error(`Invalid port: ${cliPortArg ?? process.env.NEXT_PUBLIC_WEB_PORT}`);
  process.exit(1);
}

function checkPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => {
      resolve(false);
    });
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '0.0.0.0');
  });
}

async function pickPort() {
  // Try requested, then common alternates, then scan upward
  const candidates = [requestedPort, 3005, 3002];
  for (const p of candidates) {
    if (!isValidPort(p)) continue;
    // eslint-disable-next-line no-await-in-loop
    const free = await checkPortFree(p);
    if (free) return p;
  }
  // Scan upward from requestedPort+1 up to +20
  for (let p = requestedPort + 1; p < requestedPort + 21; p += 1) {
    // eslint-disable-next-line no-await-in-loop
    const free = await checkPortFree(p);
    if (free) return p;
  }
  return requestedPort; // last resort
}

// Resolve Next.js CLI script and execute via Node for cross-platform reliability (avoids EINVAL on Windows)
let nextCli;
try {
  nextCli = require.resolve('next/dist/bin/next');
} catch (e) {
  console.error('Unable to resolve next CLI. Did you run npm install in apps/web?');
  process.exit(1);
}

// Resolve a safe port and start Next
(async () => {
  const port = await pickPort();
  if (String(port) !== String(requestedPort)) {
    console.log(`[dev] Port ${requestedPort} busy; falling back to ${port}`);
  }
  const env = { ...process.env, PORT: String(port), NEXT_PUBLIC_WEB_PORT: String(port) };
  const args = ['dev', '-p', String(port)];
  const child = fork(nextCli, args, {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
    env,
  });
  child.on('exit', (code) => process.exit(code ?? 0));
})();
