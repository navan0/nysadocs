"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
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
  const [isDark, setIsDark] = useState(false)
  const [files, setFiles] = useState<RepoFile[]>([])
  const [currentFile, setCurrentFile] = useState<string | null>(null)
  const [content, setContent] = useState<string>("")
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
          } else {
            return item
          }
        })
      )
      return results
    }

    async function init() {
      const structure = await fetchFilesRecursive()
      setFiles(structure)
      // auto-load first file found
      const firstFile = findFirstMarkdown(structure)
      if (firstFile) loadFile(firstFile.path)
    }

    init()
  }, [])

  async function loadFile(path: string) {
    setLoading(true)
    setCurrentFile(path)
    try {
      const res = await fetch(RAW_URL + path)
      const text = await res.text()
      setContent(text)
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

  return (
    <div
      className={`${plusJakarta.className} min-h-screen bg-[#fdfdf8] dark:bg-[#111b21]`}
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-300 dark:border-gray-700 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#128C7E]/20 text-[#128C7E] border border-[#128C7E]">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-lg font-semibold">Developer Handbook</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={decreaseFont}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={increaseFont}>
              <Plus className="h-4 w-4" />
            </Button>
            <ThemeSwitch isDark={isDark} onToggle={() => setIsDark((v) => !v)} />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl">
        {/* Sidebar for desktop */}
        <aside className="hidden md:block w-64 border-r border-gray-300 dark:border-gray-700 p-4 overflow-y-auto">
          <Sidebar files={files} currentFile={currentFile} loadFile={loadFile} />
        </aside>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="w-64 bg-background border-r border-gray-300 dark:border-gray-700 p-4 overflow-y-auto">
              <Sidebar files={files} currentFile={currentFile} loadFile={loadFile} />
            </div>
            <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Card className="rounded-2xl border border-gray-300 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {currentFile || "Select a file"}
              </CardTitle>
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
  )
}

/* ---------- Sidebar ---------- */
function Sidebar({
  files,
  currentFile,
  loadFile,
}: {
  files: RepoFile[]
  currentFile: string | null
  loadFile: (path: string) => void
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-300">Files</h2>
      <ul className="space-y-1">
        {files.map((item) => (
          <SidebarItem
            key={item.path}
            item={item}
            currentFile={currentFile}
            loadFile={loadFile}
          />
        ))}
      </ul>
    </div>
  )
}

/* ---------- Sidebar Item (recursive) ---------- */
function SidebarItem({
  item,
  currentFile,
  loadFile,
}: {
  item: RepoFile
  currentFile: string | null
  loadFile: (path: string) => void
}) {
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
            {item.children.map((child) => (
              <SidebarItem
                key={child.path}
                item={child}
                currentFile={currentFile}
                loadFile={loadFile}
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
        onClick={() => loadFile(item.path)}
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
      prose-code:bg-gray-200 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded
      prose-pre:rounded-xl prose-pre:bg-gray-900/90 prose-pre:text-gray-100 prose-img:rounded-xl`}
    >
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
