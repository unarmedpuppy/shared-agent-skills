# Gitea Actions & CI/CD Reference

Complete reference for the self-hosted Gitea Actions CI/CD system.

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Gitea Server  │────▶│   act_runner    │────▶│  Job Container  │
│  (git + actions)│     │ (picks up jobs) │     │ (runs workflow) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                       │
         │                      │                       ▼
         │                      │              ┌─────────────────┐
         │                      └─────────────▶│  Docker Daemon  │
         │                                     │ (builds images) │
         │                                     └─────────────────┘
         │                                              │
         ▼                                              ▼
┌─────────────────┐                           ┌─────────────────┐
│ unarmedpuppy/   │                           │     Harbor      │
│   workflows     │                           │   (registry)    │
│ (shared flows)  │                           └─────────────────┘
└─────────────────┘
```

## Components

### Gitea Server
- **URL**: https://gitea.server.unarmedpuppy.com
- **Config**: `apps/gitea/docker-compose.yml`
- **Actions enabled**: `GITEA__actions__ENABLED=true`

### act_runner
- **Image**: `gitea/act_runner:latest`
- **Config**: `apps/gitea/config/runner-config.yaml`
- **Job image**: `catthehacker/ubuntu:act-latest` (via Harbor)

### Harbor Registry
- **URL**: https://harbor.server.unarmedpuppy.com
- **Robot account**: `robot$github-actions`
- **Image prefix**: `harbor.server.unarmedpuppy.com/library/`

### Shared Workflows
- **Repo**: `unarmedpuppy/workflows` (must be public)
- **Path**: `.gitea/workflows/docker-build.yml`

## Configuration Files

### apps/gitea/docker-compose.yml (act-runner service)

```yaml
act-runner:
  image: harbor.server.unarmedpuppy.com/docker-hub/gitea/act_runner:latest
  container_name: gitea-act-runner
  restart: unless-stopped
  privileged: true  # Required for Docker-in-Docker
  environment:
    - TZ=America/Chicago
    - CONFIG_FILE=/config/config.yaml
    - GITEA_INSTANCE_URL=http://gitea:3000
    - GITEA_RUNNER_REGISTRATION_TOKEN=${GITEA_RUNNER_TOKEN}
    - GITEA_RUNNER_NAME=local-runner
    - GITEA_RUNNER_LABELS=ubuntu-latest:docker://harbor.server.unarmedpuppy.com/ghcr/catthehacker/ubuntu:act-latest,ubuntu-22.04:docker://harbor.server.unarmedpuppy.com/ghcr/catthehacker/ubuntu:act-latest
  command: >
    sh -c '
      cd /data &&
      if [ ! -f .runner ]; then
        act_runner register --no-interactive --instance http://gitea:3000 --token $${GITEA_RUNNER_REGISTRATION_TOKEN} --name local-runner --labels "ubuntu-latest:docker://harbor.server.unarmedpuppy.com/ghcr/catthehacker/ubuntu:act-latest,ubuntu-22.04:docker://harbor.server.unarmedpuppy.com/ghcr/catthehacker/ubuntu:act-latest" --config /config/config.yaml
      fi &&
      act_runner daemon --config /config/config.yaml
    '
  volumes:
    - act-runner-data:/data
    - ./config/runner-config.yaml:/config/config.yaml:ro
    - /var/run/docker.sock:/var/run/docker.sock
  networks:
    - my-network
  depends_on:
    - gitea
```

### apps/gitea/config/runner-config.yaml

```yaml
log:
  level: debug

runner:
  file: .runner
  capacity: 1
  timeout: 3h
  insecure: false
  fetch_timeout: 5s
  fetch_interval: 2s

cache:
  enabled: true
  dir: ""
  host: ""
  port: 0

container:
  network: my-network  # Job containers join this network
  privileged: true     # Required for docker builds
  options: ""          # Don't add extra options (causes duplicates)
  workdir_parent:
  valid_volumes:
    - /var/run/docker.sock
  docker_host: ""
  force_pull: false

host:
  workdir_parent: /data/workspace
