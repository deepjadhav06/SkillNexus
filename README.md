# SkillNexus - Skill Swap Hub

## Project Overview
SkillNexus is a React-based platform designed to facilitate skill swapping, resource sharing, and certification. 

**Features:**
- **User Authentication:** Sign up/Login (simulated).
- **Dark/Light Mode:** Fully responsive theme toggle.
- **Skill Swapping:** Match with users who offer skills you want.
- **Unlockable Content:** Resources are locked until you accept a swap for that specific skill.
- **Certification:** AI-generated quizzes (Gemini API) to verify knowledge and issue certificates.
- **Dashboard:** Statistical overview of swaps and trends.

## How to Run in VS Code

### 1. Prerequisites
- Node.js installed.
- A Google Gemini API Key.

### 2. Quick Setup
A single script will install both the frontend and backend dependencies so you can start the project as fast as possible.

```bash
# from the root of the SkillNexus directory
npm run setup
```

This command runs `npm ci` to pull down all Node packages using the exact versions from `package-lock.json` and then switches into `backend` to install Python requirements.

If you prefer to install things manually, the steps below show what the script does.

#### Frontend (Vite)
Open your terminal and run the following commands to create or update the project dependencies:

```bash
npm ci              # installs exactly the versions in package-lock.json (faster than npm install)
```

#### Backend (Python)
It is recommended to use a virtual environment. On Windows, you can do:

```powershell
cd backend
python -m venv .venv      # create venv once
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

The `npm run setup` script above executes the last line for you.

### 3. Install Additional Libraries
If you need new frontend libraries for charts or AI, you can still run:

```bash
npm install recharts @google/genai
```

### 4. Project Structure & File Copying
Copy the code provided in the editor into your local project following this structure:

```
skill-nexus/
├── index.html           <-- Copy content (Ensure Tailwind Script is present)
├── src/
│   ├── App.tsx
│   ├── index.tsx        <-- Entry point (Main.tsx in Vite)
│   ├── types.ts
│   ├── constants.ts
│   ├── components/
│   │   └── Navigation.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── SkillSwap.tsx
│   │   └── Resources.tsx
│   └── services/
│       ├── mockService.ts
│       └── geminiService.ts
└── ...
```

### 5. Backend (Python)
Currently, the app uses `mockService.ts` to simulate backend operations using LocalStorage. To connect a real Python backend:
1.  Create a Flask or FastAPI server.
2.  Replace the functions in `src/services/mockService.ts` with API calls (e.g., `fetch('/api/login')`).

### 6. Run the App
For local development use Vite (both frontend and backend):

```bash
npm run dev              # only frontend
npm run dev:backend      # only backend (FastAPI)
npm run dev:full         # both in parallel
```

Open the local URL (usually `http://localhost:5173`) to view the app.

#### Docker
If you prefer a containerized environment the repository already includes a `docker-compose.yml`.
You can build and start both services with a single command (downloaded images are cached to speed up subsequent runs):

```bash
npm run docker:full      # equivalent to `docker-compose up -d --build`
```

Then navigate to `http://localhost:3000` in your browser. When finished tear down with:

```bash
npm run docker:down
```
