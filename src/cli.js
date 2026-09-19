import { createCase, loadCase, addSource, imageSource, inspectSource, inventoryCase, identifyCase, validateArchives, extractArchives, carveFile, analyzeProjects, verifyCase, verifyAudit, doctor, report } from './index.js';
import { loadPolicy, savePolicy, normalizePolicy } from './policy.js';

export const EXIT = Object.freeze({ OK: 0, PARTIAL: 2, USAGE: 64, SOURCE: 66, POLICY: 77, INTERNAL: 70 });

function help() { return `Enterprise Forensic Recovery CLI v0.4.0\n\nUsage:\n  recovery case create <dir> [--metadata JSON]\n  recovery source add <case-dir> <path>\n  recovery inventory <case-dir> [--follow-symlinks] [--json]\n  recovery identify <case-dir> [--json]\n  recovery validate <case-dir> [--json]\n  recovery extract <case-dir> <output-dir> [--overwrite]\n  recovery carve <file> <output-dir> [--max-artifacts N]\n  recovery analyze project <case-dir>\n  recovery verify <case-dir>\n  recovery report <case-dir>\n  recovery policy show <case-dir>\n  recovery policy set <case-dir> <policy.json>\n  recovery doctor\n\nGlobal options:\n  --json       Emit machine-readable JSON only\n  --quiet      Suppress non-error human output\n  --help       Show help\n\nAll operations are read-only by default. Work from forensic copies or images whenever possible.\n`; }
function parse(args) { const positional = []; const options = {}; for (let i = 0; i < args.length; i++) { const token = args[i]; if (token === '--') { positional.push(...args.slice(i + 1)); break; } if (token.startsWith('--')) { const key = token.slice(2).replaceAll('-', '_'); const next = args[i + 1]; if (next && !next.startsWith('--')) { options[key] = next; i++; } else options[key] = true; } else positional.push(token); } return { positional, options }; }
function value(positional, index, label) { if (!positional[index]) { const error = new Error(`Missing ${label}`); error.exitCode = EXIT.USAGE; throw error; } return positional[index]; }
function output(value, options) { if (!options.quiet) console.log(JSON.stringify(value, null, 2)); }

export async function main(args) {
  const { positional, options } = parse(args); if (!positional.length || options.help) { console.log(help()); return EXIT.OK; }
  const [command, sub, ...rest] = positional; const target = [sub, ...rest];
  if (command === 'doctor') { output(await doctor(), options); return EXIT.OK; }
  if (command === 'case' && sub === 'create') { const metadata = options.metadata ? JSON.parse(options.metadata) : {}; output(await createCase(value(rest, 0, 'case directory'), metadata), options); return EXIT.OK; }
  if (command === 'source' && sub === 'add') { output(await addSource(value(rest, 0, 'case directory'), value(rest, 1, 'source path')), options); return EXIT.OK; }
  if (command === 'source' && sub === 'inspect') { output(await inspectSource(value(rest, 0, 'source path')), options); return EXIT.OK; }
  if (command === 'source' && sub === 'image') { const result = await imageSource(value(rest, 0, 'case directory'), value(rest, 1, 'source path'), value(rest, 2, 'image output'), { resume: Boolean(options.resume), native: Boolean(options.native), overwrite: Boolean(options.overwrite), offset: options.offset ? Number(options.offset) : 0 }); output(result, options); return result.complete ? EXIT.OK : EXIT.PARTIAL; }
  if (command === 'inventory') { output(await inventoryCase(value(target, 0, 'case directory'), { followSymlinks: Boolean(options.follow_symlinks) }), options); return EXIT.OK; }
  if (command === 'identify') { output(await identifyCase(value(target, 0, 'case directory')), options); return EXIT.OK; }
  if (command === 'validate') { const result = await validateArchives(value(target, 0, 'case directory')); output(result, options); return result.summary.corrupted ? EXIT.PARTIAL : EXIT.OK; }
  if (command === 'extract') { const result = await extractArchives(value(target, 0, 'case directory'), value(rest, 0, 'output directory'), { overwrite: Boolean(options.overwrite) }); output(result, options); return result.results.some(x => x.status === 'partial') ? EXIT.PARTIAL : EXIT.OK; }
  if (command === 'carve') { const result = await carveFile(value(target, 0, 'input file'), value(rest, 0, 'output directory'), { maxArtifacts: options.max_artifacts ? Number(options.max_artifacts) : undefined }); output(result, options); return EXIT.OK; }
  if (command === 'analyze' && sub === 'project') { output(await analyzeProjects(value(rest, 0, 'case directory')), options); return EXIT.OK; }
  if (command === 'verify') { const result = await verifyCase(value(target, 0, 'case directory')); output(result, options); return result.ok ? EXIT.OK : EXIT.PARTIAL; }
  if (command === 'audit' && sub === 'verify') { const result = await verifyAudit(value(rest, 0, 'case directory')); output(result, options); return result.ok ? EXIT.OK : EXIT.PARTIAL; }
  if (command === 'report') { output(await report(value(target, 0, 'case directory')), options); return EXIT.OK; }
  if (command === 'policy' && sub === 'show') { output(await loadPolicy(value(rest, 0, 'case directory')), options); return EXIT.OK; }
  if (command === 'policy' && sub === 'set') { const caseDir = value(rest, 0, 'case directory'); const policyFile = value(rest, 1, 'policy JSON file'); const policy = JSON.parse(await (await import('node:fs/promises')).readFile(policyFile, 'utf8')); output(await savePolicy(caseDir, normalizePolicy(policy)), options); return EXIT.OK; }
  const error = new Error(`Unknown command.\n${help()}`); error.exitCode = EXIT.USAGE; throw error;
}
