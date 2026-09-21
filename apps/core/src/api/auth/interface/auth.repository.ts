export interface AuthRepository {
  authenticateUser(): Promise<string>;
}

export const AUTH_REPOSITORY = Symbol("AUTH_REPOSITORY");
