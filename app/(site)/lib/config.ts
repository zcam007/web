import fs from 'node:fs/promises';
import path from 'node:path';

const dataPath = path.join(process.cwd(), 'data', 'site.json');

export async function readConfig() {
  const buf = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(buf);
}

export async function writeConfig(config: unknown) {
  await fs.writeFile(dataPath, JSON.stringify(config, null, 2), 'utf-8');
}
