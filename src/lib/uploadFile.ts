import { writeFile } from 'fs/promises';
import path from 'path';

export async function uploadFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
  const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9-.]/g, '')}`;
  const relativePath = `/images/team/${filename}`;
  const fullPath = path.join(process.cwd(), 'public', relativePath);

  // Ensure directory exists
  const dir = path.dirname(fullPath);
  await createDirIfNotExists(dir);

  // Write file
  await writeFile(fullPath, buffer);
  return relativePath;
}

async function createDirIfNotExists(dir: string) {
  const fs = require('fs').promises;
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
} 