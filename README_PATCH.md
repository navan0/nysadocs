# Nysa Docs: GitHub-Native Upgrade (No Backend / No DB)

This patch adds:
- GitHub OAuth login (NextAuth)
- A GitHub API proxy route (`/api/github/*`) so the client never leaks tokens
- A secure content route (`/api/content`) that enforces access via frontmatter + GitHub org/team membership
- Frontmatter-based SEO (title/description) and social cards
- SessionProvider wiring without converting your layout to a client component

## 1) Install Dependencies

```bash
npm install next-auth @auth/core @auth/github gray-matter
```

## 2) Environment Variables

Create `.env.local`:

```
GITHUB_CLIENT_ID=YOUR_CLIENT_ID
GITHUB_CLIENT_SECRET=YOUR_CLIENT_SECRET
NEXTAUTH_SECRET=YOUR_RANDOM_SECRET
```

> Note: You **do not** need a server token; this uses each user's GitHub OAuth access token.

## 3) File Map Added/Changed

**Added**
- `lib/auth.ts` (NextAuth options; persists accessToken + login to session)
- `app/api/auth/[...nextauth]/route.ts` (NextAuth handler)
- `app/api/github/[...path]/route.ts` (GitHub proxy; uses user token if logged in, else anon)
- `app/api/content/route.ts` (Secure content fetch + ACL based on frontmatter)
- `components/auth/session-provider.tsx` (client wrapper)

**Changed**
- `app/layout.tsx` (wrap children with `<AuthSessionProvider>`)
- `components/handbook/useRepoFiles.ts` (uses `/api/github` proxy)
- `components/handbook/useFileContent.ts` (uses `/api/content`; parses frontmatter server-side)
- `components/handbook/HandbookPage.tsx` (uses frontmatter for <Head>, adds sign-in/out UI)

## 4) Frontmatter Access Control

Inside any `.md` file, add:

```yaml
---
title: My Internal Post
description: Notes for the infra team.
visibility: restricted   # public | org | restricted
teams: [infra, platform] # required if restricted
---
```

- `public`: visible to anyone
- `org`: only org members (GitHub membership checked)
- `restricted`: only members of listed GitHub teams (slugs)

## 5) Usage

- Public repos: works for anonymous users; private pages require GitHub sign-in.
- Private repos: require GitHub sign-in.
- Share links: `?file=path/to/post.md&mode=blog` will show title/description in Slack via OG meta.

## 6) Test Checklist

- [ ] Run `npm run dev`, open http://localhost:3000
- [ ] Click **Sign in with GitHub** (top-right)
- [ ] Verify file tree loads for the configured org/repo
- [ ] Open a page with `visibility: public` (works signed-out)
- [ ] Open a page with `visibility: org` (works only signed-in and in org)
- [ ] Open a page with `visibility: restricted` and `teams: [team-slug]` (works only if user is in team)
- [ ] Share a blog URL in Slack; preview should show correct title/description.

## 7) Switching Org/Repo

Update these constants in both hooks if needed:

```ts
const ORG = "nysa-garage"
const REPO = "developer-handbook"
const BRANCH = "main"
```

> For multi-tenant mode later, you can drive these from the URL instead of constants.
