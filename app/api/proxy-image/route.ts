import { NextResponse } from "next/server"

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const ORG = process.env.GITHUB_ORG
const REPO = process.env.GITHUB_REPO
const BRANCH = process.env.GITHUB_BRANCH || "main"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const path = searchParams.get("path") // e.g. assets/banner.png

  if (!path) {
    return NextResponse.json({ error: "Missing 'path' parameter" }, { status: 400 })
  }

  try {
    const apiUrl = `https://api.github.com/repos/${ORG}/${REPO}/contents/${path}?ref=${BRANCH}`

    const res = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3.raw",
      },
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `GitHub API ${res.status}: ${text}` },
        { status: res.status }
      )
    }

    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get("content-type") || "image/png"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Proxy fetch failed" },
      { status: 500 }
    )
  }
}
