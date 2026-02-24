export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}
