from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from jose import JWTError, jwt
from sqlalchemy import create_engine, Column, String, Text, Integer, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import json

load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./skillnexus.db")
SECRET_KEY = os.getenv("SECRET_KEY", "your_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# For Railway PostgreSQL, convert postgres:// to postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    pool_pre_ping=True  # Test connections before using them
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ===== DATABASE MODELS =====
class UserModel(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String, default="USER")
    skills_offered = Column(Text, default="[]")
    skills_wanted = Column(Text, default="[]")
    matched_swaps = Column(Text, default="[]")
    completed_courses = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ResourceModel(Base):
    __tablename__ = "resources"
    id = Column(String, primary_key=True, index=True)
    skill_id = Column(String, index=True)
    title = Column(String)
    type = Column(String)
    url = Column(String)
    uploaded_by = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class SwapModel(Base):
    __tablename__ = "swaps"
    id = Column(String, primary_key=True, index=True)
    requester_id = Column(String, index=True)
    target_user_id = Column(String, index=True)
    skill_id = Column(String)
    status = Column(String, default="PENDING")
    timestamp = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatModel(Base):
    __tablename__ = "chats"
    id = Column(String, primary_key=True, index=True)
    swap_id = Column(String, index=True)
    sender_id = Column(String)
    sender_name = Column(String)
    message = Column(Text)
    timestamp = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

class CertificateModel(Base):
    __tablename__ = "certificates"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    user_name = Column(String)
    skill_id = Column(String)
    skill_name = Column(String)
    issued_date = Column(String)
    certificate_id = Column(String)
    score = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# ===== PYDANTIC SCHEMAS =====
class User(BaseModel):
    id: str
    name: str
    email: str
    role: Optional[str] = 'USER'
    skillsOffered: List[str] = []
    skillsWanted: List[str] = []
    matchedSwaps: List[str] = []
    completedCourses: List[str] = []

    class Config:
        from_attributes = True

class Resource(BaseModel):
    id: str
    skillId: str
    title: str
    url: str
    type: str
    uploadedBy: str

    class Config:
        from_attributes = True

class SwapRequest(BaseModel):
    id: str
    requesterId: str
    targetUserId: str
    skillId: str
    status: str
    timestamp: int

    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    id: str
    swapId: str
    senderId: str
    senderName: str
    message: str
    timestamp: int

    class Config:
        from_attributes = True

class Certificate(BaseModel):
    id: str
    userId: str
    userName: str
    skillId: str
    skillName: str
    issuedDate: str
    certificateId: str
    score: Optional[int] = None

    class Config:
        from_attributes = True

# ===== SECURITY =====
security = HTTPBearer()

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

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ===== FASTAPI APP =====
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== INITIALIZATION =====
def init_db():
    """Initialize database with demo data if empty"""
    db = SessionLocal()
    try:
        # Check if users exist
        if db.query(UserModel).count() == 0:
            demo_users = [
                UserModel(
                    id="admin",
                    name="Platform Owner",
                    email="owner@skillnexus.com",
                    role="OWNER",
                    skills_offered="[]",
                    skills_wanted="[]",
                    matched_swaps="[]",
                    completed_courses="[]"
                ),
                UserModel(
                    id="u1",
                    name="Alice Johnson",
                    email="alice@example.com",
                    role="USER",
                    skills_offered=json.dumps(["react", "design"]),
                    skills_wanted=json.dumps(["python"]),
                    matched_swaps="[]",
                    completed_courses="[]"
                ),
                UserModel(
                    id="u2",
                    name="Bob Smith",
                    email="bob@example.com",
                    role="USER",
                    skills_offered=json.dumps(["python", "marketing", "java"]),
                    skills_wanted=json.dumps(["react", "css"]),
                    matched_swaps="[]",
                    completed_courses="[]"
                ),
            ]
            for user in demo_users:
                db.add(user)
            db.commit()
        
        # Initialize resources
        if db.query(ResourceModel).count() == 0:
            demo_resources = [
                ResourceModel(id="res1", skill_id="react", title="Advanced React Patterns PDF", type="PDF", url="#", uploaded_by="admin"),
                ResourceModel(id="res2", skill_id="react", title="React Hooks Deep Dive", type="VIDEO", url="#", uploaded_by="admin"),
                ResourceModel(id="res3", skill_id="python", title="FastAPI Documentation", type="LINK", url="https://fastapi.tiangolo.com", uploaded_by="admin"),
            ]
            for resource in demo_resources:
                db.add(resource)
            db.commit()
    finally:
        db.close()

# ===== USER ENDPOINTS =====
@app.get('/api/users', response_model=List[User])
def get_users(db: Session = Depends(get_db)):
    users = db.query(UserModel).all()
    return [
        User(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            skillsOffered=json.loads(u.skills_offered),
            skillsWanted=json.loads(u.skills_wanted),
            matchedSwaps=json.loads(u.matched_swaps),
            completedCourses=json.loads(u.completed_courses)
        ) for u in users
    ]

@app.get('/api/users/{user_id}')
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    return User(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        skillsOffered=json.loads(user.skills_offered),
        skillsWanted=json.loads(user.skills_wanted),
        matchedSwaps=json.loads(user.matched_swaps),
        completedCourses=json.loads(user.completed_courses)
    )

@app.post('/api/users', response_model=User)
def add_user(u: User, db: Session = Depends(get_db)):
    existing = db.query(UserModel).filter(UserModel.email == u.email).first()
    if existing:
        raise HTTPException(status_code=400, detail='User already exists')
    
    new_user = UserModel(
        id=u.id,
        name=u.name,
        email=u.email,
        role=u.role,
        skills_offered=json.dumps(u.skillsOffered),
        skills_wanted=json.dumps(u.skillsWanted),
        matched_swaps=json.dumps(u.matchedSwaps),
        completed_courses=json.dumps(u.completedCourses)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return u

@app.put('/api/users/{user_id}', response_model=User)
def update_user(user_id: str, u: User, db: Session = Depends(get_db)):
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    user.name = u.name
    user.email = u.email
    user.role = u.role
    user.skills_offered = json.dumps(u.skillsOffered)
    user.skills_wanted = json.dumps(u.skillsWanted)
    user.matched_swaps = json.dumps(u.matchedSwaps)
    user.completed_courses = json.dumps(u.completedCourses)
    user.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(user)
    return u

@app.post('/api/login')
def login(login_data: dict, db: Session = Depends(get_db)):
    email = login_data.get('email')
    if not email:
        raise HTTPException(status_code=400, detail='Email required')
    
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail='User not found')
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.id}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": User(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            skillsOffered=json.loads(user.skills_offered),
            skillsWanted=json.loads(user.skills_wanted),
            matchedSwaps=json.loads(user.matched_swaps),
            completedCourses=json.loads(user.completed_courses)
        )
    }

