import type { GreeksSnapshot, LifecycleEvent, LifecycleEventType, RFQ, Trade, User } from '../types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  login: (userId: string) =>
    request<User>('/auth/login', { method: 'POST', body: JSON.stringify({ userId }) }),
  getUsers: () => request<User[]>('/users'),
  createRFQ: (data: Partial<RFQ>) =>
    request<RFQ>('/rfq', { method: 'POST', body: JSON.stringify(data) }),
  getRFQ: (id: string) => request<RFQ>(`/rfq/${id}`),
  getAllRFQs: () => request<RFQ[]>('/rfq'),
  bookTrade: (data: Partial<Trade>) =>
    request<Trade>('/trade', { method: 'POST', body: JSON.stringify(data) }),
  getTrade: (id: string) => request<Trade>(`/trade/${id}`),
  getTrades: (userId?: string) =>
    request<Trade[]>(`/trades${userId ? `?userId=${userId}` : ''}`),
  getGreeks: (tradeId: string) => request<GreeksSnapshot>(`/greeks/${tradeId}`),
  getGreeksHistory: (tradeId: string) =>
    request<GreeksSnapshot[]>(`/greeks/history/${tradeId}`),
  triggerLifecycle: (tradeId: string, eventType: LifecycleEventType) =>
    request<LifecycleEvent>(`/lifecycle/${tradeId}`, {
      method: 'POST',
      body: JSON.stringify({ eventType }),
    }),
  getLifecycleEvents: (tradeId: string) =>
    request<LifecycleEvent[]>(`/lifecycle/${tradeId}`),
  getAllLifecycleEvents: () => request<LifecycleEvent[]>('/lifecycle'),
};
