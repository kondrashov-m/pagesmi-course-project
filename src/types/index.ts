// User types
export interface User {
  id: string;
  email: string;
  displayName: string;
  password?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  user: {
    id: string;
    email: string;
    displayName: string;
    image?: string;
  };
  expires: string;
}

// Canvas types
export interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'button' | 'container' | 'input' | 'heading';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  styles?: Record<string, any>;
  properties?: Record<string, any>;
  children?: CanvasElement[];
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  elements: CanvasElement[];
  settings?: {
    backgroundColor?: string;
    backgroundImage?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  description?: string;
  pages: Page[];
  createdAt: Date;
  updatedAt: Date;
}

// Auth types
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}
