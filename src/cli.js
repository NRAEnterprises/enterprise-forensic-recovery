import { VERSION, createCase, loadCase, addSource, imageSource, inspectSource, inventoryCase, identifyCase, validateArchives, extractArchives, carveFile, analyzeProjects, verifyCase, verifyAudit, doctor, report } from './index.js';
import { loadPolicy, savePolicy, normalizePolicy } from './policy.js';
import { inspectFilesystem, recoverDeletedNtfs, recoverNtfsJournals, decodeNtfsJournalArtifacts, recoverExtMetadata } from './filesystem.js';
import { inspectDatabase, recoverDatabasePages } from './database.js';
import { listProfiles } from './profiles.js';
import { listCapabilities } from './capabilities.js';
import { completion } from './completion.js';
import { diffReports } from './report-diff.js';
import { addCaseNote, listCaseNotes, verifyCaseNotes } from './notes.js';
import { createManifest, verifyManifest } from './manifest.js';
import { caseStatus } from './case-status.js';
import { fingerprintSource } from './fingerprint.js';
import { schemaCatalog, exitCodeCatalog, resultStatusCatalog, recoveryMethodCatalog, compatibilityCatalog } from './catalogs.js';
import { reportIndex } from './report-index.js';

export const EXIT = Object.freeze({ OK: 0, PARTIAL: 2, USAGE: 64, SOURCE: 66, POLICY: 77, INTERNAL: 70 });

function help() { return `Enterprise Forensic Recovery CLI v0.5.0\n\nUsage:\n  recovery case create <dir>
  recovery case status <case-dir> [--metadata JSON]\n  recovery source add <case-dir> <path>\n  recovery source inspect <source>\n  recovery filesystem inspect <image>\n  recovery filesystem recover-deleted <image> <output>\n  recovery filesystem recover-journals <image> <output>\n  recovery filesystem decode-journals <output>\n  recovery filesystem recover-ext <image> <output>\n  recovery database inspect <database>\n  recovery database recover-pages <database> <output>\n  recovery inventory <case-dir> [--follow-symlinks] [--json]\n  recovery identify <case-dir> [--json]\n  recovery validate <case-dir> [--json]\n  recovery extract <case-dir> <output-dir> [--overwrite]\n  recovery carve <file> <output-dir> [--max-artifacts N]\n  recovery analyze project <case-dir>\n  recovery verify <case-dir>\n  recovery report <case-dir>
  recovery report index <case-dir>\n  recovery policy show <case-dir>\n  recovery policy set <case-dir> <policy.json>
  recovery policy validate <policy.json>\n  recovery version\n  recovery profile list\n  recovery capability list\n  recovery completion <bash|zsh|powershell>
  recovery diff <left-report> <right-report>
  recovery notes add <case-dir> <text>
  recovery notes list <case-dir>
  recovery notes verify <case-dir>
  recovery manifest <directory>
  recovery manifest verify <directory> <manifest>
  recovery fingerprint <source>
  recovery schema list
  recovery exit-code list
  recovery result-status list
  recovery method list
  recovery compatibility show\n  recovery doctor\n\nGlobal options:\n  --json       Emit machine-readable JSON only
  --jsonl      Emit one machine-readable JSON object per line\n  --quiet      Suppress non-error human output\n  --help       Show help\n\nAll operations are read-only by default. Work from forensic copies or images whenever possible.\n`; }
function parse(args) { const positional = []; const options = {}; const booleanFlags = new Set(['help', 'json', 'jsonl', 'quiet', 'resume', 'native', 'overwrite', 'dry_run', 'follow_symlinks']); for (let i = 0; i < args.length; i++) { const token = args[i]; if (token === '--') { positional.push(...args.slice(i + 1)); break; } if (token.startsWith('--')) { const key = token.slice(2).replaceAll('-', '_'); const next = args[i + 1]; if (!booleanFlags.has(key) && next && !next.startsWith('--')) { options[key] = next; i++; } else options[key] = true; } else positional.push(token); } return { positional, options }; }
function value(positional, index, label) { if (!positional[index]) { const error = new Error(`Missing ${label}`); error.exitCode = EXIT.USAGE; throw error; } return positional[index]; }
function output(value, options) { if (options.quiet) return; if (options.jsonl) console.log(JSON.stringify(value)); else console.log(JSON.stringify(value, null, 2)); }

