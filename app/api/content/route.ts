import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import matter from "gray-matter"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  const url = new URL(req.url)
  const org = url.searchParams.get("org")
  const repo = url.searchParams.get("repo")
  const path = url.searchParams.get("path") || ""
  const branch = url.searchParams.get("branch") || "main"

  if (!org || !repo || !path) {
    return NextResponse.json({ error: "Missing org/repo/path" }, { status: 400 })
  }

  // Check repo visibility to know if anonymous access is allowed
  const repoRes = await fetch(`https://api.github.com/repos/${org}/${repo}`, {
    headers: { 
      Accept: "application/vnd.github+json",
      ...(session?.accessToken ? { Authorization: `Bearer ${(session as any).accessToken}` } : {}),
    },
    cache: "no-store",
  })
  if (!repoRes.ok) {
    return NextResponse.json({ error: "Repo not found or no access" }, { status:  repoRes.status })
  }
  const repoJson = await repoRes.json()
  const repoIsPrivate = !!repoJson.private

  // Fetch the file content (use session token if present, else anonymous for public repos)
  const fileRes = await fetch(`https://api.github.com/repos/${org}/${repo}/contents/${path}?ref=${branch}`, {
    headers: { 
      Accept: "application/vnd.github+json",
      ...(session?.accessToken ? { Authorization: `Bearer ${(session as any).accessToken}` } : {}),
    },
    cache: "no-store",
  })

  if (!fileRes.ok) {
    return NextResponse.json({ error: "File not accessible" }, { status: fileRes.status })
  }

  const fileJson = await fileRes.json() as any
  if (Array.isArray(fileJson) || fileJson.type !== "file" || !fileJson.content) {
    return NextResponse.json({ error: "Not a file" }, { status: 400 })
  }

  // Decode Base64 content
  const raw = Buffer.from(fileJson.content, "base64").toString("utf8")
  const { data: frontmatter, content } = matter(raw)

  // Enforce ACL using frontmatter + GitHub identity
  const visibility = (frontmatter?.visibility || "public") as string
  const needAuth = repoIsPrivate || visibility !== "public"

  if (needAuth && !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session && (visibility === "org" || visibility === "restricted")) {
    // Verify org membership
    const login = (session.user as any)?.login
    const memRes = await fetch(`https://api.github.com/orgs/${org}/members/${login}`, {
      headers: { Authorization: `Bearer ${(session as any).accessToken}` },
      cache: "no-store",
    })
    if (!memRes.ok) {
      return NextResponse.json({ error: "Forbidden (org)" }, { status: 403 })
    }

    // If restricted, check team slugs
    if (visibility === "restricted" && Array.isArray(frontmatter?.teams) && frontmatter.teams.length) {
      const teamsRes = await fetch("https://api.github.com/user/teams", {
        headers: { Authorization: `Bearer ${(session as any).accessToken}` },
        cache: "no-store",
      })
      const teams = await teamsRes.json()
      const userTeamSlugs = (teams || []).filter((t: any) => (t.organization?.login === org)).map((t: any) => t.slug)
      const allowed = (frontmatter.teams as string[]).some((t: string) => userTeamSlugs.includes(t))
      if (!allowed) {
        return NextResponse.json({ error: "Forbidden (team)" }, { status: 403 })
      }
    }
  }

  // Grab latest commit for author/date
  const commitRes = await fetch(`https://api.github.com/repos/${org}/${repo}/commits?path=${encodeURIComponent(path)}&per_page=1`, {
    headers: { 
      Accept: "application/vnd.github+json",
      ...(session?.accessToken ? { Authorization: `Bearer ${(session as any).accessToken}` } : {}),
    },
    cache: "no-store",
  })
  let author: any = null
  if (commitRes.ok) {
    const commits = await commitRes.json()
    if (Array.isArray(commits) && commits.length > 0) {
      const c = commits[0]
      author = {
        name: c.commit?.author?.name,
        date: c.commit?.author?.date,
      }
    }
  }

  return NextResponse.json({
    content,
    frontmatter,
    author,
  })
}
