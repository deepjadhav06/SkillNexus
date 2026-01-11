Deployment with Docker (local or server)

This project contains a Vite React frontend and a FastAPI backend.
The easiest reproducible approach is to use Docker and docker-compose.

Prerequisites
- Docker & Docker Compose installed on the host machine

How it works
- `backend` builds a Python image and runs Uvicorn at port 8000
- `frontend` builds the Vite app and serves static assets via nginx on port 80
- `docker-compose.yml` maps frontend to host port 3000 and backend to 8000

Quick start (from repository root):

```powershell
# Build images and start containers
docker-compose up -d --build

# Tail logs (optional)
docker-compose logs -f

# Stop
docker-compose down
```

Environment
- The frontend image uses the compose `VITE_API_BASE` env value to point to the backend container: `http://backend:8000/api`.
- For production deployments on cloud platforms (Render, Fly, Railway):
  - Either use the Docker images created here or configure separate services: host the frontend as static site (Vercel/Netlify) and the backend as a web service (Render/Fly).

Platform notes and suggestions
- Quick / free hosts:
  - Vercel (frontend), Render / Railway / Fly (backend)
  - Render supports both frontend static sites and Docker images and gives easy HTTPS and automatic deploys from GitHub
- For a single-Docker deployment (both services together), use any VPS (DigitalOcean droplet) or a managed container service supporting docker-compose

If you'd like, I can:
- Create GitHub Actions workflow to build and push images to Docker Hub
- Prepare a Render service template or Fly.toml for Fly deploy
- Add a small healthcheck endpoint and readiness probe for container platforms

*** End ***
