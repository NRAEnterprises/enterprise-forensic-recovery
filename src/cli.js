import path from 'node:path';
import fs from 'node:fs/promises';
import { createCase, loadCase, addSource, inventoryCase, identifyCase, validateArchives, extractArchives, carveFile, analyzeProjects, verifyCase, doctor, report } from './index.js';

function help() { return `Enterprise Forensic Recovery CLI v0.2.0\n\nUsage:\n  recovery case create <dir>\n  recovery source add <case-dir> <path>\n  recovery inventory <case-dir> [--follow-symlinks]\n  recovery identify <case-dir>\n  recovery validate <case-dir>\n  recovery extract <case-dir> <output-dir>\n  recovery carve <file> <output-dir>\n  recovery analyze project <case-dir>\n  recovery verify <case-dir>\n  recovery report <case-dir>\n  recovery doctor\n\nAll operations are non-destructive by default. Work from forensic copies or images when possible.\n` }
function json(value) { console.log(JSON.stringify(value, null, 2)); }
function requireArg(args, index, label) { if (!args[index]) throw new Error(`Missing ${label}`); return args[index]; }
export async function main(args) {
  if (!args.length || args.includes('--help') || args.includes('-h')) { console.log(help()); return; }
  const [command, sub, ...rest] = args;
  if (command === 'doctor') return json(await doctor());
  if (command === 'case' && sub === 'create') return json(await createCase(requireArg(rest, 0, 'case directory')));
  if (command === 'source' && sub === 'add') return json(await addSource(requireArg(rest, 0, 'case directory'), requireArg(rest, 1, 'source path')));
  if (command === 'inventory') return json(await inventoryCase(requireArg([sub, ...rest], 0, 'case directory'), { followSymlinks: args.includes('--follow-symlinks') }));
  if (command === 'identify') return json(await identifyCase(requireArg([sub, ...rest], 0, 'case directory')));
  if (command === 'validate') return json(await validateArchives(requireArg([sub, ...rest], 0, 'case directory')));
  if (command === 'extract') return json(await extractArchives(requireArg([sub, ...rest], 0, 'case directory'), requireArg(rest, 0, 'output directory')));
  if (command === 'carve') return json(await carveFile(requireArg([sub, ...rest], 0, 'input file'), requireArg(rest, 0, 'output directory')));
  if (command === 'analyze' && sub === 'project') return json(await analyzeProjects(requireArg(rest, 0, 'case directory')));
  if (command === 'verify') return json(await verifyCase(requireArg([sub, ...rest], 0, 'case directory')));
  if (command === 'report') return json(await report(requireArg([sub, ...rest], 0, 'case directory')));
  throw new Error(`Unknown command.\n${help()}`);
}
