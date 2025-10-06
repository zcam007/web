import fs from 'node:fs/promises';
import path from 'node:path';

const dataDir = path.join(process.cwd(), 'data');
const dataPath = path.join(dataDir, 'site.json');

export async function readConfig() {
  const buf = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(buf);
}

export async function writeConfig(config: unknown) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(config, null, 2), 'utf-8');
}
