import { API_BASE } from '../config';
import type { Product, DashboardStats, RequirementStatus } from '../types';

async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const api = {
  getDashboard: () => req<DashboardStats>('/dashboard'),
  listProducts: (stage?: string) =>
    req<Product[]>(`/products${stage ? `?stage=${stage}` : ''}`),
  getProduct: (id: number) => req<Product>(`/products/${id}`),
  createProduct: (data: object) =>
    req<Product>('/products', { method: 'POST', body: JSON.stringify(data) }),
  advanceStage: (id: number, actor: string, notes?: string) =>
    req<Product>(`/products/${id}/advance`, {
      method: 'POST',
      body: JSON.stringify({ actor, notes }),
    }),
  rejectProduct: (id: number, actor: string, notes: string) =>
    req<Product>(`/products/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ actor, notes }),
    }),
  updateRequirement: (reqId: number, status: RequirementStatus, completedBy: string, notes?: string) =>
    req<{ id: number; status: string }>(`/requirements/${reqId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, completed_by: completedBy, notes }),
    }),
};
