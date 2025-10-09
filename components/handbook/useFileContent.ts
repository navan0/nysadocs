import { useState } from "react"

const REPO = "nysa-garage/developer-handbook"
const BRANCH = "main"
const RAW_URL = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/`

export function useFileContent() {
  const [content, setContent] = useState("")
  const [author, setAuthor] = useState<{ name: string; date: string } | null>(null)
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadFile(path: string) {
    setLoading(true)
    setCurrentFile(path)
    try {
      const res = await fetch(RAW_URL + path)
      const text = await res.text()
      setContent(text)

      const commitRes = await fetch(
        `https://api.github.com/repos/${REPO}/commits?path=${path}&per_page=1`
      )
      const commits = await commitRes.json()
      if (Array.isArray(commits) && commits.length > 0) {
        const commit = commits[0]
        const name = commit.commit.author.name
        const date = new Date(commit.commit.author.date).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
        setAuthor({ name, date })
      }
    } catch {
      setContent(`# Error\nCould not load file: ${path}`)
    } finally {
      setLoading(false)
    }
  }

  return { content, author, currentFile, loadFile, loading }
}