```

## Key Configuration Details

### Why `privileged: true`?
The runner container needs privileged mode to create job containers with Docker access.

### Why `network: my-network`?
Job containers must be on `my-network` to:
1. Resolve `gitea` hostname for git operations
2. Access other services on the network

### Why Harbor image paths in labels?
Using `docker://harbor.server.unarmedpuppy.com/ghcr/catthehacker/ubuntu:act-latest` ensures:
1. Images are pulled from local Harbor (faster, offline capable)
2. Avoids Docker Hub rate limits

### Why `options: ""`?
The runner automatically adds docker socket mount. Adding it in options causes duplicate mounts which can cause issues.

## Organization Secrets

Configured at org level (`homelab`): https://gitea.server.unarmedpuppy.com/org/homelab/settings/actions/secrets

| Secret | Description |
|--------|-------------|
| `HARBOR_USERNAME` | `robot$github-actions` |
| `HARBOR_PASSWORD` | Robot account token |
| `DEPLOY_HOST` | `192.168.86.47` |
| `DEPLOY_PORT` | `4242` |
| `DEPLOY_USER` | `github-deploy` |
| `DEPLOY_SSH_KEY` | SSH private key |

### Important: Dollar Sign in Username

The `$` in `robot$github-actions` must be protected from bash expansion:

```yaml
# WRONG - $github gets expanded to empty string
echo "${{ secrets.HARBOR_PASSWORD }}" | docker login ... -u "${{ secrets.HARBOR_USERNAME }}"

# CORRECT - single quotes prevent expansion  
echo '${{ secrets.HARBOR_PASSWORD }}' | docker login ... -u '${{ secrets.HARBOR_USERNAME }}'
```

## Shared Workflow System

### Workflow Location
- **Repo**: `unarmedpuppy/workflows` (MUST be public, not in private org)
- **File**: `.gitea/workflows/docker-build.yml`
- **Local path**: `~/repos/personal/workflows/`

### Why unarmedpuppy/ not homelab/?
The `homelab` org is private. Even with public repos inside, the runner can't clone without auth. Using `unarmedpuppy/` namespace (user account) allows public access.

### Shared Workflow: docker-build.yml

```yaml
name: Docker Build and Deploy

on:
  workflow_call:
    inputs:
      image_name:
        required: true
        type: string
      app_path:
        required: false
        type: string
        default: ''
      dockerfile:
        required: false
        type: string
        default: 'Dockerfile'
      context:
        required: false
        type: string
        default: '.'

env:
  REGISTRY: harbor.server.unarmedpuppy.com

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set version tag
        id: version
        run: |
          if [[ "$GITHUB_REF" == refs/tags/v* ]]; then
            echo "VERSION=${GITHUB_REF#refs/tags/}" >> $GITHUB_OUTPUT
            echo "IS_TAG=true" >> $GITHUB_OUTPUT
          else
            echo "VERSION=latest" >> $GITHUB_OUTPUT
            echo "IS_TAG=false" >> $GITHUB_OUTPUT
          fi

      - name: Login to Harbor
        run: |
          echo '${{ secrets.HARBOR_PASSWORD }}' | docker login ${{ env.REGISTRY }} -u '${{ secrets.HARBOR_USERNAME }}' --password-stdin

      - name: Build and push image
        run: |
          docker build -f ${{ inputs.dockerfile }} -t ${{ env.REGISTRY }}/${{ inputs.image_name }}:${{ steps.version.outputs.VERSION }} ${{ inputs.context }}
          docker tag ${{ env.REGISTRY }}/${{ inputs.image_name }}:${{ steps.version.outputs.VERSION }} ${{ env.REGISTRY }}/${{ inputs.image_name }}:latest
          docker push ${{ env.REGISTRY }}/${{ inputs.image_name }}:${{ steps.version.outputs.VERSION }}
          docker push ${{ env.REGISTRY }}/${{ inputs.image_name }}:latest

      - name: Deploy to server
        if: steps.version.outputs.IS_TAG == 'true' && inputs.app_path != ''
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          port: ${{ secrets.DEPLOY_PORT }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_SSH_KEY }}
          script: |
            cd /home/unarmedpuppy/server/${{ inputs.app_path }}
            sudo docker compose pull
            sudo docker compose up -d
            sudo docker image prune -f
```

