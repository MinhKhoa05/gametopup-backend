export type AuthMode = 'login' | 'register';

export type AuthStatus = 'unknown' | 'checking' | 'authenticated' | 'guest';

export type AuthFormData = {
  displayName: string;
  email: string;
  password: string;
};

export type AuthFormState = AuthFormData;
