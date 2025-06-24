export interface Secret {
  id: string;
  secretText: string;
  password?: string | null;
  expiresAt?: string | null;
  isViewed: boolean;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
  status?: 'viewed' | 'expired' | 'active';
}
