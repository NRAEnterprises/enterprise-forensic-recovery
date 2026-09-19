import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { DEFAULT_POLICY, loadPolicy, savePolicy, assertOutputSafe } from './policy.js';
import { SCHEMAS, validateCase, validateDocument } from './schema.js';

export const VERSION = '0.3.0';
export const STATUS = Object.freeze({ RECOVERED: 'recovered', PARTIAL: 'partial', UNCERTAIN: 'uncertain', ENCRYPTED: 'encrypted', CORRUPTED: 'corrupted', UNSUPPORTED: 'unsupported', UNRECOVERABLE: 'unrecoverable' });

const SIGNATURES = [
  ['zip', Buffer.from('504b0304', 'hex'), 'ZIP archive'], ['zip-empty', Buffer.from('504b0506', 'hex'), 'empty ZIP archive'],
  ['gzip', Buffer.from('1f8b', 'hex'), 'gzip stream'], ['7z', Buffer.from('377abcaf271c', 'hex'), '7-Zip archive'],
  ['pdf', Buffer.from('255044462d', 'hex'), 'PDF document'], ['png', Buffer.from('89504e470d0a1a0a', 'hex'), 'PNG image'],
  ['jpg', Buffer.from('ffd8ff', 'hex'), 'JPEG image'], ['gif', Buffer.from('47494638', 'hex'), 'GIF image'],
  ['sqlite', Buffer.from('53514c69746520666f726d6174203300', 'hex'), 'SQLite database'],
  ['wasm', Buffer.from('0061736d', 'hex'), 'WebAssembly module'], ['elf', Buffer.from('7f454c46', 'hex'), 'ELF executable'],
  ['macho', Buffer.from('feedface', 'hex'), 'Mach-O executable'], ['ole', Buffer.from('d0cf11e0a1b11ae1', 'hex'), 'OLE compound document'],
  ['rar', Buffer.from('526172211a07', 'hex'), 'RAR archive'], ['zstd', Buffer.from('28b52ffd', 'hex'), 'Zstandard stream'],
  ['bzip2', Buffer.from('425a68', 'hex'), 'bzip2 stream'], ['xz', Buffer.from('fd377a585a00', 'hex'), 'XZ stream']
];

function now() { return new Date().toISOString(); }
function ensureDir(p) { return fs.mkdir(p, { recursive: true }); }
function casePaths(caseDir) { return { caseDir, manifest: path.join(caseDir, 'case.json'), sources: path.join(caseDir, 'sources'), artifacts: path.join(caseDir, 'artifacts'), reports: path.join(caseDir, 'reports'), logs: path.join(caseDir, 'logs') }; }
async function readJson(file) { return JSON.parse(await fs.readFile(file, 'utf8')); }
async function writeJson(file, value) { await ensureDir(path.dirname(file)); await fs.writeFile(file, JSON.stringify(value, null, 2) + '\n'); }
async function appendAudit(caseDir, event) { const p = path.join(caseDir, 'logs', 'audit.ndjson'); await ensureDir(path.dirname(p)); let previous = 'GENESIS'; try { const lines = (await fs.readFile(p, 'utf8')).trim().split('\n'); if (lines.length && lines[0]) previous = JSON.parse(lines.at(-1)).recordHash || previous; } catch (error) { if (error.code !== 'ENOENT') throw error; } const record = { time: now(), tool: `@enterprise-recovery/forensic-recovery@${VERSION}`, host: os.hostname(), pid: process.pid, previousHash: previous, ...event }; record.recordHash = crypto.createHash('sha256').update(JSON.stringify(record)).digest('hex'); await fs.appendFile(p, JSON.stringify(record) + '\n', { mode: 0o600 }); return record; }

export async function createCase(caseDir, metadata = {}) {
  const p = casePaths(path.resolve(caseDir));
  await Promise.all(Object.values(p).map((v) => v.endsWith('.json') ? ensureDir(path.dirname(v)) : ensureDir(v)));
  const existing = await fs.access(p.manifest).then(() => true).catch(() => false);
  if (existing) throw new Error(`Case already exists: ${p.caseDir}`);
  const manifest = { schema: SCHEMAS.case, id: crypto.randomUUID(), createdAt: now(), operator: process.env.USER || process.env.USERNAME || 'unknown', host: os.hostname(), platform: `${process.platform}-${process.arch}`, metadata, sources: [], artifacts: [], findings: [] };
  await writeJson(p.manifest, manifest); await savePolicy(p.caseDir, DEFAULT_POLICY); await appendAudit(p.caseDir, { action: 'case.create', caseId: manifest.id }); return manifest;
}

