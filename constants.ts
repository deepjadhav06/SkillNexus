import { Skill, User, UserRole, Resource } from './types';

export const SKILLS: Skill[] = [
  { id: 'python', name: 'Python', category: 'Programming' },
  { id: 'java', name: 'Java', category: 'Programming' },
  { id: 'javascript', name: 'JavaScript', category: 'Programming' },
  { id: 'csharp', name: 'C#', category: 'Programming' },
  { id: 'cpp', name: 'C++', category: 'Programming' },
  { id: 'react', name: 'React', category: 'Web Development' },
  { id: 'angular', name: 'Angular', category: 'Web Development' },
  { id: 'vue', name: 'Vue.js', category: 'Web Development' },
  { id: 'html', name: 'HTML', category: 'Web Development' },
  { id: 'css', name: 'CSS', category: 'Web Development' },
  { id: 'nodejs', name: 'Node.js', category: 'Backend Development' },
  { id: 'django', name: 'Django', category: 'Backend Development' },
  { id: 'flask', name: 'Flask', category: 'Backend Development' },
  { id: 'sql', name: 'SQL', category: 'Databases' },
  { id: 'mongodb', name: 'MongoDB', category: 'Databases' },
  { id: 'machine_learning', name: 'Machine Learning', category: 'AI & Data Science' },
  { id: 'data_analysis', name: 'Data Analysis', category: 'AI & Data Science' },
  { id: 'deep_learning', name: 'Deep Learning', category: 'AI & Data Science' },
  { id: 'design', name: 'UI/UX Design', category: 'Design' },
  { id: 'graphic_design', name: 'Graphic Design', category: 'Design' },
  { id: 'product_design', name: 'Product Design', category: 'Design' },
  { id: 'marketing', name: 'Digital Marketing', category: 'Business' },
  { id: 'seo', name: 'SEO', category: 'Business' },
  { id: 'content_marketing', name: 'Content Marketing', category: 'Business' },
  { id: 'public_speaking', name: 'Public Speaking', category: 'Communication' },
  { id: 'writing', name: 'Technical Writing', category: 'Communication' },
  { id: 'business_writing', name: 'Business Writing', category: 'Communication' },
  { id: 'project_management', name: 'Project Management', category: 'Management' },
  { id: 'agile', name: 'Agile Development', category: 'Management' },
  { id: 'leadership', name: 'Leadership', category: 'Management' },
  { id: 'cloud', name: 'Cloud Computing', category: 'DevOps' },
  { id: 'docker', name: 'Docker', category: 'DevOps' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'DevOps' },
  { id: 'aws', name: 'AWS', category: 'Cloud' },
  { id: 'azure', name: 'Azure', category: 'Cloud' },
  { id: 'gcp', name: 'Google Cloud', category: 'Cloud' },
  { id: 'git', name: 'Git & GitHub', category: 'Version Control' },
  { id: 'testing', name: 'Software Testing', category: 'QA' },
  { id: 'security', name: 'Cybersecurity', category: 'Security' },
  { id: 'mobile_dev', name: 'Mobile Development', category: 'Mobile' },
  { id: 'android', name: 'Android Development', category: 'Mobile' },
  { id: 'ios', name: 'iOS Development', category: 'Mobile' },
  { id: 'flutter', name: 'Flutter', category: 'Mobile' },
  { id: 'financial', name: 'Finance & Accounting', category: 'Finance' },
  { id: 'excel', name: 'Excel & Spreadsheets', category: 'Office' },
  { id: 'powerpoint', name: 'PowerPoint', category: 'Office' },
  { id: 'english', name: 'English Language', category: 'Languages' },
  { id: 'spanish', name: 'Spanish Language', category: 'Languages' },
  { id: 'french', name: 'French Language', category: 'Languages' },
  { id: 'mandarin', name: 'Mandarin Chinese', category: 'Languages' },
  { id: 'photography', name: 'Photography', category: 'Creative' },
  { id: 'video_production', name: 'Video Production', category: 'Creative' },
  { id: 'animation', name: 'Animation', category: 'Creative' },
  { id: 'music', name: 'Music Production', category: 'Creative' }
];

// FALLBACK DATA ONLY - Backend data.json is the permanent source of truth
// These are used only if the backend is unavailable
export const MOCK_RESOURCES: Resource[] = [
  { id: 'res1', skillId: 'react', title: 'React PDF', type: 'PDF', url: 'https://drive.google.com/file/d/1YLAD3QcUlk-YALe8C3RkXuJrNp4gUK0Z/view?usp=sharing', uploadedBy: 'admin' },
  { id: 'res2', skillId: 'python', title: 'Python Basics PDF', type: 'PDF', url: 'https://drive.google.com/file/d/19WfN1aIK-jmYrqQtpDXV885Yt7OOwiby/view?usp=sharing', uploadedBy: 'admin' },
  { id: 'res3', skillId: 'javascript', title: 'Java Script', type: 'PDF', url: 'https://drive.google.com/file/d/1x4P-Aktsad2VKeFbQ1WERJQHLasC0JJc/view?usp=sharing', uploadedBy: 'admin' },
  { id: 'res4', skillId: 'html', title: 'HTML PDF', type: 'PDF', url: 'https://drive.google.com/file/d/1IumDEPmmxY2FsZqxjqLjZevAjNqTixoO/view?usp=sharing', uploadedBy: 'admin' },
  { id: 'res5', skillId: 'css', title: 'CSS & Styling', type: 'PDF', url: 'https://drive.google.com/file/d/1d6QynuxvwArJ_-chZmgcCBqNptGEhGE5/view?usp=sharing', uploadedBy: 'admin' },
  { id: 'res6', skillId: 'design', title: 'UI & UX', type: 'PDF', url: 'https://drive.google.com/file/d/1sM1na358vjbGQvTuf7ih261PlUUhNTlh/view?usp=sharing', uploadedBy: 'admin' },
  { id: 'res7', skillId: 'marketing', title: 'Digital Marketing PDF', type: 'PDF', url: 'https://drive.google.com/file/d/1mWU8lt0Q-NeOsguOHSXY8sFAgnIJA2rz/view?usp=sharing', uploadedBy: 'admin' },
  { id: 'res8', skillId: 'public_speaking', title: 'Public Speaking', type: 'PDF', url: 'https://drive.google.com/file/d/1uA8RrC7w08Stxj6Rr6k6sH3TQFGrXOYk/view?usp=sharing', uploadedBy: 'admin' },
  { id: 'res9', skillId: 'data_analysis', title: 'Data Analysis', type: 'PDF', url: 'https://drive.google.com/file/d/1Ei1JtCN55_YUG6EsRTA-WdSiHu-wgGyA/view?usp=sharing', uploadedBy: 'admin' },
  { id: 'res10', skillId: 'machine_learning', title: 'Machine Learning PDF', type: 'PDF', url: 'https://drive.google.com/file/d/1oo0xEN3P9Mhgnd1O3xVNiU4YOu_r2UEp/view?usp=sharing', uploadedBy: 'admin' },
  { id: 'res11', skillId: 'sql', title: 'SQL DataBase', type: 'PDF', url: 'https://drive.google.com/file/d/1QhUsUWLrHTEvD3IB_HdNghPqQmJx2IDf/view?usp=sharing', uploadedBy: 'admin' },
];

// FALLBACK DATA ONLY - Backend data.json is the permanent source of truth
// These are used only if the backend is unavailable
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
