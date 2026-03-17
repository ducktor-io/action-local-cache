import { promises as fs } from 'fs'
import { join } from 'path'
import { mkdirP, rmRF } from '@actions/io'
import { exists } from '@actions/io/lib/io-util'
import { hard_link } from './tools'

describe('hard_link', () => {
  const src = join(__dirname, 'test-src')
  const dest = join(__dirname, 'test-dest')

  beforeEach(async () => {
    await rmRF(src)
    await rmRF(dest)
    await mkdirP(src)
    await mkdirP(join(src, 'dir1'))
    await mkdirP(join(src, 'dir2'))
    await mkdirP(join(src, 'dir2', 'subdir'))
    await fs.writeFile(join(src, 'file1.txt'), 'content1')
    await fs.writeFile(join(src, 'dir1', 'file2.txt'), 'content2')
    await fs.writeFile(join(src, 'dir2', 'file3.txt'), 'content3')
    await fs.writeFile(join(src, 'dir2', 'subdir', 'file4.txt'), 'content4')
  })

  afterAll(async () => {
    await rmRF(src)
    await rmRF(dest)
  })

  it('should link all files when no exclude is provided', async () => {
    await hard_link(src, dest)

    expect(await exists(join(dest, 'file1.txt'))).toBe(true)
    expect(await exists(join(dest, 'dir1', 'file2.txt'))).toBe(true)
    expect(await exists(join(dest, 'dir2', 'file3.txt'))).toBe(true)

    const content = await fs.readFile(join(dest, 'dir1', 'file2.txt'), 'utf8')
    expect(content).toBe('content2')
  })

  it('should exclude specified folders', async () => {
    await hard_link(src, dest, ['dir1'])

    expect(await exists(join(dest, 'file1.txt'))).toBe(true)
    expect(await exists(join(dest, 'dir1'))).toBe(false)
    expect(await exists(join(dest, 'dir2', 'file3.txt'))).toBe(true)
  })

  it('should exclude specified nested folders', async () => {
    await hard_link(src, dest, [join('dir2', 'subdir')])

    expect(await exists(join(dest, 'file1.txt'))).toBe(true)
    expect(await exists(join(dest, 'dir1', 'file2.txt'))).toBe(true)
    expect(await exists(join(dest, 'dir2', 'file3.txt'))).toBe(true)
    expect(await exists(join(dest, 'dir2', 'subdir'))).toBe(false)
  })
})