export async function loadCase(caseDir) { const p = casePaths(path.resolve(caseDir)); const manifest = validateCase(await readJson(p.manifest)); return { ...manifest, _paths: p, policy: await loadPolicy(p.caseDir) }; }
async function saveCase(c) { const copy = { ...c }; delete copy._paths; delete copy.policy; await writeJson(c._paths.manifest, copy); }

export async function addSource(caseDir, inputPath, options = {}) {
  const c = await loadCase(caseDir); const sourcePath = path.resolve(inputPath); const st = await fs.lstat(sourcePath);
  if (c.sources.some(source => path.resolve(source.path) === sourcePath)) throw new Error(`Source already registered: ${sourcePath}`);
  const source = { id: crypto.randomUUID(), path: sourcePath, kind: st.isDirectory() ? 'directory' : st.isFile() ? 'file' : st.isSymbolicLink() ? 'symlink' : 'special', addedAt: now(), readOnlyIntent: options.readOnly !== false, size: st.isFile() ? st.size : null, mode: st.mode.toString(8) };
  c.sources.push(source); await saveCase(c); await appendAudit(c._paths.caseDir, { action: 'source.add', caseId: c.id, source }); return source;
}

async function sha256File(file) { const h = crypto.createHash('sha256'); const stream = fssync.createReadStream(file); let size = 0; for await (const chunk of stream) { h.update(chunk); size += chunk.length; } return { sha256: h.digest('hex'), bytes: size }; }
async function firstBytes(file, n = 64) { const fh = await fs.open(file, 'r'); const b = Buffer.alloc(n); const { bytesRead } = await fh.read(b, 0, n, 0); await fh.close(); return b.subarray(0, bytesRead); }
function detectSignature(buf) { for (const [kind, sig, label] of SIGNATURES) if (buf.subarray(0, sig.length).equals(sig)) return { kind, label, confidence: 1 }; return null; }
function entropy(buf) { if (!buf.length) return 0; const counts = new Array(256).fill(0); for (const byte of buf) counts[byte]++; let value = 0; for (const count of counts) if (count) { const p = count / buf.length; value -= p * Math.log2(p); } return Number(value.toFixed(4)); }
function printableRatio(buf) { if (!buf.length) return 0; let printable = 0; for (const byte of buf) if (byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte < 127)) printable++; return Number((printable / buf.length).toFixed(4)); }
function embeddedSignatures(buf, max = 32) { const hits = []; for (let offset = 1; offset < buf.length && hits.length < max; offset++) for (const [kind, sig, label] of SIGNATURES) if (buf.subarray(offset, offset + sig.length).equals(sig)) { hits.push({ offset, kind, label }); break; } return hits; }
async function binaryDiagnostics(file) { const stat = await fs.stat(file); const scan = await firstBytes(file, Math.min(stat.size, 16 * 1024 * 1024)); const head = scan.subarray(0, Math.min(scan.length, 65536)); return { entropy: entropy(head), printableRatio: printableRatio(head), embeddedSignatures: embeddedSignatures(scan), likelyEncryptedOrCompressed: entropy(head) >= 7.5 && printableRatio(head) < 0.2, sampleHex: scan.subarray(0, 32).toString('hex') }; }
function extensionHint(file) { const ext = path.extname(file).toLowerCase().slice(1); return ext || null; }

async function walk(root, options = {}, out = [], seen = new Set()) {
  const st = await fs.lstat(root); const real = await fs.realpath(root).catch(() => root); if (seen.has(real)) return out; seen.add(real);
  if (st.isSymbolicLink() && !options.followSymlinks) { out.push({ path: root, type: 'symlink', size: 0, mode: st.mode.toString(8) }); return out; }
  if (!st.isDirectory()) { out.push({ path: root, type: st.isFile() ? 'file' : 'special', size: st.size, mtime: st.mtime.toISOString(), mode: st.mode.toString(8) }); return out; }
  const entries = await fs.readdir(root, { withFileTypes: true });
  for (const e of entries) await walk(path.join(root, e.name), options, out, seen);
  return out;
}

