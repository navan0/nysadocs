"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Head from "next/head"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Loader2,
  Moon,
  Sun,
  FileText,
  BookOpen,
  Folder,
  FolderOpen,
  Minus,
  Plus,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

// ---------- Types ----------
type RepoFile = {
  name: string
  path: string
  download_url: string | null
  type: "file" | "dir"
  children?: RepoFile[]
}

const REPO = "nysa-garage/developer-handbook"
const BRANCH = "main"
const API_URL = `https://api.github.com/repos/${REPO}/contents/`
const RAW_URL = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/`

export default function Page() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const blogMode = searchParams.get("mode") === "blog"
  const fileFromURL = searchParams.get("file")

  const [isDark, setIsDark] = useState(false)
  const [files, setFiles] = useState<RepoFile[]>([])
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [content, setContent] = useState<string>("")
  const [author, setAuthor] = useState<{ name: string; date: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark")
    else document.documentElement.classList.remove("dark")
  }, [isDark])

  useEffect(() => {
    async function fetchFilesRecursive(path = ""): Promise<RepoFile[]> {
      const res = await fetch(API_URL + path + "?ref=" + BRANCH)
      const data = await res.json()
      if (!Array.isArray(data)) return []
      const results: RepoFile[] = await Promise.all(
        data.map(async (item) => {
          if (item.type === "dir") {
            const children = await fetchFilesRecursive(item.path)
            return { ...item, children }
          } else return item
        })
      )
      return results
    }

    async function init() {
      const structure = await fetchFilesRecursive()
      setFiles(structure)
      if (!fileFromURL) {
        const firstFile = findFirstMarkdown(structure)
        if (firstFile) loadFile(firstFile.path)
      }
    }

    init()
  }, [])

  // Auto-load from shared link
  useEffect(() => {
    if (fileFromURL) loadFile(fileFromURL)
  }, [fileFromURL])

  async function loadFile(path: string) {
    setLoading(true)
    setCurrentFile(path)
    setAuthor(null)
    try {
      const res = await fetch(RAW_URL + path)
      const text = await res.text()
      setContent(text)

      // Author info
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
      setSidebarOpen(false)
    }
  }

  function findFirstMarkdown(tree: RepoFile[]): RepoFile | null {
    for (const node of tree) {
      if (node.type === "file" && node.name.endsWith(".md")) return node
      if (node.type === "dir" && node.children) {
        const found = findFirstMarkdown(node.children)
        if (found) return found
      }
    }
    return null
  }

  function increaseFont() {
    setFontSize((p) =>
      p === "sm" ? "base" : p === "base" ? "lg" : p === "lg" ? "xl" : "xl"
    )
  }
  function decreaseFont() {
    setFontSize((p) =>
      p === "xl" ? "lg" : p === "lg" ? "base" : p === "base" ? "sm" : "sm"
    )
  }

  const toggleBlogMode = () => {
    const params = new URLSearchParams(searchParams)
    if (blogMode) params.delete("mode")
    else params.set("mode", "blog")
    router.push("?" + params.toString())
  }

  return (
    <>
      <Head>
        <title>
          {currentFile
            ? `${currentFile.replace(".md", "")} | Developer Handbook`
            : "Developer Handbook"}
        </title>
        <meta
          name="description"
          content={`Read ${currentFile || "documentation"} from the Developer Handbook`}
        />
      </Head>

      <div
        className={`${plusJakarta.className} min-h-screen bg-[#fdfdf8] dark:bg-[#111b21]`}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-gray-300 dark:border-gray-700 bg-background/90 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
            <div className="flex items-center gap-2">
              {!blogMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  aria-label="Toggle menu"
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              )}
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#128C7E]/20 text-[#128C7E] border border-[#128C7E]">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="text-lg font-semibold">Developer Handbook</span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              {!blogMode && (
                <>
                  <Button variant="outline" size="icon" onClick={decreaseFont}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={increaseFont}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="outline" size="icon" onClick={toggleBlogMode}>
                {blogMode ? <ArrowLeft className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
              </Button>
              <ThemeSwitch isDark={isDark} onToggle={() => setIsDark((v) => !v)} />
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-6xl">
          {/* Sidebar */}
          {!blogMode && (
            <>
              <aside className="hidden md:block w-64 border-r border-gray-300 dark:border-gray-700 p-4 overflow-y-auto">
                <Sidebar
                  files={files}
                  currentFile={currentFile}
                  loadFile={loadFile}
                  blogMode={blogMode}
                  router={router}
                />
              </aside>

              {sidebarOpen && (
                <div className="fixed inset-0 z-50 flex">
                  <div className="w-64 bg-background border-r border-gray-300 dark:border-gray-700 p-4 overflow-y-auto">
                    <Sidebar
                      files={files}
                      currentFile={currentFile}
                      loadFile={loadFile}
                      blogMode={blogMode}
                      router={router}
                    />
                  </div>
                  <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
                </div>
              )}
            </>
          )}

          {/* Content */}
          <main
            className={`flex-1 p-6 overflow-y-auto transition-all ${
              blogMode ? "max-w-3xl mx-auto py-10" : ""
            }`}
          >
            <Card
              className={`rounded-2xl border border-gray-300 dark:border-gray-700 shadow-sm ${
                blogMode ? "shadow-none border-none" : ""
              }`}
            >
              <CardHeader>
                {!blogMode && (
                  <CardTitle className="text-lg font-semibold">
                    {currentFile || "Select a file"}
                  </CardTitle>
                )}
                {author && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Written by <span className="font-medium">{author.name}</span> • {author.date}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#128C7E]" />
                  </div>
                ) : (
                  <Markdown text={content} fontSize={fontSize} />
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </>
  )
}

