import { UserSettings } from '@/userSettings/domain/entity/userSettings';

export interface User {
  id: string;
  email: string;
  fullName: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserWithSettings extends User {
  userSettings: UserSettings;
}
