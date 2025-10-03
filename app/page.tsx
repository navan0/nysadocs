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
  Minus,
  Plus,
  Menu,
  X,
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css" // syntax highlight theme

// ---------- Font ----------
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

// ---------- Types ----------
type RepoFile = {
  name: string
  path: string
  download_url: string
  type: string
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

  // Fetch repo files on mount
  useEffect(() => {
    async function fetchFiles() {
      const res = await fetch(API_URL + "?ref=" + BRANCH)
      const data = await res.json()
      if (Array.isArray(data)) {
        const mdFiles = data.filter((f) => f.name.endsWith(".md"))
        setFiles(mdFiles)
        if (mdFiles.length > 0) loadFile(mdFiles[0].path)
      }
    }
    fetchFiles()
  }, [])

  async function loadFile(path: string) {
    setLoading(true)
    setCurrentFile(path)
    try {
      const res = await fetch(RAW_URL + path)
      const text = await res.text()
      setContent(text)
    } catch (err) {
      setContent(`# Error\nCould not load file: ${path}`)
    } finally {
      setLoading(false)
      setSidebarOpen(false) // auto close sidebar on mobile after selecting
    }
  }

  // font size handlers
  function increaseFont() {
    setFontSize((prev) =>
      prev === "sm" ? "base" : prev === "base" ? "lg" : prev === "lg" ? "xl" : "xl"
    )
  }
  function decreaseFont() {
    setFontSize((prev) =>
      prev === "xl" ? "lg" : prev === "lg" ? "base" : prev === "base" ? "sm" : "sm"
    )
  }

  return (
    <div className={`${plusJakarta.className} min-h-screen bg-[#fdfdf8] dark:bg-[#111b21]`}>
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
            <Button variant="outline" size="icon" onClick={decreaseFont} title="Decrease font">
              <Minus className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={increaseFont} title="Increase font">
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
            <div
              className="flex-1 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Card className="rounded-2xl border border-gray-300 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {currentFile ? currentFile : "Select a file"}
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
    <>
      <h2 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-300">Files</h2>
      <ul className="space-y-1">
        {files.map((f) => (
          <li key={f.path}>
            <button
              onClick={() => loadFile(f.path)}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium
                ${currentFile === f.path
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted hover:text-foreground"
                }`}
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span className="truncate">{f.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

/* ---------- Markdown renderer ---------- */
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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
      >
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
