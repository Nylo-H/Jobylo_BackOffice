import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import { QUERY_KEYS } from '../lib/constants';

export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_USERS,
    queryFn: () => adminApi.getUsers().then((r) => r.data),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ADMIN_USER(id),
    queryFn: () => adminApi.getUser(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_USERS });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: 'ADMIN' | 'USER' }) =>
      adminApi.updateUserRole(id, role).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ADMIN_USERS });
    },
  });
}