/* ---------- Sidebar ---------- */
function Sidebar({ files, currentFile, loadFile, blogMode, router }: any) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-300">Files</h2>
      <ul className="space-y-1">
        {files.map((item: RepoFile) => (
          <SidebarItem
            key={item.path}
            item={item}
            currentFile={currentFile}
            loadFile={loadFile}
            blogMode={blogMode}
            router={router}
          />
        ))}
      </ul>
    </div>
  )
}

/* ---------- Sidebar Item ---------- */
function SidebarItem({ item, currentFile, loadFile, blogMode, router }: any) {
  const [open, setOpen] = useState(false)
  if (item.type === "dir") {
    return (
      <li>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-foreground"
        >
          {open ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
          <span className="truncate">{item.name}</span>
        </button>
        {open && item.children && (
          <ul className="ml-4 mt-1 border-l border-gray-200 dark:border-gray-700 pl-2 space-y-1">
            {item.children.map((child: RepoFile) => (
              <SidebarItem
                key={child.path}
                item={child}
                currentFile={currentFile}
                loadFile={loadFile}
                blogMode={blogMode}
                router={router}
              />
            ))}
          </ul>
        )}
      </li>
    )
  }
  if (!item.name.endsWith(".md")) return null
  return (
    <li>
      <button
        onClick={() => {
          router.push(`/?file=${encodeURIComponent(item.path)}${blogMode ? "&mode=blog" : ""}`)
          loadFile(item.path)
        }}
        className={`flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm font-medium ${
          currentFile === item.path
            ? "bg-accent text-accent-foreground"
            : "hover:bg-muted hover:text-foreground"
        }`}
      >
        <FileText className="h-4 w-4 shrink-0" />
        <span className="truncate">{item.name}</span>
      </button>
    </li>
  )
}

/* ---------- Markdown Renderer ---------- */
function Markdown({ text, fontSize }: { text: string; fontSize: "sm" | "base" | "lg" | "xl" }) {
  const sizeClass =
    fontSize === "sm"
      ? "prose-sm"
      : fontSize === "lg"
      ? "prose-lg"
      : fontSize === "xl"
      ? "prose-xl"
      : "prose"

  return (
    <article
      className={`${sizeClass} max-w-none dark:prose-invert
      prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400
      prose-code:text-[0.9em] prose-code:font-mono prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5
      prose-code:bg-[#f3f4f6] dark:prose-code:bg-[#303338] prose-code:text-gray-800 dark:prose-code:text-gray-100
      prose-p:leading-relaxed prose-img:rounded-xl`}
    >
      <style jsx global>{`
        /* Full code block */
        pre {
          background: #1e1f22;
          border-radius: 1rem;
          padding: 1.2rem 1.5rem;
          overflow-x: auto;
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1),
            0 2px 20px rgba(0, 0, 0, 0.35);
          margin: 1.5rem 0;
          transition: background 0.2s ease;
        }
        pre:hover {
          background: #232427;
        }
        pre code {
          background: transparent !important;
          color: #e9ecef !important;
          font-family: "JetBrains Mono", monospace;
          font-size: 0.9em;
          line-height: 1.65;
          display: block;
          white-space: pre;
        }

        /* Inline code */
        code:not(pre code) {
          background: #f3f4f6;
          color: #111827;
          border-radius: 0.375rem;
          padding: 0.15rem 0.4rem;
          font-weight: 500;
        }
        html.dark code:not(pre code) {
          background: #303338;
          color: #f5f5f5;
        }
      `}</style>

      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight]}>
        {text}
      </ReactMarkdown>
    </article>
  )
}


/* ---------- Theme Switch ---------- */
function ThemeSwitch({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={onToggle}
      aria-label="Toggle theme"
      className="h-8 w-8 border"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
