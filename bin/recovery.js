#!/usr/bin/env node
import { main, EXIT } from '../src/cli.js';
main(process.argv.slice(2)).then((code) => { process.exitCode = code || EXIT.OK; }).catch((error) => {
  console.error(JSON.stringify({ error: error.message, code: error.code || 'RECOVERY_ERROR' }, null, 2));
  process.exitCode = error.exitCode || EXIT.INTERNAL;
});
