import { UserRole } from "./auth.types";

// User related types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  postCount?: number;
  bio?: string;
}

export interface UserListItem {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: UserRole;
  createdAt: Date;
}