export async function inventoryCase(caseDir, options = {}) {
  const c = await loadCase(caseDir); const records = []; const errors = [];
  for (const source of c.sources) {
    let items; try { items = await walk(source.path, options); } catch (e) { errors.push({ source: source.path, error: e.message }); continue; }
    for (const item of items) {
      const rec = { sourceId: source.id, ...item };
      if (item.type === 'file') { try { Object.assign(rec, await sha256File(item.path)); const head = await firstBytes(item.path); const sig = detectSignature(head); rec.signature = sig; rec.extensionHint = extensionHint(item.path); rec.binary = await binaryDiagnostics(item.path); } catch (e) { rec.error = e.message; } }
      records.push(rec);
    }
  }
  const result = { schema: SCHEMAS.inventory, generatedAt: now(), caseId: c.id, files: records, errors, totals: { entries: records.length, files: records.filter(x => x.type === 'file').length, bytes: records.reduce((n, x) => n + (x.bytes || x.size || 0), 0), errors: errors.length + records.filter(x => x.error).length } };
  await writeJson(path.join(c._paths.reports, 'inventory.json'), result); await appendAudit(c._paths.caseDir, { action: 'inventory', caseId: c.id, totals: result.totals }); return result;
}

export async function identifyCase(caseDir) { const c = await loadCase(caseDir); const invPath = path.join(c._paths.reports, 'inventory.json'); const inv = await readJson(invPath).catch(() => inventoryCase(caseDir)); const findings = [];
  for (const f of inv.files.filter(x => x.type === 'file')) { if (f.signature) findings.push({ path: f.path, status: STATUS.RECOVERED, type: f.signature.kind, label: f.signature.label, extensionHint: f.extensionHint, note: f.extensionHint && f.extensionHint !== f.signature.kind ? 'extension/content mismatch' : null }); else { const embedded = f.binary?.embeddedSignatures || []; findings.push({ path: f.path, status: embedded.length ? STATUS.PARTIAL : STATUS.UNCERTAIN, type: embedded.length ? 'embedded-content' : 'unknown', extensionHint: f.extensionHint, embeddedSignatures: embedded, binary: f.binary, note: embedded.length ? 'Known signatures found after the file header; use carving for separate artifacts' : f.binary?.likelyEncryptedOrCompressed ? 'High-entropy opaque binary; may be compressed, encrypted, or encoded' : 'No known signature in initial bytes' }); } }
  const result = { schema: SCHEMAS.findings, generatedAt: now(), caseId: c.id, findings, summary: Object.fromEntries(Object.values(STATUS).map(s => [s, findings.filter(f => f.status === s).length])) }; await writeJson(path.join(c._paths.reports, 'findings.json'), result); await appendAudit(c._paths.caseDir, { action: 'identify', caseId: c.id, findings: findings.length }); return result;
}

