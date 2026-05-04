export interface User {
  id: string | number;
  name: string;
  email: string;
  token?: string;
  avatarUrl?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isInitializing: boolean;
}

export interface Service {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
}