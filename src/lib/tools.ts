import { promises as fs } from 'fs'
import { join } from 'path'
import { mkdirP } from '@actions/io'

export async function hard_link(src: string, dest: string): Promise<void> {
  const entries = await fs.readdir(src, { withFileTypes: true })

  await mkdirP(dest)

  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    if (entry.isDirectory()) {
      await hard_link(srcPath, destPath)
    } else {
      await fs.link(srcPath, destPath)
    }
  }
}
