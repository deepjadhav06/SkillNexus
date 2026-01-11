## GitHub Actions Docker Build & Push Setup

This workflow automatically builds and pushes Docker images for both the frontend and backend to Docker Hub whenever you push to the `main` branch.

### Prerequisites

1. **Docker Hub Account**
   - Create one at https://hub.docker.com (free)
   - Create two repositories:
     - `skillnexus-backend`
     - `skillnexus-frontend`

2. **GitHub Secrets**
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add two secrets:
     - `DOCKER_HUB_USERNAME`: your Docker Hub username
     - `DOCKER_HUB_PASSWORD`: a Docker Hub Personal Access Token (PAT)
       - Create PAT at https://hub.docker.com/settings/security
       - Recommended: Select "Read, Write, Delete" scopes

### How It Works

- Triggered on every push to `main` or manually via GitHub UI.
- Builds backend image with tags: `latest`, branch name, commit SHA.
- Builds frontend image with the same tag strategy.
- Updates Docker Hub repository descriptions automatically.

### Viewing Builds

- Go to your GitHub repo → Actions tab.
- Click on the "Build and Push Docker Images" workflow run.
- Watch the build progress in real-time.

### Using the Images

Once pushed to Docker Hub, you can pull and run:

```bash
docker pull YOUR_DOCKER_HUB_USERNAME/skillnexus-backend:latest
docker pull YOUR_DOCKER_HUB_USERNAME/skillnexus-frontend:latest
```

Or modify your `docker-compose.yml`:
```yaml
backend:
  image: YOUR_DOCKER_HUB_USERNAME/skillnexus-backend:latest
frontend:
  image: YOUR_DOCKER_HUB_USERNAME/skillnexus-frontend:latest
```

### Troubleshooting

- **Build fails**: Check the GitHub Actions logs for Docker errors (usually missing dependencies).
- **Push fails**: Verify your Docker Hub credentials (PAT must be valid).
- **Images not updating**: Ensure you've pushed to the `main` branch (workflow only triggers on `main`).

---

For more details, see `.github/workflows/docker-build-push.yml` in the repo.
