import { useState, useEffect } from "react"

const REPO = "nysa-garage/developer-handbook"
const BRANCH = "main"
const API_URL = `https://api.github.com/repos/${REPO}/contents/`

export function useRepoFiles() {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchFilesRecursive(path = ""): Promise<any[]> {
      const res = await fetch(API_URL + path + "?ref=" + BRANCH)
      const data = await res.json()
      if (!Array.isArray(data)) return []
      return Promise.all(
        data.map(async (item) => {
          if (item.type === "dir") {
            const children = await fetchFilesRecursive(item.path)
            return { ...item, children }
          } else return item
        })
      )
    }

    async function init() {
      setLoading(true)
      const structure = await fetchFilesRecursive()
      setFiles(structure)
      setLoading(false)
    }
    init()
  }, [])

  return { files, loading }
}
