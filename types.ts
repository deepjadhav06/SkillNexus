export enum UserRole {
  OWNER = 'OWNER',
  USER = 'USER'
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface Resource {
  id: string;
  skillId: string;
  title: string;
  type: 'PDF' | 'LINK' | 'VIDEO';
  url: string;
  uploadedBy: string; // User ID (usually Owner)
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  skillsOffered: string[]; // Skill IDs
  skillsWanted: string[]; // Skill IDs
  matchedSwaps: string[]; // IDs of swaps
  completedCourses: string[]; // Skill IDs
}

export interface SwapRequest {
  id: string;
  requesterId: string;
  targetUserId: string;
  skillId: string; // The skill the requester wants to learn
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  swapId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
}
