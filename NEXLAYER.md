# Nexlayer — Task-app

<!-- nexlayer:meta version=1 analyzed=2026-06-16T12:46:17Z repo=https://github.com/Itsamk-ship-it/Task-app branch=main -->

> **For AI agents (Claude Code, Cursor, Gemini CLI, Copilot):**
> This file is the **project context** for this Nexlayer deployment — tech stack, env vars, secrets, live URL.
> For full platform detail (nexlayer.yaml schema, Dockerfile rules, CI/CD, task recipes) read **`nexlayer.skills`** in this repo.
>
> **Critical rules (full detail in `nexlayer.skills`):**
> - Inter-pod refs: `${podName:port}` only — never `localhost` or bare hostnames
> - Docker Hub images: prefix with `mirror.gcr.io/library/` — bare tags fail on the cluster
> - Secrets: set in the Nexlayer dashboard — never commit to `nexlayer.yaml` or Dockerfile
>
> **This file:** `agent-managed` sections update automatically. `user-editable` sections (Local Development Setup, Nexlayer Deployment Plan, Build Notes) are yours — preserved across re-analysis.

## Project Summary
<!-- nexlayer:section agent-managed=project_summary -->
Trello Lite is a real-time task management application featuring draggable boards and columns, utilizing a React frontend, Express backend, and Socket.io for live synchronization.
<!-- nexlayer:end -->

## Technology Stack
<!-- nexlayer:section agent-managed=tech_stack -->
| Name | Kind | Version | Detected From |
|------|------|---------|---------------|
| React | framework | 19 | README.md |
| TypeScript | language | Latest | README.md |
| Express | framework | 5 | README.md |
| SQLite | database | Latest | README.md |
| Prisma | tool | Latest | README.md |
| Socket.io | infra | Latest | README.md |
| Vite | build | Latest | README.md |
<!-- nexlayer:end -->

## Repository Structure
<!-- nexlayer:section agent-managed=structure_map -->
- client/ — React 19 frontend with Vite and Zustand state management
- server/ — Express 5 backend with Prisma ORM and Socket.io integration
<!-- nexlayer:end -->

## External Services Required
<!-- nexlayer:section agent-managed=external_deps -->
_No external services detected._
<!-- nexlayer:end -->

## Local Development Setup
<!-- nexlayer:section user-editable=local_setup -->
### Prerequisites

- Node.js >= 18

### Environment variables

Copy `.env.example` to `.env.local` and fill in:

```
DATABASE_URL=file:./dev.db
```

### Steps

1. `cd server && npm install` — Install backend dependencies
2. `cd server && npx prisma generate && npx prisma db push` — Initialize SQLite database schema
3. `cd server && npm run dev` — Start backend server on port 3000
4. `cd client && npm install && npm run dev` — Start frontend development server on port 5173

<!-- nexlayer:end -->

## Nexlayer Setup
<!-- nexlayer:section agent-managed=nexlayer_setup -->
### Pod Environment Variables

| Pod | Variable | Value | Kind |
|-----|----------|-------|------|
| `frontend` | `API_URL` | `"http://${backend:3000}"` | inter-pod |
| `frontend` | `NEXT_PUBLIC_API_URL` | `"http://${backend:3000}"` | inter-pod |
| `frontend` | `VITE_API_URL` | `"http://${backend:3000}"` | inter-pod |

### nexlayer.yaml

```yaml
application:
  name: neat-vale-task-app
  pods:
    - name: backend
      image: "registry.nexlayer.io/user_01kdnss9re3ack631zmxgpra36/task-app-backend:9ed0777-fix8"
      path: /api
      servicePorts:
        - 3000
      vars: {}
    - name: frontend
      image: "registry.nexlayer.io/user_01kdnss9re3ack631zmxgpra36/task-app-frontend:9ed0777-fix8"
      path: /
      servicePorts:
        - 3000
      vars:
        API_URL: "http://${backend:3000}"
        NEXT_PUBLIC_API_URL: "http://${backend:3000}"
        VITE_API_URL: "http://${backend:3000}"
```

<!-- nexlayer:end -->

## Nexlayer Deployment Plan
<!-- nexlayer:section user-editable=deployment_plan -->
### Pod Topology

| Pod | Image | Port | Role |
|-----|-------|------|------|
| frontend | mirror.gcr.io/library/node:22-alpine | 5173 | web |
| backend | mirror.gcr.io/library/node:22-alpine | 3000 | web |
| db-storage | mirror.gcr.io/library/alpine:latest | 0 | database |

### Deployment notes

- Since the app uses SQLite (file-based), the db-storage pod acts as a persistent volume provider for the backend pod.
- Inter-pod communication for the API and Socket.io must use ${backend:3000}.
- The frontend is served as a static asset or dev server on port 5173.

<!-- nexlayer:end -->

## Build Notes
<!-- nexlayer:section user-editable=build_notes -->
<!-- Add notes for future builds here — preserved across re-analysis -->
<!-- nexlayer:end -->

## Nexlayer Configuration
<!-- nexlayer:section agent-managed=nexlayer_config -->
**Last deployed:** 2026-06-16T13:48:03Z  
**Live URL:** https://vibrant-wasp-neat-vale-task-app.cloud.nexlayer.ai  
**Runtime:** multi · **Port:** 5000  
**Deploy branch:** main  

```yaml
application:
  name: neat-vale-task-app
  pods:
    - name: backend
      image: "registry.nexlayer.io/user_01kdnss9re3ack631zmxgpra36/task-app-backend:9ed0777-fix8"
      path: /api
      servicePorts:
        - 3000
      vars: {}
    - name: frontend
      image: "registry.nexlayer.io/user_01kdnss9re3ack631zmxgpra36/task-app-frontend:9ed0777-fix8"
      path: /
      servicePorts:
        - 3000
      vars:
        API_URL: "http://${backend:3000}"
        NEXT_PUBLIC_API_URL: "http://${backend:3000}"
        VITE_API_URL: "http://${backend:3000}"
```
<!-- nexlayer:end -->

## Build History
<!-- nexlayer:section agent-managed=build_history -->
| Date | Status | Notes |
|------|--------|-------|
| 2026-06-16T12:46:17Z | analyzed | initial repo analysis |
| 2026-06-16T13:48:03Z | success | deployed https://vibrant-wasp-neat-vale-task-app.cloud.nexlayer.ai |
<!-- nexlayer:end -->
