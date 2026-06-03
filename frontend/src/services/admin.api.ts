import { api, type ApiResponse } from '../lib/api';
import type { AdminGamePackage, Game, GamePackage, Order, User } from '../types';

export type GamePayload = Pick<Game, 'name' | 'imageUrl' | 'isActive'>;

export type GamePackagePayload = Omit<AdminGamePackage, 'id'>;

export type UpdateGamePackagePayload = Omit<GamePackagePayload, 'gameId'>;

export async function createGame(payload: GamePayload) {
  const response = await api.post<ApiResponse<Game>>('/api/games', payload);
  return response.data.data;
}

export async function updateGame(id: number, payload: GamePayload) {
  const response = await api.put<ApiResponse<Game>>(`/api/games/${id}`, payload);
  return response.data.data;
}

export async function deleteGame(id: number) {
  await api.delete<ApiResponse<void>>(`/api/games/${id}`);
}

export async function createGamePackage(payload: GamePackagePayload) {
  const response = await api.post<ApiResponse<GamePackage>>('/api/game-packages', payload);
  return response.data.data;
}

export async function updateGamePackage(
  id: number,
  payload: UpdateGamePackagePayload
) {
  const response = await api.put<ApiResponse<GamePackage>>(
    `/api/game-packages/${id}`,
    payload
  );

  return response.data.data;
}

export async function deleteGamePackage(id: number) {
  await api.delete<ApiResponse<void>>(`/api/game-packages/${id}`);
}

export async function getAdminOrders() {
  const response = await api.get<ApiResponse<Order[]>>('/api/orders');
  return response.data.data;
}

export async function pickOrder(orderId: number) {
  await api.post<ApiResponse<void>>(`/api/orders/${orderId}/pick`);
}

export async function completeOrder(orderId: number) {
  await api.post<ApiResponse<void>>(`/api/orders/${orderId}/complete`);
}

export async function cancelOrder(orderId: number) {
  await api.post<ApiResponse<void>>(`/api/orders/${orderId}/cancel`);
}

export async function getAdminUsers(page = 1, pageSize = 200) {
  const response = await api.get<ApiResponse<User[]>>('/api/users', {
    params: { page, pageSize },
  });

  return response.data.data;
}

export async function deleteUser(id: number) {
  await api.delete<ApiResponse<void>>(`/api/users/${id}`);
}

export async function updateUser(
  id: number,
  payload: { displayName: string; email: string; role: number; isActive: boolean },
) {
  const response = await api.put<ApiResponse<User>>(`/api/users/${id}`, payload);
  return response.data.data;
}
