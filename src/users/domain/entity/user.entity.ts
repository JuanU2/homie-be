export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  primaryInterest: "FIND_HOUSING" | "RENT";
  idealLocation: string | null; // WKT alebo GeoJSON
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
}
