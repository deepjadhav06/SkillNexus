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

### 2. Setup (Using Vite)
Open your terminal and run the following commands to create a new project:

```bash
npm create vite@latest skill-nexus -- --template react-ts
cd skill-nexus
npm install
```

### 3. Install Dependencies
Install the required libraries for charts and AI integration:

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
```bash
npm run dev
```
Open the local URL (usually `http://localhost:5173`) to view the app.
