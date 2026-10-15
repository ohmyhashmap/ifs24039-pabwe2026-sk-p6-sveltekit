export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  photo?: string | null;
  created_at: string;
  updated_at: string;
}
