// Types for the Secret Share application

export interface Secret {
  id: string;
  secretText: string;
  createdAt: string | Date;
  expiresAt: string | Date | null;
  isViewed: boolean;
  hasPassword: boolean;
  password?: undefined;
  oneTimeAccess?: boolean;
  status: 'active' | 'viewed' | 'expired';
}

export type SecretStatus = 'active' | 'viewed' | 'expired';

export interface CreateSecretInput {
  secretText: string;
  expiresAt?: Date;
  password?: string;
  oneTimeAccess?: boolean;
}

export interface GetSecretInput {
  id: string;
  password?: string;
}

export interface SecretResponse {
  secretText: string;
  createdAt: Date;
}

export interface CreateSecretResponse {
  id: string;
  url: string;
  createdAt: Date;
}

// Type for the actual tRPC response
export type SecretListItem = {
  id: string;
  secretText: string;
  createdAt: string;
  expiresAt: string | null;
  isViewed: boolean;
  hasPassword: boolean;
  status: string;
};