@app.post('/api/register')
def register(user_data: dict, db: Session = Depends(get_db)):
    existing = db.query(UserModel).filter(UserModel.email == user_data.get('email', '').lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail='User already exists')
    
    new_user = UserModel(
        id=user_data.get('id'),
        name=user_data.get('name'),
        email=user_data.get('email'),
        role=user_data.get('role', 'USER'),
        skills_offered=json.dumps(user_data.get('skillsOffered', [])),
        skills_wanted=json.dumps(user_data.get('skillsWanted', [])),
        matched_swaps="[]",
        completed_courses="[]"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# ===== RESOURCE ENDPOINTS =====
@app.get('/api/resources', response_model=List[Resource])
def get_resources(db: Session = Depends(get_db)):
    resources = db.query(ResourceModel).all()
    return [
        Resource(
            id=r.id,
            skillId=r.skill_id,
            title=r.title,
            type=r.type,
            url=r.url,
            uploadedBy=r.uploaded_by
        ) for r in resources
    ]

@app.post('/api/resources', response_model=Resource)
def add_resource(r: Resource, db: Session = Depends(get_db)):
    new_resource = ResourceModel(
        id=r.id,
        skill_id=r.skillId,
        title=r.title,
        type=r.type,
        url=r.url,
        uploaded_by=r.uploadedBy
    )
    db.add(new_resource)
    db.commit()
    db.refresh(new_resource)
    return r

@app.delete('/api/resources/{res_id}')
def delete_resource(res_id: str, db: Session = Depends(get_db)):
    db.query(ResourceModel).filter(ResourceModel.id == res_id).delete()
    db.commit()
    return {'ok': True}

# ===== SWAP ENDPOINTS =====
@app.get('/api/swaps', response_model=List[SwapRequest])
def get_swaps(db: Session = Depends(get_db)):
    swaps = db.query(SwapModel).all()
    return [
        SwapRequest(
            id=s.id,
            requesterId=s.requester_id,
            targetUserId=s.target_user_id,
            skillId=s.skill_id,
            status=s.status,
            timestamp=s.timestamp
        ) for s in swaps
    ]

@app.post('/api/swaps', response_model=SwapRequest)
def create_swap(s: SwapRequest, db: Session = Depends(get_db)):
    new_swap = SwapModel(
        id=s.id,
        requester_id=s.requesterId,
        target_user_id=s.targetUserId,
        skill_id=s.skillId,
        status=s.status,
        timestamp=s.timestamp
    )
    db.add(new_swap)
    db.commit()
    db.refresh(new_swap)
    return s

@app.put('/api/swaps/{swap_id}')
def update_swap(swap_id: str, s: SwapRequest, db: Session = Depends(get_db)):
    swap = db.query(SwapModel).filter(SwapModel.id == swap_id).first()
    if not swap:
        raise HTTPException(status_code=404, detail='Swap not found')
    
    swap.status = s.status
    db.commit()
    db.refresh(swap)
    return s

# ===== CHAT ENDPOINTS =====
@app.get('/api/chats')
def get_chats(swapId: Optional[str] = None, db: Session = Depends(get_db)):
    if swapId:
        chats = db.query(ChatModel).filter(ChatModel.swap_id == swapId).all()
    else:
        chats = db.query(ChatModel).all()
    
    return [
        ChatMessage(
            id=c.id,
            swapId=c.swap_id,
            senderId=c.sender_id,
            senderName=c.sender_name,
            message=c.message,
            timestamp=c.timestamp
        ) for c in chats
    ]

@app.post('/api/chats', response_model=ChatMessage)
def post_chat(c: ChatMessage, db: Session = Depends(get_db)):
    new_chat = ChatModel(
        id=c.id,
        swap_id=c.swapId,
        sender_id=c.senderId,
        sender_name=c.senderName,
        message=c.message,
        timestamp=c.timestamp
    )
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return c

# ===== CERTIFICATE ENDPOINTS =====
@app.post('/api/certificates')
def add_certificate(c: Certificate, db: Session = Depends(get_db)):
    new_cert = CertificateModel(
        id=c.id,
        user_id=c.userId,
        user_name=c.userName,
        skill_id=c.skillId,
        skill_name=c.skillName,
        issued_date=c.issuedDate,
        certificate_id=c.certificateId,
        score=c.score
    )
    db.add(new_cert)
    db.commit()
    return c

@app.get('/api/certificates/{user_id}')
def get_user_certificates(user_id: str, db: Session = Depends(get_db)):
    certs = db.query(CertificateModel).filter(CertificateModel.user_id == user_id).all()
    return [
        Certificate(
            id=c.id,
            userId=c.user_id,
            userName=c.user_name,
            skillId=c.skill_id,
            skillName=c.skill_name,
            issuedDate=c.issued_date,
            certificateId=c.certificate_id,
            score=c.score
        ) for c in certs
    ]

# ===== STARTUP =====
@app.on_event("startup")
async def startup():
    init_db()

if __name__ == "__main__":
    init_db()
