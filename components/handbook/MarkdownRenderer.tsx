"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"

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

  return (
    <article
      className={`${sizeClass} max-w-none dark:prose-invert
      prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400
      prose-code:text-[0.9em] prose-code:font-mono prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5
      prose-code:bg-[#f3f4f6] dark:prose-code:bg-[#303338] prose-code:text-gray-800 dark:prose-code:text-gray-100
      prose-p:leading-relaxed prose-img:rounded-xl`}
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
      `}</style>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeHighlight]}>
        {text}
      </ReactMarkdown>
    </article>
  )
}
