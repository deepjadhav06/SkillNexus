from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import json
import threading
import os
import shutil
from dotenv import load_dotenv
from datetime import datetime, timedelta
from jose import JWTError, jwt

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data.json')
lock = threading.Lock()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def read_data():
    with lock:
        if not os.path.exists(DATA_FILE):
            init_data()
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Validate data has required fields
                if not data or not isinstance(data, dict):
                    init_data()
                    with open(DATA_FILE, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                return data
        except (json.JSONDecodeError, IOError):
            init_data()
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)

def write_data(data):
    with lock:
        try:
            # Create backup before writing
            if os.path.exists(DATA_FILE):
                backup_file = DATA_FILE + '.backup'
                shutil.copy2(DATA_FILE, backup_file)
            
            with open(DATA_FILE, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            print(f"Error writing data: {e}")
            # Try to restore from backup
            backup_file = DATA_FILE + '.backup'
            if os.path.exists(backup_file):
                shutil.copy2(backup_file, DATA_FILE)
            raise

def init_data():
    default_data = {
        "users": [
            {
                "id": "admin",
                "name": "Platform Owner",
                "email": "owner@skillnexus.com",
                "role": "OWNER",
                "skillsOffered": [],
                "skillsWanted": [],
                "matchedSwaps": [],
                "completedCourses": []
            },
            {
                "id": "u1",
                "name": "Alice Johnson",
                "email": "alice@example.com",
                "role": "USER",
                "skillsOffered": ["react", "design"],
                "skillsWanted": ["python"],
                "matchedSwaps": [],
                "completedCourses": []
            },
            {
                "id": "u2",
                "name": "Bob Smith",
                "email": "bob@example.com",
                "role": "USER",
                "skillsOffered": ["python", "marketing", "java"],
                "skillsWanted": ["react", "css"],
                "matchedSwaps": [],
                "completedCourses": []
            },
            {
                "id": "u3",
                "name": "Charlie Brown",
                "email": "charlie@example.com",
                "role": "USER",
                "skillsOffered": ["public_speaking", "html", "css"],
                "skillsWanted": ["design", "java"],
                "matchedSwaps": [],
                "completedCourses": []
            },
            {
                "id": "u4",
                "name": "Diana Prince",
                "email": "diana@example.com",
                "role": "USER",
                "skillsOffered": ["java", "marketing"],
                "skillsWanted": ["python", "react"],
                "matchedSwaps": [],
                "completedCourses": []
            }
        ],
        "resources": [
            {"id": "res1", "skillId": "react", "title": "Advanced React Patterns PDF", "type": "PDF", "url": "#", "uploadedBy": "admin"},
            {"id": "res2", "skillId": "react", "title": "React Hooks Deep Dive", "type": "VIDEO", "url": "#", "uploadedBy": "admin"},
            {"id": "res3", "skillId": "python", "title": "FastAPI Documentation", "type": "LINK", "url": "https://fastapi.tiangolo.com", "uploadedBy": "admin"},
            {"id": "res4", "skillId": "design", "title": "Figma Masterclass", "type": "VIDEO", "url": "#", "uploadedBy": "admin"},
            {"id": "res5", "skillId": "java", "title": "Java Fundamentals Guide", "type": "PDF", "url": "#", "uploadedBy": "admin"},
            {"id": "res6", "skillId": "html", "title": "HTML5 Complete Tutorial", "type": "VIDEO", "url": "#", "uploadedBy": "admin"},
            {"id": "res7", "skillId": "css", "title": "CSS Grid & Flexbox Masterclass", "type": "VIDEO", "url": "#", "uploadedBy": "admin"},
            {"id": "res8", "skillId": "marketing", "title": "Digital Marketing Fundamentals", "type": "PDF", "url": "#", "uploadedBy": "admin"}
        ],
        "swaps": [],
        "chats": [],
        "current_user": None
    }
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(default_data, f, indent=2)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class User(BaseModel):
    id: str
    name: str
    email: str
    role: Optional[str] = 'USER'
    skillsOffered: List[str] = []
    skillsWanted: List[str] = []
    matchedSwaps: List[str] = []
    completedCourses: List[str] = []

class Resource(BaseModel):
    id: str
    skillId: str
    title: str
    url: str
    type: str
    uploadedBy: str

class SwapRequest(BaseModel):
    id: str
    requesterId: str
    targetUserId: str
    skillId: str
    status: str
    timestamp: int

class ChatMessage(BaseModel):
    id: str
    swapId: str
    senderId: str
    senderName: str
    message: str
    timestamp: int

class Certificate(BaseModel):
    id: str
    userId: str
    userName: str
    skillId: str
    skillName: str
    issuedDate: str
    certificateId: str
    score: Optional[int] = None

# ===== USER ENDPOINTS =====
@app.get('/api/users', response_model=List[User])
def get_users():
    data = read_data()
    return data.get('users', [])

@app.get('/api/users/{user_id}')
def get_user(user_id: str):
    data = read_data()
    users = data.get('users', [])
    user = next((u for u in users if u['id'] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    return user

@app.post('/api/users', response_model=User)
def add_user(u: User):
    data = read_data()
    users = data.get('users', [])
    if any(x['email'].lower() == u.email.lower() for x in users):
        raise HTTPException(status_code=400, detail='User already exists')
    users.append(u.dict())
    data['users'] = users
    write_data(data)
    return u

@app.put('/api/users/{user_id}', response_model=User)
def update_user(user_id: str, u: User):
    data = read_data()
    users = data.get('users', [])
    for i, x in enumerate(users):
        if x['id'] == user_id:
            users[i] = u.dict()
            data['users'] = users
            write_data(data)
            # Update current user if it's the same user
            if data.get('current_user', {}).get('id') == user_id:
                data['current_user'] = u.dict()
                write_data(data)
            return u
    raise HTTPException(status_code=404, detail='User not found')

@app.post('/api/login')
def login(login_data: dict):
    email = login_data.get('email')
    if not email:
        raise HTTPException(status_code=400, detail='Email required')
    
    data = read_data()
    users = data.get('users', [])
    user = next((u for u in users if u['email'].lower() == email.lower()), None)
    
    if not user:
        raise HTTPException(status_code=401, detail='User not found')
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['id']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.post('/api/register')
def register(user_data: dict):
    data = read_data()
    users = data.get('users', [])
    
    if any(u['email'].lower() == user_data.get('email', '').lower() for u in users):
        raise HTTPException(status_code=400, detail='User already exists')
    
    new_user = {
        'id': user_data.get('id'),
        'name': user_data.get('name'),
        'email': user_data.get('email'),
        'role': user_data.get('role', 'USER'),
        'skillsOffered': user_data.get('skillsOffered', []),
        'skillsWanted': user_data.get('skillsWanted', []),
        'matchedSwaps': user_data.get('matchedSwaps', []),
        'completedCourses': user_data.get('completedCourses', [])
    }
    
    users.append(new_user)
    data['users'] = users
    data['current_user'] = new_user
    write_data(data)
    return new_user

@app.get('/api/current_user')
def get_current_user():
    data = read_data()
    return data.get('current_user')

@app.post('/api/current_user')
def set_current_user(u: dict):
    data = read_data()
    data['current_user'] = u
    write_data(data)
    return u

@app.delete('/api/current_user')
def clear_current_user():
    data = read_data()
    data['current_user'] = None
    write_data(data)
    return { 'ok': True }

# ===== RESOURCE ENDPOINTS =====
@app.get('/api/resources', response_model=List[Resource])
def get_resources():
    data = read_data()
    return data.get('resources', [])

@app.post('/api/resources', response_model=Resource)
def add_resource(r: Resource):
    data = read_data()
    resources = data.get('resources', [])
    resources.append(r.dict())
    data['resources'] = resources
    write_data(data)
    return r

@app.delete('/api/resources/{res_id}')
def delete_resource(res_id: str):
    data = read_data()
    resources = [r for r in data.get('resources', []) if r['id'] != res_id]
    data['resources'] = resources
    write_data(data)
    return { 'ok': True }

# ===== SKILLS ENDPOINTS =====
@app.get('/api/skills')
def get_skills():
    data = read_data()
    return data.get('skills', [])

@app.get('/api/skills/{skill_id}')
def get_skill(skill_id: str):
    data = read_data()
    skills = data.get('skills', [])
    skill = next((s for s in skills if s['id'] == skill_id), None)
    if not skill:
        raise HTTPException(status_code=404, detail='Skill not found')
    return skill

# ===== SWAP ENDPOINTS =====
@app.get('/api/swaps', response_model=List[SwapRequest])
def get_swaps():
    data = read_data()
    return data.get('swaps', [])

@app.post('/api/swaps', response_model=SwapRequest)
def create_swap(s: SwapRequest):
    data = read_data()
    swaps = data.get('swaps', [])
    swaps.append(s.dict())
    data['swaps'] = swaps
    write_data(data)
    return s

@app.put('/api/swaps/{swap_id}')
def update_swap(swap_id: str, s: SwapRequest):
    data = read_data()
    swaps = data.get('swaps', [])
    for i, x in enumerate(swaps):
        if x['id'] == swap_id:
            swaps[i] = s.dict()
            data['swaps'] = swaps
            write_data(data)
            return s
    raise HTTPException(status_code=404, detail='Swap not found')

# ===== CHAT ENDPOINTS =====
@app.get('/api/chats')
def get_chats(swapId: Optional[str] = None):
    data = read_data()
    chats = data.get('chats', [])
    if swapId:
        return [c for c in chats if c['swapId'] == swapId]
    return chats

@app.post('/api/chats', response_model=ChatMessage)
def post_chat(c: ChatMessage):
    data = read_data()
    chats = data.get('chats', [])
    chats.append(c.dict())
    data['chats'] = chats
    write_data(data)
    return c

# ===== QUIZ ENDPOINTS =====
@app.get('/api/skills/{skill_id}/quiz')
def get_skill_quiz(skill_id: str):
    data = read_data()
    skills = data.get('skills', [])
    skill = next((s for s in skills if s['id'] == skill_id), None)
    if not skill:
        raise HTTPException(status_code=404, detail='Skill not found')
    return skill.get('quiz', [])

@app.post('/api/quiz/submit')
def submit_quiz(submission: dict):
    userId = submission.get('userId')
    skillId = submission.get('skillId')
    answers = submission.get('answers', [])
    
    data = read_data()
    skills = data.get('skills', [])
    skill = next((s for s in skills if s['id'] == skillId), None)
    
    if not skill:
        raise HTTPException(status_code=404, detail='Skill not found')
    
    quiz = skill.get('quiz', [])
    if not quiz:
        raise HTTPException(status_code=400, detail='No quiz found for this skill')
    
    # Calculate score
    correct_count = 0
    for i, answer in enumerate(answers):
        if i < len(quiz) and answer == quiz[i].get('correctAnswer'):
            correct_count += 1
    
    score = (correct_count / len(quiz)) * 100 if quiz else 0
    
    # If score is 70% or higher, create certificate
    if score >= 70:
        users = data.get('users', [])
        user = next((u for u in users if u['id'] == userId), None)
        if user:
            cert_id = f"CERT_{userId}_{skillId}_{int(datetime.utcnow().timestamp())}"
            certificate = {
                'id': cert_id,
                'userId': userId,
                'userName': user.get('name'),
                'skillId': skillId,
                'skillName': skill.get('name'),
                'issuedDate': datetime.utcnow().strftime('%B %d, %Y'),
                'certificateId': cert_id.split('_')[2],
                'score': int(score)
            }
            
            certificates = data.get('certificates', [])
            certificates.append(certificate)
            data['certificates'] = certificates
            
            # Add to completed courses
            if skillId not in user.get('completedCourses', []):
                user['completedCourses'].append(skillId)
                write_data(data)
            
            return {
                'score': int(score),
                'passed': True,
                'certificate': certificate
            }
    
    return {
        'score': int(score),
        'passed': False,
        'message': 'Score must be 70% or higher to earn a certificate. Try again!'
    }

# ===== CERTIFICATE ENDPOINTS =====
@app.get('/api/certificates')
def get_certificates(userId: Optional[str] = None):
    data = read_data()
    certificates = data.get('certificates', [])
    if userId:
        return [c for c in certificates if c['userId'] == userId]
    return certificates

@app.get('/api/certificates/{cert_id}')
def get_certificate(cert_id: str):
    data = read_data()
    certificates = data.get('certificates', [])
    cert = next((c for c in certificates if c['id'] == cert_id), None)
    if not cert:
        raise HTTPException(status_code=404, detail='Certificate not found')
    return cert

# ===== HEALTH CHECK =====
@app.get('/api/health')
def health():
    return { 'status': 'ok' }

if __name__ == '__main__':
    import uvicorn
    try:
        uvicorn.run(app, host='127.0.0.1', port=8000)
    except Exception as e:
        print(f"Error starting server: {e}")
        import traceback
        traceback.print_exc()
