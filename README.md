# 💥 Blast Radius

### See what actually breaks before you merge.

Every pull request has a footprint — files it touches, and files that quietly depend on those files. Most CI pipelines tell you if your tests pass. **Blast Radius tells you what you're actually risking.**

Connect a repo. Open a PR. Get a live dependency graph, a computed risk score, and a plain-English AI summary of the blast radius — before your reviewer has to guess.

**[🚀 Live Demo](https://blast-radius-gamma.vercel.app)** · **[⚙️ API](https://blast-radius-kw0b.onrender.com)**

---

## The problem
```
$ git diff --stat
src/middleware/auth.ts | 4 +---

1 file changed, 1 insertion(+), 3 deletions(-)
```

Looks tiny. Looks safe. `auth.ts` is imported by 12 routes, 3 of which touch payments.

Nobody caught that in review — because nobody could *see* it.

## The idea
```
PR opened
│
▼
GitHub Webhook ──► Blast Radius
│
├─► Clone repo at PR's HEAD commit
├─► Parse every file into an AST
├─► Build a full import/dependency graph
├─► Diff changed files against the graph
├─► BFS traversal → everything downstream, ranked by risk
├─► Groq LLM → plain-English risk summary
└─► Live graph + summary, streamed to the browser in real time
```


No more "tests passed, ship it." Now you see the actual **blast radius** of every change — rendered as an interactive graph, not a wall of text.

---

## ✨ What it does

- 🔗 **One-click GitHub OAuth** — connect any repo you own, webhook registered automatically
- 🧠 **Real static analysis** — AST parsing via `ts-morph`, not regex guesswork
- 🕸️ **Dependency graph construction** — every file, every import, mapped as nodes and edges
- 💣 **Blast radius computation** — reverse-graph BFS traversal from every changed file, weighted by how many things depend on each node
- 🤖 **AI risk summaries** — Groq-generated, plain-English, no jargon
- ⚡ **Live progress** — Socket.io streams `queued → cloning → parsing → analyzing → complete` straight to the UI, no polling
- 🎯 **Visual, not textual** — an interactive `react-flow` graph where changed files glow orange and everything downstream lights up teal

---

## 🏗️ Architecture
```
┌─────────────┐ ┌──────────────────┐ ┌─────────────┐
│ React │◄──────►│ Express API │◄──────►│ MongoDB │
│ (Vercel) │ REST │ (Render) │ │ (Atlas) │
└─────────────┘ + └────────┬─────────┘ └─────────────┘
Socket.io │
▼
┌─────────────────┐
│ BullMQ Worker │
│ (same process) │
└────────┬─────────┘
│
┌─────────────────┼─────────────────┐
▼ ▼ ▼
┌────────────┐ ┌──────────────┐ ┌─────────────┐
│ simple-git │ │ ts-morph │ │ Groq API │
│ (clone PR) │ │ (AST parse) │ │ (AI summary)│
└────────────┘ └──────────────┘ └─────────────┘
│
▼
┌──────────────┐
│ Redis/Upstash │ ← job queue
└──────────────┘
```


---

## 🛠️ Tech stack

| Layer | Stack |
|---|---|
| **Frontend** | React · TypeScript · Vite · Tailwind CSS v4 · React Flow · Socket.io-client |
| **Backend** | Node.js · Express · TypeScript |
| **Database** | MongoDB (Mongoose) |
| **Queue** | BullMQ + Redis (Upstash) |
| **Static Analysis** | `ts-morph` (AST parsing & dependency graph construction) |
| **Real-time** | Socket.io |
| **Auth** | JWT (access + refresh tokens, httpOnly cookies) + GitHub OAuth |
| **AI** | Groq (`openai/gpt-oss-120b`) |
| **Infra** | GitHub Webhooks · `simple-git` |
| **Deployment** | Vercel (frontend) · Render (backend) |

---

## 📊 Data model
```
User ──┬── Repo ──┬── GraphSnapshot (dependency graph @ a commit)
│ └── PRAnalysis ──── graphSnapshotId
│ ──── affectedNodes[]
│ ──── riskScore
└── githubAccessToken ──── aiSummary
```


Each `PRanalysis` references a `graphsnapshot` instead of duplicating it — the graph is built once per baseline commit and diffed against, not rebuilt from scratch on every PR.

---

## 🚀 Running locally

```bash
git clone https://github.com/bipu-biz/Blast-Radius.git
cd Blast-Radius
```

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # fill in Mongo URI, JWT secrets, GitHub OAuth, Redis, Groq key
npm run dev
```

**Frontend**
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm run dev
```

**Webhooks (local only)** — GitHub can't reach `localhost`, so expose it first:
```bash
cloudflared tunnel --url http://localhost:5000
```
Point `BACKEND_URL` at the tunnel URL and connect a repo through the app.

---

## 🎬 The core loop

1. Register → connect your GitHub account
2. Pick a repo from the picker → webhook registers automatically
3. Open a PR on that repo
4. Watch it live: `cloning → parsing → analyzing → complete`
5. See the graph. Orange = changed. Teal = affected. Everything else = safe.

---

## 🧩 What makes this hard (and worth building)

Most portfolio projects are CRUD with a UI on top. This one required:

- **Real AST parsing** — resolving relative imports, matching them to actual files, filtering out external packages
- **A reverse-adjacency BFS traversal** — computing "everything downstream of X" is a graph problem, not a database query
- **Webhook signature verification** — HMAC-SHA256, raw request bodies, timing-safe comparison
- **A queue-backed worker** — cloning and parsing can't block an HTTP response
- **Real-time state sync** — Socket.io rooms, one per analysis, so progress updates reach only the client watching that specific PR

---

## 📮 Roadmap

- [ ] Multi-collaborator repo access
- [ ] GitHub PR comment integration (post the summary directly on the PR)
- [ ] Configurable risk-weight heuristics
- [ ] Support for Python / Go import graphs

---

**Built by [Bipul](https://github.com/bipu-biz)** — because "tests passed" was never a good enough answer to "what did this actually break?"