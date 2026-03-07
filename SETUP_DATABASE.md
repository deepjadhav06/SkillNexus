# Database Sync Setup - Railway PostgreSQL

## Problem Solved
Your mobile and PC now sync data through a **shared PostgreSQL database** on Railway instead of separate localStorage.

## Quick Setup Steps

### 1️⃣ **Add PostgreSQL to Railway**
- Go to [railway.app](https://railway.app)
- Open your SkillNexus project
- Click **"+ New"** → Select **PostgreSQL**
- Wait for it to deploy

### 2️⃣ **Get Your Database URL**
- Click on the PostgreSQL service
- Go to **Variables** tab
- Copy the `DATABASE_URL` (starts with `postgresql://`)

### 3️⃣ **Update Railway Environment Variables**
- In your Railway project, go to **Variables**
- Add these variables:
  ```
  DATABASE_URL = [paste from step 2]
  SECRET_KEY = your_secret_key_here
  VITE_API_BASE = https://your-project.up.railway.app/api
  ```

### 4️⃣ **Update Your Backend**
The backend already has `.env` file. For Railway:
- **Don't modify** `app.py` - update the environment variables only
- Railway will automatically use the new `DATABASE_URL`

### 5️⃣ **Deploy to Railway**
```powershell
# Push to GitHub (if using Railway's GitHub integration)
git add .
git commit -m "Update database to PostgreSQL"
git push origin main

# OR deploy directly:
# Railway will auto-deploy when you push code
```

### 6️⃣ **Test Sync**
- Open your app on PC → Add/update user data
- Open on mobile → See the same data instantly ✅

## How It Works

```
PC Mobile
|   |
└─→ Backend API ←─┘
    |
    PostgreSQL Database (Railway) ← Shared source of truth
```

### Before (❌ No sync):
- PC localStorage ≠ Mobile localStorage

### After (✅ Full sync):
- PC fetchs from backend → stores in localStorage
- Mobile fetches from backend → stores in localStorage
- Both always see latest backend data

## Files Changed
- `backend/requirements.txt` - Added SQLAlchemy + psycopg
- `backend/app_db.py` - New database-powered version
- `.env.example` - Added Railway configuration template

## Rollback to App.py
If you need to use the original JSON file version:
```python
# In your Procfile or start command, use:
uvicorn backend/app:app --host 0.0.0.0 --port 8000
```

To use the new database version:
```python
# Use:
uvicorn backend/app_db:app --host 0.0.0.0 --port 8000
```

## Commands to Run Locally (Optional)
```powershell
# Terminal
cd "C:\Users\admin\OneDrive\Desktop\Lastyear\Project\capstonep\SkillNexus"

# Start new backend (PostgreSQL)
python -m uvicorn backend.app_db:app --reload --port 8000

# OR start old backend (JSON)
python -m uvicorn backend.app:app --reload --port 8000
```

## Environment Variables Needed on Railway
```
DATABASE_URL = postgresql://user:pass@host:5432/db
SECRET_KEY = your_secret_key
VITE_API_BASE = https://your-railway-app.up.railway.app/api
```

## Troubleshooting
| Issue | Fix |
|-------|-----|
| "DATABASE_URL not found" | Check Railway Variables tab, make sure it's saved |
| "Connection refused" | Wait 30 seconds after creating PostgreSQL, try again |
| Data still on PC only | Check VITE_API_BASE is correct on mobile |
| Old data missing | Run init script, or restore from data.json |

✅ **Done!** Your data is now synchronized across all devices.
