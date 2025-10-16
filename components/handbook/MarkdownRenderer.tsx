"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"

const ORG = process.env.NEXT_PUBLIC_GITHUB_ORG
const REPO = process.env.NEXT_PUBLIC_GITHUB_REPO
const BRANCH = process.env.NEXT_PUBLIC_GITHUB_BRANCH

// Base URLs
const RAW_BASE = `https://raw.githubusercontent.com/${ORG}/${REPO}/${BRANCH}/`
const BLOB_BASE = `https://github.com/${ORG}/${REPO}/blob/${BRANCH}/`

/**
 * Fix image paths so all Markdown images render correctly
 * Handles:
 * - Relative paths: assets/img.png
 * - Broken raw.githubusercontent URLs
 * - GitHub web-uploaded assets (require ?raw=true)
 */
function fixImageUrls(markdown: string) {
  if (!markdown) return ""

  // Relative paths -> proxy
  markdown = markdown.replace(
    /!\[([^\]]*)\]\((?!https?:\/\/)(\/?[^)]+)\)/g,
    (match, alt, src) => {
      const cleanSrc = src.replace(/^\.\//, "").replace(/^\/+/, "")
      return `![${alt}](/api/proxy-image?path=${encodeURIComponent(cleanSrc)})`
    }
  )

  // GitHub blob/raw links -> extract path -> proxy
  markdown = markdown.replace(
    /!\[([^\]]*)\]\(https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/[^/]+\/([^)]+)\)/g,
    (match, alt, path) => {
      return `![${alt}](/api/proxy-image?path=${encodeURIComponent(path)})`
    }
  )

  return markdown
}


export default function MarkdownRenderer({
  text,
  fontSize,
}: {
  text: string
  fontSize: "sm" | "base" | "lg" | "xl"
}) {
  const sizeClass =
    fontSize === "sm"
      ? "prose-sm"
      : fontSize === "lg"
      ? "prose-lg"
      : fontSize === "xl"
      ? "prose-xl"
      : "prose"

  const processedText = fixImageUrls(text)

  return (
    <article
      className={`${sizeClass} max-w-none dark:prose-invert
      prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400
      prose-code:text-[0.9em] prose-code:font-mono prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5
      prose-code:bg-[#f3f4f6] dark:prose-code:bg-[#303338] prose-code:text-gray-800 dark:prose-code:text-gray-100
      prose-p:leading-relaxed prose-img:rounded-xl prose-img:shadow-sm prose-img:my-4`}
    >
      <style jsx global>{`
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
        img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          transition: opacity 0.3s ease;
          opacity: 0;
        }
        img.loaded {
          opacity: 1;
        }
      `}</style>

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeHighlight]}
        components={{
          img({ node, ...props }) {
            return (
              <img
                {...props}
                onLoad={(e) => e.currentTarget.classList.add("loaded")}
                alt={props.alt || ""}
              />
            )
          },
        }}
      >
        {processedText}
      </ReactMarkdown>
    </article>
  )
}
