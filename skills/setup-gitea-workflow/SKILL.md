---
name: setup-gitea-workflow
description: Add CI/CD workflow to a repo for Docker build and push to Harbor
when_to_use: When adding CI/CD to a new repo, or when a repo needs Docker image builds
---

# Setup Gitea CI/CD Workflow

Add a Gitea Actions workflow to a repository for automated Docker builds and deployments.

## Quick Start

Create `.gitea/workflows/build.yml` in your repo:

```yaml
name: Build and Deploy

on:
  push:
    branches: [main, master]
    tags: ['v*']
  workflow_dispatch:

jobs:
  build:
    uses: unarmedpuppy/workflows/.gitea/workflows/docker-build.yml@main
    with:
      image_name: library/YOUR_APP_NAME
      app_path: apps/YOUR_APP_NAME
    secrets: inherit
```

**Replace:**
- `YOUR_APP_NAME` with your application name (e.g., `pokedex`, `trading-bot`)

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `image_name` | Yes | - | Harbor image path (e.g., `library/pokedex`) |
| `app_path` | No | `''` | Server path for deployment (e.g., `apps/pokedex`) |
| `dockerfile` | No | `Dockerfile` | Path to Dockerfile |
| `context` | No | `.` | Docker build context |

## Behavior

| Trigger | Action |
|---------|--------|
| Push to main/master | Build + push with `latest` tag |
| Push version tag (v*) | Build + push with version tag + deploy (if `app_path` set) |
| Manual dispatch | Same as push to main |

## Prerequisites

1. **Repo must be in Gitea** under `homelab/` organization
2. **Org secrets configured** (already done for homelab org):
   - `HARBOR_USERNAME` - Robot account: `robot$github-actions`
   - `HARBOR_PASSWORD` - Robot account token
   - `DEPLOY_HOST`, `DEPLOY_PORT`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`
3. **Dockerfile** exists in repo root (or specify `dockerfile` input)

## Example: Adding to a New Repo

```bash
# 1. Create the workflow directory
mkdir -p .gitea/workflows

# 2. Create the workflow file
cat > .gitea/workflows/build.yml << 'EOF'
name: Build and Deploy

on:
  push:
    branches: [main, master]
    tags: ['v*']
  workflow_dispatch:

jobs:
  build:
    uses: unarmedpuppy/workflows/.gitea/workflows/docker-build.yml@main
    with:
      image_name: library/my-new-app
      app_path: apps/my-new-app
    secrets: inherit
EOF

# 3. Commit and push
git add .gitea/
git commit -m "feat: add CI/CD workflow"
git push origin main
```

## Shared Workflow Location

The reusable workflow is at:
- **Gitea**: `unarmedpuppy/workflows/.gitea/workflows/docker-build.yml`
- **Local**: `~/repos/personal/workflows/.gitea/workflows/docker-build.yml`

## Customization

### Skip Deployment (build only)

Omit `app_path` to skip the deployment step:

```yaml
jobs:
  build:
    uses: unarmedpuppy/workflows/.gitea/workflows/docker-build.yml@main
    with:
      image_name: library/my-app
    secrets: inherit
```

### Custom Dockerfile Location

```yaml
jobs:
  build:
    uses: unarmedpuppy/workflows/.gitea/workflows/docker-build.yml@main
    with:
      image_name: library/my-app
      dockerfile: docker/Dockerfile.prod
      context: .
    secrets: inherit
```

## Repos Using This Workflow

| Repo | Image | Deploys To |
|------|-------|------------|
| pokedex | `library/pokedex` | `apps/pokedex` |
| beads-viewer | `library/beads-viewer` | `apps/beads-viewer` |
| maptapdat | `library/maptapdat` | `apps/maptapdat` |
| opencode-terminal | `library/opencode-terminal` | `apps/opencode-terminal` |
| polyjuiced | `library/polymarket-bot` | `apps/polymarket-bot` |
| smart-home-3d | `library/smart-home-3d` | `apps/smart-home-3d` |
| trading-bot | `library/trading-bot` | `apps/trading-bot` |

## Not Suitable For

This shared workflow is for **single-image repos**. For complex setups, use custom workflows:

- **Multi-image monorepos** (homelab-ai, agent-gateway) - need path filters
- **Frontend + backend** (trading-journal) - need separate build jobs
- **Non-Docker projects** - use different workflow

## Troubleshooting

### "Unable to clone workflows repo"
The `unarmedpuppy/workflows` repo must be public. Verify at:
https://gitea.server.unarmedpuppy.com/unarmedpuppy/workflows

### "unauthorized" on Harbor login
Check that org secrets use single quotes for `$` in username:
```yaml
echo '${{ secrets.HARBOR_PASSWORD }}' | docker login ... -u '${{ secrets.HARBOR_USERNAME }}'
```

### Build not triggering
1. Check workflow file is at `.gitea/workflows/build.yml`
2. Verify branch name matches trigger (`main` or `master`)
3. Check Gitea Actions is enabled for the repo
