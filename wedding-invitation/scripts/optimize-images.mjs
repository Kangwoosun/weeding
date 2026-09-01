import { mkdir, readdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "..")
const sourceDir = path.join(projectRoot, "src", "images")
const outputDir = path.join(sourceDir, "optimized")

const variants = [
  { name: "thumb", width: 600, quality: 72 },
  { name: "medium", width: 1200, quality: 78 },
  { name: "large", width: 2400, quality: 82 },
]

const sourceFiles = (await readdir(sourceDir))
  .filter((file) => /^cover\.jpg$|^image\d+\.jpg$/.test(file))
  .sort((a, b) => {
    if (a === "cover.jpg") return -1
    if (b === "cover.jpg") return 1
    return Number(a.match(/\d+/)?.[0] ?? 0) - Number(b.match(/\d+/)?.[0] ?? 0)
  })

if (sourceFiles.length === 0) {
  throw new Error(`No source JPG files found in ${sourceDir}`)
}

await mkdir(outputDir, { recursive: true })

for (const file of sourceFiles) {
  const name = path.basename(file, ".jpg")
  const input = path.join(sourceDir, file)

  for (const variant of variants) {
    const output = path.join(outputDir, `${name}-${variant.name}.webp`)
    await sharp(input)
      .rotate()
      .resize({
        width: variant.width,
        withoutEnlargement: true,
      })
      .webp({
        quality: variant.quality,
        effort: 5,
      })
      .toFile(output)

    console.log(`${path.relative(projectRoot, output)}`)
  }
}
