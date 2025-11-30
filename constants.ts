import { Skill, User, UserRole, Resource } from './types';

export const SKILLS: Skill[] = [
  { id: 'react', name: 'React Development', category: 'Tech' },
  { id: 'python', name: 'Python Backend', category: 'Tech' },
  { id: 'java', name: 'Java Development', category: 'Tech' },
  { id: 'html', name: 'HTML', category: 'Tech' },
  { id: 'css', name: 'CSS & Styling', category: 'Tech' },
  { id: 'design', name: 'UI/UX Design', category: 'Creative' },
  { id: 'marketing', name: 'Digital Marketing', category: 'Business' },
  { id: 'public_speaking', name: 'Public Speaking', category: 'Soft Skills' },
];

export const MOCK_RESOURCES: Resource[] = [
  { id: 'res1', skillId: 'react', title: 'Advanced React Patterns PDF', type: 'PDF', url: '#', uploadedBy: 'admin' },
  { id: 'res2', skillId: 'react', title: 'React Hooks Deep Dive', type: 'VIDEO', url: '#', uploadedBy: 'admin' },
  { id: 'res3', skillId: 'python', title: 'FastAPI Documentation', type: 'LINK', url: 'https://fastapi.tiangolo.com', uploadedBy: 'admin' },
  { id: 'res4', skillId: 'design', title: 'Figma Masterclass', type: 'VIDEO', url: '#', uploadedBy: 'admin' },
  { id: 'res5', skillId: 'java', title: 'Java Fundamentals Guide', type: 'PDF', url: '#', uploadedBy: 'admin' },
  { id: 'res6', skillId: 'html', title: 'HTML5 Complete Tutorial', type: 'VIDEO', url: '#', uploadedBy: 'admin' },
  { id: 'res7', skillId: 'css', title: 'CSS Grid & Flexbox Masterclass', type: 'VIDEO', url: '#', uploadedBy: 'admin' },
  { id: 'res8', skillId: 'marketing', title: 'Digital Marketing Fundamentals', type: 'PDF', url: '#', uploadedBy: 'admin' },
];

export const MOCK_USERS: User[] = [
  {
    id: 'admin',
    name: 'Platform Owner',
    email: 'owner@skillnexus.com',
    role: UserRole.OWNER,
    skillsOffered: [],
    skillsWanted: [],
    matchedSwaps: [],
    completedCourses: []
  },
  {
    id: 'u1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: UserRole.USER,
    skillsOffered: ['react', 'design'],
    skillsWanted: ['python'],
    matchedSwaps: [],
    completedCourses: []
  },
  {
    id: 'u2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: UserRole.USER,
    skillsOffered: ['python', 'marketing', 'java'],
    skillsWanted: ['react', 'css'],
    matchedSwaps: [],
    completedCourses: []
  },
  {
    id: 'u3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: UserRole.USER,
    skillsOffered: ['public_speaking', 'html', 'css'],
    skillsWanted: ['design', 'java'],
    matchedSwaps: [],
    completedCourses: []
  },
  {
    id: 'u4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    role: UserRole.USER,
    skillsOffered: ['java', 'marketing'],
    skillsWanted: ['python', 'react'],
    matchedSwaps: [],
    completedCourses: []
  }
];
