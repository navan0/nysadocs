"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Head from "next/head"
import { Plus_Jakarta_Sans } from "next/font/google"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BookOpen,
  FileText,
  ArrowLeft,
  Menu,
  X,
  Minus,
  Plus,
  Loader2,
} from "lucide-react"
import Sidebar from "./Sidebar"
import MarkdownRenderer from "./MarkdownRenderer"
import ThemeSwitch from "./ThemeSwitch"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRepoFiles } from "./useRepoFiles"
import { useFileContent } from "./useFileContent"
import { findFirstMarkdown } from "./utils"

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export default function HandbookPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const blogMode = searchParams.get("mode") === "blog"
  const fileFromURL = searchParams.get("file")

  const [isDark, setIsDark] = useState(false)
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)

  const { files, loading: treeLoading } = useRepoFiles()
  const { content, author, loadFile, currentFile, loading: fileLoading } = useFileContent()
  const { data: session } = useSession()

  const isLoading = treeLoading || fileLoading

  // ---------- THEME ----------
  useEffect(() => {
    const saved = localStorage.getItem("theme")
    if (saved) {
      document.documentElement.classList.toggle("dark", saved === "dark")
      setIsDark(saved === "dark")
    } else {
      const prefersDark =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDark(prefersDark)
      document.documentElement.classList.toggle("dark", prefersDark)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
    localStorage.setItem("theme", isDark ? "dark" : "light")
  }, [isDark])

  // ---------- INITIAL LOAD ----------
  useEffect(() => {
    // After first data fetch settles (whether empty or not)
    if (!treeLoading) {
      const timeout = setTimeout(() => setInitialLoad(false), 150)
      return () => clearTimeout(timeout)
    }
  }, [treeLoading])

  // ---------- AUTO-LOAD FILE ----------
  useEffect(() => {
    if (files.length && !fileFromURL) {
      const first = findFirstMarkdown(files)
      if (first) loadFile(first.path)
    }
  }, [files])

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

      <div
        className={`${plusJakarta.className} min-h-screen bg-[#fdfdf8] dark:bg-[#111b21] transition-colors`}
      >
        {/* ---------- GLOBAL OVERLAY (SIGN-IN REDIRECT) ---------- */}
        {signingIn && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-black/40 backdrop-blur-md">
            <div className="flex flex-col items-center gap-3 animate-fade-in">
              <Loader2 className="h-8 w-8 animate-spin text-[#128C7E]" />
              <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">
                Redirecting to GitHub…
              </p>
            </div>
          </div>
        )}

        {/* ---------- INITIAL LOADER (FIRST LOAD) ---------- */}
        {initialLoad && (
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#fdfdf8] dark:bg-[#111b21] z-40">
            <Loader2 className="h-8 w-8 animate-spin text-[#128C7E]" />
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">Loading handbook…</p>
          </div>
        )}

        {/* ---------- HEADER ---------- */}
        <header className="sticky top-0 z-30 border-b border-gray-300 dark:border-gray-700 bg-background/90 backdrop-blur">
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

              {session ? (
                <Button variant="outline" onClick={() => signOut()}>
                  Sign out
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled={signingIn}
                  onClick={() => {
                    setSigningIn(true)
                    setTimeout(() => {
                      signIn("github", { callbackUrl: window.location.href })
                    }, 100)
                  }}
                >
                  {signingIn ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Sign in with GitHub"
                  )}
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* ---------- MAIN LAYOUT ---------- */}
        {!initialLoad && (
          <div className="mx-auto flex w-full max-w-6xl animate-fade-in">
            {/* Empty / Private Repo */}
            {!isLoading && (!files || files.length === 0) ? (
              <main className="flex-1 flex flex-col items-center justify-center text-center py-40 bg-white/60 dark:bg-[#111b21]/50 backdrop-blur rounded-2xl mx-6 shadow-sm">
                <BookOpen className="h-10 w-10 text-[#128C7E] mb-3" />
                <h1 className="text-xl font-semibold mb-2">Welcome to Developer Handbook</h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mb-6">
                  Connect your GitHub repository to start publishing internal docs and blogs.
                </p>
                {!session && (
                  <Button
                    disabled={signingIn}
                    onClick={() => {
                      setSigningIn(true)
                      setTimeout(() => {
                        signIn("github", { callbackUrl: window.location.href })
                      }, 100)
                    }}
                    className="bg-[#128C7E] text-white hover:bg-[#0f7a6d]"
                  >
                    {signingIn ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing in…
                      </>
                    ) : (
                      "Sign in with GitHub"
                    )}
                  </Button>
                )}
              </main>
            ) : (
              <>
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
                          Written by{" "}
                          <span className="font-medium">{author.name}</span> • {author.date}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      {fileLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-[#128C7E]" />
                        </div>
                      ) : (
                        <MarkdownRenderer text={content} fontSize={fontSize} />
                      )}
                    </CardContent>
                  </Card>
                </main>
              </>
            )}
          </div>
        )}
      </div>
    </>
  )
}