export async function main(args) {
  const { positional, options } = parse(args); if (!positional.length || options.help) { console.log(help()); return EXIT.OK; }
  const [command, sub, ...rest] = positional; const target = [sub, ...rest];
  if (command === 'version' || command === '--version') { console.log(VERSION); return EXIT.OK; }
  if (command === 'doctor') { output(await doctor(), options); return EXIT.OK; }
  if (command === 'inspect') { output(await inspectSource(value([sub, ...rest], 0, 'source path')), options); return EXIT.OK; }
  if (command === 'image') { const result = await imageSource(value([sub, ...rest], 0, 'case directory'), value([sub, ...rest], 1, 'source path'), value([sub, ...rest], 2, 'image output'), { resume: Boolean(options.resume), native: Boolean(options.native), overwrite: Boolean(options.overwrite), dryRun: Boolean(options.dry_run), offset: options.offset ? Number(options.offset) : 0 }); output(result, options); return result.complete ? EXIT.OK : EXIT.PARTIAL; }
  if (command === 'case' && sub === 'create') { const metadata = options.metadata ? JSON.parse(options.metadata) : {}; output(await createCase(value(rest, 0, 'case directory'), metadata), options); return EXIT.OK; }
  if (command === 'source' && sub === 'add') { output(await addSource(value(rest, 0, 'case directory'), value(rest, 1, 'source path')), options); return EXIT.OK; }
  if (command === 'source' && sub === 'inspect') { output(await inspectSource(value(rest, 0, 'source path')), options); return EXIT.OK; }
  if (command === 'filesystem' && sub === 'inspect') { output(await inspectFilesystem(value(rest, 0, 'filesystem image')), options); return EXIT.OK; }
  if (command === 'filesystem' && sub === 'recover-deleted') { const result = await recoverDeletedNtfs(value(rest, 0, 'NTFS image'), value(rest, 1, 'recovery output directory'), { maxCandidates: options.max_candidates ? Number(options.max_candidates) : undefined, maxScanBytes: options.max_scan_bytes ? Number(options.max_scan_bytes) : undefined }); output(result, options); return result.complete ? EXIT.OK : EXIT.PARTIAL; }
  if (command === 'filesystem' && sub === 'recover-journals') { const result = await recoverNtfsJournals(value(rest, 0, 'NTFS image'), value(rest, 1, 'journal output directory'), { maxRecords: options.max_records ? Number(options.max_records) : undefined, maxScanBytes: options.max_scan_bytes ? Number(options.max_scan_bytes) : undefined }); output(result, options); return result.complete ? EXIT.OK : EXIT.PARTIAL; }
  if (command === 'filesystem' && sub === 'decode-journals') { output(await decodeNtfsJournalArtifacts(value(rest, 0, 'journal output directory')), options); return EXIT.OK; }
  if (command === 'filesystem' && sub === 'recover-ext') { const result = await recoverExtMetadata(value(rest, 0, 'ext image'), value(rest, 1, 'metadata output directory')); output(result, options); return result.complete ? EXIT.OK : EXIT.PARTIAL; }
  if (command === 'database' && sub === 'inspect') { output(await inspectDatabase(value(rest, 0, 'database path'), { wal: options.wal, journal: options.journal }), options); return EXIT.OK; }
  if (command === 'database' && sub === 'recover-pages') { const result = await recoverDatabasePages(value(rest, 0, 'database path'), value(rest, 1, 'database output directory'), { maxPages: options.max_pages ? Number(options.max_pages) : undefined, maxScanBytes: options.max_scan_bytes ? Number(options.max_scan_bytes) : undefined, wal: options.wal, journal: options.journal }); output(result, options); return result.complete ? EXIT.OK : EXIT.PARTIAL; }
  if (command === 'profile' && sub === 'list') { output(listProfiles(), options); return EXIT.OK; }
  if (command === 'capability' && sub === 'list') { output(listCapabilities(), options); return EXIT.OK; }
  if (command === 'completion') { const shell = sub || 'bash'; process.stdout.write(completion(shell)); return EXIT.OK; }
  if (command === 'diff') { output(await diffReports(value([sub, ...rest], 0, 'left report'), value([sub, ...rest], 1, 'right report')), options); return EXIT.OK; }
  if (command === 'notes' && sub === 'add') { output(await addCaseNote(value(rest, 0, 'case directory'), value(rest, 1, 'note text'), options.author || 'operator'), options); return EXIT.OK; }
  if (command === 'notes' && sub === 'list') { output(await listCaseNotes(value(rest, 0, 'case directory')), options); return EXIT.OK; }
  if (command === 'notes' && sub === 'verify') { const result = await verifyCaseNotes(value(rest, 0, 'case directory')); output(result, options); return result.ok ? EXIT.OK : EXIT.PARTIAL; }
  if (command === 'manifest' && sub === 'verify') { const result = await verifyManifest(value(rest, 0, 'artifact directory'), value(rest, 1, 'manifest file')); output(result, options); return result.ok ? EXIT.OK : EXIT.PARTIAL; }
  if (command === 'manifest') { output(await createManifest(value([sub, ...rest], 0, 'artifact directory')), options); return EXIT.OK; }
  if (command === 'case' && sub === 'status') { output(await caseStatus(value(rest, 0, 'case directory')), options); return EXIT.OK; }
  if (command === 'fingerprint') { output(await fingerprintSource(value([sub, ...rest], 0, 'source path')), options); return EXIT.OK; }
  if (command === 'schema' && sub === 'list') { output(schemaCatalog(), options); return EXIT.OK; }
  if (command === 'exit-code' && sub === 'list') { output(exitCodeCatalog(), options); return EXIT.OK; }
  if (command === 'result-status' && sub === 'list') { output(resultStatusCatalog(), options); return EXIT.OK; }
  if (command === 'method' && sub === 'list') { output(recoveryMethodCatalog(), options); return EXIT.OK; }
  if (command === 'compatibility' && sub === 'show') { output(compatibilityCatalog(), options); return EXIT.OK; }
  if (command === 'report' && sub === 'index') { output(await reportIndex(value(rest, 0, 'case directory')), options); return EXIT.OK; }
  if (command === 'source' && sub === 'image') { const result = await imageSource(value(rest, 0, 'case directory'), value(rest, 1, 'source path'), value(rest, 2, 'image output'), { resume: Boolean(options.resume), native: Boolean(options.native), overwrite: Boolean(options.overwrite), dryRun: Boolean(options.dry_run), offset: options.offset ? Number(options.offset) : 0 }); output(result, options); return result.complete ? EXIT.OK : EXIT.PARTIAL; }
  if (command === 'inventory') { output(await inventoryCase(value(target, 0, 'case directory'), { followSymlinks: Boolean(options.follow_symlinks) }), options); return EXIT.OK; }
  if (command === 'identify') { output(await identifyCase(value(target, 0, 'case directory')), options); return EXIT.OK; }
  if (command === 'validate') { const result = await validateArchives(value(target, 0, 'case directory')); output(result, options); return result.summary.corrupted ? EXIT.PARTIAL : EXIT.OK; }
  if (command === 'extract') { const result = await extractArchives(value(target, 0, 'case directory'), value(rest, 0, 'output directory'), { overwrite: Boolean(options.overwrite), dryRun: Boolean(options.dry_run) }); output(result, options); return result.results.some(x => x.status === 'partial') ? EXIT.PARTIAL : EXIT.OK; }
  if (command === 'carve') { const result = await carveFile(value(target, 0, 'input file'), value(rest, 0, 'output directory'), { maxArtifacts: options.max_artifacts ? Number(options.max_artifacts) : undefined, dryRun: Boolean(options.dry_run) }); output(result, options); return EXIT.OK; }
  if (command === 'analyze' && sub === 'project') { output(await analyzeProjects(value(rest, 0, 'case directory')), options); return EXIT.OK; }
  if (command === 'verify') { const result = await verifyCase(value(target, 0, 'case directory')); output(result, options); return result.ok ? EXIT.OK : EXIT.PARTIAL; }
  if (command === 'audit' && sub === 'verify') { const result = await verifyAudit(value(rest, 0, 'case directory')); output(result, options); return result.ok ? EXIT.OK : EXIT.PARTIAL; }
  if (command === 'report') { output(await report(value(target, 0, 'case directory')), options); return EXIT.OK; }
  if (command === 'policy' && sub === 'show') { output(await loadPolicy(value(rest, 0, 'case directory')), options); return EXIT.OK; }
  if (command === 'policy' && sub === 'set') { const caseDir = value(rest, 0, 'case directory'); const policyFile = value(rest, 1, 'policy JSON file'); const policy = JSON.parse(await (await import('node:fs/promises')).readFile(policyFile, 'utf8')); output(await savePolicy(caseDir, normalizePolicy(policy)), options); return EXIT.OK; }
  if (command === 'policy' && sub === 'validate') { const policyFile = value(rest, 0, 'policy JSON file'); const policy = JSON.parse(await (await import('node:fs/promises')).readFile(policyFile, 'utf8')); output({ valid: true, policy: normalizePolicy(policy) }, options); return EXIT.OK; }
  const error = new Error(`Unknown command.\n${help()}`); error.exitCode = EXIT.USAGE; throw error;
}
