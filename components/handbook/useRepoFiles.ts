import { useState, useEffect } from "react"

const ORG = "nysa-garage"
const REPO = "developer-handbook"
const BRANCH = "main"

export function useRepoFiles() {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchFilesRecursive(path = ""): Promise<any[]> {
      const res = await fetch(`/api/github/repos/${ORG}/${REPO}/contents/${path}?ref=${BRANCH}`, { cache: "no-store" })
      const data = await res.json()
      if (!Array.isArray(data)) return []
      return Promise.all(
        data.map(async (item: any) => {
          if (item.type === "dir") {
            const children = await fetchFilesRecursive(item.path)
            return { ...item, children }
          } else return item
        })
      )
    }

    async function init() {
      setLoading(true)
      const structure = await fetchFilesRecursive("")
      setFiles(structure)
      setLoading(false)
    }
    init()
  }, [])

  return { files, loading }
}
