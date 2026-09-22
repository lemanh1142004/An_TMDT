import api from './api';
import type { UserAccount } from '../context/StoreContext';

export interface UserSummaryResponse {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: 'ROLE_ADMIN' | 'ROLE_STAFF' | 'ROLE_CUSTOMER';
  active: boolean;
  joinedDate: string;
}

export const userService = {
  getAllUsers: async (): Promise<UserAccount[]> => {
    const response = await api.get<UserSummaryResponse[]>('/api/admin/users');
    return response.data.map((u) => ({
      ...u,
      joinedDate: u.joinedDate ? new Date(u.joinedDate).toLocaleDateString('vi-VN') : 'Mới',
    }));
  },

  toggleStatus: async (userId: number): Promise<UserAccount> => {
    const response = await api.patch<UserSummaryResponse>(`/api/admin/users/${userId}/toggle-status`);
    return {
      ...response.data,
      joinedDate: response.data.joinedDate ? new Date(response.data.joinedDate).toLocaleDateString('vi-VN') : 'Mới',
    };
  },

  updateRole: async (userId: number, role: UserAccount['role']): Promise<UserAccount> => {
    const response = await api.patch<UserSummaryResponse>(`/api/admin/users/${userId}/role`, { role });
    return {
      ...response.data,
      joinedDate: response.data.joinedDate ? new Date(response.data.joinedDate).toLocaleDateString('vi-VN') : 'Mới',
    };
  },
};
