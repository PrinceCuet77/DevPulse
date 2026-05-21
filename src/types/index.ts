export type UserRole = 'contributor' | 'maintainer';

export interface SignupBody {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}