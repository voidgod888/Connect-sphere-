const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  token: string;
  expiresAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    } catch (networkError) {
      throw new Error('Network request failed');
    }

    let payload: any = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      payload = await response.json().catch(() => null);
    }

    if (!response.ok) {
      const errorMessage = (payload && payload.error) || `HTTP error ${response.status}`;
      throw new Error(errorMessage);
    }

    if (payload === null) {
      return {} as T;
    }

    return payload as T;
  }

  async authGoogle(token: string, identity?: string, country?: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ token, identity, country }),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async authApple(
    identityToken: string,
    identity?: string,
    country?: string,
    fullName?: string
  ): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/apple', {
      method: 'POST',
      body: JSON.stringify({ identityToken, identity, country, fullName }),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async authMock(email: string, name?: string, identity?: string, country?: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/mock', {
      method: 'POST',
      body: JSON.stringify({ email, name, identity, country }),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.clearToken();
    }
  }

  async verifySession(): Promise<User> {
    const response = await this.request<{ user: User }>('/auth/verify');
    return response.user;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.request<{ user: User }>('/users/me');
    return response.user;
  }

  async updateUserSettings(identity?: string, country?: string): Promise<User> {
    const response = await this.request<{ user: User }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify({ identity, country }),
    });
    return response.user;
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const apiService = new ApiService();
