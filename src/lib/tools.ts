import { promises as fs } from 'fs'
import { join } from 'path'
import { mkdirP, rmRF } from '@actions/io'
import { exists } from '@actions/io/lib/io-util'

export async function hard_link(
  src: string,
  dest: string,
  exclude: string[] = [],
  currentPath = ''
): Promise<void> {
  const entries = await fs.readdir(src, { withFileTypes: true })

  await mkdirP(dest)

  for (const entry of entries) {
    const entryRelativePath = join(currentPath, entry.name)
    if (entry.isDirectory() && exclude.includes(entryRelativePath)) {
      continue
    }

    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)

    if (entry.isDirectory()) {
      await rmRF(destPath)
      await hard_link(srcPath, destPath, exclude, entryRelativePath)
    } else {
      if (await exists(destPath)) {
        await fs.unlink(destPath)
      }
      try {
        await fs.link(srcPath, destPath)
      } catch {
        await fs.copyFile(srcPath, destPath)
      }
    }
  }
}
