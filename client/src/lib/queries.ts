import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ── Assets ──
export function useAssets(params?: { status?: string; category?: string; search?: string }) {
  return useQuery({
    queryKey: ['assets', params],
    queryFn: async () => {
      const { data } = await api.get('/assets', { params });
      return data.data;
    },
  });
}

export function useAsset(id: string) {
  return useQuery({
    queryKey: ['assets', id],
    queryFn: async () => {
      const { data } = await api.get(`/assets/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post('/assets', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    },
  });
}

// ── Tickets ──
export function useTickets(params?: { status?: string; priority?: string; category?: string; search?: string }) {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: async () => {
      const { data } = await api.get('/tickets', { params });
      return data.data;
    },
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['tickets', id],
    queryFn: async () => {
      const { data } = await api.get(`/tickets/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { data } = await api.post('/tickets', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

export function useAddComment(ticketId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { content: string }) => {
      const { data } = await api.post(`/tickets/${ticketId}/comments`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets', ticketId] });
    },
  });
}

// ── Employees / Users ──
export function useEmployees(params?: { department?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: async () => {
      const { data } = await api.get('/users', { params });
      return data.data;
    },
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: async () => {
      const { data } = await api.get(`/users/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

// ── Knowledge Base ──
export function useArticles(params?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: async () => {
      const { data } = await api.get('/knowledge', { params });
      return data.data;
    },
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: ['articles', id],
    queryFn: async () => {
      const { data } = await api.get(`/knowledge/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

// ── Audit Trail ──
export function useAuditLogs(params?: { entityType?: string; action?: string; userId?: string; dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: ['audit', params],
    queryFn: async () => {
      const { data } = await api.get('/audit', { params });
      return data.data;
    },
  });
}

// ── Dashboard ──
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/stats');
      return data.data;
    },
  });
}

// ── Settings ──
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data.data;
    },
  });
}

export function useSlaConfig() {
  return useQuery({
    queryKey: ['settings', 'sla'],
    queryFn: async () => {
      const { data } = await api.get('/settings/sla');
      return data.data;
    },
  });
}
