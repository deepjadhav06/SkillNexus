import { User, Resource, SwapRequest, UserRole, ChatMessage } from '../types';
import { MOCK_USERS, MOCK_RESOURCES } from '../constants';

const USERS_KEY = 'skillnexus_users';
const RESOURCES_KEY = 'skillnexus_resources';
const SWAPS_KEY = 'skillnexus_swaps';
const CURRENT_USER_KEY = 'skillnexus_current_user';
const CHATS_KEY = 'skillnexus_chats';
const API_BASE = (import.meta.env?.VITE_API_BASE as string) || 'http://localhost:8000/api';

// Initialize Data - BACKEND IS SOURCE OF TRUTH
// Only use mock data if localStorage is empty and backend is unavailable
const initData = async () => {
  try {
    // Try to get backend data first
    const backendUsers = await tryFetch(`${API_BASE}/users`);
    const backendResources = await tryFetch(`${API_BASE}/resources`);
    
    if (backendUsers) {
      localStorage.setItem(USERS_KEY, JSON.stringify(backendUsers));
    } else if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
    }
    
    if (backendResources) {
      localStorage.setItem(RESOURCES_KEY, JSON.stringify(backendResources));
    } else if (!localStorage.getItem(RESOURCES_KEY)) {
      localStorage.setItem(RESOURCES_KEY, JSON.stringify(MOCK_RESOURCES));
    }
    
    if (!localStorage.getItem(SWAPS_KEY)) {
      localStorage.setItem(SWAPS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(CHATS_KEY)) {
      localStorage.setItem(CHATS_KEY, JSON.stringify([]));
    }
  } catch (e) {
    console.warn('Error initializing data:', e);
    // Fallback to mock data if nothing is in localStorage
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
    }
    if (!localStorage.getItem(RESOURCES_KEY)) {
      localStorage.setItem(RESOURCES_KEY, JSON.stringify(MOCK_RESOURCES));
    }
    if (!localStorage.getItem(SWAPS_KEY)) {
      localStorage.setItem(SWAPS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(CHATS_KEY)) {
      localStorage.setItem(CHATS_KEY, JSON.stringify([]));
    }
  }
};

// Initialize synchronously with async support
initData().catch(e => console.warn('Initialization error:', e));

// Helper to try backend first, fallback to localStorage
const tryFetch = async (url: string, options?: RequestInit) => {
  try {
    const startTime = performance.now();
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const duration = (performance.now() - startTime).toFixed(2);
    if (parseFloat(duration) > 500) console.warn(`Slow endpoint: ${url} took ${duration}ms`);
    return data;
  } catch (e) {
    console.warn(`Backend call failed for ${url}:`, e instanceof Error ? e.message : e);
    return null;
  }
};

