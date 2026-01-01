export interface User {
  id: string;                     // email as ID + partition key
  email: string;
  username: string;
  passwordHash: string;
  role: "user" | "admin";
  createdAt: string;

  // ⭐ Added fields (fixes the red underline)
  followers: string[];
  following: string[];
  profileImageUrl: string;
}
