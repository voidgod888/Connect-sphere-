const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiService = {
  async getCurrentUser() {
    try {
      const response = await fetch(`${API_URL}/auth/user`, {
        credentials: 'include',
      });
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  },

  async logout() {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      return response.ok;
    } catch (error) {
      console.error('Failed to logout:', error);
      return false;
    }
  },

  getGoogleAuthUrl() {
    return `${API_URL}/auth/google`;
  },
};
