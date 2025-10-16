import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: { path: string[] } }) {
  const session = await getServerSession(authOptions)
  const url = new URL(req.url)
  const qp = url.searchParams.toString()
  const joined = params.path?.join("/") || ""
  const ghUrl = `https://api.github.com/${joined}${qp ? "?" + qp : ""}`

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  }
  // If logged in, use user's access token (preferred). Otherwise fall back to unauthenticated (public-only).
  if ((session as any)?.accessToken) {
    headers.Authorization = `Bearer ${(session as any).accessToken}`
  }

  const res = await fetch(ghUrl, { headers, cache: "no-store" })
  const body = await res.text()
  return new NextResponse(body, { status: res.status, headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" } })
}
