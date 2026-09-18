#!/usr/bin/env node
import { main } from '../src/cli.js';
main(process.argv.slice(2)).catch((error) => {
  console.error(JSON.stringify({ error: error.message, code: error.code || 'RECOVERY_ERROR' }, null, 2));
  process.exitCode = 1;
});