export const mockService = {
  login: async (email: string): Promise<User | null> => {
    // Try backend first
    const backendUser = await tryFetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    if (backendUser) {
      // Sync all backend data to localStorage when login succeeds
      const backendUsers = await tryFetch(`${API_BASE}/users`);
      const backendResources = await tryFetch(`${API_BASE}/resources`);
      const backendSwaps = await tryFetch(`${API_BASE}/swaps`);
      
      if (backendUsers) localStorage.setItem(USERS_KEY, JSON.stringify(backendUsers));
      if (backendResources) localStorage.setItem(RESOURCES_KEY, JSON.stringify(backendResources));
      if (backendSwaps) localStorage.setItem(SWAPS_KEY, JSON.stringify(backendSwaps));
      
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(backendUser));
      return backendUser;
    }

    // Fallback to localStorage
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  register: async (name: string, email: string, skillsOffered: string[], skillsWanted: string[]): Promise<User> => {
    const newUser: User = {
        id: 'u_' + Date.now(),
        name,
        email,
        role: UserRole.USER,
        skillsOffered,
        skillsWanted,
        matchedSwaps: [],
        completedCourses: []
    };

    // Try backend first
    const backendUser = await tryFetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });

    if (backendUser) {
      // Sync all backend data to localStorage when register succeeds
      const backendUsers = await tryFetch(`${API_BASE}/users`);
      const backendResources = await tryFetch(`${API_BASE}/resources`);
      const backendSwaps = await tryFetch(`${API_BASE}/swaps`);
      
      if (backendUsers) localStorage.setItem(USERS_KEY, JSON.stringify(backendUsers));
      if (backendResources) localStorage.setItem(RESOURCES_KEY, JSON.stringify(backendResources));
      if (backendSwaps) localStorage.setItem(SWAPS_KEY, JSON.stringify(backendSwaps));
      
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(backendUser));
      return backendUser;
    }

    // Fallback to localStorage
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.find((u: User) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("User with this email already exists.");
    }

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  logout: async () => {
    // Try backend logout
    await tryFetch(`${API_BASE}/current_user`, { method: 'DELETE' });
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: async (): Promise<User | null> => {
    // Try backend first
    const backendUser = await tryFetch(`${API_BASE}/current_user`);
    if (backendUser) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(backendUser));
      return backendUser;
    }

    // Fallback to localStorage
    const curRaw = localStorage.getItem(CURRENT_USER_KEY);
    if (!curRaw) return null;
    try {
      const cur = JSON.parse(curRaw) as User;
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const found = users.find((u: User) => u.id === cur.id);
      return found || cur;
    } catch (e) {
      return null;
    }
  },

  getUsers: async (): Promise<User[]> => {
    // Try backend first
    const backendUsers = await tryFetch(`${API_BASE}/users`);
    if (backendUsers) {
      localStorage.setItem(USERS_KEY, JSON.stringify(backendUsers));
      return backendUsers;
    }

    // Fallback to localStorage
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  },

  updateUser: async (user: User) => {
    // Try backend first
    const updated = await tryFetch(`${API_BASE}/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    if (updated) {
      localStorage.setItem(USERS_KEY, JSON.stringify([
        ...JSON.parse(localStorage.getItem(USERS_KEY) || '[]').filter((u: User) => u.id !== user.id),
        updated
      ]));
      const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || '{}');
      if (currentUser.id === user.id) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
      }
      return;
    }

    // Fallback to localStorage
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const idx = users.findIndex((u: User) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || '{}');
      if (currentUser.id === user.id) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      }
    }
  },

  getUserById: async (userId: string): Promise<User | null> => {
    const users = await mockService.getUsers();
    return users.find((u: User) => u.id === userId) || null;
  },

  getResources: async (): Promise<Resource[]> => {
    // Try backend first
    const backendResources = await tryFetch(`${API_BASE}/resources`);
    if (backendResources) {
      localStorage.setItem(RESOURCES_KEY, JSON.stringify(backendResources));
      return backendResources;
    }

    // Fallback to localStorage
    return JSON.parse(localStorage.getItem(RESOURCES_KEY) || '[]');
  },

  addResource: async (resource: Resource) => {
    // Try backend first
    const added = await tryFetch(`${API_BASE}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resource)
    });

    if (added) {
      const resources = JSON.parse(localStorage.getItem(RESOURCES_KEY) || '[]');
      resources.push(added);
      localStorage.setItem(RESOURCES_KEY, JSON.stringify(resources));
      return;
    }

    // Fallback to localStorage
    const resources = JSON.parse(localStorage.getItem(RESOURCES_KEY) || '[]');
    resources.push(resource);
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(resources));
  },

  deleteResource: async (resourceId: string) => {
    // Try backend first
    const deleted = await tryFetch(`${API_BASE}/resources/${resourceId}`, { method: 'DELETE' });
    
    if (deleted) {
      const resources = JSON.parse(localStorage.getItem(RESOURCES_KEY) || '[]');
      const filtered = resources.filter((r: Resource) => r.id !== resourceId);
      localStorage.setItem(RESOURCES_KEY, JSON.stringify(filtered));
      return;
    }

    // Fallback to localStorage
    const resources = JSON.parse(localStorage.getItem(RESOURCES_KEY) || '[]');
    const filtered = resources.filter((r: Resource) => r.id !== resourceId);
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(filtered));
  },

  getSwapRequests: async (): Promise<SwapRequest[]> => {
    // Try backend first
    const backendSwaps = await tryFetch(`${API_BASE}/swaps`);
    if (backendSwaps) {
      localStorage.setItem(SWAPS_KEY, JSON.stringify(backendSwaps));
      return backendSwaps;
    }

    // Fallback to localStorage
    return JSON.parse(localStorage.getItem(SWAPS_KEY) || '[]');
  },

  createSwapRequest: async (requesterId: string, targetUserId: string, skillId: string) => {
    const newSwap: SwapRequest = {
      id: Date.now().toString(),
      requesterId,
      targetUserId,
      skillId,
      status: 'PENDING',
      timestamp: Date.now(),
    };

    // Try backend first
    const created = await tryFetch(`${API_BASE}/swaps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSwap)
    });

    if (created) {
      const swaps = JSON.parse(localStorage.getItem(SWAPS_KEY) || '[]');
      swaps.push(created);
      localStorage.setItem(SWAPS_KEY, JSON.stringify(swaps));
      return;
    }

    // Fallback to localStorage
    const swaps = JSON.parse(localStorage.getItem(SWAPS_KEY) || '[]');
    swaps.push(newSwap);
    localStorage.setItem(SWAPS_KEY, JSON.stringify(swaps));
  },

  acceptSwap: async (swapId: string) => {
    // Get swaps
    const swaps: SwapRequest[] = JSON.parse(localStorage.getItem(SWAPS_KEY) || '[]');
    const swapIdx = swaps.findIndex(s => s.id === swapId);
    if (swapIdx === -1) return;

    swaps[swapIdx].status = 'ACCEPTED';

    // Try backend first
    const updated = await tryFetch(`${API_BASE}/swaps/${swapId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(swaps[swapIdx])
    });

    if (updated) {
      swaps[swapIdx] = updated;
      localStorage.setItem(SWAPS_KEY, JSON.stringify(swaps));
      
      // Update users matchedSwaps
      const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const reqUserIdx = users.findIndex(u => u.id === swaps[swapIdx].requesterId);
      const targetUserIdx = users.findIndex(u => u.id === swaps[swapIdx].targetUserId);

      if (reqUserIdx !== -1) users[reqUserIdx].matchedSwaps.push(swapId);
      if (targetUserIdx !== -1) users[targetUserIdx].matchedSwaps.push(swapId);

      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      // Update current user if it's one of them
      const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || '{}');
      if (currentUser.id === users[targetUserIdx]?.id) {
         localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[targetUserIdx]));
      }
      return;
    }

    // Fallback to localStorage
    localStorage.setItem(SWAPS_KEY, JSON.stringify(swaps));
    
    const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const reqUserIdx = users.findIndex(u => u.id === swaps[swapIdx].requesterId);
    const targetUserIdx = users.findIndex(u => u.id === swaps[swapIdx].targetUserId);

    if (reqUserIdx !== -1) users[reqUserIdx].matchedSwaps.push(swapId);
    if (targetUserIdx !== -1) users[targetUserIdx].matchedSwaps.push(swapId);

    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || '{}');
    if (currentUser.id === users[targetUserIdx]?.id) {
       localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[targetUserIdx]));
    }
  },

  completeCourse: async (userId: string, skillId: string) => {
      const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      const uIdx = users.findIndex(u => u.id === userId);
      if (uIdx !== -1 && !users[uIdx].completedCourses.includes(skillId)) {
          users[uIdx].completedCourses.push(skillId);
          
          // Try backend update
          const updated = await tryFetch(`${API_BASE}/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(users[uIdx])
          });

          localStorage.setItem(USERS_KEY, JSON.stringify(users));
          
          const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || '{}');
          if (currentUser.id === userId) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(users[uIdx]));
          }
      }
  },

  // Chat Methods
  sendMessage: async (swapId: string, senderId: string, senderName: string, message: string) => {
    const newMessage: ChatMessage = {
      id: 'msg_' + Date.now(),
      swapId,
      senderId,
      senderName,
      message,
      timestamp: Date.now(),
    };

    // Try backend first
    const sent = await tryFetch(`${API_BASE}/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMessage)
    });

    if (sent) {
      const chats = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]');
      chats.push(sent);
      localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
      return sent;
    }

    // Fallback to localStorage
    const chats = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]');
    chats.push(newMessage);
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
    return newMessage;
  },

  getChatMessages: async (swapId: string): Promise<ChatMessage[]> => {
    // Try backend first
    const backendChats = await tryFetch(`${API_BASE}/chats?swapId=${swapId}`);
    if (backendChats) {
      return backendChats;
    }

    // Fallback to localStorage
    const chats = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]');
    return chats.filter((chat: ChatMessage) => chat.swapId === swapId).sort((a: ChatMessage, b: ChatMessage) => a.timestamp - b.timestamp);
  },

  getAllChatsForUser: async (userId: string): Promise<{ swapId: string; otherUserName: string; lastMessage: string; timestamp: number }[]> => {
    const swaps: SwapRequest[] = await mockService.getSwapRequests();
    const chats = JSON.parse(localStorage.getItem(CHATS_KEY) || '[]');
    const users: User[] = await mockService.getUsers();

    const userSwaps = swaps.filter(s => (s.requesterId === userId || s.targetUserId === userId) && s.status === 'ACCEPTED');
    
    return userSwaps.map(swap => {
      const otherUserId = swap.requesterId === userId ? swap.targetUserId : swap.requesterId;
      const otherUser = users.find(u => u.id === otherUserId);
      const swapChats = chats.filter((c: ChatMessage) => c.swapId === swap.id);
      const lastChat = swapChats.length > 0 ? swapChats[swapChats.length - 1] : null;

      return {
        swapId: swap.id,
        otherUserName: otherUser?.name || 'Unknown',
        lastMessage: lastChat?.message || 'No messages yet',
        timestamp: lastChat?.timestamp || swap.timestamp,
      };
    });
  },

  getSkills: async () => {
    // Try backend first
    const backendSkills = await tryFetch(`${API_BASE}/skills`);
    if (backendSkills) {
      return backendSkills;
    }

    // Fallback to constants
    const { SKILLS } = await import('../constants');
    return SKILLS;
  },

  getSkillById: async (skillId: string) => {
    // Try backend first
    const backendSkill = await tryFetch(`${API_BASE}/skills/${skillId}`);
    if (backendSkill) {
      return backendSkill;
    }

    // Fallback to constants
    const { SKILLS } = await import('../constants');
    return SKILLS.find(s => s.id === skillId) || null;
  },

  getSkillQuiz: async (skillId: string) => {
    // Try backend first
    const backendQuiz = await tryFetch(`${API_BASE}/skills/${skillId}/quiz`);
    if (backendQuiz) {
      return backendQuiz;
    }
    
    // Fallback to mock quiz data
    const mockQuizzes: Record<string, any[]> = {
      python: [
        { id: 'q1', question: 'What is the correct way to create a function in Python?', options: ['func myFunc() {}', 'def myFunc():', 'function myFunc() {}', 'define myFunc():'], correctAnswer: 1 },
        { id: 'q2', question: 'Which of the following is a mutable data type in Python?', options: ['tuple', 'string', 'list', 'frozenset'], correctAnswer: 2 },
        { id: 'q3', question: 'What does the "len()" function do?', options: ['Returns length of object', 'Creates a new list', 'Converts to string', 'Checks if object exists'], correctAnswer: 0 },
        { id: 'q4', question: 'How do you import a module in Python?', options: ['include module', 'import module', 'require module', 'use module'], correctAnswer: 1 },
        { id: 'q5', question: 'What is the purpose of the "self" parameter in Python classes?', options: ['Define static variables', 'Reference the instance of the class', 'Create private variables', 'Define class methods'], correctAnswer: 1 }
      ],
      java: [
        { id: 'q1', question: 'What is the entry point for a Java application?', options: ['main()', 'start()', 'init()', 'run()'], correctAnswer: 0 },
        { id: 'q2', question: 'Which keyword is used for inheritance in Java?', options: ['inherit', 'extends', 'implements', 'override'], correctAnswer: 1 },
        { id: 'q3', question: 'What is the difference between "==" and "equals()" in Java?', options: ['No difference', '== compares reference, equals() compares content', '== is faster', 'equals() is for strings only'], correctAnswer: 1 },
        { id: 'q4', question: 'Which access modifier is most restrictive?', options: ['public', 'protected', 'private', 'default'], correctAnswer: 2 },
        { id: 'q5', question: 'What is the purpose of the "static" keyword?', options: ['Prevents change', 'Creates class-level members', 'Improves performance', 'Enables inheritance'], correctAnswer: 1 }
      ],
      javascript: [
        { id: 'q1', question: 'What is the difference between "let" and "var" in JavaScript?', options: ['No difference', 'let is block-scoped, var is function-scoped', 'var is faster', 'let is older'], correctAnswer: 1 },
        { id: 'q2', question: 'What does "this" refer to in JavaScript?', options: ['Global object', 'Current object context', 'Previous function', 'Parent element'], correctAnswer: 1 },
        { id: 'q3', question: 'Which method is used to parse JSON?', options: ['parseJSON()', 'JSON.parse()', 'parse()', 'stringToObject()'], correctAnswer: 1 },
        { id: 'q4', question: 'What is a closure in JavaScript?', options: ['A function that ends', 'A function with access to outer scope variables', 'A closed loop', 'An error state'], correctAnswer: 1 },
        { id: 'q5', question: 'What does "async" keyword do?', options: ['Makes function asynchronous', 'Creates a promise', 'Enables async/await syntax', 'All of the above'], correctAnswer: 3 }
      ],
      react: [
        { id: 'q1', question: 'What is the purpose of hooks in React?', options: ['Connect to HTML', 'Manage state in functional components', 'Handle errors', 'Create CSS styles'], correctAnswer: 1 },
        { id: 'q2', question: 'Which hook is used to manage component state?', options: ['useContext', 'useState', 'useEffect', 'useReducer'], correctAnswer: 1 },
        { id: 'q3', question: 'What is the virtual DOM?', options: ['Hidden DOM', 'In-memory representation of the real DOM', 'A library', 'CSS framework'], correctAnswer: 1 },
        { id: 'q4', question: 'When does useEffect run?', options: ['Only once', 'Before render', 'After every render', 'Both B and C'], correctAnswer: 2 },
        { id: 'q5', question: 'What is prop drilling?', options: ['Drilling into HTML', 'Passing props through multiple levels', 'Creating new props', 'Props management'], correctAnswer: 1 }
      ],
      html: [
        { id: 'q1', question: 'What does HTML stand for?', options: ['Hypertext Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'], correctAnswer: 0 },
        { id: 'q2', question: 'Which tag defines a hyperlink?', options: ['<link>', '<a>', '<href>', '<url>'], correctAnswer: 1 },
        { id: 'q3', question: 'What is the purpose of the <meta> tag?', options: ['Define styles', 'Provide metadata about document', 'Create menus', 'Link external files'], correctAnswer: 1 },
        { id: 'q4', question: 'Which tag is used for the largest heading?', options: ['<h6>', '<heading>', '<h1>', '<header>'], correctAnswer: 2 },
        { id: 'q5', question: 'What does the "alt" attribute in <img> do?', options: ['Alternate image', 'Alternative text if image fails', 'Image alignment', 'Image alternative size'], correctAnswer: 1 }
      ],
      css: [
        { id: 'q1', question: 'What does CSS stand for?', options: ['Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style System', 'Coded Style Sheets'], correctAnswer: 1 },
        { id: 'q2', question: 'Which property changes text color?', options: ['text-color', 'color', 'font-color', 'letter-color'], correctAnswer: 1 },
        { id: 'q3', question: 'What is the CSS box model?', options: ['CSS file format', 'Margin, Border, Padding, Content', 'Grid system', 'Animation model'], correctAnswer: 1 },
        { id: 'q4', question: 'Which selector has highest specificity?', options: ['Element selector', 'Class selector', 'ID selector', 'Universal selector'], correctAnswer: 2 },
        { id: 'q5', question: 'What does "display: flex" do?', options: ['Hides element', 'Creates flexible layout container', 'Flexes animation', 'Flexible font'], correctAnswer: 1 }
      ],
      design: [
        { id: 'q1', question: 'What is UX design?', options: ['User Experience design', 'User Extra design', 'Utility Extension', 'Unique XML'], correctAnswer: 0 },
        { id: 'q2', question: 'What is the purpose of wireframes?', options: ['Final design', 'Basic layout blueprint', 'Color scheme', 'Marketing materials'], correctAnswer: 1 },
        { id: 'q3', question: 'Which principle focuses on consistency?', options: ['Contrast', 'Gestalt principle', 'Design system', 'Color theory'], correctAnswer: 2 },
        { id: 'q4', question: 'What is accessibility in design?', options: ['Easy access to code', 'Ensuring design is usable by everyone', 'Simple design', 'Fast loading'], correctAnswer: 1 },
        { id: 'q5', question: 'What is a user persona?', options: ['Real user', 'Fictional representation of target user', 'User profile data', 'User journey'], correctAnswer: 1 }
      ]
    };
    
    return mockQuizzes[skillId] || [];
  },

  submitQuiz: async (userId: string, skillId: string, answers: number[]) => {
    // Try backend first
    const backendResult = await tryFetch(`${API_BASE}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, skillId, answers })
    });

    if (backendResult) {
      return backendResult;
    }

    // Fallback: simple scoring
    const quiz = await mockService.getSkillQuiz(skillId);
    let correct = 0;
    answers.forEach((answer, i) => {
      if (quiz[i] && answer === quiz[i].correctAnswer) {
        correct++;
      }
    });

    const score = (correct / quiz.length) * 100;
    if (score >= 70) {
      const users: User[] = await mockService.getUsers();
      const user = users.find(u => u.id === userId);
      const skills = await mockService.getSkills();
      const skill = skills.find(s => s.id === skillId);

      const certificate = {
        id: `cert_${userId}_${skillId}_${Date.now()}`,
        userId,
        userName: user?.name || 'User',
        skillId,
        skillName: skill?.name || 'Unknown Skill',
        issuedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        certificateId: `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        score: Math.round(score)
      };

      return {
        score: Math.round(score),
        passed: true,
        certificate
      };
    }

    return {
      score: Math.round(score),
      passed: false,
      message: 'Score must be 70% or higher to earn a certificate. Try again!'
    };
  },

  getCertificates: async (userId?: string) => {
    // Try backend first
    const url = userId ? `${API_BASE}/certificates?userId=${userId}` : `${API_BASE}/certificates`;
    const backendCerts = await tryFetch(url);
    if (backendCerts) {
      return backendCerts;
    }
    return [];
  },

  getCertificateById: async (certId: string) => {
    const backendCert = await tryFetch(`${API_BASE}/certificates/${certId}`);
    if (backendCert) {
      return backendCert;
    }
    return null;
  }
};