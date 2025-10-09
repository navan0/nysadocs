"use client"

import React, { useState } from "react"
import { FileText, Folder, FolderOpen } from "lucide-react"
import { useRouter } from "next/navigation"

type RepoFile = {
  name: string
  path: string
  download_url: string | null
  type: "file" | "dir"
  children?: RepoFile[]
}

interface SidebarProps {
  files: RepoFile[]
  currentFile: string | null
  loadFile: (path: string) => void
  sidebarOpen: boolean
  setSidebarOpen: (v: boolean) => void
  blogMode: boolean
}

export default function Sidebar({
  files,
  currentFile,
  loadFile,
  sidebarOpen,
  setSidebarOpen,
  blogMode,
}: SidebarProps) {
  const router = useRouter()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r border-gray-300 dark:border-gray-700 p-4 overflow-y-auto">
        <h2 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-300">Files</h2>
        <ul className="space-y-1">
          {files.map((item) => (
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
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64 bg-background border-r border-gray-300 dark:border-gray-700 p-4 overflow-y-auto">
            <h2 className="text-sm font-semibold mb-3 text-gray-600 dark:text-gray-300">Files</h2>
            <ul className="space-y-1">
              {files.map((item) => (
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
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}
    </>
  )
}

/* ---------- Sidebar Item ---------- */
function SidebarItem({
  item,
  currentFile,
  loadFile,
  blogMode,
  router,
}: {
  item: RepoFile
  currentFile: string | null
  loadFile: (path: string) => void
  blogMode: boolean
  router: any
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
