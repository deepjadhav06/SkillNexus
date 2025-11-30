from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import json
import threading
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data.json')
lock = threading.Lock()

def read_data():
    with lock:
        if not os.path.exists(DATA_FILE):
            init_data()
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)

def write_data(data):
    with lock:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)

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
    
    data['current_user'] = user
    write_data(data)
    return user

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

# ===== HEALTH CHECK =====
@app.get('/api/health')
def health():
    return { 'status': 'ok' }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