### Calling the Shared Workflow

Each repo needs only this in `.gitea/workflows/build.yml`:

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
      image_name: library/YOUR_APP
      app_path: apps/YOUR_APP
    secrets: inherit
```

## Repos Using Shared Workflow

| Repo | Image | App Path |
|------|-------|----------|
| pokedex | `library/pokedex` | `apps/pokedex` |
| beads-viewer | `library/beads-viewer` | `apps/beads-viewer` |
| maptapdat | `library/maptapdat` | `apps/maptapdat` |
| opencode-terminal | `library/opencode-terminal` | `apps/opencode-terminal` |
| polyjuiced | `library/polymarket-bot` | `apps/polymarket-bot` |
| smart-home-3d | `library/smart-home-3d` | `apps/smart-home-3d` |
| trading-bot | `library/trading-bot` | `apps/trading-bot` |

## Repos with Custom Workflows

These repos have complex needs and use custom workflows:

| Repo | Reason |
|------|--------|
| homelab-ai | Multi-image monorepo (6 images, path filters) |
| trading-journal | Separate backend + frontend images |
| agent-gateway | Multi-image monorepo (core + gateway) |

## Commands Reference

### Runner Management

```bash
# Check runner logs
ssh -p 4242 unarmedpuppy@192.168.86.47 "docker logs gitea-act-runner 2>&1 | tail -50"

# Restart runner with fresh registration
ssh -p 4242 unarmedpuppy@192.168.86.47 "cd ~/server/apps/gitea && docker compose down act-runner && docker volume rm gitea_act-runner-data && docker compose up -d act-runner"

# Check runner status in Gitea
# Site Administration > Actions > Runners
```

### Triggering Builds

```bash
# Push to trigger build
git push origin main

# Tag to trigger build + deploy
git tag v1.0.0
git push origin v1.0.0

# Manual trigger via Gitea UI
# Repo > Actions > Run workflow
```

### Debugging

```bash
# Check if job container was created
ssh -p 4242 unarmedpuppy@192.168.86.47 "docker ps -a | grep GITEA-ACTION"

# Check Docker daemon logs
ssh -p 4242 unarmedpuppy@192.168.86.47 "sudo journalctl -u docker --since '5 minutes ago'"

# Test Harbor login from container
ssh -p 4242 unarmedpuppy@192.168.86.47 "docker run --rm --network my-network -v /var/run/docker.sock:/var/run/docker.sock harbor.server.unarmedpuppy.com/ghcr/catthehacker/ubuntu:act-latest sh -c 'echo PASSWORD | docker login harbor.server.unarmedpuppy.com -u \"robot\\\$github-actions\" --password-stdin'"
```

## Troubleshooting

### Runner picks up job but container never starts

**Symptoms**: Logs show "docker create" but no container appears

**Causes & Fixes**:
1. Runner not privileged → Add `privileged: true` to docker-compose
2. Wrong network → Set `container.network: my-network` in runner config
3. Duplicate socket mounts → Remove socket from `container.options`

### "Unable to clone workflows repo: Unauthorized"

**Cause**: Shared workflow repo is in private org or not public

**Fix**: Ensure `unarmedpuppy/workflows` is public (not in homelab org)

### "unauthorized" on Harbor login

**Cause**: `$` in username being expanded by bash

**Fix**: Use single quotes: `'${{ secrets.HARBOR_USERNAME }}'`

### Job container can't resolve "gitea" hostname

**Cause**: Job container not on correct network

**Fix**: Set `container.network: my-network` in runner config

### Build succeeds but deploy doesn't run

**Cause**: Deploy only runs on version tags

**Fix**: Push a tag: `git tag v1.0.0 && git push origin v1.0.0`

## Version History

| Date | Change |
|------|--------|
| 2026-01-03 | Initial setup with act_runner |
| 2026-01-03 | Fixed container creation (privileged, network) |
| 2026-01-03 | Fixed Harbor login (single quotes for $) |
| 2026-01-03 | Created shared workflow system |
| 2026-01-03 | Migrated 7 repos to shared workflow |
