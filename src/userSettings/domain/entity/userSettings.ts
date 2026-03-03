export interface UserSettings {
  id: string;
  userId: string;
  phoneNumber: string | null;
  primaryInterest: "FIND_HOUSING" | "RENT" | null;
  idealLocation: string | null;
}