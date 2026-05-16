export type UserRole = "admin" | "incoming" | "outgoing" | "viewer";

export type StaticUser = {
  username: string;
  password: string;
  name: string;
  role: UserRole;
};

export const users: StaticUser[] = [
  { username: "admin1", password: "Admin@123", name: "مدير النظام 1", role: "admin" },
  { username: "admin2", password: "Admin@123", name: "مدير النظام 2", role: "admin" },
  { username: "incoming1", password: "In@123", name: "وارد 1", role: "incoming" },
  { username: "incoming2", password: "In@123", name: "وارد 2", role: "incoming" },
  { username: "incoming3", password: "In@123", name: "وارد 3", role: "incoming" },
  { username: "incoming4", password: "In@123", name: "وارد 4", role: "incoming" },
  { username: "outgoing1", password: "Out@123", name: "صادر 1", role: "outgoing" },
  { username: "outgoing2", password: "Out@123", name: "صادر 2", role: "outgoing" },
  { username: "outgoing3", password: "Out@123", name: "صادر 3", role: "outgoing" },
  { username: "outgoing4", password: "Out@123", name: "صادر 4", role: "outgoing" },
  { username: "viewer1", password: "View@123", name: "مشرف مشاهدة 1", role: "viewer" },
  { username: "viewer2", password: "View@123", name: "مشرف مشاهدة 2", role: "viewer" }
];

export function findUser(username: string, password?: string) {
  return users.find((user) => {
    if (password === undefined) {
      return user.username === username;
    }

    return user.username === username && user.password === password;
  });
}

export function canManage(role: UserRole, type: "incoming" | "outgoing") {
  return role === "admin" || role === type;
}

export function canView(role: UserRole) {
  return role === "admin" || role === "viewer" || role === "incoming" || role === "outgoing";
}

export function canViewDocumentType(role: UserRole, type: "incoming" | "outgoing") {
  return role === "admin" || role === "viewer" || role === type;
}