function commandExists(command) { return new Promise(resolve => { let settled = false; const finish = (value) => { if (!settled) { settled = true; resolve(value); } }; const first = spawn(command, ['--version']); first.on('error', () => { const second = spawn(command, ['-v']); second.on('error', () => finish(false)); second.on('close', code => finish(code === 0)); }); first.on('close', code => { if (code === 0) finish(true); else { const second = spawn(command, ['-v']); second.on('error', () => finish(false)); second.on('close', fallbackCode => finish(fallbackCode === 0)); } }); }); }
function run(command, args, options = {}) { return new Promise((resolve, reject) => { const child = spawn(command, args, { ...options, stdio: options.stdio || ['ignore', 'pipe', 'pipe'] }); let stdout = '', stderr = ''; child.stdout?.on('data', d => stdout += d); child.stderr?.on('data', d => stderr += d); child.on('error', reject); child.on('close', code => code === 0 ? resolve({ stdout: stdout.toString(), stderr: stderr.toString() }) : reject(Object.assign(new Error(`${command} exited with ${code}: ${stderr}`), { code }))); }); }
function validateArchiveEntryName(name) { const normalized = name.replaceAll('\\', '/'); if (!normalized || normalized.startsWith('/') || /^[A-Za-z]:\//.test(normalized) || normalized.split('/').includes('..')) throw new Error(`Unsafe archive entry path: ${name}`); return normalized; }

export async function validateArchives(caseDir) { const c = await loadCase(caseDir); const inv = await readJson(path.join(c._paths.reports, 'inventory.json')).catch(() => inventoryCase(caseDir)); const archives = inv.files.filter(x => ['zip', '7z', 'rar', 'gzip', 'bzip2', 'xz', 'zstd'].includes(x.signature?.kind)); const results = [];
  for (const a of archives) { const r = { path: a.path, type: a.signature.kind, status: STATUS.UNCERTAIN }; try { if (a.signature.kind === 'zip' && await commandExists('unzip')) { const x = await run('unzip', ['-t', a.path]); r.status = STATUS.RECOVERED; r.detail = x.stdout.trim().split('\n').slice(-1)[0] || 'ZIP test passed'; } else if (a.signature.kind === '7z' && await commandExists('7z')) { await run('7z', ['t', '-bd', a.path]); r.status = STATUS.RECOVERED; r.detail = '7z test passed'; } else r.detail = 'Signature detected; native validator unavailable'; } catch (e) { r.status = STATUS.CORRUPTED; r.detail = e.message; } results.push(r); }
  const result = { schema: 'recovery.archive-validation/v1', generatedAt: now(), caseId: c.id, results, summary: Object.fromEntries(Object.values(STATUS).map(s => [s, results.filter(r => r.status === s).length])) }; await writeJson(path.join(c._paths.reports, 'archives.json'), result); await appendAudit(c._paths.caseDir, { action: 'validate.archives', caseId: c.id, count: results.length }); return result;
}

export async function extractArchives(caseDir, outputDir, options = {}) { const c = await loadCase(caseDir); const safeOutput = assertOutputSafe(c._paths.caseDir, c.sources.map(source => source.path), outputDir, options); await ensureDir(safeOutput); const inv = await readJson(path.join(c._paths.reports, 'inventory.json')).catch(() => inventoryCase(caseDir)); const results = [];
  for (const a of inv.files.filter(x => x.signature?.kind === 'zip')) { const target = path.join(safeOutput, path.basename(a.path, path.extname(a.path))); await ensureDir(target); try { const listing = await run('unzip', ['-Z1', a.path]); const entries = listing.stdout.split(/\r?\n/).filter(Boolean); entries.forEach(validateArchiveEntryName); if (entries.length > c.policy.maxArchiveEntries) throw new Error(`Archive entry limit exceeded: ${entries.length}`); await run('unzip', [options.overwrite ? '-o' : '-n', a.path, '-d', target]); results.push({ source: a.path, output: target, entries: entries.length, status: STATUS.RECOVERED }); } catch (e) { results.push({ source: a.path, output: target, status: e.message.startsWith('Unsafe archive') ? STATUS.UNSUPPORTED : STATUS.PARTIAL, error: e.message }); } }
  const result = { schema: 'recovery.extraction/v1', generatedAt: now(), caseId: c.id, results }; await writeJson(path.join(c._paths.reports, 'extraction.json'), result); await appendAudit(c._paths.caseDir, { action: 'extract.archives', caseId: c.id, count: results.length }); return result;
}

export async function carveFile(file, outputDir, options = {}) { await ensureDir(outputDir); const buf = await fs.readFile(file); const hits = []; const signatures = SIGNATURES.filter(([k]) => ['pdf', 'png', 'jpg', 'gif', 'zip', 'sqlite'].includes(k)); for (let i = 0; i < buf.length; i++) for (const [kind, sig, label] of signatures) if (buf.subarray(i, i + sig.length).equals(sig)) hits.push({ offset: i, kind, label }); const artifacts = []; const max = options.maxArtifacts || 1000; for (let i = 0; i < Math.min(hits.length, max); i++) { const h = hits[i]; const next = hits[i + 1]?.offset || buf.length; const out = path.join(outputDir, `${path.basename(file)}.offset-${h.offset}.${h.kind}`); await fs.writeFile(out, buf.subarray(h.offset, next)); artifacts.push({ source: file, output: out, offset: h.offset, bytes: next - h.offset, type: h.kind, status: STATUS.UNCERTAIN }); } return { source: file, hits: hits.length, artifacts }; }

export async function analyzeProjects(caseDir) { const c = await loadCase(caseDir); const inv = await readJson(path.join(c._paths.reports, 'inventory.json')).catch(() => inventoryCase(caseDir)); const names = new Set(inv.files.map(x => path.basename(x.path))); const projects = []; const markers = [['Python', ['pyproject.toml', 'requirements.txt', 'setup.py', 'Pipfile']], ['Rust', ['Cargo.toml', 'Cargo.lock']], ['Node.js/TypeScript', ['package.json', 'tsconfig.json']]]; for (const [language, files] of markers) { const found = files.filter(x => names.has(x)); if (found.length) projects.push({ language, markers: found, confidence: found.length > 1 ? 'high' : 'medium' }); } const result = { schema: 'recovery.projects/v1', generatedAt: now(), caseId: c.id, projects }; await writeJson(path.join(c._paths.reports, 'projects.json'), result); await appendAudit(c._paths.caseDir, { action: 'analyze.projects', caseId: c.id, count: projects.length }); return result; }

export async function verifyCase(caseDir) { const c = await loadCase(caseDir); const inv = await readJson(path.join(c._paths.reports, 'inventory.json')); const checked = []; for (const f of inv.files.filter(x => x.type === 'file' && x.sha256)) { try { const actual = await sha256File(f.path); checked.push({ path: f.path, expected: f.sha256, actual: actual.sha256, ok: actual.sha256 === f.sha256 }); } catch (e) { checked.push({ path: f.path, ok: false, error: e.message }); } } const result = { schema: SCHEMAS.verification, generatedAt: now(), caseId: c.id, checked, ok: checked.every(x => x.ok), totals: { checked: checked.length, failed: checked.filter(x => !x.ok).length } }; await writeJson(path.join(c._paths.reports, 'verification.json'), result); await appendAudit(c._paths.caseDir, { action: 'verify', caseId: c.id, ok: result.ok }); return result; }

export async function verifyAudit(caseDir) { const c = await loadCase(caseDir); const file = path.join(c._paths.logs, 'audit.ndjson'); const lines = (await fs.readFile(file, 'utf8').catch(error => error.code === 'ENOENT' ? '' : Promise.reject(error))).trim().split('\n').filter(Boolean); let previous = 'GENESIS'; const checked = []; for (const line of lines) { const record = JSON.parse(line); const expected = record.recordHash; const copy = { ...record }; delete copy.recordHash; const actual = crypto.createHash('sha256').update(JSON.stringify(copy)).digest('hex'); const ok = record.previousHash === previous && actual === expected; checked.push({ time: record.time, action: record.action, ok }); previous = expected; } const result = { schema: 'recovery.audit-verification/v1', generatedAt: now(), caseId: c.id, ok: checked.every(x => x.ok), records: checked.length, checked }; await writeJson(path.join(c._paths.reports, 'audit-verification.json'), result); return result; }

export async function doctor() { const tools = {}; for (const x of ['unzip', '7z', 'tar', 'file']) tools[x] = await commandExists(x); return { schema: 'recovery.doctor/v1', version: VERSION, node: process.version, platform: process.platform, arch: process.arch, tools, capabilities: { hashing: true, inventory: true, signatures: true, zipValidation: tools.unzip, zipExtraction: tools.unzip, carving: true, projectAnalysis: true, rawDeviceImaging: false, cloudConnectors: false, nativeRustAccelerator: false } }; }

export async function report(caseDir) { const c = await loadCase(caseDir); const files = await fs.readdir(c._paths.reports).catch(() => []); const sections = {}; for (const f of files.filter(x => x.endsWith('.json'))) sections[f] = await readJson(path.join(c._paths.reports, f)); const out = { schema: SCHEMAS.report, generatedAt: now(), case: { id: c.id, createdAt: c.createdAt, sources: c.sources }, sections }; validateDocument('report', out); await writeJson(path.join(c._paths.reports, 'final-report.json'), out); return out; }
