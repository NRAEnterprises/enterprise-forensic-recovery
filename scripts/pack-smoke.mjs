import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const root = path.resolve(new URL('..', import.meta.url).pathname);
const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'forensic-pack-smoke-'));
try {
  const packed = await exec('npm', ['pack', '--silent'], { cwd: root, encoding: 'utf8' });
  const tarball = path.resolve(root, packed.stdout.trim().split(/\r?\n/).at(-1));
  const installDir = path.join(temp, 'install');
  await fs.mkdir(installDir);
  await exec('npm', ['init', '-y'], { cwd: installDir });
  await exec('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', tarball], { cwd: installDir });
  const bin = path.join(installDir, 'node_modules', '.bin', 'recovery');
  const doctor = await exec(bin, ['doctor', '--json'], { cwd: installDir, encoding: 'utf8' });
  const doctorJson = JSON.parse(doctor.stdout);
  if (doctorJson.schema !== 'recovery.doctor/v1') throw new Error('Installed CLI returned an invalid doctor schema');
  await exec(bin, ['case', 'create', path.join(installDir, 'case')], { cwd: installDir });
  console.log(JSON.stringify({ schema: 'recovery.pack-smoke/v1', tarball: path.basename(tarball), installed: true, doctor: doctorJson.schema, caseCreated: true }));
} finally {
  await fs.rm(temp, { recursive: true, force: true });
}
