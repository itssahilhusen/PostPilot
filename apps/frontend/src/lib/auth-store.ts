import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  image?: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  workspaceId: string;
  createdAt: string;
}

const STORE_PATH = path.join(process.cwd(), "src/lib/users-store.json");

const DEFAULT_USERS: StoredUser[] = [
  {
    id: "usr_demo_1",
    name: "Alex Rivers",
    email: "demo@reerts.com",
    passwordHash: bcrypt.hashSync("password123", 10),
    role: "OWNER",
    workspaceId: "ws_default",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
  {
    id: "usr_demo_2",
    name: "Founder",
    email: "founder@reerts.in",
    passwordHash: bcrypt.hashSync("password123", 10),
    role: "OWNER",
    workspaceId: "ws_default",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    createdAt: new Date().toISOString(),
  },
];

export function getUsersStore(): StoredUser[] {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      saveUsersStore(DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    const raw = fs.readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_USERS;
  }
}

export function saveUsersStore(users: StoredUser[]): void {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save users store:", err);
  }
}

export function findUserByEmail(email: string): StoredUser | undefined {
  const users = getUsersStore();
  return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function createStoreUser(data: { name: string; email: string; password?: string; image?: string }): StoredUser {
  const users = getUsersStore();
  const existing = users.find((u) => u.email.toLowerCase() === data.email.trim().toLowerCase());
  if (existing) {
    throw new Error("User with this email already exists");
  }

  const newUser: StoredUser = {
    id: "usr_" + Date.now(),
    name: data.name || data.email.split("@")[0],
    email: data.email.trim().toLowerCase(),
    passwordHash: data.password ? bcrypt.hashSync(data.password, 10) : undefined,
    image: data.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name || data.email)}`,
    role: "OWNER",
    workspaceId: "ws_default",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsersStore(users);
  return newUser;
}
