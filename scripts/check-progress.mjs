import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const file = path.join(root, 'IMPLEMENTATION-STATUS.md');
const text = await fs.readFile(file, 'utf8');
const implemented = (text.match(/^\| .*\| Implemented /gm) || []).length;
const marker = text.match(/Audited completion: (\d+)\/280 items \(([\d.]+)%\)/);
if (!marker) throw new Error('Missing audited completion marker');
const expectedPercent = Number(((implemented / 280) * 100).toFixed(1));
if (Number(marker[1]) !== implemented || Number(marker[2]) !== expectedPercent) {
  throw new Error(`Progress marker mismatch: marker=${marker[1]}/280 (${marker[2]}%), computed=${implemented}/280 (${expectedPercent}%)`);
}
console.log(JSON.stringify({ schema: 'recovery.progress-check/v1', implemented, total: 280, percentage: expectedPercent, markerMatches: true }));
