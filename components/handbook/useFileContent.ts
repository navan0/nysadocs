import { useState } from "react"

const ORG = process.env.NEXT_PUBLIC_GITHUB_ORG || process.env.GITHUB_ORG
const REPO = process.env.NEXT_PUBLIC_GITHUB_REPO || process.env.GITHUB_REPO
const BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH || process.env.GITHUB_BRANCH


export function useFileContent() {
  const [content, setContent] = useState("")
  const [frontmatter, setFrontmatter] = useState<Record<string, any>>({})
  const [author, setAuthor] = useState<{ name: string; date: string } | null>(null)
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadFile(path: string) {
    setLoading(true)
    setCurrentFile(path)
    try {
      const res = await fetch(`/api/content?org=${ORG}&repo=${REPO}&branch=${BRANCH}&path=${encodeURIComponent(path)}`, { cache: "no-store" })
      if (!res.ok) {
        setContent(`# Error\nCould not load file: ${path}`)
        setFrontmatter({})
        setAuthor(null)
        return
      }
      const data = await res.json()
      setContent(data.content || "")
      setFrontmatter(data.frontmatter || {})
      if (data.author?.name && data.author?.date) {
        const d = new Date(data.author.date)
        setAuthor({
          name: data.author.name,
          date: d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }),
        })
      } else {
        setAuthor(null)
      }
    } catch {
      setContent(`# Error\nCould not load file: ${path}`)
      setFrontmatter({})
      setAuthor(null)
    } finally {
      setLoading(false)
    }
  }

  return { content, frontmatter, author, currentFile, loadFile, loading }
}
