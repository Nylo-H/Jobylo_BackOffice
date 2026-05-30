import api from './client';
import type { User } from '../types/user';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', {
      email,
      password,
    }),

  logout: () => api.post('/auth/logout'),

  refresh: () =>
    api.post<{ accessToken: string; refreshToken: string }>(
      '/auth/refresh',
      {},
      { withCredentials: true }
    ),

  me: () => api.get<User>('/auth/me'),
};