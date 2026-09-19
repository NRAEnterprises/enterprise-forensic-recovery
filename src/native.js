import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

async function executable(file) { try { await fs.access(file); return true; } catch { return false; } }
export async function findNativeBinary() {
  const packageBinary = path.resolve(new URL('../native/bin/', import.meta.url).pathname, `${process.platform}-${process.arch}`, process.platform === 'win32' ? 'recovery-native.exe' : 'recovery-native');
  const candidates = [process.env.RECOVERY_NATIVE_BIN, packageBinary, path.resolve(process.cwd(), 'native/bin', `${process.platform}-${process.arch}`, process.platform === 'win32' ? 'recovery-native.exe' : 'recovery-native'), path.resolve(process.cwd(), 'native/recovery-native/target/release/recovery-native'), path.resolve(process.cwd(), 'native/recovery-native/target/debug/recovery-native')].filter(Boolean);
  for (const candidate of candidates) if (await executable(candidate)) return candidate;
  return null;
}
export async function runNativeImage(binary, source, output, options = {}) {
  const args = ['image', source, output]; if (options.resume) args.push('--resume'); if (options.offset != null) args.push('--offset', String(options.offset));
  return new Promise((resolve, reject) => { const child = spawn(binary, args, { stdio: ['ignore', 'pipe', 'pipe'] }); let stdout = '', stderr = ''; child.stdout.on('data', chunk => stdout += chunk); child.stderr.on('data', chunk => stderr += chunk); child.on('error', reject); child.on('close', code => { let parsed; try { parsed = JSON.parse(stdout); } catch { parsed = { stdout, stderr }; } if (code === 0 || code === 2) resolve({ ...parsed, nativeExitCode: code }); else reject(new Error(`Native imaging failed (${code}): ${stderr || stdout}`)); }); });
}
