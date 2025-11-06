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

  // Stats endpoints
  async getUserStats(): Promise<any> {
    return this.request('/stats/me');
  }

  async getLeaderboard(limit?: number): Promise<any> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/stats/leaderboard${query}`);
  }

  async rateUser(ratedId: string, matchId: string, rating: number): Promise<any> {
    return this.request('/stats/rate', {
      method: 'POST',
      body: JSON.stringify({ ratedId, matchId, rating }),
    });
  }

  // Premium endpoints
  async upgradeSubscription(tier: string): Promise<any> {
    return this.request('/premium/upgrade', {
      method: 'POST',
      body: JSON.stringify({ tier }),
    });
  }

  async purchaseCoins(amount: number): Promise<any> {
    return this.request('/premium/coins/purchase', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async boostProfile(): Promise<any> {
    return this.request('/premium/boost', {
      method: 'POST',
    });
  }

  async setUsername(username: string): Promise<any> {
    return this.request('/premium/username', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async getTransactions(limit?: number): Promise<any> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request(`/premium/transactions${query}`);
  }

  // Settings endpoints
  async getUserSettings(): Promise<any> {
    return this.request('/settings/me');
  }

  async updateAdvancedSettings(settings: any): Promise<any> {
    return this.request('/settings/advanced', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async updateInterests(interests: string[]): Promise<any> {
    return this.request('/settings/interests', {
      method: 'PUT',
      body: JSON.stringify({ interests }),
    });
  }

  async updateLanguages(languages: string[]): Promise<any> {
    return this.request('/settings/languages', {
      method: 'PUT',
      body: JSON.stringify({ languages }),
    });
  }
}

export const apiService = new ApiService();
