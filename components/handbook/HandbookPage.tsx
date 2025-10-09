"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Head from "next/head"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, FileText, ArrowLeft, Menu, X, Minus, Plus, Loader2 } from "lucide-react"
import Sidebar from "./Sidebar"
import MarkdownRenderer from "./MarkdownRenderer"
import ThemeSwitch from "./ThemeSwitch"
import { useRepoFiles } from "./useRepoFiles"
import { useFileContent } from "./useFileContent"
import { findFirstMarkdown } from "./utils"

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] })

export default function HandbookPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const blogMode = searchParams.get("mode") === "blog"
  const fileFromURL = searchParams.get("file")

  const [isDark, setIsDark] = useState(false)
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { files, loading: treeLoading } = useRepoFiles()
  const { content, author, loadFile, currentFile, loading: fileLoading } = useFileContent()

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  // Load first file
  useEffect(() => {
    if (files.length && !fileFromURL) {
      const first = findFirstMarkdown(files)
      if (first) loadFile(first.path)
    }
  }, [files])

  // Load file from URL
  useEffect(() => {
    if (fileFromURL) loadFile(fileFromURL)
  }, [fileFromURL])

  const toggleBlogMode = () => {
    const params = new URLSearchParams(searchParams)
    if (blogMode) params.delete("mode")
    else params.set("mode", "blog")
    router.push(`/?${params.toString()}`)
  }

  const increaseFont = () =>
    setFontSize((p) => (p === "sm" ? "base" : p === "base" ? "lg" : p === "lg" ? "xl" : "xl"))
  const decreaseFont = () =>
    setFontSize((p) => (p === "xl" ? "lg" : p === "lg" ? "base" : p === "base" ? "sm" : "sm"))

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
          content={
            author
              ? `Written by ${author.name} on ${author.date}`
              : `Read ${currentFile || "documentation"} from the Developer Handbook`
          }
        />
      </Head>

      <div className={`${plusJakarta.className} min-h-screen bg-[#fdfdf8] dark:bg-[#111b21]`}>
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
                >
                  {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              )}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#128C7E]/20 text-[#128C7E] border border-[#128C7E]">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="text-lg font-semibold">Developer Handbook</span>
              </div>
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
              <ThemeSwitch isDark={isDark} onToggle={() => setIsDark(!isDark)} />
            </div>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-6xl">
          {/* Sidebar */}
          {!blogMode && (
            <Sidebar
              files={files}
              currentFile={currentFile}
              loadFile={loadFile}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              blogMode={blogMode}
            />
          )}

          {/* Content */}
          <main className={`flex-1 p-6 overflow-y-auto ${blogMode ? "max-w-3xl mx-auto py-10" : ""}`}>
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
                {fileLoading || treeLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#128C7E]" />
                  </div>
                ) : (
                  <MarkdownRenderer text={content} fontSize={fontSize} />
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </>
  )
}
